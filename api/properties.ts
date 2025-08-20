import { propertiesData, Property } from '../data/properties';

// Simulate network delay
const SIMULATED_DELAY = 500;

export const getProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData);
    }, SIMULATED_DELAY);
  });
};

export const getPropertyById = (id: string): Promise<Property | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const property = propertiesData.find(p => p.id === id);
      resolve(property);
    }, SIMULATED_DELAY);
  });
};

export const getFeaturedProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(propertiesData.slice(0, 4));
    }, SIMULATED_DELAY);
  });
};
