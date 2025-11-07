
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Language, Lead, LeadStatus } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { ArrowUpIcon, ArrowDownIcon, ChevronRightIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import ExportDropdown from '../shared/ExportDropdown';
import { getLeadsByPartnerId, updateLead, deleteLead as apiDeleteLead } from '../../api/leads';
import { useApiQuery } from '../shared/useApiQuery';
import ConversationThread from '../shared/ConversationThread';

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
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

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

    const handleStatusChange = async (leadId: string, status: LeadStatus) => {
        await updateLead(leadId, { status });
        refetch();
    };
    
    const toggleExpand = (leadId: string) => {
        setExpandedLeadId(prevId => (prevId === leadId ? null : leadId));
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
                <ExportDropdown data={exportData} columns={exportColumns} filename="my-leads" language={language} />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-4">
                <input type="text" placeholder={t.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses + " max-w-xs"} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClasses + " max-w-xs"}>
                    <option value="all">{t.filter.filterByStatus} ({t.filter.all})</option>
                    {Object.entries(t.leadStatus).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                </select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-8"></th>
                                <th scope="col" className="px-6 py-3">{t.leadTable.customer}</th>
                                <th scope="col" className="px-6 py-3">{t.leadTable.service}</th>
                                <th scope="col" className="px-6 py-3">{t.leadTable.date}</th>
                                <th scope="col" className="px-6 py-3">{t.leadTable.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8">Loading...</td></tr>
                            ) : sortedAndFilteredLeads.length > 0 ? (
                                sortedAndFilteredLeads.map(lead => (
                                    <React.Fragment key={lead.id}>
                                        <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" onClick={() => toggleExpand(lead.id)}>
                                            <td className="px-6 py-4">
                                                <ChevronRightIcon className={`w-5 h-5 transition-transform ${expandedLeadId === lead.id ? 'rotate-90' : ''}`} />
                                            </td>
                                            <td scope="row" className="px-6 py-4">
                                                <div className="font-medium text-gray-900 whitespace-nowrap dark:text-white">{lead.customerName}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">{lead.customerPhone}</div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate" title={lead.serviceTitle}>{lead.serviceTitle}</td>
                                            <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString(language)}</td>
                                            <td className="px-6 py-4">
                                                <span onClick={e => e.stopPropagation()}>
                                                    <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)} className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 ${statusColors[lead.status]}`}>
                                                        {Object.entries(t.leadStatus).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                                                    </select>
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedLeadId === lead.id && (
                                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                                <td colSpan={5} className="p-0">
                                                    <div className="p-4 animate-fadeIn">
                                                        <ConversationThread lead={lead} onMessageSent={refetch} language={language} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center p-8">{t.leadTable.noLeads}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardLeadsPage;
