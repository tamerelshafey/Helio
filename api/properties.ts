// Note: This is a mock API. In a real application, these functions would make network requests
// to a backend service. The data is modified in-memory for simulation purposes.

import { propertiesData } from '../data/properties';
import { getPartnerById } from './partners';
import type { Property } from '../types';
import { isListingActive } from '../utils/propertyUtils';

const SIMULATED_DELAY = 300;

const populatePartnerInfo = (property: Property): Property => {
  const partner = getPartnerById(property.partnerId);
  return {
    ...property,
    partnerName: partner?.name,
    partnerImageUrl: partner?.imageUrl,
  };
};

export const getAllProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData.map(populatePartnerInfo));
    }, SIMULATED_DELAY);
  });
};

export const getProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData.filter(isListingActive).map(populatePartnerInfo));
    }, SIMULATED_DELAY);
  });
};

export const getPropertiesByPartnerId = (partnerId: string): Promise<Property[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const partnerProperties = propertiesData.filter(p => p.partnerId === partnerId);
            resolve(partnerProperties.map(populatePartnerInfo));
        }, SIMULATED_DELAY);
    });
};

export const getPropertyById = (id: string): Promise<Property | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const property = propertiesData.find(p => p.id === id);
      if (property) {
        // Only return if active, for public view
        if (isListingActive(property)) {
            resolve(populatePartnerInfo(property));
        } else {
            // For now, let's allow direct access to expired listings via URL
            // In a real app, you might want a different behavior
             resolve(populatePartnerInfo(property));
        }
      } else {
        resolve(undefined)
      }
    }, SIMULATED_DELAY);
  });
};

export const getFeaturedProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData.filter(isListingActive).slice(0, 4).map(populatePartnerInfo));
    }, SIMULATED_DELAY);
  });
};

export const addProperty = (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>): Promise<Property> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newProperty: Property = {
                ...property,
                id: `prop-${Date.now()}`,
                imageUrl: property.imageUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop",
            };
            propertiesData.unshift(newProperty);
            resolve(populatePartnerInfo(newProperty));
        }, SIMULATED_DELAY);
    });
};

export const updateProperty = (propertyId: string, updates: Partial<Property>): Promise<Property | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const propertyIndex = propertiesData.findIndex(p => p.id === propertyId);
            if (propertyIndex > -1) {
                propertiesData[propertyIndex] = { ...propertiesData[propertyIndex], ...updates };
                resolve(populatePartnerInfo(propertiesData[propertyIndex]));
            } else {
                resolve(undefined);
            }
        }, SIMULATED_DELAY);
    });
};

export const deleteProperty = (propertyId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = propertiesData.length;
            const newData = propertiesData.filter(p => p.id !== propertyId);
            if (newData.length < initialLength) {
                // This is a hack because we are modifying the imported array.
                // In a real app, you would make an API call to a backend.
                propertiesData.length = 0;
                Array.prototype.push.apply(propertiesData, newData);
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};