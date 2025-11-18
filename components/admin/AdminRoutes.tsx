import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Admin Dashboard Pages ---
import AdminHomePage from './AdminHomePage';
import AdminAnalyticsPage from './AdminAnalyticsPage';
import AdminReportsPage from './AdminReportsPage';
// FIX: The default export now exists in AdminUsersPage.tsx
import AdminUsersPage from './users/AdminUsersPage';
import AdminRolesPage from './users/AdminRolesPage';
import AdminPlansPage from './AdminPlansPage';
import AdminFilterManagementPage from './AdminFilterManagementPage';
import AdminBannersPage from './AdminBannersPage';
import AdminSettingsPage from './AdminSettingsPage';
import PropertyFormPage from '../forms/PropertyFormPage';
import ProjectFormPage from '../forms/ProjectFormPage';

// Admin - Platform Operations (New)
import AdminPlatformPropertiesPage from './platform-ops/AdminPlatformPropertiesPage';
import AdminPlatformDecorationsPage from './platform-ops/AdminPlatformDecorationsPage';
import AdminPlatformFinishingPage from './platform-ops/AdminPlatformFinishingPage';


// Admin - Requests (New Unified Structure)
import AdminAllRequestsPage from './requests/AdminAllRequestsPage';
import AdminRequestDetailsPage from './requests/AdminRequestDetailsPage';

// Admin - Decorations Management
import DecorationsLayout from './decorations/DecorationsDashboardLayout';
import DecorationsDashboardHomePage from './decorations/DecorationsDashboardHomePage';
import RequestsManagement from './decorations/RequestsManagement';
import PortfolioManagement from './decorations/PortfolioManagement';
import CategoriesManagement from './decorations/CategoriesManagement';

// Admin - Finishing Management
import AdminFinishingLayout from './finishing/AdminFinishingLayout';
import AdminFinishingDashboardPage from './finishing/AdminFinishingDashboardPage';
import AdminFinishingServicesPage from './AdminFinishingServicesPage';
import AdminFinishingRequestsPage from './requests/AdminFinishingRequestsPage'; // Import directly
import AdminAIEstimatorPage from './AdminAIEstimatorPage';

// Admin - Partners & Projects Management (New Structure)
import AdminPartnersLayout from './partners/AdminPartnersLayout';
import AdminPartnersDashboard from './partners/AdminPartnersDashboard';
import AdminPartnersPage from './partners/AdminPartnersPage';
import AdminProjectsPage from './partners/AdminProjectsPage';
import AdminInquiryManagementPage from './inquiryManagement/AdminInquiryManagementPage';

// Admin - Properties (New Structure)
import AdminPropertiesLayout from './properties/AdminPropertiesLayout';
import AdminPropertiesDashboard from './properties/AdminPropertiesDashboard';
import AdminPropertiesListPage from './properties/AdminPropertiesListPage';

// Admin - Content Management
import AdminContentLayout from './content/AdminContentLayout';
import ContentHeroPage from './content/ContentHeroPage';
import ContentWhyUsPage from './content/ContentWhyUsPage';
import ContentServicesPage from './content/ContentServicesPage';
import ContentPartnersPage from './content/ContentPartnersPage';
import ContentTestimonialsPage from './content/ContentTestimonialsPage';
import ContentSocialProofPage from './content/ContentSocialProofPage';
import ContentWhyNewHeliopolisPage from './content/ContentWhyNewHeliopolisPage';
import ContentQuotesPage from './content/ContentQuotesPage';
import ContentFooterPage from './content/ContentFooterPage';
import ContentProjectsPage from './content/ContentProjectsPage';
import ContentFinishingPage from './content/ContentFinishingPage';
import ContentDecorationsPage from './content/ContentDecorationsPage';

// Admin - Automation
import RoutingRulesPage from './automation/RoutingRulesPage';


const AdminRoutes: React.FC = () => {
    return (
        <Routes>
            <Route index element={<AdminHomePage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="automation" element={<RoutingRulesPage />} />

            {/* ===== NEW UNIFIED REQUESTS ROUTE ===== */}
            <Route path="requests" element={<AdminAllRequestsPage />} />
            <Route path="requests/:requestId" element={<AdminRequestDetailsPage />} />

            {/* ===== NEW PLATFORM OPERATIONS ROUTES ===== */}
            <Route path="platform-properties" element={<AdminPlatformPropertiesPage />} />
            <Route path="platform-decorations" element={<AdminPlatformDecorationsPage />} />
            <Route path="platform-finishing" element={<AdminPlatformFinishingPage />} />


            {/* ===== DEPRECATED - Redirect old request URLs to the new triage center ===== */}
            <Route path="partner-requests" element={<Navigate to="/admin/requests?type=PARTNER_APPLICATION" replace />} />
            <Route path="partner-requests/:requestId" element={<Navigate to="/admin/requests/:requestId" replace />} />
            <Route path="contact-requests" element={<Navigate to="/admin/requests?type=CONTACT_MESSAGE" replace />} />
            <Route path="leads" element={<Navigate to="/admin/requests?type=LEAD" replace />} />
            {/* Removed direct redirects for finishing/decorations to use nested layouts instead */}
            <Route path="finishing-requests" element={<Navigate to="/admin/finishing-management/requests" replace />} />
            <Route path="decorations-requests" element={<Navigate to="/admin/decorations-management/requests" replace />} />
            
            <Route path="partners" element={<AdminPartnersLayout />}>
                <Route index element={<AdminPartnersDashboard />} />
                <Route path="list" element={<AdminPartnersPage />} />
                <Route path="inquiry-routing" element={<AdminInquiryManagementPage />} />
                <Route path="plans" element={<AdminPlansPage availableCategories={['developer', 'agency', 'individual']} />} />
            </Route>
            
            {/* Projects Top Level Route */}
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="projects/edit/:projectId" element={<ProjectFormPage />} />

            <Route path="users" element={<AdminUsersPage />} />
            
            <Route path="properties" element={<AdminPropertiesLayout />}>
                <Route index element={<AdminPropertiesDashboard />} />
                <Route path="list" element={<AdminPropertiesListPage />} />
                <Route path="listing-requests" element={<Navigate to="/admin/requests?type=PROPERTY_LISTING_REQUEST" replace />} />
                <Route path="listing-requests/:requestId" element={<Navigate to="/admin/requests/:requestId" replace />} />
                <Route path="search-requests" element={<Navigate to="/admin/requests?type=PROPERTY_INQUIRY" replace />} />
                <Route path="filters" element={<AdminFilterManagementPage />} />
            </Route>
            <Route path="properties/new" element={<PropertyFormPage />} />
            <Route path="properties/edit/:propertyId" element={<PropertyFormPage />} />

            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            
            <Route path="content" element={<AdminContentLayout />}>
                <Route index element={<Navigate to="hero" replace />} />
                <Route path="hero" element={<ContentHeroPage />} />
                <Route path="why-us" element={<ContentWhyUsPage />} />
                <Route path="services" element={<ContentServicesPage />} />
                <Route path="partners" element={<ContentPartnersPage />} />
                <Route path="projects-page" element={<ContentProjectsPage />} />
                <Route path="finishing-page" element={<ContentFinishingPage />} />
                <Route path="decorations-page" element={<ContentDecorationsPage />} />
                <Route path="testimonials" element={<ContentTestimonialsPage />} />
                <Route path="social-proof" element={<ContentSocialProofPage />} />
                <Route path="why-new-heliopolis" element={<ContentWhyNewHeliopolisPage />} />
                <Route path="quotes" element={<ContentQuotesPage />} />
                <Route path="footer" element={<ContentFooterPage />} />
            </Route>
            
            <Route path="settings" element={<AdminSettingsPage />} />
            
            <Route path="finishing-management" element={<AdminFinishingLayout />}>
                <Route index element={<AdminFinishingDashboardPage />} />
                {/* Replaced Navigate with direct component render to keep layout */}
                <Route path="requests" element={<AdminFinishingRequestsPage />} />
                <Route path="services" element={<AdminFinishingServicesPage />} />
                <Route path="estimator" element={<AdminAIEstimatorPage />} />
                <Route path="plans" element={<AdminPlansPage availableCategories={['finishing']} />} />
            </Route>

            <Route path="decorations-management" element={<DecorationsLayout />}>
                <Route index element={<DecorationsDashboardHomePage />} />
                <Route path="requests" element={<RequestsManagement />} />
                <Route path="portfolio" element={<PortfolioManagement />} />
                <Route path="categories" element={<CategoriesManagement />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;