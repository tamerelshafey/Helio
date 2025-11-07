import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Property, AdminPartner } from '../../types';
import { translations } from '../../data/translations';
import { inputClasses, selectClasses } from '../shared/FormField';
import { isListingActive } from '../../utils/propertyUtils';
import ExportDropdown from '../shared/ExportDropdown';
import { getAllProperties, deleteProperty as apiDeleteProperty, updateProperty as apiUpdateProperty } from '../../api/properties';
import { useDataContext } from '../shared/DataContext';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';

interface AdminPropertiesPageProps {
  language: Language;
  filterOptions?: {
    partnerId?: string;
  };
}

const ITEMS_PER_PAGE = 10;

const AdminPropertiesPage: React.FC<AdminPropertiesPageProps> = ({ language, filterOptions }) => {
    const t = translations[language].adminDashboard;
    const t_dash = translations[language].dashboard;
    const tp = translations[language].propertiesPage;
    
    const { allProperties: properties, allPartners: partners, isLoading, refetchAll } = useDataContext();

    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

     const partnerOptions = useMemo(() => {
        return (partners || [])
            .filter(p => p.type !== 'admin')
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [partners]);

    const {
        paginatedItems: paginatedProperties,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        filters, setFilter,
        requestSort, getSortIcon
    } = useAdminTable({
        data: properties,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'listingStartDate', direction: 'descending' },
        searchFn: (prop, term) => 
            prop.title[language].toLowerCase().includes(term) ||
            (prop.partnerName && prop.partnerName.toLowerCase().includes(term)),
        filterFns: {
            partner: (p, v) => p.partnerId === v,
            status: (p, v) => p.status.en === v,
            type: (p, v) => p.type.en === v,
            startDate: (p, v) => p.listingStartDate && new Date(p.listingStartDate) >= new Date(v),
            endDate: (p, v) => p.listingStartDate && new Date(p.listingStartDate) <= new Date(v),
        }
    });

    const handleSelect = (propertyId: string) => {
        setSelectedProperties(prev => 
            prev.includes(propertyId) 
            ? prev.filter(id => id !== propertyId)
            : [...prev, propertyId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProperties(paginatedProperties.map(p => p.id));
        } else {
            setSelectedProperties([]);
        }
    };

    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        const actionText = t.bulkActions[action];
        if (window.confirm(`Are you sure you want to ${actionText.toLowerCase()} ${selectedProperties.length} properties?`)) {
            const promises = selectedProperties.map(id => {
                switch(action) {
                    case 'activate':
                        return apiUpdateProperty(id, { listingEndDate: '2099-12-31' });
                    case 'deactivate':
                        return apiUpdateProperty(id, { listingEndDate: '2000-01-01' });
                    case 'delete':
                        return apiDeleteProperty(id);
                }
            });
            await Promise.all(promises);
            refetchAll();
            setSelectedProperties([]);
        }
    };
    
    const handleDelete = async (propertyId: string) => {
        if (window.confirm(t_dash.propertyTable.confirmDelete)) {
            await apiDeleteProperty(propertyId);
            refetchAll();
        }
    }

    const exportColumns = {
        [`title.${language}`]: t_dash.propertyTable.title,
        partnerName: t.propertyTable.partner,
        [`status.${language}`]: t_dash.propertyTable.status,
        [`price.${language}`]: t_dash.propertyTable.price,
        listingStartDate: language === 'ar' ? 'تاريخ البدء' : 'Start Date',
        listingEndDate: language === 'ar' ? 'تاريخ الانتهاء' : 'End Date',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.propertiesTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t.propertiesSubtitle}</p>
                </div>
                 <div className="flex items-center gap-4">
                    <ExportDropdown
                        data={paginatedProperties}
                        columns={exportColumns}
                        filename="all-properties"
                        language={language}
                    />
                    <Link to="/admin/properties/new" className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                        {t_dash.addProperty}
                    </Link>
                </div>
            </div>

            <div className="my-8 p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                        <input type="text" placeholder={t.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
                    </div>
                    {!filterOptions?.partnerId && (
                        <div>
                            <label htmlFor="partner-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.filter.filterByPartner}</label>
                            <select id="partner-filter" value={filters.partner || 'all'} onChange={e => setFilter('partner', e.target.value)} className={selectClasses} disabled={isLoading}>
                                <option value="all">{t.filter.allPartners}</option>
                                {(partnerOptions || []).map(partner => (
                                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tp.allStatuses}</label>
                        <select id="status-filter" value={filters.status || 'all'} onChange={e => setFilter('status', e.target.value)} className={selectClasses}>
                            <option value="all">{tp.allStatuses}</option>
                            <option value="For Sale">{tp.forSale}</option>
                            <option value="For Rent">{tp.forRent}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tp.allTypes}</label>
                        <select id="type-filter" value={filters.type || 'all'} onChange={e => setFilter('type', e.target.value)} className={selectClasses}>
                            <option value="all">{tp.allTypes}</option>
                            <option value="Apartment">{tp.apartment}</option>
                            <option value="Villa">{tp.villa}</option>
                            <option value="Commercial">{tp.commercial}</option>
                            <option value="Land">{tp.land}</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.filter.listingDateRange}</label>
                        <div className="flex items-center gap-2">
                            <input type="date" value={filters.startDate || ''} onChange={e => setFilter('startDate', e.target.value)} className={inputClasses} />
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                            <input type="date" value={filters.endDate || ''} onChange={e => setFilter('endDate', e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {selectedProperties.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-sm">{selectedProperties.length} {t.bulkActions.selected}</span>
                        <button onClick={() => handleBulkAction('activate')} className="text-sm font-medium text-green-600 hover:text-green-800">{t.bulkActions.activate}</button>
                        <button onClick={() => handleBulkAction('deactivate')} className="text-sm font-medium text-yellow-600 hover:text-yellow-800">{t.bulkActions.deactivate}</button>
                        <button onClick={() => handleBulkAction('delete')} className="text-sm font-medium text-red-600 hover:text-red-800">{t.bulkActions.delete}</button>
                        <button onClick={() => setSelectedProperties([])} className={`text-sm font-medium text-gray-500 hover:text-gray-700 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t.bulkActions.clear}</button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox" onChange={handleSelectAll} checked={paginatedProperties.length > 0 && selectedProperties.length === paginatedProperties.length} ref={input => { if (input) input.indeterminate = selectedProperties.length > 0 && selectedProperties.length < paginatedProperties.length }} />
                                </th>
                                <th scope="col" className="px-6 py-3">{t_dash.propertyTable.image}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(`title.${language}`)}>
                                    <div className="flex items-center">{t_dash.propertyTable.title}{getSortIcon(`title.${language}`)}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('partnerName')}>
                                    <div className="flex items-center">{t.propertyTable.partner}{getSortIcon('partnerName')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('listingEndDate')}>
                                    <div className="flex items-center">{t.propertyTable.liveStatus}{getSortIcon('listingEndDate')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('listingStartDate')}>
                                    <div className="flex items-center">{t.propertyTable.listingPeriod}{getSortIcon('listingStartDate')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('priceNumeric')}>
                                    <div className="flex items-center">{t_dash.propertyTable.price}{getSortIcon('priceNumeric')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3">{t_dash.propertyTable.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={8} className="text-center p-8">Loading properties...</td></tr>
                            ) : paginatedProperties.length > 0 ? (
                                paginatedProperties.map(prop => (
                                    <tr key={prop.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="w-4 p-4">
                                            <input type="checkbox" checked={selectedProperties.includes(prop.id)} onChange={() => handleSelect(prop.id)} />
                                        </td>
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
                                <tr><td colSpan={8} className="text-center p-8">{t_dash.propertyTable.noProperties}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} language={language} />
            </div>
        </div>
    );
};

export default AdminPropertiesPage;
