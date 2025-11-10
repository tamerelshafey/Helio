
// Basic types
export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type AllTranslations = {
    [key in Language]: any;
};
export type RequestStatus = 'pending' | 'reviewed' | 'closed' | 'approved' | 'rejected' | 'new';
export type LeadStatus = 'new' | 'contacted' | 'site-visit' | 'quoted' | 'in-progress' | 'completed' | 'cancelled';

// Enums from permissions and roles
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
}

// Partner and User types
export type PartnerType = 'developer' | 'finishing' | 'agency' | 'admin' | 'service_manager' | 'customer_relations_manager' | 'listings_manager' | 'partner_relations_manager' | 'content_manager';
export type PartnerStatus = 'active' | 'pending' | 'disabled';
export type SubscriptionPlan = 'basic' | 'professional' | 'elite' | 'commission' | 'paid_listing';
export type PlanCategory = 'developer' | 'agency' | 'finishing' | 'individual';
export type PartnerDisplayType = 'mega_project' | 'featured' | 'standard';

export interface SubscriptionPlanDetails {
  name: string;
  price: string;
  description: string;
  features: string[];
  commissionRate?: number;
}

export interface Partner {
  id: string;
  name: string;
  description: string;
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

export interface AdminPartner extends Partner {
    nameAr: string;
    descriptionAr: string;
}

export interface PartnerTranslations {
    [key: string]: {
        name: string;
        description: string;
    }
}

// Property and Project types
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
    type: { [key in Language]: string; en: 'Apartment' | 'Villa' | 'Commercial' | 'Land' };
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

// Portfolio and Decoration types
export interface PortfolioItem {
    id: string;
    partnerId: string;
    imageUrl: string;
    alt: string;
    title: { [key in Language]: string };
    category: { [key in Language]: string; en: string; ar: string; };
    price?: number;
    dimensions?: string;
    availability?: 'In Stock' | 'Made to Order';
}

export interface DecorationCategory {
    id: string;
    name: { [key in Language]: string, en: string, ar: string };
    description: { [key in Language]: string };
}

// Requests and Leads
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

// Site content types
export interface Quote {
    quote: { [key in Language]: string };
    author: { [key in Language]: string };
}

export interface SiteContent {
  logoUrl: string;
  locationPickerMapUrl: string;
  hero: {
    [key in Language]: { title: string; subtitle: string; };
  } & {
    images: { src: string; src_large: string; src_small: string; src_medium: string; }[];
    imageAlts: { [key in Language]: string[] };
  };
  whyUs: {
    [key in Language]: {
        title: string;
        description: string;
        features: { title: string; description: string; }[];
    };
  };
  services: {
    [key in Language]: {
        title: string;
        description: string;
        features: { title: string; description: string; link: string; icon: string; }[];
    };
  };
  partners: { [key in Language]: any; };
  whyNewHeliopolis: {
    [key in Language]: {
        title: string;
        location: {
            title: string;
            description: string;
            stats: { value: string; desc: string; }[];
        };
    };
  } & {
    images: { src: string; alt: string }[];
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
    [key in Language]: { description: string; address: string; hours: string; };
  } & {
    phone: string;
    email: string;
    social: { facebook: string; twitter: string; instagram: string; linkedin: string; };
  };
}

// Filter Options
export interface FilterOption {
    id: string;
    en: string;
    ar: string;
    applicableTo?: string[];
}

// Banners
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

// Notifications
export interface Notification {
    id: string;
    userId: string;
    message: { [key in Language]: string };
    link: string;
    isRead: boolean;
    createdAt: string;
}

// AI Estimator
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

export interface AIEstimatorOption {
    key: string;
    en: string;
    ar: string;
}

export interface AIEstimatorConfig {
    model: string;
    prompt: string;
    stages?: AIEstimatorStage[];
    options?: {
        flooring: AIEstimatorOption[];
        walls: AIEstimatorOption[];
        ceiling: AIEstimatorOption[];
        electrical: AIEstimatorOption[];
        plumbing: AIEstimatorOption[];
    };
}
