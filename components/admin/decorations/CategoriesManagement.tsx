import React, { useState } from 'react';
import type { Language, DecorationCategory } from '../../../types';
import { translations } from '../../../data/translations';
import { useApiQuery } from '../../shared/useApiQuery';
import { getDecorationCategories, deleteDecorationCategory as apiDeleteDecorationCategory } from '../../../api/decorations';
import AdminDecorationCategoryFormModal from '../AdminDecorationCategoryFormModal';
import { useLanguage } from '../../shared/LanguageContext';

const CategoriesManagement: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.decorationsManagement;
    const { data: categories, refetch: refetchCategories, isLoading: loading } = useApiQuery('decorationCategories', getDecorationCategories);
    const [modalState, setModalState] = useState<{ isOpen: boolean; categoryToEdit?: DecorationCategory }>({ isOpen: false });

    const handleDelete = async (categoryId: string) => {
        if (window.confirm(t.confirmDelete.replace('item', 'category'))) {
            await apiDeleteDecorationCategory(categoryId);
            refetchCategories();
        }
    };

    const handleSave = () => {
        setModalState({ isOpen: false });
        refetchCategories();
    };

    return (
        <div className="animate-fadeIn">
            {modalState.isOpen && <AdminDecorationCategoryFormModal categoryToEdit={modalState.categoryToEdit} onClose={() => setModalState({ isOpen: false })} onSave={handleSave} />}
            <div className="flex justify-end mb-4">
                <button onClick={() => setModalState({ isOpen: true })} className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600">{t.addNewCategory}</button>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <li className="p-8 text-center">Loading...</li>
                    ) : (categories || []).map(cat => (
                        <li key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{cat.name[language]}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{cat.description[language]}</p>
                            </div>
                            <div className="space-x-4">
                                <button onClick={() => setModalState({ isOpen: true, categoryToEdit: cat })} className="font-medium text-amber-600 hover:underline">{translations[language].adminShared.edit}</button>
                                <button onClick={() => handleDelete(cat.id)} className="font-medium text-red-600 hover:underline">{translations[language].adminShared.delete}</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CategoriesManagement;