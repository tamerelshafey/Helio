// Note: This is a mock API. In a real application, these functions would make network requests
// to a backend service. The data is modified in-memory for simulation purposes.

import { propertiesData as initialPropertiesData } from '../data/properties';
import { projectsData } from '../data/projects';
import { partnersData } from '../data/partners';
import { enTranslations } from '../data/translations';
import type { Property, PropertyFiltersType } from '../types';
import { isListingActive } from '../utils/propertyUtils';

// Create a mutable, in-memory copy of the data to simulate a database.
let propertiesData: Property[] = [...initialPropertiesData];


const SIMULATED_DELAY = 300;

const populatePropertyDetails = (property: Property): Property => {
  let populatedProperty = { ...property };

  // Populate partner info
  const partner = partnersData.find(p => p.id === property.partnerId);
  if (partner) {
      const partnerInfo = (enTranslations.partnerInfo as any)[partner.id];
      populatedProperty.partnerName = partnerInfo ? partnerInfo.name : partner.id;
      populatedProperty.partnerImageUrl = partner.imageUrl;
  }

  // Populate project info
  if (property.projectId) {
    const project = projectsData.find(p => p.id === property.projectId);
    if (project) {
        populatedProperty.projectName = project.name;
    }
  }

  return populatedProperty;
};


export const getAllProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData.map(populatePropertyDetails));
    }, SIMULATED_DELAY);
  });
};

export const getProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData.filter(p => p.listingStatus === 'active').map(populatePropertyDetails));
    }, SIMULATED_DELAY);
  });
};

export const getPaginatedProperties = (options: {
  page: number;
  limit: number;
  filters: PropertyFiltersType;
  disablePagination?: boolean;
}): Promise<{ properties: Property[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page, limit, filters, disablePagination } = options;

      // Start with all active properties
      const activeProperties = propertiesData
        .filter(p => p.listingStatus === 'active')
        .map(populatePropertyDetails);

      // Apply filters from PropertiesPage
      const filtered = activeProperties.filter(p => {
        const statusMatch = filters.status === 'all' || p.status.en === filters.status;
        const typeMatch = filters.type === 'all' || p.type.en === filters.type;
        const projectMatch = filters.project === 'all' || p.projectId === filters.project;
        
        const queryMatch = !filters.query || 
          p.title.ar.toLowerCase().includes(filters.query.toLowerCase()) ||
          p.title.en.toLowerCase().includes(filters.query.toLowerCase()) ||
          p.address.ar.toLowerCase().includes(filters.query.toLowerCase()) ||
          p.address.en.toLowerCase().includes(filters.query.toLowerCase()) ||
          p.partnerName?.toLowerCase().includes(filters.query.toLowerCase());

        const minPrice = parseInt(filters.minPrice, 10);
        const maxPrice = parseInt(filters.maxPrice, 10);
        const priceMatch = (!minPrice || p.priceNumeric >= minPrice) && (!maxPrice || p.priceNumeric <= maxPrice);

        const finishingMatch = filters.finishing === 'all' || p.finishingStatus?.en === filters.finishing;

        const installmentsMatch = filters.installments === 'all' ||
            (filters.installments === 'yes' && p.installmentsAvailable) ||
            (filters.installments === 'no' && !p.installmentsAvailable);
        
        const realEstateFinanceMatch = filters.realEstateFinance === 'all' ||
            (filters.realEstateFinance === 'yes' && p.realEstateFinanceAvailable) ||
            (filters.realEstateFinance === 'no' && !p.realEstateFinanceAvailable);

        const floorMatch = !filters.floor || (p.floor !== undefined && p.floor === parseInt(filters.floor, 10));

        const compoundMatch = filters.compound === 'all' || 
            (filters.compound === 'yes' && p.isInCompound) ||
            (filters.compound === 'no' && !p.isInCompound);

        const deliveryMatch = filters.delivery === 'all' ||
            (filters.delivery === 'immediate' && p.delivery?.isImmediate);
        
        const amenitiesMatch = filters.amenities.length === 0 || filters.amenities.every((amenity: string) => p.amenities.en.includes(amenity));

        const bedsMatch = !filters.beds || p.beds >= parseInt(filters.beds, 10);
        const bathsMatch = !filters.baths || p.baths >= parseInt(filters.baths, 10);

        return statusMatch && typeMatch && queryMatch && priceMatch && finishingMatch && installmentsMatch && realEstateFinanceMatch && floorMatch && compoundMatch && deliveryMatch && amenitiesMatch && projectMatch && bedsMatch && bathsMatch;
      });

      const total = filtered.length;

      if (disablePagination) {
        resolve({ properties: filtered, total });
        return;
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      const properties = filtered.slice(start, end);

      resolve({ properties, total });
    }, SIMULATED_DELAY);
  });
};


export const getPropertiesByPartnerId = (partnerId: string): Promise<Property[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const partnerProperties = propertiesData.filter(p => p.partnerId === partnerId);
            resolve(partnerProperties.map(populatePropertyDetails));
        }, SIMULATED_DELAY);
    });
};

export const getPropertiesByProjectId = (projectId: string): Promise<Property[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const projectProperties = propertiesData.filter(p => p.projectId === projectId);
            resolve(projectProperties.map(populatePropertyDetails));
        }, SIMULATED_DELAY);
    });
};

export const getPropertyById = (id: string): Promise<Property | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const property = propertiesData.find(p => p.id === id);
      if (property) {
        resolve(populatePropertyDetails(property));
      } else {
        resolve(undefined)
      }
    }, SIMULATED_DELAY);
  });
};

export const getFeaturedProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData.filter(p => p.listingStatus === 'active').slice(0, 4).map(populatePropertyDetails));
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
            resolve(populatePropertyDetails(newProperty));
        }, SIMULATED_DELAY);
    });
};

export const updateProperty = (propertyId: string, updates: Partial<Property>): Promise<Property | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const propertyIndex = propertiesData.findIndex(p => p.id === propertyId);
            if (propertyIndex > -1) {
                propertiesData[propertyIndex] = { ...propertiesData[propertyIndex], ...updates };
                resolve(populatePropertyDetails(propertiesData[propertyIndex]));
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
            propertiesData = propertiesData.filter(p => p.id !== propertyId);
            if (propertiesData.length < initialLength) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};