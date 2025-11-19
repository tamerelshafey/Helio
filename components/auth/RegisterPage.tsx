
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Language, ManagementContact, OfficialDocument, PartnerRequest, SubscriptionPlan, PartnerType } from '../../types';
import FormField from '../ui/FormField';
import { CheckCircleIcon, CloseIcon, ClipboardDocumentListIcon } from '../ui/Icons';
import { SiteLogo } from '../shared/SiteLogo';
import { addRequest } from '../../services/requests';
import { RequestType } from '../../types';
import SubscriptionPlanSelector from '../shared/SubscriptionPlanSelector';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlans } from '../../services/plans';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

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
                            <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
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

const RegisterPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_page = t.partnerRequestForm;
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const { data: plans, isLoading: isLoadingPlans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });

    const [currentStep, setCurrentStep] = useState(1);
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<PartnerRequest>({
        defaultValues: {
            companyType: '' as any // Ensure no default selection
        }
    });
    
    const { fields, append, remove } = useFieldArray({ control, name: "managementContacts" });

    const mutation = useMutation({
        mutationFn: (data: any) => addRequest(RequestType.PARTNER_APPLICATION, data),
        onSuccess: () => {
            setFormSubmitted(true);
        },
        onError: (error) => {
            console.error("Submission failed:", error);
            showToast('Submission failed. Please try again.', 'error');
        }
    });

    const companyType = watch('companyType');
    const selectedPlan = watch('subscriptionPlan');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logo' | 'documents') => {
        if (e.target.files) {
            if (fieldName === 'logo') {
                const base64 = await fileToBase64(e.target.files[0]);
                setValue('logo', base64, { shouldValidate: true });
            } else {
                const filesArray = Array.from(e.target.files);
                const filePromises = filesArray.map(async (file: File) => ({
                    fileName: file.name,
                    fileContent: await fileToBase64(file)
                }));
                const newDocs = await Promise.all(filePromises);
                setValue('documents', newDocs, { shouldValidate: true });
            }
        }
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const onSubmit = (data: PartnerRequest) => {
        mutation.mutate({
            requesterInfo: { name: data.contactName, phone: data.contactPhone, email: data.contactEmail },
            payload: data,
        });
    };
    
    if (formSubmitted) {
        return (
            <div className="py-20 bg-white flex items-center justify-center text-center">
                <div className="max-w-xl">
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.auth.registerSuccessTitle}</h1>
                    <p className="text-lg text-gray-600 mb-8">{t.auth.registerSuccessMessage}</p>
                    <Link to="/" className="bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors">
                        {t.addPropertyPage.backToHome}
                    </Link>
                </div>
            </div>
        )
    }

    const steps = [t_page.step1_title, t_page.step2_title, t_page.step3_title];

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                 <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-4">
                            <SiteLogo className="h-10 w-10" />
                            <span className="text-2xl">ONLY HELIO</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800">{t.auth.registerTitle}</h1>
                        <p className="mt-2 text-gray-600">{t.auth.registerSubtitle}</p>
                    </div>
                    
                    <div className="mb-12">
                        <Stepper steps={steps} currentStep={currentStep} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {currentStep === 1 && (
                            <section className="animate-fadeIn">
                                <h2 className="text-2xl font-bold mb-2">{t_page.step1_title}</h2>
                                <p className="text-gray-500 mb-6">{t_page.step1_subtitle}</p>
                                <FormField label={t_page.companyType} id="companyType" error={errors.companyType?.message}>
                                    <Select {...register("companyType", { required: true })} className={!companyType ? 'text-gray-500' : ''}>
                                        <option value="" disabled>{t_page.selectType}</option>
                                        <option value="developer">{t_page.developer}</option>
                                        <option value="finishing">{t_page.finishing}</option>
                                        <option value="agency">{t_page.agency}</option>
                                    </Select>
                                </FormField>
                                {companyType && (
                                    <div className="mt-8">
                                        <SubscriptionPlanSelector 
                                            partnerType={companyType}
                                            selectedPlan={selectedPlan}
                                            onSelectPlan={(plan) => setValue('subscriptionPlan', plan, { shouldValidate: true })}
                                        />
                                        {errors.subscriptionPlan && <p className="text-red-500 text-sm mt-2 text-center">Please select a subscription plan.</p>}
                                    </div>
                                )}
                            </section>
                        )}
                        
                        {currentStep === 2 && (
                            <section className="animate-fadeIn space-y-6">
                                <h2 className="text-2xl font-bold mb-2">{t_page.step2_title}</h2>
                                <p className="text-gray-500 mb-6">{t_page.step2_subtitle}</p>
                                
                                <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-2">{t_page.companyInfo}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label={t_page.companyName} id="companyName" error={errors.companyName?.message}><Input {...register("companyName", { required: true })} /></FormField>
                                        <FormField label={t_page.companyAddress} id="companyAddress" error={errors.companyAddress?.message}><Input {...register("companyAddress", { required: true })} /></FormField>
                                        <FormField label={t_page.website} id="website"><Input {...register("website")} /></FormField>
                                    </div>
                                    <div className="mt-4">
                                        <FormField label={t_page.companyDescription} id="description" error={errors.description?.message}><Textarea {...register("description", { required: true })} rows={3} /></FormField>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-2">{t_page.primaryContact}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField label={t_page.contactName} id="contactName" error={errors.contactName?.message}><Input {...register("contactName", { required: true })} /></FormField>
                                        <FormField label={t_page.contactEmail} id="contactEmail" error={errors.contactEmail?.message}><Input type="email" {...register("contactEmail", { required: true })} /></FormField>
                                        <FormField label={t_page.contactPhone} id="contactPhone" error={errors.contactPhone?.message}><Input type="tel" {...register("contactPhone", { required: true })} /></FormField>
                                    </div>
                                </div>
                                
                                <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-2">{t_page.managementContacts}</h3>
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 bg-gray-50 rounded">
                                                <FormField label={t_page.managementName} id={`managementContacts[${index}].name`}><Input {...register(`managementContacts.${index}.name`)} /></FormField>
                                                <FormField label={t_page.managementPosition} id={`managementContacts[${index}].position`}><Input {...register(`managementContacts.${index}.position`)} /></FormField>
                                                <FormField label={t_page.managementEmail} id={`managementContacts[${index}].email`}><Input type="email" {...register(`managementContacts.${index}.email`)} /></FormField>
                                                <div className="flex items-center gap-2">
                                                    <FormField label={t_page.managementPhone} id={`managementContacts[${index}].phone`}><Input type="tel" {...register(`managementContacts.${index}.phone`)} /></FormField>
                                                    <Button type="button" variant="danger" size="icon" onClick={() => remove(index)}><CloseIcon className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => append({ name: '', position: '', email: '', phone: '' })} className="mt-4">{t_page.addManagementContact}</Button>
                                </div>
                            </section>
                        )}
                        
                        {currentStep === 3 && (
                             <section className="animate-fadeIn space-y-6">
                                <h2 className="text-2xl font-bold mb-2">{t_page.step3_title}</h2>
                                <p className="text-gray-500 mb-6">{t_page.step3_subtitle}</p>

                                <FormField label={t_page.companyLogo} id="logo" error={errors.logo?.message}>
                                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} required />
                                </FormField>
                                
                                <FormField label={t_page.officialDocs} id="documents" error={errors.documents?.message}>
                                    <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg">
                                        <ClipboardDocumentListIcon className="w-8 h-8 text-gray-400"/>
                                        <Input type="file" multiple onChange={(e) => handleFileChange(e, 'documents')} />
                                    </div>
                                </FormField>
                            </section>
                        )}

                        <div className="mt-12 flex justify-between">
                            {currentStep > 1 && <Button type="button" variant="secondary" onClick={prevStep}>{t_page.back}</Button>}
                            {currentStep < steps.length && <Button type="button" onClick={nextStep} disabled={!companyType || !selectedPlan}>{t_page.next}</Button>}
                            {currentStep === steps.length && <Button type="submit" isLoading={mutation.isPending}>{t_page.submitRequest}</Button>}
                        </div>
                    </form>
                 </div>
            </div>
        </div>
    );
};

export default RegisterPage;
