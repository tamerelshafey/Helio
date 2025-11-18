
// ==================================================================
//                             Core Types
// ==================================================================

/** Defines the supported languages for the application. */
export type Language = 'ar' | 'en';

/** Defines the supported themes for the application. */
export type Theme = 'light' | 'dark';

/** A generic type for translation objects. */
export type AllTranslations = {
    [key in Language]: any;
};

// FIX: Add RequestType enum for new unified request system.
export enum RequestType {
    LEAD = 'LEAD',
    PARTNER_APPLICATION = 'PARTNER_APPLICATION',
    PROPERTY_LISTING_REQUEST = 'PROPERTY_LISTING_REQUEST',
    CONTACT_MESSAGE = 'CONTACT_MESSAGE',
    PROPERTY_INQUIRY = 'PROPERTY_INQUIRY',
}

// ==================================================================
//                         Enums & Statuses
// ==================================================================

/** Status for various requests (partners, properties, contacts). */
// FIX: Add 'assigned' and 'in-progress' to handle statuses from the unified requests page.
export type RequestStatus = 'new' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'closed' | 'assigned' | 'in-progress';

/** Status for customer leads throughout their lifecycle. */
export type LeadStatus = 'new' | 'contacted' | 'site-visit' | 'quoted' | 'in-progress' | 'completed' | 'cancelled';

/** Status for a property listing on the platform. */
export type ListingStatus = 'active' | 'inactive' | 'draft' | 'sold';

/** Status of a partner's account. */
export type PartnerStatus = 'active' | 'pending' | 'disabled';

/** Defines how a partner is displayed on the site (e.g., featured). */
export type PartnerDisplayType = 'mega_project' | 'featured' | 'standard';

// ==================================================================
//                         Roles & Permissions
// ==================================================================

/** Defines the access control roles within the system. */
export enum Role {
    SUPER_ADMIN = 'admin',
    DEVELOPER_PARTNER = 'developer',
    FINISHING_PARTNER = 'finishing',
    AGENCY_PARTNER = 'agency',
    SERVICE_MANAGER = 'service_manager',
    CUSTOMER_RELATIONS_MANAGER = 'customer_relations_manager',
    LISTINGS_MANAGER = 'listings_manager',
    PARTNER_RELATIONS_MANAGER = 'partner_relations_manager',
    CONTENT_MANAGER = 'content_manager',
}

/** Represents the business type of an external partner account. */
export type BusinessPartnerType = 'developer' | 'finishing' | 'agency';

/** Represents the type of an internal system user account. */
export type InternalUserType =
    | 'admin'
    | 'service_manager'
    | 'customer_relations_manager'
    | 'listings_manager'
    | 'partner_relations_manager'
    | 'content_manager';

/** Union of all user/partner types in the system. */
export type PartnerType = BusinessPartnerType | InternalUserType;

/** Defines all possible permissions for actions within the system. */
export enum Permission {
    VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
    VIEW_PARTNER_DASHBOARD = 'VIEW_PARTNER_DASHBOARD',
    MANAGE_OWN_PROFILE = 'MANAGE_OWN_PROFILE',
    MANAGE_OWN_PROJECTS = 'MANAGE_OWN_PROJECTS',
    MANAGE_OWN_PROPERTIES = 'MANAGE_OWN_PROPERTIES',
    MANAGE_OWN_PORTFOLIO = 'MANAGE_OWN_PORTFOLIO',
    VIEW_OWN_LEADS = 'VIEW_OWN_LEADS',
    MANAGE_OWN_SUBSCRIPTION = 'MANAGE_OWN_SUBSCRIPTION',
    VIEW_ANALYTICS = 'VIEW_ANALYTICS',
    MANAGE_PARTNER_REQUESTS = 'MANAGE_PARTNER_REQUESTS',
    MANAGE_PROPERTY_REQUESTS = 'MANAGE_PROPERTY_REQUESTS',
    MANAGE_FINISHING_LEADS = 'MANAGE_FINISHING_LEADS',
    MANAGE_DECORATIONS_LEADS = 'MANAGE_DECORATIONS_LEADS',
    MANAGE_PROPERTY_INQUIRIES = 'MANAGE_PROPERTY_INQUIRIES',
    MANAGE_CONTACT_REQUESTS = 'MANAGE_CONTACT_REQUESTS',
    MANAGE_ALL_PARTNERS = 'MANAGE_ALL_PARTNERS',
    MANAGE_ALL_PROJECTS = 'MANAGE_ALL_PROJECTS',
    MANAGE_ALL_PROPERTIES = 'MANAGE_ALL_PROPERTIES',
    MANAGE_ALL_LEADS = 'MANAGE_ALL_LEADS',
    MANAGE_DECORATIONS_CONTENT = 'MANAGE_DECORATIONS_CONTENT',
    MANAGE_BANNERS = 'MANAGE_BANNERS',
    MANAGE_SITE_CONTENT = 'MANAGE_SITE_CONTENT',
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_ROLES_PERMISSIONS = 'MANAGE_ROLES_PERMISSIONS',
    MANAGE_PLANS = 'MANAGE_PLANS',
    MANAGE_FILTERS = 'MANAGE_FILTERS',
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    MANAGE_INQUIRY_ROUTING = 'MANAGE_INQUIRY_ROUTING',
    MANAGE_AUTOMATION = 'MANAGE_AUTOMATION',
}

// ==================================================================
//                       Users & Partners
// ==================================================================

export type SubscriptionPlan = 'basic' | 'professional' | 'elite' | 'commission' | 'paid_listing';
export type PlanCategory = 'developer' | 'agency' | 'finishing' | 'individual';

export interface SubscriptionPlanDetails {
    name: string;
    price: string;
    description: string;
    features: string[];
    commissionRate?: number;
}

/** Base interface for all user/partner accounts in the system. */
export interface Partner {
    id: string;
    name: string; // The English name, used as a fallback
    description: string; // The English description
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    email: string;
    password?: string;
    type: PartnerType;
    status: PartnerStatus;
    role: Role;
    subscriptionPlan: SubscriptionPlan;
    subscriptionEndDate?: string;
    displayType: PartnerDisplayType;
    contactMethods?: {
        whatsapp: { enabled: boolean; number: string };
        phone: { enabled: boolean; number: string };
        form: { enabled: boolean };
    };
}

/** Extended Partner interface for admin contexts, including Arabic translations. */
export interface AdminPartner extends Partner {
    nameAr: string;
    descriptionAr: string;
}

/** Describes the structure for partner translation objects. */
export interface PartnerTranslations {
    [key: string]: {
        name: string;
        description: string;
    };
}

// ==================================================================
//                       Properties & Projects
// ==================================================================

export interface FavoriteItem {
  id: string;
  type: 'property' | 'service' | 'portfolio';
}


export interface PropertyFiltersType {
    status: string;
    type: string;
    query: string;
    minPrice: string;
    maxPrice: string;
    project: string;
    finishing: string;
    installments: string;
    realEstateFinance: string;
    floor: string;
    compound: string;
    delivery: string;
    amenities: string[];
    beds: string;
    baths: string;
}

export interface Property {
    id: string;
    partnerId: string;
    partnerName?: string;
    partnerImageUrl?: string;
    projectId?: string;
    projectName?: { [key in Language]: string };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    gallery: string[];
    status: { [key in Language]: 'For Sale' | 'For Rent' | 'للبيع' | 'إيجار' };
    price: { [key in Language]: string };
    priceNumeric: number;
    pricePerMeter?: { [key in Language]: string };
    type: { ar: string; en: 'Apartment' | 'Villa' | 'Commercial' | 'Land' };
    title: { [key in Language]: string };
    address: { [key in Language]: string };
    description: { [key in Language]: string };
    beds: number;
    baths: number;
    area: number;
    floor?: number;
    amenities: { [key in Language]: string[] };
    finishingStatus?: { [key in Language]: string };
    installmentsAvailable?: boolean;
    isInCompound: boolean;
    realEstateFinanceAvailable?: boolean;
    delivery: { isImmediate: boolean; date?: string };
    installments?: { downPayment: number; monthlyInstallment: number; years: number };
    location: { lat: number; lng: number };
    listingStartDate?: string;
    listingEndDate?: string;
    listingStatus: ListingStatus;
    contactMethod?: 'platform' | 'direct';
    ownerPhone?: string;
}

export interface Project {
    id: string;
    partnerId: string;
    name: { [key in Language]: string };
    description: { [key in Language]: string };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    createdAt: string;
    features: {
        icon: string;
        text: { [key in Language]: string };
    }[];
}

// ==================================================================
//                    Portfolio & Decorations
// ==================================================================

export interface PortfolioItem {
    id: string;
    partnerId: string;
    imageUrl: string;
    alt: string;
    title: { [key in Language]: string };
    category: { [key in Language]: string };
    price?: number;
    dimensions?: string;
    availability?: 'In Stock' | 'Made to Order';
}

export interface DecorationCategory {
    id: string;
    name: { [key in Language]: string };
    description: { [key in Language]: string };
}

// ==================================================================
//                         Requests & Leads
// ==================================================================

// FIX: Add a generic Request interface for the unified request system.
export interface Request {
    id: string;
    type: RequestType;
    requesterInfo: {
        name: string;
        phone: string;
        email?: string;
    };
    payload: any;
    status: RequestStatus;
    assignedTo?: string; // managerId
    createdAt: string;
    updatedAt?: string;
}

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
    companyName: string;
    companyType: PartnerType;
    companyAddress: string;
    website?: string;
    description: string;
    logo: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    managementContacts: ManagementContact[];
    documents: OfficialDocument[];
    subscriptionPlan: SubscriptionPlan;
    status: RequestStatus;
    createdAt: string;
}

export interface AddPropertyRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    cooperationType: 'paid_listing' | 'commission';
    propertyDetails: {
        purpose: { en: 'For Sale' | 'For Rent'; ar: 'للبيع' | 'إيجار' };
        propertyType: FilterOption;
        finishingStatus: FilterOption;
        area: number;
        price: number;
        bedrooms?: number;
        bathrooms?: number;
        floor?: number;
        address: string;
        description: string;
        location: { lat: number; lng: number };
        isInCompound: boolean;
        deliveryType: 'immediate' | 'future';
        deliveryMonth?: string;
        deliveryYear?: string;
        hasInstallments: boolean;
        realEstateFinanceAvailable: boolean;
        downPayment?: number;
        monthlyInstallment?: number;
        years?: number;
        listingStartDate?: string;
        listingEndDate?: string;
        contactMethod: 'platform' | 'direct';
        ownerPhone?: string;
    };
    images: string[]; // base64
    status: RequestStatus;
    createdAt: string;
    managerId: string;
}

export interface ContactRequest {
    id: string;
    name: string;
    phone: string;
    contactTime: string;
    message: string;
    inquiryType: 'client' | 'partner';
    companyName?: string;
    businessType?: PartnerType;
    status: RequestStatus;
    createdAt: string;
    managerId: string;
}

export interface PropertyInquiryRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    details: string;
    status: RequestStatus;
    createdAt: string;
}

export interface LeadMessage {
    id: string;
    sender: 'client' | 'partner' | 'admin' | 'system';
    senderId?: string; // ID of partner/admin if applicable
    type: 'message' | 'note';
    content: string;
    timestamp: string;
}

export interface Lead {
    id: string;
    partnerId: string;
    partnerName?: string;
    managerId?: string;
    propertyId?: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    serviceTitle: string;
    customerNotes?: string;
    status: LeadStatus;
    createdAt: string;
    updatedAt: string;
    serviceType?: 'finishing' | 'decorations' | 'property';
    assignedTo?: string; // partnerId or 'internal-team'
    messages: LeadMessage[];
}

// ==================================================================
//                          Site Content
// ==================================================================

export interface Quote {
    quote: { [key in Language]: string };
    author: { [key in Language]: string };
}

export interface SiteContent {
    logoUrl: string;
    locationPickerMapUrl: string;
    hero: {
        images: {
            src: string;
            alt: { [key in Language]: string };
        }[];
    } & {
        [key in Language]: { title: string; subtitle: string };
    };
    whyUs: {
        enabled: boolean;
    } & {
        [key in Language]: {
            title: string;
            description: string;
            features: { title: string; description: string }[];
        };
    };
    services: {
        enabled: boolean;
    } & {
        [key in Language]: {
            title: string;
            description: string;
            features: { title: string; description: string; link: string; icon: string }[];
        };
    };
    partners: {
        enabled: boolean;
    } & {
        [key in Language]: any;
    };
    testimonials: {
        enabled: boolean;
        items: {
            quote: { [key in Language]: string };
            author: { [key in Language]: string };
            location: { [key in Language]: string };
        }[];
    } & {
        [key in Language]: {
            title: string;
            subtitle: string;
        };
    };
    socialProof: {
        enabled: boolean;
        stats: {
            value: string;
            name: { [key in Language]: string };
        }[];
    };
    whyNewHeliopolis: {
        enabled: boolean;
        images: { src: string; alt: { [key in Language]: string } }[];
    } & {
        [key in Language]: {
            title: string;
            location: {
                title: string;
                description: string;
                stats: { value: string; desc: string }[];
            };
        };
    };
    projectsPage: {
        [key in Language]: { title: string; subtitle: string };
    };
    finishingPage: {
         [key in Language]: {
            heroTitle: string;
            heroSubtitle: string;
            servicesTitle: string;
            servicesSubtitle: string;
            servicesIntro: string;
            partnerCompaniesTitle: string;
            partnerCompaniesSubtitle: string;
            serviceProvidersTitle: string;
            serviceProvidersSubtitle: string;
            ctaTitle: string;
            ctaSubtitle: string;
            ctaButton: string;
        };
    };
    decorationsPage: {
         [key in Language]: {
            heroTitle: string;
            heroSubtitle: string;
            sculptures_desc: string;
            paintings_desc: string;
            antiques_desc: string;
         };
    };
    finishingServices: {
        title: { [key in Language]: string };
        description: { [key in Language]: string };
        price?: number;
        pricingTiers?: {
            unitType: { [key in Language]: string };
            areaRange: { [key in Language]: string };
            price: number;
        }[];
    }[];
    quotes: Quote[];
    footer: {
        [key in Language]: { description: string; address: string; hours: string };
    } & {
        phone: string;
        email: string;
        social: { facebook: string; twitter: string; instagram: string; linkedin: string };
    };
}

// ==================================================================
//                      Configuration & Filters
// ==================================================================

/** Represents a filterable option, like property type or amenity. */
export interface FilterOption {
    id: string;
    en: string;
    ar: string;
    applicableTo?: string[];
}

/** Represents a banner for display on various pages. */
export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    link: string;
    locations: ('home' | 'properties' | 'details' | 'finishing' | 'decorations')[];
    status: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
}

/** Represents a user notification. */
export interface Notification {
    id: string;
    userId: string;
    message: { [key in Language]: string };
    link: string;
    isRead: boolean;
    createdAt: string;
}

// FIX: Add missing AI Estimator types.
// ==================================================================
//                            AI Estimator
// ==================================================================

export interface AIEstimatorOption {
    key: string;
    en: string;
    ar: string;
}

export interface AIEstimatorItem {
    id: string;
    name: { [key in Language]: string };
    unit: { [key in Language]: string };
    price: number;
}

export interface AIEstimatorStage {
    id: string;
    name: { [key in Language]: string };
    basicItems: AIEstimatorItem[];
    optionalItems: AIEstimatorItem[];
}

export interface AIEstimatorConfig {
    model: string;
    prompt: string;
    options: {
        [key: string]: AIEstimatorOption[];
    };
    stages: AIEstimatorStage[];
}
