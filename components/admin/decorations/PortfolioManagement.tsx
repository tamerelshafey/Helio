import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Language, PortfolioItem } from '../../../types';
import { translations } from '../../../data/translations';
import { useApiQuery } from '../../shared/useApiQuery';
import { getAllPortfolioItems, deletePortfolioItem as apiDeletePortfolioItem } from '../../../api/portfolio';
import { getAllPartnersForAdmin } from '../../../api/partners';
import { getDecorationCategories } from '../../../api/decorations';
import AdminPortfolioItemFormModal from '../AdminPortfolioItemFormModal';
import { ArrowDownIcon, ArrowUpIcon } from '../../icons/Icons';

type SortConfig = {
    key: 'title' | 'partnerName';
    direction: 'ascending' | 'descending';
} | null;

const PortfolioManagement: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.decorationsManagement;
    const { data: portfolio, refetch: refetchPortfolio, isLoading: loadingPortfolio } = useApiQuery('portfolio', getAllPortfolioItems);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);
    const { data: decorationCategories, isLoading: loadingCategories } = useApiQuery('decorationCategories', getDecorationCategories);
    const loading = loadingPortfolio || loadingPartners || loadingCategories;

    const [modalState, setModalState] = useState<{ isOpen: boolean; itemToEdit?: PortfolioItem }>({ isOpen: false });
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

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
            {modalState.isOpen && <AdminPortfolioItemFormModal itemToEdit={modalState.itemToEdit} onClose={() => setModalState({ isOpen: false })} onSave={handleSave} language={language} />}
            <div className="flex justify-end mb-4">
                <button onClick={() => setModalState({ isOpen: true })} className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600">{t.addNewItem}</button>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">{t.itemImage}</th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('title')}><div className="flex items-center">{t.itemTitle}{getSortIcon('title')}</div></th>
                            <th className="px-6 py-3">{t.itemCategory}</th>
                            <th className="px-6 py-3">{t.itemActions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-8">Loading...</td></tr>
                        ) : decorationItems.length > 0 ? (
                            decorationItems.map(item => (
                                <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4"><img src={item.src} alt={item.alt} className="w-16 h-16 object-cover rounded-md" /></td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.title[language]}</td>
                                    <td className="px-6 py-4">{item.category[language]}</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => setModalState({ isOpen: true, itemToEdit: item })} className="font-medium text-amber-600 hover:underline">{t.editItem}</button>
                                        <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 hover:underline">{translations[language].adminShared.delete}</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="text-center p-8">{t.noItems}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PortfolioManagement;