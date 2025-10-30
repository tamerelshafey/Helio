import type { Property } from '../types';

export const isListingActive = (p: Property): boolean => {
    const now = new Date();
    // Set hours to 0 to compare dates only
    now.setHours(0, 0, 0, 0); 
    
    // If no start date, it's active from the beginning of time
    const startDate = p.listingStartDate ? new Date(p.listingStartDate) : new Date(0);
    // If no end date, it's active indefinitely
    const endDate = p.listingEndDate ? new Date(p.listingEndDate) : new Date('9999-12-31');
    
    // Adjust for timezone differences by getting time in UTC for comparison
    const nowTime = now.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return nowTime >= startTime && nowTime <= endTime;
};

export const isCommercial = (property: Property): boolean => {
    return property.type.en === 'Commercial';
};