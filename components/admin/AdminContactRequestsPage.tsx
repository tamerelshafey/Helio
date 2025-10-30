import React, { useState, useMemo } from 'react';
import type { Language, ContactRequest, RequestStatus } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { useData } from '../shared/DataContext';

const statusColors: { [key in RequestStatus]: string } = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: 'name' | 'createdAt';
    direction: 'ascending' | 'descending';
} | null;

const AdminContactRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.adminRequests;
    const { contactRequests, loading, updateContactRequestStatus, deleteContactRequest } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });


    const sortedAndFilteredRequests = useMemo(() => {
        let filteredReqs = [...contactRequests];
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredReqs = filteredReqs.filter(req =>
                req.name.toLowerCase().includes(lowercasedFilter) ||
                req.phone.includes(lowercasedFilter) ||
                (req.companyName && req.companyName.toLowerCase().includes(lowercasedFilter))
            );
        }

        if (sortConfig) {
            filteredReqs.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredReqs;
    }, [contactRequests, searchTerm, sortConfig]);
    
    const requestSort = (key: 'name' | 'createdAt') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'name' | 'createdAt') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleStatusChange = async (id: string, status: RequestStatus) => {
        await updateContactRequestStatus(id, status);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t.confirmDelete)) {
            await deleteContactRequest(id);
        }
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

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                                <div className="flex items-center">{t.table.requester}{getSortIcon('name')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t.table.message}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                <div className="flex items-center">{t.table.date}{getSortIcon('createdAt')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t.table.status}</th>
                            <th scope="col" className="px-6 py-3">{t.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-8">Loading requests...</td></tr>
                        ) : sortedAndFilteredRequests.length > 0 ? (
                            sortedAndFilteredRequests.map(req => (
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
                            <tr><td colSpan={5} className="text-center p-8">{t.noContactRequests}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminContactRequestsPage;