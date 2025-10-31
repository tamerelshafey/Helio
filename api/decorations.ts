import { decorationCategoriesData } from '../data/decorationCategories';
import type { DecorationCategory } from '../types';

const SIMULATED_DELAY = 300;

export const getDecorationCategories = (): Promise<DecorationCategory[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...decorationCategoriesData]);
        }, SIMULATED_DELAY);
    });
};

export const addDecorationCategory = (category: Omit<DecorationCategory, 'id'>): Promise<DecorationCategory> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newCategory: DecorationCategory = {
                ...category,
                id: `cat-${Date.now()}`,
            };
            decorationCategoriesData.push(newCategory);
            resolve(newCategory);
        }, SIMULATED_DELAY);
    });
};

export const updateDecorationCategory = (categoryId: string, updates: Partial<DecorationCategory>): Promise<DecorationCategory | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const catIndex = decorationCategoriesData.findIndex(c => c.id === categoryId);
            if (catIndex > -1) {
                decorationCategoriesData[catIndex] = { ...decorationCategoriesData[catIndex], ...updates };
                resolve(decorationCategoriesData[catIndex]);
            } else {
                resolve(undefined);
            }
        }, SIMULATED_DELAY);
    });
};

export const deleteDecorationCategory = (categoryId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = decorationCategoriesData.length;
            const newData = decorationCategoriesData.filter(c => c.id !== categoryId);
            if (newData.length < initialLength) {
                decorationCategoriesData.length = 0;
                Array.prototype.push.apply(decorationCategoriesData, newData);
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
