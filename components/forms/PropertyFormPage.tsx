import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import type { Language, Property, FilterOption } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import FormField, { inputClasses, selectClasses } from '../shared/FormField';
import { CloseIcon, SparklesIcon } from '../icons/Icons';
import { GoogleGenAI } from '@google/genai';
import { getAllProperties, addProperty as apiAddProperty, updateProperty as apiUpdateProperty } from '../../mockApi/properties';
import { getAllProjects } from '../../mockApi/projects';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../../mockApi/filters';
import { useApiQuery } from '../shared/useApiQuery';
import LocationPickerModal from '../shared/LocationPickerModal';
import { Role } from '../../types';


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

type TranslatableField = 'title' | 'address' | 'description';

const PropertyFormPage: React.FC<{ language: Language }> = ({ language }) => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();

    const { data: properties, isLoading: isLoadingProps } = useApiQuery('allProperties', getAllProperties, { enabled: !!propertyId });
    const { data: projects, isLoading: isLoadingProjs } = useApiQuery('allProjects', getAllProjects);
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useApiQuery('propertyTypes', getAllPropertyTypes);
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useApiQuery('finishingStatuses', getAllFinishingStatuses);
    const { data: amenities, isLoading: isLoadingAmenities } = useApiQuery('amenities', getAllAmenities);

    const t = translations[language];
    const td = t.dashboard.propertyForm;
    const tp = t.propertiesPage;
    
    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<Partial<Property>>();
    
    const [mainImage, setMainImage] = useState<string>(''); // Can be URL or dataURL
    const [galleryImages, setGalleryImages] = useState<string[]>([]); // Can be URLs or dataURLs
    const [translationLoading, setTranslationLoading] = useState<Partial<Record<TranslatableField, boolean>>>({});
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState<'ar' | 'en' | null>(null);

    const watchType = watch('type');
    const watchStatus = watch('status');
    const watchDelivery = watch('delivery');
    const watchInstallments = watch('installmentsAvailable');
    const watchPrice = watch('priceNumeric');
    const watchArea = watch('area');
    const watchAmenities = watch('amenities');
    const watchLocation = watch('location');

    const partnerProjects = useMemo(() => (projects || []).filter(p => p.partnerId === currentUser?.id), [projects, currentUser]);

    const pricePerMeter = useMemo(() => {
        if (!watchPrice || !watchArea || watchArea === 0) return 0;
        return Math.round(watchPrice / watchArea);
    }, [watchPrice, watchArea]);

    useEffect(() => {
        if (propertyId && properties) {
            const prop = properties.find(p => p.id === propertyId);
            // FIX: Add type guard to ensure currentUser is a Partner before accessing partner-specific properties.
            if (prop && currentUser && 'type' in currentUser && (prop.partnerId === currentUser.id || currentUser.type === 'admin')) {
                reset({
                    ...prop,
                    delivery: prop.delivery || { isImmediate: true, date: '' },
                    installments: prop.installments || { downPayment: 0, monthlyInstallment: 0, years: 0 },
                });
                setMainImage(prop.imageUrl);
                setGalleryImages(prop.gallery);
            } else if (properties.length > 0) {
                navigate('/dashboard'); 
            }
        } else if (!propertyId) {
            // Set default for new property
             reset({
                projectId: searchParams.get('projectId') || undefined,
                status: { en: 'For Sale', ar: 'للبيع' },
                type: { en: 'Apartment', ar: 'شقة' },
                beds: 3,
                baths: 2,
                area: 150,
                floor: 1,
                location: { lat: 30.129, lng: 31.621 },
                amenities: { ar: [], en: [] },
                installmentsAvailable: false,
                isInCompound: false,
                delivery: { isImmediate: true, date: '' },
                installments: { downPayment: 0, monthlyInstallment: 0, years: 0 },
            });
        }
    }, [propertyId, currentUser, navigate, properties, reset, searchParams]);

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

    const handleComplexChange = (field: 'status' | 'type' | 'finishingStatus', valueEn: string) => {
        let valueAr = '';
        let option: FilterOption | undefined;

        if (field === 'status') {
            if (valueEn === 'For Sale') valueAr = 'للبيع';
            if (valueEn === 'For Rent') valueAr = 'إيجار';
        } else if (field === 'type' && propertyTypes) {
            option = propertyTypes.find(opt => opt.en === valueEn);
            valueAr = option ? option.ar : '';
        } else if (field === 'finishingStatus' && finishingStatuses) {
            option = finishingStatuses.find(opt => opt.en === valueEn);
            valueAr = option ? option.ar : '';
        }
        setValue(field, { en: valueEn, ar: valueAr });
    };

    const handleAmenityChange = (amenityEn: string) => {
        const currentAmenities = watchAmenities?.en || [];
        const newAmenities = currentAmenities.includes(amenityEn)
            ? currentAmenities.filter(a => a !== amenityEn)
            : [...currentAmenities, amenityEn];
        
        const amenitiesAr = newAmenities.map(en => {
            const amenity = amenities?.find(a => a.en === en);
            return amenity ? amenity.ar : en;
        });

        setValue('amenities', { en: newAmenities, ar: amenitiesAr });
    };

    const availableAmenities = useMemo(() => {
        if (!amenities) return [];
        const selectedType = watchType?.en;
        if (!selectedType) return amenities;
        return amenities.filter(amenity => 
            !amenity.applicableTo || amenity.applicableTo.length === 0 || amenity.applicableTo.includes(selectedType)
        );
    }, [amenities, watchType]);

    const availableFinishingStatuses = useMemo(() => {
        if (!finishingStatuses) return [];
        const selectedType = watchType?.en;
        if (!selectedType || selectedType === 'Land') return [];
        return finishingStatuses.filter(status => 
            !status.applicableTo || status.applicableTo.length === 0 || status.applicableTo.includes(selectedType)
        );
    }, [finishingStatuses, watchType]);

    const handleLocationSelect = (location: { lat: number, lng: number }) => {
        setValue('location', location);
        setIsLocationModalOpen(false);
    };


    const onSubmit = async (formData: Partial<Property>) => {
        // FIX: Add type guard to ensure currentUser is a Partner before accessing partner-specific properties.
        if (!currentUser || !('type' in currentUser) || !amenities) return;

        const priceNumeric = Number(formData.priceNumeric) || 0;
        const formattedPriceAr = `${priceNumeric.toLocaleString('ar-EG')} ج.م`;
        const formattedPriceEn = `EGP ${priceNumeric.toLocaleString('en-US')}`;

        const pricePerMeterNumeric = Math.round(priceNumeric / (Number(formData.area) || 1));
        const pricePerMeter = formData.status?.en === 'For Sale' && pricePerMeterNumeric > 0 ? {
            ar: `${pricePerMeterNumeric.toLocaleString('ar-EG')} ج.م/م²`,
            en: `EGP ${pricePerMeterNumeric.toLocaleString('en-US')}/m²`,
        } : undefined;

        const propertyData: any = {
            ...formData,
            partnerId: currentUser.id,
            price: { ar: formattedPriceAr, en: formattedPriceEn },
            pricePerMeter,
            imageUrl: mainImage,
            gallery: galleryImages,
        };

        if (propertyId) {
            await apiUpdateProperty(propertyId, propertyData);
            alert(td.updateSuccess);
        } else {
            await apiAddProperty(propertyData);
            alert(td.addSuccess);
        }
        const projectId = propertyData.projectId;
        if (currentUser.type === 'admin') {
            navigate('/admin/properties');
        } else if (currentUser.type === 'developer' && projectId) {
            navigate(`/dashboard/projects/${projectId}`);
        } else if (currentUser.type === 'developer') {
            navigate('/dashboard/projects');
        } else {
            navigate('/dashboard/properties');
        }
    };

    const loading = isLoadingProps || isLoadingProjs || isLoadingPropTypes || isLoadingFinishing || isLoadingAmenities;
    if (loading && !projects) return <div>Loading options...</div>;

    return (
        <div>
            {isLocationModalOpen && (
                <LocationPickerModal
                    onClose={() => setIsLocationModalOpen(false)}
                    onLocationSelect={handleLocationSelect}
                    language={language}
                    initialLocation={watchLocation}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {propertyId ? td.editTitle : td.addTitle}
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                {currentUser && 'type' in currentUser && currentUser.type === 'developer' && (
                    <FormField label="Project" id="projectId">
                        <select {...register("projectId", { required: true })} className={selectClasses} >
                            <option value="" disabled>Select a project</option>
                            {partnerProjects.map(proj => (
                                <option key={proj.id} value={proj.id}>{proj.name[language]}</option>
                            ))}
                        </select>
                    </FormField>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={td.propertyTitleAr} id="title.ar">
                        <input type="text" {...register("title.ar", { required: true })} className={inputClasses}/>
                    </FormField>
                    <FormField label={td.propertyTitleEn} id="title.en">
                         <div className="relative">
                            <input type="text" {...register("title.en", { required: true })} className={inputClasses} />
                        </div>
                    </FormField>
                    <FormField label={td.addressAr} id="address.ar">
                        <input type="text" {...register("address.ar", { required: true })} className={inputClasses} />
                    </FormField>
                    <FormField label={td.addressEn} id="address.en">
                         <div className="relative">
                            <input type="text" {...register("address.en", { required: true })} className={inputClasses} />
                        </div>
                    </FormField>
                     <div className="md:col-span-2">
                         <FormField label={td.descriptionAr} id="description.ar">
                            <div className="relative">
                                <textarea {...register("description.ar")} className={inputClasses} rows={4} />
                            </div>
                        </FormField>
                    </div>
                     <div className="md:col-span-2">
                        <FormField label={td.descriptionEn} id="description.en">
                             <div className="relative">
                                <textarea {...register("description.en")} className={inputClasses} rows={4} />
                            </div>
                        </FormField>
                    </div>
                </div>

                <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <legend className="text-lg font-semibold text-amber-500 mb-2">Location</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Latitude" id="latitude">
                            <input type="number" step="any" {...register("location.lat", { valueAsNumber: true })} className={inputClasses} />
                        </FormField>
                        <FormField label="Longitude" id="longitude">
                            <input type="number" step="any" {...register("location.lng", { valueAsNumber: true })} className={inputClasses} />
                        </FormField>
                    </div>
                    <button type="button" onClick={() => setIsLocationModalOpen(true)} className="w-full text-center font-medium text-sm text-amber-600 dark:text-amber-500 hover:underline p-2 rounded-md border border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/50">
                        Select on Map
                    </button>
                </fieldset>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                     <FormField label={tp.allStatuses} id="status">
                        <select value={watchStatus?.en} onChange={e => handleComplexChange('status', e.target.value)} className={selectClasses} required>
                            <option value="For Sale">{tp.forSale}</option>
                            <option value="For Rent">{tp.forRent}</option>
                        </select>
                    </FormField>
                    <FormField label={tp.allTypes} id="type">
                         <select value={watchType?.en} onChange={e => handleComplexChange('type', e.target.value)} className={selectClasses} required>
                            {(propertyTypes || []).map(opt => (
                                <option key={opt.id} value={opt.en}>{opt[language]}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t.addPropertyPage.price} id="priceNumeric">
                        <input type="number" {...register("priceNumeric", { required: true, valueAsNumber: true })} className={inputClasses} />
                    </FormField>
                     <FormField label={tp.finishing} id="finishingStatus">
                        <select 
                           value={watch('finishingStatus')?.en || ''}
                           onChange={e => handleComplexChange('finishingStatus', e.target.value)}
                           className={selectClasses}
                           disabled={!watchType?.en || watchType.en === 'Land' || availableFinishingStatuses.length === 0}
                        >
                            <option value="">None</option>
                             {availableFinishingStatuses.map(opt => (
                                <option key={opt.id} value={opt.en}>{opt[language]}</option>
                            ))}
                        </select>
                    </FormField>
                     <FormField label={t.addPropertyPage.area} id="area">
                        <input type="number" {...register("area", { required: true, valueAsNumber: true })} className={inputClasses} />
                    </FormField>
                    <FormField label={td.pricePerMeter} id="pricePerMeter">
                        <input type="text" value={pricePerMeter > 0 ? pricePerMeter.toLocaleString(language) : ''} className={`${inputClasses} bg-gray-100 dark:bg-gray-800`} disabled />
                    </FormField>
                     <div className="flex items-center gap-2 pt-5">
                        <input type="checkbox" id="isInCompound" {...register("isInCompound")} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                        <label htmlFor="isInCompound" className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                           {td.isInCompound}
                        </label>
                    </div>

                    { watchType?.en !== 'Commercial' && watchType?.en !== 'Land' && <>
                        <FormField label={t.addPropertyPage.bedrooms} id="beds">
                            <input type="number" {...register("beds", { valueAsNumber: true })} className={inputClasses} />
                        </FormField>
                        <FormField label={t.addPropertyPage.bathrooms} id="baths">
                            <input type="number" {...register("baths", { valueAsNumber: true })} className={inputClasses} />
                        </FormField>
                    </>}
                    <FormField label={t.addPropertyPage.floor} id="floor">
                        <input type="number" {...register("floor", { valueAsNumber: true })} className={inputClasses} />
                    </FormField>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{td.amenities}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/50">
                        {availableAmenities.map(amenity => (
                            <label key={amenity.id} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={watchAmenities?.en?.includes(amenity.en) || false}
                                    onChange={() => handleAmenityChange(amenity.en)}
                                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                {amenity[language]}
                            </label>
                        ))}
                    </div>
                </div>
                
                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-amber-500">{td.deliveryInfo}</h3>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <input type="radio" id="immediateDelivery" {...register("delivery.isImmediate")} value="true" checked={watchDelivery?.isImmediate === true} onChange={() => setValue('delivery.isImmediate', true)} className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500" />
                            <label htmlFor="immediateDelivery" className="block text-sm text-gray-900 dark:text-gray-300">{td.immediateDelivery}</label>
                        </div>
                         <div className="flex items-center gap-2">
                            <input type="radio" id="futureDelivery" {...register("delivery.isImmediate")} value="false" checked={watchDelivery?.isImmediate === false} onChange={() => setValue('delivery.isImmediate', false)} className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500" />
                            <label htmlFor="futureDelivery" className="block text-sm text-gray-900 dark:text-gray-300">{td.futureDelivery}</label>
                        </div>
                    </div>
                    {watchDelivery?.isImmediate === false && (
                        <FormField label={td.deliveryDate} id="deliveryDate">
                            <input type="text" placeholder="YYYY-MM" {...register("delivery.date")} className={inputClasses} />
                        </FormField>
                    )}
                </div>

                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                     <h3 className="text-lg font-semibold text-amber-500">{td.installmentsInfo}</h3>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" id="installmentsAvailable" {...register("installmentsAvailable")} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                        <label htmlFor="installmentsAvailable" className="block text-sm text-gray-900 dark:text-gray-300">
                           {td.installmentsAvailable}
                        </label>
                    </div>
                    {watchInstallments && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                             <FormField label={td.downPayment} id="downPayment">
                                <input type="number" {...register("installments.downPayment", { valueAsNumber: true })} className={inputClasses} />
                            </FormField>
                             <FormField label={td.monthlyInstallment} id="monthlyInstallment">
                                <input type="number" {...register("installments.monthlyInstallment", { valueAsNumber: true })} className={inputClasses} />
                            </FormField>
                             <FormField label={td.years} id="years">
                                <input type="number" {...register("installments.years", { valueAsNumber: true })} className={inputClasses} />
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
                    <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {isSubmitting ? '...' : td.saveProperty}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PropertyFormPage;