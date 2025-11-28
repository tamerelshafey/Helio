
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import type { FormDefinition, FormFieldType, ValidationRuleType } from '../../../types';
import { saveForm } from '../../../services/forms';
import { useToast } from '../../shared/ToastContext';
import { useLanguage } from '../../shared/LanguageContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Checkbox } from '../../ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import FormField, { inputClasses, selectClasses } from '../../ui/FormField';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, CloseIcon, PlusIcon, CogIcon } from '../../ui/Icons';

interface AdminFormBuilderProps {
    formToEdit?: FormDefinition;
    onClose: () => void;
}

const fieldTypes: FormFieldType[] = ['text', 'textarea', 'number', 'email', 'tel', 'select', 'checkbox', 'radio', 'date', 'file'];
const validationTypes: {value: ValidationRuleType, label: string}[] = [
    { value: 'none', label: 'None' },
    { value: 'email', label: 'Email' },
    { value: 'phone_eg', label: 'Egyptian Phone' },
    { value: 'url', label: 'URL' },
    { value: 'number', label: 'Number Only' },
    { value: 'custom', label: 'Custom Regex' },
];

const AdminFormBuilder: React.FC<AdminFormBuilderProps> = ({ formToEdit, onClose }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const t_shared = t.adminShared;
    const [expandedField, setExpandedField] = useState<number | null>(null);

    const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormDefinition>({
        defaultValues: formToEdit || {
            title: { ar: '', en: '' },
            description: { ar: '', en: '' },
            slug: '',
            category: 'public',
            destination: 'crm_messages',
            isActive: true,
            submitButtonLabel: { ar: 'إرسال', en: 'Submit' },
            fields: []
        }
    });

    const { fields, append, remove, swap } = useFieldArray({ control, name: 'fields' });

    const mutation = useMutation({
        mutationFn: saveForm,
        onSuccess: () => {
            showToast('Form saved successfully!', 'success');
            onClose();
        },
        onError: () => showToast('Failed to save form.', 'error')
    });

    const onSubmit = (data: FormDefinition) => {
        mutation.mutate(data);
    };

    const addField = () => {
        append({
            id: `field-${Date.now()}`,
            type: 'text',
            key: `field_${Date.now()}`,
            label: { ar: 'حقل جديد', en: 'New Field' },
            required: false,
            width: 'full',
            validation: { type: 'none' }
        });
    };
    
    const toggleExpand = (index: number) => {
        setExpandedField(expandedField === index ? null : index);
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formToEdit ? 'Edit Form' : 'Create New Form'}
                </h2>
                <Button variant="secondary" onClick={onClose}><CloseIcon className="w-5 h-5 mr-2"/> Close</Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Info */}
                <Card>
                    <CardHeader><CardTitle>Form Settings</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Form Title (AR)" id="title.ar" error={errors.title?.ar?.message}>
                            <Input {...register('title.ar', { required: 'Arabic title is required' })} dir="rtl" />
                        </FormField>
                        <FormField label="Form Title (EN)" id="title.en" error={errors.title?.en?.message}>
                            <Input {...register('title.en', { required: 'English title is required' })} dir="ltr" />
                        </FormField>
                        
                        <FormField label="Slug (Unique Identifier)" id="slug" error={errors.slug?.message}>
                            <Input {...register('slug', { required: 'Slug is required', pattern: { value: /^[a-z0-9-]+$/, message: 'Lowercase letters and hyphens only' } })} placeholder="e.g. contact-us" />
                        </FormField>

                         <div className="flex items-end pb-3">
                            <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 w-full">
                                <Checkbox id="isActive" {...register('isActive')} />
                                <label htmlFor="isActive" className="cursor-pointer font-medium">Form is Active</label>
                            </div>
                        </div>
                        
                        <FormField label="Category" id="category">
                            <Select {...register('category')} className={selectClasses}>
                                <option value="public">Public Pages</option>
                                <option value="lead_gen">Lead Generation</option>
                                <option value="partner_app">Partner Application</option>
                                <option value="admin_internal">Internal Admin Form</option>
                            </Select>
                        </FormField>

                        <FormField label="Submission Destination" id="destination">
                            <Select {...register('destination')} className={selectClasses}>
                                <option value="crm_messages">CRM: General Messages</option>
                                <option value="crm_leads">CRM: Leads Pipeline</option>
                                <option value="crm_partners">CRM: Partner Requests</option>
                                <option value="email">Email Only</option>
                            </Select>
                        </FormField>
                    </CardContent>
                </Card>

                {/* Fields Builder */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Form Fields</h3>
                        <Button type="button" onClick={addField} className="flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" /> Add Field
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm relative group transition-all ${expandedField === index ? 'ring-2 ring-amber-500' : 'hover:border-amber-400'}`}>
                                <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button type="button" size="icon" variant="ghost" onClick={() => toggleExpand(index)}><CogIcon className="w-4 h-4" /></Button>
                                    <Button type="button" size="icon" variant="ghost" onClick={() => swap(index, index - 1)} disabled={index === 0}><ArrowUpIcon className="w-4 h-4" /></Button>
                                    <Button type="button" size="icon" variant="ghost" onClick={() => swap(index, index + 1)} disabled={index === fields.length - 1}><ArrowDownIcon className="w-4 h-4" /></Button>
                                    <Button type="button" size="icon" variant="danger" onClick={() => remove(index)}><TrashIcon className="w-4 h-4" /></Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-24 mb-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (EN)</label>
                                        <Input {...register(`fields.${index}.label.en`, { required: true })} dir="ltr" placeholder="Name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Key</label>
                                        <Input {...register(`fields.${index}.key`, { required: true, pattern: /^[a-zA-Z0-9_]+$/ })} placeholder="keyName" className="font-mono text-sm" />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                        <Select {...register(`fields.${index}.type`)} className={selectClasses}>
                                            {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </Select>
                                    </div>
                                    <div className="flex items-center pt-6 gap-2">
                                         <Checkbox id={`req-${field.id}`} {...register(`fields.${index}.required`)} />
                                        <label htmlFor={`req-${field.id}`} className="text-sm cursor-pointer">Required</label>
                                    </div>
                                </div>

                                {expandedField === index && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (Arabic)</label>
                                                <Input {...register(`fields.${index}.label.ar`, { required: true })} dir="rtl" placeholder="الاسم" />
                                            </div>
                                             <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Width</label>
                                                <Select {...register(`fields.${index}.width`)} className={selectClasses}>
                                                    <option value="full">Full Row</option>
                                                    <option value="half">1/2 Row</option>
                                                    <option value="third">1/3 Row</option>
                                                </Select>
                                            </div>
                                            
                                            {/* Conditional Options */}
                                            {['select', 'radio', 'checkbox'].includes(watch(`fields.${index}.type`)) && (
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Options (Comma Separated)</label>
                                                    <Input {...register(`fields.${index}.options` as any)} placeholder="Option 1, Option 2, Option 3" />
                                                </div>
                                            )}

                                            {/* Advanced Validation */}
                                            <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                                                <h4 className="text-sm font-bold text-amber-600 mb-3">Advanced Validation</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Validation Rule</label>
                                                        <Select {...register(`fields.${index}.validation.type`)} className={selectClasses}>
                                                            {validationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                        </Select>
                                                    </div>
                                                    
                                                    {watch(`fields.${index}.validation.type`) === 'custom' && (
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium mb-1">Custom Regex Pattern</label>
                                                            <Input {...register(`fields.${index}.validation.pattern`)} placeholder="^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$" className="font-mono text-xs" />
                                                        </div>
                                                    )}
                                                    
                                                    {watch(`fields.${index}.validation.type`) !== 'none' && (
                                                         <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium mb-1">Custom Error (EN)</label>
                                                                <Input {...register(`fields.${index}.validation.errorMessage.en`)} placeholder="Invalid input" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium mb-1">Custom Error (AR)</label>
                                                                <Input {...register(`fields.${index}.validation.errorMessage.ar`)} placeholder="إدخال خاطئ" dir="rtl" />
                                                            </div>
                                                         </div>
                                                    )}
                                                    
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Min Length</label>
                                                        <Input type="number" {...register(`fields.${index}.validation.minLength`, { valueAsNumber: true })} />
                                                    </div>
                                                     <div>
                                                        <label className="block text-xs font-medium mb-1">Max Length</label>
                                                        <Input type="number" {...register(`fields.${index}.validation.maxLength`, { valueAsNumber: true })} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 z-10">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Save Form</Button>
                </div>
            </form>
        </div>
    );
};

export default AdminFormBuilder;
