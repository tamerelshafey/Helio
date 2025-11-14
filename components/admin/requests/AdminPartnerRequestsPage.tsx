
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnerRequests } from '../../../services/partnerRequests';
// FIX: Corrected import path for useAdminTable hook.
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import type { PartnerRequest } from '../../../types';
import { Button } from '../../ui/Button';

const AdminPartnerRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;

    const { data: requests, isLoading } = useQuery({ 
        queryKey: ['partnerRequests'], 
        queryFn: getAllPartnerRequests 
    });

    const { paginatedItems, totalPages, currentPage, setCurrentPage } = useAdminTable({
        data: requests,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: PartnerRequest, term: string) => 
            item.companyName.toLowerCase().includes(term) || 
            item.contactName.toLowerCase().includes(term),
        filterFns: {},
    });

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.partnerRequestsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_admin.partnerRequestsSubtitle}</p>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_admin.table.companyInfo}</TableHead>
                            <TableHead>{t_admin.table.primaryContact}</TableHead>
                            <TableHead>{t_admin.table.date}</TableHead>
                            <TableHead>{t_admin.table.status}</TableHead>
                            <TableHead>{t_admin.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-white">{req.companyName}</div>
                                        <div className="text-sm text-gray-500 capitalize">{req.companyType}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{req.contactName}</div>
                                        <div className="text-sm text-gray-500">{req.contactPhone}</div>
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full capitalize">
                                            {t_admin.requestStatus[req.status as keyof typeof t_admin.requestStatus]}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/admin/partner-requests/${req.id}`}>
                                            <Button variant="outline" size="sm">
                                                {t_admin.table.details}
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">{t_admin.noPartnerRequests}</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPartnerRequestsPage;