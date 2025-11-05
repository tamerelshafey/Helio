import { partnerRequestsData } from '../data/partnerRequests';
import type { PartnerRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllPartnerRequests = async (): Promise<PartnerRequest[]> => {
    await delay(300);
    return [...partnerRequestsData];
};

export const addPartnerRequest = async (request: Omit<PartnerRequest, 'id' | 'status' | 'createdAt'>): Promise<PartnerRequest> => {
    await delay(500);
    const newRequest: PartnerRequest = {
        ...request,
        id: `preq-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    partnerRequestsData.unshift(newRequest);
    
    addNotification({
        userId: 'admin-user', // Notify a general admin
        message: {
            en: `New partner request from "${newRequest.companyName}".`,
            ar: `لديك طلب انضمام شريك جديد من "${newRequest.companyName}".`,
        },
        link: `/admin/partner-requests/${newRequest.id}`,
    });

    return newRequest;
};

export const updatePartnerRequestStatus = async (id: string, status: RequestStatus): Promise<PartnerRequest | undefined> => {
    await delay(100);
    const request = partnerRequestsData.find(req => req.id === id);
    if (request) {
        request.status = status;
        if (status === 'approved') {
             addNotification({
                userId: request.contactEmail, // Use email as a proxy for userId in this mock setup
                message: {
                    en: 'Welcome! Your partner account has been approved.',
                    ar: 'مرحباً بك! تم الموافقة على حساب الشراكة الخاص بك.',
                },
                link: `/dashboard`,
            });
        }
        return request;
    }
    return undefined;
};
