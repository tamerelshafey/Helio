import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { Language, AddPropertyRequest, FilterOption } from '../../types';
import { addRequest } from '../../services/requests';
import { RequestType } from '../../types';
import FormField from '../ui/FormField';
import { CloseIcon } from '../ui/Icons';
import CooperationCard from '../shared/CooperationCard';
import LocationPickerModal from '../shared/LocationPickerModal';
import { useToast } from '../shared/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPropertyTypes, getAllFinishingStatuses } from '../../services/filters';
import { getPlans } from '../../services/plans';
import { useLanguage } from '../shared/LanguageContext';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';

const purposeOptions = [
    { en: 'For Sale', ar: 'للبيع' },
    { en: 'For Rent', ar: 'إيجار' },
] as const;


const AddPropertyPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: plans, isLoading: isLoadingPlans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    const isLoadingContext = isLoadingPropTypes || isLoadingFinishing || isLoadingPlans;
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [currentStep, setCurrentStep] = useState(1);
    const [purpose, setPurpose] = useState<'For Sale' | 'For Rent' | null>(null);
    const [cooperationType, setCooperationType] = useState<'paid_listing' | 'commission' | null>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
        defaultValues: {
            customerName: '',
            customerPhone: '',
            contactTime: '',
            propertyType: '',
            finishingStatus: '',
            area: '',
            price: '',
            bedrooms: '',
            bathrooms: '',
            floor: '',
            address: '',
            description: '',
            latitude: '',
            longitude: '',
            isInCompound: 'no' as 'yes' | 'no',
            deliveryType: 'immediate' as 'immediate' | 'future',
            deliveryMonth: '',
            deliveryYear: '',
            hasInstallments: 'no' as 'yes' | 'no',
            realEstateFinanceAvailable: 'no' as 'yes' | 'no',
            downPayment: '',
            monthlyInstallment: '',
            years: '',
            listingStartDate: '',
            listingEndDate: '',
            isOwner: false,
            contactMethod: 'platform' as 'platform' | 'direct',
            ownerPhone: '',
        }
    });

    const mutation = useMutation({
        mutationFn: (data: any) => addRequest(RequestType.PROPERTY_LISTING_REQUEST, data),
        onSuccess: () => {
            showToast(t_page.successTitle, 'success');
            reset();
            setImages([]);
            setImagePreviews([]);
            setCooperationType(null);
            setPurpose(null);
            setCurrentStep(1);
            queryClient.invalidateQueries({ queryKey: ['allRequests'] });
        },
        onError: (error) => {
            console.error("Failed to submit property request:", error);
            showToast('Submission failed. Please try again.', 'error');
        }
    });

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const watchPropertyType = watch("propertyType");
    const watchDeliveryType = watch("deliveryType");
    const watchHasInstallments = watch("hasInstallments");
    const watchLatitude = watch("latitude");
    const watchLongitude = watch("longitude");
    const watchContactMethod = watch("contactMethod");
    
    const plansForPurpose = useMemo(() => {
        if (!purpose || !plans?.individual) return {};
        const subCategory = purpose === 'For Sale' ? 'sale' : 'rent';
        return (plans.individual as any)[subCategory] || {};
    }, [purpose, plans]);


     const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const currentTotal = images.length + filesArray.length;
            if (currentTotal > 10) {
                showToast('You can only upload a maximum of 10 images.', 'error');
                return;
            }
            setImages(prev => [...prev, ...filesArray]);

            const newPreviews = filesArray.map((file: File) => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleLocationSelect = (location: { lat: number, lng: number }) => {
        setValue('latitude', String(location.lat), { shouldValidate: true });
        setValue('longitude', String(location.lng), { shouldValidate: true });
        setIsLocationModalOpen(false);
    };

    const onSubmit = async (formData: any) => {
        if (!cooperationType || !purpose) {
            showToast(t_page.errors.cooperationType, 'error');
            return;
        }
        
        const imageBase64Strings = await Promise.all(images.map(file => fileToBase64(file)));
        
        const propertyDetails = {
            purpose: purposeOptions.find(o => o.en === purpose)!,
            propertyType: (propertyTypes || []).find(o => o.en === formData.propertyType)!,
            finishingStatus: (finishingStatuses || []).find(o => o.en === formData.finishingStatus)!,
            area: parseInt(formData.area),
            price: parseInt(formData.price),
            bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
            floor: formData.floor ? parseInt(formData.floor) : undefined,
            address: formData.address,
            description: formData.description,
            location: { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) },
            isInCompound: formData.isInCompound === 'yes',
            deliveryType: formData.deliveryType,
            deliveryMonth: formData.deliveryMonth,
            deliveryYear: formData.deliveryYear,
            hasInstallments: formData.hasInstallments === 'yes',
            realEstateFinanceAvailable: formData.realEstateFinanceAvailable === 'yes',
            downPayment: formData.downPayment ? parseInt(formData.downPayment) : undefined,
            monthlyInstallment: formData.monthlyInstallment ? parseInt(formData.monthlyInstallment) : undefined,
            years: formData.years ? parseInt(formData.years) : undefined,
            listingStartDate: formData.listingStartDate,
            listingEndDate: formData.listingEndDate,
            contactMethod: cooperationType === 'commission' ? 'platform' : formData.contactMethod,
            ownerPhone: formData.ownerPhone,
        };

        mutation.mutate({
            requesterInfo: { name: formData.customerName, phone: formData.customerPhone },
            payload: {
                contactTime: formData.contactTime,
                cooperationType: cooperationType,
                propertyDetails,
                images: imageBase64Strings,
            }
        });
    };
    
    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => {
        if(currentStep === 2) setCooperationType(null);
        if(currentStep === 1) setPurpose(null);
        setCurrentStep(prev => prev - 1);
    }

    return (
        <div className="py-20 bg-gray-50">
            {isLocationModalOpen && (
                <LocationPickerModal 
                    onClose={() => setIsLocationModalOpen(false)}
                    onLocationSelect={handleLocationSelect}
                    initialLocation={watchLatitude && watchLongitude ? { lat: parseFloat(watchLatitude), lng: parseFloat(watchLongitude) } : undefined}
                />
            )}
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t_page.title}</h1>
                    <p className="text-lg text-gray-500 mt-4 max-w-3xl mx-auto">{t_page.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* How it works */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-lg border border-gray-200 sticky top-28">
                            <h2 className="text-2xl font-bold text-amber-500 mb-6">{t_page.howItWorksTitle}</h2>
                            <ul className="space-y-5">
                                {[1, 2, 3, 4].map(num => (
                                     <li key={num} className="flex items-start">
                                        <div className={`flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center font-bold transition-colors ${currentStep >= num ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-200 text-gray-500'}`}>{num}</div>
                                        <p className={`text-gray-600 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t_page[`step${num}`]}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-lg border border-gray-200">
                             {/* Step 1: Purpose */}
                            {currentStep === 1 && (
                                <fieldset className="space-y-4 animate-fadeIn">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.purposeStep.title}</legend>
                                    <p className="text-sm text-gray-500 -mt-2 mb-4">{t_page.purposeStep.subtitle}</p>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div onClick={() => { setPurpose('For Sale'); nextStep(); }} className="p-8 border-2 rounded-lg text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors">
                                            <h3 className="text-2xl font-bold">{t_page.purposeStep.forSale}</h3>
                                        </div>
                                        <div onClick={() => { setPurpose('For Rent'); nextStep(); }} className="p-8 border-2 rounded-lg text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors">
                                            <h3 className="text-2xl font-bold">{t_page.purposeStep.forRent}</h3>
                                        </div>
                                    </div>
                                </fieldset>
                            )}

                             {/* Step 2: Cooperation Model */}
                             {currentStep === 2 && (
                                <fieldset className="space-y-4 animate-fadeIn">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.cooperation.title}</legend>
                                    <p className="text-sm text-gray-500 -mt-2 mb-4">{t_page.cooperation.subtitle}</p>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {isLoadingContext ? (
                                            <>
                                                <div className="border-2 rounded-lg p-6 h-full bg-gray-100 animate-pulse"></div>
                                                <div className="border-2 rounded-lg p-6 h-full bg-gray-100 animate-pulse"></div>
                                            </>
                                        ) : (Object.keys(plansForPurpose).map((planKey) => (
                                            <CooperationCard
                                                key={planKey}
                                                planDetails={(plansForPurpose as any)[planKey][language]}
                                                isSelected={cooperationType === planKey}
                                                onSelect={() => { setCooperationType(planKey as any); nextStep(); }}
                                            />
                                        )))}
                                    </div>
                                    <button type="button" onClick={prevStep} className="text-sm font-semibold">{t_page.back}</button>
                                </fieldset>
                             )}

                             {/* Step 3: Form */}
                             {currentStep === 3 && (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fadeIn">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t_page.formTitle}</h2>

                                    {cooperationType === 'paid_listing' && (
                                        <fieldset className="space-y-2">
                                            <legend className="block text-sm font-medium text-gray-700 mb-2">{t_page.contactPreference.title}:</legend>
                                            <RadioGroup className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2">
                                                    <RadioGroupItem {...register("contactMethod")} value="platform" id="contact-platform" />
                                                    <span>{t_page.contactPreference.platform}</span>
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <RadioGroupItem {...register("contactMethod")} value="direct" id="contact-direct" />
                                                    <span>{t_page.contactPreference.direct}</span>
                                                </label>
                                            </RadioGroup>
                                            {watchContactMethod === 'direct' && (
                                                <div className="pt-2 animate-fadeIn">
                                                    <FormField label={`${t_page.phone} (For Public Inquiries)`} id="ownerPhone" error={errors.ownerPhone?.message}>
                                                        <Input type="tel" {...register("ownerPhone", { required: watchContactMethod === 'direct' ? t_page.errors.required : false, pattern: { value: /^\+?[0-9\s-]{10,}$/, message: t_page.errors.invalidPhone } })} dir="ltr" />
                                                    </FormField>
                                                </div>
                                            )}
                                        </fieldset>
                                    )}

                                    <fieldset className="space-y-4 border-t border-gray-200 pt-4">
                                        <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.ownerInfo}</legend>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <FormField label={t_page.fullName} id="customerName" error={errors.customerName?.message}>
                                                <Input type="text" {...register("customerName", { required: t_page.errors.required })} />
                                            </FormField>
                                            <FormField label={`${t_page.phone} (For Verification)`} id="customerPhone" error={errors.customerPhone?.message}>
                                                <Input type="tel" {...register("customerPhone", { required: t_page.errors.required, pattern: { value: /^\+?[0-9\s-]{10,}$/, message: t_page.errors.invalidPhone } })} dir="ltr" />
                                            </FormField>
                                        </div>
                                        <FormField label={t_page.contactTime} id="contactTime" error={errors.contactTime?.message}>
                                            <Select {...register("contactTime", { required: t_page.errors.required })} className={!watch("contactTime") ? 'text-gray-500' : ''} >
                                                <option value="" disabled>{t_page.selectTime}</option>
                                                <option value="morning" className="text-gray-900">{t_page.morning}</option>
                                                <option value="afternoon" className="text-gray-900">{t_page.afternoon}</option>
                                                <option value="evening" className="text-gray-900">{t_page.evening}</option>
                                            </Select>
                                        </FormField>
                                    </fieldset>
                                    
                                    <fieldset className="space-y-4 border-t border-gray-200 pt-4">
                                        <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.propertyInfo}</legend>
                                        
                                        {/* Simplified Fields */}
                                        <FormField label={t_page.address} id="address" error={errors.address?.message}>
                                            <Input type="text" {...register("address", { required: t_page.errors.required })} />
                                        </FormField>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <FormField label={t_page.area} id="area" error={errors.area?.message}><Input type="number" {...register("area", { required: t_page.errors.required, min: 1 })} min="1" /></FormField>
                                            <FormField label={t_page.price} id="price" error={errors.price?.message}><Input type="number" {...register("price", { required: t_page.errors.required, min: 1 })} min="1"/></FormField>
                                        </div>

                                        {/* Other Fields can be added back here if needed */}

                                        <FormField label={t_page.description} id="description" error={errors.description?.message}>
                                            <Textarea {...register("description", { required: t_page.errors.required })} rows={5} placeholder={t_page.descriptionPlaceholder} />
                                        </FormField>
                                        <FormField label={t_page.images} id="images">
                                            <div>
                                                <Input type="file" id="images" multiple accept="image/*" onChange={handleImageChange} className="p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                                                <p className="text-xs text-gray-500 mt-1">{t_page.imagesHelpText}</p>
                                                {imagePreviews.length > 0 && (
                                                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                        {imagePreviews.map((preview, index) => (
                                                            <div key={index} className="relative">
                                                                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                                                <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"><CloseIcon className="w-4 h-4" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </FormField>
                                    </fieldset>


                                    <div className="space-y-4 border-t border-gray-200 pt-4">
                                        <div className="flex items-start">
                                            <input id="isOwner" type="checkbox" {...register("isOwner", { required: t_page.errors.mustBeOwner })} className="h-4 w-4 mt-1 text-amber-600 border-gray-300 rounded focus:ring-amber-500"/>
                                            <label htmlFor="isOwner" className={`text-sm text-gray-600 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{t_page.confirmationLabel}</label>
                                        </div>
                                        {errors.isOwner && <p className="text-red-500 text-sm">{errors.isOwner.message}</p>}
                                        <div className="flex justify-between items-center">
                                            <button type="button" onClick={prevStep} className="text-sm font-semibold">{t_page.back}</button>
                                            <button type="submit" disabled={mutation.isPending} className="bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                                {mutation.isPending ? '...' : t_page.submitButton}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPropertyPage;