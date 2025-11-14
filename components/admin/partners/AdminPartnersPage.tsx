

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPartnersForAdmin, updatePartnerStatus, deletePartner } from '../../../services/partners';
import { getPlans } from '../../../services/plans';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import type { AdminPartner, PartnerStatus, PartnerType, SubscriptionPlan } from '../../../types';
import AdminPartnerEditModal from './AdminPartnerEditModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import ConfirmationModal from '../../shared/ConfirmationModal';

const AdminPartnersPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const { data: partners, isLoading } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    useQuery({ queryKey: ['plans'], queryFn: getPlans }); // Pre-fetch plans for the modal

    const [partnerToEdit, setPartnerToEdit] = useState<AdminPartner | null>(null);
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
    const [actionToConfirm, setActionToConfirm] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
    const highlightedId = searchParams.get('highlight');

    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId) {
            const partner = (partners || []).find(p => p.id === editId);
            if (partner) setPartnerToEdit(partner);
        }
    }, [searchParams, partners]);

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: PartnerStatus }) => updatePartnerStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePartner(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] })
    });

    const handleStatusToggle = (id: string, currentStatus: PartnerStatus) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        statusMutation.mutate({ id, status: newStatus });
    };

    const {
        paginatedItems: paginatedPartners,
        totalPages,
        currentPage,
        setCurrentPage,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
    } = useAdminTable({
        data: partners,
        itemsPerPage: 15,
        initialSort: { key: 'name', direction: 'ascending' },
        searchFn: (p: AdminPartner, term: string) => p.name.toLowerCase().includes(term) || (p.nameAr && p.nameAr.toLowerCase().includes(term)) || p.email.toLowerCase().includes(term),
        filterFns: {
            type: (p: AdminPartner, v) => p.type === v,
            status: (p: AdminPartner, v) => p.status === v,
            plan: (p: AdminPartner, v) => p.subscriptionPlan === v
        }
    });
    
    const handleSelect = (partnerId: string) => {
        setSelectedPartners(prev =>
            prev.includes(partnerId) ? prev.filter(id => id !== partnerId) : [...prev, partnerId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPartners(paginatedPartners.map(p => p.id));
        } else {
            setSelectedPartners([]);
        }
    };

    const handleBulkAction = async () => {
        if (!actionToConfirm) return;

        const promises = selectedPartners.map(id => {
            switch (actionToConfirm) {
                case 'activate': return updatePartnerStatus(id, 'active');
                case 'deactivate': return updatePartnerStatus(id, 'disabled');
                case 'delete': return deletePartner(id);
                default: return Promise.resolve();
            }
        });
        await Promise.all(promises);
        
        setSelectedPartners([]);
        setActionToConfirm(null);
        queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
    };

    return (
        <div>
            {partnerToEdit && <AdminPartnerEditModal partner={partnerToEdit} onClose={() => { setPartnerToEdit(null); setSearchParams({}); }} />}
            
            {actionToConfirm === 'delete' && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setActionToConfirm(null)}
                    onConfirm={handleBulkAction}
                    title={t.adminDashboard.bulkActions.delete}
                    message={`Are you sure you want to delete ${selectedPartners.length} selected partners? This action cannot be undone.`}
                    confirmText={t.adminDashboard.bulkActions.delete}
                />
            )}

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.partnersTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_admin.partnersSubtitle}</p>
            
            <div className="mb-4 flex flex-wrap gap-4">
                <Input placeholder={t_admin.filter.searchByNameOrEmail} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs"/>
                <Select value={filters.type || 'all'} onChange={e => setFilter('type', e.target.value)}>
                    <option value="all">{t_admin.filter.filterByType} ({t_admin.filter.all})</option>
                    {Object.entries(t_admin.partnerTypes).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                </Select>
                <Select value={filters.status || 'all'} onChange={e => setFilter('status', e.target.value)}>
                    <option value="all">{t_admin.filter.filterByStatus} ({t_admin.filter.all})</option>
                    {Object.entries(t_admin.partnerStatuses).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                </Select>
                 <Select value={filters.plan || 'all'} onChange={e => setFilter('plan', e.target.value)}>
                    <option value="all">{t_admin.filter.filterByPlan} ({t_admin.filter.all})</option>
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="elite">Elite</option>
                </Select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {selectedPartners.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-sm">{selectedPartners.length} {t_admin.bulkActions.selected}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleBulkAction()}> {t_admin.bulkActions.activate}</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleBulkAction()}>{t_admin.bulkActions.deactivate}</Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setActionToConfirm('delete')}>{t_admin.bulkActions.delete}</Button>
                        <button onClick={() => setSelectedPartners([])} className={`text-sm font-medium text-gray-500 hover:text-gray-700 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t_admin.bulkActions.clear}</button>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"><input type="checkbox" onChange={handleSelectAll} /></TableHead>
                            <TableHead>{t_admin.partnerTable.partner}</TableHead>
                            <TableHead>{t_admin.partnerTable.type}</TableHead>
                            <TableHead>{t_admin.partnerTable.subscriptionPlan}</TableHead>
                            <TableHead>{t_admin.partnerTable.status}</TableHead>
                            <TableHead>{t_admin.partnerTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center p-8">Loading partners...</TableCell></TableRow>
                        ) : paginatedPartners.map(p => (
                            <TableRow key={p.id} className={highlightedId === p.id ? 'highlight-item' : ''}>
                                <TableCell><input type="checkbox" checked={selectedPartners.includes(p.id)} onChange={() => handleSelect(p.id)}/></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover"/>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{language === 'ar' ? p.nameAr : p.name}</div>
                                            <div className="text-xs text-gray-500">{p.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{t_admin.partnerTypes[p.type as keyof typeof t_admin.partnerTypes]}</TableCell>
                                <TableCell className="capitalize">{p.subscriptionPlan}</TableCell>
                                <TableCell>
                                    <ToggleSwitch 
                                        checked={p.status === 'active'}
                                        onChange={() => handleStatusToggle(p.id, p.status)}
                                        disabled={p.status === 'pending' || statusMutation.isPending}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variant="link" onClick={() => setPartnerToEdit(p)}>
                                        {t.adminShared.edit}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPartnersPage;