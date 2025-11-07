import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Language, PortfolioItem, DecorationCategory } from '../../types';
import { translations } from '../../data/translations';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPortfolioItems, deletePortfolioItem as apiDeletePortfolioItem } from '../../api/portfolio';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getDecorationCategories } from '../../api/decorations';
import AdminPortfolioItemFormModal from './AdminPortfolioItemFormModal';
import Pagination from '../shared/Pagination';

const ITEMS_PER_PAGE = 8;

const AdminDecorationsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.decorationsManagement;
    const { data: portfolio, refetch: refetchPortfolio, isLoading: loadingPortfolio } = useApiQuery('portfolio', getAllPortfolioItems);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);
    const { data: decorationCategories, isLoading: loadingCategories } = useApiQuery('decorationCategories', getDecorationCategories);
    const loading = loadingPortfolio || loadingPartners || loadingCategories;

    const [modalState, setModalState] = useState<{ isOpen: boolean; itemToEdit?: PortfolioItem }>({ isOpen: false });
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');

    const decorationCategoryNames = useMemo(() => (decorationCategories || []).flatMap(c => [c.name.en, c.name.ar]), [decorationCategories]);

    const decorationItems = useMemo(() => {
        return (portfolio || []).filter(item => 
            decorationCategoryNames.includes(item.category.en) || 
            decorationCategoryNames.includes(item.category.ar)
        ).map(item => ({...item, partnerName: (partners || []).find(p => p.id === item.partnerId)?.name || 'N/A' }));
    }, [portfolio, partners, decorationCategoryNames]);
    
    const filteredItems = useMemo(() => {
        if (activeTab === 'all') {
            return decorationItems;
        }
        return decorationItems.filter(item => item.category[language] === activeTab);
    }, [decorationItems, activeTab, language]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    const tabs = useMemo(() => {
        if (!decorationCategories) return [];
        const categoryNames = decorationCategories.map(c => c.name[language]);
        return ['all', ...categoryNames];
    }, [decorationCategories, language]);

    const handleDelete = async (itemId: string) => {
        if (window.confirm(t.confirmDelete)) {
            await apiDeletePortfolioItem(itemId);
            refetchPortfolio();
        }
    };

    const handleSave = () => {
        setModalState({ isOpen: false });
        refetchPortfolio();
    };

    return (
        <div>
             {modalState.isOpen && <AdminPortfolioItemFormModal itemToEdit={modalState.itemToEdit} onClose={() => setModalState({ isOpen: false })} onSave={handleSave} language={language} />}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.portfolioTab}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>

            <div className="flex justify-between items-center mb-4">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-amber-500 text-amber-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                            >
                                {tab === 'all' ? (language === 'ar' ? 'الكل' : 'All') : tab}
                            </button>
                        ))}
                    </nav>
                </div>
                <button onClick={() => setModalState({ isOpen: true })} className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 h-fit">
                    {t.addNewItem}
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                 {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : paginatedItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                            {paginatedItems.map(item => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden group flex flex-col">
                                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                                        <img src={item.imageUrl} alt={item.alt} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate" title={item.title[language]}>{item.title[language]}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category[language]}</p>
                                    </div>
                                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                                        <button onClick={() => setModalState({ isOpen: true, itemToEdit: item })} className="font-medium text-amber-600 dark:text-amber-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50">{t.editItem}</button>
                                        <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50">{translations[language].adminShared.delete}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} language={language} />
                    </>
                ) : (
                    <div className="p-8 text-center">{t.noItems}</div>
                )}
            </div>
        </div>
    );
};

export default AdminDecorationsPage;