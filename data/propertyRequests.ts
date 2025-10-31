import type { AddPropertyRequest } from '../types';

export let propertyRequestsData: AddPropertyRequest[] = [
    {
        id: 'prop-req-1',
        customerName: 'علي رضا',
        customerPhone: '01122334455',
        contactTime: 'ظهراً (12م - 3م)',
        images: [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop"
        ],
        propertyDetails: {
            purpose: { en: 'For Sale', ar: 'للبيع' },
            propertyType: { en: 'Villa', ar: 'فيلا' },
            finishingStatus: { en: 'Semi-finished', ar: 'نصف تشطيب' },
            area: 350,
            price: 4200000,
            bedrooms: 4,
            bathrooms: 3,
            floor: 0,
            address: 'الحي الثالث، بجوار المنطقة الخضراء، هليوبوليس الجديدة',
            description: 'فيلا مستقلة على مساحة أرض 500 متر، مباني على 350 متر. تصميم مميز وموقع رائع. تحتاج تشطيبات داخلية.',
            isInCompound: false,
            deliveryType: 'immediate',
            hasInstallments: false,
        },
        status: 'pending',
        createdAt: new Date('2024-07-25T15:00:00Z').toISOString(),
    }
];
