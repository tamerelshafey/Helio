
import React from 'react';
import type { Language } from '../../types';
import { useLanguage } from '../shared/LanguageContext';

const TermsOfUsePage: React.FC = () => {
  const { language, t } = useLanguage();
  const t_page = t.termsOfUsePage;

  const sections = [
    t_page.agreement,
    t_page.serviceDescription,
    t_page.userAccounts,
    t_page.prohibited,
    t_page.intellectualProperty,
    t_page.disclaimer,
    t_page.limitation,
    t_page.governingLaw,
    t_page.contact,
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">{t_page.title}</h1>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t_page.lastUpdated}</p>
        </div>
        <div className="prose prose-lg dark:prose-invert max-w-none mx-auto space-y-8">
          {sections.map(section => (
            <div key={section.title}>
              <h2 className="!text-amber-500 !font-bold">{section.title}</h2>
              <p className="whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;