
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPartnersForAdmin, updatePartnerAdmin } from '../../../services/partners';
// FIX: Corrected import path for useAdminTable hook.
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { AdminPartner, PartnerType } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import EditContactMethodsModal from './EditContactMethodsModal';

const AdminInquiryManagementPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_page = t.adminDashboard.inquiryManagement;
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data: partners, isLoading } = useQuery({
        queryKey: ['allPartnersAdmin'],
        queryFn: getAllPartnersForAdmin,
    });
    
    const [modalState, setModalState] = useState<{ isOpen: boolean, partner?: AdminPartner }>({ isOpen: false });

    const mutation = useMutation({
        mutationFn: ({ partnerId, updates }: { partnerId: string; updates: Partial<AdminPartner> }) =>
            updatePartnerAdmin(partnerId, updates),
        onSuccess: () => {
            showToast(t_page.updateSuccess, 'success');
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
        },
        onError: () => {
            showToast('Failed to update contact method.', 'error');
        },
    });
    
    const businessPartners = useMemo(() => (partners || []).filter(p => ['developer', 'finishing', 'agency'].includes(p.type)), [partners]);
    
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
        data: businessPartners,
        itemsPerPage: 10,
        initialSort: { key: 'name', direction: 'ascending' },
        searchFn: (p: AdminPartner, term: string) => p.name.toLowerCase().includes(term) || (p.nameAr && p.nameAr.toLowerCase().includes(term)),
        filterFns: {
            type: (p: AdminPartner, v) => p.type === v,
        }
    });

    const handleToggle = (partner: AdminPartner, method: 'whatsapp' | 'phone' | 'form') => {
        const currentMethods = partner.contactMethods || {
            whatsapp: { enabled: false, number: '' },
            phone: { enabled: false, number: '' },
            form: { enabled: true },
        };
        const newMethods = {
            ...currentMethods,
            [method]: { ...currentMethods[method], enabled: !currentMethods[method].enabled },
        };
        mutation.mutate({ partnerId: partner.id, updates: { contactMethods: newMethods } });
    };

    return (
        <div>
            {modalState.isOpen && modalState.partner && (
                <EditContactMethodsModal
                    partner={modalState.partner}
                    onClose={() => setModalState({ isOpen: false })}
                    onSave={() => {
                        setModalState({ isOpen: false });
                        queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
                    }}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_page.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_page.subtitle}</p>

            <div className="mb-4 flex gap-4">
                <Input
                    placeholder={t.adminDashboard.filter.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={filters.type || 'all'} onChange={(e) => setFilter('type', e.target.value)} className="max-w-xs">
                    <option value="all">{t.adminDashboard.filter.all}</option>
                    <option value="developer">{t.adminDashboard.partnerTypes.developer}</option>
                    <option value="finishing">{t.adminDashboard.partnerTypes.finishing}</option>
                    <option value="agency">{t.adminDashboard.partnerTypes.agency}</option>
                </Select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_page.table.partner}</TableHead>
                            <TableHead>{t_page.table.whatsapp}</TableHead>
                            <TableHead>{t_page.table.phone}</TableHead>
                            <TableHead>{t_page.table.internalForm}</TableHead>
                            <TableHead>{t_page.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedPartners.map(p => {
                            const methods = p.contactMethods || { whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } };
                            return (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{language === 'ar' ? p.nameAr : p.name}</div>
                                                <div className="text-xs text-gray-500">{t.adminDashboard.partnerTypes[p.type as keyof typeof t.adminDashboard.partnerTypes]}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <ToggleSwitch
                                            checked={methods.whatsapp.enabled}
                                            onChange={() => handleToggle(p, 'whatsapp')}
                                            disabled={mutation.isPending}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <ToggleSwitch
                                            checked={methods.phone.enabled}
                                            onChange={() => handleToggle(p, 'phone')}
                                            disabled={mutation.isPending}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <ToggleSwitch
                                            checked={methods.form.enabled}
                                            onChange={() => handleToggle(p, 'form')}
                                            disabled={mutation.isPending}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="link" onClick={() => setModalState({ isOpen: true, partner: p })}>
                                            {t.adminShared.edit}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminInquiryManagementPage;