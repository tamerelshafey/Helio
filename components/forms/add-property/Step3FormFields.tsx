
import React from 'react';
import FormField from '../../ui/FormField';
import { CloseIcon, LocationMarkerIcon } from '../../ui/Icons';
import { useLanguage } from '../../shared/LanguageContext';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Checkbox } from '../../ui/Checkbox';
import { Button } from '../../ui/Button';
import { useAddPropertyForm } from '../../../hooks/useAddPropertyForm';

// Derive props type from the return type of the hook
type Step3FormFieldsProps = ReturnType<typeof useAddPropertyForm>;

export const Step3FormFields: React.FC<Step3FormFieldsProps> = (props) => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    const {
        handleSubmit, register, watch, errors, prevStep,
        imagePreviews, handleImageChange, removeImage,
        setIsLocationModalOpen, availableAmenities,
        handleAmenityChange, isSubmitting, watchAmenities,
        cooperationType
    } = props;
    
    const watchContactMethod = watch("contactMethod");

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t_page.formTitle}</h2>

            {cooperationType === 'paid_listing' && (
                <fieldset className="space-y-2">
                    <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t_page.contactPreference.title}:</legend>
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
                            <FormField label={`${t_page.phone} (For Public Inquiries)`} id="ownerPhone" error={errors.ownerPhone?.message as string | undefined}>
                                <Input type="tel" {...register("ownerPhone", { required: watchContactMethod === 'direct' ? t_page.errors.required : false, pattern: { value: /^\+?[0-9\s-]{10,}$/, message: t_page.errors.invalidPhone } })} dir="ltr" />
                            </FormField>
                        </div>
                    )}
                </fieldset>
            )}

            <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.ownerInfo}</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label={t_page.fullName} id="customerName" error={errors.customerName?.message as string | undefined}>
                        <Input type="text" {...register("customerName", { required: t_page.errors.required })} />
                    </FormField>
                    <FormField label={`${t_page.phone} (For Verification)`} id="customerPhone" error={errors.customerPhone?.message as string | undefined}>
                        <Input type="tel" {...register("customerPhone", { required: t_page.errors.required, pattern: { value: /^\+?[0-9\s-]{10,}$/, message: t_page.errors.invalidPhone } })} dir="ltr" />
                    </FormField>
                </div>
                <FormField label={t_page.contactTime} id="contactTime" error={errors.contactTime?.message as string | undefined}>
                    <Select {...register("contactTime", { required: t_page.errors.required })} className={!watch("contactTime") ? 'text-gray-500' : ''} >
                        <option value="" disabled>{t_page.selectTime}</option>
                        <option value="morning" className="text-gray-900">{t_page.morning}</option>
                        <option value="afternoon" className="text-gray-900">{t_page.afternoon}</option>
                        <option value="evening" className="text-gray-900">{t_page.evening}</option>
                    </Select>
                </FormField>
            </fieldset>
            
            <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.propertyInfo}</legend>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label={t.dashboard.propertyForm.propertyTitleAr} id="title.ar"><Input {...register("title.ar", { required: true })} /></FormField>
                    <FormField label={t.dashboard.propertyForm.propertyTitleEn} id="title.en"><Input {...register("title.en", { required: true })} /></FormField>
                </div>
                <FormField label={t_page.address} id="address" error={errors.address?.message as string | undefined}><Input type="text" {...register("address", { required: t_page.errors.required })} /></FormField>
                
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField label={t_page.propertyType} id="propertyType"><Select {...register("propertyType", { required: true })}><option value="" disabled>{t_page.selectType}</option>{(props.propertyTypes || []).map((o: any) => <option key={o.id} value={o.en}>{o[language]}</option>)}</Select></FormField>
                    <FormField label={t_page.area} id="area" error={errors.area?.message as string | undefined}><Input type="number" {...register("area", { required: t_page.errors.required, min: 1 })} min="1" /></FormField>
                    <FormField label={t_page.price} id="price" error={errors.price?.message as string | undefined}><Input type="number" {...register("price", { required: t_page.errors.required, min: 1 })} min="1"/></FormField>
                </div>
                
                    <FormField label={t.propertiesPage.amenities} id="amenities">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-md max-h-60 overflow-y-auto">
                        {(availableAmenities || []).map((amenity: any) => (
                            <label key={amenity.id} className="flex items-center gap-2">
                                <Checkbox
                                    checked={(watchAmenities?.en || []).includes(amenity.en)}
                                    onCheckedChange={() => handleAmenityChange(amenity.en)}
                                    id={`amenity-${amenity.id}`}
                                />
                                <span className="text-sm">{amenity[language]}</span>
                            </label>
                        ))}
                    </div>
                </FormField>

                <FormField label={t_page.description} id="description.ar">
                    <Textarea {...register("description.ar")} rows={3} placeholder={t_page.descriptionPlaceholder + ' (بالعربية)'} />
                </FormField>
                <FormField label="" id="description.en">
                    <Textarea {...register("description.en")} rows={3} placeholder={t_page.descriptionPlaceholder + ' (in English)'} />
                </FormField>

                <FormField label="Location" id="location">
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsLocationModalOpen(true)} className="flex items-center gap-2">
                            <LocationMarkerIcon className="w-5 h-5"/> Select on Map
                        </Button>
                        {(props.watchLatitude && props.watchLongitude) && (
                            <div className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                                {parseFloat(props.watchLatitude).toFixed(4)}, {parseFloat(props.watchLongitude).toFixed(4)}
                            </div>
                        )}
                    </div>
                </FormField>

                <FormField label={t_page.images} id="images">
                    <div>
                        <Input type="file" id="images" multiple accept="image/*" onChange={handleImageChange} className="p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                        <p className="text-xs text-gray-500 mt-1">{t_page.imagesHelpText}</p>
                        {imagePreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {imagePreviews.map((preview: string, index: number) => (
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
                    <Checkbox id="isOwner" {...register("isOwner", { required: t_page.errors.mustBeOwner })} className="mt-1" />
                    <label htmlFor="isOwner" className={`text-sm text-gray-600 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{t_page.confirmationLabel}</label>
                </div>
                {errors.isOwner && <p className="text-red-500 text-sm">{errors.isOwner.message as string}</p>}
                <div className="flex justify-between items-center">
                    <Button type="button" variant="secondary" onClick={prevStep}>{t_page.back}</Button>
                    <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                        {t_page.submitButton}
                    </Button>
                </div>
            </div>
        </form>
    );
};
