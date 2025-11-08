
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, PartnerRequest } from '../../types';
import { translations } from '../../data/translations';
import { inputClasses } from '../shared/FormField';
import { UserPlusIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';
import Pagination from '../shared/Pagination';
import TableSkeleton from '../shared/TableSkeleton';
import EmptyState from '../shared/EmptyState';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { useAdminTable } from './shared/useAdminTable';
import { useLanguage } from '../shared/LanguageContext';

const ITEMS_PER_PAGE = 10;

const AdminPartnerRequestsPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard;
    const t_req = t.adminRequests;
    const { currentUser } = useAuth();
    const { data: partnerRequests, isLoading } = useApiQuery('partnerRequests', getAllPartnerRequests);

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
        return t.partnerTypes[type as keyof typeof t.partnerTypes] || type;
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
                 <input
                    type="text"
                    placeholder={t.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
                <select value={filters.status || 'pending'} onChange={(e) => setFilter('status', e.target.value)} className={inputClasses + " max-w-xs"}>
                    <option value="all">{t.filter.all}</option>
                    <option value="pending">{t_req.requestStatus.pending}</option>
                    <option value="approved">{t_req.requestStatus.approved}</option>
                    <option value="rejected">{t_req.requestStatus.rejected}</option>
                </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('companyName')}>
                                    <div className="flex items-center">{t.partnerTable.partner}{getSortIcon('companyName')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('companyType')}>
                                    <div className="flex items-center">{t.partnerTable.type}{getSortIcon('companyType')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                    <div className="flex items-center">{t_req.table.date}{getSortIcon('createdAt')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>
                                    <div className="flex items-center">{t.partnerTable.status}{getSortIcon('status')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3">{t.partnerTable.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.length > 0 ? (
                                paginatedRequests.map(req => (
                                <tr key={req.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={req.logo} alt={req.companyName} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{req.companyName}</div>
                                                <div className="text-xs text-gray-500">{req.contactName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getPartnerTypeName(req.companyType)}</td>
                                    <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4">{getStatusName(req.status)}</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/admin/partner-requests/${req.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t_req.table.details}</Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState
                                        icon={<UserPlusIcon className="w-12 h-12" />}
                                        title={t_req.noPartnerRequests}
                                        subtitle="New applications from potential partners will be displayed here for your review."
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPartnerRequestsPage;
