import { contactRequestsData } from '../data/contactRequests';
import type { ContactRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllContactRequests = async (): Promise<ContactRequest[]> => {
    await delay(200);
    return [...contactRequestsData];
};

export const addContactRequest = async (request: Omit<ContactRequest, 'id' | 'status' | 'createdAt'>): Promise<ContactRequest> => {
    await delay(500);
    const newRequest: ContactRequest = {
        ...request,
        id: `contact-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    contactRequestsData.unshift(newRequest);
    
    addNotification({
        userId: 'admin-user', // Notify a general admin
        message: {
            en: `New contact message from "${newRequest.name}".`,
            ar: `رسالة تواصل جديدة من "${newRequest.name}".`,
        },
        link: `/admin/contact-requests`,
    });

    return newRequest;
};

export const updateContactRequestStatus = async (id: string, status: RequestStatus): Promise<ContactRequest | undefined> => {
    await delay(100);
    const request = contactRequestsData.find(req => req.id === id);
    if (request) {
        request.status = status;
        return request;
    }
    return undefined;
};

export const deleteContactRequest = async (id: string): Promise<boolean> => {
    await delay(100);
    // FIX: Use splice to mutate the array directly instead of reassigning the import.
    const index = contactRequestsData.findIndex(req => req.id === id);
    if (index > -1) {
        contactRequestsData.splice(index, 1);
        return true;
    }
    return false;
};
