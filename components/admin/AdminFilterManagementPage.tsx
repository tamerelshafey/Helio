import React, { useState, useEffect, useCallback } from 'react';
import type { Language, FilterOption } from '../../types';
import { translations } from '../../data/translations';
import FilterItemFormModal from './FilterItemFormModal';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities, deleteFilterOption as apiDeleteFilterOption } from '../../api/filters';
import { useApiQuery } from '../shared/useApiQuery';

type DataType = 'propertyType' | 'finishingStatus' | 'amenity';

const FilterManagerSection: React.FC<{
    title: string;
    items: FilterOption[];
    onAdd: () => void;
    onEdit: (item: FilterOption) => void;
    onDelete: (id: string) => void;
    language: Language;
}> = ({ title, items, onAdd, onEdit, onDelete, language }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
                <button onClick={onAdd} className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600">
                    {translations[language].adminShared.add}
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{item[language]}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'ar' ? item.en : item.ar}</p>
                        </div>
                        <div className="space-x-4">
                            <button onClick={() => onEdit(item)} className="font-medium text-amber-600 hover:underline">Edit</button>
                            <button onClick={() => onDelete(item.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const AdminFilterManagementPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    
    const { data: propertyTypes, isLoading: loadingPT, refetch: refetchPT } = useApiQuery('propertyTypes', getAllPropertyTypes);
    const { data: finishingStatuses, isLoading: loadingFS, refetch: refetchFS } = useApiQuery('finishingStatuses', getAllFinishingStatuses);
    const { data: amenities, isLoading: loadingAm, refetch: refetchAm } = useApiQuery('amenities', getAllAmenities);

    const loading = loadingPT || loadingFS || loadingAm;

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        dataType?: DataType;
        itemToEdit?: FilterOption;
    }>({ isOpen: false });

    const openModal = (dataType: DataType, itemToEdit?: FilterOption) => {
        setModalState({ isOpen: true, dataType, itemToEdit });
    };

    const closeModal = () => {
        setModalState({ isOpen: false });
    };

    const handleSave = () => {
        refetchPT();
        refetchFS();
        refetchAm();
        closeModal();
    };

    const handleDelete = async (dataType: DataType, id: string) => {
        if (window.confirm(`Are you sure you want to delete this ${dataType} option?`)) {
            await apiDeleteFilterOption(dataType, id);
            if(dataType === 'propertyType') refetchPT();
            if(dataType === 'finishingStatus') refetchFS();
            if(dataType === 'amenity') refetchAm();
        }
    };
    
    if (loading) return <p>Loading filter options...</p>;

    return (
        <div>
            {modalState.isOpen && modalState.dataType && (
                <FilterItemFormModal 
                    dataType={modalState.dataType}
                    itemToEdit={modalState.itemToEdit}
                    onClose={closeModal}
                    onSave={handleSave}
                    language={language}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.nav.manageFilters}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage the options available in property forms and search filters.</p>
            
            <div className="space-y-8">
                <FilterManagerSection
                    title="Property Types"
                    items={propertyTypes || []}
                    onAdd={() => openModal('propertyType')}
                    onEdit={(item) => openModal('propertyType', item)}
                    onDelete={(id) => handleDelete('propertyType', id)}
                    language={language}
                />

                <FilterManagerSection
                    title="Finishing Statuses"
                    items={finishingStatuses || []}
                    onAdd={() => openModal('finishingStatus')}
                    onEdit={(item) => openModal('finishingStatus', item)}
                    onDelete={(id) => handleDelete('finishingStatus', id)}
                    language={language}
                />

                <FilterManagerSection
                    title="Amenities"
                    items={amenities || []}
                    onAdd={() => openModal('amenity')}
                    onEdit={(item) => openModal('amenity', item)}
                    onDelete={(id) => handleDelete('amenity', id)}
                    language={language}
                />
            </div>
        </div>
    );
};

export default AdminFilterManagementPage;