import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PartnerStatus, SubscriptionPlan, AdminPartner, PartnerType } from '../../types';
import { inputClasses, selectClasses } from '../shared/FormField';
import AdminPartnerEditModal from './AdminPartnerEditModal';
import { getPlanLimit } from '../../utils/subscriptionUtils';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnersForAdmin } from '../../services/partners';
import { getAllProperties } from '../../services/properties';
import { getAllPortfolioItems } from '../../services/portfolio';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';
import { useLanguage } from '../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

const statusColors: { [key in PartnerStatus]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

interface AdminPartnersPageProps {
  filterOptions?: {
    type?: PartnerType;
  };
}

const ITEMS_PER_PAGE = 10;

const AdminPartnersPage: React.FC<AdminPartnersPageProps> = ({ filterOptions }) => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_shared = t.adminShared;
    const [searchParams, setSearchParams] = useSearchParams();
    const tableRef = useRef<HTMLTableElement>(null);
    
    const { data: partners, isLoading: isLoadingPartners, refetch: refetchPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: properties, isLoading: isLoadingProperties, refetch: refetchProperties } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });
    const { data: portfolio, isLoading: isLoadingPortfolio, refetch: refetchPortfolio } = useQuery({ queryKey: ['allPortfolioItems'], queryFn: getAllPortfolioItems });
    const isLoading = isLoadingPartners || isLoadingProperties || isLoadingPortfolio;
    const refetchAll = useCallback(() => {
        refetchPartners();
        refetchProperties();
        refetchPortfolio();
    }, [refetchPartners, refetchProperties, refetchPortfolio]);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<AdminPartner | null>(null);
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

    const partnersWithUsage = useMemo(() => {
        const partnerTypesToShow: PartnerType[] = ['developer', 'agency', 'finishing'];
        return (partners || [])
            .filter(p => partnerTypesToShow.includes(p.type))
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
        searchFn: (partner: AdminPartner & { usageCount: number }, term: string) => 
            partner.name.toLowerCase().includes(term) ||
            (partner.nameAr && partner.nameAr.toLowerCase().includes(term)) ||
            partner.email.toLowerCase().includes(term),
        filterFns: {
            type: (p: AdminPartner & { usageCount: number }, v: string) => p.type === v,
            status: (p: AdminPartner & { usageCount: number }, v: string) => p.status === v,
            plan: (p: AdminPartner & { usageCount: number }, v: string) => p.subscriptionPlan === v,
            displayType: (p: AdminPartner & { usageCount: number }, v: string) => p.displayType === v,
        }
    });

    useEffect(() => {
        const partnerToEditId = searchParams.get('edit');
        if (partnerToEditId && partners) {
            const partnerToEdit = partners.find(p => p.id === partnerToEditId);
            if (partnerToEdit) {
                handleEditClick(partnerToEdit);
            }
        }
    }, [searchParams, partners, handleEditClick]);

    useEffect(() => {
        const highlightedPartnerId = searchParams.get('highlight');
        if (highlightedPartnerId && tableRef.current) {
            const element = tableRef.current.querySelector(`[data-partner-id="${highlightedPartnerId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight-item');
                setTimeout(() => {
                    element.classList.remove('highlight-item');
                    // Clean up URL
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.delete('highlight');
                    setSearchParams(newParams, { replace: true });
                }, 2000);
            }
        }
    }, [searchParams, setSearchParams, paginatedPartners]);


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
    
    const partnerTypes = t_admin.partnerTypes;
    const partnerStatuses = t_admin.partnerStatuses;
    const subscriptionPlans = ['basic', 'professional', 'elite', 'commission'];

    return (
        <div>
            {isEditModalOpen && selectedPartner && (
                <AdminPartnerEditModal 
                    partner={selectedPartner}
                    onClose={handleCloseModal}
                    onSave={refetchAll}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.partnersTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_admin.partnersSubtitle}</p>
            
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 <input
                    type="text"
                    placeholder={t_admin.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " lg:col-span-2"}
                />
                {!filterOptions?.type && (
                     <select value={filters.type || 'all'} onChange={(e) => setFilter('type', e.target.value)} className={selectClasses}>
                        <option value="all">{t_admin.filter.filterByType} ({t_admin.filter.all})</option>
                        {Object.entries(partnerTypes).filter(([key]) => ['developer', 'agency', 'finishing'].includes(key)).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                )}
                <select value={filters.status || 'all'} onChange={(e) => setFilter('status', e.target.value)} className={selectClasses}>
                    <option value="all">{t_admin.filter.filterByStatus} ({t_admin.filter.all})</option>
                    {Object.entries(partnerStatuses).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                <select value={filters.plan || 'all'} onChange={(e) => setFilter('plan', e.target.value)} className={selectClasses}>
                    <option value="all">{t_admin.filter.filterByPlan} ({t_admin.filter.all})</option>
                    {subscriptionPlans.map(plan => <option key={plan} value={plan} className="capitalize">{plan}</option>)}
                </select>
                 <select value={filters.displayType || 'all'} onChange={(e) => setFilter('displayType', e.target.value)} className={selectClasses}>
                    <option value="all">{t_admin.filter.filterByDisplayType} ({t_admin.filter.all})</option>
                    {Object.entries(t_admin.partnerDisplayTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table ref={tableRef}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-4">
                                <input type="checkbox" onChange={handleSelectAll} checked={paginatedPartners.length > 0 && selectedPartners.length === paginatedPartners.length} ref={input => { if (input) input.indeterminate = selectedPartners.length > 0 && selectedPartners.length < paginatedPartners.length }} />
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>{t_admin.partnerTable.partner}{getSortIcon('name')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('type')}>{t_admin.partnerTable.type}{getSortIcon('type')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>{t_admin.partnerTable.status}{getSortIcon('status')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('subscriptionPlan')}>{t_admin.partnerTable.subscriptionPlan}{getSortIcon('subscriptionPlan')}</TableHead>
                            <TableHead>{t_admin.partnerTable.planUsage}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('subscriptionEndDate')}>{t_admin.partnerTable.subscriptionEndDate}{getSortIcon('subscriptionEndDate')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('displayType')}>{t_admin.partnerTable.displayType}{getSortIcon('displayType')}</TableHead>
                            <TableHead>{t_admin.partnerTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={9} className="text-center p-8">Loading partners...</TableCell></TableRow>
                        ) : paginatedPartners.length > 0 ? (
                            paginatedPartners.map(partner => {
                                const limitType = partner.type === 'finishing' ? 'portfolio' : (partner.type === 'developer' ? 'units' : 'properties');
                                const limit = getPlanLimit(partner.type, partner.subscriptionPlan, limitType);
                                return (
                                    <TableRow key={partner.id} data-partner-id={partner.id}>
                                        <TableCell className="p-4">
                                             <input type="checkbox" checked={selectedPartners.includes(partner.id)} onChange={() => handleSelect(partner.id)} />
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <img src={partner.imageUrl} alt={partner.name} className="w-10 h-10 object-cover rounded-full" />
                                                <div>
                                                    <div>{language === 'ar' ? partner.nameAr || partner.name : partner.name}</div>
                                                    <div className="text-xs text-gray-500">{partner.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{partnerTypes[partner.type as keyof typeof partnerTypes] || partner.type}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[partner.status]}`}>
                                                {partnerStatuses[partner.status as keyof typeof partnerStatuses] || partner.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="capitalize">{partner.subscriptionPlan}</TableCell>
                                        <TableCell>{limit === Infinity ? '∞' : `${partner.usageCount} / ${limit}`}</TableCell>
                                        <TableCell>{partner.subscriptionEndDate ? new Date(partner.subscriptionEndDate).toLocaleDateString(language) : 'N/A'}</TableCell>
                                        <TableCell>{t_admin.partnerDisplayTypes[partner.displayType as keyof typeof t_admin.partnerDisplayTypes] || partner.displayType}</TableCell>
                                        <TableCell className="space-x-4 whitespace-nowrap">
                                            <button onClick={() => handleEditClick(partner)} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">{t_shared.edit}</button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow><TableCell colSpan={9} className="text-center p-8">No partners found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPartnersPage;