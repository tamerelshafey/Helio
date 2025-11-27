
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFormBySlug } from '../../services/forms';
import { addRequest } from '../../services/requests';
import { RequestType } from '../../types';
import type { FormFieldDefinition, SubmissionDestination } from '../../types';
import { useLanguage } from './LanguageContext';
import { useToast } from './ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';
import { BanknotesIcon } from '../ui/Icons';

interface DynamicFormProps {
    slug: string;
    defaultValues?: Record<string, any>;
    onSuccess?: () => void;
    className?: string;
    contextData?: any; // Extra data to attach (e.g. partnerId, serviceTitle)
    children?: React.ReactNode; // To render custom UI (like product cards) inside the form
    customSubmit?: (data: any) => void; // Override default API submission (e.g. for payment redirect)
    submitButtonText?: string;
    submitButtonIcon?: React.ReactNode;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const DynamicForm: React.FC<DynamicFormProps> = ({ 
    slug, 
    defaultValues, 
    onSuccess, 
    className, 
    contextData, 
    children, 
    customSubmit,
    submitButtonText,
    submitButtonIcon
}) => {
    const { language, t } = useLanguage();
    const { showToast } = useToast();

    const { data: formDef, isLoading } = useQuery({
        queryKey: ['form', slug],
        queryFn: () => getFormBySlug(slug),
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: defaultValues || {}
    });

    // Helper to process files before submission
    const processFiles = async (formData: any, fields: FormFieldDefinition[]) => {
        const processedData = { ...formData };
        const fileFields = fields.filter(f => f.type === 'file');
        
        for (const field of fileFields) {
            const fileList = formData[field.key];
            if (fileList && fileList.length > 0) {
                processedData[field.key] = await fileToBase64(fileList[0]);
            } else {
                delete processedData[field.key];
            }
        }
        return processedData;
    };

    const mutation = useMutation({
        mutationFn: async (processedData: any) => {
            if (!formDef) throw new Error('Form definition not found');
            const destination = formDef.destination as SubmissionDestination;

            // Merge form data with context data
            const payload = { ...processedData, ...contextData };

            const requesterInfo = {
                name: payload.name || payload.customerName || payload.fullName || 'Anonymous',
                phone: payload.phone || payload.customerPhone || '',
                email: payload.email || payload.contactEmail || ''
            };

            switch (destination) {
                case 'crm_messages':
                    return addRequest(RequestType.CONTACT_MESSAGE, {
                        requesterInfo,
                        payload: { ...payload, inquiryType: 'client' }
                    });
                case 'crm_leads':
                     return addRequest(RequestType.LEAD, {
                        requesterInfo,
                        payload: {
                            customerName: requesterInfo.name,
                            customerPhone: requesterInfo.phone,
                            serviceType: payload.serviceType || 'general',
                            serviceTitle: payload.serviceTitle || `${formDef.title.en} Submission`,
                            ...payload
                        }
                    });
                case 'crm_partners':
                    return addRequest(RequestType.PARTNER_APPLICATION, {
                        requesterInfo,
                        payload: { ...payload, status: 'pending' }
                    });
                 case 'email':
                    return new Promise(resolve => setTimeout(resolve, 1000));
                default:
                     return addRequest(RequestType.PROPERTY_INQUIRY, {
                        requesterInfo,
                        payload
                    });
            }
        },
        onSuccess: () => {
            showToast(language === 'ar' ? 'تم الإرسال بنجاح!' : 'Submitted successfully!', 'success');
            reset();
            if (onSuccess) onSuccess();
        },
        onError: (err) => {
            console.error(err);
            showToast(language === 'ar' ? 'حدث خطأ أثناء الإرسال.' : 'Submission failed.', 'error');
        }
    });

    const onSubmit: SubmitHandler<any> = async (data) => {
        if (!formDef) return;
        
        try {
            // Process files first
            const processedData = await processFiles(data, formDef.fields);

            if (customSubmit) {
                // If custom submit provided, pass processed data and stop.
                // We assume contextData merging happens in the custom handler if needed.
                customSubmit(processedData);
            } else {
                // Default API submission
                mutation.mutate(processedData);
            }
        } catch (error) {
            console.error("Form processing error:", error);
            showToast("Error processing form data", "error");
        }
    };

    if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;
    if (!formDef) return <div className="text-red-500">Form not found: {slug}</div>;
    if (!formDef.isActive) return <div className="text-gray-500">This form is currently inactive.</div>;

    const renderField = (field: FormFieldDefinition) => {
        const label = field.label[language];
        const error = errors[field.key]?.message as string | undefined;
        const commonProps = {
            id: field.id,
            placeholder: field.placeholder?.[language],
            ...register(field.key, { required: field.required ? (language === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required') : false })
        };

        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea {...commonProps} rows={4} className={inputClasses} />
                );
            case 'select':
                const options = Array.isArray(field.options) 
                    ? field.options 
                    : (typeof field.options === 'string' ? field.options.split(',').map(o => o.trim()) : []);
                return (
                    <Select {...commonProps} className={selectClasses}>
                        <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </Select>
                );
            case 'checkbox':
                return (
                    <div className="flex items-center gap-2">
                        <Checkbox {...commonProps} />
                        <label htmlFor={field.id} className="text-sm text-gray-700 dark:text-gray-300">{label}</label>
                    </div>
                );
            case 'file':
                return (
                    <Input type="file" {...commonProps} className="p-2 border rounded bg-white" accept="image/*,application/pdf" />
                );
            default:
                return <Input type={field.type} {...commonProps} className={inputClasses} />;
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
            
            {/* Render Custom UI Injected via Children */}
            {children && <div className="mb-6">{children}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formDef.fields.map((field) => {
                    const isFullWidth = field.width === 'full' || field.type === 'textarea';
                    const colSpanClass = isFullWidth ? 'md:col-span-2' : 'md:col-span-1';
                    
                    return (
                        <div key={field.id} className={colSpanClass}>
                            {field.type !== 'checkbox' && (
                                <FormField 
                                    label={field.label[language]} 
                                    id={field.id} 
                                    error={errors[field.key]?.message as string}
                                >
                                    {renderField(field)}
                                </FormField>
                            )}
                            {field.type === 'checkbox' && (
                                <div className="pt-6">
                                    {renderField(field)}
                                    {errors[field.key] && <p className="text-red-500 text-sm mt-1">{errors[field.key]?.message as string}</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="pt-4 flex justify-end">
                <Button 
                    type="submit" 
                    isLoading={isSubmitting || mutation.isPending} 
                    className="w-full md:w-auto flex items-center gap-2" 
                    size="lg"
                >
                    {submitButtonText || formDef.submitButtonLabel?.[language] || (language === 'ar' ? 'إرسال' : 'Submit')}
                    {submitButtonIcon}
                </Button>
            </div>
        </form>
    );
};

export default DynamicForm;
