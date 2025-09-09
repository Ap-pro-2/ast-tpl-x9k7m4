import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { BLOG_API_KEY } from 'astro:env/server';
import { validateTurnstileToken, isTurnstileEnabled } from '../core/turnstileLogic';

export const server = {
  // Main lead capture action that calls the AstroPress API
  leads: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('Please enter a valid email address'),
      name: z.string().min(2, 'Please enter at least 2 characters').optional(),
      message: z.string().min(10, 'Please enter at least 10 characters').optional(),
      source: z.string().default('website'),
      'cf-turnstile-response': z.string().optional(), // Turnstile token
    }),
    handler: async (input, context) => {
      try {
        // Turnstile validation if enabled and token provided
        const turnstileEnabled = await isTurnstileEnabled();
        if (turnstileEnabled && input['cf-turnstile-response']) {
          console.log('Validating Turnstile token...');
          
          // Get client IP address
          const clientIP = context.request.headers.get('CF-Connecting-IP') ||
                           context.request.headers.get('X-Forwarded-For') ||
                           context.request.headers.get('X-Real-IP') ||
                           'unknown';
          
          // Extract action from source for validation
          const expectedAction = input.source.split('-')[0] || 'form';
          
          // Get expected hostname from site settings (not from request)
          const { getSiteSettings } = await import('../core/blogLogic');
          const settings = await getSiteSettings();
          const siteUrl = new URL(settings.siteUrl);
          const expectedHostname = siteUrl.hostname;
          
          console.log(`Expected hostname: ${expectedHostname}`);
          
          const validation = await validateTurnstileToken(
            input['cf-turnstile-response'],
            clientIP,
            expectedAction,
            expectedHostname
          );
          
          if (!validation.valid) {
            console.error('Turnstile validation failed:', validation.error);
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Security verification failed. Please try again.'
            });
          }
          
          console.log('Turnstile validation successful');
        } else if (turnstileEnabled && !input['cf-turnstile-response']) {
          // Turnstile is enabled but no token provided
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Security verification is required.'
          });
        }

        // Call the AstroPress API
        const response = await fetch('https://astropress-apis.mcpsplayground.workers.dev/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BLOG_API_KEY}`
          },
          body: JSON.stringify({
            email: input.email,
            name: input.name,
            message: input.message,
            source: input.source
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: errorData.message || 'Failed to save lead'
          });
        }

        const result = await response.json();
        
        return {
          success: true,
          message: 'Thank you! Your information has been saved.'
          // Don't return the full API response to avoid exposing sensitive data
        };
      } catch (error) {
        console.error('Lead capture error:', error);
        
        if (error instanceof ActionError) {
          throw error;
        }
        
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to process your request. Please try again.'
        });
      }
    }
  })
};