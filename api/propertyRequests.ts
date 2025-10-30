import { propertyRequestsData } from '../data/propertyRequests';
import type { AddPropertyRequest, RequestStatus } from '../types';

const SIMULATED_DELAY = 300;

export const getAllPropertyRequests = (): Promise<AddPropertyRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...propertyRequestsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, SIMULATED_DELAY);
  });
};

export const addPropertyRequest = (data: Omit<AddPropertyRequest, 'id' | 'status' | 'createdAt'>): Promise<AddPropertyRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: AddPropertyRequest = {
        ...data,
        id: `prop-req-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      propertyRequestsData.unshift(newRequest);
      resolve(newRequest);
    }, SIMULATED_DELAY);
  });
};

export const updatePropertyRequestStatus = (id: string, status: RequestStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = propertyRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                propertyRequestsData[requestIndex].status = status;
                resolve(true);
            }
            resolve(false);
        }, SIMULATED_DELAY);
    });
};

export const deletePropertyRequest = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = propertyRequestsData.length;
            const newData = propertyRequestsData.filter(r => r.id !== id);
            if (newData.length < initialLength) {
                propertyRequestsData.length = 0;
                Array.prototype.push.apply(propertyRequestsData, newData);
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
