import React, { useState, useMemo } from 'react';
import type { Language, Partner, PartnerStatus } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import { useData } from '../shared/DataContext';

const statusColors: { [key in PartnerStatus]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: 'name' | 'type' | 'status';
    direction: 'ascending' | 'descending';
} | null;

const AdminPartnersPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const { partners, loading, updatePartnerStatus } = useData();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const nonAdminPartners = useMemo(() => partners.filter(p => p.type !== 'admin'), [partners]);
    
    const sortedAndFilteredPartners = useMemo(() => {
        let filteredPartners = [...nonAdminPartners];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredPartners = filteredPartners.filter(p =>
                p.name.toLowerCase().includes(lowercasedFilter) ||
                (p.nameAr && p.nameAr.toLowerCase().includes(lowercasedFilter)) ||
                p.email.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (typeFilter !== 'all') {
            filteredPartners = filteredPartners.filter(p => p.type === typeFilter);
        }

        if (statusFilter !== 'all') {
            filteredPartners = filteredPartners.filter(p => p.status === statusFilter);
        }

        if (sortConfig !== null) {
            filteredPartners.sort((a, b) => {
                let aValue = sortConfig.key === 'name' ? (language === 'ar' ? a.nameAr || a.name : a.name) : a[sortConfig.key];
                let bValue = sortConfig.key === 'name' ? (language === 'ar' ? b.nameAr || b.name : b.name) : b[sortConfig.key];
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredPartners;
    }, [nonAdminPartners, searchTerm, typeFilter, statusFilter, sortConfig, language]);

    const requestSort = (key: 'name' | 'type' | 'status') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'name' | 'type' | 'status') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleStatusChange = async (partnerId: string, newStatus: PartnerStatus) => {
        await updatePartnerStatus(partnerId, newStatus);
    };
    
    const getPartnerTypeName = (type: Partner['type']) => {
        return t.partnerTypes[type as keyof typeof t.partnerTypes] || type;
    }
    
    const getStatusName = (status: PartnerStatus) => {
        return t.partnerStatuses[status] || status;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.partnersTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.partnersSubtitle}</p>
            
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    placeholder={t.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
                 <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClasses + " max-w-xs"}>
                    <option value="all">{t.filter.filterByType} ({t.filter.all})</option>
                    {Object.entries(t.partnerTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClasses + " max-w-xs"}>
                    <option value="all">{t.filter.filterByStatus} ({t.filter.all})</option>
                     {Object.entries(t.partnerStatuses).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                                <div className="flex items-center">{t.partnerTable.partner}{getSortIcon('name')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('type')}>
                                <div className="flex items-center">{t.partnerTable.type}{getSortIcon('type')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>
                                <div className="flex items-center">{t.partnerTable.status}{getSortIcon('status')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t.partnerTable.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-8">Loading partners...</td></tr>
                        ) : sortedAndFilteredPartners.map(partner => (
                            <tr key={partner.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={partner.imageUrl} alt={partner.name} className="w-10 h-10 object-cover rounded-full" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{language === 'ar' ? partner.nameAr || partner.name : partner.name}</div>
                                            <div className="text-xs text-gray-500">{partner.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getPartnerTypeName(partner.type)}</td>
                                <td className="px-6 py-4">
                                     <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[partner.status]}`}>
                                        {getStatusName(partner.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    {partner.status === 'pending' && (
                                        <button onClick={() => handleStatusChange(partner.id, 'active')} className="font-medium text-green-600 dark:text-green-500 hover:underline">{t.partnerTable.verify}</button>
                                    )}
                                    {partner.status === 'active' && (
                                        <button onClick={() => handleStatusChange(partner.id, 'disabled')} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t.partnerTable.disable}</button>
                                    )}
                                    {partner.status === 'disabled' && (
                                        <button onClick={() => handleStatusChange(partner.id, 'active')} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t.partnerTable.enable}</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPartnersPage;