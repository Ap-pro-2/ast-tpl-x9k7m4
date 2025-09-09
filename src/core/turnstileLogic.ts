/**
 * Cloudflare Turnstile Integration Utilities
 * Provides utilities for integrating Turnstile widgets with the Universal Form system
 */

import { TURNSTILE_SECRET_KEY, TURNSTILE_ENABLED } from 'astro:env/server';
import { TURNSTILE_SITE_KEY } from 'astro:env/client';

// Turnstile configuration interface
export interface TurnstileConfig {
  enabled: boolean;
  siteKey: string;
  theme: 'auto' | 'light' | 'dark';
  size: 'normal' | 'flexible' | 'compact';
  appearance: 'always' | 'execute' | 'interaction-only';
  action?: string;
}

// Turnstile validation response interface
export interface TurnstileValidationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

// Turnstile validation result interface
export interface TurnstileValidationResult {
  valid: boolean;
  error?: string;
  data?: TurnstileValidationResponse;
  tokenAge?: number;
}

/**
 * Check if Turnstile is globally enabled
 */
export async function isTurnstileEnabled(): Promise<boolean> {
  try {
    // Check if both enabled flag is true AND we have the required keys
    const enabled = TURNSTILE_ENABLED;
    const hasKeys = TURNSTILE_SITE_KEY && TURNSTILE_SECRET_KEY && 
                    TURNSTILE_SITE_KEY.trim() !== '' && TURNSTILE_SECRET_KEY.trim() !== '';
    return enabled && hasKeys;
  } catch (error) {
    console.warn('Failed to check Turnstile enabled status:', error);
    return false;
  }
}

/**
 * Get Turnstile site key for client-side use
 */
export async function getTurnstileSiteKey(): Promise<string | null> {
  try {
    const enabled = await isTurnstileEnabled();
    if (!enabled) return null;
    
    return TURNSTILE_SITE_KEY || null;
  } catch (error) {
    console.warn('Failed to get Turnstile site key:', error);
    return null;
  }
}

/**
 * Generate unique Turnstile element ID for a form
 */
export function getTurnstileElementId(formId: string): string {
  return `${formId}-turnstile`;
}

/**
 * Generate Turnstile callback function names for a form
 */
export function getTurnstileCallbacks(formId: string) {
  return {
    success: `onTurnstileSuccess_${formId.replace(/-/g, '_')}`,
    error: `onTurnstileError_${formId.replace(/-/g, '_')}`,
    expired: `onTurnstileExpired_${formId.replace(/-/g, '_')}`
  };
}

/**
 * Validate Turnstile token server-side
 */
export async function validateTurnstileToken(
  token: string,
  remoteIp?: string,
  expectedAction?: string,
  expectedHostname?: string
): Promise<TurnstileValidationResult> {
  try {
    const enabled = await isTurnstileEnabled();
    if (!enabled) {
      return {
        valid: true, // Allow forms to work when Turnstile is disabled
        error: 'Turnstile is disabled'
      };
    }

    // Input validation
    if (!token || typeof token !== 'string') {
      return {
        valid: false,
        error: 'Invalid token format'
      };
    }

    if (token.length > 2048) {
      return {
        valid: false,
        error: 'Token too long'
      };
    }

    // Prepare form data for validation
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    // Call Cloudflare Siteverify API
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result: TurnstileValidationResponse = await response.json();

    if (!result.success) {
      return {
        valid: false,
        error: 'Turnstile validation failed',
        data: result
      };
    }

    // Additional validation checks
    if (expectedAction && result.action !== expectedAction) {
      return {
        valid: false,
        error: 'Action mismatch',
        data: result
      };
    }

    if (expectedHostname && result.hostname !== expectedHostname) {
      return {
        valid: false,
        error: 'Hostname mismatch',
        data: result
      };
    }

    // Calculate token age
    let tokenAge = 0;
    if (result.challenge_ts) {
      const challengeTime = new Date(result.challenge_ts);
      const now = new Date();
      tokenAge = (now.getTime() - challengeTime.getTime()) / (1000 * 60); // minutes
    }

    return {
      valid: true,
      data: result,
      tokenAge
    };

  } catch (error) {
    console.error('Turnstile validation error:', error);
    return {
      valid: false,
      error: 'Internal validation error'
    };
  }
}

/**
 * Get default Turnstile configuration for a form type
 */
export function getDefaultTurnstileConfig(formType: string, placement: string): Partial<TurnstileConfig> {
  const config: Partial<TurnstileConfig> = {
    theme: 'auto',
    size: 'flexible',
    appearance: 'always'
  };

  // Customize based on form type and placement
  switch (placement) {
    case 'section5-newsletter':
      config.size = 'flexible';
      config.action = 'newsletter';
      break;
    case 'section4-sidebar':
      config.size = 'compact';
      config.action = 'sidebar';
      break;
    case 'contact-page':
      config.size = 'normal';
      config.action = 'contact';
      break;
    default:
      config.action = placement;
  }

  return config;
}

/**
 * Generate Turnstile widget configuration for client-side rendering
 */
export async function generateTurnstileWidgetConfig(
  formId: string,
  formConfig?: Partial<TurnstileConfig>
): Promise<Record<string, any> | null> {
  const enabled = await isTurnstileEnabled();
  const siteKey = await getTurnstileSiteKey();
  
  if (!enabled || !siteKey) {
    return null;
  }

  const callbacks = getTurnstileCallbacks(formId);
  
  return {
    sitekey: siteKey,
    theme: formConfig?.theme || 'auto',
    size: formConfig?.size || 'flexible',
    appearance: formConfig?.appearance || 'always',
    action: formConfig?.action || formId,
    callback: callbacks.success,
    'error-callback': callbacks.error,
    'expired-callback': callbacks.expired,
    'response-field': true,
    'response-field-name': 'cf-turnstile-response'
  };
}