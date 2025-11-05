import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { Language, ManagementContact, OfficialDocument, PartnerRequest, SubscriptionPlan, PartnerType } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses, selectClasses } from '../shared/FormField';
import { CheckCircleIcon, CloseIcon } from '../icons/Icons';
import { addPartnerRequest } from '../../api/partnerRequests';
import SubscriptionPlanSelector from '../SubscriptionPlanSelector';
import { HelioLogo } from '../HelioLogo';

interface RegisterPageProps {
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

const Stepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                {steps.map((stepName, stepIdx) => (
                    <li key={stepName} className="md:flex-1">
                        {currentStep > stepIdx + 1 ? (
                            <div className="group flex w-full flex-col border-l-4 border-amber-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-amber-600 transition-colors">{`Step ${stepIdx + 1}`}</span>
                                <span className="text-sm font-medium">{stepName}</span>
                            </div>
                        ) : currentStep === stepIdx + 1 ? (
                            <div className="flex w-full flex-col border-l-4 border-amber-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                                <span className="text-sm font-medium text-amber-600">{`Step ${stepIdx + 1}`}</span>
                                <span className="text-sm font-medium">{stepName}</span>
                            </div>
                        ) : (
                            <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-500 transition-colors">{`Step ${stepIdx + 1}`}</span>
                                <span className="text-sm font-medium">{stepName}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};


const RegisterPage: React.FC<RegisterPageProps> = ({ language }) => {
    const t = translations[language];
    const t_form = t.partnerRequestForm;
    const t_auth = t.auth;

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    
    const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting, isValid, trigger } } = useForm({
        mode: 'onChange',
        defaultValues: {
            companyName: '',
            companyType: '' as PartnerType | '',
            companyAddress: '',
            website: '',
            description: '',
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            managementContacts: [] as ManagementContact[],
            subscriptionPlan: 'basic' as SubscriptionPlan,
        }
    });
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: "managementContacts"
    });

    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [documents, setDocuments] = useState<File[]>([]);
    
    const steps = [t_form.step1_title, t_form.step2_title, t_form.step3_title];
    
    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 2) {
            fieldsToValidate = ['companyName', 'companyAddress', 'description', 'contactName', 'contactEmail', 'contactPhone'];
        }
        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep(s => s < steps.length ? s + 1 : s);
        }
    };

    const prevStep = () => setStep(s => s > 1 ? s - 1 : s);

    const watchCompanyType = watch("companyType");
    const watchSubscriptionPlan = watch("subscriptionPlan");

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };
    
    const removeDocument = (index: number) => {
        const list = [...documents];
        list.splice(index, 1);
        setDocuments(list);
    };

    const onSubmit = async (data: any) => {
        if (!logo) {
             alert('Please upload a company logo.');
             return;
        }

        const logoBase64 = logo ? await fileToBase64(logo) : '';

        const documentsBase64: OfficialDocument[] = await Promise.all(documents.map(async (doc) => ({
            fileName: doc.name,
            fileContent: await fileToBase64(doc),
        })));

        const finalRequestData: Omit<PartnerRequest, 'id' | 'status' | 'createdAt'> = {
            ...data,
            logo: logoBase64,
            documents: documentsBase64,
        };

        await addPartnerRequest(finalRequestData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="py-20 bg-white dark:bg-gray-900 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="max-w-2xl mx-auto px-6">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t_auth.registerSuccessTitle}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t_auth.registerSuccessMessage}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                     <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-6">
                            <HelioLogo className="h-12 w-12" />
                            <span className="text-3xl">ONLY HELIO</span>
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">{t_auth.registerTitle}</h1>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="mb-8">
                            <Stepper steps={steps} currentStep={step} />
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {step === 1 && (
                                <div className="animate-fadeIn">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t_form.step1_title}</h2>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">{t_form.step1_subtitle}</p>
                                    </div>
                                    <div className="max-w-md mx-auto mb-8">
                                        <FormField label={t_form.companyType} id="companyType">
                                            <select {...register("companyType", { required: true })} className={selectClasses}>
                                                <option value="" disabled>{t_form.selectType}</option>
                                                <option value="developer">{t_form.developer}</option>
                                                <option value="finishing">{t_form.finishing}</option>
                                                <option value="agency">{t_form.agency}</option>
                                            </select>
                                        </FormField>
                                    </div>
                                    {watchCompanyType && (
                                        <div className="animate-fadeIn">
                                            <SubscriptionPlanSelector 
                                                language={language} 
                                                selectedPlan={watchSubscriptionPlan || 'basic'}
                                                onSelectPlan={(plan) => setValue('subscriptionPlan', plan, { shouldValidate: true })}
                                                partnerType={watchCompanyType as PartnerType}
                                            />
                                        </div>
                                    )}
                                    <div className="mt-8 pt-6 flex justify-end">
                                        <button type="button" onClick={nextStep} disabled={!watchCompanyType || !watchSubscriptionPlan} className="w-full sm:w-auto bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                            {t_form.next}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {step === 2 && (
                                <div className="animate-fadeIn space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t_form.step2_title}</h2>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">{t_form.step2_subtitle}</p>
                                    </div>
                                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.companyInfo}</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label={t_form.companyName} id="companyName" error={errors.companyName?.message}><input type="text" {...register("companyName", { required: "Company name is required." })} className={inputClasses} /></FormField>
                                            <FormField label={t_form.companyAddress} id="companyAddress" error={errors.companyAddress?.message}><input type="text" {...register("companyAddress", { required: "Company address is required." })} className={inputClasses} /></FormField>
                                        </div>
                                        <FormField label={t_form.website} id="website"><input type="url" {...register("website")} className={inputClasses} /></FormField>
                                        <FormField label={t_form.companyDescription} id="description" error={errors.description?.message}><textarea {...register("description", { required: "Description is required." })} rows={4} className={inputClasses}></textarea></FormField>
                                    </fieldset>

                                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.primaryContact}</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField label={t_form.contactName} id="contactName" error={errors.contactName?.message}><input type="text" {...register("contactName", { required: "Contact name is required." })} className={inputClasses} /></FormField>
                                            <FormField label={t_form.contactEmail} id="contactEmail" error={errors.contactEmail?.message}><input type="email" {...register("contactEmail", { required: "Email is required.", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }})} className={inputClasses} /></FormField>
                                            <FormField label={t_form.contactPhone} id="contactPhone" error={errors.contactPhone?.message}><input type="tel" {...register("contactPhone", { required: "Phone is required." })} className={inputClasses} /></FormField>
                                        </div>
                                    </fieldset>

                                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.managementContacts}</legend>
                                        {fields.map((item, index) => (
                                            <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 relative">
                                                <button type="button" onClick={() => remove(index)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1"><CloseIcon className="w-4 h-4" /></button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField label={t_form.managementName} id={`mgmt-name-${index}`}><input {...register(`managementContacts.${index}.name` as const, { required: true })} className={inputClasses} /></FormField>
                                                    <FormField label={t_form.managementPosition} id={`mgmt-pos-${index}`}><input {...register(`managementContacts.${index}.position` as const, { required: true })} className={inputClasses} /></FormField>
                                                    <FormField label={t_form.managementEmail} id={`mgmt-email-${index}`}><input type="email" {...register(`managementContacts.${index}.email` as const, { required: true })} className={inputClasses} /></FormField>
                                                    <FormField label={t_form.managementPhone} id={`mgmt-phone-${index}`}><input type="tel" {...register(`managementContacts.${index}.phone` as const, { required: true })} className={inputClasses} /></FormField>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => append({ name: '', position: '', email: '', phone: '' })} className="text-amber-600 dark:text-amber-500 font-semibold text-sm">+ {t_form.addManagementContact}</button>
                                    </fieldset>
                                    
                                    <div className="pt-6 flex justify-between items-center">
                                        <button type="button" onClick={prevStep} className="px-8 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold">{t_form.back}</button>
                                        <button type="button" onClick={nextStep} className="w-full sm:w-auto bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200">{t_form.next}</button>
                                    </div>
                                </div>
                            )}
                            
                            {step === 3 && (
                                <div className="animate-fadeIn space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t_form.step3_title}</h2>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">{t_form.step3_subtitle}</p>
                                    </div>
                                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <FormField label={t_form.companyLogo} id="logo">
                                            <div className="flex items-center gap-4">
                                                {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-20 h-20 rounded-full object-cover border-2" />}
                                                <input type="file" id="logo" onChange={handleLogoChange} accept="image/*" className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} required />
                                            </div>
                                        </FormField>
                                    </fieldset>
                                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.officialDocs}</legend>
                                        <FormField label={t_form.uploadDocs} id="documents">
                                            <input type="file" id="documents" onChange={handleDocumentChange} multiple className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} />
                                        </FormField>
                                        {documents.length > 0 && (
                                            <ul className="space-y-2">
                                                {documents.map((doc, index) => (
                                                    <li key={index} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                                        <span>{doc.name}</span>
                                                        <button type="button" onClick={() => removeDocument(index)} className="text-red-500"><CloseIcon className="w-4 h-4" /></button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </fieldset>

                                    <div className="pt-6 flex justify-between items-center">
                                        <button type="button" onClick={prevStep} className="px-8 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold">{t_form.back}</button>
                                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                            {isSubmitting ? '...' : t_form.submitRequest}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
