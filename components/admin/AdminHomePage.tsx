import React from 'react';
import type { Language } from '../../types';
import { Role } from '../../types';
import { useAuth } from '../auth/AuthContext';
import SuperAdminHomePage from './SuperAdminHomePage';
import ServiceManagerHomePage from './ServiceManagerHomePage';
import CustomerRelationsHomePage from './CustomerRelationsHomePage';
import ListingsManagerHomePage from './ListingsManagerHomePage';
import PartnerRelationsHomePage from './PartnersManagerHomePage';
import ContentManagerHomePage from './ContentManagerHomePage';

const AdminHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    
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
