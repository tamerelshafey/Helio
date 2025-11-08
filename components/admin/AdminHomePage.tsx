import React from 'react';
import { Role } from '../../types';
import { useAuth } from '../auth/AuthContext';
import SuperAdminHomePage from './SuperAdminHomePage';
import ServiceManagerHomePage from './ServiceManagerHomePage';
import CustomerRelationsHomePage from './CustomerRelationsHomePage';
import ListingsManagerHomePage from './ListingsManagerHomePage';
import PartnerRelationsHomePage from './PartnersManagerHomePage';
import ContentManagerHomePage from './ContentManagerHomePage';

const AdminHomePage: React.FC = () => {
    const { currentUser } = useAuth();
    
    if (!currentUser) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    switch (currentUser.role) {
        case Role.SUPER_ADMIN:
            return <SuperAdminHomePage />;
        case Role.SERVICE_MANAGER:
            return <ServiceManagerHomePage />;
        case Role.CUSTOMER_RELATIONS_MANAGER:
            return <CustomerRelationsHomePage />;
        case Role.LISTINGS_MANAGER:
            return <ListingsManagerHomePage />;
        case Role.PARTNER_RELATIONS_MANAGER:
            return <PartnerRelationsHomePage />;
        case Role.CONTENT_MANAGER:
            return <ContentManagerHomePage />;
        default:
            return <div className="text-center p-8">Dashboard for this role is not available yet.</div>
    }
};

export default AdminHomePage;