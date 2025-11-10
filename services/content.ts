
import { siteContentData } from '../data/content';
import type { SiteContent } from '../types';

const SIMULATED_DELAY = 300;

export const getContent = (): Promise<SiteContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Return a deep copy to prevent direct mutation of the source object
            resolve(JSON.parse(JSON.stringify(siteContentData)));
        }, SIMULATED_DELAY);
    });
};

export const updateContent = (updates: Partial<SiteContent>): Promise<SiteContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Merge the updates into the existing data object
            Object.assign(siteContentData, updates);
            resolve(JSON.parse(JSON.stringify(siteContentData)));
        }, SIMULATED_DELAY);
    });
};