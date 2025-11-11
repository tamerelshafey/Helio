

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { PropertyInquiryRequest, RequestStatus } from '../../types';
import { SearchIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { updatePropertyInquiryStatus, deletePropertyInquiry } from '../../services/propertyInquiries';
import Pagination from '../shared/Pagination';
import TableSkeleton from '../shared/TableSkeleton';
import EmptyState from '../shared/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { getAllPropertyInquiries } from '../../services/propertyInquiries';
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

const AdminPropertyInquiriesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_page = t.adminDashboard.propertyInquiries;
    const t_req = t.adminDashboard.adminRequests;
    const { data: propertyInquiries, isLoading, refetch: refetchAll } = useQuery({ queryKey: ['propertyInquiries'], queryFn: getAllPropertyInquiries });

    const {
        paginatedItems: paginatedRequests,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        requestSort, getSortIcon
    } = useAdminTable({
        data: propertyInquiries,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (req: PropertyInquiryRequest, term: string) => 
            req.customerName.toLowerCase().includes(term) ||
            req.customerPhone.includes(term) ||
            req.details.toLowerCase().includes(term),
        filterFns: {}
    });

    const handleStatusChange = async (id: string, status: RequestStatus) => {
        await updatePropertyInquiryStatus(id, status);
        refetchAll();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t_req.confirmDelete)) {
            await deletePropertyInquiry(id);
            refetchAll();
        }
    }

    if (isLoading && !propertyInquiries) {
        return <TableSkeleton cols={5} rows={5} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_page.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_page.subtitle}</p>
            
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
                            <TableHead className="cursor-pointer" onClick={() => requestSort('customerName')}>
                                <div className="flex items-center">{t_req.table.requester}{getSortIcon('customerName')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('details')}>
                                <div className="flex items-center">{t_page.table.details}{getSortIcon('details')}</div>
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
                                        <div className="font-medium text-gray-900 dark:text-white">{req.customerName}</div>
                                        <div className="text-xs text-gray-500">{req.customerPhone}</div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="whitespace-pre-wrap">{req.details}</p>
                                        <p className="text-xs text-gray-400 mt-1">Contact at: {req.contactTime}</p>
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>
                                        <select
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value as RequestStatus)}
                                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 ${statusColors[req.status]}`}
                                        >
                                        {Object.keys(t_req.requestStatus).map((key) => (
                                                <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                    {t_req.requestStatus[key as keyof typeof t_req.requestStatus]}
                                                </option>
                                            ))}
                                        </select>
                                    </TableCell>
                                    <TableCell className="space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleDelete(req.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t_req.table.delete}</button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5}>
                                     <EmptyState
                                        icon={<SearchIcon className="w-12 h-12" />}
                                        title={t_page.noRequests}
                                        subtitle="When users request a search for a specific property, their inquiry will appear here."
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

export default AdminPropertyInquiriesPage;