import type { PropertyInquiryRequest } from '../types';

export let propertyInquiriesData: PropertyInquiryRequest[] = [
    {
        id: 'inquiry-1',
        customerName: 'سارة علي',
        customerPhone: '01012345678',
        contactTime: 'مساءً (3م - 6م)',
        details: 'أبحث عن شقة للبيع في كمبوند تلالا، ٣ غرف نوم، مساحة لا تقل عن 180 متر. الميزانية حوالي 3 مليون جنيه.',
        status: 'pending',
        createdAt: new Date('2024-07-26T11:00:00Z').toISOString(),
        managerId: 'customer-relations-manager-1',
    },
    {
        id: 'inquiry-2',
        customerName: 'Karim Ahmed',
        customerPhone: '01198765432',
        contactTime: 'ظهراً (12م - 3م)',
        details: 'Looking for a commercial shop for rent in a prime location in New Heliopolis, suitable for a cafe. Area around 100-150m.',
        status: 'reviewed',
        createdAt: new Date('2024-07-25T16:45:00Z').toISOString(),
        managerId: 'customer-relations-manager-1',
    }
];