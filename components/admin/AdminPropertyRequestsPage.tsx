import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, AddPropertyRequest, RequestStatus } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../api/propertyRequests';
import { addProperty } from '../../api/properties';
import { useApiQuery } from '../shared/useApiQuery';
import { useAuth } from '../auth/AuthContext';
import Pagination from '../shared/Pagination';

const statusColors: { [key in RequestStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: 'customerName' | 'propertyInfo' | 'createdAt' | 'status';
    direction: 'ascending' | 'descending';
} | null;

const ITEMS_PER_PAGE = 10;

const AdminPropertyRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t_req = translations[language].adminDashboard.adminRequests;
    const { currentUser } = useAuth();
    const { data: propertyRequests, isLoading: loading, refetch } = useApiQuery('propertyRequests', getAllPropertyRequests);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);

    const sortedAndFilteredRequests = useMemo(() => {
        let initialReqs = propertyRequests || [];
        if (currentUser && currentUser.type !== 'admin') {
            initialReqs = initialReqs.filter(req => req.managerId === currentUser.id);
        }

        let filteredReqs = [...initialReqs];
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredReqs = filteredReqs.filter(req =>
                req.customerName.toLowerCase().includes(lowercasedFilter) ||
                req.customerPhone.includes(lowercasedFilter)
            );
        }

        if (sortConfig) {
            filteredReqs.sort((a, b) => {
                let aValue: string;
                let bValue: string;

                if (sortConfig.key === 'propertyInfo') {
                    aValue = `${a.propertyDetails.propertyType.en}-${a.propertyDetails.area}`;
                    bValue = `${b.propertyDetails.propertyType.en}-${b.propertyDetails.area}`;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredReqs;
    }, [propertyRequests, searchTerm, sortConfig, currentUser]);
    
    const totalPages = Math.ceil(sortedAndFilteredRequests.length / ITEMS_PER_PAGE);
    const paginatedRequests = sortedAndFilteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

     const requestSort = (key: 'customerName' | 'propertyInfo' | 'createdAt' | 'status') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'customerName' | 'propertyInfo' | 'createdAt' | 'status') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleApprove = async (request: AddPropertyRequest) => {
        const newPropertyData = {
            partnerId: 'individual-listings', // Assign to the "Individual" partner
            ...request.propertyDetails,
            imageUrl: request.images[0] || '',
            gallery: request.images.slice(1),
            priceNumeric: request.propertyDetails.price,
            installmentsAvailable: request.propertyDetails.hasInstallments,
        };
        // @ts-ignore
        await addProperty(newPropertyData);
        await updatePropertyRequestStatus(request.id, 'approved');
        refetch();
    };
    
    const handleReject = async (id: string) => {
        await updatePropertyRequestStatus(id, 'rejected');
        refetch();
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
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('propertyInfo')}>
                                    <div className="flex items-center">{t_req.table.propertyInfo}{getSortIcon('propertyInfo')}</div>
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
                            ) : paginatedRequests.length > 0 ? (
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
                                <tr><td colSpan={5} className="text-center p-8">{t_req.noPropertyRequests}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} language={language} />
            </div>
        </div>
    );
};

export default AdminPropertyRequestsPage;