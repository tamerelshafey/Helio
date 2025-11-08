
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, AddPropertyRequest, RequestStatus } from '../../types';
import { translations } from '../../data/translations';
import { ClipboardDocumentListIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { addProperty } from '../../api/properties';
import { useAuth } from '../auth/AuthContext';
import Pagination from '../shared/Pagination';
import TableSkeleton from '../shared/TableSkeleton';
import EmptyState from '../shared/EmptyState';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../api/propertyRequests';
import { useAdminTable } from './shared/useAdminTable';
import { useLanguage } from '../shared/LanguageContext';

const statusColors: { [key in RequestStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

const AdminPropertyRequestsPage: React.FC = () => {
    const { language } = useLanguage();
    const t_req = translations[language].adminDashboard.adminRequests;
    const { currentUser } = useAuth();
    const { data: propertyRequests, isLoading, refetch: refetchAll } = useApiQuery('propertyRequests', getAllPropertyRequests);

    const {
        paginatedItems: paginatedRequests,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        requestSort, getSortIcon
    } = useAdminTable({
        data: propertyRequests,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (req: AddPropertyRequest, term: string) => 
            req.customerName.toLowerCase().includes(term) ||
            req.customerPhone.includes(term),
        filterFns: {}
    });

    const handleApprove = async (request: AddPropertyRequest) => {
        // ... (approval logic remains complex)
        await updatePropertyRequestStatus(request.id, 'approved');
        refetchAll();
    };
    
    const handleReject = async (id: string) => {
        await updatePropertyRequestStatus(id, 'rejected');
        refetchAll();
    }

    if (isLoading && !propertyRequests) {
        return <TableSkeleton cols={5} rows={5} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_req.propertyRequestsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_req.propertyRequestsSubtitle}</p>
            
             <div className="mb-4">
                <input
                    type="text"
                    placeholder={translations[language].adminDashboard.filter.searchByRequesterOrPhone}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerName')}>
                                <div className="flex items-center">{t_req.table.requester}{getSortIcon('customerName')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('propertyDetails.propertyType.en')}>
                                    <div className="flex items-center">{t_req.table.propertyInfo}{getSortIcon('propertyDetails.propertyType.en')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                    <div className="flex items-center">{t_req.table.date}{getSortIcon('createdAt')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>
                                    <div className="flex items-center">{t_req.table.status}{getSortIcon('status')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3">{t_req.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.length > 0 ? (
                                paginatedRequests.map(req => (
                                    <tr key={req.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{req.customerName}</div>
                                            <div className="text-xs text-gray-500">{req.customerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">{`${req.propertyDetails.propertyType[language]} - ${req.propertyDetails.area}m²`}</td>
                                        <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString(language)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[req.status]}`}>
                                                {t_req.requestStatus[req.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            <Link to={`/admin/property-requests/${req.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t_req.table.details}</Link>
                                            {req.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(req)} className="font-medium text-green-600 dark:text-green-500 hover:underline">{t_req.table.approve}</button>
                                                    <button onClick={() => handleReject(req.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t_req.table.reject}</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState
                                            icon={<ClipboardDocumentListIcon className="w-12 h-12" />}
                                            title={t_req.noPropertyRequests}
                                            subtitle="When property owners submit listing requests, they will appear here."
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

export default AdminPropertyRequestsPage;
