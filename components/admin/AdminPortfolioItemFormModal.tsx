import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Language, PortfolioItem } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses, selectClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { useData } from '../shared/DataContext';

interface AdminPortfolioItemFormModalProps {
    itemToEdit?: PortfolioItem;
    onClose: () => void;
    onSave: () => void;
    language: Language;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminPortfolioItemFormModal: React.FC<AdminPortfolioItemFormModalProps> = ({ itemToEdit, onClose, onSave, language }) => {
    const t = translations[language].dashboard;
    const t_admin = translations[language].adminDashboard.decorationsManagement;
    const { partners, decorationCategories, addPortfolioItem, updatePortfolioItem } = useData();
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: { ar: itemToEdit?.title.ar || '', en: itemToEdit?.title.en || '' },
        partnerId: itemToEdit?.partnerId || '',
        categoryId: decorationCategories.find(c => c.name.en === itemToEdit?.category.en)?.id || '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(itemToEdit?.src || null);

    const finishingPartners = useMemo(() => partners.filter(p => p.type === 'finishing' || p.type === 'decorations'), [partners]);
    
    useEffect(() => {
        if (finishingPartners.length > 0 && !itemToEdit) {
            setFormData(prev => ({ ...prev, partnerId: finishingPartners[0].id }));
        }
        if (decorationCategories.length > 0 && !itemToEdit) {
            setFormData(prev => ({...prev, categoryId: decorationCategories[0].id}));
        }
    }, [finishingPartners, decorationCategories, itemToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [field, lang] = name.split('.');
            setFormData(prev => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let imageSrc = itemToEdit?.src || '';
        if (imageFile) {
            imageSrc = await fileToBase64(imageFile);
        }
        
        const selectedCategory = decorationCategories.find(c => c.id === formData.categoryId);
        if (!selectedCategory) {
            setLoading(false);
            alert("Please select a valid category.");
            return;
        }

        const dataToSave = {
            title: formData.title,
            partnerId: formData.partnerId,
            category: selectedCategory.name,
            src: imageSrc,
            alt: formData.title.en || 'Decoration work',
        };

        if (itemToEdit) {
            await updatePortfolioItem(itemToEdit.id, dataToSave);
        } else {
            await addPortfolioItem(dataToSave as Omit<PortfolioItem, 'id'>);
        }
        setLoading(false);
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-amber-500">{itemToEdit ? t_admin.editItem : t_admin.addNewItem}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <FormField label={t.workImageURL} id="src">
                        <div className="flex items-center gap-4">
                            {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-md object-cover border-2" />}
                            <input type="file" id="src" accept="image/*" onChange={handleFileChange} className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} required={!itemToEdit} />
                        </div>
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t.workTitleAr} id="title.ar"><input type="text" name="title.ar" value={formData.title.ar} onChange={handleChange} className={inputClasses} required /></FormField>
                        <FormField label={t.workTitleEn} id="title.en"><input type="text" name="title.en" value={formData.title.en} onChange={handleChange} className={inputClasses} required /></FormField>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t_admin.itemCategory} id="categoryId">
                           <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={selectClasses} required>
                                {decorationCategories.map(c => <option key={c.id} value={c.id}>{c.name[language]}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t_admin.itemPartner} id="partnerId">
                            <select name="partnerId" value={formData.partnerId} onChange={handleChange} className={selectClasses} required>
                                {finishingPartners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </FormField>
                    </div>
                </form>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {loading ? '...' : t.saveChanges}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPortfolioItemFormModal;