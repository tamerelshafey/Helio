import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import AddPropertyModal from './components/AddPropertyModal';
import HomePage from './components/HomePage';
import PropertiesPage from './components/PropertiesPage';
import PropertiesMapPage from './components/PropertiesMapPage';
import PropertyDetailsPage from './components/PropertyDetailsPage';
import FinishingPage from './components/FinishingPage';
import DecorationsPage from './components/DecorationsPage';
import ContactPage from './components/ContactPage';
import FavoritesPage from './components/FavoritesPage';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './components/Chatbot';
import QuietZone from './components/QuietZone';
import { FavoritesProvider } from './components/shared/FavoritesContext';

export type Language = 'ar' | 'en';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuietZoneActive, setIsQuietZoneActive] = useState(false);
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <FavoritesProvider>
      <div className="bg-gray-900 text-gray-200 flex flex-col min-h-screen">
        <ScrollToTop />
        <Header 
          onAddPropertyClick={() => setIsModalOpen(true)} 
          onToggleQuietZone={() => setIsQuietZoneActive(true)}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage language={language} />} />
            <Route path="/properties" element={<PropertiesPage language={language} onAddPropertyClick={() => setIsModalOpen(true)} />} />
            <Route path="/map" element={<PropertiesMapPage language={language} />} />
            <Route path="/properties/:propertyId" element={<PropertyDetailsPage language={language} />} />
            <Route path="/finishing" element={<FinishingPage language={language} />} />
            <Route path="/decorations" element={<DecorationsPage language={language} />} />
            <Route path="/contact" element={<ContactPage language={language} />} />
            <Route path="/favorites" element={<FavoritesPage language={language} />} />
          </Routes>
        </main>
        <Footer language={language} />
        {isModalOpen && <AddPropertyModal onClose={() => setIsModalOpen(false)} language={language} />}
        {isQuietZoneActive && <QuietZone onClose={() => setIsQuietZoneActive(false)} language={language} />}
        <Chatbot language={language} />
      </div>
    </FavoritesProvider>
  );
};

export default App;