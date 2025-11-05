import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Language, Property } from '../../types';
import { Role } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { BuildingIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import UpgradePlanModal from '../UpgradePlanModal';
import ExportDropdown from '../shared/ExportDropdown';
// FIX: Corrected import path from 'api' to 'mockApi'.
import { deleteProperty as apiDeleteProperty } from '../../mockApi/properties';
import { useSubscriptionUsage } from '../shared/useSubscriptionUsage';


const DashboardPropertiesPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].dashboard;
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { 
        data: partnerProperties, 
        isLoading: loading, 
        isLimitReached,
        refetch 
    } = useSubscriptionUsage('properties');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    
    const filteredProperties = useMemo(() => {
        if (!partnerProperties) return [];
        let filteredProps = [...(partnerProperties as Property[])];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredProps = filteredProps.filter(prop =>
                prop.title[language].toLowerCase().includes(lowercasedFilter)
            );
        }

        if (statusFilter !== 'all') {
            filteredProps = filteredProps.filter(prop => prop.status.en === statusFilter);
        }
        
        return filteredProps;
    }, [partnerProperties, searchTerm, statusFilter, language]);

    if (currentUser?.role !== Role.AGENCY_PARTNER) {
        return null;
    }

    const handleDelete = async (propertyId: string) => {
        if (window.confirm(t.propertyTable.confirmDelete)) {
            await apiDeleteProperty(propertyId);
            refetch();
        }
    };
    
    const handleAddPropertyClick = () => {
        if (isLimitReached) {
            setIsUpgradeModalOpen(true);
        } else {
            navigate('/dashboard/properties/new');
        }
    };

    const exportColumns = {
        [`title.${language}`]: t.propertyTable.title,
        [`status.${language}`]: t.propertyTable.status,
        [`price.${language}`]: t.propertyTable.price,
        area: language === 'ar' ? 'المساحة (م²)' : 'Area (m²)',
    };
    

    return (
        <div>
            {isUpgradeModalOpen && <UpgradePlanModal language={language} onClose={() => setIsUpgradeModalOpen(false)} />}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.propertiesTitle}</h1>
                 <div className="flex items-center gap-4">
                    <ExportDropdown
                        data={filteredProperties}
                        columns={exportColumns}
                        filename="my-properties"
                        language={language}
                    />
                    <button 
                        onClick={handleAddPropertyClick}
                        className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        {t.addProperty}
                    </button>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    placeholder={t.filter.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={selectClasses + " max-w-xs"}
                >
                    <option value="all">{t.filter.filterByStatus} ({t.filter.all})</option>
                    <option value="For Sale">{translations[language].propertiesPage.forSale}</option>
                    <option value="For Rent">{translations[language].propertiesPage.forRent}</option>
                </select>
            </div>
            
            {loading ? (
                <p>Loading properties...</p>
            ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProperties.map(prop => {
                        const isForSale = prop.status.en === 'For Sale';
                        return (
                            <div key={prop.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden group flex flex-col">
                                <div className="relative">
                                    <img src={prop.imageUrl} alt={prop.title[language]} className="w-full h-48 object-cover" />
                                     <span className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} text-white font-semibold px-3 py-1 rounded-md text-xs ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
                                        {prop.status[language]}
                                    </span>
                                </div>
                                <div className="p-4 flex-grow">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate" title={prop.title[language]}>{prop.title[language]}</h3>
                                    <p className="text-amber-500 font-semibold mt-1">{prop.price[language]}</p>
                                </div>
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                                    <Link to={`/dashboard/properties/edit/${prop.id}`} className="font-medium text-amber-600 dark:text-amber-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50">{t.propertyTable.edit}</Link>
                                    <button onClick={() => handleDelete(prop.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50">{t.propertyTable.delete}</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <BuildingIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">{t.propertyTable.noProperties}</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPropertiesPage;
