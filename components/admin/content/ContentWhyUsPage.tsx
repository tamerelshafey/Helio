



import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFieldArray, UseFormReturn, Control } from 'react-hook-form';
import type { SiteContent } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { TrashIcon } from '../../ui/Icons';
import { Checkbox } from '../../ui/Checkbox';

type ContentFormContext = UseFormReturn<SiteContent>;

const ContentWhyUsPage: React.FC = () => {
    const { register, control } = useOutletContext<ContentFormContext>();
    const { fields, append, remove } = useFieldArray({ control, name: 'whyUs.en.features' });
    const { remove: removeAr } = useFieldArray({ control, name: 'whyUs.ar.features' });

    return (
        <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold">"Why Us" Section</h3>

            <div className="flex items-center gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                <Checkbox id="whyus-enabled" {...register('whyUs.enabled')} />
                <label htmlFor="whyus-enabled" className="font-medium cursor-pointer">Enable "Why Us" section on homepage</label>
            </div>

            <div><label className="block text-sm font-medium">Section Title (AR)</label><Input {...register('whyUs.ar.title')} /></div>
            <div><label className="block text-sm font-medium">Section Title (EN)</label><Input {...register('whyUs.en.title')} /></div>
            <div><label className="block text-sm font-medium">Section Description (AR)</label><Textarea {...register('whyUs.ar.description')} rows={2}/></div>
            <div><label className="block text-sm font-medium">Section Description (EN)</label><Textarea {...register('whyUs.en.description')} rows={2}/></div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-gray-50 dark:bg-gray-800/50">
                            <Button type="button" size="icon" variant="ghost" onClick={() => { remove(index); removeAr(index); }} className="absolute top-1 right-1"><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                            <div><label className="text-xs">Title (AR)</label><Input {...register(`whyUs.ar.features.${index}.title`)} /></div>
                            <div><label className="text-xs">Title (EN)</label><Input {...register(`whyUs.en.features.${index}.title`)} /></div>
                            <div><label className="text-xs">Description (AR)</label><Textarea {...register(`whyUs.ar.features.${index}.description`)} rows={2}/></div>
                            <div><label className="text-xs">Description (EN)</label><Textarea {...register(`whyUs.en.features.${index}.description`)} rows={2}/></div>
                        </div>
                    ))}
                </div>
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="mt-4" 
                    onClick={() => { 
                        const newFeature = { title: '', description: '' };
                        append(newFeature); 
                        // Manually sync the second language array
                        (control as any)._formValues.whyUs.ar.features.push(newFeature);
                    }}
                >
                    Add Feature
                </Button>
            </div>
        </div>
    );
};

export default ContentWhyUsPage;
