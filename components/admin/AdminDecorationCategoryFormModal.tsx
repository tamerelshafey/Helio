import React, { useState, useEffect, useRef } from 'react';
import type { Language, DecorationCategory } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { useData } from '../shared/DataContext';

interface AdminDecorationCategoryFormModalProps {
    categoryToEdit?: DecorationCategory;
    onClose: () => void;
    onSave: () => void;
    language: Language;
}

const AdminDecorationCategoryFormModal: React.FC<AdminDecorationCategoryFormModalProps> = ({ categoryToEdit, onClose, onSave, language }) => {
    const t = translations[language];
    const { addDecorationCategory, updateDecorationCategory } = useData();
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: { ar: categoryToEdit?.name.ar || '', en: categoryToEdit?.name.en || '' },
        description: { ar: categoryToEdit?.description.ar || '', en: categoryToEdit?.description.en || '' },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev as any)[field], [lang]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (categoryToEdit) {
            await updateDecorationCategory(categoryToEdit.id, formData);
        } else {
            await addDecorationCategory(formData);
        }
        setLoading(false);
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-amber-500">{categoryToEdit ? 'Edit Category' : 'Add New Category'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Name (Arabic)" id="name.ar"><input type="text" name="name.ar" value={formData.name.ar} onChange={handleChange} className={inputClasses} required /></FormField>
                        <FormField label="Name (English)" id="name.en"><input type="text" name="name.en" value={formData.name.en} onChange={handleChange} className={inputClasses} required /></FormField>
                    </div>
                    <FormField label="Description (Arabic)" id="description.ar"><textarea name="description.ar" value={formData.description.ar} onChange={handleChange} className={inputClasses} rows={3} required /></FormField>
                    <FormField label="Description (English)" id="description.en"><textarea name="description.en" value={formData.description.en} onChange={handleChange} className={inputClasses} rows={3} required /></FormField>
                </form>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{t.adminDashboard.editPropertyModal.title === 'تعديل العقار' ? 'إلغاء' : 'Cancel'}</button>
                    <button type="submit" onClick={handleSubmit} disabled={loading} className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {loading ? '...' : t.dashboard.saveChanges}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDecorationCategoryFormModal;
