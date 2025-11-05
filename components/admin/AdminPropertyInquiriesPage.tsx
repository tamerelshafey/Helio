import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Language, PropertyInquiryRequest, RequestStatus } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { getAllPropertyInquiries, updatePropertyInquiryStatus, deletePropertyInquiry } from '../../api/propertyInquiries';
import { useApiQuery } from '../shared/useApiQuery';

const statusColors: { [key in RequestStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: 'customerName' | 'createdAt' | 'details' | 'status';
    direction: 'ascending' | 'descending';
} | null;

const AdminPropertyInquiriesPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.propertyInquiries;
    const t_req = translations[language].adminDashboard.adminRequests;
    const { data: propertyInquiries, isLoading: loading, refetch } = useApiQuery('propertyInquiries', getAllPropertyInquiries);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });


    const sortedAndFilteredRequests = useMemo(() => {
        let filteredReqs = [...(propertyInquiries || [])];
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredReqs = filteredReqs.filter(req =>
                req.customerName.toLowerCase().includes(lowercasedFilter) ||
                req.customerPhone.includes(lowercasedFilter) ||
                req.details.toLowerCase().includes(lowercasedFilter)
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
    }, [propertyInquiries, searchTerm, sortConfig]);
    
    const requestSort = (key: 'customerName' | 'createdAt' | 'details' | 'status') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'customerName' | 'createdAt' | 'details' | 'status') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleStatusChange = async (id: string, status: RequestStatus) => {
        await updatePropertyInquiryStatus(id, status);
        refetch();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t_req.confirmDelete)) {
            await deletePropertyInquiry(id);
            refetch();
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
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
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerName')}>
                                <div className="flex items-center">{t_req.table.requester}{getSortIcon('customerName')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('details')}>
                                <div className="flex items-center">{t.table.details}{getSortIcon('details')}</div>
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
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-8">Loading requests...</td></tr>
                        ) : sortedAndFilteredRequests.length > 0 ? (
                            sortedAndFilteredRequests.map(req => (
                                <tr key={req.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{req.customerName}</div>
                                        <div className="text-xs text-gray-500">{req.customerPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <p className="whitespace-pre-wrap">{req.details}</p>
                                        <p className="text-xs text-gray-400 mt-1">Contact at: {req.contactTime}</p>
                                    </td>
                                    <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4">
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
                                    </td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleDelete(req.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t_req.table.delete}</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-8">{t.noRequests}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPropertyInquiriesPage;