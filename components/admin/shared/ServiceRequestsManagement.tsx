import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, LeadStatus, AdminPartner } from '../../../types';
import { inputClasses } from '../../shared/FormField';
import Pagination from '../../shared/Pagination';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected import path from `api` to `services`.
import { getAllLeads } from '../../../services/leads';
import { getAllPartnersForAdmin } from '../../../services/partners';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';

const statusColors: { [key in LeadStatus]?: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

interface ServiceRequestsManagementProps {
  serviceType: 'finishing' | 'decorations';
  title: string;
  subtitle: string;
  detailsUrlPrefix: string;
}

const ServiceRequestsManagement: React.FC<ServiceRequestsManagementProps> = ({ serviceType, title, subtitle, detailsUrlPrefix }) => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_dash = t.dashboard;

    const { data: allLeads, isLoading: isLoadingLeads } = useQuery({ queryKey: ['allLeadsAdmin'], queryFn: getAllLeads });
    const { data: allPartners, isLoading: isLoadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const isLoading = isLoadingLeads || isLoadingPartners;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const partnersMap = useMemo(() => {
        if (!allPartners) return new Map<string, AdminPartner>();
        return new Map(allPartners.map(p => [p.id, p]));
    }, [allPartners]);

    const serviceLeads = useMemo(() => {
        let leads = (allLeads || []).filter(lead => lead.serviceType === serviceType);
        
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            leads = leads.filter(l => new Date(l.createdAt) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23,59,59,999);
            leads = leads.filter(l => new Date(l.createdAt) <= end);
        }

        return leads.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    }, [allLeads, startDate, endDate, serviceType]);

    const totalPages = Math.ceil(serviceLeads.length / ITEMS_PER_PAGE);
    const paginatedLeads = serviceLeads.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate]);

    const getAssignedToName = (assignedTo?: string) => {
        if (!assignedTo) return <span className="text-gray-400">Unassigned</span>;
        if (assignedTo === 'internal-team') return t_admin.finishingRequests.internalTeam;
        return partnersMap.get(assignedTo)?.name || assignedTo;
    };

    return (
        <div className="animate-fadeIn">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
             <p className="text-gray-500 dark:text-gray-400 mb-8">{subtitle}</p>

             <div className="mb-4 flex gap-4">
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">{t_admin.decorationsManagement.startDate}</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses}/>
                </div>
                 <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">{t_admin.decorationsManagement.endDate}</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses}/>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_dash.leadTable.customer}</TableHead>
                            <TableHead>{t_dash.leadTable.service}</TableHead>
                            <TableHead>{t_dash.leadTable.date}</TableHead>
                            <TableHead>{t_dash.leadTable.status}</TableHead>
                            <TableHead>{t_admin.finishingRequests.assignedTo}</TableHead>
                            <TableHead>{t_dash.leadTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedLeads.length > 0 ? (
                            paginatedLeads.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">{lead.customerName}<br/><span className="font-normal text-gray-500">{lead.customerPhone}</span></TableCell>
                                    <TableCell>{lead.serviceTitle}</TableCell>
                                    <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[lead.status] || ''}`}>
                                            {t_dash.leadStatus[lead.status as keyof typeof t_dash.leadStatus] || lead.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-800 dark:text-gray-200">{getAssignedToName(lead.assignedTo)}</TableCell>
                                    <TableCell>
                                        <Link to={`${detailsUrlPrefix}/${lead.id}`} className="font-medium text-amber-600 hover:underline">
                                            {t_admin.finishingRequests.manage}
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} className="text-center p-8">{t_admin.decorationsManagement.noRequests}</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default ServiceRequestsManagement;