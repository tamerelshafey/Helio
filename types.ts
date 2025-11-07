

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface Translatable {
  ar: string;
  en: string;
}

// --- Enums ---

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEVELOPER_PARTNER = 'DEVELOPER_PARTNER',
  FINISHING_PARTNER = 'FINISHING_PARTNER',
  AGENCY_PARTNER = 'AGENCY_PARTNER',
  // Refined & New Admin Roles
  SERVICE_MANAGER = 'SERVICE_MANAGER', // Manages Finishing & Decorations
  CUSTOMER_RELATIONS_MANAGER = 'CUSTOMER_RELATIONS_MANAGER', // Manages individual requests
  LISTINGS_MANAGER = 'LISTINGS_MANAGER',
  PARTNER_RELATIONS_MANAGER = 'PARTNER_RELATIONS_MANAGER',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
}

export enum Permission {
  // Admin Permissions
  VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES_PERMISSIONS = 'MANAGE_ROLES_PERMISSIONS',
  MANAGE_ALL_PARTNERS = 'MANAGE_ALL_PARTNERS',
  MANAGE_ALL_PROPERTIES = 'MANAGE_ALL_PROPERTIES',
  MANAGE_ALL_PROJECTS = 'MANAGE_ALL_PROJECTS',
  MANAGE_ALL_LEADS = 'MANAGE_ALL_LEADS',
  MANAGE_PARTNER_REQUESTS = 'MANAGE_PARTNER_REQUESTS',
  MANAGE_PROPERTY_REQUESTS = 'MANAGE_PROPERTY_REQUESTS',
  MANAGE_CONTACT_REQUESTS = 'MANAGE_CONTACT_REQUESTS',
  MANAGE_PROPERTY_INQUIRIES = 'MANAGE_PROPERTY_INQUIRIES',
  MANAGE_FINISHING_LEADS = 'MANAGE_FINISHING_LEADS',
  MANAGE_DECORATIONS_CONTENT = 'MANAGE_DECORATIONS_CONTENT',
  MANAGE_DECORATIONS_LEADS = 'MANAGE_DECORATIONS_LEADS',
  MANAGE_PLANS = 'MANAGE_PLANS',
  MANAGE_FILTERS = 'MANAGE_FILTERS',
  MANAGE_BANNERS = 'MANAGE_BANNERS',
  MANAGE_SITE_CONTENT = 'MANAGE_SITE_CONTENT',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',

  // Partner Permissions
  VIEW_PARTNER_DASHBOARD = 'VIEW_PARTNER_DASHBOARD',
  MANAGE_OWN_PROFILE = 'MANAGE_OWN_PROFILE',
  MANAGE_OWN_PROJECTS = 'MANAGE_OWN_PROJECTS',
  MANAGE_OWN_PROPERTIES = 'MANAGE_OWN_PROPERTIES',
  MANAGE_OWN_PORTFOLIO = 'MANAGE_OWN_PORTFOLIO',
  VIEW_OWN_LEADS = 'VIEW_OWN_LEADS',
  MANAGE_OWN_SUBSCRIPTION = 'MANAGE_OWN_SUBSCRIPTION',
}


// --- Models & Data Structures ---

export type PartnerType = 'developer' | 'finishing' | 'agency' | 'admin' | 'service_manager' | 'customer_relations_manager' | 'listings_manager' | 'partner_relations_manager' | 'content_manager';
export type PartnerStatus = 'active' | 'pending' | 'disabled';
export type PlanCategory = 'developer' | 'agency' | 'finishing' | 'individual';
export type SubscriptionPlan = 'basic' | 'professional' | 'elite' | 'commission' | 'paid_listing';
export type PartnerDisplayType = 'mega_project' | 'featured' | 'standard';

export interface Partner {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageUrl_small?: string;
  imageUrl_medium?: string;
  imageUrl_large?: string;
  email: string;
  password?: string; // Should not be sent to client
  type: PartnerType;
  status: PartnerStatus;
  role: Role;
  subscriptionPlan: SubscriptionPlan;
  subscriptionEndDate?: string;
  displayType: PartnerDisplayType;
  contactMethods?: {
    whatsapp: { enabled: boolean; number: string; };
    phone: { enabled: boolean; number: string; };
    form: { enabled: boolean; };
  };
}

export interface AdminPartner extends Partner {
    nameAr: string;
    descriptionAr: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: Role;
    avatarUrl?: string;
}

export interface Property {
  id: string;
  partnerId: string;
  projectId?: string;
  imageUrl: string;
  imageUrl_small?: string;
  imageUrl_medium?: string;
  imageUrl_large?: string;
  gallery: string[];
  status: Translatable;
  price: Translatable;
  priceNumeric: number;
  pricePerMeter?: Translatable;
  type: Translatable;
  title: Translatable;
  address: Translatable;
  description: Translatable;
  beds: number;
  baths: number;
  area: number;
  floor?: number;
  amenities: {
    ar: string[];
    en: string[];
  };
  finishingStatus?: Translatable;
  installmentsAvailable?: boolean;
  isInCompound?: boolean;
  realEstateFinanceAvailable?: boolean;
  delivery?: {
    isImmediate: boolean;
    date?: string; // YYYY-MM
  };
  installments?: {
    downPayment: number;
    monthlyInstallment: number;
    years: number;
  };
  location: {
    lat: number;
    lng: number;
  };
  listingStartDate?: string;
  listingEndDate?: string;
  partnerName?: string;
  partnerImageUrl?: string;
  contactMethod?: 'platform' | 'direct';
  ownerPhone?: string;
}

export interface Project {
  id: string;
  partnerId: string;
  name: Translatable;
  description: Translatable;
  imageUrl: string;
  imageUrl_small?: string;
  imageUrl_medium?: string;
  imageUrl_large?: string;
  createdAt: string;
  features: {
    icon: string;
    text: Translatable;
  }[];
}

export interface PortfolioItem {
  id: string;
  partnerId: string;
  imageUrl: string;
  alt: string;
  title: Translatable;
  category: Translatable;
  price?: number;
  dimensions?: string;
  availability?: 'In Stock' | 'Made to Order';
}

export interface DecorationCategory {
    id: string;
    name: Translatable;
    description: Translatable;
}

export type LeadStatus = 'new' | 'contacted' | 'site-visit' | 'quoted' | 'in-progress' | 'completed' | 'cancelled';

export interface LeadMessage {
  id: string;
  sender: 'partner' | 'admin' | 'client' | 'system';
  senderId?: string; // a partnerId or userId
  type: 'message' | 'note';
  content: string;
  timestamp: string;
}

export interface Lead {
    id: string;
    partnerId: string;
    managerId?: string;
    serviceType?: 'property' | 'finishing' | 'decorations';
    propertyId?: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    serviceTitle: string;
    customerNotes: string;
    status: LeadStatus;
    createdAt: string;
    updatedAt: string;
    messages: LeadMessage[];
    partnerName?: string;
    assignedTo?: string; // 'internal-team' or partnerId
}

export interface Notification {
    id: string;
    userId: string;
    message: Translatable;
    link: string;
    isRead: boolean;
    createdAt: string;
}

export interface FilterOption {
    id: string;
    en: string;
    ar: string;
    applicableTo?: string[];
}

export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    link?: string;
    locations: ('home' | 'properties' | 'details' | 'finishing' | 'decorations')[];
    status: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
}

// --- Requests ---

export type RequestStatus = 'pending' | 'reviewed' | 'closed' | 'approved' | 'rejected' | 'new';

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
    businessType?: PartnerType;
    managerId?: string;
}

export interface PropertyInquiryRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    details: string;
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
}

export interface AddPropertyRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    cooperationType: 'paid_listing' | 'commission';
    propertyDetails: {
        purpose: Translatable;
        propertyType: Translatable;
        finishingStatus: Translatable;
        area: number;
        price: number;
        bedrooms?: number;
        bathrooms?: number;
        floor?: number;
        address: string;
        description: string;
        location: { lat: number, lng: number };
        isInCompound: boolean;
        deliveryType: 'immediate' | 'future';
        deliveryMonth?: string;
        deliveryYear?: string;
        hasInstallments: boolean;
        realEstateFinanceAvailable?: boolean;
        downPayment?: number;
        monthlyInstallment?: number;
        years?: number;
        listingStartDate?: string;
        listingEndDate?: string;
        contactMethod: 'platform' | 'direct';
        ownerPhone?: string;
    };
    images: string[];
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
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
    logo: string; // base64
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    managementContacts: ManagementContact[];
    documents: OfficialDocument[];
    status: RequestStatus;
    createdAt: string;
    subscriptionPlan: SubscriptionPlan;
    managerId?: string;
}


// --- AI Estimator ---

export interface AIEstimatorOption {
    key: string;
    en: string;
    ar: string;
}

export interface AIEstimatorConfig {
    prompt: string;
    model: string;
    options: {
        flooring: AIEstimatorOption[];
        walls: AIEstimatorOption[];
        ceiling: AIEstimatorOption[];
        electrical: AIEstimatorOption[];
        plumbing: AIEstimatorOption[];
    };
}


// --- Content Management ---

export interface Quote {
    quote: Translatable;
    author: Translatable;
}

export interface SubscriptionPlanDetails {
    name: string;
    price: string;
    description: string;
    features: string[];
    commissionRate?: number;
}

export interface SiteContent {
  logoUrl: string;
  locationPickerMapUrl: string;
  hero: {
    ar: { title: string; subtitle: string; };
    en: { title: string; subtitle: string; };
    images: string[];
  };
  whyUs: { ar: { title: string; description: string; features: { title: string; description: string; }[]; }; en: { title: string; description: string; features: { title: string; description: string; }[]; }; };
  services: { ar: { title: string; description: string; features: { title: string; description: string; link: string; icon: string; }[]; }; en: { title: string; description: string; features: { title: string; description: string; link: string; icon: string; }[]; }; };
  // FIX: Added missing partner category titles to the SiteContent interface.
  partners: {
    ar: {
      title: string;
      description: string;
      mega_projects_title: string;
      developers_title: string;
      finishing_companies_title: string;
      agencies_title: string;
    };
    en: {
      title: string;
      description: string;
      mega_projects_title: string;
      developers_title: string;
      finishing_companies_title: string;
      agencies_title: string;
    };
  };
  whyNewHeliopolis: {
    ar: { title: string; location: { title: string; description: string; stats: { value: string; desc: string; }[]; }; };
    en: { title: string; location: { title: string; description: string; stats: { value: string; desc: string; }[]; }; };
    images: { src: string; alt: string; }[];
  };
  finishingServices: {
    title: Translatable;
    description: Translatable;
    price?: number;
    pricingTiers?: {
        unitType: Translatable;
        areaRange: Translatable;
        price: number;
    }[];
  }[];
  quotes: Quote[];
  footer: {
    ar: { description: string; address: string; hours?: string; };
    en: { description: string; address: string; hours?: string; };
    phone: string;
    email: string;
    social: { facebook: string; twitter: string; instagram: string; linkedin: string; };
  };
}