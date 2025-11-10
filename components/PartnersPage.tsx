
import React from 'react';
import Partners from './Partners';
import CTA from './CTA';
import SEO from './shared/SEO';
import { useLanguage } from './shared/LanguageContext';

// This component serves as a dedicated page to display all partners,
// reusing the <Partners /> component that is also shown on the home page.

const PartnersPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div>
        <SEO title={`Our Partners | ONLY HELIO`} description="Meet our trusted network of developers, finishing companies, and real estate agencies." />
         <div className="py-20 text-center bg-gray-50 dark:bg-gray-800">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Our Partners</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">We collaborate with a selection of top developers and companies to offer the best services in New Heliopolis.</p>
        </div>
        <Partners />
        <CTA />
    </div>
  );
};

export default PartnersPage;
