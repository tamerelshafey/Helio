import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Language, PortfolioItem } from '../../types';
import { Role } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { CubeIcon } from '../icons/Icons';
import PortfolioItemFormModal from './PortfolioItemFormModal';
import UpgradePlanModal from '../UpgradePlanModal';
import { deletePortfolioItem as apiDeletePortfolioItem } from '../../api/portfolio';
import { useSubscriptionUsage } from '../shared/useSubscriptionUsage';

const DashboardPortfolioPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].dashboard;
    const { currentUser } = useAuth();
    const t_shared = translations[language].adminShared;
    
    const { 
        data: partnerPortfolio, 
        isLoading: loading, 
        isLimitReached,
        refetch 
    } = useSubscriptionUsage('portfolio');

    const [modalState, setModalState] = useState<{ isOpen: boolean; itemToEdit?: PortfolioItem }>({ isOpen: false });
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    
    if (currentUser?.role !== Role.FINISHING_PARTNER) {
        return null;
    }
    
    const handleDelete = async (itemId: string) => {
        if (window.confirm(t.confirmDeleteWork)) {
            await apiDeletePortfolioItem(itemId);
            refetch();
        }
    };

    const handleAddWorkClick = () => {
        if (isLimitReached) {
            setIsUpgradeModalOpen(true);
        } else {
            setModalState({ isOpen: true });
        }
    };

    const handleSave = () => {
        setModalState({ isOpen: false });
        refetch();
    }
    
    return (
        <div>
            {modalState.isOpen && (
                <PortfolioItemFormModal
                    itemToEdit={modalState.itemToEdit}
                    onClose={() => setModalState({ isOpen: false })}
                    onSave={handleSave}
                    language={language}
                />
            )}
            {isUpgradeModalOpen && <UpgradePlanModal language={language} onClose={() => setIsUpgradeModalOpen(false)} />}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.portfolioTitle}</h1>
                <button 
                    onClick={handleAddWorkClick}
                    className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                    {t.addWork}
                </button>
            </div>
            
            {loading ? (
                <p>Loading portfolio...</p>
            ) : partnerPortfolio && partnerPortfolio.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(partnerPortfolio as PortfolioItem[]).map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden group flex flex-col">
                            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                                <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex-grow">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate" title={item.title[language]}>{item.title[language]}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category[language]}</p>
                            </div>
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                                <button onClick={() => setModalState({ isOpen: true, itemToEdit: item })} className="font-medium text-amber-600 dark:text-amber-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50">{t_shared.edit}</button>
                                <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50">{t.portfolioTable.delete}</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <CubeIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">{t.portfolioTable.noWorks}</p>
                </div>
            )}

        </div>
    );
};

export default DashboardPortfolioPage;
