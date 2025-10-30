import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { addPropertyRequest } from '../api/propertyRequests';
import { inputClasses, selectClasses } from './shared/FormField';
import { CheckCircleIcon, CloseIcon } from './icons/Icons';

interface AddPropertyPageProps {
  language: Language;
}

const FormField: React.FC<{ label: string, id: string, children: React.ReactNode, error?: string }> = ({ label, id, children, error }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        {children}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const purposeOptions = [
    { en: 'For Sale', ar: 'للبيع' },
    { en: 'For Rent', ar: 'إيجار' },
] as const;

const typeOptions = [
    { en: 'Apartment', ar: 'شقة' },
    { en: 'Villa', ar: 'فيلا' },
    { en: 'Commercial', ar: 'تجاري' },
    { en: 'Land', ar: 'أرض' },
] as const;

const finishingOptions = [
    { en: 'Fully Finished', ar: 'تشطيب كامل' },
    { en: 'Semi-finished', ar: 'نصف تشطيب' },
    { en: 'Without Finishing', ar: 'بدون تشطيب' },
    { en: 'Super Lux', ar: 'سوبر لوكس' },
    { en: 'Luxury Finishing', ar: 'تشطيب فاخر' },
    { en: 'Fully Furnished', ar: 'مفروشة بالكامل' },
] as const;


const AddPropertyPage: React.FC<AddPropertyPageProps> = ({ language }) => {
    const t = translations[language].addPropertyPage;
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        contactTime: '',
        purpose: '' as 'For Sale' | 'For Rent' | '',
        propertyType: '' as 'Apartment' | 'Villa' | 'Commercial' | 'Land' | '',
        finishingStatus: '', // stores the 'en' value
        area: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        floor: '',
        address: '',
        description: '',
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
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const tErrors = t.errors;

        if (!formData.customerName.trim()) newErrors.customerName = tErrors.required;
        if (!/^\+?[0-9\s-]{10,}$/.test(formData.customerPhone)) newErrors.customerPhone = tErrors.invalidPhone;
        if (!formData.contactTime) newErrors.contactTime = tErrors.required;
        if (!formData.purpose) newErrors.purpose = tErrors.required;
        if (!formData.propertyType) newErrors.propertyType = tErrors.required;
        if (formData.propertyType !== 'Land' && !formData.finishingStatus) newErrors.finishingStatus = tErrors.required;
        if (!formData.address.trim()) newErrors.address = tErrors.required;
        if (!formData.description.trim()) newErrors.description = tErrors.required;
        
        if (!formData.area.trim() || parseInt(formData.area) <= 0) newErrors.area = tErrors.positiveNumber;
        if (!formData.price.trim() || parseInt(formData.price) <= 0) newErrors.price = tErrors.positiveNumber;

        if (formData.propertyType === 'Apartment' || formData.propertyType === 'Villa') {
            if (!formData.bedrooms.trim() || parseInt(formData.bedrooms) < 0) newErrors.bedrooms = tErrors.required;
            if (!formData.bathrooms.trim() || parseInt(formData.bathrooms) < 0) newErrors.bathrooms = tErrors.required;
        } else if (formData.propertyType === 'Commercial') {
            if (!formData.floor.trim() || parseInt(formData.floor) < 0) newErrors.floor = tErrors.required;
        }
        
        if (formData.deliveryType === 'future') {
            if (!formData.deliveryMonth) newErrors.deliveryMonth = tErrors.required;
            if (!formData.deliveryYear || parseInt(formData.deliveryYear) < new Date().getFullYear()) newErrors.deliveryYear = tErrors.required;
        }
        
        if (formData.hasInstallments === 'yes') {
            if (!formData.downPayment || parseInt(formData.downPayment) < 0) newErrors.downPayment = tErrors.positiveNumber;
            if (!formData.monthlyInstallment || parseInt(formData.monthlyInstallment) <= 0) newErrors.monthlyInstallment = tErrors.positiveNumber;
            if (!formData.years || parseInt(formData.years) <= 0) newErrors.years = tErrors.positiveNumber;
        }

        if (formData.listingStartDate && formData.listingEndDate && new Date(formData.listingStartDate) > new Date(formData.listingEndDate)) {
            newErrors.listingEndDate = "End date must be after start date.";
        }

        if (!formData.isOwner) newErrors.isOwner = tErrors.mustBeOwner;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            if (name === 'propertyType') {
                if (value === 'Commercial' || value === 'Land') {
                    newState.bedrooms = '';
                    newState.bathrooms = '';
                }
                if (value === 'Land') {
                    newState.finishingStatus = '';
                    newState.floor = '';
                }
            }
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);

        const imageBase64Strings = await Promise.all(images.map(file => fileToBase64(file)));
        
        const propertyDetails = {
            purpose: purposeOptions.find(o => o.en === formData.purpose)!,
            propertyType: typeOptions.find(o => o.en === formData.propertyType)!,
            finishingStatus: finishingOptions.find(o => o.en === formData.finishingStatus)!,
            area: parseInt(formData.area),
            price: parseInt(formData.price),
            bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
            floor: formData.floor ? parseInt(formData.floor) : undefined,
            address: formData.address,
            description: formData.description,
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
            propertyDetails,
            images: imageBase64Strings,
        });

        setLoading(false);
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
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Owner Info */}
                                <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{t.ownerInfo}</legend>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField label={t.fullName} id="customerName" error={errors.customerName}>
                                            <input type="text" name="customerName" id="customerName" value={formData.customerName} onChange={handleChange} className={inputClasses}  />
                                        </FormField>
                                        <FormField label={t.phone} id="customerPhone" error={errors.customerPhone}>
                                            <input type="tel" name="customerPhone" id="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inputClasses}  dir="ltr" />
                                        </FormField>
                                    </div>
                                    <FormField label={t.contactTime} id="contactTime" error={errors.contactTime}>
                                        <select name="contactTime" id="contactTime" value={formData.contactTime} onChange={handleChange} className={`${selectClasses} ${!formData.contactTime ? 'text-gray-500 dark:text-gray-400' : ''}`} >
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
                                        <FormField label={t.purpose} id="purpose" error={errors.purpose}>
                                            <select name="purpose" id="purpose" value={formData.purpose} onChange={handleChange} className={`${selectClasses} ${!formData.purpose ? 'text-gray-500 dark:text-gray-400' : ''}`} >
                                                <option value="" disabled>{t.selectPurpose}</option>
                                                {purposeOptions.map(opt => <option key={opt.en} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                            </select>
                                        </FormField>
                                        <FormField label={t.propertyType} id="propertyType" error={errors.propertyType}>
                                             <select name="propertyType" id="propertyType" value={formData.propertyType} onChange={handleChange} className={`${selectClasses} ${!formData.propertyType ? 'text-gray-500 dark:text-gray-400' : ''}`} >
                                                <option value="" disabled>{t.selectType}</option>
                                                {typeOptions.map(opt => <option key={opt.en} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                            </select>
                                        </FormField>
                                     </div>
                                      <div className="grid sm:grid-cols-2 gap-4">
                                        {formData.propertyType !== 'Land' && (
                                            <FormField label={t.finishingStatus} id="finishingStatus" error={errors.finishingStatus}>
                                                <select name="finishingStatus" id="finishingStatus" value={formData.finishingStatus} onChange={handleChange} className={`${selectClasses} ${!formData.finishingStatus ? 'text-gray-500 dark:text-gray-400' : ''}`} >
                                                    <option value="" disabled>{t.selectFinishing}</option>
                                                    {finishingOptions.map(opt => <option key={opt.en} value={opt.en} className="text-gray-900 dark:text-white">{opt[language]}</option>)}
                                                </select>
                                            </FormField>
                                        )}
                                        <FormField label={t.area} id="area" error={errors.area}>
                                            <input type="number" name="area" id="area" value={formData.area} onChange={handleChange} className={inputClasses}  min="1" />
                                        </FormField>
                                      </div>
                                      <div className="grid sm:grid-cols-2 gap-4">
                                         <FormField label={t.price} id="price" error={errors.price}>
                                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className={inputClasses}  min="1"/>
                                        </FormField>
                                        {(formData.propertyType === 'Apartment' || formData.propertyType === 'Villa' || formData.propertyType === 'Commercial') && (
                                            <FormField label={t.floor} id="floor" error={errors.floor}>
                                                <input type="number" name="floor" id="floor" value={formData.floor} onChange={handleChange} className={inputClasses} min="0"/>
                                            </FormField>
                                        )}
                                      </div>
                                      {(formData.propertyType === 'Apartment' || formData.propertyType === 'Villa') && (
                                          <div className="grid sm:grid-cols-2 gap-4">
                                              <FormField label={t.bedrooms} id="bedrooms" error={errors.bedrooms}>
                                                  <input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms} onChange={handleChange} className={inputClasses}  min="0"/>
                                              </FormField>
                                              <FormField label={t.bathrooms} id="bathrooms" error={errors.bathrooms}>
                                                  <input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms} onChange={handleChange} className={inputClasses}  min="0"/>
                                              </FormField>
                                          </div>
                                      )}
                                    <FormField label={t.address} id="address" error={errors.address}>
                                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClasses}  />
                                    </FormField>
                                    <FormField label={t.description} id="description" error={errors.description}>
                                        <textarea name="description" id="description" rows={5} value={formData.description} onChange={handleChange} placeholder={t.descriptionPlaceholder} className={inputClasses}  />
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
                                                <label><input type="radio" name="isInCompound" value="yes" checked={formData.isInCompound === 'yes'} onChange={handleChange} className="mr-2" /> {t.yes}</label>
                                                <label><input type="radio" name="isInCompound" value="no" checked={formData.isInCompound === 'no'} onChange={handleChange} className="mr-2" /> {t.no}</label>
                                            </div>
                                        </FormField>
                                        <FormField label={t.deliveryDate} id="deliveryType">
                                             <div className="flex gap-4 pt-2">
                                                <label><input type="radio" name="deliveryType" value="immediate" checked={formData.deliveryType === 'immediate'} onChange={handleChange} className="mr-2" /> {t.immediate}</label>
                                                <label><input type="radio" name="deliveryType" value="future" checked={formData.deliveryType === 'future'} onChange={handleChange} className="mr-2" /> {t.future}</label>
                                            </div>
                                        </FormField>
                                    </div>
                                    {formData.deliveryType === 'future' && (
                                        <div className="grid sm:grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                                            <FormField label={t.deliveryMonth} id="deliveryMonth" error={errors.deliveryMonth}>
                                                <select name="deliveryMonth" id="deliveryMonth" value={formData.deliveryMonth} onChange={handleChange} className={selectClasses}>
                                                    <option value="">--</option>
                                                    {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>)}
                                                </select>
                                            </FormField>
                                            <FormField label={t.deliveryYear} id="deliveryYear" error={errors.deliveryYear}>
                                                <input type="number" name="deliveryYear" id="deliveryYear" value={formData.deliveryYear} onChange={handleChange} className={inputClasses} placeholder={new Date().getFullYear().toString()} min={new Date().getFullYear()} />
                                            </FormField>
                                        </div>
                                    )}
                                     <FormField label={t.installments} id="hasInstallments">
                                        <div className="flex gap-4 pt-2">
                                            <label><input type="radio" name="hasInstallments" value="yes" checked={formData.hasInstallments === 'yes'} onChange={handleChange} className="mr-2" /> {t.yes}</label>
                                            <label><input type="radio" name="hasInstallments" value="no" checked={formData.hasInstallments === 'no'} onChange={handleChange} className="mr-2" /> {t.no}</label>
                                        </div>
                                    </FormField>
                                     {formData.hasInstallments === 'yes' && (
                                        <div className="grid sm:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                                            <FormField label={t.downPayment} id="downPayment" error={errors.downPayment}><input type="number" name="downPayment" value={formData.downPayment} onChange={handleChange} className={inputClasses} /></FormField>
                                            <FormField label={t.monthlyInstallment} id="monthlyInstallment" error={errors.monthlyInstallment}><input type="number" name="monthlyInstallment" value={formData.monthlyInstallment} onChange={handleChange} className={inputClasses} /></FormField>
                                            <FormField label={t.years} id="years" error={errors.years}><input type="number" name="years" value={formData.years} onChange={handleChange} className={inputClasses} /></FormField>
                                        </div>
                                    )}
                                </fieldset>

                                 <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <legend className="text-lg font-semibold text-amber-500 mb-2">{translations[language].adminDashboard.editPropertyModal.title}</legend>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <FormField label={t.listingStartDate} id="listingStartDate" error={errors.listingStartDate}>
                                            <input type="date" name="listingStartDate" value={formData.listingStartDate} onChange={handleChange} className={inputClasses} />
                                        </FormField>
                                        <FormField label={t.listingEndDate} id="listingEndDate" error={errors.listingEndDate}>
                                            <input type="date" name="listingEndDate" value={formData.listingEndDate} onChange={handleChange} className={inputClasses} />
                                        </FormField>
                                    </div>
                                </fieldset>

                                {/* Submission */}
                                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                     <div className="flex items-start">
                                        <input
                                            id="isOwner"
                                            name="isOwner"
                                            type="checkbox"
                                            checked={formData.isOwner}
                                            onChange={handleChange}
                                            
                                            className="h-4 w-4 mt-1 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        />
                                        <label htmlFor="isOwner" className={`text-sm text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                                            {t.confirmationLabel}
                                        </label>
                                    </div>
                                    {errors.isOwner && <p className="text-red-500 text-sm">{errors.isOwner}</p>}
                                    <button type="submit" disabled={loading} className="w-full bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? '...' : t.submitButton}
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