

import React, { useState, useEffect, useRef } from 'react';
import type { Banner } from '../../types';
import FormField from '../ui/FormField';
// FIX: Corrected import path for Icons
import { CloseIcon } from '../ui/Icons';
import { addBanner, updateBanner } from '../../services/banners';
import { useLanguage } from '../shared/LanguageContext';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface AdminBannerFormModalProps {
    bannerToEdit?: Banner;
    onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminBannerFormModal: React.FC<AdminBannerFormModalProps> = ({ bannerToEdit, onClose }) => {
    const { language, t } = useLanguage();
    const t_page = t.adminDashboard.manageBanners;
    const t_shared = t.adminShared;
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
                    <h3 className="text-xl font-bold text-amber-500">{bannerToEdit ? t_page.editBanner : t_page.addBanner}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow contents">
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        <FormField label={t_page.bannerTitle} id="title">
                            <Input name="title" value={formData.title} onChange={handleChange} required />
                        </FormField>
                        <FormField label={t_page.bannerImage} id="image">
                            <div className="flex items-center gap-4">
                                {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-12 rounded-md object-cover border" />}
                                <Input type="file" id="image" accept="image/*" onChange={handleFileChange} className="p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" required={!bannerToEdit} />
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
                        <FormField label={t_page.bannerLink} id="link">
                            <Input name="link" value={formData.link} placeholder="e.g., /properties" />
                        </FormField>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t_page.displayLocations}</label>
                            <div className="flex flex-wrap gap-4">
                                {locationOptions.map(loc => (
                                    <label key={loc} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={formData.locations.includes(loc)}
                                            onCheckedChange={() => handleLocationChange(loc)}
                                            id={`loc-${loc}`}
                                        />
                                        <span className="capitalize">{loc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField label={t_page.status} id="status">
                                <Select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="active">{t_page.active}</option>
                                    <option value="inactive">{t_page.inactive}</option>
                                </Select>
                            </FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t_page.startDate} id="startDate">
                                <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                            </FormField>
                             <FormField label={t_page.endDate} id="endDate">
                                <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
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

export default AdminBannerFormModal;