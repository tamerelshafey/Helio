import React from 'react';
import { translations } from '../../data/translations';
import ServiceRequestsManagement from './shared/ServiceRequestsManagement';
import { useLanguage } from '../shared/LanguageContext';

const AdminFinishingRequestsPage: React.FC = () => {
    const { language } = useLanguage();
    const t_admin = translations[language].adminDashboard;

    return (
        <ServiceRequestsManagement
            serviceType="finishing"
            title={t_admin.nav.finishingRequests}
            subtitle="Manage all service requests related to finishing."
            detailsUrlPrefix="/admin/finishing-requests"
        />
    );
};

export default AdminFinishingRequestsPage;