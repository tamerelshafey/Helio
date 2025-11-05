import { siteContentData } from '../data/content';
import type { SiteContent } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getContent = async (): Promise<SiteContent> => {
    await delay(100);
    return JSON.parse(JSON.stringify(siteContentData));
};

export const updateContent = async (updates: Partial<SiteContent>): Promise<SiteContent> => {
    await delay(500);
    Object.assign(siteContentData, updates);
    return JSON.parse(JSON.stringify(siteContentData));
};
