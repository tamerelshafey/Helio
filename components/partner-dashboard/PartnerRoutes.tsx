
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Partner Dashboard Pages ---
import DashboardHomePage from './DashboardHomePage';
import DashboardProfilePage from './DashboardProfilePage';
import DashboardPortfolioPage from './DashboardPortfolioPage';
import DashboardPropertiesPage from './DashboardPropertiesPage';
import DashboardProjectsPage from './DashboardProjectsPage';
import DashboardProjectDetailsPage from './DashboardProjectDetailsPage';
import DashboardLeadsPage from './DashboardLeadsPage';
import DashboardSubscriptionPage from './DashboardSubscriptionPage';
import DashboardAnalyticsPage from './DashboardAnalyticsPage';
import PropertyFormPage from '../forms/PropertyFormPage';
import ProjectFormPage from '../forms/ProjectFormPage';
import PartnerLeadDetailsPage from './PartnerLeadDetailsPage';
import AllNotificationsPage from '../shared/AllNotificationsPage';

const PartnerRoutes: React.FC = () => {
    return (
        <Routes>
            <Route index element={<DashboardHomePage />} />
            <Route path="profile" element={<DashboardProfilePage />} />
            <Route path="portfolio" element={<DashboardPortfolioPage />} />
            <Route path="properties" element={<DashboardPropertiesPage />} />
            <Route path="properties/new" element={<PropertyFormPage />} />
            <Route path="properties/edit/:propertyId" element={<PropertyFormPage />} />
            <Route path="projects" element={<DashboardProjectsPage />} />
            <Route path="projects/new" element={<ProjectFormPage />} />
            <Route path="projects/edit/:projectId" element={<ProjectFormPage />} />
            <Route path="projects/:projectId" element={<DashboardProjectDetailsPage />} />
            <Route path="leads" element={<DashboardLeadsPage />} />
            <Route path="leads/:leadId" element={<PartnerLeadDetailsPage />} />
            <Route path="subscription" element={<DashboardSubscriptionPage />} />
            <Route path="analytics" element={<DashboardAnalyticsPage />} />
            <Route path="notifications" element={<AllNotificationsPage />} />
        </Routes>
    );
};

export default PartnerRoutes;
