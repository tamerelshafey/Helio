import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, PartnerRequest } from '../../types';
import { translations } from '../../data/translations';
import { inputClasses } from '../shared/FormField';
import { ArrowDownIcon, ArrowUpIcon } from '../icons/Icons';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { useApiQuery } from '../shared/useApiQuery';
import { useAuth } from '../auth/AuthContext';

type SortConfig = {
    key: 'companyName' | 'companyType' | 'createdAt' | 'status';
    direction: 'ascending' | 'descending';
} | null;

const AdminPartnerRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const t_req = t.adminRequests;
    const { currentUser } = useAuth();
    const { data: partnerRequests, isLoading: loading } = useApiQuery('partnerRequests', getAllPartnerRequests);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });


    const sortedAndFilteredRequests = useMemo(() => {
        let initialReqs = partnerRequests || [];
        if (currentUser && currentUser.type !== 'admin') {
            initialReqs = initialReqs.filter(req => req.managerId === currentUser.id);
        }

        let filteredReqs = initialReqs.filter(req =>
            (statusFilter === 'all' || req.status === statusFilter) &&
            (req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             req.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             req.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortConfig) {
            filteredReqs.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filteredReqs;
    }, [partnerRequests, statusFilter, searchTerm, sortConfig, currentUser]);
    
    const requestSort = (key: 'companyName' | 'companyType' | 'createdAt' | 'status') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'companyName' | 'companyType' | 'createdAt' | 'status') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />;
    };

    const getPartnerTypeName = (type: PartnerRequest['companyType']) => {
        return t.partnerTypes[type as keyof typeof t.partnerTypes] || type;
    }
    
    const getStatusName = (status: PartnerRequest['status']) => {
        return t_req.requestStatus[status as keyof typeof t_req.requestStatus] || status;
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
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses + " max-w-xs"}>
                    <option value="all">{t.filter.all}</option>
                    <option value="pending">{t_req.requestStatus.pending}</option>
                    <option value="approved">{t_req.requestStatus.approved}</option>
                    <option value="rejected">{t_req.requestStatus.rejected}</option>
                </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
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
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-8">Loading requests...</td></tr>
                        ) : sortedAndFilteredRequests.length > 0 ? (
                            sortedAndFilteredRequests.map(req => (
                            <tr key={req.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={req.logo} alt={req.companyName} className="w-10 h-10 object-cover rounded-full" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{req.companyName}</div>
                                            <div className="text-xs text-gray-500">{req.contactEmail}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getPartnerTypeName(req.companyType)}</td>
                                <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString(language)}</td>
                                <td className="px-6 py-4">{getStatusName(req.status)}</td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    <Link to={`/admin/partner-requests/${req.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t_req.table.details}</Link>
                                </td>
                            </tr>
                        ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-8">{t_req.noPartnerRequests}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPartnerRequestsPage;
