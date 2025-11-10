
import React, { useState, useEffect, useRef } from 'react';
import type { PartnerStatus, AdminPartner, PartnerType } from '../../types';
import FormField from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { addInternalUser, updateUser } from '../../api/partners';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface AdminUserFormModalProps {
    userToEdit?: AdminPartner;
    onClose: () => void;
    onSave: () => void;
}

const AdminUserFormModal: React.FC<AdminUserFormModalProps> = ({ userToEdit, onClose, onSave }) => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_um = t_admin.userManagement;
    const t_shared = t.adminShared;

    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: userToEdit?.name || '',
        nameAr: userToEdit?.nameAr || '',
        email: userToEdit?.email || '',
        password: '',
        type: userToEdit?.type || 'developer',
        status: userToEdit?.status || 'active',
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (userToEdit) {
            await updateUser(userToEdit.id, formData);
        } else {
            await addInternalUser(formData);
        }
        setLoading(false);
        onSave();
    };
    
    const allPartnerTypes = Object.entries(t_admin.partnerTypes);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-amber-500">{userToEdit ? t_um.editUser : t_um.addUser}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField label={t_um.form.nameAr} id="nameAr"><Input name="nameAr" value={formData.nameAr} onChange={handleChange} required /></FormField>
                             <FormField label={t_um.form.nameEn} id="name"><Input name="name" value={formData.name} onChange={handleChange} required /></FormField>
                        </div>
                        <FormField label={t_um.form.email} id="email"><Input type="email" name="email" value={formData.email} onChange={handleChange} required /></FormField>
                        {!userToEdit && (
                            <FormField label={t_um.form.password} id="password">
                                <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={t_um.form.passwordHelp} />
                            </FormField>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t_um.role} id="type">
                                <Select name="type" value={formData.type} onChange={handleChange}>
                                    {allPartnerTypes.map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                </Select>
                            </FormField>
                            <FormField label={t_um.status} id="status">
                                <Select name="status" value={formData.status} onChange={handleChange}>
                                    {Object.entries(t_admin.partnerStatuses).map(([key, value]) => <option key={key} value={key}>{value}</option>))}
                                </Select>
                            </FormField>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>{t_shared.cancel}</Button>
                        <Button type="submit" isLoading={loading}>
                            {t_shared.save}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminUserFormModal;