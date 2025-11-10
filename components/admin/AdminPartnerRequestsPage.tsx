
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, PartnerRequest } from '../../types';
import { UserPlusIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';
import Pagination from '../shared/Pagination';
import TableSkeleton from '../shared/TableSkeleton';
import EmptyState from '../shared/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnerRequests } from '../../services/partnerRequests';
import { useAdminTable } from './shared/useAdminTable';
import { useLanguage } from '../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const ITEMS_PER_PAGE = 10;

const AdminPartnerRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_req = t_admin.adminRequests;
    const { currentUser } = useAuth();
    const { data: partnerRequests, isLoading } = useQuery({ queryKey: ['partnerRequests'], queryFn: getAllPartnerRequests });

    const {
        paginatedItems: paginatedRequests,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        filters, setFilter,
        requestSort, getSortIcon
    } = useAdminTable({
        data: partnerRequests,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (req: PartnerRequest, term: string) => 
            req.companyName.toLowerCase().includes(term) ||
            req.contactName.toLowerCase().includes(term) ||
            req.contactEmail.toLowerCase().includes(term),
        filterFns: {
            status: (req: PartnerRequest, v: string) => req.status === v,
        }
    });

    const getPartnerTypeName = (type: PartnerRequest['companyType']) => {
        return t_admin.partnerTypes[type as keyof typeof t_admin.partnerTypes] || type;
    }
    
    const getStatusName = (status: PartnerRequest['status']) => {
        return t_req.requestStatus[status as keyof typeof t_req.requestStatus] || status;
    }

    if (isLoading && !partnerRequests) {
        return <TableSkeleton cols={5} rows={5} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_req.partnerRequestsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_req.partnerRequestsSubtitle}</p>
            
            <div className="mb-4 flex flex-wrap items-center gap-4">
                 <Input
                    type="text"
                    placeholder={t_admin.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <Select value={filters.status || 'pending'} onChange={(e) => setFilter('status', e.target.value)} className="max-w-xs">
                    <option value="all">{t_admin.filter.all}</option>
                    <option value="pending">{t_req.requestStatus.pending}</option>
                    <option value="approved">{t_req.requestStatus.approved}</option>
                    <option value="rejected">{t_req.requestStatus.rejected}</option>
                </Select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('companyName')}>
                                <div className="flex items-center">{t_admin.partnerTable.partner}{getSortIcon('companyName')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('companyType')}>
                                <div className="flex items-center">{t_admin.partnerTable.type}{getSortIcon('companyType')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>
                                <div className="flex items-center">{t_req.table.date}{getSortIcon('createdAt')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                                <div className="flex items-center">{t_admin.partnerTable.status}{getSortIcon('status')}</div>
                            </TableHead>
                            <TableHead>{t_admin.partnerTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedRequests.length > 0 ? (
                            paginatedRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img src={req.logo} alt={req.companyName} className="w-10 h-10 rounded-full object-cover"/>
                                        <div>
                               