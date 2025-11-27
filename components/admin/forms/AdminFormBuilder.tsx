
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import type { FormDefinition, FormFieldType, FormCategory, SubmissionDestination } from '../../../types';
import { saveForm } from '../../../services/forms';
import { useToast } from '../../shared/ToastContext';
import { useLanguage } from '../../shared/LanguageContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Checkbox } from '../../ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import FormField, { inputClasses, selectClasses } from '../../ui/FormField';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, CloseIcon, PlusIcon } from '../../ui/Icons';

interface AdminFormBuilderProps {
    formToEdit?: FormDefinition;
    onClose: () => void;
}

const fieldTypes: FormFieldType[] = ['text', 'textarea', 'number', 'email', 'tel', 'select', 'checkbox', 'radio', 'date', 'file'];

const AdminFormBuilder: React.FC<AdminFormBuilderProps> = ({ formToEdit, onClose }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const t_shared = t.adminShared;

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
            width: 'full'
        });
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
                        
                        {/* New: Classification Fields */}
                        <FormField label="Category" id="category">
                            <Select {...register('category')} className={selectClasses}>
                                <option value="public">Public Pages (Contact, etc)</option>
                                <option value="lead_gen">Lead Generation (Service Request)</option>
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

                        <FormField label="Description (AR) - Optional" id="desc.ar">
                            <Input {...register('description.ar')} dir="rtl" />
                        </FormField>
                        <FormField label="Description (EN) - Optional" id="desc.en">
                            <Input {...register('description.en')} dir="ltr" />
                        </FormField>

                         <FormField label="Submit Button (AR)" id="btn.ar">
                            <Input {...register('submitButtonLabel.ar')} dir="rtl" />
                        </FormField>
                        <FormField label="Submit Button (EN)" id="btn.en">
                            <Input {...register('submitButtonLabel.en')} dir="ltr" />
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

                    {fields.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                            <p className="text-gray-500">No fields added yet. Click "Add Field" to start building.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm relative group transition-all hover:border-amber-400">
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button type="button" size="icon" variant="ghost" onClick={() => swap(index, index - 1)} disabled={index === 0}><ArrowUpIcon className="w-4 h-4" /></Button>
                                        <Button type="button" size="icon" variant="ghost" onClick={() => swap(index, index + 1)} disabled={index === fields.length - 1}><ArrowDownIcon className="w-4 h-4" /></Button>
                                        <Button type="button" size="icon" variant="danger" onClick={() => remove(index)}><TrashIcon className="w-4 h-4" /></Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-24">
                                        {/* Label AR */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (AR)</label>
                                            <Input {...register(`fields.${index}.label.ar`, { required: true })} dir="rtl" placeholder="الاسم" />
                                        </div>
                                        {/* Label EN */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (EN)</label>
                                            <Input {...register(`fields.${index}.label.en`, { required: true })} dir="ltr" placeholder="Name" />
                                        </div>
                                        {/* Key (Data ID) */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Key (Unique)</label>
                                            <Input {...register(`fields.${index}.key`, { required: true, pattern: /^[a-zA-Z0-9_]+$/ })} placeholder="e.g. firstName" className="font-mono text-sm" />
                                        </div>
                                         {/* Field Type */}
                                         <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                            <Select {...register(`fields.${index}.type`)} className={selectClasses}>
                                                {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    {/* Advanced Options Row */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox id={`req-${field.id}`} {...register(`fields.${index}.required`)} />
                                                <label htmlFor={`req-${field.id}`} className="text-sm cursor-pointer">Required</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Width:</label>
                                                <select {...register(`fields.${index}.width`)} className="text-sm bg-transparent border rounded p-1">
                                                    <option value="full">Full Row</option>
                                                    <option value="half">1/2 Row</option>
                                                    <option value="third">1/3 Row</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Conditional Options Input for Select/Radio */}
                                        {['select', 'radio', 'checkbox'].includes(watch(`fields.${index}.type`)) && (
                                             <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Options (Comma Separated)</label>
                                                <Input {...register(`fields.${index}.options` as any)} placeholder="Option 1, Option 2, Option 3" />
                                                <p className="text-xs text-gray-400 mt-1">Enter options separated by commas.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
