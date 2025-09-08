/**
 * Simple Forms System - Easy to use lead capture forms
 */

import { getCollection, type CollectionEntry } from 'astro:content';

// Use Astro's inferred types from our schema
export type FormsEntry = CollectionEntry<'forms'>;
export type FormsData = FormsEntry['data'];
export type FormConfig = FormsData['forms'][0];

// Simple forms configuration interface
export interface FormsSystemConfig {
  enabled: boolean;
  forms: FormConfig[];
}

/**
 * Get forms configuration from content collection
 */
export async function getFormsConfig(): Promise<FormsSystemConfig> {
  try {
    const formsCollection = await getCollection('forms');
    const formsEntry = formsCollection[0]; // forms.json is loaded as single entry
    
    if (!formsEntry) {
      return { enabled: false, forms: [] };
    }
    
    return {
      enabled: formsEntry.data.enabled,
      forms: formsEntry.data.forms
    };
  } catch (error) {
    console.warn('Failed to load forms configuration:', error);
    return { enabled: false, forms: [] };
  }
}

/**
 * Check if forms are globally enabled
 */
export async function areFormsEnabled(): Promise<boolean> {
  const config = await getFormsConfig();
  return config.enabled;
}

/**
 * Get form by ID
 */
export async function getFormById(id: string): Promise<FormConfig | null> {
  const config = await getFormsConfig();
  if (!config.enabled) return null;
  
  const form = config.forms.find(f => f.id === id && f.enabled);
  return form || null;
}

/**
 * Get forms by placement
 */
export async function getFormsByPlacement(placement: string): Promise<FormConfig[]> {
  const config = await getFormsConfig();
  if (!config.enabled) return [];
  
  return config.forms.filter(form => 
    form.enabled && form.placement === placement
  );
}

/**
 * Get form field configuration (simple)
 */
export function getFormFields(form: FormConfig): Array<{field: string, placeholder: string, type: string, required: boolean}> {
  const fields = [];
  
  // If custom fields are defined, use them
  if (form.fields && form.fields.length > 0) {
    form.fields.forEach(fieldName => {
      switch (fieldName) {
        case 'name':
          fields.push({
            field: 'name',
            placeholder: 'Your Name',
            type: 'text',
            required: true
          });
          break;
        case 'email':
          fields.push({
            field: 'email',
            placeholder: 'Your Email',
            type: 'email',
            required: true
          });
          break;
        case 'message':
          fields.push({
            field: 'message',
            placeholder: 'Your Message',
            type: 'textarea',
            required: true
          });
          break;
      }
    });
  } else {
    // Default behavior for backward compatibility
    // Vertical forms: email only
    // Horizontal forms: name + email
    if (form.type === 'horizontal') {
      fields.push({
        field: 'name',
        placeholder: 'Name',
        type: 'text',
        required: true
      });
    }
    
    fields.push({
      field: 'email',
      placeholder: form.type === 'vertical' ? 'Enter your email address' : 'E-mail',
      type: 'email',
      required: true
    });
  }
  
  return fields;
}

/**
 * Get unique form element IDs to prevent conflicts
 */
export function getFormElementIds(formId: string) {
  return {
    form: `${formId}-form`,
    nameField: `${formId}-name`,
    emailField: `${formId}-email`,
    messageField: `${formId}-message`,
    submitBtn: `${formId}-submit-btn`,
    nameError: `${formId}-name-error`,
    emailError: `${formId}-email-error`,
    messageError: `${formId}-message-error`,
    errorMessage: `${formId}-error-message`,
    successMessage: `${formId}-success-message`
  };
}

/**
 * Generate source tracking value for forms
 */
export function getFormSource(placement: string, formId: string): string {
  return `${placement}-${formId}`;
}