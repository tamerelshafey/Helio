import React, { useState, useMemo } from 'react';
import type { Language, Lead } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { useData } from '../shared/DataContext';

type SortConfig = {
    key: 'customerName' | 'partnerName' | 'serviceTitle' | 'createdAt';
    direction: 'ascending' | 'descending';
} | null;

const AdminLeadsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const t_dash = translations[language].dashboard;
    const { leads, loading, deleteLead } = useData();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

    const sortedAndFilteredLeads = useMemo(() => {
        let filteredLeads = [...leads];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredLeads = filteredLeads.filter(lead =>
                lead.customerName.toLowerCase().includes(lowercasedFilter) ||
                (lead.partnerName && lead.partnerName.toLowerCase().includes(lowercasedFilter))
            );
        }

        if (sortConfig !== null) {
            filteredLeads.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredLeads;
    }, [leads, searchTerm, sortConfig]);
    
    const requestSort = (key: 'customerName' | 'partnerName' | 'serviceTitle' | 'createdAt') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'customerName' | 'partnerName' | 'serviceTitle' | 'createdAt') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleDelete = async (leadId: string) => {
        if (window.confirm(t_dash.leadTable.confirmDelete)) {
            await deleteLead(leadId);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.leadsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.leadsSubtitle}</p>

             <div className="mb-4">
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
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerName')}>
                               <div className="flex items-center">{t_dash.leadTable.customer}{getSortIcon('customerName')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('partnerName')}>
                                <div className="flex items-center">{t.leadTable.partner}{getSortIcon('partnerName')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t_dash.leadTable.phone}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('serviceTitle')}>
                                <div className="flex items-center">{t_dash.leadTable.service}{getSortIcon('serviceTitle')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                <div className="flex items-center">{t_dash.leadTable.date}{getSortIcon('createdAt')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t_dash.leadTable.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center p-8">Loading leads...</td></tr>
                        ) : sortedAndFilteredLeads.length > 0 ? (
                            sortedAndFilteredLeads.map(lead => (
                                <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {lead.customerName}
                                        {lead.customerNotes && <p className="font-normal text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-xs truncate" title={lead.customerNotes}>{lead.customerNotes}</p>}
                                    </th>
                                    <td className="px-6 py-4">{lead.partnerName || lead.partnerId}</td>
                                    <td className="px-6 py-4" dir="ltr">{lead.customerPhone}</td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={lead.serviceTitle}>{lead.serviceTitle}</td>
                                    <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(lead.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                            {t_dash.leadTable.delete}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={6} className="text-center p-8">{t_dash.leadTable.noLeads}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLeadsPage;