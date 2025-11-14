



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

const ContentServicesPage: React.FC = () => {
    const { register, control } = useOutletContext<ContentFormContext>();
    const { fields: serviceFields, append, remove } = useFieldArray({ control, name: 'services.en.features' });
    const { remove: removeAr } = useFieldArray({ control, name: 'services.ar.features' });

    return (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold">Services Section</h3>
            
             <div className="flex items-center gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                <Checkbox id="services-enabled" {...register('services.enabled')} />
                <label htmlFor="services-enabled" className="font-medium cursor-pointer">Enable Services section on homepage</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium">Section Title (AR)</label>
                    <Input {...register('services.ar.title')} />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Section Title (EN)</label>
                    <Input {...register('services.en.title')} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Section Description (AR)</label>
                    <Textarea {...register('services.ar.description')} rows={2}/>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Section Description (EN)</label>
                    <Textarea {...register('services.en.description')} rows={2}/>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2">Service Cards</h4>
                <div className="space-y-3">
                    {serviceFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-gray-50 dark:bg-gray-800/50">
                            <Button type="button" size="icon" variant="ghost" onClick={() => { remove(index); removeAr(index); }} className="absolute top-1 right-1"><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-xs">Title (AR)</label><Input {...register(`services.ar.features.${index}.title`)} /></div>
                                <div><label className="text-xs">Title (EN)</label><Input {...register(`services.en.features.${index}.title`)} /></div>
                                <div className="md:col-span-2"><label className="text-xs">Description (AR)</label><Textarea {...register(`services.ar.features.${index}.description`)} rows={2}/></div>
                                <div className="md:col-span-2"><label className="text-xs">Description (EN)</label><Textarea {...register(`services.en.features.${index}.description`)} rows={2}/></div>
                                <div><label className="text-xs">Link (e.g., /properties)</label><Input {...register(`services.en.features.${index}.link`)} /></div>
                                <div><label className="text-xs">Icon Name (e.g., BuildingIcon)</label><Input {...register(`services.en.features.${index}.icon`)} /></div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="mt-4" 
                    onClick={() => {
                        const newFeature = { title: '', description: '', link: '/', icon: 'SparklesIcon' };
                        append(newFeature);
                        // Manually sync the second language array
                        (control as any)._formValues.services.ar.features.push(newFeature);
                    }}
                >
                    Add Service
                </Button>
            </div>
        </div>
    );
};

export default ContentServicesPage;