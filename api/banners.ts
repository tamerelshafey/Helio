import { bannersData } from '../data/banners';
import type { Banner } from '../types';

const SIMULATED_DELAY = 300;

export const getAllBanners = (): Promise<Banner[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...bannersData]);
        }, SIMULATED_DELAY);
    });
};

export const addBanner = (banner: Omit<Banner, 'id'>): Promise<Banner> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newBanner: Banner = {
                ...banner,
                id: `banner-${Date.now()}`,
            };
            bannersData.unshift(newBanner);
            resolve(newBanner);
        }, SIMULATED_DELAY);
    });
};

export const updateBanner = (bannerId: string, updates: Partial<Banner>): Promise<Banner | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const bannerIndex = bannersData.findIndex(b => b.id === bannerId);
            if (bannerIndex > -1) {
                bannersData[bannerIndex] = { ...bannersData[bannerIndex], ...updates };
                resolve(bannersData[bannerIndex]);
            } else {
                resolve(undefined);
            }
        }, SIMULATED_DELAY);
    });
};

export const deleteBanner = (bannerId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = bannersData.length;
            const newData = bannersData.filter(b => b.id !== bannerId);
            if (newData.length < initialLength) {
                // HACK: This is to mutate the imported array in-place. In a real app, this would be a DELETE API call.
                bannersData.length = 0;
                Array.prototype.push.apply(bannersData, newData);
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};