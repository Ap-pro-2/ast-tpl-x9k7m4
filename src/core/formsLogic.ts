

import { getCollection, type CollectionEntry } from 'astro:content';


export type FormsEntry = CollectionEntry<'forms'>;
export type FormsData = FormsEntry['data'];
export type FormConfig = FormsData['forms'][0];


export interface FormsSystemConfig {
  enabled: boolean;
  forms: FormConfig[];
}


export async function getFormsConfig(): Promise<FormsSystemConfig> {
  try {
    const formsCollection = await getCollection('forms');
    const formsEntry = formsCollection[0]; 
    
    if (!formsEntry) {
      return { enabled: false, forms: [] };
    }
    
    return {
      enabled: formsEntry.data.enabled,
      forms: formsEntry.data.forms
    };
  } catch (error) {
    return { enabled: false, forms: [] };
  }
}


export async function areFormsEnabled(): Promise<boolean> {
  const config = await getFormsConfig();
  return config.enabled;
}


export async function getFormById(id: string): Promise<FormConfig | null> {
  const config = await getFormsConfig();
  if (!config.enabled) return null;
  
  const form = config.forms.find(f => f.id === id && f.enabled);
  return form || null;
}


export async function getFormsByPlacement(placement: string): Promise<FormConfig[]> {
  const config = await getFormsConfig();
  if (!config.enabled) return [];
  
  return config.forms.filter(form => 
    form.enabled && form.placement === placement
  );
}


export function getFormFields(form: FormConfig): Array<{field: string, placeholder: string, type: 'text' | 'email' | 'textarea', required: boolean, label: string}> {
  const fields = [];
  
  
  if (form.fields && form.fields.length > 0) {
    form.fields.forEach(fieldName => {
      switch (fieldName) {
        case 'name':
          fields.push({
            field: 'name',
            placeholder: 'Your Name',
            type: 'text' as const,
            required: true,
            label: 'Name'
          });
          break;
        case 'email':
          fields.push({
            field: 'email',
            placeholder: 'Your Email',
            type: 'email' as const,
            required: true,
            label: 'Email'
          });
          break;
        case 'message':
          fields.push({
            field: 'message',
            placeholder: 'Your Message',
            type: 'textarea' as const,
            required: true,
            label: 'Message'
          });
          break;
      }
    });
  } else {
    
    
    
    if (form.type === 'horizontal') {
      fields.push({
        field: 'name',
        placeholder: 'Name',
        type: 'text' as const,
        required: true,
        label: 'Name'
      });
    }
    
    fields.push({
      field: 'email',
      placeholder: form.type === 'vertical' ? 'Enter your email address' : 'E-mail',
      type: 'email' as const,
      required: true,
      label: 'Email'
    });
  }
  
  return fields;
}


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


export function getFormSource(placement: string, formId: string): string {
  return `${placement}-${formId}`;
}