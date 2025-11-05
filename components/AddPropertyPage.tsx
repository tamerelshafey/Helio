import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Language, SubscriptionPlanDetails, PlanCategory, FilterOption, SubscriptionPlan } from '../types';
import { translations } from '../data/translations';
import { addPropertyRequest } from '../api/propertyRequests';
import FormField, { inputClasses, selectClasses } from './shared/FormField';
import { CheckCircleIcon, CloseIcon } from './icons/Icons';
import { getAllPropertyTypes, getAllFinishingStatuses } from '../api/filters';
import { getPlans } from '../../api/plans';
import { useApiQuery } from './shared/useApiQuery';
import CooperationCard from './shared/CooperationCard';
import LocationPickerModal from './shared/LocationPickerModal';

interface AddPropertyPageProps {
  language: Language;
}

const purposeOptions = [
    { en: 'For Sale', ar: 'للبيع' },
    { en: 'For Rent', ar: 'إيجار' },
] as const;


const AddPropertyPage: React.FC<AddPropertyPageProps> = ({ language }) => {
    const t = translations[language].addPropertyPage;
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useApiQuery('propertyTypes', getAllPropertyTypes);
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useApiQuery('finishingStatuses', getAllFinishingStatuses);
    const { data: plans, isLoading: isLoadingPlans } = useApiQuery('plans', getPlans);

    const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            customerName: '',
            customerPhone: '',
            contactTime: '',
            purpose: '' as 'For Sale' | 'For Rent' | '',
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
            downPayment: '',
            monthlyInstallment: '',
            years: '',
            listingStartDate: '',
            listingEndDate: '',
            isOwner: false,
        }
    });

    const [cooperationType, setCooperationType] = useState<'paid_listing' | 'commission' | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const watchPropertyType = watch("propertyType");
    const watchDeliveryType = watch("deliveryType");
    const watchHasInstallments = watch("hasInstallments");
    const watchLatitude = watch("latitude");
    const watchLongitude = watch("longitude");


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
                alert('You can only upload a maximum of 10 images.');
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
        if (!cooperationType) {
            alert(t.errors.cooperationType);
            return;
        }
        
        const imageBase64Strings = await Promise.all(images.map(file => fileToBase64(file)));
        
        const propertyDetails = {
            purpose: purposeOptions.find(o => o.en === formData.purpose)!,
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
            downPayment: formData.downPayment ? parseInt(formData.downPayment) : undefined,
            monthlyInstallment: formData.monthlyInstallment ? parseInt(formData.monthlyInstallment) : undefined,
            years: formData.years ? parseInt(formData.years) : undefined,
            listingStartDate: formData.listingStartDate,
            listingEndDate: formData.listingEndDate,
        };

        await addPropertyRequest({
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            contactTime: formData.contactTime,
            cooperationType: cooperationType,
            propertyDetails,
            images: imageBase64Strings,
        });

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="py-20 bg-white dark:bg-gray-900 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="max-w-2xl mx-auto px-6">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.successTitle}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t.successMessage}</p>
                    <Link to="/" className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors">
                        {t.backToHome}
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            {isLocationModalOpen && (
                <LocationPickerModal 
                    onClose={() => setIsLocationModalOpen(false)}
                    onLocationSelect={handleLocationSelect}
                    language={language}
                    initialLocation={watchLatitude && watchLongitude ? { lat: parseFloat(watchLatitude), lng: parseFloat(watchLongitude) } : undefined}
                />
            )}
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{t.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* How it works */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-28">
                            <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.howItWorksTitle}</h2>
                            <ul className="space-y-5">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t.step1}</p>
                                </li>
                                 <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">2</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t.step2}</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">3</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t.step3}</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">4</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t.step4}</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.formTitle}</h2>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Cooperation Model */}
                                <fieldset className="space-y-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t.cooperation.title}</legend>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">{t.cooperation.subtitle}</p>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <CooperationCard type="paid_listing" isSelected={cooperationType === 'paid_listing'} onSelect={() => setCooperationType('paid_listing')} language={language} plans={plans} isLoadingPlans={isLoadingPlans} />
                                        <CooperationCard type="commission" isSelected={cooperationType === 'commission'} onSelect={() => setCooperationType('commission')} language={language} plans={plans} isLoadingPlans={isLoadingPlans} />
                                    </div>
                                    {!cooperationType && <p className="text-red-500 text-sm mt-2">{t.errors.cooperationType}</p>}
                                </fieldset>

                                {/* Owner Info */}
                                <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t.ownerInfo}</legend>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField label={t.fullName} id="customerName" error={errors.customerName?.message}>
                                            <input type="text" {...register("customerName", { required: t.errors.required })} className={inputClasses}  />
                                        </FormField>
                                        <FormField label={t.phone} id="customerPhone" error={errors.customerPhone?.message}>
                                            <input type="tel" {...register("customerPhone", { required: t.errors.required, pattern: { value: /^\+?[0-9\s-]{10,}$/, message: t.errors.invalidPhone } })} className={inputClasses}  dir="ltr" />
                                        </FormField>
                                    </div>
                                    <FormField label={t.contactTime} id="contactTime" error={errors.contactTime?.message}>
                                        <select {...register("contactTime", { required: t.errors.required })} className={`${selectClasses} ${!watch("contactTime") ? 'text-gray-500 dark:text-gray-400' : ''}`} >
                                            <option value="" disabled>{t.selectTime}</option>
                                            <option value="morning" className="text-gray-900 dark:text-white">{t.morning}</option>
                                            <option value="afternoon" className="text-gray-900 dark:text-white">{t.afternoon}</option>
                                            <option value="evening" className="text-gray-900 dark:text-white">{t.evening}</option>
                                        </select>
                                    </FormField>
                                </fieldset>

                                {/* Property Info */}
                                <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t.propertyInfo}</legend>
                                     <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField label={t.purpose} id="purpose" error={errors.purpose?.message}>
                                            <select {...register("purpose", { required: t.errors.required })} className={`${selectClasses} ${!watch("purpose") ? 'text-gray-500 dark:text-gray-400' : ''}`} >
                                                <option value="" disabled>{t.selectPurpose}</option>
                                                {purposeOptions.map(opt => <option key={opt.en} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                            </select>
                                        </FormField>
                                        <FormField label={t.propertyType} id="propertyType" error={errors.propertyType?.message}>
                                             <select {...register("propertyType", { required: t.errors.required })} className={`${selectClasses} ${!watch("propertyType") ? 'text-gray-500 dark:text-gray-400' : ''}`} disabled={isLoadingPropTypes}>
                                                <option value="" disabled>{isLoadingPropTypes ? 'Loading...' : t.selectType}</option>
                                                {(propertyTypes || []).map(opt => <option key={opt.id} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                            </select>
                                        </FormField>
                                     </div>
                                      <div className="grid sm:grid-cols-2 gap-4">
                                        {watchPropertyType !== 'Land' && (
                                            <FormField label={t.finishingStatus} id="finishingStatus" error={errors.finishingStatus?.message}>
                                                <select {...register("finishingStatus", { required: watchPropertyType !== 'Land' ? t.errors.required : false })} className={`${selectClasses} ${!watch("finishingStatus") ? 'text-gray-500 dark:text-gray-400' : ''}`} disabled={isLoadingFinishing}>
                                                    <option value="" disabled>{isLoadingFinishing ? 'Loading...' : t.selectFinishing}</option>
                                                    {(finishingStatuses || []).map(opt => <option key={opt.id} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                                </select>
                                            </FormField>
                                        )}
                                        <FormField label={t.area} id="area" error={errors.area?.message}>
                                            <input type="number" {...register("area", { required: t.errors.required, min: { value: 1, message: t.errors.positiveNumber } })} className={inputClasses} min="1" />
                                        </FormField>
                                      </div>
                                      <div className="grid sm:grid-cols-2 gap-4">
                                         <FormField label={t.price} id="price" error={errors.price?.message}>
                                            <input type="number" {...register("price", { required: t.errors.required, min: { value: 1, message: t.errors.positiveNumber } })} className={inputClasses} min="1"/>
                                        </FormField>
                                        {(watchPropertyType === 'Apartment' || watchPropertyType === 'Villa' || watchPropertyType === 'Commercial') && (
                                            <FormField label={t.floor} id="floor" error={errors.floor?.message}>
                                                <input type="number" {...register("floor", { required: t.errors.required, min: 0 })} className={inputClasses} min="0"/>
                                            </FormField>
                                        )}
                                      </div>
                                      {(watchPropertyType === 'Apartment' || watchPropertyType === 'Villa') && (
                                          <div className="grid sm:grid-cols-2 gap-4">
                                              <FormField label={t.bedrooms} id="bedrooms" error={errors.bedrooms?.message}>
                                                  <input type="number" {...register("bedrooms", { required: t.errors.required, min: 0 })} className={inputClasses} min="0"/>
                                              </FormField>
                                              <FormField label={t.bathrooms} id="bathrooms" error={errors.bathrooms?.message}>
                                                  <input type="number" {...register("bathrooms", { required: t.errors.required, min: 0 })} className={inputClasses} min="0"/>
                                              </FormField>
                                          </div>
                                      )}
                                    <FormField label={t.address} id="address" error={errors.address?.message}>
                                        <input type="text" {...register("address", { required: t.errors.required })} className={inputClasses}  />
                                    </FormField>

                                     {/* Location Section */}
                                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <legend className="text-base font-medium text-gray-900 dark:text-white">Location</legend>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField label="Latitude" id="latitude" error={errors.latitude?.message}>
                                                <input type="number" step="any" {...register("latitude", { required: t.errors.required })} className={inputClasses} />
                                            </FormField>
                                            <FormField label="Longitude" id="longitude" error={errors.longitude?.message}>
                                                <input type="number" step="any" {...register("longitude", { required: t.errors.required })} className={inputClasses} />
                                            </FormField>
                                        </div>
                                        <button type="button" onClick={() => setIsLocationModalOpen(true)} className="w-full text-center font-medium text-sm text-amber-600 dark:text-amber-500 hover:underline p-2 rounded-md border border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/50">
                                            Select on Map
                                        </button>
                                    </fieldset>

                                    <FormField label={t.description} id="description" error={errors.description?.message}>
                                        <textarea {...register("description", { required: t.errors.required })} rows={5} placeholder={t.descriptionPlaceholder} className={inputClasses}  />
                                    </FormField>
                                    <FormField label={t.images} id="images">
                                        <div>
                                            <input
                                                type="file"
                                                id="images"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.imagesHelpText}</p>
                                            {imagePreviews.length > 0 && (
                                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                    {imagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative">
                                                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"
                                                                aria-label="Remove image"
                                                            >
                                                                <CloseIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </FormField>
                                </fieldset>

                                {/* More Details */}
                                <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{translations[language].propertyDetailsPage.deliveryPayment}</legend>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <FormField label={t.inCompound} id="isInCompound">
                                            <div className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2"><input type="radio" {...register("isInCompound")} value="yes" /> {t.yes}</label>
                                                <label className="flex items-center gap-2"><input type="radio" {...register("isInCompound")} value="no" /> {t.no}</label>
                                            </div>
                                        </FormField>
                                        <FormField label={t.deliveryDate} id="deliveryType">
                                             <div className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2"><input type="radio" {...register("deliveryType")} value="immediate" /> {t.immediate}</label>
                                                <label className="flex items-center gap-2"><input type="radio" {...register("deliveryType")} value="future" /> {t.future}</label>
                                            </div>
                                        </FormField>
                                    </div>
                                    {watchDeliveryType === 'future' && (
                                        <div className="grid sm:grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                                            <FormField label={t.deliveryMonth} id="deliveryMonth" error={errors.deliveryMonth?.message}>
                                                <select {...register("deliveryMonth", { required: t.errors.required })} className={selectClasses}>
                                                    <option value="">--</option>
                                                    {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>)}
                                                </select>
                                            </FormField>
                                            <FormField label={t.deliveryYear} id="deliveryYear" error={errors.deliveryYear?.message}>
                                                <input type="number" {...register("deliveryYear", { required: t.errors.required, min: new Date().getFullYear() })} className={inputClasses} placeholder={new Date().getFullYear().toString()} min={new Date().getFullYear()} />
                                            </FormField>
                                        </div>
                                    )}
                                     <FormField label={t.installments} id="hasInstallments">
                                        <div className="flex gap-4 pt-2">
                                            <label className="flex items-center gap-2"><input type="radio" {...register("hasInstallments")} value="yes" /> {t.yes}</label>
                                            <label className="flex items-center gap-2"><input type="radio" {...register("hasInstallments")} value="no" /> {t.no}</label>
                                        </div>
                                    </FormField>
                                     {watchHasInstallments === 'yes' && (
                                        <div className="grid sm:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                                            <FormField label={t.downPayment} id="downPayment" error={errors.downPayment?.message}><input type="number" {...register("downPayment", { required: t.errors.positiveNumber, min: 0 })} className={inputClasses} /></FormField>
                                            <FormField label={t.monthlyInstallment} id="monthlyInstallment" error={errors.monthlyInstallment?.message}><input type="number" {...register("monthlyInstallment", { required: t.errors.positiveNumber, min: 1 })} className={inputClasses} /></FormField>
                                            <FormField label={t.years} id="years" error={errors.years?.message}><input type="number" {...register("years", { required: t.errors.positiveNumber, min: 1 })} className={inputClasses} /></FormField>
                                        </div>
                                    )}
                                </fieldset>

                                 <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{translations[language].adminDashboard.editPropertyModal.title}</legend>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <FormField label={t.listingStartDate} id="listingStartDate" error={errors.listingStartDate?.message}>
                                            <input type="date" {...register("listingStartDate")} className={inputClasses} />
                                        </FormField>
                                        <FormField label={t.listingEndDate} id="listingEndDate" error={errors.listingEndDate?.message}>
                                            <input type="date" {...register("listingEndDate")} className={inputClasses} />
                                        </FormField>
                                    </div>
                                </fieldset>

                                {/* Submission */}
                                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                     <div className="flex items-start">
                                        <input
                                            id="isOwner"
                                            type="checkbox"
                                            {...register("isOwner", { required: t.errors.mustBeOwner })}
                                            className="h-4 w-4 mt-1 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        />
                                        <label htmlFor="isOwner" className={`text-sm text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                                            {t.confirmationLabel}
                                        </label>
                                    </div>
                                    {errors.isOwner && <p className="text-red-500 text-sm">{errors.isOwner.message}</p>}
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting ? '...' : t.submitButton}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPropertyPage;