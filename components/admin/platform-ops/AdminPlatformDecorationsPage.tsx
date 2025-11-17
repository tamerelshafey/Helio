
import React from 'react';
import { useLanguage } from '../../shared/LanguageContext';
import DecorationsLayout from '../decorations/DecorationsDashboardLayout';

const AdminPlatformDecorationsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;

    return (
        <div>
            {/* This component re-uses the existing DecorationsLayout, which is perfect */}
            <DecorationsLayout />
        </div>
    );
};

export default AdminPlatformDecorationsPage;
