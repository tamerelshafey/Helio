import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Language, Lead, LeadStatus } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import ExportDropdown from '../shared/ExportDropdown';
import { getLeadsByPartnerId, updateLead, deleteLead as apiDeleteLead } from '../../api/leads';
import { useApiQuery } from '../shared/useApiQuery';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: keyof Lead;
    direction: 'ascending' | 'descending';
} | null;

const DashboardLeadsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].dashboard;
    const { currentUser } = useAuth();
    const { data: partnerLeads, isLoading: loading, refetch } = useApiQuery(
        `partner-leads-${currentUser?.id}`,
        () => getLeadsByPartnerId(currentUser!.id),
        { enabled: !!currentUser }
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

    const sortedAndFilteredLeads = useMemo(() => {
        if (!partnerLeads) return [];
        let filteredLeads = [...partnerLeads];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredLeads = filteredLeads.filter(lead =>
                lead.customerName.toLowerCase().includes(lowercasedFilter) ||
                lead.serviceTitle.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (statusFilter !== 'all') {
            filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
        }

        if (sortConfig !== null) {
            filteredLeads.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

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
    }, [partnerLeads, searchTerm, statusFilter, sortConfig]);

    const requestSort = (key: keyof Lead) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Lead) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />;
        }
        return <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleDelete = async (leadId: string) => {
        if (window.confirm(t.leadTable.confirmDelete)) {
            await apiDeleteLead(leadId);
            refetch();
        }
    };

    const handleStatusChange = async (leadId: string, status: LeadStatus) => {
        await updateLead(leadId, { status });
        refetch();
    };

    const exportData = useMemo(() => (sortedAndFilteredLeads || []).map(lead => ({
        ...lead,
        status: t.leadStatus[lead.status] || lead.status,
        createdAt: new Date(lead.createdAt).toLocaleDateString(language),
    })), [sortedAndFilteredLeads, t.leadStatus, language]);

    const exportColumns = {
        customerName: t.leadTable.customer,
        customerPhone: t.leadTable.phone,
        serviceTitle: t.leadTable.service,
        status: t.leadTable.status,
        createdAt: t.leadTable.date,
    };

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.leadsTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t.leadsSubtitle}</p>
                </div>
                <ExportDropdown
                    data={exportData}
                    columns={exportColumns}
                    filename="my-leads"
                    language={language}
                />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-4">
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
                    {Object.entries(t.leadStatus).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerName')}>
                                <div className="flex items-center">{t.leadTable.customer}{getSortIcon('customerName')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerPhone')}>
                                <div className="flex items-center">{t.leadTable.phone}{getSortIcon('customerPhone')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('serviceTitle')}>
                                <div className="flex items-center">{t.leadTable.service}{getSortIcon('serviceTitle')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('contactTime')}>
                                <div className="flex items-center">{t.leadTable.contactTime}{getSortIcon('contactTime')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                <div className="flex items-center">{t.leadTable.date}{getSortIcon('createdAt')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>
                                <div className="flex items-center">{t.leadTable.status}{getSortIcon('status')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t.leadTable.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center p-8">Loading...</td></tr>
                        ) : sortedAndFilteredLeads.length > 0 ? (
                            sortedAndFilteredLeads.map(lead => (
                                <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {lead.customerName}
                                        {lead.customerNotes && <p className="font-normal text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-xs truncate" title={lead.customerNotes}>{lead.customerNotes}</p>}
                                    </th>
                                    <td className="px-6 py-4" dir="ltr">{lead.customerPhone}</td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={lead.serviceTitle}>{lead.serviceTitle}</td>
                                    <td className="px-6 py-4">{lead.contactTime}</td>
                                    <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 ${statusColors[lead.status]}`}
                                        >
                                           {Object.entries(t.leadStatus).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(lead.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t.leadTable.delete}</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={7} className="text-center p-8">{t.leadTable.noLeads}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardLeadsPage;