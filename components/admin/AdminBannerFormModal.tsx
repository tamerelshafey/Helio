import React, { useState, useEffect, useRef } from 'react';
import type { Language, Banner } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses, selectClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { addBanner, updateBanner } from '../../api/banners';

interface AdminBannerFormModalProps {
    bannerToEdit?: Banner;
    onClose: () => void;
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

const AdminBannerFormModal: React.FC<AdminBannerFormModalProps> = ({ bannerToEdit, onClose, language }) => {
    const t = translations[language].adminDashboard.manageBanners;
    const t_shared = translations[language].adminShared;
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: bannerToEdit?.title || '',
        link: bannerToEdit?.link || '',
        locations: bannerToEdit?.locations || [],
        status: bannerToEdit?.status || 'active',
        startDate: bannerToEdit?.startDate?.split('T')[0] || '',
        endDate: bannerToEdit?.endDate?.split('T')[0] || '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(bannerToEdit?.imageUrl || null);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (location: 'home' | 'properties' | 'details' | 'finishing' | 'decorations') => {
        setFormData(prev => {
            const newLocations = prev.locations.includes(location)
                ? prev.locations.filter(l => l !== location)
                : [...prev.locations, location];
            return { ...prev, locations: newLocations as ('home' | 'properties' | 'details' | 'finishing' | 'decorations')[] };
        });
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

        let imageUrl = bannerToEdit?.imageUrl || '';
        if (imageFile) {
            imageUrl = await fileToBase64(imageFile);
        }

        const dataToSave = {
            ...formData,
            imageUrl,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
        };

        if (bannerToEdit) {
            await updateBanner(bannerToEdit.id, dataToSave);
        } else {
            await addBanner(dataToSave as Omit<Banner, 'id'>);
        }
        setLoading(false);
        onClose();
    };
    
    const locationOptions = ['home', 'properties', 'details', 'finishing', 'decorations'] as const;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-amber-500">{bannerToEdit ? t.editBanner : t.addBanner}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow contents">
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        <FormField label={t.bannerTitle} id="title">
                            <input name="title" value={formData.title} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <FormField label={t.bannerImage} id="image">
                            <div className="flex items-center gap-4">
                                {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-12 rounded-md object-cover border" />}
                                <input type="file" id="image" accept="image/*" onChange={handleFileChange} className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} required={!bannerToEdit} />
                            </div>
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                                <h4 className="font-bold mb-1">{language === 'ar' ? 'الأبعاد الموصى بها (لأفضل النتائج):' : 'Recommended Dimensions (for best results):'}</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>{language === 'ar' ? 'الصفحة الرئيسية' : 'Home Page'}:</strong> {language === 'ar' ? 'بانر عريض (بنسبة عرض إلى ارتفاع 3:1 تقريبًا، مثال: 1500x500 بكسل).' : 'Wide banner (approx. 3:1 aspect ratio, e.g., 1500x500 px).'}</li>
                                    <li><strong>{language === 'ar' ? 'صفحات العقارات، التشطيبات، الديكورات' : 'Properties, Finishing, Decorations Pages'}:</strong> {language === 'ar' ? 'بانر عريض جدًا (بنسبة 5:1 تقريبًا، مثال: 1500x300 بكسل).' : 'Very wide banner (approx. 5:1 aspect ratio, e.g., 1500x300 px).'}</li>
                                    <li><strong>{language === 'ar' ? 'صفحة تفاصيل العقار' : 'Property Details Page'}:</strong> {language === 'ar' ? 'بانر قياسي (بنسبة 16:9، مثال: 1280x720 بكسل).' : 'Standard banner (16:9 aspect ratio, e.g., 1280x720 px).'}</li>
                                </ul>
                            </div>
                        </FormField>
                        <FormField label={t.bannerLink} id="link">
                            <input name="link" value={formData.link} placeholder="e.g., /properties" className={inputClasses} />
                        </FormField>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.displayLocations}</label>
                            <div className="flex flex-wrap gap-4">
                                {locationOptions.map(loc => (
                                    <label key={loc} className="flex items-center gap-2">
                                        <input type="checkbox" checked={formData.locations.includes(loc)} onChange={() => handleLocationChange(loc)} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                                        <span className="capitalize">{loc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField label={t.status} id="status">
                                <select name="status" value={formData.status} onChange={handleChange} className={selectClasses}>
                                    <option value="active">{t.active}</option>
                                    <option value="inactive">{t.inactive}</option>
                                </select>
                            </FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.startDate} id="startDate">
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClasses} />
                            </FormField>
                             <FormField label={t.endDate} id="endDate">
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClasses} />
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

export default AdminBannerFormModal;