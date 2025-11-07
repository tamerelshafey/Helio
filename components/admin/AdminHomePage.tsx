import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Role } from '../../types';
import type { Language, Lead, AdminPartner, Property, AddPropertyRequest, ContactRequest, PartnerRequest, PropertyInquiryRequest } from '../../types';
import { translations } from '../../data/translations';
import { UserPlusIcon, ClipboardDocumentListIcon, InboxIcon, BuildingIcon, UsersIcon, CheckCircleIcon, ChartBarIcon } from '../icons/Icons';
import { isListingActive } from '../../utils/propertyUtils';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { getAllPropertyRequests } from '../../api/propertyRequests';
import { getAllContactRequests } from '../../api/contactRequests';
import { getAllPropertyInquiries } from '../../api/propertyInquiries';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getAllProperties } from '../../api/properties';
import { getAllLeads } from '../../api/leads';
import { useApiQuery } from '../shared/useApiQuery';
import { useAuth } from '../auth/AuthContext';
// Import new role-specific homepages
import SuperAdminHomePage from './SuperAdminHomePage';
import ServiceManagerHomePage from './ServiceManagerHomePage';
import CustomerRelationsHomePage from './CustomerRelationsHomePage';
import ListingsManagerHomePage from './ListingsManagerHomePage';
import PartnerRelationsHomePage from './PartnersManagerHomePage';
import ContentManagerHomePage from './ContentManagerHomePage';

const AdminHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    
    // The main admin page now acts as a router based on the user's role.
    // We pass the language prop down to the specific dashboard component.

    if (!currentUser) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    switch (currentUser.role) {
        case Role.SUPER_ADMIN:
            return <SuperAdminHomePage language={language} />;
        case Role.SERVICE_MANAGER:
            return <ServiceManagerHomePage language={language} />;
        case Role.CUSTOMER_RELATIONS_MANAGER:
            return <CustomerRelationsHomePage language={language} />;
        case Role.LISTINGS_MANAGER:
            return <ListingsManagerHomePage language={language} />;
        case Role.PARTNER_RELATIONS_MANAGER:
            return <PartnerRelationsHomePage language={language} />;
        case Role.CONTENT_MANAGER:
            return <ContentManagerHomePage language={language} />;
        default:
            return <div className="text-center p-8">Dashboard for this role is not available yet.</div>
    }
};

export default AdminHomePage;