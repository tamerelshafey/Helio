
import React from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
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
import { PATTERNS, MESSAGES } from '../../utils/validation';

interface DynamicFormProps {
    slug: string;
    defaultValues?: Record<string, any>;
    onSuccess?: () => void;
    className?: string;
    contextData?: any; 
    children?: React.ReactNode; 
    headerContent?: React.ReactNode; // New prop for content above fields
    customSubmit?: (data: any) => void; 
    submitButtonText?: string;
    submitButtonIcon?: React.ReactNode;
    hiddenFields?: string[]; // New prop to hide specific fields by key
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
    headerContent,
    customSubmit,
    submitButtonText,
    submitButtonIcon,
    hiddenFields = []
}) => {
    const { language, t } = useLanguage();
    const { showToast } = useToast();

    const { data: formDef, isLoading } = useQuery({
        queryKey: ['form', slug],
        queryFn: () => getFormBySlug(slug),
    });

    const methods = useForm({
        defaultValues: defaultValues || {}
    });
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = methods;

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
            const processedData = await processFiles(data, formDef.fields);
            if (customSubmit) {
                customSubmit(processedData);
            } else {
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

    // Build validation rules based on field configuration
    const getValidationRules = (field: FormFieldDefinition) => {
        const rules: any = {
            required: field.required ? MESSAGES[language].required : false
        };

        // Native type validation patterns
        if (field.type === 'email') {
            rules.pattern = { value: PATTERNS.EMAIL, message: MESSAGES[language].invalid_email };
        }
        if (field.type === 'tel') {
            // Basic default regex for tel input if no specific validation is set
            rules.pattern = { value: /^[a-zA-Z0-9+\-\s()]*$/, message: MESSAGES[language].invalid_number }; 
        }
        if (field.type === 'number') {
             rules.min = { value: 0, message: MESSAGES[language].invalid_number };
        }

        // Advanced Validation from Admin Builder
        if (field.validation) {
            const { type, pattern, minLength, maxLength, errorMessage } = field.validation;
            
            if (minLength) rules.minLength = { value: minLength, message: MESSAGES[language].min_length(minLength) };
            if (maxLength) rules.maxLength = { value: maxLength, message: MESSAGES[language].max_length(maxLength) };

            const customMsg = errorMessage?.[language];

            switch (type) {
                case 'email':
                    rules.pattern = { value: PATTERNS.EMAIL, message: customMsg || MESSAGES[language].invalid_email };
                    break;
                case 'phone_eg':
                    rules.pattern = { value: PATTERNS.EGYPTIAN_PHONE, message: customMsg || MESSAGES[language].invalid_phone };
                    break;
                case 'url':
                    rules.pattern = { value: PATTERNS.URL, message: customMsg || MESSAGES[language].invalid_url };
                    break;
                case 'number':
                    rules.pattern = { value: /^\d+$/, message: customMsg || MESSAGES[language].invalid_number };
                    break;
                case 'custom':
                    if (pattern) {
                        try {
                            rules.pattern = { value: new RegExp(pattern), message: customMsg || 'Invalid Format' };
                        } catch (e) { console.error("Invalid Regex", pattern); }
                    }
                    break;
            }
        }
        return rules;
    };

    const renderField = (field: FormFieldDefinition) => {
        const label = field.label[language];
        // @ts-ignore
        const error = errors[field.key]?.message as string | undefined;
        const validationRules = getValidationRules(field);
        const isHidden = hiddenFields.includes(field.key);

        const commonProps = {
            id: field.id,
            placeholder: field.placeholder?.[language],
            ...register(field.key, validationRules)
        };

        if (isHidden) {
            return <input type="hidden" {...commonProps} />;
        }

        switch (field.type) {
            case 'textarea':
                return <Textarea {...commonProps} rows={4} className={inputClasses} />;
            case 'select':
                const options = Array.isArray(field.options) ? field.options : (typeof field.options === 'string' ? field.options.split(',').map(o => o.trim()) : []);
                return (
                    <Select {...commonProps} className={selectClasses}>
                        <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                        {options.map(opt => {
                            // Try to translate option key using t.formOptions, fallback to original text
                            const label = t.formOptions?.[opt] || opt;
                            return <option key={opt} value={opt}>{label}</option>
                        })}
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
                return <Input type="file" {...commonProps} className="p-2 border rounded bg-white" accept="image/*,application/pdf" />;
            default:
                return <Input type={field.type} {...commonProps} className={inputClasses} />;
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
                {/* Header Content (e.g. Location Map, Summaries) - Rendered ABOVE fields */}
                {headerContent && <div className="mb-6">{headerContent}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formDef.fields.map((field) => {
                        const isHidden = hiddenFields.includes(field.key);
                        if (isHidden) {
                            return <React.Fragment key={field.id}>{renderField(field)}</React.Fragment>;
                        }

                        const isFullWidth = field.width === 'full' || field.type === 'textarea';
                        const colSpanClass = isFullWidth ? 'md:col-span-2' : 'md:col-span-1';
                        
                        return (
                            <div key={field.id} className={colSpanClass}>
                                {field.type !== 'checkbox' && (
                                    <FormField 
                                        label={field.label[language]} 
                                        id={field.id} 
                                        // @ts-ignore
                                        error={errors[field.key]?.message as string}
                                    >
                                        {renderField(field)}
                                    </FormField>
                                )}
                                {field.type === 'checkbox' && (
                                    <div className="pt-6">
                                        {renderField(field)}
                                        {/* @ts-ignore */}
                                        {errors[field.key] && <p className="text-red-500 text-sm mt-1">{errors[field.key]?.message as string}</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Children Content (e.g. Images, Amenities, Disclaimers) - Rendered BELOW fields */}
                {children && <div className="mt-6 space-y-6">{children}</div>}

                <div className="pt-4 flex justify-end">
                    <Button type="submit" isLoading={isSubmitting || mutation.isPending} className="w-full md:w-auto flex items-center gap-2" size="lg">
                        {submitButtonText || formDef.submitButtonLabel?.[language] || (language === 'ar' ? 'إرسال' : 'Submit')}
                        {submitButtonIcon}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default DynamicForm;
