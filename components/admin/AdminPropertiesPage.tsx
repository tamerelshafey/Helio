import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Property } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { isListingActive } from '../../utils/propertyUtils';
import { useData } from '../shared/DataContext';

type SortConfig = {
    key: 'title' | 'partnerName' | 'status' | 'priceNumeric';
    direction: 'ascending' | 'descending';
} | null;

const AdminPropertiesPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const t_dash = translations[language].dashboard;
    const { properties, loading, deleteProperty } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const sortedAndFilteredProperties = useMemo(() => {
        let filteredProps = [...properties];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredProps = filteredProps.filter(prop =>
                prop.title[language].toLowerCase().includes(lowercasedFilter) ||
                (prop.partnerName && prop.partnerName.toLowerCase().includes(lowercasedFilter))
            );
        }

        if (sortConfig !== null) {
            filteredProps.sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;

                if (sortConfig.key === 'title' || sortConfig.key === 'status') {
                    aValue = a[sortConfig.key][language];
                    bValue = b[sortConfig.key][language];
                } else if (sortConfig.key === 'partnerName') {
                    aValue = a.partnerName || '';
                    bValue = b.partnerName || '';
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredProps;
    }, [properties, searchTerm, sortConfig, language]);

    const requestSort = (key: 'title' | 'partnerName' | 'status' | 'priceNumeric') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'title' | 'partnerName' | 'status' | 'priceNumeric') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleDelete = async (propertyId: string) => {
        if (window.confirm(translations[language].dashboard.propertyTable.confirmDelete)) {
            await deleteProperty(propertyId);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.propertiesTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t.propertiesSubtitle}</p>
                </div>
                <Link to="/admin/properties/new" className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                    {t_dash.addProperty}
                </Link>
            </div>


            <div className="my-8">
                <input
                    type="text"
                    placeholder={t.filter.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t_dash.propertyTable.image}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('title')}>
                                <div className="flex items-center">{t_dash.propertyTable.title}{getSortIcon('title')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('partnerName')}>
                                <div className="flex items-center">{t.propertyTable.partner}{getSortIcon('partnerName')}</div>
                            </th>
                             <th scope="col" className="px-6 py-3">{t.propertyTable.liveStatus}</th>
                            <th scope="col" className="px-6 py-3">{t.propertyTable.listingPeriod}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('priceNumeric')}>
                                <div className="flex items-center">{t_dash.propertyTable.price}{getSortIcon('priceNumeric')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t_dash.propertyTable.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center p-8">Loading properties...</td></tr>
                        ) : sortedAndFilteredProperties.length > 0 ? (
                            sortedAndFilteredProperties.map(prop => (
                                <tr key={prop.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <img src={prop.imageUrl} alt={prop.title[language]} className="w-16 h-16 object-cover rounded-md" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {prop.title[language]}
                                    </th>
                                    <td className="px-6 py-4">{prop.partnerName}</td>
                                    <td className="px-6 py-4">
                                        {isListingActive(prop) ? (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                {t.propertyTable.active}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {t.propertyTable.inactive}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div>{prop.listingStartDate || 'N/A'}</div>
                                        <div>{prop.listingEndDate || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">{prop.price[language]}</td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <Link to={`/admin/properties/edit/${prop.id}`} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">{t.propertyTable.edit}</Link>
                                        <button onClick={() => handleDelete(prop.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                            {t_dash.propertyTable.delete}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={7} className="text-center p-8">{t_dash.propertyTable.noProperties}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPropertiesPage;