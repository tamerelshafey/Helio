import React from 'react';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import ServiceRequestsManagement from './shared/ServiceRequestsManagement';

const AdminDecorationRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t_admin = translations[language].adminDashboard;

    return (
        <ServiceRequestsManagement
            language={language}
            serviceType="decorations"
            title={t_admin.nav.decorationsRequests}
            subtitle="Manage all service requests related to decorations."
            detailsUrlPrefix="/admin/decoration-requests"
        />
    );
};

export default AdminDecorationRequestsPage;