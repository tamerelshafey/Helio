import type { ContactRequest } from '../types';

export let contactRequestsData: ContactRequest[] = [
    {
        id: 'contact-1',
        name: 'مريم حسن',
        phone: '01234567890',
        contactTime: 'مساءً (3م - 6م)',
        message: 'أود الاستفسار عن إمكانية عرض شقتي للإيجار من خلال منصتكم. الشقة في الحي الثاني ومساحتها 180 متر.',
        status: 'pending',
        createdAt: new Date('2024-07-25T12:00:00Z').toISOString(),
        inquiryType: 'client',
    },
    {
        id: 'contact-2',
        name: 'شركة النور للمقاولات',
        phone: '01098765432',
        contactTime: 'صباحاً (9ص - 12م)',
        message: 'نحن شركة متخصصة في أعمال التشطيبات ونرغب في الانضمام كشريك لكم في هليوبوليس الجديدة.',
        status: 'pending',
        createdAt: new Date('2024-07-24T09:30:00Z').toISOString(),
        inquiryType: 'partner',
        companyName: 'النور للمقاولات',
        businessType: 'finishing',
    },
];
