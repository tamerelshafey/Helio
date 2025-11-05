import { propertyInquiriesData } from '../data/propertyInquiries';
import type { PropertyInquiryRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllPropertyInquiries = async (): Promise<PropertyInquiryRequest[]> => {
    await delay(200);
    return [...propertyInquiriesData];
};

export const addPropertyInquiry = async (request: Omit<PropertyInquiryRequest, 'id' | 'status' | 'createdAt'>): Promise<PropertyInquiryRequest> => {
    await delay(500);
    const newRequest: PropertyInquiryRequest = {
        ...request,
        id: `inq-${Date.now()}`,
        status: 'new',
        createdAt: new Date().toISOString(),
    };
    propertyInquiriesData.unshift(newRequest);
    
    addNotification({
        userId: 'admin-user', // Notify a general admin
        message: {
            en: `New property inquiry from "${newRequest.customerName}".`,
            ar: `طلب بحث عن عقار جديد من "${newRequest.customerName}".`,
        },
        link: `/admin/property-inquiries`,
    });

    return newRequest;
};

export const updatePropertyInquiryStatus = async (id: string, status: RequestStatus): Promise<PropertyInquiryRequest | undefined> => {
    await delay(100);
    const request = propertyInquiriesData.find(req => req.id === id);
    if (request) {
        request.status = status;
        return request;
    }
    return undefined;
};

export const deletePropertyInquiry = async (id: string): Promise<boolean> => {
    await delay(100);
    // FIX: Use splice to mutate the array directly instead of reassigning the import.
    const index = propertyInquiriesData.findIndex(req => req.id === id);
    if (index > -1) {
        propertyInquiriesData.splice(index, 1);
        return true;
    }
    return false;
};
