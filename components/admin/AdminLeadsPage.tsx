import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Language, Lead, LeadStatus, AdminPartner } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { inputClasses, selectClasses } from '../shared/FormField';
import ExportDropdown from '../shared/ExportDropdown';
import { deleteLead as apiDeleteLead } from '../../api/leads';
import { useDataContext } from '../shared/DataContext';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';
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

// FIX: Define missing ITEMS_PER_PAGE constant
const ITEMS_PER_PAGE = 10;

const AdminLeadsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const { currentUser } = useAuth();
    const t_dash = translations[language].dashboard;
    const [searchParams] = useSearchParams();
    
    const { allLeads: leads, allPartners: partners, isLoading, refetchAll } = useDataContext();
    
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    
    const initialTab = searchParams.get('tab') as 'all' | 'finishing' | 'decorations' | 'other' | null;
    const [activeTab, setActiveTab] = useState<'all' | 'finishing' | 'decorations' | 'other'>(initialTab || 'all');

    const partnerOptions = useMemo(() => {
        return (partners || [])
            .filter(p => p.type !== 'admin')
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [partners]);
    
    const {
        paginatedItems: paginatedLeads,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        filters, setFilter,
        requestSort, getSortIcon,
    } = useAdminTable({
        data: leads,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'createdAt', direction: 'descending' },
        // FIX: Add explicit type to lambda arguments for robustness.
        searchFn: (lead: Lead, term) => 
            lead.customerName.toLowerCase().includes(term) ||
            (lead.partnerName && lead.partnerName.toLowerCase().includes(term)),
        filterFns: {
            partner: (l: Lead, v) => l.partnerId === v,
            startDate: (l: Lead, v) => new Date(l.createdAt) >= new Date(v),
            endDate: (l: Lead, v) => new Date(l.createdAt) <= new Date(v),
            tab: (l: Lead, v) => {
                 if (v === 'all') return true;
                 if (v === 'finishing') return l.serviceType === 'finishing';
                 if (v === 'decorations') return l.serviceType === 'decorations';
                 if (v === 'other') return l.serviceType !== 'finishing' && l.serviceType !== 'decorations';
                 return true;
            }
        }
    });
    
    useEffect(() => {
        setFilter('tab', activeTab);
    }, [activeTab, setFilter]);
    
    const handleSelect = (leadId: string) => {
        setSelectedLeads(prev => 
            prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedLeads(e.target.checked ? paginatedLeads.map(l => l.id) : []);
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`${t.bulkActions.delete} ${selectedLeads.length} ${language === 'ar' ? 'طلب؟' : 'leads?'}`)) {
            await Promise.all(selectedLeads.map(id => apiDeleteLead(id)));
            refetchAll();
            setSelectedLeads([]);
        }
    };

    const handleDelete = async (leadId: string) => {
        if (window.confirm(t_dash.leadTable.confirmDelete)) {
            await apiDeleteLead(leadId);
            refetchAll();
        }
    };
    
    const exportData = useMemo(() => paginatedLeads.map(lead => ({
        ...lead,
        status: t_dash.leadStatus[lead.status] || lead.status, // Translate status
        createdAt: new Date(lead.createdAt).toLocaleDateString(language)
    })), [paginatedLeads, t_dash.leadStatus, language]);

    const exportColumns = {
        customerName: t_dash.leadTable.customer,
        partnerName: t.propertyTable.partner,
        customerPhone: t_dash.leadTable.phone,
        serviceTitle: t_dash.leadTable.service,
        status: t_dash.leadTable.status,
        createdAt: t_dash.leadTable.date,
    };

    const TabButton: React.FC<{tabKey: 'all' | 'finishing' | 'decorations' | 'other', label: string}> = ({tabKey, label}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 font-medium rounded-md text-sm ${activeTab === tabKey ? 'bg-amber-500 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.nav.allLeads}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t.manageLeadsSubtitle}</p>
                </div>
                 <ExportDropdown
                    data={exportData}
                    columns={exportColumns}
                    filename="all-leads"
                    language={language}
                />
            </div>
            <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                 <TabButton tabKey="all" label={t.filter.all} />
                 <TabButton tabKey="finishing" label={t.nav.finishingRequests} />
                 <TabButton tabKey="decorations" label={t.nav.decorationsRequests} />
                 <TabButton tabKey="other" label={language === 'ar' ? 'أخرى' : 'Other'} />
            </div>

             <div className="my-8 p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                        <input type="text" placeholder={t.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.filter.filterByPartner}</label>
                        <select value={filters.partner || 'all'} onChange={e => setFilter('partner', e.target.value)} className={selectClasses} disabled={isLoading}>
                            <option value="all">{t.filter.allPartners}</option>
                            {(partnerOptions || []).map(partner => (
                                <option key={partner.id} value={partner.id}>{partner.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.filter.leadDateRange}</label>
                        <div className="flex items-center gap-2">
                            <input type="date" value={filters.startDate || ''} onChange={e => setFilter('startDate', e.target.value)} className={inputClasses} />
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                            <input type="date" value={filters.endDate || ''} onChange={e => setFilter('endDate', e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {selectedLeads.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-sm">{selectedLeads.length} {t.bulkActions.selected}</span>
                        <button onClick={handleBulkDelete} className="text-sm font-medium text-red-600 hover:text-red-800">{t.bulkActions.delete}</button>
                        <button onClick={() => setSelectedLeads([])} className={`text-sm font-medium text-gray-500 hover:text-gray-700 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t.bulkActions.clear}</button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">
                                     <input type="checkbox" onChange={handleSelectAll} checked={paginatedLeads.length > 0 && selectedLeads.length === paginatedLeads.length} ref={input => { if (input) input.indeterminate = selectedLeads.length > 0 && selectedLeads.length < paginatedLeads.length }} />
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerName')}>
                                <div className="flex items-center">{t_dash.leadTable.customer}{getSortIcon('customerName')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('partnerName')}>
                                    <div className="flex items-center">{t.propertyTable.partner}{getSortIcon('partnerName')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerPhone')}>
                                    <div className="flex items-center">{t_dash.leadTable.phone}{getSortIcon('customerPhone')}</div>
                                </th>
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
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center p-8">Loading leads...</td></tr>
                            ) : paginatedLeads.length > 0 ? (
                                paginatedLeads.map(lead => (
                                    <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="w-4 p-4">
                                             <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => handleSelect(lead.id)} />
                                        </td>
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
                                <tr><td colSpan={7} className="text-center p-8">{t_dash.leadTable.noLeads}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} language={language} />
            </div>
        </div>
    );
};

export default AdminLeadsPage;