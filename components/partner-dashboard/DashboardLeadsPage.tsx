


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Language, Lead, LeadStatus } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { ArrowUpIcon, ArrowDownIcon, ChevronRightIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import ExportDropdown from '../shared/ExportDropdown';
import { getLeadsByPartnerId, updateLead, deleteLead as apiDeleteLead } from '../../api/leads';
import { useQuery } from '@tanstack/react-query';
import ConversationThread from '../shared/ConversationThread';
import { useLanguage } from '../shared/LanguageContext';
import { Select } from '../ui/Select';
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

type SortConfig = {
    key: keyof Lead;
    direction: 'ascending' | 'descending';
} | null;

const DashboardLeadsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_dash = t.dashboard;
    const { currentUser } = useAuth();
    const { data: partnerLeads, isLoading: loading, refetch } = useQuery({
        queryKey: [`partner-leads-${currentUser?.id}`],
        queryFn: () => getLeadsByPartnerId(currentUser!.id),
        enabled: !!currentUser,
    });

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
        status: t_dash.leadStatus[lead.status] || lead.status,
        createdAt: new Date(lead.createdAt).toLocaleDateString(language),
    })), [sortedAndFilteredLeads, t_dash.leadStatus, language]);

    const exportColumns = {
        customerName: t_dash.leadTable.customer,
        customerPhone: t_dash.leadTable.phone,
        serviceTitle: t_dash.leadTable.service,
        status: t_dash.leadTable.status,
        createdAt: t_dash.leadTable.date,
    };

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_dash.leadsTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_dash.leadsSubtitle}</p>
                </div>
                <ExportDropdown data={exportData} columns={exportColumns} filename="my-leads" />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-4">
                <input type="text" placeholder={t_dash.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses + " max-w-xs"} />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
                    <option value="all">{t_dash.filter.filterByStatus} ({t_dash.filter.all})</option>
                    {Object.entries(t_dash.leadStatus).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                </Select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8"></TableHead>
                            <TableHead>{t_dash.leadTable.customer}</TableHead>
                            <TableHead>{t_dash.leadTable.service}</TableHead>
                            <TableHead>{t_dash.leadTable.date}</TableHead>
                            <TableHead>{t_dash.leadTable.status}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : sortedAndFilteredLeads.length > 0 ? (
                            sortedAndFilteredLeads.map(lead => (
                                <React.Fragment key={lead.id}>
                                    <TableRow className="cursor-pointer" onClick={() => toggleExpand(lead.id)}>
                                        <TableCell>
                                            <ChevronRightIcon className={`w-5 h-5 transition-transform ${expandedLeadId === lead.id ? 'rotate-90' : ''}`} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900 whitespace-nowrap dark:text-white">{lead.customerName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">{lead.customerPhone}</div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate" title={lead.serviceTitle}>{lead.serviceTitle}</TableCell>
                                        <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                        <TableCell>
                                            <span onClick={e => e.stopPropagation()}>
                                                <Select value={lead.status} onChange={(e) =>