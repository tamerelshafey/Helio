
import React from 'react';
import { translations } from '../../data/translations';
import ServiceRequestsManagement from './shared/ServiceRequestsManagement';
import { useLanguage } from '../shared/LanguageContext';

const AdminDecorationRequestsPage: React.FC = () => {
    const { language } = useLanguage();
    const t_admin = translations[language].adminDashboard;

    return (
        <ServiceRequestsManagement
            serviceType="decorations"
            title={t_admin.nav.decorationsRequests}
            subtitle="Manage all service requests related to decorations."
            detailsUrlPrefix="/admin/decoration-requests"
        />
    );
};

export default AdminDecorationRequestsPage;
