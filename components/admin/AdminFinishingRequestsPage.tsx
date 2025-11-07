import React from 'react';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import ServiceRequestsManagement from './shared/ServiceRequestsManagement';

const AdminFinishingRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t_admin = translations[language].adminDashboard;

    return (
        <ServiceRequestsManagement
            language={language}
            serviceType="finishing"
            title={t_admin.nav.finishingRequests}
            subtitle="Manage all service requests related to finishing."
            detailsUrlPrefix="/admin/finishing-requests"
        />
    );
};

export default AdminFinishingRequestsPage;
