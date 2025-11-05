import React from 'react';
import Hero from './Hero';
import SocialProof from './SocialProof';
import Services from './Services';
import Partners from './Partners';
import Integrations from './Integrations';
import CTA from './CTA';
import type { Language } from '../types';
import BannerDisplay from './shared/BannerDisplay';
import AboutCity from './AboutCity';

interface HomePageProps {
  language: Language;
}

const HomePage: React.FC<HomePageProps> = ({ language }) => {
  return (
    <>
      <Hero language={language} />
      <BannerDisplay location="home" language={language} />
      <Services language={language} />
      <AboutCity language={language} />
      <Integrations language={language} />
      <SocialProof language={language} />
      <Partners language={language} />
      <CTA language={language} />
    </>
  );
};

export default HomePage;