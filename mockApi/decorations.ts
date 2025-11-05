import { decorationCategoriesData } from '../data/decorationCategories';
import type { DecorationCategory } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getDecorationCategories = async (): Promise<DecorationCategory[]> => {
    await delay(100);
    return [...decorationCategoriesData];
};

export const addDecorationCategory = async (category: Omit<DecorationCategory, 'id'>): Promise<DecorationCategory> => {
    await delay(100);
    const newCategory = { ...category, id: `cat-${Date.now()}` };
    decorationCategoriesData.push(newCategory);
    return newCategory;
};

export const updateDecorationCategory = async (id: string, updates: Partial<Omit<DecorationCategory, 'id'>>): Promise<DecorationCategory | undefined> => {
    await delay(100);
    const index = decorationCategoriesData.findIndex(c => c.id === id);
    if (index > -1) {
        decorationCategoriesData[index] = { ...decorationCategoriesData[index], ...updates };
        return decorationCategoriesData[index];
    }
    return undefined;
};

export const deleteDecorationCategory = async (id: string): Promise<boolean> => {
    await delay(100);
    // FIX: Use splice to mutate the array directly instead of reassigning the import.
    const index = decorationCategoriesData.findIndex(c => c.id === id);
    if (index > -1) {
        decorationCategoriesData.splice(index, 1);
        return true;
    }
    return false;
};
