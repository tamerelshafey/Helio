import { contactRequestsData } from '../data/contactRequests';
import type { ContactRequest, RequestStatus } from '../types';

const SIMULATED_DELAY = 300;

export const getAllContactRequests = (): Promise<ContactRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...contactRequestsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, SIMULATED_DELAY);
  });
};

export const addContactRequest = (data: Omit<ContactRequest, 'id' | 'status' | 'createdAt'>): Promise<ContactRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: ContactRequest = {
        ...data,
        id: `contact-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      contactRequestsData.unshift(newRequest);
      resolve(newRequest);
    }, SIMULATED_DELAY);
  });
};

export const updateContactRequestStatus = (id: string, status: RequestStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = contactRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                contactRequestsData[requestIndex].status = status;
                resolve(true);
            }
            resolve(false);
        }, SIMULATED_DELAY);
    });
};

export const deleteContactRequest = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = contactRequestsData.length;
            const newData = contactRequestsData.filter(r => r.id !== id);
            if (newData.length < initialLength) {
                contactRequestsData.length = 0;
                Array.prototype.push.apply(contactRequestsData, newData);
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
