
import React from 'react';
import Services from './Services';
import CTA from './CTA';
import SEO from './shared/SEO';
import { useLanguage } from './shared/LanguageContext';

// This is a placeholder for a potential generic services page.
// Currently, the app uses specific pages for 'Finishing' and 'Decorations'.
// This page could be used to aggregate all services if needed in the future.

const ServicesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div>
        <SEO title={`Services | ONLY HELIO`} description="Discover our comprehensive services, from real estate to finishing and decoration." />
        <div className="py-20 text-center">
            <h1 className="text-4xl font-bold">Our Services</h1>
        </div>
        <Services />
        <CTA />
    </div>
  );
};

export default ServicesPage;
