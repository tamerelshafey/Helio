import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Import all data types
import type { 
    Property, 
    Partner, 
    AdminPartner,
    PortfolioItem, 
    Lead, 
    ContactRequest, 
    AddPropertyRequest, 
    PartnerRequest, 
    PartnerStatus,
    LeadStatus,
    RequestStatus,
    DecorationCategory
} from '../../types';

// Import all API functions
import { getAllProperties, addProperty as apiAddProperty, updateProperty as apiUpdateProperty, deleteProperty as apiDeleteProperty } from '../../api/properties';
import { getAllPartnersForAdmin, updatePartner as apiUpdatePartner, updatePartnerStatus as apiUpdatePartnerStatus, addPartner as apiAddPartner } from '../../api/partners';
import { getAllPortfolioItems, addPortfolioItem as apiAddPortfolioItem, deletePortfolioItem as apiDeletePortfolioItem, updatePortfolioItem as apiUpdatePortfolioItem } from '../../api/portfolio';
import { getAllLeads, updateLeadStatus as apiUpdateLeadStatus, deleteLead as apiDeleteLead, updateLeadNotes as apiUpdateLeadNotes } from '../../api/leads';
import { getAllContactRequests, addContactRequest as apiAddContactRequest, updateContactRequestStatus as apiUpdateContactRequestStatus, deleteContactRequest as apiDeleteContactRequest } from '../../api/contactRequests';
import { getAllPropertyRequests, updatePropertyRequestStatus as apiUpdatePropertyRequestStatus, deletePropertyRequest as apiDeletePropertyRequest } from '../../api/propertyRequests';
import { getAllPartnerRequests, updatePartnerRequestStatus as apiUpdatePartnerRequestStatus } from '../../api/partnerRequests';
import { getDecorationCategories, addDecorationCategory as apiAddDecorationCategory, updateDecorationCategory as apiUpdateDecorationCategory, deleteDecorationCategory as apiDeleteDecorationCategory } from '../../api/decorations';

// Define context shape
interface DataContextType {
    properties: Property[];
    partners: AdminPartner[];
    portfolio: PortfolioItem[];
    leads: (Lead & { partnerName?: string })[];
    contactRequests: ContactRequest[];
    propertyRequests: AddPropertyRequest[];
    partnerRequests: PartnerRequest[];
    decorationCategories: DecorationCategory[];
    loading: boolean;
    refetchData: () => void;
    
    // Property mutations
    addProperty: (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>) => Promise<Property | undefined>;
    updateProperty: (propertyId: string, updates: Partial<Property>) => Promise<Property | undefined>;
    deleteProperty: (propertyId: string) => Promise<boolean>;

    // Partner mutations
    updatePartner: (id: string, updates: { name?: string, description?: string, imageUrl?: string }, language: 'ar' | 'en') => Promise<boolean>;
    updatePartnerStatus: (id: string, status: PartnerStatus) => Promise<boolean>;
    approvePartnerRequest: (request: PartnerRequest) => Promise<void>;
    rejectPartnerRequest: (requestId: string) => Promise<void>;

    // Portfolio mutations
    addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<PortfolioItem | undefined>;
    updatePortfolioItem: (itemId: string, updates: Partial<PortfolioItem>) => Promise<PortfolioItem | undefined>;
    deletePortfolioItem: (itemId: string) => Promise<boolean>;

    // Lead mutations
    updateLeadStatus: (leadId: string, status: LeadStatus) => Promise<Lead | undefined>;
    updateLeadNotes: (leadId: string, notes: string) => Promise<Lead | undefined>;
    deleteLead: (leadId: string) => Promise<boolean>;
    
    // Property Request mutations
    approvePropertyRequest: (request: AddPropertyRequest) => Promise<void>;
    rejectPropertyRequest: (requestId: string) => Promise<void>;

    // Contact Request mutations
    updateContactRequestStatus: (id: string, status: RequestStatus) => Promise<boolean>;
    deleteContactRequest: (id: string) => Promise<boolean>;
    
    // Decoration Category mutations
    addDecorationCategory: (category: Omit<DecorationCategory, 'id'>) => Promise<DecorationCategory | undefined>;
    updateDecorationCategory: (categoryId: string, updates: Partial<DecorationCategory>) => Promise<DecorationCategory | undefined>;
    deleteDecorationCategory: (categoryId: string) => Promise<boolean>;
}

// Create context with a default undefined value
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<Property[]>([]);
    const [partners, setPartners] = useState<AdminPartner[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [leads, setLeads] = useState<(Lead & { partnerName?: string })[]>([]);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [propertyRequests, setPropertyRequests] = useState<AddPropertyRequest[]>([]);
    const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
    const [decorationCategories, setDecorationCategories] = useState<DecorationCategory[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                propertiesData,
                partnersData,
                portfolioData,
                leadsData,
                contactRequestsData,
                propertyRequestsData,
                partnerRequestsData,
                decorationCategoriesData,
            ] = await Promise.all([
                getAllProperties(),
                getAllPartnersForAdmin(),
                getAllPortfolioItems(),
                getAllLeads(),
                getAllContactRequests(),
                getAllPropertyRequests(),
                getAllPartnerRequests(),
                getDecorationCategories(),
            ]);
            setProperties(propertiesData);
            setPartners(partnersData);
            setPortfolio(portfolioData);
            setLeads(leadsData);
            setContactRequests(contactRequestsData);
            setPropertyRequests(propertyRequestsData);
            setPartnerRequests(partnerRequestsData);
            setDecorationCategories(decorationCategoriesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addProperty = useCallback(async (propertyData: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>) => {
        const newProperty = await apiAddProperty(propertyData);
        if (newProperty) {
            setProperties(prev => [newProperty, ...prev]);
        }
        return newProperty;
    }, []);
    
    const updateProperty = useCallback(async (propertyId: string, updates: Partial<Property>) => {
        const updatedProperty = await apiUpdateProperty(propertyId, updates);
        if (updatedProperty) {
            setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
        }
        return updatedProperty;
    }, []);

    const deleteProperty = useCallback(async (propertyId: string) => {
        const originalProperties = [...properties];
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        try {
            const success = await apiDeleteProperty(propertyId);
            if (!success) {
                setProperties(originalProperties); // Revert on failure
            }
            return success;
        } catch (error) {
            console.error("Failed to delete property, reverting.", error);
            setProperties(originalProperties); // Revert on error
            return false;
        }
    }, [properties]);
    
    const updatePartner = useCallback(async (id: string, updates: { name?: string, description?: string, imageUrl?: string }, language: 'ar' | 'en') => {
        const success = await apiUpdatePartner(id, updates);
        if (success) {
            // This is a complex update affecting translations, so refetching is safer.
            await fetchData();
        }
        return success;
    }, [fetchData]);
    
    const updatePartnerStatus = useCallback(async (id: string, status: PartnerStatus) => {
        const success = await apiUpdatePartnerStatus(id, status);
        if (success) {
            setPartners(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        }
        return success;
    }, []);
    
    const approvePartnerRequest = useCallback(async (request: PartnerRequest) => {
        await apiUpdatePartnerRequestStatus(request.id, 'approved');
        const newPartner = await apiAddPartner(request);
        setPartnerRequests(prev => prev.filter(r => r.id !== request.id));
        setPartners(prev => [...prev, newPartner as Partner]);
    }, []);

    const rejectPartnerRequest = useCallback(async (requestId: string) => {
        const originalRequests = [...partnerRequests];
        setPartnerRequests(prev => prev.map(r => r.id === requestId ? {...r, status: 'rejected'} : r));
        try {
            await apiUpdatePartnerRequestStatus(requestId, 'rejected');
        } catch (error) {
            console.error("Failed to reject partner request, reverting.", error);
            setPartnerRequests(originalRequests);
        }
    }, [partnerRequests]);

    const addPortfolioItem = useCallback(async (item: Omit<PortfolioItem, 'id'>) => {
        const newItem = await apiAddPortfolioItem(item);
        if (newItem) {
            setPortfolio(prev => [newItem, ...prev]);
        }
        return newItem;
    }, []);

    const updatePortfolioItem = useCallback(async (itemId: string, updates: Partial<PortfolioItem>) => {
        const updatedItem = await apiUpdatePortfolioItem(itemId, updates);
        if (updatedItem) {
            setPortfolio(prev => prev.map(item => item.id === itemId ? updatedItem : item));
        }
        return updatedItem;
    }, []);


    const deletePortfolioItem = useCallback(async (itemId: string) => {
        const originalPortfolio = [...portfolio];
        setPortfolio(prev => prev.filter(item => item.id !== itemId));
        try {
            const success = await apiDeletePortfolioItem(itemId);
            if (!success) {
                setPortfolio(originalPortfolio);
            }
            return success;
        } catch (error) {
            console.error("Failed to delete portfolio item, reverting.", error);
            setPortfolio(originalPortfolio);
            return false;
        }
    }, [portfolio]);

    const updateLeadStatus = useCallback(async (leadId: string, status: LeadStatus) => {
        const updatedLead = await apiUpdateLeadStatus(leadId, status);
        if (updatedLead) {
            setLeads(prev => prev.map(l => l.id === leadId ? {...l, status, updatedAt: updatedLead.updatedAt } : l));
        }
        return updatedLead;
    }, []);

    const updateLeadNotes = useCallback(async (leadId: string, notes: string) => {
        const updatedLead = await apiUpdateLeadNotes(leadId, notes);
        if (updatedLead) {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, internalNotes: notes, updatedAt: updatedLead.updatedAt } : l));
        }
        return updatedLead;
    }, []);

    const deleteLead = useCallback(async (leadId: string) => {
        const originalLeads = [...leads];
        setLeads(prev => prev.filter(l => l.id !== leadId));
        try {
            const success = await apiDeleteLead(leadId);
            if (!success) {
                setLeads(originalLeads);
            }
            return success;
        } catch (error) {
            console.error("Failed to delete lead, reverting.", error);
            setLeads(originalLeads);
            return false;
        }
    }, [leads]);

    const approvePropertyRequest = useCallback(async (request: AddPropertyRequest) => {
        const { propertyDetails } = request;
        const priceNumeric = propertyDetails.price;
        
        const newPropertyData: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'> = {
            partnerId: 'individual-listings',
            title: { ar: `عقار بواسطة ${request.customerName}`, en: `Property by ${request.customerName}` },
            address: { ar: propertyDetails.address, en: propertyDetails.address },
            description: { ar: propertyDetails.description, en: propertyDetails.description },
            status: propertyDetails.purpose,
            type: propertyDetails.propertyType,
            finishingStatus: propertyDetails.finishingStatus,
            priceNumeric: priceNumeric,
            price: { ar: `${priceNumeric.toLocaleString('ar-EG')} ج.م`, en: `EGP ${priceNumeric.toLocaleString('en-US')}` },
            area: propertyDetails.area,
            beds: propertyDetails.bedrooms ?? 0,
            baths: propertyDetails.bathrooms ?? 0,
            floor: propertyDetails.floor,
            amenities: { ar: [], en: [] }, // Individual listings don't have detailed amenities from this form
            isInCompound: propertyDetails.isInCompound,
            installmentsAvailable: propertyDetails.hasInstallments,
            delivery: { 
                isImmediate: propertyDetails.deliveryType === 'immediate',
                date: propertyDetails.deliveryType === 'future' ? `${propertyDetails.deliveryYear}-${String(propertyDetails.deliveryMonth).padStart(2, '0')}` : undefined
            },
            installments: propertyDetails.hasInstallments ? {
                downPayment: propertyDetails.downPayment ?? 0,
                monthlyInstallment: propertyDetails.monthlyInstallment ?? 0,
                years: propertyDetails.years ?? 0,
            } : undefined,
            location: { lat: 30.125, lng: 31.608 }, // Default location
            imageUrl: request.images?.[0] || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop',
            gallery: request.images || [],
            listingStartDate: propertyDetails.listingStartDate,
            listingEndDate: propertyDetails.listingEndDate,
        };
        
        const newProperty = await apiAddProperty(newPropertyData);
        if (newProperty) {
            await apiUpdatePropertyRequestStatus(request.id, 'closed');
            setPropertyRequests(prev => prev.filter(r => r.id !== request.id));
            setProperties(prev => [newProperty, ...prev]);
        }
    }, []);
    
    const rejectPropertyRequest = useCallback(async (requestId: string) => {
        const originalRequests = [...propertyRequests];
        setPropertyRequests(prev => prev.filter(r => r.id !== requestId));
        try {
            await apiUpdatePropertyRequestStatus(requestId, 'closed');
        } catch (error) {
            console.error("Failed to reject property request, reverting.", error);
            setPropertyRequests(originalRequests);
        }
    }, [propertyRequests]);

    const updateContactRequestStatus = useCallback(async (id: string, status: RequestStatus) => {
        const success = await apiUpdateContactRequestStatus(id, status);
        if (success) {
            setContactRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        }
        return success;
    }, []);

    const deleteContactRequest = useCallback(async (id: string) => {
        const originalRequests = [...contactRequests];
        setContactRequests(prev => prev.filter(r => r.id !== id));
        try {
            const success = await apiDeleteContactRequest(id);
            if (!success) {
                setContactRequests(originalRequests);
            }
            return success;
        } catch (error) {
            console.error("Failed to delete contact request, reverting.", error);
            setContactRequests(originalRequests);
            return false;
        }
    }, [contactRequests]);
    
    // Decoration Category Mutations
    const addDecorationCategory = useCallback(async (category: Omit<DecorationCategory, 'id'>) => {
        const newCategory = await apiAddDecorationCategory(category);
        if (newCategory) {
            setDecorationCategories(prev => [...prev, newCategory]);
        }
        return newCategory;
    }, []);

    const updateDecorationCategory = useCallback(async (categoryId: string, updates: Partial<DecorationCategory>) => {
        const updatedCategory = await apiUpdateDecorationCategory(categoryId, updates);
        if (updatedCategory) {
            setDecorationCategories(prev => prev.map(c => c.id === categoryId ? updatedCategory : c));
        }
        return updatedCategory;
    }, []);
    
    const deleteDecorationCategory = useCallback(async (categoryId: string) => {
        const success = await apiDeleteDecorationCategory(categoryId);
        if (success) {
            setDecorationCategories(prev => prev.filter(c => c.id !== categoryId));
        }
        return success;
    }, []);

    const contextValue: DataContextType = {
        properties,
        partners,
        portfolio,
        leads,
        contactRequests,
        propertyRequests,
        partnerRequests,
        decorationCategories,
        loading,
        refetchData: fetchData,
        addProperty,
        updateProperty,
        deleteProperty,
        updatePartner,
        updatePartnerStatus,
        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        updateLeadStatus,
        updateLeadNotes,
        deleteLead,
        approvePropertyRequest,
        rejectPropertyRequest,
        updateContactRequestStatus,
        deleteContactRequest,
        approvePartnerRequest,
        rejectPartnerRequest,
        addDecorationCategory,
        updateDecorationCategory,
        deleteDecorationCategory,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

// Custom hook to use the data context
export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};