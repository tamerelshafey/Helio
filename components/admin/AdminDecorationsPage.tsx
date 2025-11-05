import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import PortfolioManagement from './decorations/PortfolioManagement';
import CategoriesManagement from './decorations/CategoriesManagement';

interface AdminDecorationsPageProps {
  language: Language;
}

const AdminDecorationsPage: React.FC<AdminDecorationsPageProps> = ({ language }) => {
    const t = translations[language].adminDashboard.decorationsManagement;
    const [activeTab, setActiveTab] = useState('portfolio');

    const tabs = [
        { key: 'portfolio', label: t.portfolioTab },
        { key: 'categories', label: t.categoriesTab },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`${
                                activeTab === tab.key
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'portfolio' && <PortfolioManagement language={language} />}
                {activeTab === 'categories' && <CategoriesManagement language={language} />}
            </div>
        </div>
    );
};

export default AdminDecorationsPage;