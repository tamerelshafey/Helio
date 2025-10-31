import type { PortfolioItem } from '../types';

export let portfolioData: PortfolioItem[] = [
    // El Mottaheda Group
    { id: 'p1-1', partnerId: 'el-mottaheda-group', src: "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=1974&auto=format&fit=crop", alt: "موقع بناء حديث", title: {ar: "موقع بناء حديث", en: "Modern Construction Site"}, category: {ar: 'تشطيبات خارجية', en: 'Exterior Finishes'} },
    { id: 'p1-2', partnerId: 'el-mottaheda-group', src: "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?q=80&w=2071&auto=format&fit=crop", alt: "هيكل معماري", title: {ar: "هيكل معماري", en: "Architectural Structure"}, category: {ar: 'تشطيبات خارجية', en: 'Exterior Finishes'} },
    { id: 'p1-3', partnerId: 'el-mottaheda-group', src: "https://images.unsplash.com/photo-1581092446347-a8bce1e51b4c?q=80&w=2070&auto=format&fit=crop", alt: "أعمال تشطيب داخلية", title: {ar: "أعمال تشطيب داخلية", en: "Interior Finishing Works"}, category: {ar: 'تصاميم داخلية', en: 'Interior Designs'} },
    { id: 'p1-4', partnerId: 'el-mottaheda-group', src: "https://images.unsplash.com/photo-1517983692621-4493f06a1478?q=80&w=2070&auto=format&fit=crop", alt: "واجهة خارجية لمبنى", title: {ar: "واجهة خارجية لمبنى", en: "Building Exterior Facade"}, category: {ar: 'تشطيبات خارجية', en: 'Exterior Finishes'} },
    
    // Design Hub
    { id: 'p2-1', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop", alt: "غرفة معيشة عصرية", title: {ar: "غرفة معيشة عصرية", en: "Modern Living Room"}, category: {ar: 'تصاميم داخلية', en: 'Interior Designs'} },
    { id: 'p2-2', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop", alt: "مطبخ حديث", title: {ar: "مطبخ حديث", en: "Modern Kitchen"}, category: {ar: 'مطابخ', en: 'Kitchens'} },
    { id: 'p2-3', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1595526114035-0d45ed16433d?q=80&w=2070&auto=format&fit=crop", alt: "غرفة نوم أنيقة", title: {ar: "غرفة نوم أنيقة", en: "Elegant Bedroom"}, category: {ar: 'تصاميم داخلية', en: 'Interior Designs'} },
    { id: 'p2-4', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1974&auto=format&fit=crop", alt: "تصميم داخلي مفتوح", title: {ar: "تصميم داخلي مفتوح", en: "Open Space Interior Design"}, category: {ar: 'تصاميم داخلية', en: 'Interior Designs'} },
    
    // Artistic Touch
    { id: 'p3-1', partnerId: 'artistic-touch-decor', src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2070&auto=format&fit=crop", alt: "ديكور جداري فاخر", title: {ar: "ديكور جداري فاخر", en: "Luxury Wall Decor"}, category: {ar: 'تفاصيل فنية', en: 'Artistic Details'} },
    { id: 'p3-2', partnerId: 'artistic-touch-decor', src: "https://images.unsplash.com/photo-1567016432779-1fee8448b89?q=80&w=1974&auto=format&fit=crop", alt: "تفاصيل ديكور كلاسيكية", title: {ar: "تفاصيل ديكور كلاسيكية", en: "Classic Decor Details"}, category: {ar: 'تفاصيل فنية', en: 'Artistic Details'} },
    { id: 'p3-3', partnerId: 'artistic-touch-decor', src: "https://images.unsplash.com/photo-1533090481720-337a8a6f3874?q=80&w=1974&auto=format&fit=crop", alt: "لمسة فنية في غرفة طعام", title: {ar: "لمسة فنية في غرفة طعام", en: "Artistic Touch in Dining Room"}, category: {ar: 'تصاميم داخلية', en: 'Interior Designs'} },
    { id: 'p3-4', partnerId: 'artistic-touch-decor', src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f458?q=80&w=2070&auto=format&fit=crop", alt: "إضاءة ديكورية", title: {ar: "إضاءة ديكورية", en: "Decorative Lighting"}, category: {ar: 'تفاصيل فنية', en: 'Artistic Details'} },
    
    // Ebdaa
    { id: 'p4-1', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop", alt: "تشطيب شقة سكنية", title: {ar: "تشطيب شقة سكنية", en: "Residential Apartment Finishing"}, category: {ar: 'تصاميم داخلية', en: 'Interior Designs'} },
    { id: 'p4-2', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2070&auto=format&fit=crop", alt: "تشطيب مطبخ عملي", title: {ar: "تشطيب مطبخ عملي", en: "Practical Kitchen Finishing"}, category: {ar: 'مطابخ', en: 'Kitchens'} },
    { id: 'p4-3', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=2070&auto=format&fit=crop", alt: "أرضيات خشبية", title: {ar: "أرضيات خشبية", en: "Wooden Flooring"}, category: {ar: 'تفاصيل فنية', en: 'Artistic Details'} },
    { id: 'p4-4', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop", alt: "تشطيب غرفة معيشة مريحة", title: {ar: "تشطيب غرفة معيشة", en: "Cozy Living Room Finishing"}, category: {ar: 'تصاميم داخلية', en: 'Interior Designs'} },

    // Artistic Touch - Wall Sculptures
    { id: 'p3-5', partnerId: 'artistic-touch-decor', src: "https://i.imgur.com/gJ9n273.jpeg", alt: "3D wall sculpture of flowers", title: {ar: "منحوتة زهور ثلاثية الأبعاد", en: "3D Flower Sculpture"}, category: {ar: 'منحوتات جدارية', en: 'Wall Sculptures'} },
    { id: 'p3-6', partnerId: 'artistic-touch-decor', src: "https://i.imgur.com/g05Y36x.jpeg", alt: "Wall sculpture of a blossoming tree", title: {ar: "منحوتة شجرة مزهرة", en: "Blossoming Tree Sculpture"}, category: {ar: 'منحوتات جدارية', en: 'Wall Sculptures'} },
    { id: 'p3-7', partnerId: 'artistic-touch-decor', src: "https://i.imgur.com/6pgpJA8.jpeg", alt: "Abstract tree branch wall sculpture", title: {ar: "منحوتة غصن شجرة تجريدي", en: "Abstract Tree Branch Sculpture"}, category: {ar: 'منحوتات جدارية', en: 'Wall Sculptures'} },
    { id: 'p3-8', partnerId: 'artistic-touch-decor', src: "https://i.imgur.com/mR3e5OF.jpeg", alt: "Geometric wall sculpture", title: {ar: "منحوتة جدارية هندسية", en: "Geometric Wall Sculpture"}, category: {ar: 'منحوتات جدارية', en: 'Wall Sculptures'} },
    { id: 'p3-9', partnerId: 'artistic-touch-decor', src: "https://i.imgur.com/rN9yUaM.jpeg", alt: "Nature inspired wall sculpture", title: {ar: "منحوتة مستوحاة من الطبيعة", en: "Nature Inspired Sculpture"}, category: {ar: 'منحوتات جدارية', en: 'Wall Sculptures'} },

    // Design Hub - Canvas Paintings
    { id: 'p2-5', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1579965342575-5fab2a4d6893?q=80&w=1964&auto=format&fit=crop", alt: "Abstract canvas painting", title: {ar: "لوحة كانفس تجريدية", en: "Abstract Canvas Painting"}, category: {ar: 'لوحات كانفس', en: 'Canvas Paintings'} },
    { id: 'p2-6', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1549492423-400259a5e5a9?q=80&w=2070&auto=format&fit=crop", alt: "Modern art canvas", title: {ar: "لوحة فنية عصرية", en: "Modern Art Canvas"}, category: {ar: 'لوحات كانفس', en: 'Canvas Paintings'} },
    { id: 'p2-7', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1531816434952-fb843331c1a3?q=80&w=1974&auto=format&fit=crop", alt: "Minimalist canvas painting", title: {ar: "لوحة كانفس بسيطة", en: "Minimalist Canvas Painting"}, category: {ar: 'لوحات كانفس', en: 'Canvas Paintings'} },
    { id: 'p2-8', partnerId: 'design-hub', src: "https://images.unsplash.com/photo-1552573102-2b4f3a61b3c4?q=80&w=1974&auto=format&fit=crop", alt: "Colorful abstract art", title: {ar: "فن تجريدي ملون", en: "Colorful Abstract Art"}, category: {ar: 'لوحات كانفس', en: 'Canvas Paintings'} },

    // Ebdaa - Antiques & Decor
    { id: 'p4-5', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1542641197-cdc1de658234?q=80&w=1974&auto=format&fit=crop", alt: "Vintage decorative items", title: {ar: "قطع ديكور كلاسيكية", en: "Vintage Decorative Items"}, category: {ar: 'تحف وديكورات', en: 'Antiques & Decor'} },
    { id: 'p4-6', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1555864324-343d3d548f22?q=80&w=1974&auto=format&fit=crop", alt: "Elegant vase", title: {ar: "مزهرية أنيقة", en: "Elegant Vase"}, category: {ar: 'تحف وديكورات', en: 'Antiques & Decor'} },
    { id: 'p4-7', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1594951351419-61a7a4297858?q=80&w=1974&auto=format&fit=crop", alt: "Modern sculpture decor piece", title: {ar: "قطعة ديكور منحوتة عصرية", en: "Modern Sculpture Decor Piece"}, category: {ar: 'تحف وديكورات', en: 'Antiques & Decor'} },
    { id: 'p4-8', partnerId: 'ebdaa-integrated-finishes', src: "https://images.unsplash.com/photo-1617099222329-847d3c0b021a?q=80&w=1964&auto=format&fit=crop", alt: "Set of decorative vases", title: {ar: "مجموعة مزهريات ديكورية", en: "Set of Decorative Vases"}, category: {ar: 'تحف وديكورات', en: 'Antiques & Decor'} }
];