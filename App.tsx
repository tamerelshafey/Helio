import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PropertiesPage from './components/PropertiesPage';
import PropertyDetailsPage from './components/PropertyDetailsPage';
import FinishingPage from './components/FinishingPage';
import DecorationsPage from './components/DecorationsPage';
import PartnerProfilePage from './components/PartnerProfilePage';
import ContactPage from './components/ContactPage';
import FavoritesPage from './components/FavoritesPage';
import ScrollToTop from './components/ScrollToTop';
import QuietZone from './components/QuietZone';
import { FavoritesProvider } from './components/shared/FavoritesContext';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardPropertiesPage from './components/dashboard/DashboardPropertiesPage';
import DashboardProfilePage from './components/dashboard/DashboardProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PropertyFormPage from './components/dashboard/PropertyFormPage';
import DashboardPortfolioPage from './components/dashboard/DashboardPortfolioPage';
import DashboardLeadsPage from './components/dashboard/DashboardLeadsPage';
import type { Language, Theme } from './types';
import AddPropertyPage from './components/AddPropertyPage';
import AdminDashboardLayout from './components/admin/AdminDashboardLayout';
import AdminPartnersPage from './components/admin/AdminPartnersPage';
import AdminPropertiesPage from './components/admin/AdminPropertiesPage';
import AdminLeadsPage from './components/admin/AdminLeadsPage';
import AdminPartnerRequestsPage from './components/admin/AdminPartnerRequestsPage';
import AdminPropertyRequestsPage from './components/admin/AdminPropertyRequestsPage';
import AdminContactRequestsPage from './components/admin/AdminContactRequestsPage';
import AdminHomePage from './components/admin/AdminHomePage';


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
          <Routes>
            <Route path="/" element={<HomePage language={language} />} />
            <Route path="/properties" element={<PropertiesPage language={language} />} />
            <Route path="/properties/:propertyId" element={<PropertyDetailsPage language={language} />} />
            <Route path="/finishing" element={<FinishingPage language={language} />} />
            <Route path="/decorations" element={<DecorationsPage language={language} />} />
            <Route path="/contact" element={<ContactPage language={language} />} />
            <Route path="/favorites" element={<FavoritesPage language={language} />} />
            <Route path="/partners/:partnerId" element={<PartnerProfilePage language={language} />} />
            <Route path="/add-property" element={<AddPropertyPage language={language} />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage language={language} />} />
            <Route path="/register" element={<RegisterPage language={language} />} />

            {/* Protected Partner Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout language={language} />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPropertiesPage language={language} />} />
              <Route path="profile" element={<DashboardProfilePage language={language} />} />
              <Route path="portfolio" element={<DashboardPortfolioPage language={language} />} />
              <Route path="leads" element={<DashboardLeadsPage language={language} />} />
              <Route path="properties/new" element={<PropertyFormPage language={language} />} />
              <Route path="properties/edit/:propertyId" element={<PropertyFormPage language={language} />} />
            </Route>

            {/* Protected Admin Dashboard Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboardLayout language={language} />
              </ProtectedRoute>
            }>
              <Route index element={<AdminHomePage language={language} />} />
              <Route path="partner-requests" element={<AdminPartnerRequestsPage language={language} />} />
              <Route path="property-requests" element={<AdminPropertyRequestsPage language={language} />} />
              <Route path="contact-requests" element={<AdminContactRequestsPage language={language} />} />
              <Route path="partners" element={<AdminPartnersPage language={language} />} />
              <Route path="properties" element={<AdminPropertiesPage language={language} />} />
              <Route path="properties/new" element={<PropertyFormPage language={language} />} />
              <Route path="leads" element={<AdminLeadsPage language={language} />} />
            </Route>

          </Routes>
        </main>
        <Footer language={language} />
        {isQuietZoneActive && <QuietZone onClose={() => setIsQuietZoneActive(false)} language={language} />}
      </div>
    </FavoritesProvider>
  );
};

export default App;