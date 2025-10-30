import React, { useState, useMemo } from 'react';
import type { Language, PartnerRequest } from '../../types';
import { translations } from '../../data/translations';
import AdminPartnerRequestModal from './AdminPartnerRequestModal';
import { inputClasses } from '../shared/FormField';
import { useData } from '../shared/DataContext';

const AdminPartnerRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const t_req = t.adminRequests;
    const { partnerRequests, loading } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);

    const filteredRequests = useMemo(() => {
        return partnerRequests.filter(req =>
            (statusFilter === 'all' || req.status === statusFilter) &&
            (req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             req.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             req.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [partnerRequests, statusFilter, searchTerm]);
    
    const getPartnerTypeName = (type: PartnerRequest['companyType']) => {
        return t.partnerTypes[type as keyof typeof t.partnerTypes] || type;
    }
    
    const getStatusName = (status: PartnerRequest['status']) => {
        return t_req.requestStatus[status as keyof typeof t_req.requestStatus] || status;
    }

    return (
        <div>
            {selectedRequest && (
                <AdminPartnerRequestModal 
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    language={language}
                />
            )}
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
                            <th scope="col" className="px-6 py-3">{t.partnerTable.partner}</th>
                            <th scope="col" className="px-6 py-3">{t.partnerTable.type}</th>
                            <th scope="col" className="px-6 py-3">{t_req.table.date}</th>
                            <th scope="col" className="px-6 py-3">{t.partnerTable.status}</th>
                            <th scope="col" className="px-6 py-3">{t.partnerTable.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-8">Loading requests...</td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
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
                                    <button onClick={() => setSelectedRequest(req)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t_req.table.details}</button>
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