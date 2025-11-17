

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads } from '../../../services/leads';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Lead } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
// FIX: Corrected import path for Pagination from '../shared/Pagination' to '../../ui/Pagination'.
import Pagination from '../../ui/Pagination';

const AdminPlatformFinishingPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_dash = t.dashboard;

    const { data: allLeads, isLoading } = useQuery({ 
        queryKey: ['allLeadsAdmin'], 
        queryFn: getAllLeads 
    });

    const platformFinishingLeads = useMemo(() => {
        return (allLeads || []).filter(l => 
            l.serviceType === 'finishing' && l.partnerId === 'admin-user'
        );
    }, [allLeads]);

    const { paginatedItems, totalPages, currentPage, setCurrentPage } = useAdminTable({
        data: platformFinishingLeads,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: Lead, term) => item.customerName.toLowerCase().includes(term),
        filterFns: {},
    });

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.nav.platformFinishing}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                {language === 'ar' 
                    ? 'إدارة الطلبات الواردة لباقات التشطيب الاستشارية التي تقدمها المنصة مباشرة.' 
                    : 'Manage incoming requests for the advisory finishing packages offered directly by the platform.'
                }
            </p>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_dash.leadTable.customer}</TableHead>
                            <TableHead>{t_dash.leadTable.service}</TableHead>
                            <TableHead>{t_dash.leadTable.date}</TableHead>
                            <TableHead>{t_dash.leadTable.status}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center p-8">Loading requests...</TableCell></TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell>{lead.customerName}</TableCell>
                                    <TableCell>{lead.serviceTitle}</TableCell>
                                    <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>{lead.status}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={4} className="text-center p-8">No requests found for platform finishing packages.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPlatformFinishingPage;