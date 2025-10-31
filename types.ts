export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface PropertyInstallments {
  downPayment: number;
  monthlyInstallment: number;
  years: number;
}

export interface PropertyDelivery {
  isImmediate: boolean;
  date?: string; // YYYY-MM
}

export interface Property {
  id: string;
  partnerId: string;
  partnerName?: string;
  partnerImageUrl?: string;
  imageUrl: string;
  gallery: string[];
  status: {
    ar: 'للبيع' | 'إيجار';
    en: 'For Sale' | 'For Rent';
  };
  price: {
    ar: string;
    en: string;
  };
  priceNumeric: number;
  type: {
    ar: 'فيلا' | 'شقة' | 'تجاري' | 'أرض';
    en: 'Villa' | 'Apartment' | 'Commercial' | 'Land';
  };
  title: {
    ar: string;
    en: string;
  };
  address: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  beds: number;
  baths: number;
  area: number;
  floor?: number;
  amenities: {
    ar: string[];
    en: string[];
  };
  finishingStatus?: {
    ar: 'تشطيب كامل' | 'نصف تشطيب' | 'سوبر لوكس' | 'تشطيب فاخر' | 'مفروشة بالكامل' | 'بدون تشطيب';
    en: 'Fully Finished' | 'Semi-finished' | 'Super Lux' | 'Luxury Finishing' | 'Fully Furnished' | 'Without Finishing';
  };
  installmentsAvailable: boolean;
  installments?: PropertyInstallments;
  delivery?: PropertyDelivery;
  isInCompound?: boolean;
  location: {
    lat: number;
    lng: number;
  };
  listingStartDate?: string; // YYYY-MM-DD
  listingEndDate?: string; // YYYY-MM-DD
}

export interface PortfolioItem {
    id: string;
    partnerId: string;
    src: string;
    alt: string;
    title: {
        ar: string;
        en: string;
    };
    category: {
        ar: string;
        en: string;
    };
}

export interface DecorationCategory {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
}

export type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'completed' | 'cancelled';

export interface Lead {
    id: string;
    partnerId: string;
    customerName: string;
    customerPhone: string;
    customerNotes: string;
    contactTime: string;
    serviceTitle: string;
    status: LeadStatus;
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
    internalNotes?: string;
}

export type PartnerStatus = 'active' | 'pending' | 'disabled';

export interface Partner {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    email: string;
    password?: string;
    type: 'developer' | 'finishing' | 'agency' | 'admin' | 'decorations';
    status: PartnerStatus;
}

export interface AdminPartner extends Partner {
    nameAr?: string;
    descriptionAr?: string;
}

export interface Quote {
    quote: {
        ar: string;
        en: string;
    };
    author: {
        ar: string;
        en: string;
    };
}

export type RequestStatus = 'pending' | 'reviewed' | 'closed' | 'approved' | 'rejected';

export interface AddPropertyRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    images?: string[];
    propertyDetails: {
        purpose: { ar: 'للبيع' | 'إيجار'; en: 'For Sale' | 'For Rent' };
        propertyType: {
            ar: 'شقة' | 'فيلا' | 'تجاري' | 'أرض';
            en: 'Apartment' | 'Villa' | 'Commercial' | 'Land';
        };
        finishingStatus: {
            ar: 'تشطيب كامل' | 'نصف تشطيب' | 'بدون تشطيب' | 'سوبر لوكس' | 'تشطيب فاخر' | 'مفروشة بالكامل';
            en: 'Fully Finished' | 'Semi-finished' | 'Without Finishing' | 'Super Lux' | 'Luxury Finishing' | 'Fully Furnished';
        };
        area: number;
        price: number;
        bedrooms?: number;
        bathrooms?: number;
        floor?: number;
        address: string;
        description: string;
        isInCompound: boolean;
        deliveryType: 'immediate' | 'future';
        deliveryMonth?: string;
        deliveryYear?: string;
        hasInstallments: boolean;
        downPayment?: number;
        monthlyInstallment?: number;
        years?: number;
        listingStartDate?: string;
        listingEndDate?: string;
    };
    status: RequestStatus;
    createdAt: string;
}

export interface ContactRequest {
    id: string;
    name: string;
    phone: string;
    contactTime: string;
    message: string;
    status: RequestStatus;
    createdAt: string;
    inquiryType: 'client' | 'partner';
    companyName?: string;
    businessType?: string;
}

// New types for detailed partner registration
export interface ManagementContact {
    name: string;
    position: string;
    email: string;
    phone: string;
}

export interface OfficialDocument {
    fileName: string;
    fileContent: string; // base64
}

export interface PartnerRequest {
    id: string;
    
    // Company Info
    companyName: string;
    companyType: 'developer' | 'finishing' | 'agency';
    companyAddress: string;
    website?: string;
    description: string;
    logo: string; // base64

    // Primary Contact
    contactName: string;
    contactEmail: string;
    contactPhone: string;

    // Management
    managementContacts: ManagementContact[];

    // Documents
    documents: OfficialDocument[];

    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // ISO 8601
}