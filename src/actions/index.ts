import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { BLOG_API_KEY, TURNSTILE_ENABLED, TURNSTILE_SECRET_KEY } from 'astro:env/server';
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
        console.log('🔍 SERVER ACTION DEBUG:');
        console.log(`- Environment TURNSTILE_ENABLED: ${TURNSTILE_ENABLED} (type: ${typeof TURNSTILE_ENABLED})`);
        console.log(`- Environment TURNSTILE_SECRET_KEY: ${TURNSTILE_SECRET_KEY ? TURNSTILE_SECRET_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
        console.log(`- Environment BLOG_API_KEY: ${BLOG_API_KEY ? BLOG_API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
        
        const turnstileEnabled = await isTurnstileEnabled();
        console.log(`Form Submission Details:`);
        console.log(`- Turnstile enabled result: ${turnstileEnabled}`);
        console.log(`- Token provided: ${!!input['cf-turnstile-response']}`);
        console.log(`- Token length: ${input['cf-turnstile-response']?.length || 0}`);
        if (input['cf-turnstile-response']) {
          console.log(`- Token preview: ${input['cf-turnstile-response'].substring(0, 20)}...`);
        }
        
        if (turnstileEnabled && input['cf-turnstile-response']) {
          console.log('Validating Turnstile token...');
          
          // Get client IP address
          const clientIP = context.request.headers.get('CF-Connecting-IP') ||
                           context.request.headers.get('X-Forwarded-For') ||
                           context.request.headers.get('X-Real-IP') ||
                           'unknown';
          
          // Extract action from source for validation
          const expectedAction = input.source.split('-')[0] || 'form';
          
          // Get expected hostname - use actual request hostname in development
          let expectedHostname;
          if (process.env.NODE_ENV === 'development' || context.request.url.includes('localhost')) {
            // In development, use the actual hostname from the request
            expectedHostname = new URL(context.request.url).hostname;
          } else {
            // In production, use the configured site hostname
            const { getSiteSettings } = await import('../core/blogLogic');
            const settings = await getSiteSettings();
            const siteUrl = new URL(settings.siteUrl);
            expectedHostname = siteUrl.hostname;
          }
          
          console.log(`Expected hostname: ${expectedHostname}`);
          
          console.log(`🔍 VALIDATION ATTEMPT:`);
          console.log(`- Token: ${input['cf-turnstile-response'].substring(0, 20)}...`);
          console.log(`- Client IP: ${clientIP}`);
          console.log(`- Expected Action: ${expectedAction}`);
          console.log(`- Expected Hostname: ${expectedHostname}`);
          
          const validation = await validateTurnstileToken(
            input['cf-turnstile-response'],
            clientIP,
            expectedAction,
            expectedHostname
          );
          
          console.log(`🔍 VALIDATION RESULT:`, validation);
          
          if (!validation.valid) {
            console.error('❌ Turnstile validation failed:', validation.error);
            console.error('❌ Full validation data:', validation.data);
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