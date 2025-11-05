import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Language, Partner, PartnerStatus, SubscriptionPlan, AdminPartner, PartnerType } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import AdminPartnerEditModal from './AdminPartnerEditModal';
import { getPlanLimit } from '../../utils/subscriptionUtils';
import { getAllPartnersForAdmin, updatePartnerStatus as apiUpdatePartnerStatus, updatePartnerDisplayType as apiUpdatePartnerDisplayType, updatePartnerAdmin } from '../../api/partners';
import { getAllProperties } from '../../api/properties';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPortfolioItems } from '../../api/portfolio';

const statusColors: { [key in PartnerStatus]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: 'name' | 'type' | 'displayType' | 'status' | 'subscriptionPlan';
    direction: 'ascending' | 'descending';
} | null;

interface AdminPartnersPageProps {
  language: Language;
  filterOptions?: {
    type?: PartnerType;
  };
}


const AdminPartnersPage: React.FC<AdminPartnersPageProps> = ({ language, filterOptions }) => {
    const t = translations[language].adminDashboard;
    const t_shared = translations[language].adminShared;
    const [searchParams, setSearchParams] = useSearchParams();
    
    const { data: partners, isLoading: loadingPartners, refetch: refetchPartners } = useApiQuery('allPartners', getAllPartnersForAdmin);
    const { data: properties, isLoading: loadingProperties } = useApiQuery('allProperties', getAllProperties);
    const { data: portfolio, isLoading: loadingPortfolio } = useApiQuery('allPortfolioItems', getAllPortfolioItems);
    const loading = loadingPartners || loadingProperties || loadingPortfolio;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [displayTypeFilter, setDisplayTypeFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<AdminPartner | null>(null);
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

    const handleEditClick = useCallback((partner: AdminPartner) => {
        setSelectedPartner(partner);
        setIsEditModalOpen(true);
    }, []);

    useEffect(() => {
        const partnerToEditId = searchParams.get('edit');
        if (partnerToEditId && partners) {
            const partnerToEdit = partners.find(p => p.id === partnerToEditId);
            if (partnerToEdit) {
                handleEditClick(partnerToEdit);
                // The modal is now responsible for clearing the param on close
            }
        }
    }, [searchParams, partners, handleEditClick]);

    const sortedAndFilteredPartners = useMemo(() => {
        let filteredPartners = (partners || []).filter(p => p.type !== 'admin');
        
        if (filterOptions?.type) {
            filteredPartners = filteredPartners.filter(p => p.type === filterOptions.type);
        }

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredPartners = filteredPartners.filter(partner =>
                partner.name.toLowerCase().includes(lowercasedFilter) ||
                (partner.nameAr && partner.nameAr.toLowerCase().includes(lowercasedFilter)) ||
                partner.email.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (typeFilter !== 'all') {
            filteredPartners = filteredPartners.filter(p => p.type === typeFilter);
        }
        if (statusFilter !== 'all') {
            filteredPartners = filteredPartners.filter(p => p.status === statusFilter);
        }
        if (planFilter !== 'all') {
            filteredPartners = filteredPartners.filter(p => p.subscriptionPlan === planFilter);
        }
        if (displayTypeFilter !== 'all') {
            filteredPartners = filteredPartners.filter(p => p.displayType === displayTypeFilter);
        }

        if (sortConfig !== null) {
            filteredPartners.sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;

                if (sortConfig.key === 'name') {
                    aValue = language === 'ar' ? (a.nameAr || a.name) : a.name;
                    bValue = language === 'ar' ? (b.nameAr || b.name) : b.name;
                } else {
                     aValue = a[sortConfig.key] || '';
                     bValue = b[sortConfig.key] || '';
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
        return filteredPartners;
    }, [partners, searchTerm, typeFilter, statusFilter, planFilter, displayTypeFilter, sortConfig, language, filterOptions]);

    const requestSort = (key: 'name' | 'type' | 'displayType' | 'status' | 'subscriptionPlan') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'name' | 'type' | 'displayType' | 'status' | 'subscriptionPlan') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleStatusToggle = async (partnerId: string, currentStatus: PartnerStatus) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        await apiUpdatePartnerStatus(partnerId, newStatus);
        refetchPartners();
    };

    const handleDisplayTypeChange = async (partnerId: string, displayType: Partner['displayType']) => {
        await apiUpdatePartnerDisplayType(partnerId, displayType);
        refetchPartners();
    }

    const handleSaveEdit = async () => {
        await refetchPartners();
        setIsEditModalOpen(false);
    };
    
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSearchParams({}, { replace: true });
    };

    const handleSelect = (partnerId: string) => {
        setSelectedPartners(prev =>
            prev.includes(partnerId)
                ? prev.filter(id => id !== partnerId)
                : [...prev, partnerId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPartners(sortedAndFilteredPartners.map(p => p.id));
        } else {
            setSelectedPartners([]);
        }
    };
    
    const handleBulkAction = async (status: PartnerStatus) => {
        const actionText = status === 'active' ? t.bulkActions.activate : t.bulkActions.deactivate;
        if (window.confirm(`Are you sure you want to ${actionText.toLowerCase()} ${selectedPartners.length} partners?`)) {
            await Promise.all(
                selectedPartners.map(id => apiUpdatePartnerStatus(id, status))
            );
            refetchPartners();
            setSelectedPartners([]);
        }
    };

    const partnerTypes = t.partnerTypes;
    const partnerStatuses = t.partnerStatuses;
    const subscriptionPlans = ['basic', 'professional', 'elite', 'commission'];

    return (
        <div>
            {isEditModalOpen && selectedPartner && (
                <AdminPartnerEditModal 
                    partner={selectedPartner}
                    onClose={handleCloseModal}
                    onSave={handleSaveEdit}
                    language={language}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.partnersTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.partnersSubtitle}</p>
            
            {/* Filtering Controls */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 <input
                    type="text"
                    placeholder={t.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " lg:col-span-2"}
                />
                {!filterOptions?.type && (
                     <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClasses}>
                        <option value="all">{t.filter.filterByType} ({t.filter.all})</option>
                        {Object.entries(partnerTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                )}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClasses}>
                    <option value="all">{t.filter.filterByStatus} ({t.filter.all})</option>
                    {Object.entries(partnerStatuses).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className={selectClasses}>
                    <option value="all">{t.filter.filterByPlan} ({t.filter.all})</option>
                    {subscriptionPlans.map(plan => <option key={plan} value={plan} className="capitalize">{plan}</option>)}
                </select>
                <select value={displayTypeFilter} onChange={(e) => setDisplayTypeFilter(e.target.value)} className={selectClasses}>
                    <option value="all">{t.filter.filterByDisplayType} ({t.filter.all})</option>
                    {Object.entries(t.partnerDisplayTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
            </div>
            
             <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {selectedPartners.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-sm">{selectedPartners.length} {t.bulkActions.selected}</span>
                        <button onClick={() => handleBulkAction('active')} className="text-sm font-medium text-green-600 hover:text-green-800">{t.bulkActions.activate}</button>
                        <button onClick={() => handleBulkAction('disabled')} className="text-sm font-medium text-red-600 hover:text-red-800">{t.bulkActions.deactivate}</button>
                        <button onClick={() => setSelectedPartners([])} className={`text-sm font-medium text-gray-500 hover:text-gray-700 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t.bulkActions.clear}</button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        onChange={handleSelectAll}
                                        checked={sortedAndFilteredPartners.length > 0 && selectedPartners.length === sortedAndFilteredPartners.length}
                                        ref={input => {
                                            if (input) {
                                                input.indeterminate = selectedPartners.length > 0 && selectedPartners.length < sortedAndFilteredPartners.length;
                                            }
                                        }}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                                    <div className="flex items-center">{t.partnerTable.partner}{getSortIcon('name')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('type')}>
                                    <div className="flex items-center">{t.partnerTable.type}{getSortIcon('type')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('displayType')}>
                                    <div className="flex items-center">{t.partnerTable.displayType}{getSortIcon('displayType')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>
                                    <div className="flex items-center">{t.partnerTable.status}{getSortIcon('status')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('subscriptionPlan')}>
                                    <div className="flex items-center">{t.partnerTable.planUsage}{getSortIcon('subscriptionPlan')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3">{t.partnerTable.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center p-8">Loading partners...</td></tr>
                            ) : sortedAndFilteredPartners.length > 0 ? (
                                sortedAndFilteredPartners.map(partner => {
                                    const usageCount = (() => {
                                        switch(partner.type) {
                                            case 'developer':
                                            case 'agency':
                                                return (properties || []).filter(p => p.partnerId === partner.id).length;
                                            case 'finishing':
                                                return (portfolio || []).filter(p => p.partnerId === partner.id).length;
                                            default:
                                                return 0;
                                        }
                                    })();
                                    
                                    const limit = (() => {
                                        let limitType: 'properties' | 'projects' | 'units' | 'portfolio' = 'properties';
                                        if (partner.type === 'developer') {
                                            limitType = 'units';
                                        } else if (partner.type === 'agency') {
                                            limitType = 'properties';
                                        } else if (partner.type === 'finishing') {
                                            limitType = 'portfolio';
                                        }
                                        return getPlanLimit(partner.type, partner.subscriptionPlan, limitType);
                                    })();
                                    return (
                                    <tr key={partner.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="w-4 p-4">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                                                checked={selectedPartners.includes(partner.id)}
                                                onChange={() => handleSelect(partner.id)}
                                            />
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <img src={partner.imageUrl} alt={partner.name} className="w-10 h-10 object-cover rounded-full" />
                                                <div>
                                                    <div>{language === 'ar' ? partner.nameAr || partner.name : partner.name}</div>
                                                    <div className="text-xs text-gray-500">{partner.email}</div>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">{partnerTypes[partner.type as keyof typeof partnerTypes] || partner.type}</td>
                                        <td className="px-6 py-4">
                                            <select value={partner.displayType} onChange={(e) => handleDisplayTypeChange(partner.id, e.target.value as Partner['displayType'])} className={`${selectClasses} text-xs p-1`}>
                                                {Object.entries(t.partnerDisplayTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[partner.status]}`}>
                                                {partnerStatuses[partner.status as keyof typeof partnerStatuses] || partner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="capitalize">{partner.subscriptionPlan}</div>
                                            <div>{usageCount} / {limit === Infinity ? '∞' : limit}</div>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            {partner.status !== 'pending' && (
                                                <button onClick={() => handleStatusToggle(partner.id, partner.status)} className={`font-medium text-sm ${partner.status === 'active' ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'} hover:underline`}>
                                                    {partner.status === 'active' ? t.partnerTable.disable : t.partnerTable.enable}
                                                </button>
                                            )}
                                            <button onClick={() => handleEditClick(partner)} className="font-medium text-amber-600 dark:text-amber-500 text-sm hover:underline">
                                                {t_shared.edit}
                                            </button>
                                        </td>
                                    </tr>
                                )})
                            ) : (
                                <tr><td colSpan={7} className="text-center p-8">No partners found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminPartnersPage;