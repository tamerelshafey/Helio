

import React, { useState, useMemo } from 'react';
import type { PartnerStatus, AdminPartner, PartnerType } from '../../types';
import { deletePartner as apiDeletePartner } from '../../api/partners';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnersForAdmin } from '../../api/partners';
import AdminUserFormModal from './AdminUserFormModal';
import { useToast } from '../shared/ToastContext';
import ConfirmationModal from '../shared/ConfirmationModal';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';
import { useLanguage } from '../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const statusColors: { [key in PartnerStatus]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

const AdminUsersPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_shared = t.adminShared;
    const t_um = t_admin.userManagement;
    
    const { data: partners, isLoading, refetch: refetchAll } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { showToast } = useToast();
    
    const [modalState, setModalState] = useState<{ isOpen: boolean; userToEdit?: AdminPartner }>({ isOpen: false });
    const [userToDelete, setUserToDelete] = useState<AdminPartner | null>(null);

    const users = useMemo(() => (partners || []).filter(p => p.id !== 'admin-user'), [partners]);

    const {
        paginatedItems: paginatedUsers,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        filters, setFilter,
        requestSort, getSortIcon
    } = useAdminTable({
        data: users,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'name', direction: 'ascending' },
        searchFn: (user: AdminPartner, term: string) => 
            user.name.toLowerCase().includes(term) ||
            (user.nameAr && user.nameAr.toLowerCase().includes(term)) ||
            user.email.toLowerCase().includes(term),
        filterFns: {
            type: (p: AdminPartner, v: string) => p.type === v,
        }
    });

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const success = await apiDeletePartner(userToDelete.id);
            if (success) {
                showToast('User deleted successfully.', 'success');
                refetchAll();
            } else {
                showToast('User not found. Could not delete.', 'error');
            }
        } catch (error) {
            showToast('Failed to delete user.', 'error');
            console.error(error);
        } finally {
            setUserToDelete(null);
        }
    };
    
    const handleSave = () => {
        showToast(modalState.userToEdit ? 'User updated successfully' : 'User added successfully', 'success');
        setModalState({ isOpen: false });
        refetchAll();
    };

    const partnerTypes = t_admin.partnerTypes;
    const partnerStatuses = t_admin.partnerStatuses;

    return (
        <div>
            {modalState.isOpen && (
                <AdminUserFormModal 
                    userToEdit={modalState.userToEdit}
                    onClose={() => setModalState({ isOpen: false })}
                    onSave={handleSave}
                />
            )}
            {userToDelete && (
                <ConfirmationModal
                    isOpen={!!userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title={t_um.confirmDelete.split('?')[0]}
                    message={`${t_um.confirmDelete.split('?')[0]} "${language === 'ar' ? userToDelete.nameAr || userToDelete.name : userToDelete.name}"?`}
                    confirmText={t_shared.delete}
                    cancelText={t_shared.cancel}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_um.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_um.subtitle}</p>
                </div>
                <Button onClick={() => setModalState({ isOpen: true })}>
                    {t_um.addUser}
                </Button>
            </div>
            
            <div className="mb-4 flex flex-wrap items-center gap-4">
                 <Input
                    type="text"
                    placeholder={t_admin.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={filters.type || 'all'} onChange={(e) => setFilter('type', e.target.value)} className="max-w-xs">
                    <option value="all">{t_admin.filter.filterByType} ({t_admin.filter.all})</option>
                    {Object.entries(partnerTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </Select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>{t_um.user}{getSortIcon('name')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('type')}>{t_um.role}{getSortIcon('type')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>{t_um.status}{getSortIcon('status')}</TableHead>
                            <TableHead>{t_um.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center p-8">Loading users...</TableCell></TableRow>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={user.imageUrl} alt={user.name} className="w-10 h-10 object-cover rounded-full" />
                                            <div>
                                                <div>{language === 'ar' ? user.nameAr || user.name : user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{partnerTypes[user.type as keyof typeof partnerTypes] || user.type}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[user.status]}`}>
                                            {partnerStatuses[user.status as keyof typeof partnerStatuses] || user.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="space-x-4 whitespace-nowrap">
                                        <Button variant="link" onClick={() => setModalState({ isOpen: true, userToEdit: user })}>{t_um.editUser}</Button>
                                        <Button variant="link" className="text-red-600 dark:text-red-500" onClick={() => setUserToDelete(user)}>{t_shared.delete}</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4} className="text-center p-8">No users found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminUsersPage;