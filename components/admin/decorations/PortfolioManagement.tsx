

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Language, PortfolioItem } from '../../../types';
import { useQuery } from '@tanstack/react-query';
import { getAllPortfolioItems, deletePortfolioItem as apiDeletePortfolioItem } from '../../../api/portfolio';
import { getAllPartnersForAdmin } from '../../../api/partners';
import { getDecorationCategories } from '../../../api/decorations';
import AdminPortfolioItemFormModal from '../AdminPortfolioItemFormModal';
import { ArrowDownIcon, ArrowUpIcon } from '../../icons/Icons';
import Pagination from '../../shared/Pagination';
import { useLanguage } from '../../shared/LanguageContext';

type SortConfig = {
    key: 'title' | 'partnerName';
    direction: 'ascending' | 'descending';
} | null;

const ITEMS_PER_PAGE = 8;

const PortfolioManagement: React.FC = () => {
    const { language, t: i18n } = useLanguage();
    const t = i18n.adminDashboard.decorationsManagement;
    const { data: portfolio, refetch: refetchPortfolio, isLoading: loadingPortfolio } = useQuery({ queryKey: ['portfolio'], queryFn: getAllPortfolioItems });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: decorationCategories, isLoading: loadingCategories } = useQuery({ queryKey: ['decorationCategories'], queryFn: getDecorationCategories });
    const loading = loadingPortfolio || loadingPartners || loadingCategories;

    const [modalState, setModalState] = useState<{ isOpen: boolean; itemToEdit?: PortfolioItem }>({ isOpen: false });
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const decorationCategoryNames = useMemo(() => (decorationCategories || []).flatMap(c => [c.name.en, c.name.ar]), [decorationCategories]);

    const decorationItems = useMemo(() => {
        let items = (portfolio || []).filter(item => 
            decorationCategoryNames.includes(item.category.en) || 
            decorationCategoryNames.includes(item.category.ar)
        ).map(item => ({...item, partnerName: (partners || []).find(p => p.id === item.partnerId)?.name || 'N/A' }));

        if (sortConfig) {
            items.sort((a, b) => {
                const aValue = a[sortConfig.key][language as 'ar' | 'en'];
                const bValue = b[sortConfig.key][language as 'ar' | 'en'];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [portfolio, partners, decorationCategoryNames, sortConfig, language]);
    
    const totalPages = Math.ceil(decorationItems.length / ITEMS_PER_PAGE);
    const paginatedItems = decorationItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [sortConfig]);

    const requestSort = (key: 'title' | 'partnerName') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'title' | 'partnerName') => {
        if (!sortConfig || sortConfig.key !== key) return <span className="w-4 h-4 ml-1"></span>;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />;
    };

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
        <div className="animate-fadeIn">
            {modalState.isOpen && <AdminPortfolioItemFormModal itemToEdit={modalState.itemToEdit} onClose={() => setModalState({ isOpen: false })} onSave={handleSave} />}
            <div className="flex justify-end mb-4">
                <button onClick={() => setModalState({ isOpen: true })} className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600">{t.addNewItem}</button>
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
                                        <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50">{i18n.adminShared.delete}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                ) : (
                    <div className="p-8 text-center">{t.noItems}</div>
                )}
            </div>
        </div>
    );
};

export default PortfolioManagement;