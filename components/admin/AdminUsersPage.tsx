import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Language, PartnerStatus, AdminPartner, PartnerType } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import { getAllPartnersForAdmin, deletePartner as apiDeletePartner } from '../../api/partners';
import { useApiQuery } from '../shared/useApiQuery';
import AdminUserFormModal from './AdminUserFormModal';
import { useToast } from '../shared/ToastContext';
import ConfirmationModal from '../shared/ConfirmationModal';

const statusColors: { [key in PartnerStatus]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: 'name' | 'type' | 'status';
    direction: 'ascending' | 'descending';
} | null;

const AdminUsersPage: React.FC<{ language: Language }> = ({ language }) => {
    const t_admin = translations[language].adminDashboard;
    const t_shared = translations[language].adminShared;
    const t_um = t_admin.userManagement;
    
    const { data: partners, isLoading: loading, refetch } = useApiQuery('allUsers', getAllPartnersForAdmin);
    
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [modalState, setModalState] = useState<{ isOpen: boolean; userToEdit?: AdminPartner }>({ isOpen: false });
    const [userToDelete, setUserToDelete] = useState<AdminPartner | null>(null);

    const sortedAndFilteredUsers = useMemo(() => {
        let filteredUsers = (partners || []).filter(p => p.id !== 'admin-user');

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(lowercasedFilter) ||
                (user.nameAr && user.nameAr.toLowerCase().includes(lowercasedFilter)) ||
                user.email.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (typeFilter !== 'all') {
            filteredUsers = filteredUsers.filter(p => p.type === typeFilter);
        }

        if (sortConfig !== null) {
            filteredUsers.sort((a, b) => {
                let aValue = a[sortConfig.key] as string;
                let bValue = b[sortConfig.key] as string;

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredUsers;
    }, [partners, searchTerm, typeFilter, sortConfig, language]);

    const requestSort = (key: 'name' | 'type' | 'status') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'name' | 'type' | 'status') => {
        if (!sortConfig || sortConfig.key !== key) return <span className="w-4 h-4 ml-1"></span>;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />;
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const success = await apiDeletePartner(userToDelete.id);
            if (success) {
                showToast('User deleted successfully.', 'success');
                refetch();
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
        refetch();
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
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClasses + " max-w-xs"}>
                    <option value="all">{t_admin.filter.filterByType} ({t_admin.filter.all})</option>
                    {Object.entries(partnerTypes).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>{t_um.user}</th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('type')}>{t_um.role}</th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>{t_um.status}</th>
                            <th className="px-6 py-3">{t_um.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-8">Loading users...</td></tr>
                        ) : sortedAndFilteredUsers.length > 0 ? (
                            sortedAndFilteredUsers.map(user => (
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
        </div>
    );
};

export default AdminUsersPage;