import { bannersData } from '../data/banners';
import type { Banner } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllBanners = async (): Promise<Banner[]> => {
    await delay(100);
    return [...bannersData];
};

export const addBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner> => {
    await delay(100);
    const newBanner: Banner = { ...banner, id: `banner-${Date.now()}` };
    bannersData.push(newBanner);
    return newBanner;
};

export const updateBanner = async (id: string, updates: Partial<Banner>): Promise<Banner | undefined> => {
    await delay(100);
    const bannerIndex = bannersData.findIndex(b => b.id === id);
    if (bannerIndex > -1) {
        bannersData[bannerIndex] = { ...bannersData[bannerIndex], ...updates };
        return bannersData[bannerIndex];
    }
    return undefined;
};

export const deleteBanner = async (id: string): Promise<boolean> => {
    await delay(100);
    // FIX: Use splice to mutate the array directly instead of reassigning the import.
    const index = bannersData.findIndex(b => b.id === id);
    if (index > -1) {
        bannersData.splice(index, 1);
        return true;
    }
    return false;
};
