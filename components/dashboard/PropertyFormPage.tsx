import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Language, Property } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import FormField, { inputClasses, selectClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { useData } from '../shared/DataContext';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


const PropertyFormPage: React.FC<{ language: Language }> = ({ language }) => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { properties, addProperty, updateProperty } = useData();
    const t = translations[language];
    const td = t.dashboard.propertyForm;
    const tp = t.propertiesPage;

    const [formData, setFormData] = useState<Partial<Property>>({
        title: { ar: '', en: '' },
        address: { ar: '', en: '' },
        description: { ar: '', en: '' },
        status: { en: 'For Sale', ar: 'للبيع' },
        type: { en: 'Apartment', ar: 'شقة' },
        priceNumeric: 0,
        price: { ar: '', en: '' },
        beds: 3,
        baths: 2,
        area: 150,
        floor: 1,
        amenities: { ar: [], en: [] },
        installmentsAvailable: false,
        isInCompound: false,
        delivery: { isImmediate: true, date: '' },
        installments: { downPayment: 0, monthlyInstallment: 0, years: 0 },
    });
    
    const [mainImage, setMainImage] = useState<string>(''); // Can be URL or dataURL
    const [galleryImages, setGalleryImages] = useState<string[]>([]); // Can be URLs or dataURLs
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (propertyId) {
            setLoading(true);
            const prop = properties.find(p => p.id === propertyId);
            if (prop && (prop.partnerId === currentUser?.id || currentUser?.type === 'admin')) {
                setFormData({
                    ...prop,
                    delivery: prop.delivery || { isImmediate: true, date: '' },
                    installments: prop.installments || { downPayment: 0, monthlyInstallment: 0, years: 0 },
                });
                setMainImage(prop.imageUrl);
                setGalleryImages(prop.gallery);
            } else if (properties.length > 0) { // check if properties are loaded
                navigate('/dashboard'); // Not found or not authorized
            }
            setLoading(false);
        }
    }, [propertyId, currentUser, navigate, properties]);

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
        if (field === 'status') {
            if (valueEn === 'For Sale') valueAr = 'للبيع';
            if (valueEn === 'For Rent') valueAr = 'إيجار';
        }
        if (field === 'type') {
            if (valueEn === 'Apartment') valueAr = 'شقة';
            if (valueEn === 'Villa') valueAr = 'فيلا';
            if (valueEn === 'Commercial') valueAr = 'تجاري';
            if (valueEn === 'Land') valueAr = 'أرض';
        }
         if (field === 'finishingStatus') {
            if (valueEn === 'Fully Finished') valueAr = 'تشطيب كامل';
            if (valueEn === 'Semi-finished') valueAr = 'نصف تشطيب';
            if (valueEn === 'Super Lux') valueAr = 'سوبر لوكس';
            if (valueEn === 'Luxury Finishing') valueAr = 'تشطيب فاخر';
            if (valueEn === 'Fully Furnished') valueAr = 'مفروشة بالكامل';
            if (valueEn === 'Without Finishing') valueAr = 'بدون تشطيب';
        }
        setFormData(prev => ({ ...prev, [field]: { en: valueEn, ar: valueAr }}));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setLoading(true);

        const formattedPriceAr = `${formData.priceNumeric?.toLocaleString('ar-EG')} ج.م`;
        const formattedPriceEn = `EGP ${formData.priceNumeric?.toLocaleString('en-US')}`;

        const propertyData: any = {
            ...formData,
            partnerId: currentUser.id,
            price: { ar: formattedPriceAr, en: formattedPriceEn },
            imageUrl: mainImage,
            gallery: galleryImages,
            amenities: {
                ar: typeof formData.amenities?.ar === 'string' ? (formData.amenities.ar as string).split(',').map(s => s.trim()) : formData.amenities?.ar,
                en: typeof formData.amenities?.en === 'string' ? (formData.amenities.en as string).split(',').map(s => s.trim()) : formData.amenities?.en,
            }
        };

        if (propertyId) {
            await updateProperty(propertyId, propertyData);
            alert(td.updateSuccess);
        } else {
            await addProperty(propertyData);
            alert(td.addSuccess);
        }
        setLoading(false);
        if (currentUser.type === 'admin') {
            navigate('/admin/properties');
        } else {
            navigate('/dashboard');
        }
    };

    if (loading && propertyId) return <div>Loading...</div>

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {propertyId ? td.editTitle : td.addTitle}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={td.propertyTitleAr} id="title.ar">
                        <input type="text" name="title.ar" value={formData.title?.ar} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                    <FormField label={td.propertyTitleEn} id="title.en">
                        <input type="text" name="title.en" value={formData.title?.en} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                    <FormField label={td.addressAr} id="address.ar">
                        <input type="text" name="address.ar" value={formData.address?.ar} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                    <FormField label={td.addressEn} id="address.en">
                        <input type="text" name="address.en" value={formData.address?.en} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                     <div className="md:col-span-2">
                         <FormField label={td.descriptionAr} id="description.ar">
                            <textarea name="description.ar" value={formData.description?.ar} onChange={handleChange} className={inputClasses} rows={4} />
                        </FormField>
                    </div>
                     <div className="md:col-span-2">
                        <FormField label={td.descriptionEn} id="description.en">
                            <textarea name="description.en" value={formData.description?.en} onChange={handleChange} className={inputClasses} rows={4} />
                        </FormField>
                    </div>
                     <div className="md:col-span-2">
                        <FormField label={td.amenitiesAr} id="amenities.ar">
                           <input type="text" name="amenities.ar" value={Array.isArray(formData.amenities?.ar) ? formData.amenities.ar.join(', ') : ''} onChange={handleChange} className={inputClasses} />
                        </FormField>
                    </div>
                     <div className="md:col-span-2">
                        <FormField label={td.amenitiesEn} id="amenities.en">
                           <input type="text" name="amenities.en" value={Array.isArray(formData.amenities?.en) ? formData.amenities.en.join(', ') : ''} onChange={handleChange} className={inputClasses} />
                        </FormField>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                     <FormField label={tp.allStatuses} id="status">
                        <select name="status" value={formData.status?.en} onChange={e => handleComplexChange('status', e.target.value)} className={selectClasses} required>
                            <option value="For Sale">{tp.forSale}</option>
                            <option value="For Rent">{tp.forRent}</option>
                        </select>
                    </FormField>
                    <FormField label={tp.allTypes} id="type">
                         <select name="type" value={formData.type?.en} onChange={e => handleComplexChange('type', e.target.value)} className={selectClasses} required>
                            <option value="Apartment">{tp.apartment}</option>
                            <option value="Villa">{tp.villa}</option>
                            <option value="Commercial">{tp.commercial}</option>
                            <option value="Land">{tp.land}</option>
                        </select>
                    </FormField>
                    <FormField label={t.addPropertyPage.price} id="priceNumeric">
                        <input type="number" name="priceNumeric" value={formData.priceNumeric} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                     <FormField label={tp.finishing} id="finishingStatus">
                        <select name="finishingStatus" value={formData.finishingStatus?.en} onChange={e => handleComplexChange('finishingStatus', e.target.value)} className={selectClasses}>
                            <option value="">None</option>
                            <option value="Fully Finished">{tp.fullyFinished}</option>
                            <option value="Semi-finished">{tp.semiFinished}</option>
                            <option value="Without Finishing">{tp.withoutFinishing}</option>
                            <option value="Super Lux">{tp.superLux}</option>
                            <option value="Luxury Finishing">{tp.luxuryFinishing}</option>
                            <option value="Fully Furnished">{tp.fullyFurnished}</option>
                        </select>
                    </FormField>
                     <FormField label={t.addPropertyPage.area} id="area">
                        <input type="number" name="area" value={formData.area} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                     <div className="flex items-center pt-5">
                        <input type="checkbox" id="isInCompound" name="isInCompound" checked={!!formData.isInCompound} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                        <label htmlFor="isInCompound" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                           {td.isInCompound}
                        </label>
                    </div>

                    { formData.type?.en !== 'Commercial' && formData.type?.en !== 'Land' && <>
                        <FormField label={t.addPropertyPage.bedrooms} id="beds">
                            <input type="number" name="beds" value={formData.beds} onChange={handleChange} className={inputClasses} />
                        </FormField>
                        <FormField label={t.addPropertyPage.bathrooms} id="baths">
                            <input type="number" name="baths" value={formData.baths} onChange={handleChange} className={inputClasses} />
                        </FormField>
                    </>}
                    <FormField label={t.addPropertyPage.floor} id="floor">
                        <input type="number" name="floor" value={formData.floor} onChange={handleChange} className={inputClasses} />
                    </FormField>
                </div>
                
                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-amber-500">{td.deliveryInfo}</h3>
                    <div className="flex gap-6">
                        <div className="flex items-center">
                            <input type="radio" id="immediateDelivery" name="isImmediate" checked={formData.delivery?.isImmediate} onChange={() => handleNestedChange('delivery', 'isImmediate', true)} className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500" />
                            <label htmlFor="immediateDelivery" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{td.immediateDelivery}</label>
                        </div>
                         <div className="flex items-center">
                            <input type="radio" id="futureDelivery" name="isImmediate" checked={!formData.delivery?.isImmediate} onChange={() => handleNestedChange('delivery', 'isImmediate', false)} className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500" />
                            <label htmlFor="futureDelivery" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{td.futureDelivery}</label>
                        </div>
                    </div>
                    {!formData.delivery?.isImmediate && (
                        <FormField label={td.deliveryDate} id="deliveryDate">
                            <input type="text" placeholder="YYYY-MM" value={formData.delivery?.date} onChange={(e) => handleNestedChange('delivery', 'date', e.target.value)} className={inputClasses} />
                        </FormField>
                    )}
                </div>

                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                     <h3 className="text-lg font-semibold text-amber-500">{td.installmentsInfo}</h3>
                     <div className="flex items-center">
                        <input type="checkbox" id="installmentsAvailable" name="installmentsAvailable" checked={!!formData.installmentsAvailable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                        <label htmlFor="installmentsAvailable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                           {td.installmentsAvailable}
                        </label>
                    </div>
                    {formData.installmentsAvailable && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                             <FormField label={td.downPayment} id="downPayment">
                                <input type="number" value={formData.installments?.downPayment} onChange={(e) => handleNestedChange('installments', 'downPayment', parseInt(e.target.value))} className={inputClasses} />
                            </FormField>
                             <FormField label={td.monthlyInstallment} id="monthlyInstallment">
                                <input type="number" value={formData.installments?.monthlyInstallment} onChange={(e) => handleNestedChange('installments', 'monthlyInstallment', parseInt(e.target.value))} className={inputClasses} />
                            </FormField>
                             <FormField label={td.years} id="years">
                                <input type="number" value={formData.installments?.years} onChange={(e) => handleNestedChange('installments', 'years', parseInt(e.target.value))} className={inputClasses} />
                            </FormField>
                        </div>
                    )}
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
                                required={!propertyId}
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
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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

                <div className="flex justify-end pt-6">
                    <button type="submit" disabled={loading} className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {loading ? '...' : td.saveProperty}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PropertyFormPage;