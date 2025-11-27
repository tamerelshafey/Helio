
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ... (Previous imports)
// Admin Dashboard Pages
import AdminHomePage from './AdminHomePage';
import AdminAnalyticsPage from './AdminAnalyticsPage';
import AdminReportsPage from './AdminReportsPage';
import AdminUsersPage from './users/AdminUsersPage';
import AdminRolesPage from './users/AdminRolesPage';
import AdminPlansPage from './AdminPlansPage';
import AdminFilterManagementPage from './AdminFilterManagementPage';
import AdminBannersPage from './banners/AdminBannersPage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminProfilePage from './AdminProfilePage';
import PropertyFormPage from '../forms/PropertyFormPage';
import ProjectFormPage from '../forms/ProjectFormPage';
import AdminPlatformPropertiesPage from './platform-ops/AdminPlatformPropertiesPage';
import AdminPlatformFinishingPage from './platform-ops/AdminPlatformFinishingPage';
import AdminPlatformDecorationsPage from './platform-ops/AdminPlatformDecorationsPage';
import AdminAllRequestsPage from './requests/AdminAllRequestsPage';
import AdminRequestDetailsPage from './requests/AdminRequestDetailsPage';
import AdminCreateRequestPage from './requests/AdminCreateRequestPage';
import AdminPartnersLayout from './partners/AdminPartnersLayout';
import AdminPartnersDashboard from './partners/AdminPartnersDashboard';
import AdminPartnersPage from './partners/AdminPartnersPage';
import AdminProjectsPage from './partners/AdminProjectsPage';
import AdminInquiryManagementPage from './inquiryManagement/AdminInquiryManagementPage';
import AdminPropertiesLayout from './properties/AdminPropertiesLayout';
import AdminPropertiesDashboard from './properties/AdminPropertiesDashboard';
import AdminPropertiesListPage from './properties/AdminPropertiesListPage';
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
import ContentCTAPage from './content/ContentCTAPage';
import ContentHomeListingsPage from './content/ContentHomeListingsPage';
import ContentPrivacyPolicyPage from './content/ContentPrivacyPolicyPage';
import ContentTermsOfUsePage from './content/ContentTermsOfUsePage';
import RoutingRulesPage from './automation/RoutingRulesPage';
import AllNotificationsPage from '../shared/AllNotificationsPage';
import AdminAIEstimatorPage from './AdminAIEstimatorPage';
import AdminFinancePage from './finance/AdminFinancePage';
import AdminFormsPage from './forms/AdminFormsPage'; // NEW IMPORT

const AdminRoutes: React.FC = () => {
    return (
        <Routes>
            <Route index element={<AdminHomePage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="finance" element={<AdminFinancePage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="automation" element={<RoutingRulesPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="notifications" element={<AllNotificationsPage />} />
            
            <Route path="forms" element={<AdminFormsPage />} /> {/* NEW ROUTE */}

            <Route path="requests/new" element={<AdminCreateRequestPage />} /> 
            <Route path="requests" element={<AdminAllRequestsPage />} />
            <Route path="requests/:requestId" element={<AdminRequestDetailsPage />} />

            <Route path="platform-properties" element={<AdminPlatformPropertiesPage />} />
            <Route path="platform-finishing/*" element={<AdminPlatformFinishingPage />} />
            <Route path="platform-decorations/*" element={<AdminPlatformDecorationsPage />} />
            
            <Route path="decorations-management/*" element={<Navigate to="platform-decorations" replace />} />
            <Route path="finishing-management/*" element={<Navigate to="platform-finishing" replace />} />

            <Route path="partner-requests" element={<Navigate to="/admin/requests?type=PARTNER_APPLICATION" replace />} />
            <Route path="partner-requests/:requestId" element={<Navigate to="/admin/requests/:requestId" replace />} />
            <Route path="contact-requests" element={<Navigate to="/admin/requests?type=CONTACT_MESSAGE" replace />} />
            <Route path="leads" element={<Navigate to="/admin/requests?type=LEAD" replace />} />
            <Route path="finishing-requests" element={<Navigate to="/admin/platform-finishing" replace />} />
            
            <Route path="partners" element={<AdminPartnersLayout />}>
                <Route index element={<AdminPartnersDashboard />} />
                <Route path="list" element={<AdminPartnersPage />} />
                <Route path="inquiry-routing" element={<AdminInquiryManagementPage />} />
                <Route path="plans" element={<AdminPlansPage availableCategories={['developer', 'agency', 'individual']} />} />
            </Route>
            
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
                <Route path="home-listings" element={<ContentHomeListingsPage />} />
                <Route path="home-cta" element={<ContentCTAPage />} />
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
                <Route path="privacy-policy" element={<ContentPrivacyPolicyPage />} />
                <Route path="terms-of-use" element={<ContentTermsOfUsePage />} />
            </Route>
            
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="ai-estimator" element={<AdminAIEstimatorPage />} />
            
        </Routes>
    );
};

export default AdminRoutes;
