import type { Property } from '../types';

const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    // Month is 0-indexed in JS Date
    return new Date(year, month - 1, day);
};

export const isListingActive = (p: Property): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const startActive = p.listingStartDate ? now >= parseLocalDate(p.listingStartDate) : true;
    
    let endActive = true;
    if (p.listingEndDate) {
        const endDate = parseLocalDate(p.listingEndDate);
        endDate.setHours(23, 59, 59, 999); // Make end date inclusive for the whole day
        endActive = now <= endDate;
    }

    return startActive && endActive;
};


export const isCommercial = (property: Property): boolean => {
    return property.type.en === 'Commercial';
};