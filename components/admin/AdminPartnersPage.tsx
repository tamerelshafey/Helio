import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Language, Partner, PartnerStatus, SubscriptionPlan, AdminPartner, PartnerType } from '../../types';
import { translations } from '../../data/translations';
import { inputClasses, selectClasses } from '../shared/FormField';
import AdminPartnerEditModal from './AdminPartnerEditModal';
import { getPlanLimit } from '../../utils/subscriptionUtils';
import { useDataContext } from '../shared/DataContext';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';

const statusColors: { [key in PartnerStatus]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

interface AdminPartnersPageProps {
  language: Language;
  filterOptions?: {
    type?: PartnerType;
  };
}

const ITEMS_PER_PAGE = 10;

const AdminPartnersPage: React.FC<AdminPartnersPageProps> = ({ language, filterOptions }) => {
    const t = translations[language].adminDashboard;
    const t_shared = translations[language].adminShared;
    const [searchParams, setSearchParams] = useSearchParams();
    
    const { allPartners: partners, allProperties: properties, allPortfolioItems: portfolio, isLoading, refetchAll } = useDataContext();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<AdminPartner | null>(null);
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

    const partnersWithUsage = useMemo(() => {
        return (partners || [])
            .filter(p => p.type !== 'admin')
            .map(partner => {
                const usageCount = (() => {
                    switch(partner.type) {
                        case 'developer':
                        case 'agency':
                            return (properties || []).filter(p => p.partnerId === partner.id).length;
                        case 'finishing':
                            return (portfolio || []).filter(p => p.partnerId === partner.id).length;
                        default: return 0;
                    }
                })();
                return { ...partner, usageCount };
            });
    }, [partners, properties, portfolio]);

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
            }
        }
    }, [searchParams, partners, handleEditClick]);

    const {
        paginatedItems: paginatedPartners,
        totalPages,
        currentPage,
        setCurrentPage,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
        requestSort,
        getSortIcon
    } = useAdminTable({
        data: partnersWithUsage,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'name', direction: 'ascending' },
        // FIX: Add explicit types to lambda function arguments in useAdminTable to fix type inference issues.
        searchFn: (partner: AdminPartner & { usageCount: number }, term) => 
            partner.name.toLowerCase().includes(term) ||
            (partner.nameAr && partner.nameAr.toLowerCase().includes(term)) ||
            partner.email.toLowerCase().includes(term),
        filterFns: {
            type: (p: AdminPartner & { usageCount: number }, v) => p.type === v,
            status: (p: AdminPartner & { usageCount: number }, v) => p.status === v,
            plan: (p: AdminPartner & { usageCount: number }, v) => p.subscriptionPlan === v,
            displayType: (p: AdminPartner & { usageCount: number }, v) => p.displayType === v,
        }
    });

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSearchParams({}, { replace: true });
    };

    const handleSelect = (partnerId: string) => {
        setSelectedPartners(prev =>
            prev.includes(partnerId) ? prev.filter(id => id !== partnerId) : [...prev, partnerId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPartners(e.target.checked ? paginatedPartners.map(p => p.id) : []);
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
                    onSave={refetchAll}
                    language={language}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.partnersTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.partnersSubtitle}</p>
            
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 <input
                    type="text"
                    placeholder={t.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " lg:col-span-2"}
                />
                {!filterOptions?.type && (
                     <select value={filters.type || 'all'} onChange={(e) => setFilter('type', e.target.value)} className={selectClasses}>
                        <option value="all">{t.filter.filterByType} ({t.filter.all})</option>
                        {Object.entries(partnerTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                )}
                <select value={filters.status || 'all'} onChange={(e) => setFilter('status', e.target.value)} className={selectClasses}>
                    <option value="all">{t.filter.filterByStatus} ({t.filter.all})</option>
                    {Object.entries(partnerStatuses).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                <select value={filters.plan || 'all'} onChange={(e) => setFilter('plan', e.target.value)} className={selectClasses}>
                    <option value="all">{t.filter.filterByPlan} ({t.filter.all})</option>
                    {subscriptionPlans.map(plan => <option key={plan} value={plan} className="capitalize">{plan}</option>)}
                </select>
                <select value={filters.displayType || 'all'} onChange={(e) => setFilter('displayType', e.target.value)} className={selectClasses}>
                    <option value="all">{t.filter.filterByDisplayType} ({t.filter.all})</option>
                    {Object.entries(t.partnerDisplayTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
            </div>
            
             <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox" onChange={handleSelectAll} checked={paginatedPartners.length > 0 && selectedPartners.length === paginatedPartners.length} ref={input => { if (input) input.indeterminate = selectedPartners.length > 0 && selectedPartners.length < paginatedPartners.length }} />
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(language === 'ar' ? 'nameAr' : 'name')}>
                                    <div className="flex items-center">{t.partnerTable.partner}{getSortIcon(language === 'ar' ? 'nameAr' : 'name')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('type')}>
                                    <div className="flex items-center">{t.partnerTable.type}{getSortIcon('type')}</div>
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
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center p-8">Loading partners...</td></tr>
                            ) : paginatedPartners.length > 0 ? (
                                paginatedPartners.map(partner => {
                                    const limit = getPlanLimit(partner.type, partner.subscriptionPlan, 'properties'); // simplified
                                    return (
                                    <tr key={partner.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="w-4 p-4">
                                            <input type="checkbox" checked={selectedPartners.includes(partner.id)} onChange={() => handleSelect(partner.id)} />
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
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[partner.status]}`}>
                                                {partnerStatuses[partner.status as keyof typeof partnerStatuses] || partner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="capitalize">{partner.subscriptionPlan}</div>
                                            <div>{partner.usageCount} / {limit === Infinity ? '∞' : limit}</div>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEditClick(partner)} className="font-medium text-amber-600 dark:text-amber-500 text-sm hover:underline">
                                                {t_shared.edit}
                                            </button>
                                        </td>
                                    </tr>
                                )})
                            ) : (
                                <tr><td colSpan={6} className="text-center p-8">No partners found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} language={language} />
            </div>

        </div>
    );
};

export default AdminPartnersPage;