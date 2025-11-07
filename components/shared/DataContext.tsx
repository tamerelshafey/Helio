import React, { createContext, useContext, ReactNode } from 'react';
import type {
    Property,
    Project,
    AdminPartner,
    FilterOption,
    PortfolioItem,
    DecorationCategory,
    SiteContent,
    Lead,
    PartnerRequest,
    AddPropertyRequest,
    ContactRequest,
    PropertyInquiryRequest,
    Banner,
    SubscriptionPlanDetails,
    PlanCategory,
    AIEstimatorConfig
} from '../../types';
import { useApiQuery } from './useApiQuery';
import { getAllProperties } from '../../api/properties';
import { getAllProjects } from '../../api/projects';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../../api/filters';
import { getAllPortfolioItems } from '../../api/portfolio';
import { getDecorationCategories } from '../../api/decorations';
import { getContent } from '../../api/content';
import { getAllLeads } from '../../api/leads';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { getAllPropertyRequests } from '../../api/propertyRequests';
import { getAllContactRequests } from '../../api/contactRequests';
import { getAllPropertyInquiries } from '../../api/propertyInquiries';
import { getAllBanners } from '../../api/banners';
import { getPlans } from '../../api/plans';
import { getAIEstimatorConfig } from '../../api/aiConfig';

interface DataContextType {
    allProperties?: Property[];
    allProjects?: Project[];
    allPartners?: AdminPartner[];
    propertyTypes?: FilterOption[];
    finishingStatuses?: FilterOption[];
    amenities?: FilterOption[];
    allPortfolioItems?: PortfolioItem[];
    decorationCategories?: DecorationCategory[];
    siteContent?: SiteContent;
    allLeads?: Lead[];
    partnerRequests?: PartnerRequest[];
    propertyRequests?: AddPropertyRequest[];
    contactRequests?: ContactRequest[];
    propertyInquiries?: PropertyInquiryRequest[];
    banners?: Banner[];
    plans?: Record<PlanCategory, Record<string, { ar: SubscriptionPlanDetails, en: SubscriptionPlanDetails }>>;
    aiEstimatorConfig?: AIEstimatorConfig;

    isLoading: boolean;
    refetchAll: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { data: allProperties, isLoading: isLoadingProperties, refetch: refetchProperties } = useApiQuery('allProperties', getAllProperties);
    const { data: allProjects, isLoading: isLoadingProjects, refetch: refetchProjects } = useApiQuery('allProjects', getAllProjects);
    const { data: allPartners, isLoading: isLoadingPartners, refetch: refetchPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);
    const { data: propertyTypes, isLoading: isLoadingPropTypes, refetch: refetchPropTypes } = useApiQuery('propertyTypes', getAllPropertyTypes);
    const { data: finishingStatuses, isLoading: isLoadingFinishing, refetch: refetchFinishing } = useApiQuery('finishingStatuses', getAllFinishingStatuses);
    const { data: amenities, isLoading: isLoadingAmenities, refetch: refetchAmenities } = useApiQuery('amenities', getAllAmenities);
    const { data: allPortfolioItems, isLoading: isLoadingPortfolio, refetch: refetchPortfolio } = useApiQuery('allPortfolioItems', getAllPortfolioItems);
    const { data: decorationCategories, isLoading: isLoadingDecoCats, refetch: refetchDecoCats } = useApiQuery('decorationCategories', getDecorationCategories);
    const { data: siteContent, isLoading: isLoadingContent, refetch: refetchContent } = useApiQuery('siteContent', getContent);
    const { data: allLeads, isLoading: isLoadingLeads, refetch: refetchAllLeads } = useApiQuery('allLeadsAdmin', getAllLeads);
    const { data: partnerRequests, isLoading: isLoadingPartnerReqs, refetch: refetchPartnerReqs } = useApiQuery('partnerRequests', getAllPartnerRequests);
    const { data: propertyRequests, isLoading: isLoadingPropReqs, refetch: refetchPropReqs } = useApiQuery('propertyRequests', getAllPropertyRequests);
    const { data: contactRequests, isLoading: isLoadingContactReqs, refetch: refetchContactReqs } = useApiQuery('contactRequests', getAllContactRequests);
    const { data: propertyInquiries, isLoading: isLoadingInquiries, refetch: refetchInquiries } = useApiQuery('propertyInquiries', getAllPropertyInquiries);
    const { data: banners, isLoading: isLoadingBanners, refetch: refetchBanners } = useApiQuery('banners', getAllBanners);
    const { data: plans, isLoading: isLoadingPlans, refetch: refetchPlans } = useApiQuery('plans', getPlans);
    const { data: aiEstimatorConfig, isLoading: isLoadingAiConfig, refetch: refetchAiConfig } = useApiQuery('aiEstimatorConfig', getAIEstimatorConfig);

    const isLoading =
        isLoadingProperties || isLoadingProjects || isLoadingPartners ||
        isLoadingPropTypes || isLoadingFinishing || isLoadingAmenities ||
        isLoadingPortfolio || isLoadingDecoCats || isLoadingContent ||
        isLoadingLeads || isLoadingPartnerReqs || isLoadingPropReqs ||
        isLoadingContactReqs || isLoadingInquiries || isLoadingBanners ||
        isLoadingPlans || isLoadingAiConfig;

    const refetchAll = () => {
        refetchProperties();
        refetchProjects();
        refetchPartners();
        refetchPropTypes();
        refetchFinishing();
        refetchAmenities();
        refetchPortfolio();
        refetchDecoCats();
        refetchContent();
        refetchAllLeads();
        refetchPartnerReqs();
        refetchPropReqs();
        refetchContactReqs();
        refetchInquiries();
        refetchBanners();
        refetchPlans();
        refetchAiConfig();
    };
    
    const value = {
        allProperties, allProjects, allPartners,
        propertyTypes, finishingStatuses, amenities,
        allPortfolioItems, decorationCategories,
        siteContent, allLeads, partnerRequests, propertyRequests,
        contactRequests, propertyInquiries, banners, plans, aiEstimatorConfig,
        isLoading,
        refetchAll
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};
