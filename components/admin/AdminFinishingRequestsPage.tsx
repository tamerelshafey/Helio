
import React from 'react';
import ServiceRequestsManagement from './shared/ServiceRequestsManagement';
import { useLanguage } from '../shared/LanguageContext';

const AdminFinishingRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;

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