

import React from 'react';
import type { ContactRequest, RequestStatus } from '../../types';
import { inputClasses } from '../shared/FormField';
import { updateContactRequestStatus, deleteContactRequest } from '../../api/contactRequests';
import Pagination from '../shared/Pagination';
import TableSkeleton from '../shared/TableSkeleton';
import EmptyState from '../shared/EmptyState';
import { InboxIcon } from '../icons/Icons';
import { useQuery } from '@tanstack/react-query';
import { getAllContactRequests } from '../../api/contactRequests';
import { useAdminTable } from './shared/useAdminTable';
import { useLanguage } from '../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

const statusColors: { [key in RequestStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

const AdminContactRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_req = t.adminDashboard.adminRequests;
    const { data: contactRequests, isLoading, refetch: refetchAll } = useQuery({ queryKey: ['contactRequests'], queryFn: getAllContactRequests });

    const {
        paginatedItems: paginatedRequests,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        requestSort, getSortIcon
    } = useAdminTable({
        data: contactRequests,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (req: ContactRequest, term: string) => 
            req.name.toLowerCase().includes(term) ||
            req.phone.includes(term) ||
            (req.companyName && req.companyName.toLowerCase().includes(term)),
        filterFns: {}
    });

    const handleStatusChange = async (id: string, status: RequestStatus) => {
        await updateContactRequestStatus(id, status);
        refetchAll();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t_req.confirmDelete)) {
            await deleteContactRequest(id);
            refetchAll();
        }
    }

    if (isLoading && !contactRequests) {
        return <TableSkeleton cols={5} rows={5} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_req.contactRequestsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_req.contactRequestsSubtitle}</p>
            
             <div className="mb-4">
                <input
                    type="text"
                    placeholder={t.adminDashboard.filter.searchByRequesterOrPhone}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                                <div className="flex items-center">{t_req.table.requester}{getSortIcon('name')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('message')}>
                                <div className="flex items-center">{t_req.table.message}{getSortIcon('message')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>
                                <div className="flex items-center">{t_req.table.date}{getSortIcon('createdAt')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                                <div className="flex items-center">{t_req.table.status}{getSortIcon('status')}</div>
                            </TableHead>
                            <TableHead>{t_req.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedRequests.length > 0 ? (
                            paginatedRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-white">{req.name}</div>
                                        <div className="text-xs text-gray-500">{req.phone}</div>
                                        {req.inquiryType === 'partner' && (
                                            <div className="mt-1 text-xs font-semibold p-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded inline-block">
                                                {req.companyName} ({req.businessType})
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="truncate" title={req.message}>{req.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">Contact at: {req.contactTime}</p>
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[req.status]}`}>
                                            {t_req.requestStatus[req.status]}
                                        </span>
                                    </TableCell>
                                    <TableCell className="space-x-2 whitespace-nowrap">
                                        {req.status === 'pending' && (
                                            <button onClick={() => handleStatusChange(req.id, 'reviewed')} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t_req.table.markAsReviewed}</button>
                                        )}
                                        <button onClick={() => handleDelete(req.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t_req.table.delete}</button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <EmptyState
                                        icon={<InboxIcon className="w-12 h-12" />}
                                        title={t_req.noContactRequests}
                                        subtitle="When new messages are sent through the contact form, they will appear here."
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminContactRequestsPage;