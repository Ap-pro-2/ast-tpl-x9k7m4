

import { getCollection, type CollectionEntry } from 'astro:content';


export type FormsEntry = CollectionEntry<'forms'>;
export type FormsData = FormsEntry['data'];


export async function getAllForms(): Promise<FormsEntry[]> {
  try {
    const formsCollection = await getCollection('forms');
    return formsCollection;
  } catch (error) {
    return [];
  }
}


export async function areFormsEnabled(): Promise<boolean> {
  try {
    const forms = await getAllForms();
    return forms.some(form => form.data.enabled);
  } catch (error) {
    return false;
  }
}


export async function getFormById(id: string): Promise<FormsEntry | null> {
  try {
    const forms = await getAllForms();
    const form = forms.find(f => f.data.id === id && f.data.enabled);
    return form || null;
  } catch (error) {
    return null;
  }
}


export async function getEnabledForms(): Promise<FormsEntry[]> {
  try {
    const forms = await getAllForms();
    return forms.filter(form => form.data.enabled);
  } catch (error) {
    return [];
  }
}

