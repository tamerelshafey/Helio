
import React from 'react';
import type { ContactRequest, RequestStatus } from '../../types';
import { translations } from '../../data/translations';
import { inputClasses } from '../shared/FormField';
import { updateContactRequestStatus, deleteContactRequest } from '../../api/contactRequests';
import Pagination from '../shared/Pagination';
import TableSkeleton from '../shared/TableSkeleton';
import EmptyState from '../shared/EmptyState';
import { InboxIcon } from '../icons/Icons';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllContactRequests } from '../../api/contactRequests';
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

const AdminContactRequestsPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.adminRequests;
    const { data: contactRequests, isLoading, refetch: refetchAll } = useApiQuery('contactRequests', getAllContactRequests);

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
        if (window.confirm(t.confirmDelete)) {
            await deleteContactRequest(id);
            refetchAll();
        }
    }

    if (isLoading && !contactRequests) {
        return <TableSkeleton cols={5} rows={5} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.contactRequestsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.contactRequestsSubtitle}</p>
            
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
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                                    <div className="flex items-center">{t.table.requester}{getSortIcon('name')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('message')}>
                                    <div className="flex items-center">{t.table.message}{getSortIcon('message')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                    <div className="flex items-center">{t.table.date}{getSortIcon('createdAt')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>
                                    <div className="flex items-center">{t.table.status}{getSortIcon('status')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3">{t.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.length > 0 ? (
                                paginatedRequests.map(req => (
                                    <tr key={req.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{req.name}</div>
                                            <div className="text-xs text-gray-500">{req.phone}</div>
                                            {req.inquiryType === 'partner' && (
                                                <div className="mt-1 text-xs font-semibold p-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded inline-block">
                                                    {req.companyName} ({req.businessType})
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            <p className="truncate" title={req.message}>{req.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">Contact at: {req.contactTime}</p>
                                        </td>
                                        <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString(language)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[req.status]}`}>
                                                {t.requestStatus[req.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            {req.status === 'pending' && (
                                                <button onClick={() => handleStatusChange(req.id, 'reviewed')} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t.table.markAsReviewed}</button>
                                            )}
                                            <button onClick={() => handleDelete(req.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t.table.delete}</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState
                                            icon={<InboxIcon className="w-12 h-12" />}
                                            title={t.noContactRequests}
                                            subtitle="When new messages are sent through the contact form, they will appear here."
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

export default AdminContactRequestsPage;
