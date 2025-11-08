
import React from 'react';
import Hero from './Hero';
import Services from './Services';
import Partners from './Partners';
import Integrations from './Integrations';
import CTA from './CTA';
import BannerDisplay from './shared/BannerDisplay';
import AboutCity from './AboutCity';
import LatestProperties from './LatestProperties';
import SEO from './shared/SEO';
import { translations } from '../data/translations';
import { useLanguage } from './shared/LanguageContext';


const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const pageTitle = `ONLY HELIO | ${t.nav.home}`;
  const pageDescription = language === 'ar' 
    ? 'بوابتك الحصرية لأرقى العقارات والخدمات في هليوبوليس الجديدة. اكتشف روائع معمارية وخدمات تشطيب وديكور متكاملة.'
    : 'Your exclusive gateway to the finest properties and services in New Heliopolis. Discover architectural masterpieces and integrated finishing and decoration services.';
    
  return (
    <>
      <SEO title={pageTitle} description={pageDescription} />
      <Hero />
      <BannerDisplay location="home" />
      <Services />
      <AboutCity />
      <Integrations />
      <LatestProperties />
      <Partners />
      <CTA />
    </>
  );
};

export default HomePage;
