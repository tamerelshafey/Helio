import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Language, PartnerStatus, AdminPartner, PartnerType } from '../../types';
import { translations } from '../../data/translations';
import { inputClasses, selectClasses } from '../shared/FormField';
import { deletePartner as apiDeletePartner } from '../../api/partners';
import { useDataContext } from '../shared/DataContext';
import AdminUserFormModal from './AdminUserFormModal';
import { useToast } from '../shared/ToastContext';
import ConfirmationModal from '../shared/ConfirmationModal';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';

const statusColors: { [key in PartnerStatus]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

const AdminUsersPage: React.FC<{ language: Language }> = ({ language }) => {
    const t_admin = translations[language].adminDashboard;
    const t_shared = translations[language].adminShared;
    const t_um = t_admin.userManagement;
    
    const { allPartners: partners, isLoading, refetchAll } = useDataContext();
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
        // FIX: Add explicit types to lambda arguments to fix type inference issues.
        searchFn: (user: AdminPartner, term) => 
            user.name.toLowerCase().includes(term) ||
            (user.nameAr && user.nameAr.toLowerCase().includes(term)) ||
            user.email.toLowerCase().includes(term),
        filterFns: {
            type: (p: AdminPartner, v) => p.type === v,
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
                    language={language}
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
                <button onClick={() => setModalState({ isOpen: true })} className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                    {t_um.addUser}
                </button>
            </div>
            
            <div className="mb-4 flex flex-wrap items-center gap-4">
                 <input
                    type="text"
                    placeholder={t_admin.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-sm"}
                />
                <select value={filters.type || 'all'} onChange={(e) => setFilter('type', e.target.value)} className={selectClasses + " max-w-xs"}>
                    <option value="all">{t_admin.filter.filterByType} ({t_admin.filter.all})</option>
                    {Object.entries(partnerTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>{t_um.user}{getSortIcon('name')}</th>
                                <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('type')}>{t_um.role}{getSortIcon('type')}</th>
                                <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>{t_um.status}{getSortIcon('status')}</th>
                                <th className="px-6 py-3">{t_um.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center p-8">Loading users...</td></tr>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map(user => (
                                    <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <img src={user.imageUrl} alt={user.name} className="w-10 h-10 object-cover rounded-full" />
                                                <div>
                                                    <div>{language === 'ar' ? user.nameAr || user.name : user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">{partnerTypes[user.type as keyof typeof partnerTypes] || user.type}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[user.status]}`}>
                                                {partnerStatuses[user.status as keyof typeof partnerStatuses] || user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-4 whitespace-nowrap">
                                            <button onClick={() => setModalState({ isOpen: true, userToEdit: user })} className="font-medium text-amber-600 hover:underline">{t_um.editUser}</button>
                                            <button onClick={() => setUserToDelete(user)} className="font-medium text-red-600 hover:underline">{t_shared.delete}</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-8">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} language={language} />
            </div>
        </div>
    );
};

export default AdminUsersPage;