import React, { useState, useEffect, useRef } from 'react';
import type { Language, Property } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses, selectClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { useData } from '../shared/DataContext';

interface AdminPropertyEditModalProps {
    property: Property;
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

const AdminPropertyEditModal: React.FC<AdminPropertyEditModalProps> = ({ property, onClose, onSave, language }) => {
    const t = translations[language];
    const td = t.dashboard.propertyForm;
    const tp = t.propertiesPage;
    const t_admin = t.adminDashboard;
    const { updateProperty } = useData();

    const [formData, setFormData] = useState<Partial<Property>>({ 
        ...property,
        listingStartDate: property.listingStartDate ? property.listingStartDate.split('T')[0] : '',
        listingEndDate: property.listingEndDate ? property.listingEndDate.split('T')[0] : '',
    });
    const [mainImage, setMainImage] = useState<string>(property.imageUrl);
    const [galleryImages, setGalleryImages] = useState<string[]>(property.gallery);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setMainImage(base64);
        }
    };

    const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const base64Promises = files.map((file: File) => fileToBase64(file));
            const base64Images = await Promise.all(base64Promises);
            setGalleryImages(prev => [...prev, ...base64Images]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name.includes('.')) {
            const [field, subfield] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [field]: { ...(prev as any)[field], [subfield]: value }
            }));
        } else if (type === 'number') {
             setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleNestedChange = (parent: 'delivery' | 'installments', child: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev as any)[parent],
                [child]: value
            }
        }));
    };

    const handleComplexChange = (field: 'status' | 'type' | 'finishingStatus', valueEn: string) => {
        let valueAr = '';
        const findKeyByValue = (obj: any, val: string) => Object.keys(obj).find(key => obj[key] === val);

        if (field === 'status') {
             const key = findKeyByValue(translations.en.propertiesPage, valueEn);
             if (key) valueAr = translations.ar.propertiesPage[key as keyof typeof translations.ar.propertiesPage]
        }
        if (field === 'type') {
             const key = findKeyByValue(translations.en.propertiesPage, valueEn);
             if (key) valueAr = translations.ar.propertiesPage[key as keyof typeof translations.ar.propertiesPage]
        }
         if (field === 'finishingStatus') {
             const key = findKeyByValue(translations.en.propertiesPage, valueEn);
             if (key) valueAr = translations.ar.propertiesPage[key as keyof typeof translations.ar.propertiesPage]
        }
        setFormData(prev => ({ ...prev, [field]: { en: valueEn, ar: valueAr }}));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formattedPriceAr = `${formData.priceNumeric?.toLocaleString('ar-EG')} ج.م`;
        const formattedPriceEn = `EGP ${formData.priceNumeric?.toLocaleString('en-US')}`;

        const propertyData: any = {
            ...formData,
            price: { ar: formattedPriceAr, en: formattedPriceEn },
            imageUrl: mainImage,
            gallery: galleryImages,
            amenities: {
                ar: typeof formData.amenities?.ar === 'string' ? (formData.amenities.ar as string).split(',').map(s => s.trim()) : formData.amenities?.ar,
                en: typeof formData.amenities?.en === 'string' ? (formData.amenities.en as string).split(',').map(s => s.trim()) : formData.amenities?.en,
            }
        };
        
        // Ensure empty dates are sent as undefined or null
        if (!propertyData.listingStartDate) delete propertyData.listingStartDate;
        if (!propertyData.listingEndDate) delete propertyData.listingEndDate;
        
        await updateProperty(property.id, propertyData);
        setLoading(false);
        onSave();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-amber-500">{t_admin.editPropertyModal.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label={td.propertyTitleAr} id="title.ar"><input type="text" name="title.ar" value={formData.title?.ar} onChange={handleChange} className={inputClasses} required /></FormField>
                        <FormField label={td.propertyTitleEn} id="title.en"><input type="text" name="title.en" value={formData.title?.en} onChange={handleChange} className={inputClasses} required /></FormField>
                        <FormField label={td.addressAr} id="address.ar"><input type="text" name="address.ar" value={formData.address?.ar} onChange={handleChange} className={inputClasses} required /></FormField>
                        <FormField label={td.addressEn} id="address.en"><input type="text" name="address.en" value={formData.address?.en} onChange={handleChange} className={inputClasses} required /></FormField>
                        <div className="md:col-span-2"><FormField label={td.descriptionAr} id="description.ar"><textarea name="description.ar" value={formData.description?.ar} onChange={handleChange} className={inputClasses} rows={3} /></FormField></div>
                        <div className="md:col-span-2"><FormField label={td.descriptionEn} id="description.en"><textarea name="description.en" value={formData.description?.en} onChange={handleChange} className={inputClasses} rows={3} /></FormField></div>
                        <div className="md:col-span-2"><FormField label={td.amenitiesAr} id="amenities.ar"><input type="text" name="amenities.ar" value={Array.isArray(formData.amenities?.ar) ? formData.amenities.ar.join(', ') : ''} onChange={handleChange} className={inputClasses} /></FormField></div>
                        <div className="md:col-span-2"><FormField label={td.amenitiesEn} id="amenities.en"><input type="text" name="amenities.en" value={Array.isArray(formData.amenities?.en) ? formData.amenities.en.join(', ') : ''} onChange={handleChange} className={inputClasses} /></FormField></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <FormField label={tp.allStatuses} id="status"><select name="status" value={formData.status?.en} onChange={e => handleComplexChange('status', e.target.value)} className={selectClasses} required><option value="For Sale">{tp.forSale}</option><option value="For Rent">{tp.forRent}</option></select></FormField>
                        <FormField label={tp.allTypes} id="type"><select name="type" value={formData.type?.en} onChange={e => handleComplexChange('type', e.target.value)} className={selectClasses} required><option value="Apartment">{tp.apartment}</option><option value="Villa">{tp.villa}</option><option value="Commercial">{tp.commercial}</option><option value="Land">{tp.land}</option></select></FormField>
                        <FormField label={t.addPropertyPage.price} id="priceNumeric"><input type="number" name="priceNumeric" value={formData.priceNumeric} onChange={handleChange} className={inputClasses} required /></FormField>
                        <FormField label={tp.finishing} id="finishingStatus"><select name="finishingStatus" value={formData.finishingStatus?.en} onChange={e => handleComplexChange('finishingStatus', e.target.value)} className={selectClasses}><option value="">None</option><option value="Fully Finished">{tp.fullyFinished}</option><option value="Semi-finished">{tp.semiFinished}</option><option value="Without Finishing">{tp.withoutFinishing}</option><option value="Super Lux">{tp.superLux}</option><option value="Luxury Finishing">{tp.luxuryFinishing}</option><option value="Fully Furnished">{tp.fullyFurnished}</option></select></FormField>
                        <FormField label={t.addPropertyPage.area} id="area"><input type="number" name="area" value={formData.area} onChange={handleChange} className={inputClasses} required /></FormField>
                        <FormField label={t.addPropertyPage.bedrooms} id="beds"><input type="number" name="beds" value={formData.beds} onChange={handleChange} className={inputClasses} /></FormField>
                        <FormField label={t.addPropertyPage.bathrooms} id="baths"><input type="number" name="baths" value={formData.baths} onChange={handleChange} className={inputClasses} /></FormField>
                        <FormField label={t.addPropertyPage.floor} id="floor"><input type="number" name="floor" value={formData.floor} onChange={handleChange} className={inputClasses} /></FormField>
                        <div className="flex items-center pt-5"><input type="checkbox" id="isInCompound" name="isInCompound" checked={!!formData.isInCompound} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/><label htmlFor="isInCompound" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300">{td.isInCompound}</label></div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-amber-500">{t_admin.editPropertyModal.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t_admin.editPropertyModal.listingStartDate} id="listingStartDate"><input type="date" name="listingStartDate" value={formData.listingStartDate || ''} onChange={handleChange} className={inputClasses} /></FormField>
                            <FormField label={t_admin.editPropertyModal.listingEndDate} id="listingEndDate"><input type="date" name="listingEndDate" value={formData.listingEndDate || ''} onChange={handleChange} className={inputClasses} /></FormField>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-amber-500">{td.deliveryInfo}</h3>
                        <div className="flex gap-6"><div className="flex items-center"><input type="radio" id="immediateDelivery" name="isImmediate" checked={formData.delivery?.isImmediate} onChange={() => handleNestedChange('delivery', 'isImmediate', true)} className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500" /><label htmlFor="immediateDelivery" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{td.immediateDelivery}</label></div><div className="flex items-center"><input type="radio" id="futureDelivery" name="isImmediate" checked={!formData.delivery?.isImmediate} onChange={() => handleNestedChange('delivery', 'isImmediate', false)} className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500" /><label htmlFor="futureDelivery" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{td.futureDelivery}</label></div></div>
                        {!formData.delivery?.isImmediate && (<FormField label={td.deliveryDate} id="deliveryDate"><input type="text" placeholder="YYYY-MM" value={formData.delivery?.date} onChange={(e) => handleNestedChange('delivery', 'date', e.target.value)} className={inputClasses} /></FormField>)}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-amber-500">{td.installmentsInfo}</h3>
                        <div className="flex items-center"><input type="checkbox" id="installmentsAvailable" name="installmentsAvailable" checked={!!formData.installmentsAvailable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/><label htmlFor="installmentsAvailable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{td.installmentsAvailable}</label></div>
                        {formData.installmentsAvailable && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"><FormField label={td.downPayment} id="downPayment"><input type="number" value={formData.installments?.downPayment} onChange={(e) => handleNestedChange('installments', 'downPayment', parseInt(e.target.value))} className={inputClasses} /></FormField><FormField label={td.monthlyInstallment} id="monthlyInstallment"><input type="number" value={formData.installments?.monthlyInstallment} onChange={(e) => handleNestedChange('installments', 'monthlyInstallment', parseInt(e.target.value))} className={inputClasses} /></FormField><FormField label={td.years} id="years"><input type="number" value={formData.installments?.years} onChange={(e) => handleNestedChange('installments', 'years', parseInt(e.target.value))} className={inputClasses} /></FormField></div>)}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                         <FormField label={td.mainImage} id="mainImage">
                            <div className="flex items-center gap-4">
                                {mainImage && <img src={mainImage} alt="Main preview" className="w-24 h-24 rounded-md object-cover border-2 border-gray-300 dark:border-gray-600" />}
                                <input 
                                    type="file" 
                                    id="mainImage" 
                                    accept="image/*"
                                    onChange={handleMainImageChange} 
                                    className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                                />
                            </div>
                        </FormField>
                        <FormField label={td.galleryImages} id="gallery">
                            <input 
                                type="file" 
                                id="gallery" 
                                accept="image/*"
                                multiple
                                onChange={handleGalleryImagesChange} 
                                className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                            />
                            {galleryImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {galleryImages.map((img, index) => (
                                        <div key={index} className="relative">
                                            <img src={img} alt={`Gallery preview ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"
                                                aria-label="Remove image"
                                            >
                                                <CloseIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FormField>
                    </div>
                </form>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                    <button type="submit" onClick={handleSubmit} disabled={loading} className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {loading ? '...' : t.dashboard.saveChanges}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyEditModal;