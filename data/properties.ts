import type { Property } from '../types';

// Data is now mutable to simulate a database
export let propertiesData: Property[] = [
    {
      id: 'villa-heliopolis-1',
      partnerId: 'united-development',
      imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1613294326794-e2b3b0859591?q=80&w=1966&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=2070&auto=format&fit=crop"
      ],
      status: { ar: "للبيع", en: "For Sale" },
      price: { ar: "3,850,000 ج.م", en: "EGP 3,850,000" },
      priceNumeric: 3850000,
      type: { ar: "فيلا", en: "Villa" },
      title: { ar: "فيلا بتصميم عصري مميز للبيع", en: "Villa with a Unique Modern Design for Sale" },
      address: { ar: "شارع 5، الحى الثانى، هليوبوليس الجديدة", en: "Street 5, 2nd District, New Heliopolis" },
      description: {
          ar: "فيلا فاخرة بتصميم عصري تقع في قلب هليوبوليس الجديدة.\nتتميز الفيلا بحديقة خاصة واسعة وحمام سباحة، بالإضافة إلى تشطيبات عالية الجودة. تتكون من طابقين، وتحتوي على 7 غرف نوم ماستر، وغرفة معيشة كبيرة، ومطبخ مجهز بالكامل. مثالية للعائلات الكبيرة التي تبحث عن الرفاهية والخصوصية.",
          en: "A luxurious modern design villa located in the heart of New Heliopolis.\nThe villa features a large private garden and a swimming pool, in addition to high-quality finishes. It consists of two floors, containing 7 master bedrooms, a large living room, and a fully equipped kitchen. Ideal for large families looking for luxury and privacy."
      },
      beds: 7,
      baths: 5,
      area: 450,
      amenities: {
          ar: ["حديقة خاصة", "حمام سباحة", "موقف سيارات مغطى", "أمن 24 ساعة", "شرفة", "غرفة خادمة", "عداد كهرباء", "عداد مياه", "غاز طبيعي"],
          en: ["Private Garden", "Swimming Pool", "Covered Parking", "24/7 Security", "Balcony", "Maid's Room", "Electricity Meter", "Water Meter", "Natural Gas"]
      },
      finishingStatus: { ar: "تشطيب كامل", en: "Fully Finished" },
      installmentsAvailable: true,
      isInCompound: true,
      delivery: { isImmediate: false, date: '2025-06' },
      installments: { downPayment: 770000, monthlyInstallment: 36666, years: 7 },
      location: { lat: 30.125, lng: 31.608 },
      listingStartDate: '2023-01-01',
      listingEndDate: '2025-12-31',
    },
    {
      id: 'apartment-rent-2',
      partnerId: 'design-hub',
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
      gallery: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop"
      ],
      status: { ar: "إيجار", en: "For Rent" },
      price: { ar: "25,000 ج.م/شهري", en: "EGP 25,000/Month" },
      priceNumeric: 25000,
      type: { ar: "شقة", en: "Apartment" },
      title: { ar: "شقة للإيجار بإطلالة مميزة", en: "Apartment for Rent with a Distinctive View" },
      address: { ar: "كمبوند صن سيتي، هليوبوليس الجديدة", en: "Sun City Compound, New Heliopolis" },
      description: {
          ar: "شقة واسعة للإيجار في أرقى مناطق هليوبوليس الجديدة، تتمتع بإطلالة بانورامية على المساحات الخضراء. الشقة مشطبة بالكامل بتشطيبات سوبر لوكس ومكيفة بالكامل. تقع في كمبوند متكامل الخدمات يوفر أقصى درجات الراحة والأمان.",
          en: "Spacious apartment for rent in the most prestigious areas of New Heliopolis, with a panoramic view of green spaces. The apartment is fully finished with super lux finishes and is fully air-conditioned. Located in a full-service compound that provides the utmost comfort and security."
      },
      beds: 3,
      baths: 2,
      area: 180,
      amenities: {
          ar: ["إطلالة بانورامية", "مكيفة بالكامل", "أمن وحراسة", "نادي صحي مشترك", "مصعد"],
          en: ["Panoramic View", "Fully Air-Conditioned", "Security", "Shared Health Club", "Elevator"]
      },
      finishingStatus: { ar: "سوبر لوكس", en: "Super Lux" },
      installmentsAvailable: false,
      isInCompound: true,
      delivery: { isImmediate: true },
      location: { lat: 30.118, lng: 31.615 },
      listingStartDate: '2024-01-01',
      listingEndDate: '2024-12-31',
    },
    {
      id: 'apartment-sale-3',
      partnerId: 'future-real-estate',
      imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
      gallery: [
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1602002418816-5c0aeef42b6a?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1574873215043-4616587c0331?q=80&w=1974&auto=format&fit=crop"
      ],
      status: { ar: "للبيع", en: "For Sale" },
      price: { ar: "2,100,000 ج.م", en: "EGP 2,100,000" },
      priceNumeric: 2100000,
      type: { ar: "شقة", en: "Apartment" },
      title: { ar: "شقة للبيع في موقع حيوي", en: "Apartment for Sale in a Prime Location" },
      address: { ar: "شارع النزهة، الحى الأول، هليوبوليس الجديدة", en: "El Nozha Street, 1st District, New Heliopolis" },
      description: {
          ar: "شقة للبيع في موقع حيوي واستراتيجي، قريبة من جميع الخدمات والمناطق التجارية. تتميز بتصميم داخلي ممتاز واستغلال أمثل للمساحات. تصلح للسكن الفوري أو للاستثمار.",
          en: "Apartment for sale in a vibrant and strategic location, close to all services and commercial areas. It features an excellent interior design and optimal use of space. Suitable for immediate residence or investment."
      },
      beds: 3,
      baths: 2,
      area: 210,
      amenities: {
          ar: ["موقع حيوي", "قريبة من الخدمات", "عدادات مستقلة", "غاز طبيعي"],
          en: ["Prime Location", "Close to Services", "Separate Meters", "Natural Gas"]
      },
      finishingStatus: { ar: "نصف تشطيب", en: "Semi-finished" },
      installmentsAvailable: true,
      isInCompound: false,
      delivery: { isImmediate: true },
      installments: { downPayment: 420000, monthlyInstallment: 20000, years: 7 },
      location: { lat: 30.128, lng: 31.620 },
      listingStartDate: '2023-05-01',
    },
     {
      id: 'penthouse-sale-4',
      partnerId: 'alrowad-engineering',
      imageUrl: "https://images.unsplash.com/photo-1628744449833-4f938a3a3bde?q=80&w=1974&auto=format&fit=crop",
      gallery: [
          "https://images.unsplash.com/photo-1628744449833-4f938a3a3bde?q=80&w=1974&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1560185893-a55d88652353?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598928636134-45e3a5316b23?q=80&w=2070&auto=format&fit=crop"
      ],
      status: { ar: "للبيع", en: "For Sale" },
      price: { ar: "4,000,000 ج.م", en: "EGP 4,000,000" },
      priceNumeric: 4000000,
      type: { ar: "شقة", en: "Apartment" },
      title: { ar: "شقة بنتهاوس فاخرة للبيع", en: "Luxury Penthouse Apartment for Sale" },
      address: { ar: "برج النخبة، هليوبوليس الجديدة", en: "El Nokhba Tower, New Heliopolis" },
      description: {
          ar: "بنتهاوس دوبلكس فاخر مع رووف خاص وإطلالة مفتوحة. يتميز بتصميم فريد وتشطيبات على أعلى مستوى. يوفر مساحة معيشة واسعة ومثالية للاسترخاء والترفيه.",
          en: "Luxury duplex penthouse with a private roof and an open view. It features a unique design and top-level finishes. Provides a spacious living area ideal for relaxation and entertainment."
      },
      beds: 4,
      baths: 5,
      area: 350,
      amenities: {
          ar: ["رووف خاص", "إطلالة مفتوحة", "جاكوزي", "غرفة ملابس", "أمن 24 ساعة"],
          en: ["Private Roof", "Open View", "Jacuzzi", "Dressing Room", "24/7 Security"]
      },
      finishingStatus: { ar: "تشطيب فاخر", en: "Luxury Finishing" },
      installmentsAvailable: true,
      isInCompound: false,
      delivery: { isImmediate: true },
      installments: { downPayment: 800000, monthlyInstallment: 50000, years: 5 },
      location: { lat: 30.122, lng: 31.625 },
      listingEndDate: '2024-10-31',
    },
    {
      id: 'villa-sale-5',
      partnerId: 'united-development',
      imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
      gallery: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1576941089067-2de3c901e126?q=80&w=2148&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599809275661-059052824c04?q=80&w=2070&auto=format&fit=crop"
      ],
      status: { ar: "للبيع", en: "For Sale" },
      price: { ar: "5,200,000 ج.م", en: "EGP 5,200,000" },
      priceNumeric: 5200000,
      type: { ar: "فيلا", en: "Villa" },
      title: { ar: "منزل حديث بتصميم رائع", en: "Modern House with a Wonderful Design" },
      address: { ar: "كمبوند لافيستا، هليوبوليس الجديدة", en: "La Vista Compound, New Heliopolis" },
      description: {
          ar: "فيلا مستقلة بتصميم معماري حديث ومميز في كمبوند لافيستا. الفيلا محاطة بحديقة كبيرة وتوفر خصوصية تامة. تصميم داخلي مفتوح يوفر إضاءة وتهوية طبيعية ممتازة.",
          en: "An independent villa with a modern and distinctive architectural design in La Vista Compound. The villa is surrounded by a large garden and offers complete privacy. An open interior design provides excellent natural lighting and ventilation."
      },
      beds: 5,
      baths: 4,
      area: 600,
      amenities: {
          ar: ["تصميم حديث", "حديقة كبيرة", "خصوصية تامة", "نوافذ بانورامية", "جراج خاص"],
          en: ["Modern Design", "Large Garden", "Complete Privacy", "Panoramic Windows", "Private Garage"]
      },
      finishingStatus: { ar: "تشطيب كامل", en: "Fully Finished" },
      installmentsAvailable: true,
      isInCompound: true,
      delivery: { isImmediate: true },
      installments: { downPayment: 1040000, monthlyInstallment: 40000, years: 8 },
      location: { lat: 30.115, lng: 31.605 },
      listingStartDate: '2022-01-01',
      listingEndDate: '2023-12-31', // Expired
    },
    {
      id: 'apartment-rent-6',
      partnerId: 'el-mottaheda-group',
      imageUrl: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=2074&auto=format&fit=crop",
      gallery: [
          "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=2074&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1560185893-a55d88652353?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598928636134-45e3a5316b23?q=80&w=2070&auto=format&fit=crop"
      ],
      status: { ar: "إيجار", en: "For Rent" },
      price: { ar: "15,000 ج.م/شهري", en: "EGP 15,000/Month" },
      priceNumeric: 15000,
      type: { ar: "شقة", en: "Apartment" },
      title: { ar: "شقة مفروشة بالكامل", en: "Fully Furnished Apartment" },
      address: { ar: "الحي الثالث، هليوبوليس الجديدة", en: "Third District, New Heliopolis" },
      description: {
          ar: "شقة مفروشة بالكامل بأثاث عصري وجديد للإيجار. جاهزة للسكن فوراً، ولا تحتاج لأي مصاريف. تقع في بناية هادئة وقريبة من المواصلات والأسواق.",
          en: "Fully furnished apartment with modern and new furniture for rent. Ready for immediate occupancy and requires no extra expenses. Located in a quiet building close to transportation and markets."
      },
      beds: 2,
      baths: 1,
      area: 120,
      amenities: {
          ar: ["مفروشة بالكامل", "أجهزة كهربائية حديثة", "جاهزة للسكن", "إنترنت فائق السرعة"],
          en: ["Fully Furnished", "Modern Appliances", "Ready to Move In", "High-Speed Internet"]
      },
      finishingStatus: { ar: "مفروشة بالكامل", en: "Fully Furnished" },
      installmentsAvailable: false,
      isInCompound: false,
      delivery: { isImmediate: true },
      location: { lat: 30.120, lng: 31.600 },
      listingStartDate: '2024-06-01',
    },
    {
      id: 'commercial-sale-7',
      partnerId: 'modern-construction-group',
      imageUrl: "https://images.unsplash.com/photo-1593593381734-3d4a2dc23732?q=80&w=2070&auto=format&fit=crop",
      gallery: [
          "https://images.unsplash.com/photo-1593593381734-3d4a2dc23732?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1481253457524-1ae2a529b523?q=80&w=2148&auto=format&fit=crop"
      ],
      status: { ar: "للبيع", en: "For Sale" },
      price: { ar: "2,500,000 ج.م", en: "EGP 2,500,000" },
      priceNumeric: 2500000,
      type: { ar: "تجاري", en: "Commercial" },
      title: { ar: "محل تجاري للبيع بموقع مميز", en: "Commercial Space for Sale in a Prime Location" },
      address: { ar: "المنطقة التجارية، هليوبوليس الجديدة", en: "Commercial Zone, New Heliopolis" },
      description: {
          ar: "مساحة تجارية تصلح لمختلف الأنشطة. موقع استراتيجي على طريق رئيسي.",
          en: "Commercial space suitable for various activities. Strategic location on a main road."
      },
      beds: 0,
      baths: 0,
      area: 200,
      floor: 1,
      amenities: {
          ar: ["موقع استراتيجي", "واجهة على شارع رئيسي", "كاملة المرافق"],
          en: ["Strategic Location", "Frontage on a Main Street", "Fully Serviced"]
      },
      installmentsAvailable: true,
      delivery: { isImmediate: true },
      isInCompound: false,
      location: { lat: 30.130, lng: 31.630 },
      listingStartDate: '2024-03-01',
      listingEndDate: '2025-03-01',
    },
    {
      id: 'apartment-sale-8',
      partnerId: 'ebdaa-integrated-finishes',
      imageUrl: "https://images.unsplash.com/photo-1528740561666-dc2479703592?q=80&w=1974&auto=format&fit=crop",
      gallery: [
          "https://images.unsplash.com/photo-1528740561666-dc2479703592?q=80&w=1974&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1560185007-c5ca9de270c4?q=80&w=1974&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1560185127-6ed189bf02a4?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?q=80&w=2070&auto=format&fit=crop"
      ],
      status: { ar: "للبيع", en: "For Sale" },
      price: { ar: "1,500,000 ج.м", en: "EGP 1,500,000" },
      priceNumeric: 1500000,
      type: { ar: "شقة", en: "Apartment" },
      title: { ar: "شقة بدون تشطيب للبيع", en: "Apartment without Finishing for Sale" },
      address: { ar: "الحي الرابع، هليوبوليس الجديدة", en: "Fourth District, New Heliopolis" },
      description: {
          ar: "شقة على الطوب الأحمر تمنحك فرصة تشطيبها بالكامل حسب ذوقك الخاص. تقع في منطقة هادئة ومستقبلية.",
          en: "A bare-brick apartment that gives you the opportunity to finish it completely according to your own taste. Located in a quiet and promising area."
      },
      beds: 3,
      baths: 2,
      area: 190,
      amenities: {
          ar: ["إمكانية التخصيص الكامل", "منطقة هادئة", "موقف سيارات"],
          en: ["Full Customization Potential", "Quiet Area", "Parking"]
      },
      finishingStatus: { ar: "بدون تشطيب", en: "Without Finishing" },
      installmentsAvailable: true,
      isInCompound: false,
      delivery: { isImmediate: false, date: '2026-01' },
      location: { lat: 30.132, lng: 31.618 }
    }
];