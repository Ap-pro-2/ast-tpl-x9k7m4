import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  // Main lead capture action that calls the AstroPress API
  leads: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('Please enter a valid email address'),
      source: z.string().default('website'),
    }),
    handler: async (input, context) => {
      try {
        const response = await fetch('https://astropress-apis.mcpsplayground.workers.dev/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.BLOG_API_KEY}`
          },
          body: JSON.stringify({
            email: input.email,
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