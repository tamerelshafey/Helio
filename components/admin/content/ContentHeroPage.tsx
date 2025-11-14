



import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { SiteContent } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../../ui/Icons';

type ContentFormContext = UseFormReturn<SiteContent>;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ContentHeroPage: React.FC = () => {
    const { register, control, setValue } = useOutletContext<ContentFormContext>();
    const { fields, append, remove, swap } = useFieldArray({ control, name: 'hero.images' });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setValue(`hero.images.${index}.src`, base64, { shouldDirty: true });
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold">Hero Section</h3>
                <div><label className="block text-sm font-medium">Title (AR)</label><Input {...register('hero.ar.title')} /></div>
                <div><label className="block text-sm font-medium">Title (EN)</label><Input {...register('hero.en.title')} /></div>
                <div><label className="block text-sm font-medium">Subtitle (AR)</label><Textarea {...register('hero.ar.subtitle')} rows={3}/></div>
                <div><label className="block text-sm font-medium">Subtitle (EN)</label><Textarea {...register('hero.en.subtitle')} rows={3}/></div>
            </div>

             <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-lg">Background Images</h4>
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex justify-end gap-1 absolute top-2 right-2 z-10">
                                <Button type="button" size="icon" variant="ghost" onClick={() => swap(index, index - 1)} disabled={index === 0}><ArrowUpIcon className="w-4 h-4" /></Button>
                                <Button type="button" size="icon" variant="ghost" onClick={() => swap(index, index + 1)} disabled={index === fields.length - 1}><ArrowDownIcon className="w-4 h-4" /></Button>
                                <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)}><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                            </div>
                            <div className="flex gap-4 items-start">
                                <img src={(field as any).src} alt="preview" className="w-36 h-24 object-cover rounded-md bg-gray-200 dark:bg-gray-700"/>
                                <div className="flex-grow space-y-2">
                                     <div>
                                        <label className="text-xs">Upload Image</label>
                                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, index)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs">Alt Text (AR)</label><Input {...register(`hero.images.${index}.alt.ar`)} /></div>
                                        <div><label className="text-xs">Alt Text (EN)</label><Input {...register(`hero.images.${index}.alt.en`)} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="mt-4" 
                    onClick={() => append({ src: '', alt: { ar: '', en: '' } })}
                >
                    Add Image
                </Button>
            </div>
        </div>
    );
};
export default ContentHeroPage;