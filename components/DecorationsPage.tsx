import React, { useState, useMemo, useEffect } from 'react';
import type { Language, PortfolioItem } from '../types';
import { translations } from '../data/translations';
import DecorationRequestModal from './DecorationRequestModal';
import CustomDecorationRequestModal from './CustomDecorationRequestModal';
import { useData } from './shared/DataContext';

interface DecorationsPageProps {
  language: Language;
}

const DecorationsPage: React.FC<DecorationsPageProps> = ({ language }) => {
    const t = translations[language].decorationsPage;
    const { portfolio: allWorks, decorationCategories, loading } = useData();
    
    const tabs = useMemo(() => decorationCategories.map(cat => ({
        key: cat.id,
        name: cat.name[language],
        desc: cat.description[language]
    })), [decorationCategories, language]);
    
    const [activeTab, setActiveTab] = useState('');

    // Set initial active tab once data is loaded
    useEffect(() => {
        if (tabs.length > 0 && !activeTab) {
            setActiveTab(tabs[0].name);
        }
    }, [tabs, activeTab]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWork, setSelectedWork] = useState<PortfolioItem | null>(null);
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

    const filteredWorks = useMemo(() => {
        if (!activeTab) return [];
        return allWorks.filter(work => work.category[language] === activeTab);
    }, [allWorks, activeTab, language]);

    const openModal = (work: PortfolioItem) => {
        setSelectedWork(work);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWork(null);
    };
    
    const openCustomModal = () => setIsCustomModalOpen(true);
    const closeCustomModal = () => setIsCustomModalOpen(false);
    
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
             {isModalOpen && selectedWork && (
                <DecorationRequestModal 
                    onClose={closeModal}
                    workItem={selectedWork}
                    language={language}
                />
            )}
            {isCustomModalOpen && (
                <CustomDecorationRequestModal
                    onClose={closeCustomModal}
                    categoryName={activeTab}
                    language={language}
                />
            )}
            
            <div className="py-20">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap -mb-px space-x-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`px-6 py-3 font-semibold text-xl border-b-4 transition-colors duration-200 ${
                                        activeTab === tab.name
                                        ? 'border-amber-500 text-amber-500'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center max-w-4xl mx-auto mb-12 animate-fadeIn">
                         <p className="text-lg text-gray-600 dark:text-gray-400">
                            {tabs.find(tab => tab.name === activeTab)?.desc}
                        </p>
                        <button
                            onClick={openCustomModal}
                            className="mt-6 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                        >
                            {t.requestCustomDesign}
                        </button>
                    </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fadeIn">
                       {loading && !activeTab ? (
                           Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg aspect-[4/5] animate-pulse"></div>
                           ))
                       ) : filteredWorks.map((work, index) => (
                           <div key={`${work.src}-${index}`} className="group relative overflow-hidden rounded-lg shadow-lg aspect-[4/5] bg-gray-100 dark:bg-gray-800">
                               <img src={work.src} alt={work.alt} className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                   <button 
                                        onClick={() => openModal(work)}
                                        className="w-full bg-amber-500 text-gray-900 font-bold px-4 py-3 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                    >
                                        {t.requestSimilarButton}
                                    </button>
                               </div>
                           </div>
                       ))}
                   </div>

                   { !loading && filteredWorks.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'لا توجد أعمال في هذا القسم حاليًا.' : 'No works in this section currently.'}
                            </p>
                        </div>
                   )}

                </div>
            </div>
        </div>
    );
};

export default DecorationsPage;