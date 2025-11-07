import React, { useState, useEffect, useRef } from 'react';
import type { Language, PortfolioItem } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';
import { addPortfolioItem, updatePortfolioItem } from '../../api/portfolio';

interface PortfolioItemFormModalProps {
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

const PortfolioItemFormModal: React.FC<PortfolioItemFormModalProps> = ({ itemToEdit, onClose, onSave, language }) => {
    const { currentUser } = useAuth();
    const t = translations[language].dashboard;
    const t_form = translations[language].portfolioForm;
    const t_shared = translations[language].adminShared;
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: { ar: itemToEdit?.title.ar || '', en: itemToEdit?.title.en || '' },
        category: { ar: itemToEdit?.category.ar || '', en: itemToEdit?.category.en || '' },
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(itemToEdit?.imageUrl || null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('.');
        setFormData(prev => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: value } }));
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
        if (!currentUser) return;
        setLoading(true);

        let imageSrc = itemToEdit?.imageUrl || '';
        if (imageFile) {
            imageSrc = await fileToBase64(imageFile);
        }

        const dataToSave: Omit<PortfolioItem, 'id'> = {
            ...formData,
            partnerId: currentUser.id,
            imageUrl: imageSrc,
            alt: formData.title.en || 'Portfolio work',
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
                <form onSubmit={handleSubmit} className="flex-grow contents">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-amber-500">{itemToEdit ? t_form.editTitle : t_form.addTitle}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        <FormField label={t.workImageURL} id="imageUrl">
                            <div className="flex items-center gap-4">
                                {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-md object-cover border" />}
                                <input
                                    type="file"
                                    id="imageUrl"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                                    required={!itemToEdit}
                                />
                            </div>
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.workTitleAr} id="title.ar">
                                <input type="text" name="title.ar" value={formData.title.ar} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                            <FormField label={t.workTitleEn} id="title.en">
                                <input type="text" name="title.en" value={formData.title.en} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.workCategoryAr} id="category.ar">
                                <input type="text" name="category.ar" value={formData.category.ar} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                            <FormField label={t.workCategoryEn} id="category.en">
                                <input type="text" name="category.en" value={formData.category.en} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{t_shared.cancel}</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50">
                            {loading ? '...' : t_shared.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PortfolioItemFormModal;