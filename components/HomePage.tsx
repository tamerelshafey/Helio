import React from 'react';
import Hero from './Hero';
import Services from './Services';
import Partners from './Partners';
import Integrations from './Integrations';
import CTA from './CTA';
import type { Language } from '../types';
import BannerDisplay from './shared/BannerDisplay';
import AboutCity from './AboutCity';
import LatestProperties from './LatestProperties';
import SEO from './shared/SEO';
import { translations } from '../data/translations';


interface HomePageProps {
  language: Language;
}

const HomePage: React.FC<HomePageProps> = ({ language }) => {
  const t = translations[language];
  const pageTitle = `ONLY HELIO | ${t.nav.home}`;
  const pageDescription = language === 'ar' 
    ? 'بوابتك الحصرية لأرقى العقارات والخدمات في هليوبوليس الجديدة. اكتشف روائع معمارية وخدمات تشطيب وديكور متكاملة.'
    : 'Your exclusive gateway to the finest properties and services in New Heliopolis. Discover architectural masterpieces and integrated finishing and decoration services.';
    
  return (
    <>
      <SEO title={pageTitle} description={pageDescription} />
      <Hero language={language} />
      <BannerDisplay location="home" language={language} />
      <Services language={language} />
      <AboutCity language={language} />
      <Integrations language={language} />
      <LatestProperties language={language} />
      <Partners language={language} />
      <CTA language={language} />
    </>
  );
};

export default HomePage;