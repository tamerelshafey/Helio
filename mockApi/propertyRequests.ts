import { propertyRequestsData } from '../data/propertyRequests';
import type { AddPropertyRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllPropertyRequests = async (): Promise<AddPropertyRequest[]> => {
    await delay(300);
    return [...propertyRequestsData];
};

export const addPropertyRequest = async (request: Omit<AddPropertyRequest, 'id' | 'status' | 'createdAt'>): Promise<AddPropertyRequest> => {
    await delay(500);
    const newRequest: AddPropertyRequest = {
        ...request,
        id: `prop-req-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    propertyRequestsData.unshift(newRequest);
    
    addNotification({
        userId: 'admin-user', // Notify a general admin
        message: {
            en: `New property listing request from "${newRequest.customerName}".`,
            ar: `طلب عرض عقار جديد من "${newRequest.customerName}".`,
        },
        link: `/admin/property-requests/${newRequest.id}`,
    });

    return newRequest;
};

export const updatePropertyRequestStatus = async (id: string, status: RequestStatus): Promise<AddPropertyRequest | undefined> => {
    await delay(100);
    const request = propertyRequestsData.find(req => req.id === id);
    if (request) {
        request.status = status;
        return request;
    }
    return undefined;
};
