

import type { Property } from '../types';

// Data is now mutable to simulate a database
export let propertiesData: Property[] = [
    {
      id: 'villa-heliopolis-1',
      partnerId: 'united-development',
      projectId: 'proj-1',
      imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=75&w=2071&auto=format&fit=crop",
      imageUrl_small: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=75&w=480&auto=format&fit=crop",
      imageUrl_medium: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=75&w=800&auto=format&fit=crop",
      imageUrl_large: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=75&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=75&w=2071&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=75&w=2070&auto=format&fit=crop"
      ],
      status: { en: 'For Sale', ar: 'للبيع' },
      price: { en: 'EGP 8,500,000', ar: '8,500,000 ج.م' },
      priceNumeric: 8500000,
      type: { en: 'Villa', ar: 'فيلا' },
      title: {
        ar: 'فيلا فاخرة بتصميم عصري في كمبوند تلالا',
        en: 'Luxury Modern Villa in Talala Compound'
      },
      address: {
        ar: 'كمبوند تلالا، هليوبوليس الجديدة',
        en: 'Talala Compound, New Heliopolis'
      },
      description: {
        ar: 'فيلا مستقلة فاخرة بتصميم معماري فريد يجمع بين الحداثة والأصالة. تقع في قلب كمبوند تلالا الراقي، وتوفر إطلالات خلابة على المساحات الخضراء. الفيلا مكونة من طابقين وروف، مع حديقة خاصة ومساحة لحمام سباحة.',
        en: 'A luxurious standalone villa with a unique architectural design that combines modernity and authenticity. Located in the heart of the prestigious Talala Compound, it offers stunning views of the green spaces. The villa consists of two floors and a roof, with a private garden and space for a swimming pool.'
      },
      beds: 5,
      baths: 6,
      area: 450,
      amenities: {
        ar: ['حديقة خاصة', 'جراج خاص', 'أمن 24/7', 'إطلالة مفتوحة'],
        en: ['Private Garden', 'Private Garage', '24/7 Security', 'Open View']
      },
      finishingStatus: { en: 'Semi-finished', ar: 'نصف تشطيب' },
      installmentsAvailable: true,
      isInCompound: true,
      realEstateFinanceAvailable: true,
      delivery: { isImmediate: false, date: '2025-12' },
      installments: { downPayment: 850000, monthlyInstallment: 63750, years: 10 },
      location: { lat: 30.138, lng: 31.679 },
      listingStartDate: '2024-06-01',
    },
    {
      id: 'apartment-heliopolis-2',
      partnerId: 'modern-construction-group',
      projectId: 'proj-2',
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=75&w=2070&auto=format&fit=crop",
      imageUrl_small: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=75&w=480&auto=format=fit-crop",
      imageUrl_medium: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=75&w=800&auto=format&fit=crop",
      imageUrl_large: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=75&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=75&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=75&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=75&w=2070&auto=format&fit=crop"
      ],
      status: { en: 'For Rent', ar: 'إيجار' },
      price: { en: 'EGP 25,000 / month', ar: '25,000 ج.م / شهرياً' },
      priceNumeric: 25000,
      type: { en: 'Apartment', ar: 'شقة' },
      title: {
        ar: 'شقة مفروشة بالكامل للإيجار في جولز',
        en: 'Fully Furnished Apartment for Rent in Joules'
      },
      address: {
        ar: 'كمبوند جولز، الحي الثاني، هليوبوليس الجديدة',
        en: 'Joules Compound, 2nd District, New Heliopolis'
      },
      description: {
        ar: 'شقة فاخرة للإيجار مفروشة بالكامل بأثاث عصري وأجهزة حديثة. تتميز الشقة بإطلالة مباشرة على حديقة الكمبوند. جاهزة للسكن الفوري.',
        en: 'Luxury apartment for rent, fully furnished with modern furniture and appliances. The apartment features a direct view of the compound\'s garden. Ready for immediate occupancy.'
      },
      beds: 3,
      baths: 2,
      area: 180,
      floor: 3,
      amenities: {
        ar: ['مفروشة بالكامل', 'أجهزة حديثة', 'جاهزة للسكن', 'مصعد'],
        en: ['Fully Furnished', 'Modern Appliances', 'Ready to Move In', 'Elevator']
      },
      finishingStatus: { en: 'Fully Furnished', ar: 'مفروشة بالكامل' },
      isInCompound: true,
      delivery: { isImmediate: true },
      location: { lat: 30.141, lng: 31.675 },
      listingStartDate: '2024-07-01',
    },
    {
      id: 'commercial-heliopolis-3',
      partnerId: 'future-real-estate',
      imageUrl: "https://images.unsplash.com/photo-1448630360428-65456885c650?q=75&w=2067&auto=format&fit=crop",
      imageUrl_small: "https://images.unsplash.com/photo-1448630360428-65456885c650?q=75&w=480&auto=format&fit=crop",
      imageUrl_medium: "https://images.unsplash.com/photo-1448630360428-65456885c650?q=75&w=800&auto=format&fit=crop",
      imageUrl_large: "https://images.unsplash.com/photo-1448630360428-65456885c650?q=75&w=1200&auto=format&fit=crop",
      gallery: [],
      status: { en: 'For Sale', ar: 'للبيع' },
      price: { en: 'EGP 3,200,000', ar: '3,200,000 ج.م' },
      priceNumeric: 3200000,
      type: { en: 'Commercial', ar: 'تجاري' },
      title: {
        ar: 'محل تجاري بموقع متميز على شارع رئيسي',
        en: 'Commercial Shop in a Prime Location on a Main Street'
      },
      address: {
        ar: 'الحي الأول، شارع الكوربة، هليوبوليس الجديدة',
        en: '1st District, El Korba St, New Heliopolis'
      },
      description: {
        ar: 'محل تجاري بمساحة 80 متر مربع، واجهة على شارع رئيسي وحيوي. يصلح لجميع الأنشطة التجارية. استلام فوري.',
        en: 'A commercial shop with an area of 80 square meters, fronting a main and lively street. Suitable for all commercial activities. Immediate delivery.'
      },
      beds: 0,
      baths: 1,
      area: 80,
      floor: 0,
      amenities: {
        ar: ['موقع استراتيجي', 'واجهة على شارع رئيسي', 'كاملة المرافق'],
        en: ['Strategic Location', 'Frontage on a Main Street', 'Fully Serviced']
      },
      finishingStatus: { en: 'Without Finishing', ar: 'بدون تشطيب' },
      installmentsAvailable: false,
      isInCompound: false,
      realEstateFinanceAvailable: false,
      delivery: { isImmediate: true },
      location: { lat: 30.135, lng: 31.672 },
      listingStartDate: '2024-05-15',
    },
    {
      id: 'land-heliopolis-4',
      partnerId: 'individual-listings',
      imageUrl: "https://images.unsplash.com/photo-1555526244-4c3113576751?q=75&w=2070&auto=format&fit=crop",
      imageUrl_small: "https://images.unsplash.com/photo-1555526244-4c3113576751?q=75&w=480&auto=format&fit=crop",
      imageUrl_medium: "https://images.unsplash.com/photo-1555526244-4c3113576751?q=75&w=800&auto=format&fit=crop",
      imageUrl_large: "https://images.unsplash.com/photo-1555526244-4c3113576751?q=75&w=1200&auto=format&fit=crop",
      gallery: [],
      status: { en: 'For Sale', ar: 'للبيع' },
      price: { en: 'EGP 5,000,000', ar: '5,000,000 ج.م' },
      priceNumeric: 5000000,
      type: { en: 'Land', ar: 'أرض' },
      title: {
        ar: 'أرض للبيع بمنطقة الفيلات',
        en: 'Land for Sale in the Villas Area'
      },
      address: {
        ar: 'الحي الرابع، هليوبوليس الجديدة',
        en: '4th District, New Heliopolis'
      },
      description: {
        ar: 'قطعة أرض مميزة بمساحة 600 متر مربع، مخصصة لبناء فيلا. تقع في منطقة هادئة وراقية.',
        en: 'A prime piece of land of 600 square meters, designated for building a villa. Located in a quiet and upscale area.'
      },
      beds: 0,
      baths: 0,
      area: 600,
      amenities: {
        ar: ['إمكانية التخصيص الكامل', 'منطقة هادئة'],
        en: ['Full Customization Potential', 'Quiet Area']
      },
      delivery: { isImmediate: true },
      location: { lat: 30.133, lng: 31.668 },
      listingStartDate: '2024-07-10',
      contactMethod: 'direct',
      ownerPhone: '01012345678',
      isInCompound: false,
    }
];