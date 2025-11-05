import type { PartnerRequest } from '../types';

// This is a mock database. In a real application, you would use a database.
export let partnerRequestsData: PartnerRequest[] = [
    {
      id: 'preq-1',
      companyName: 'Alrowad Engineering',
      companyType: 'developer',
      companyAddress: '123 Engineer St, Cairo, Egypt',
      website: 'https://alrowad.com',
      description: 'Provides engineering support and technical consultations.',
      logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto-format&fit=crop',
      contactName: 'Ahmed Salah',
      contactEmail: 'ahmed.salah@alrowad-req.com',
      contactPhone: '+201123456789',
      managementContacts: [{ name: 'John Doe', position: 'CEO', email: 'john.doe@alrowad.com', phone: '+201123456780' }],
      documents: [{ fileName: 'commercial_register.pdf', fileContent: 'data:application/pdf;base64,JVBERi0xLjQKJ...' }],
      status: 'pending',
      createdAt: new Date('2024-07-20T10:00:00Z').toISOString(),
      subscriptionPlan: 'basic',
    },
    {
      id: 'preq-2',
      companyName: 'Artistic Touch Decor',
      companyType: 'finishing',
      companyAddress: '456 Art St, Cairo, Egypt',
      website: 'https://artistictouch.com',
      description: 'Specialists in executing luxury decoration and finishing works.',
      logo: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2070&auto-format&fit=crop',
      contactName: 'Fatima Ali',
      contactEmail: 'fatima.ali@artistic-req.com',
      contactPhone: '+201234567890',
      managementContacts: [],
      documents: [{ fileName: 'tax_card.pdf', fileContent: 'data:application/pdf;base64,JVBERi0xLjQKJ...' }],
      status: 'pending',
      createdAt: new Date('2024-07-21T14:30:00Z').toISOString(),
      subscriptionPlan: 'professional',
    }
];