import React from 'react';
import Hero from './Hero';
import SocialProof from './SocialProof';
import Services from './Services';
import AboutCity from './AboutCity';
import Partners from './Partners';
import Integrations from './Integrations';
import Testimonial from './Testimonial';
import CTA from './CTA';
import type { Language } from '../App';

interface HomePageProps {
  language: Language;
}

const HomePage: React.FC<HomePageProps> = ({ language }) => {
  return (
    <>
      <Hero language={language} />
      <Services language={language} />
      <AboutCity language={language} />
      <Integrations language={language} />
      <SocialProof language={language} />
      <Partners language={language} />
      <Testimonial language={language} />
      <CTA language={language} />
    </>
  );
};

export default HomePage;