import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Language, AddPropertyRequest } from '../types';
import { addPropertyRequest } from '../services/propertyRequests';
import FormField from './shared/FormField';
import { CloseIcon } from './icons/Icons';
import CooperationCard from './shared/CooperationCard';
import LocationPickerModal from './shared/LocationPickerModal';
import { useToast } from './shared/ToastContext';
import { useQuery } from '@tanstack/react-query';
import { getAllPropertyTypes, getAllFinishingStatuses } from '../services/filters';
import { getPlans } from '../services/plans';
import { useLanguage } from './shared/LanguageContext';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { RadioGroup, RadioGroupItem } from './ui/RadioGroup';

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

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm({
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

    const [cooperationType, setCooperationType] = useState<'paid_listing' | 'commission' | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const watchPropertyType = watch("propertyType");
    const watchDeliveryType = watch("deliveryType");
    const watchHasInstallments = watch("hasInstallments");
    const watchLatitude = watch("latitude");
    const watchLongitude = watch("longitude");
    const watchContactMethod = watch("contactMethod");


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
        if (!cooperationType) {
            showToast(t_page.errors.cooperationType, 'error');
            return;
        }
        
        const imageBase64Strings = await Promise.all(images.map(file => fileToBase64(file)));
        
        const propertyDetails: AddPropertyRequest['propertyDetails'] = {
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
            realEstateFinanceAvailable: formData.realEstateFinanceAvailable === 'yes',
            downPayment: formData.downPayment ? parseInt(formData.downPayment) : undefined,
            monthlyInstallment: formData.monthlyInstallment ? parseInt(formData.monthlyInstallment) : undefined,
            years: formData.years ? parseInt(formData.years) : undefined,
            listingStartDate: formData.listingStartDate,
            listingEndDate: formData.listingEndDate,
            contactMethod: cooperationType === 'commission' ? 'platform' : formData.contactMethod,
            ownerPhone: formData.ownerPhone,
        };

        await addPropertyRequest({
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            contactTime: formData.contactTime,
            cooperationType: cooperationType,
            propertyDetails,
            images: imageBase64Strings,
        });

        showToast(t_page.successTitle, 'success');
        reset();
        setImages([]);
        setImagePreviews([]);
        setCooperationType(null);
    };
    
    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            {isLocationModalOpen && (
                <LocationPickerModal 
                    onClose={() => setIsLocationModalOpen(false)}
                    onLocationSelect={handleLocationSelect}
                    initialLocation={watchLatitude && watchLongitude ? { lat: parseFloat(watchLatitude), lng: parseFloat(watchLongitude) } : undefined}
                />
            )}
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t_page.title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{t_page.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* How it works */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-28">
                            <h2 className="text-2xl font-bold text-amber-500 mb-6">{t_page.howItWorksTitle}</h2>
                            <ul className="space-y-5">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t_page.step1}</p>
                                </li>
                                 <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">2</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t_page.step2}</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">3</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t_page.step3}</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 rounded-full h-8 w-8 flex items-center justify-center font-bold">4</div>
                                    <p className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>{t_page.step4}</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t_page.formTitle}</h2>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Cooperation Model */}
                                <fieldset className="space-y-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.cooperation.title}</legend>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">{t_page.cooperation.subtitle}</p>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <CooperationCard type="paid_listing" isSelected={cooperationType === 'paid_listing'} onSelect={() => setCooperationType('paid_listing')} plans={plans} isLoadingPlans={isLoadingContext} />
                                        <CooperationCard type="commission" isSelected={cooperationType === 'commission'} onSelect={() => setCooperationType('commission')} plans={plans} isLoadingPlans={isLoadingContext} />
                                    </div>
                                    {!cooperationType && <p className="text-red-500 text-sm mt-2">{t_page.errors.cooperationType}</p>}
                                </fieldset>

                                {cooperationType === 'paid_listing' && (
                                    <fieldset className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 animate-fadeIn">
                                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t_page.contactPreference.title}:</legend>
                                        <RadioGroup {...register("contactMethod")} defaultValue="platform" className="flex gap-4 pt-2">
                                            <label className="flex items-center gap-2">
                                                <RadioGroupItem value="platform" id="contact-platform" />
                                                <span>{t_page.contactPreference.platform}</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <RadioGroupItem value="direct" id="contact-direct" />
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

                                {/* Owner Info */}
                                <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
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
                                        <Select {...register("contactTime", { required: t_page.errors.required })} className={!watch("contactTime") ? 'text-gray-500 dark:text-gray-400' : ''} >
                                            <option value="" disabled>{t_page.selectTime}</option>
                                            <option value="morning" className="text-gray-900 dark:text-white">{t_page.morning}</option>
                                            <option value="afternoon" className="text-gray-900 dark:text-white">{t_page.afternoon}</option>
                                            <option value="evening" className="text-gray-900 dark:text-white">{t_page.evening}</option>
                                        </Select>
                                    </FormField>
                                </fieldset>

                                {/* Property Info */}
                                <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.propertyInfo}</legend>
                                     <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField label={t_page.purpose} id="purpose" error={errors.purpose?.message}>
                                            <Select {...register("purpose", { required: t_page.errors.required })} className={!watch("purpose") ? 'text-gray-500 dark:text-gray-400' : ''} >
                                                <option value="" disabled>{t_page.selectPurpose}</option>
                                                {purposeOptions.map(opt => <option key={opt.en} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                            </Select>
                                        </FormField>
                                        <FormField label={t_page.propertyType} id="propertyType" error={errors.propertyType?.message}>
                                             <Select {...register("propertyType", { required: t_page.errors.required })} className={!watch("propertyType") ? 'text-gray-500 dark:text-gray-400' : ''} disabled={isLoadingContext}>
                                                <option value="" disabled>{isLoadingContext ? 'Loading...' : t_page.selectType}</option>
                                                {(propertyTypes || []).map(opt => <option key={opt.id} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                            </Select>
                                        </FormField>
                                     </div>
                                      <div className="grid sm:grid-cols-2 gap-4">
                                        {watchPropertyType !== 'Land' && (
                                            <FormField label={t_page.finishingStatus} id="finishingStatus" error={errors.finishingStatus?.message}>
                                                <Select {...register("finishingStatus", { required: watchPropertyType !== 'Land' ? t_page.errors.required : false })} className={!watch("finishingStatus") ? 'text-gray-500 dark:text-gray-400' : ''} disabled={isLoadingContext}>
                                                    <option value="" disabled>{isLoadingContext ? 'Loading...' : t_page.selectFinishing}</option>
                                                    {(finishingStatuses || []).map(opt => <option key={opt.id} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                                </Select>
                                            </FormField>
                                        )}
                                        <FormField label={t_page.area} id="area" error={errors.area?.message}>
                                            <Input type="number" {...register("area", { required: t_page.errors.required, min: { value: 1, message: t_page.errors.positiveNumber } })} min="1" />
                                        </FormField>
                                      </div>
                                      <div className="grid sm:grid-cols-2 gap-4">
                                         <FormField label={t_page.price} id="price" error={errors.price?.message}>
                                            <Input type="number" {...register("price", { required: t_page.errors.required, min: { value: 1, message: t_page.errors.positiveNumber } })} min="1"/>
                                        </FormField>
                                        {(watchPropertyType === 'Apartment' || watchPropertyType === 'Villa' || watchPropertyType === 'Commercial') && (
                                            <FormField label={t_page.floor} id="floor" error={errors.floor?.message}>
                                                <Input type="number" {...register("floor", { required: t_page.errors.required, min: 0 })} min="0"/>
                                            </FormField>
                                        )}
                                      </div>
                                      {(watchPropertyType === 'Apartment' || watchPropertyType === 'Villa') && (
                                          <div className="grid sm:grid-cols-2 gap-4">
                                              <FormField label={t_page.bedrooms} id="bedrooms" error={errors.bedrooms?.message}>
                                                  <Input type="number" {...register("bedrooms", { required: t_page.errors.required, min: 0 })} min="0"/>
                                              </FormField>
                                              <FormField label={t_page.bathrooms} id="bathrooms" error={errors.bathrooms?.message}>
                                                  <Input type="number" {...register("bathrooms", { required: t_page.errors.required, min: 0 })} min="0"/>
                                              </FormField>
                                          </div>
                                      )}
                                    <FormField label={t_page.address} id="address" error={errors.address?.message}>
                                        <Input type="text" {...register("address", { required: t_page.errors.required })} />
                                    </FormField>

                                    {/* Location Section */}
                                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <legend className="text-base font-medium text-gray-900 dark:text-white">Location</legend>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField label="Latitude" id="latitude" error={errors.latitude?.message}>
                                                <Input type="number" step="any" {...register("latitude", { required: t_page.errors.required })} />
                                            </FormField>
                                            <FormField label="Longitude" id="longitude" error={errors.longitude?.message}>
                                                <Input type="number" step="any" {...register("longitude", { required: t_page.errors.required })} />
                                            </FormField>
                                        </div>
                                        <button type="button" onClick={() => setIsLocationModalOpen(true)} className="w-full text-center font-medium text-sm text-amber-600 dark:text-amber-500 hover:underline p-2 rounded-md border border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/50">
                                            Select on Map
                                        </button>
                                    </fieldset>

                                    <FormField label={t_page.description} id="description" error={errors.description?.message}>
                                        <Textarea {...register("description", { required: t_page.errors.required })} rows={5} placeholder={t_page.descriptionPlaceholder} />
                                    </FormField>
                                    <FormField label={t_page.images} id="images">
                                        <div>
                                            <Input
                                                type="file"
                                                id="images"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t_page.imagesHelpText}</p>
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
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t.propertyDetailsPage.deliveryPayment}</legend>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <FormField label={t_page.inCompound} id="isInCompound">
                                            <RadioGroup {...register("isInCompound")} defaultValue="no" className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2"><RadioGroupItem value="yes" id="compound-yes" /> {t_page.yes}</label>
                                                <label className="flex items-center gap-2"><RadioGroupItem value="no" id="compound-no" /> {t_page.no}</label>
                                            </RadioGroup>
                                        </FormField>
                                        <FormField label={t_page.deliveryDate} id="deliveryType">
                                             <RadioGroup {...register("deliveryType")} defaultValue="immediate" className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2"><RadioGroupItem value="immediate" id="delivery-immediate"/> {t_page.immediate}</label>
                                                <label className="flex items-center gap-2"><RadioGroupItem value="future" id="delivery-future"/> {t_page.future}</label>
                                            </RadioGroup>
                                        </FormField>
                                        <FormField label={t_page.realEstateFinance} id="realEstateFinanceAvailable">
                                            <RadioGroup {...register("realEstateFinanceAvailable")} defaultValue="no" className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2"><RadioGroupItem value="yes" id="finance-yes" /> {t_page.yes}</label>
                                                <label className="flex items-center gap-2"><RadioGroupItem value="no" id="finance-no"/> {t_page.no}</label>
                                            </RadioGroup>
                                        </FormField>
                                    </div>
                                    {watchDeliveryType === 'future' && (
                                        <div className="grid sm:grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                                            <FormField label={t_page.deliveryMonth} id="deliveryMonth" error={errors.deliveryMonth?.message}>
                                                <Select {...register("deliveryMonth", { required: t_page.errors.required })}>
                                                    <option value="">--</option>
                                                    {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>)}
                                                </Select>
                                            </FormField>
                                            <FormField label={t_page.deliveryYear} id="deliveryYear" error={errors.deliveryYear?.message}>
                                                <Input type="number" {...register("deliveryYear", { required: t_page.errors.required, min: new Date().getFullYear() })} placeholder={new Date().getFullYear().toString()} min={new Date().getFullYear()} />
                                            </FormField>
                                        </div>
                                    )}
                                     <FormField label={t_page.installments} id="hasInstallments">
                                        <RadioGroup {...register("hasInstallments")} defaultValue="no" className="flex gap-4 pt-2">
                                            <label className="flex items-center gap-2"><RadioGroupItem value="yes" id="installments-yes" /> {t_page.yes}</label>
                                            <label className="flex items-center gap-2"><RadioGroupItem value="no" id="installments-no" /> {t_page.no}</label>
                                        </RadioGroup>
                                    </FormField>
                                     {watchHasInstallments === 'yes' && (
                                        <div className="grid sm:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                                            <FormField label={t_page.downPayment} id="downPayment" error={errors.downPayment?.message}><Input type="number" {...register("downPayment", { required: t_page.errors.required, min: 0 })} /></FormField>
                                            <FormField label={t_page.monthlyInstallment} id="monthlyInstallment" error={errors.monthlyInstallment?.message}><Input type="number" {...register("monthlyInstallment", { required: t_page.errors.required, min: 1 })} /></FormField>
                                            <FormField label={t_page.years} id="years" error={errors.years?.message}><Input type="number" {...register("years", { required: t_page.errors.required, min: 1 })} /></FormField>
                                        </div>
                                    )}
                                </fieldset>

                                 <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t.adminDashboard.editPropertyModal.title}</legend>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <FormField label={t_page.listingStartDate} id="listingStartDate" error={errors.listingStartDate?.message}>
                                            <Input type="date" {...register("listingStartDate")} />
                                        </FormField>
                                        <FormField label={t_page.listingEndDate} id="listingEndDate" error={errors.listingEndDate?.message}>
                                            <Input type="date" {...register("listingEndDate")} />
                                        </FormField>
                                    </div>
                                </fieldset>

                                {/* Submission */}
                                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                     <div className="flex items-start">
                                        <input
                                            id="isOwner"
                                            type="checkbox"
                                            {...register("isOwner", { required: t_page.errors.mustBeOwner })}
                                            className="h-4 w-4 mt-1 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        />
                                        <label htmlFor="isOwner" className={`text-sm text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                                            {t_page.confirmationLabel}
                                        </label>
                                    </div>
                                    {errors.isOwner && <p className="text-red-500 text-sm">{errors.isOwner.message}</p>}
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting ? '...' : t_page.submitButton}
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