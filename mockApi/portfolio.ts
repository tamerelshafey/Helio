import { portfolioData } from '../data/portfolio';
import type { PortfolioItem } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
    await delay(200);
    return [...portfolioData];
};

export const getPortfolioByPartnerId = async (partnerId: string): Promise<PortfolioItem[]> => {
    await delay(200);
    return portfolioData.filter(item => item.partnerId === partnerId);
};

export const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> => {
    await delay(300);
    const newItem = { ...item, id: `p-item-${Date.now()}` };
    portfolioData.push(newItem);
    return newItem;
};

export const updatePortfolioItem = async (id: string, updates: Partial<Omit<PortfolioItem, 'id'>>): Promise<PortfolioItem | undefined> => {
    await delay(300);
    const index = portfolioData.findIndex(item => item.id === id);
    if (index > -1) {
        portfolioData[index] = { ...portfolioData[index], ...updates };
        return portfolioData[index];
    }
    return undefined;
};

export const deletePortfolioItem = async (id: string): Promise<boolean> => {
    await delay(300);
    // FIX: Use splice to mutate the array directly instead of reassigning the import.
    const index = portfolioData.findIndex(item => item.id === id);
    if (index > -1) {
        portfolioData.splice(index, 1);
        return true;
    }
    return false;
};
