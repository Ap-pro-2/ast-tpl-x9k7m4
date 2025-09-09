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
    // Read environment variables directly
    const enabled = TURNSTILE_ENABLED;
    const siteKey = TURNSTILE_SITE_KEY;
    const secretKey = TURNSTILE_SECRET_KEY;
    
    // Comprehensive environment logging
    console.log('🔍 TURNSTILE ENVIRONMENT DEBUG:');
    console.log(`Raw Environment Values:`);
    console.log(`- TURNSTILE_ENABLED (type: ${typeof enabled}): ${enabled}`);
    console.log(`- TURNSTILE_SITE_KEY (type: ${typeof siteKey}): "${siteKey}"`);
    console.log(`- TURNSTILE_SECRET_KEY (type: ${typeof secretKey}): "${secretKey ? secretKey.substring(0, 15) + '...' : 'EMPTY/UNDEFINED'}"`);
    
    // Validation checks
    const hasKeys = siteKey && secretKey && 
                    siteKey.trim() !== '' && secretKey.trim() !== '';
    
    console.log(`Validation Results:`);
    console.log(`- Has site key: ${!!(siteKey && siteKey.trim() !== '')}`);
    console.log(`- Has secret key: ${!!(secretKey && secretKey.trim() !== '')}`);
    console.log(`- Enabled flag: ${!!enabled}`);
    console.log(`- Final enabled state: ${enabled && hasKeys}`);
    
    // Warn about demo keys
    if (enabled && hasKeys && siteKey.startsWith('0x4AAAAAAB0')) {
      console.warn('⚠️ Using demo Turnstile keys - replace with real keys from Cloudflare dashboard');
    }
    
    return enabled && hasKeys;
  } catch (error) {
    console.error('❌ Failed to check Turnstile enabled status:', error);
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