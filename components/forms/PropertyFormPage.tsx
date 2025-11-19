
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property, FilterOption, Language } from '../../types';
import { useAuth } from '../auth/AuthContext';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';
import { CloseIcon } from '../ui/Icons';
import { addProperty as apiAddProperty, updateProperty as apiUpdateProperty, getAllProperties } from '../../services/properties';
import { getAllProjects } from '../../services/projects';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../../services/filters';
import { Role, Permission } from '../../types';
import { useToast } from '../shared/ToastContext';
import { useSubscriptionUsage } from '../../hooks/useSubscriptionUsage';
import UpgradeNotice from '../shared/UpgradeNotice';
import { useLanguage } from '../shared/LanguageContext';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Define specific interface for the form data structure
interface PropertyFormData {
    projectId?: string;
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    address: { ar: string; en: string };
    status: { en: string; ar: string };
    type: { en: string; ar: string };
    finishingStatus: { en: string; ar: string };
    area: number;
    priceNumeric: number;
    beds?: number;
    baths?: number;
    floor?: number;
    amenities: { en: string[], ar: string[] };
    location: { lat: number; lng: number };
    listingStatus: string;
    isInCompound: string; // Radio inputs return strings
    realEstateFinanceAvailable: string;
    installmentsAvailable: string;
    delivery: {
        isImmediate: string;
        date?: string;
    };
    installments?: {
        downPayment: number;
        monthlyInstallment: number;
        years: number;
    };
    contactMethod: 'platform' | 'direct';
    ownerPhone?: string;
}

const PropertyFormPage: React.FC = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser, hasPermission } = useAuth();
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    const usageType = currentUser?.type === 'developer' ? 'units' : 'properties';
    const { isLimitReached } = useSubscriptionUsage(usageType);

    const { data: properties } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });
    const { data: projects, isLoading: isLoadingProjs } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: isLoadingAmenities } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    
    const isLoadingContext = isLoadingProjs || isLoadingPropTypes || isLoadingFinishing || isLoadingAmenities;

    const td = t.dashboard.propertyForm;
    const tp = t.propertiesPage;
    
    const { register, handleSubmit, watch, setValue, reset } = useForm<PropertyFormData>();
    
    const [mainImage, setMainImage] = useState<string>('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    const watchType = watch('type');
    const watchStatus = watch('status');
    const watchFinishingStatus = watch('finishingStatus');
    const watchDelivery = watch('delivery');
    const watchInstallments = watch('installmentsAvailable');
    const watchPrice = watch('priceNumeric');
    const watchArea = watch('area');
    const watchAmenities = watch('amenities');
    const watchContactMethod = watch('contactMethod');
    
    const partnerProjects = useMemo(() => (projects || []).filter(p => p.partnerId === currentUser?.id), [projects, currentUser]);

    const pricePerMeter = useMemo(() => {
        if (!watchPrice || !watchArea || watchArea === 0) return 0;
        return Math.round(watchPrice / watchArea);
    }, [watchPrice, watchArea]);

    const handleNavigationSuccess = (property?: Property) => {
        queryClient.invalidateQueries({ queryKey: ['allProperties'] });
        queryClient.invalidateQueries({ queryKey: [`partner-properties-${currentUser?.id}`] });
        if (propertyId) {
            queryClient.invalidateQueries({ queryKey: [`property-${propertyId}`] });
        }
        
        const projectId = property?.projectId || watch('projectId');
        
        if (hasPermission(Permission.VIEW_ADMIN_DASHBOARD)) {
            navigate('/admin/properties/list');
        } else if (currentUser?.role === Role.DEVELOPER_PARTNER && projectId) {
            navigate(`/dashboard/projects/${projectId}`);
        } else if (currentUser?.role === Role.DEVELOPER_PARTNER && !projectId) {
            navigate('/dashboard/projects');
        } else {
            navigate('/dashboard/properties');
        }
    };
    
    const addMutation = useMutation({
        mutationFn: apiAddProperty,
        onSuccess: (newProperty) => {
            showToast(td.addSuccess, 'success');
            handleNavigationSuccess(newProperty);
        },
        onError: () => showToast('Failed to add property.', 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ propertyId, updates }: { propertyId: string; updates: Partial<Property> }) => apiUpdateProperty(propertyId, updates),
        onSuccess: (updatedProperty) => {
            showToast(td.updateSuccess, 'success');
            handleNavigationSuccess(updatedProperty);
        },
        onError: () => showToast('Failed to update property.', 'error'),
    });

    useEffect(() => {
        if (propertyId && properties) {
            const prop = properties.find(p => p.id === propertyId);
            const userCanEdit = currentUser && 'type' in currentUser && (prop?.partnerId === currentUser.id || hasPermission(Permission.MANAGE_ALL_PROPERTIES));

            if (prop && userCanEdit) {
                reset({
                    ...prop,
                    // Convert booleans/complex objects to form-friendly strings where needed
                    isInCompound: String(prop.isInCompound),
                    realEstateFinanceAvailable: String(prop.realEstateFinanceAvailable),
                    installmentsAvailable: String(prop.installmentsAvailable),
                    delivery: { ...prop.delivery, isImmediate: String(prop.delivery.isImmediate) },
                    finishingStatus: prop.finishingStatus || { en: '', ar: '' },
                    installments: prop.installments || { downPayment: 0, monthlyInstallment: 0, years: 0 },
                    contactMethod: prop.contactMethod || 'platform',
                    ownerPhone: prop.ownerPhone || '',
                } as any); // Type assertion needed due to mismatch in nested optional structures
                setMainImage(prop.imageUrl);
                setGalleryImages(prop.gallery);
            } else if (propertyId && !isLoadingContext) {
                const redirectPath = hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? '/admin/properties' : '/dashboard/properties';
                navigate(redirectPath);
            }
        } else if (!propertyId) {
             reset({
                projectId: searchParams.get('projectId') || undefined,
                status: { en: 'For Sale', ar: 'للبيع' },
                type: { en: 'Apartment', ar: 'شقة' },
                beds: 3, baths: 2, area: 150, floor: 1,
                location: { lat: 30.129, lng: 31.621 },
                amenities: { ar: [], en: [] },
                installmentsAvailable: 'false',
                isInCompound: 'false',
                realEstateFinanceAvailable: 'false',
                delivery: { isImmediate: 'true', date: '' },
                installments: { downPayment: 0, monthlyInstallment: 0, years: 0 },
                contactMethod: 'platform', ownerPhone: '',
                listingStatus: 'active',
                priceNumeric: 0,
                title: { ar: '', en: '' },
                description: { ar: '', en: '' },
                address: { ar: '', en: '' }
            });
        }
    }, [propertyId, currentUser, navigate, properties, reset, searchParams, hasPermission, isLoadingContext]);
    
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

    const onSubmit = async (formData: PropertyFormData) => {
        if (!currentUser || !('type' in currentUser) || !amenities) return;
        
        const priceNumeric = Number(formData.priceNumeric) || 0;
        const formattedPriceAr = `${priceNumeric.toLocaleString('ar-EG')} ج.م`;
        const formattedPriceEn = `EGP ${priceNumeric.toLocaleString('en-US')}`;

        const pricePerMeterNumeric = Math.round(priceNumeric / (Number(formData.area) || 1));
        const pricePerMeter = formData.status?.en === 'For Sale' && pricePerMeterNumeric > 0 ? {
            ar: `${pricePerMeterNumeric.toLocaleString('ar-EG')} ج.م/م²`,
            en: `EGP ${pricePerMeterNumeric.toLocaleString('en-US')}/m²`,
        } : undefined;

        // Explicit mapping to Property type
        const propertyData: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'> = {
            ...formData,
            status: { 
                en: formData.status.en as 'For Sale' | 'For Rent', 
                ar: formData.status.ar as 'للبيع' | 'إيجار' 
            },
            // Convert 'yes'/'no' strings back to booleans
            isInCompound: formData.isInCompound === 'true',
            realEstateFinanceAvailable: formData.realEstateFinanceAvailable === 'true',
            installmentsAvailable: formData.installmentsAvailable === 'true',
            delivery: {
                isImmediate: formData.delivery?.isImmediate === 'true',
                date: formData.delivery?.isImmediate !== 'true' ? formData.delivery.date : undefined,
            },
            partnerId: propertyId ? properties?.find(p => p.id === propertyId)?.partnerId || currentUser.id : currentUser.id,
            price: { ar: formattedPriceAr, en: formattedPriceEn },
            priceNumeric,
            pricePerMeter,
            imageUrl: mainImage,
            gallery: galleryImages,
            listingStatus: formData.listingStatus as any,
            type: { en: formData.type.en as any, ar: formData.type.ar },
            beds: formData.beds || 0,
            baths: formData.baths || 0,
            floor: formData.floor
        };
        
        if (propertyId) {
            updateMutation.mutate({ propertyId, updates: propertyData });
        } else {
            addMutation.mutate(propertyData);
        }
    };

    if (isLoadingContext && !projects) return <div>Loading options...</div>;

    const isAdmin = hasPermission(Permission.MANAGE_ALL_PROPERTIES);
    if (isLimitReached && !propertyId && !isAdmin) {
        return <UpgradeNotice />;
    }
    
    const isSubmitting = addMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{propertyId ? td.editTitle : td.addTitle}</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                
                 {currentUser && 'type' in currentUser && (currentUser.role === Role.DEVELOPER_PARTNER || currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.LISTINGS_MANAGER) && (
                    <FormField label="Project" id="projectId">
                        <select {...register("projectId")} className={selectClasses} >
                            <option value="">Select a project (optional)</option>
                            { (hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? projects : partnerProjects)?.map(proj => (
                                <option key={proj.id} value={proj.id}>{proj.name[language]}</option>
                            ))}
                        </select>
                    </FormField>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={td.propertyTitleAr} id="title.ar">
                        <input type="text" {...register("title.ar", { required: true })} className={inputClasses} />
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FormField label={tp.statusLabel} id="status.en">
                        <select
                            value={watchStatus?.en || 'For Sale'}
                            onChange={e => handleComplexChange('status', e.target.value)}
                            className={selectClasses}
                        >
                            <option value="For Sale">{tp.forSale}</option>
                            <option value="For Rent">{tp.forRent}</option>
                        </select>
                    </FormField>
                     <FormField label={tp.typeLabel} id="type.en">
                        <select
                            value={watchType?.en || ''}
                            onChange={e => handleComplexChange('type', e.target.value)}
                            className={selectClasses}
                        >
                            {(propertyTypes || []).map(opt => <option key={opt.id} value={opt.en}>{opt[language]}</option>)}
                        </select>
                    </FormField>
                     <FormField label={tp.finishing} id="finishingStatus.en">
                        <select
                            value={watchFinishingStatus?.en || ''}
                            onChange={e => handleComplexChange('finishingStatus', e.target.value)}
                            className={selectClasses}
                            disabled={watchType?.en === 'Land' || availableFinishingStatuses.length === 0}
                        >
                             <option value="">{tp.allFinishes}</option>
                             {availableFinishingStatuses.map(opt => <option key={opt.id} value={opt.en}>{opt[language]}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Area (m²)" id="area">
                        <input type="number" {...register("area", { required: true, valueAsNumber: true })} className={inputClasses} />
                    </FormField>
                    <FormField label={t.propertyDetailsPage.bedrooms} id="beds">
                        <input type="number" {...register("beds", { valueAsNumber: true })} className={inputClasses} disabled={watchType?.en === 'Land' || watchType?.en === 'Commercial'} />
                    </FormField>
                    <FormField label={t.propertyDetailsPage.bathrooms} id="baths">
                        <input type="number" {...register("baths", { valueAsNumber: true })} className={inputClasses} disabled={watchType?.en === 'Land'} />
                    </FormField>
                    <FormField label={t.propertyDetailsPage.floor} id="floor">
                        <input type="number" {...register("floor", { valueAsNumber: true })} className={inputClasses} disabled={watchType?.en === 'Land' || watchType?.en === 'Villa'} />
                    </FormField>
                    <FormField label="Listing Status" id="listingStatus">
                        <select {...register("listingStatus")} className={selectClasses} >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                            <option value="sold">Sold/Rented</option>
                        </select>
                    </FormField>
                </div>
                <div className="grid grid-cols-2 gap-6">
                     <FormField label={td.pricePerMeter} id="pricePerMeter">
                        <input type="text" value={`${pricePerMeter.toLocaleString(language)} EGP/m²`} readOnly className={`${inputClasses} bg-gray-100 dark:bg-gray-800 cursor-not-allowed`} />
                    </FormField>
                     <FormField label="Price" id="priceNumeric">
                        <input type="number" {...register("priceNumeric", { required: true, valueAsNumber: true })} className={inputClasses} />
                    </FormField>
                </div>
                
                <div className="space-y-4">
                    <FormField label={td.mainImage} id="imageUrl">
                        <div className="flex items-center gap-4">
                            {mainImage && <img src={mainImage} alt="Main preview" className="w-24 h-24 rounded-lg object-cover border"/>}
                            <input type="file" id="imageUrl" accept="image/*" onChange={handleMainImageChange} className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} />
                        </div>
                    </FormField>
                    <FormField label={td.galleryImages} id="gallery">
                        <input type="file" id="gallery" multiple accept="image/*" onChange={handleGalleryImagesChange} className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} />
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {galleryImages.map((img, index) => (
                                <div key={index} className="relative">
                                    <img src={img} alt={`Gallery ${index+1}`} className="w-full h-24 object-cover rounded-md"/>
                                    <button type="button" onClick={() => removeGalleryImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none" aria-label="Remove image">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </FormField>
                </div>
                 <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (Coordinates)</label>
                    <div className="flex gap-4">
                        <FormField label="Latitude" id="lat">
                            <input type="number" step="any" {...register("location.lat", { valueAsNumber: true })} className={inputClasses} placeholder="e.g. 30.123" />
                        </FormField>
                        <FormField label="Longitude" id="lng">
                            <input type="number" step="any" {...register("location.lng", { valueAsNumber: true })} className={inputClasses} placeholder="e.g. 31.123" />
                        </FormField>
                    </div>
                    <p className="text-xs text-gray-500">Enter coordinates manually.</p>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{td.amenities}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {availableAmenities.map(amenity => (
                            <label key={amenity.id} className="flex items-center gap-2">
                                <Checkbox
                                    checked={(watchAmenities?.en || []).includes(amenity.en)}
                                    onCheckedChange={() => handleAmenityChange(amenity.en)}
                                    id={`amenity-${amenity.id}`}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{amenity[language]}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <FormField label={td.isInCompound} id="isInCompound">
                            <RadioGroup className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("isInCompound")} value="true" id="compound-yes" /> Yes</label>
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("isInCompound")} value="false" id="compound-no" /> No</label>
                            </RadioGroup>
                        </FormField>
                         <FormField label={td.realEstateFinanceAvailable} id="realEstateFinanceAvailable">
                            <RadioGroup className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("realEstateFinanceAvailable")} value="true" id="finance-yes" /> Yes</label>
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("realEstateFinanceAvailable")} value="false" id="finance-no" /> No</label>
                            </RadioGroup>
                        </FormField>
                    </div>
                    <div>
                        <FormField label={td.deliveryInfo} id="delivery.isImmediate">
                             <RadioGroup className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("delivery.isImmediate")} value="true" id="delivery-immediate"/> {td.immediateDelivery}</label>
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("delivery.isImmediate")} value="false" id="delivery-future"/> {td.futureDelivery}</label>
                            </RadioGroup>
                        </FormField>
                        {watchDelivery && watchDelivery.isImmediate === 'false' && (
                            <div className="mt-2">
                                <input type="month" {...register("delivery.date")} className={inputClasses} />
                            </div>
                        )}
                    </div>
                    <div>
                        <FormField label={td.installmentsInfo} id="installmentsAvailable">
                             <RadioGroup className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("installmentsAvailable")} value="true" id="installments-yes" /> {td.installmentsAvailable}</label>
                                <label className="flex items-center gap-2"><RadioGroupItem {...register("installmentsAvailable")} value="false" id="installments-no" /> Not Available</label>
                            </RadioGroup>
                        </FormField>
                        {watchInstallments === 'true' && (
                            <div className="grid grid-cols-3 gap-4 mt-2">
                                <FormField label={td.downPayment} id="installments.downPayment"><input type="number" {...register("installments.downPayment")} className={inputClasses}/></FormField>
                                <FormField label={td.monthlyInstallment} id="installments.monthlyInstallment"><input type="number" {...register("installments.monthlyInstallment")} className={inputClasses}/></FormField>
                                <FormField label={td.years} id="installments.years"><input type="number" {...register("installments.years")} className={inputClasses}/></FormField>
                            </div>
                        )}
                    </div>
                </div>

                 {(isAdmin || (currentUser?.subscriptionPlan === 'paid_listing' && currentUser.type !== 'developer')) && (
                    <fieldset className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <legend className="font-semibold text-amber-500">{td.inquiryRouting}</legend>
                        <RadioGroup className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2">
                                <RadioGroupItem {...register("contactMethod")} value="platform" id="contact-platform" />
                                <span>{td.useDefaultSettings}</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <RadioGroupItem {...register("contactMethod")} value="direct" id="contact-direct" />
                                <span>{td.customizeForProperty}</span>
                            </label>
                        </RadioGroup>
                        {watchContactMethod === 'direct' && (
                             <div className="pt-2 animate-fadeIn">
                                <FormField label={td.directContactPhone} id="ownerPhone">
                                    <input type="tel" {...register("ownerPhone", { required: watchContactMethod === 'direct' })} className={inputClasses} dir="ltr" />
                                </FormField>
                             </div>
                        )}
                    </fieldset>
                )}

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={isSubmitting}>
                        {td.saveProperty}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PropertyFormPage;
