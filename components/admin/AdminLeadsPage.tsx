

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Language, Lead, LeadStatus, AdminPartner } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { ChevronRightIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import ExportDropdown from '../shared/ExportDropdown';
// FIX: Corrected import path from `api` to `services`.
import { updateLead, deleteLead as apiDeleteLead, getAllLeads } from '../../services/leads';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected import path from `api` to `services`.
import { getAllPartnersForAdmin } from '../../services/partners';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';
import ConversationThread from '../shared/ConversationThread';
import { useLanguage } from '../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

const AdminLeadsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const t_admin = t.adminDashboard;
    const t_dash = t.dashboard;
    const [searchParams] = useSearchParams();
    
    const { data: leads, isLoading: isLoadingLeads, refetch: refetchLeads } = useQuery({ queryKey: ['allLeadsAdmin'], queryFn: getAllLeads });
    const { data: partners, isLoading: isLoadingPartners, refetch: refetchPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const isLoading = isLoadingLeads || isLoadingPartners;
    const refetchAll = useCallback(() => {
        refetchLeads();
        refetchPartners();
    }, [refetchLeads, refetchPartners]);
    
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    
    const initialTab = searchParams.get('tab') as 'all' | 'finishing' | 'decorations' | 'other' | null;
    const [activeTab, setActiveTab] = useState<'all' | 'finishing' | 'decorations' | 'other'>(initialTab || 'all');
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

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
        searchFn: (lead: Lead, term: string) => 
            lead.customerName.toLowerCase().includes(term) ||
            (lead.partnerName && lead.partnerName.toLowerCase().includes(term)),
        filterFns: {
            partner: (l: Lead, v: string) => l.partnerId === v,
            startDate: (l: Lead, v: string) => new Date(l.createdAt) >= new Date(v),
            endDate: (l: Lead, v: string) => new Date(l.createdAt) <= new Date(v),
            tab: (l: Lead, v: string) => {
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

    const handleStatusChange = async (leadId: string, status: LeadStatus) => {
        await updateLead(leadId, { status });
        refetchAll();
    };
    
    const toggleExpand = (leadId: string) => {
        setExpandedLeadId(prevId => (prevId === leadId ? null : leadId));
    };
    
    const handleSelect = (leadId: string) => {
        setSelectedLeads(prev => 
            prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedLeads(e.target.checked ? paginatedLeads.map(l => l.id) : []);
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`${t_admin.bulkActions.delete} ${selectedLeads.length} ${language === 'ar' ? 'طلب؟' : 'leads?'}`)) {
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
        partnerName: t_admin.propertyTable.partner,
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.nav.allLeads}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_admin.manageLeadsSubtitle}</p>
                </div>
                 <ExportDropdown
                    data={exportData}
                    columns={exportColumns}
                    filename="all-leads"
                />
            </div>
            <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                 <TabButton tabKey="all" label={t_admin.filter.all} />
                 <TabButton tabKey="finishing" label={t_admin.nav.finishingRequests} />
                 <TabButton tabKey="decorations" label={t_admin.nav.decorationsRequests} />
                 <TabButton tabKey="other" label={language === 'ar' ? 'أخرى' : 'Other'} />
            </div>

             <div className="my-8 p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                        <input type="text" placeholder={t_admin.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t_admin.filter.filterByPartner}</label>
                        <select value={filters.partner || 'all'} onChange={e => setFilter('partner', e.target.value)} className={selectClasses} disabled={isLoading}>
                            <option value="all">{t_admin.filter.allPartners}</option>
                            {(partnerOptions || []).map(partner => (
                                <option key={partner.id} value={partner.id}>{partner.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t_admin.filter.leadDateRange}</label>
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
                        <span className="font-semibold text-sm">{selectedLeads.length} {t_admin.bulkActions.selected}</span>
                        <button onClick={handleBulkDelete} className="text-sm font-medium text-red-600 hover:text-red-800">{t_admin.bulkActions.delete}</button>
                        <button onClick={() => setSelectedLeads([])} className={`text-sm font-medium text-gray-500 hover:text-gray-700 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t_admin.bulkActions.clear}</button>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-4">
                                <input type="checkbox" onChange={handleSelectAll} checked={paginatedLeads.length > 0 && selectedLeads.length === paginatedLeads.length} ref={input => { if (input) input.indeterminate = selectedLeads.length > 0 && selectedLeads.length < paginatedLeads.length }} />
                            </TableHead>
                            <TableHead className="py-3 w-8"></TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('customerName')}>
                                <div className="flex items-center">{t_dash.leadTable.customer}{getSortIcon('customerName')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('partnerName')}>
                                <div className="flex items-center">{t_admin.propertyTable.partner}{getSortIcon('partnerName')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('serviceTitle')}>
                                <div className="flex items-center">{t_dash.leadTable.service}{getSortIcon('serviceTitle')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>
                                <div className="flex items-center">{t_dash.leadTable.date}{getSortIcon('createdAt')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                                <div className="flex items-center">{t_dash.leadTable.status}{getSortIcon('status')}</div>
                            </TableHead>
                            <TableHead>{t_dash.leadTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={8} className="text-center p-8">Loading leads...</TableCell></TableRow>
                        ) : paginatedLeads.length > 0 ? (
                            paginatedLeads.map(lead => (
                                <React.Fragment key={lead.id}>
                                    <TableRow>
                                        <TableCell className="p-4">
                                             <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => handleSelect(lead.id)} />
                                        </TableCell>
                                        <TableCell className="px-1">
                                            <button onClick={() => toggleExpand(lead.id)} className="p-2">
                                                <ChevronRightIcon className={`w-5 h-5 transition-transform ${expandedLeadId === lead.id ? 'rotate-90' : ''}`} />
                                            </button>
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div>{lead.customerName}</div>
                                            <div className="font-normal text-gray-500 dark:text-gray-400" dir="ltr">{lead.customerPhone}</div>
                                        </TableCell>
                                        <TableCell>{lead.partnerName || lead.partnerId}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={lead.serviceTitle}>{lead.serviceTitle}</TableCell>
                                        <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                        <TableCell>
                                            <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)} className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 ${statusColors[lead.status]}`}>
                                                {Object.entries(t_dash.leadStatus).map(([key, value]) => (<option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{value}</option>))}
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <button onClick={() => handleDelete(lead.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                                {t_dash.leadTable.delete}
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                    {expandedLeadId === lead.id && (
                                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                            <TableCell colSpan={8} className="p-0">
                                                <div className="p-4 animate-fadeIn">
                                                    <ConversationThread lead={lead} onMessageSent={refetchAll} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={8} className="text-center p-8">{t_dash.leadTable.noLeads}</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminLeadsPage;