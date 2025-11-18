
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads } from '../../../services/leads';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Lead, LeadStatus } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../ui/Pagination';
import { Button } from '../../ui/Button';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

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
                            <TableHead>{t_dash.leadTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading requests...</TableCell></TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">
                                        {lead.customerName}
                                        <div className="text-xs text-gray-500">{lead.customerPhone}</div>
                                    </TableCell>
                                    <TableCell>{lead.serviceTitle}</TableCell>
                                    <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[lead.status]}`}>
                                            {t_dash.leadStatus[lead.status] || lead.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/admin/requests/${lead.id}`}>
                                            <Button variant="link" size="sm">View Details</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={5} className="text-center p-8">No requests found for platform finishing packages.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPlatformFinishingPage;
