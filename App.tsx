
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { Header } from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import QuietZone from './components/QuietZone';
import { FavoritesProvider } from './components/shared/FavoritesContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Permission } from './types';
import type { Language, Theme } from './types';
import ToastContainer from './components/shared/ToastContainer';

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
const DashboardPropertiesPage = React.lazy(() => import('./components/dashboard/DashboardPropertiesPage'));
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
const AdminDecorationsPage = React.lazy(() => import('./components/admin/AdminDecorationsPage'));
const AdminDecorationsCategoriesPage = React.lazy(() => import('./components/admin/AdminDecorationsCategoriesPage'));
const AdminDecorationRequestDetailsPage = React.lazy(() => import('./components/admin/AdminDecorationRequestDetailsPage'));
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
const AdminFinishingRequestsPage = React.lazy(() => import('./components/admin/AdminFinishingRequestsPage'));
const AdminFinishingRequestDetailsPage = React.lazy(() => import('./components/admin/AdminFinishingRequestDetailsPage'));
const AdminDecorationRequestsPage = React.lazy(() => import('./components/admin/AdminDecorationRequestsPage'));
const AdminRolesPage = React.lazy(() => import('./components/admin/AdminRolesPage'));
const AdminFinishingServicesPage = React.lazy(() => import('./components/admin/AdminFinishingServicesPage'));
const AdminAIEstimatorPage = React.lazy(() => import('./components/admin/AdminAIEstimatorPage'));


const LoadingFallback = () => (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
    </div>
);


const App: React.FC = () => {
  const [isQuietZoneActive, setIsQuietZoneActive] = useState(false);
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    // If no theme is saved, check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleThemeChange = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <FavoritesProvider>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Header 
          onToggleQuietZone={() => setIsQuietZoneActive(true)}
          language={language}
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        <main className="flex-grow">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* ================================================================== */}
              {/*                             Public Routes                          */}
              {/* ================================================================== */}
              <Route path="/" element={<HomePage language={language} />} />
              <Route path="/properties" element={<PropertiesPage language={language} />} />
              <Route path="/projects" element={<ProjectsPage language={language} />} />
              <Route path="/properties/:propertyId" element={<PropertyDetailsPage language={language} />} />
              <Route path="/projects/:projectId" element={<ProjectDetailsPage language={language} />} />
              <Route path="/finishing" element={<FinishingPage language={language} />} />
              <Route path="/decorations" element={<DecorationsPage language={language} />} />
              <Route path="/contact" element={<ContactPage language={language} />} />
              <Route path="/favorites" element={<FavoritesPage language={language} />} />
              <Route path="/partners/:partnerId" element={<PartnerProfilePage language={language} />} />
              <Route path="/add-property" element={<AddPropertyPage language={language} />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage language={language} />} />
              <Route path="/terms-of-use" element={<TermsOfUsePage language={language} />} />
              <Route path="/request-service" element={<ServiceRequestPage language={language} />} />
              
              {/* ================================================================== */}
              {/*                          Authentication Routes                     */}
              {/* ================================================================== */}
              <Route path="/login" element={<LoginPage language={language} />} />
              <Route path="/register" element={<RegisterPage language={language} />} />
              
              {/* ================================================================== */}
              {/*                        Protected Partner Dashboard                   */}
              {/* ================================================================== */}
              <Route path="/dashboard" element={
                <ProtectedRoute permission={Permission.VIEW_PARTNER_DASHBOARD}>
                  <PartnerDashboardLayout language={language} />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardHomePage language={language} />} />
                <Route path="profile" element={<DashboardProfilePage language={language} />} />
                <Route path="portfolio" element={<DashboardPortfolioPage language={language} />} />
                <Route path="properties" element={<DashboardPropertiesPage language={language} />} />
                <Route path="properties/new" element={<PropertyFormPage language={language} />} />
                <Route path="properties/edit/:propertyId" element={<PropertyFormPage language={language} />} />
                <Route path="projects" element={<DashboardProjectsPage language={language} />} />
                <Route path="projects/new" element={<ProjectFormPage language={language} />} />
                <Route path="projects/edit/:projectId" element={<ProjectFormPage language={language} />} />
                <Route path="projects/:projectId" element={<DashboardProjectDetailsPage language={language} />} />
                <Route path="leads" element={<DashboardLeadsPage language={language} />} />
                <Route path="subscription" element={<DashboardSubscriptionPage language={language} />} />
              </Route>

              {/* ================================================================== */}
              {/*                   Protected Super Admin Dashboard                  */}
              {/* ================================================================== */}
              <Route path="/admin" element={
                <ProtectedRoute permission={Permission.VIEW_ADMIN_DASHBOARD}>
                  <AdminDashboardLayout language={language} />
                </ProtectedRoute>
              }>
                  <Route index element={<AdminHomePage language={language} />} />
                  <Route path="analytics" element={<AdminAnalyticsPage language={language} />} />
                  <Route path="reports" element={<AdminReportsPage language={language} />} />
                  <Route path="partner-requests" element={<AdminPartnerRequestsPage language={language} />} />
                  <Route path="partner-requests/:requestId" element={<AdminPartnerRequestDetailsPage language={language} />} />
                  <Route path="property-requests" element={<AdminPropertyRequestsPage language={language} />} />
                  <Route path="property-requests/:requestId" element={<AdminPropertyRequestDetailsPage language={language} />} />
                  <Route path="property-inquiries" element={<AdminPropertyInquiriesPage language={language} />} />
                  <Route path="contact-requests" element={<AdminContactRequestsPage language={language} />} />
                  <Route path="partners" element={<AdminPartnersPage language={language} />} />
                  <Route path="users" element={<AdminUsersPage language={language} />} />
                  <Route path="projects" element={<AdminProjectsPage language={language} />} />
                  <Route path="projects/edit/:projectId" element={<ProjectFormPage language={language} />} />
                  <Route path="properties" element={<AdminPropertiesPage language={language} />} />
                  <Route path="properties/new" element={<PropertyFormPage language={language} />} />
                  <Route path="properties/edit/:propertyId" element={<PropertyFormPage language={language} />} />
                  <Route path="leads" element={<AdminLeadsPage language={language} />} />
                  <Route path="plans" element={<AdminPlansPage language={language} />} />
                  <Route path="roles" element={<AdminRolesPage language={language} />} />
                  <Route path="filters" element={<AdminFilterManagementPage language={language} />} />
                  <Route path="banners" element={<AdminBannersPage language={language} />} />
                  <Route path="content" element={<AdminContentManagementPage language={language} />} />
                  <Route path="settings" element={<AdminSettingsPage language={language} />} />
                  <Route path="decoration-works" element={<AdminDecorationsPage language={language} />} />
                  <Route path="decorations-categories" element={<AdminDecorationsCategoriesPage language={language} />} />
                  <Route path="finishing-services" element={<AdminFinishingServicesPage language={language} />} />
                  <Route path="finishing-requests" element={<AdminFinishingRequestsPage language={language} />} />
                  <Route path="finishing-requests/:requestId" element={<AdminFinishingRequestDetailsPage language={language} />} />
                  <Route path="decoration-requests" element={<AdminDecorationRequestsPage language={language} />} />
                  <Route path="decoration-requests/:requestId" element={<AdminDecorationRequestDetailsPage language={language} />} />
                  <Route path="ai-estimator-settings" element={<AdminAIEstimatorPage language={language} />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
        <Footer language={language} />
        {isQuietZoneActive && <QuietZone onClose={() => setIsQuietZoneActive(false)} language={language} />}
        <ToastContainer />
      </div>
    </FavoritesProvider>
  );
};

export default App;
