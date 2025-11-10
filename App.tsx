

import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Header } from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import QuietZone from './components/QuietZone';
import { FavoritesProvider } from './components/shared/FavoritesContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Permission } from './types';
import ToastContainer from './components/shared/ToastContainer';
import BackToTopButton from './components/shared/BackToTopButton';
import Chatbot from './components/Chatbot';

// Lazy load all page components for code splitting
const HomePage = React.lazy(() => import('./components/HomePage'));
const PropertiesPage = React.lazy(() => import('./components/PropertiesPage'));
const PropertyDetailsPage = React.lazy(() => import('./components/PropertyDetailsPage'));
const FinishingPage = React.lazy(() => import('./components/FinishingPage'));
const DecorationsPage = React.lazy(() => import('./components/DecorationsPage'));
const PartnerProfilePage = React.lazy(() => import('./components/PartnerProfilePage'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./components/auth/RegisterPage'));
const AdminDashboardLayout = React.lazy(() => import('./components/admin/AdminDashboardLayout'));
const PartnerDashboardLayout = React.lazy(() => import('./components/partner-dashboard/PartnerDashboardLayout'));
const DashboardHomePage = React.lazy(() => import('./components/partner-dashboard/DashboardHomePage'));
const DashboardProfilePage = React.lazy(() => import('./components/partner-dashboard/DashboardProfilePage'));
const DashboardPortfolioPage = React.lazy(() => import('./components/partner-dashboard/DashboardPortfolioPage'));
const DashboardPropertiesPage = React.lazy(() => import('./components/partner-dashboard/DashboardPropertiesPage'));
const DashboardProjectsPage = React.lazy(() => import('./components/partner-dashboard/DashboardProjectsPage'));
const DashboardProjectDetailsPage = React.lazy(() => import('./components/partner-dashboard/DashboardProjectDetailsPage'));
const DashboardLeadsPage = React.lazy(() => import('./components/partner-dashboard/DashboardLeadsPage'));
const DashboardSubscriptionPage = React.lazy(() => import('./components/partner-dashboard/DashboardSubscriptionPage'));
const PropertyFormPage = React.lazy(() => import('./components/forms/PropertyFormPage'));
const AddPropertyPage = React.lazy(() => import('./components/AddPropertyPage'));
const AdminPartnersPage = React.lazy(() => import('./components/admin/AdminPartnersPage'));
const AdminPropertiesPage = React.lazy(() => import('./components/admin/AdminPropertiesPage'));
const AdminLeadsPage = React.lazy(() => import('./components/admin/AdminLeadsPage'));
const AdminPartnerRequestsPage = React.lazy(() => import('./components/admin/AdminPartnerRequestsPage'));
const AdminPropertyRequestsPage = React.lazy(() => import('./components/admin/AdminPropertyRequestsPage'));
const AdminContactRequestsPage = React.lazy(() => import('./components/admin/AdminContactRequestsPage'));
const AdminHomePage = React.lazy(() => import('./components/admin/AdminHomePage'));
const AdminPartnerRequestDetailsPage = React.lazy(() => import('./components/admin/AdminPartnerRequestDetailsPage'));
const AdminPropertyRequestDetailsPage = React.lazy(() => import('./components/admin/AdminPropertyRequestDetailsPage'));
const AdminPlansPage = React.lazy(() => import('./components/admin/AdminPlansPage'));
const ProjectFormPage = React.lazy(() => import('./components/forms/ProjectFormPage'));
const AdminFilterManagementPage = React.lazy(() => import('./components/admin/AdminFilterManagementPage'));
const AdminBannersPage = React.lazy(() => import('./components/admin/AdminBannersPage'));
const AdminPropertyInquiriesPage = React.lazy(() => import('./components/admin/AdminPropertyInquiriesPage'));
const ProjectDetailsPage = React.lazy(() => import('./components/ProjectDetailsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfUsePage = React.lazy(() => import('./components/TermsOfUsePage'));
const AdminAnalyticsPage = React.lazy(() => import('./components/admin/AdminAnalyticsPage'));
const AdminReportsPage = React.lazy(() => import('./components/admin/AdminReportsPage'));
const ProjectsPage = React.lazy(() => import('./components/ProjectsPage'));
const AdminProjectsPage = React.lazy(() => import('./components/admin/AdminProjectsPage'));
const AdminContentManagementPage = React.lazy(() => import('./components/admin/AdminContentManagementPage'));
const AdminSettingsPage = React.lazy(() => import('./components/admin/AdminSettingsPage'));
const ServiceRequestPage = React.lazy(() => import('./components/ServiceRequestPage'));
const AdminUsersPage = React.lazy(() => import('./components/admin/AdminUsersPage'));
const AdminRolesPage = React.lazy(() => import('./components/admin/AdminRolesPage'));
const AdminFinishingServicesPage = React.lazy(() => import('./components/admin/AdminFinishingServicesPage'));
const AdminAIEstimatorPage = React.lazy(() => import('./components/admin/AdminAIEstimatorPage'));
const AIEstimatorPage = React.lazy(() => import('./components/AIEstimatorPage'));
const NotFoundPage = React.lazy(() => import('./components/NotFoundPage'));

// New lazy imports for refactored decorations management
const DecorationsLayout = React.lazy(() => import('./components/admin/decorations/DecorationsDashboardLayout'));
const PortfolioManagement = React.lazy(() => import('./components/admin/decorations/PortfolioManagement'));
const CategoriesManagement = React.lazy(() => import('./components/admin/decorations/CategoriesManagement'));


const LoadingFallback = () => (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
    </div>
);

const App: React.FC = () => {
    const [isQuietZoneActive, setIsQuietZoneActive] = useState(false);

    return (
        <FavoritesProvider>
            <div className="flex flex-col min-h-screen">
                <ScrollToTop />
                <Header onToggleQuietZone={() => setIsQuietZoneActive(true)} />
                <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            {/* ================================================================== */}
                            {/*                             Public Routes                          */}
                            {/* ================================================================== */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/properties" element={<PropertiesPage />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/properties/:propertyId" element={<PropertyDetailsPage />} />
                            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
                            <Route path="/finishing" element={<FinishingPage />} />
                            <Route path="/decorations" element={<DecorationsPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/favorites" element={<FavoritesPage />} />
                            <Route path="/partners/:partnerId" element={<PartnerProfilePage />} />
                            <Route path="/add-property" element={<AddPropertyPage />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                            <Route path="/terms-of-use" element={<TermsOfUsePage />} />
                            <Route path="/request-service" element={<ServiceRequestPage />} />
                            <Route path="/cost-estimator" element={<AIEstimatorPage />} />

                            {/* ================================================================== */}
                            {/*                          Authentication Routes                     */}
                            {/* ================================================================== */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* ================================================================== */}
                            {/*                        Protected Partner Dashboard                   */}
                            {/* ================================================================== */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute permission={Permission.VIEW_PARTNER_DASHBOARD}>
                                        <PartnerDashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
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
                                <Route path="subscription" element={<DashboardSubscriptionPage />} />
                            </Route>

                            {/* ================================================================== */}
                            {/*                   Protected Super Admin Dashboard                  */}
                            {/* ================================================================== */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute permission={Permission.VIEW_ADMIN_DASHBOARD}>
                                        <AdminDashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<AdminHomePage />} />
                                <Route path="analytics" element={<AdminAnalyticsPage />} />
                                <Route path="reports" element={<AdminReportsPage />} />
                                <Route path="partner-requests" element={<AdminPartnerRequestsPage />} />
                                <Route path="partner-requests/:requestId" element={<AdminPartnerRequestDetailsPage />} />
                                <Route path="property-requests" element={<AdminPropertyRequestsPage />} />
                                <Route path="property-requests/:requestId" element={<AdminPropertyRequestDetailsPage />} />
                                <Route path="property-inquiries" element={<AdminPropertyInquiriesPage />} />
                                <Route path="contact-requests" element={<AdminContactRequestsPage />} />
                                <Route path="partners" element={<AdminPartnersPage />} />
                                <Route path="users" element={<AdminUsersPage />} />
                                <Route path="projects" element={<AdminProjectsPage />} />
                                <Route path="projects/edit/:projectId" element={<ProjectFormPage />} />
                                <Route path="properties" element={<AdminPropertiesPage />} />
                                <Route path="properties/new" element={<PropertyFormPage />} />
                                <Route path="properties/edit/:propertyId" element={<PropertyFormPage />} />
                                <Route path="leads" element={<AdminLeadsPage />} />
                                <Route path="plans" element={<AdminPlansPage />} />
                                <Route path="roles" element={<AdminRolesPage />} />
                                <Route path="filters" element={<AdminFilterManagementPage />} />
                                <Route path="banners" element={<AdminBannersPage />} />
                                <Route path="content" element={<AdminContentManagementPage />} />
                                <Route path="settings" element={<AdminSettingsPage />} />
                                <Route path="finishing-services" element={<AdminFinishingServicesPage />} />
                                <Route path="ai-estimator-settings" element={<AdminAIEstimatorPage />} />
                                
                                {/* Refactored Decorations Management */}
                                <Route path="decorations-management" element={<DecorationsLayout />}>
                                    <Route index element={<Navigate to="portfolio" replace />} />
                                    <Route path="portfolio" element={<PortfolioManagement />} />
                                    <Route path="categories" element={<CategoriesManagement />} />
                                </Route>
                                
                            </Route>
                            {/* 404 Not Found Route */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
                {isQuietZoneActive && <QuietZone onClose={() => setIsQuietZoneActive(false)} />}
                <ToastContainer />
                <Chatbot />
                <BackToTopButton />
            </div>
        </FavoritesProvider>
    );
};

export default App;
