
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, SiteContent, Quote } from '../../types';
import { inputClasses } from '../shared/FormField';
import { getContent, updateContent as updateSiteContent } from '../../api/content';
import { useApiQuery } from '../shared/useApiQuery';
import { useToast } from '../shared/ToastContext';
import { translations } from '../../data/translations';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, PhotoIcon } from '../icons/Icons';
import { useLanguage } from '../shared/LanguageContext';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-6 py-3 font-semibold text-lg border-b-4 transition-colors duration-200 ${
            isActive
            ? 'border-amber-500 text-amber-500'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50'
        }`}
    >
        {label}
    </button>
);

const DualLanguageInput: React.FC<{ name: string; value: { ar: string; en: string }; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string }> = ({ name, value, onChange, label }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor={`${name}.ar`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (AR)</label>
            <input type="text" id={`${name}.ar`} name={`${name}.ar`} value={value.ar} onChange={onChange} className={inputClasses} />
        </div>
        <div>
            <label htmlFor={`${name}.en`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (EN)</label>
            <input type="text" id={`${name}.en`} name={`${name}.en`} value={value.en} onChange={onChange} className={inputClasses} />
        </div>
    </div>
);

const DualLanguageTextarea: React.FC<{ name: string; value: { ar: string; en: string }; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; label: string }> = ({ name, value, onChange, label }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor={`${name}.ar`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (AR)</label>
            <textarea id={`${name}.ar`} name={`${name}.ar`} value={value.ar} onChange={onChange} className={inputClasses} rows={3} />
        </div>
        <div>
            <label htmlFor={`${name}.en`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (EN)</label>
            <textarea id={`${name}.en`} name={`${name}.en`} value={value.en} onChange={onChange} className={inputClasses} rows={3} />
        </div>
    </div>
);

type SectionKey = keyof Omit<SiteContent, 'logoUrl' | 'locationPickerMapUrl' | 'finishingServices'>;

const SectionEditor: React.FC<{
    title: string;
    initialData: any;
    sectionKey: SectionKey;
    onSaveSuccess: () => void;
    children: (data: any, handleDataChange: (field: string, value: any) => void) => React.ReactNode;
}> = ({ title, initialData, sectionKey, onSaveSuccess, children }) => {
    const { language } = useLanguage();
    const [data, setData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    const t = translations[language].adminDashboard.contentManagement;

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const isDirty = JSON.stringify(data) !== JSON.stringify(initialData);

    const handleDataChange = useCallback((field: string, value: any) => {
        setData((prevData: any) => {
            if (field === '') {
                return Array.isArray(value) ? [...value] : { ...value };
            }
            const keys = field.split('.');
            const newData = JSON.parse(JSON.stringify(prevData));
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                 if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSiteContent({ [sectionKey]: data });
            showToast(`${title} section updated successfully!`, 'success');
            onSaveSuccess();
        } catch (error) {
            showToast(`Failed to update ${title} section.`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {children(data, handleDataChange)}
            <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isDirty && <span className="text-sm text-yellow-600 dark:text-yellow-400">{t.unsavedChanges}</span>}
                <button 
                    type="button" 
                    onClick={handleSave} 
                    disabled={!isDirty || isSaving}
                    className="bg-amber-500 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? t.saving : t.saveChanges}
                </button>
            </div>
        </div>
    );
};

const AdminContentManagementPage: React.FC = () => {
    const { language } = useLanguage();
    const { data: siteContent, isLoading: dataLoading, refetch } = useApiQuery('siteContent', getContent);
    const [activeTab, setActiveTab] = useState<SectionKey>('hero');
    const t = translations[language].adminDashboard.contentManagement;
    
    const iconOptions = ['BuildingIcon', 'FinishingIcon', 'DecorationIcon', 'SparklesIcon'];

    const tabs: { key: SectionKey; label: string }[] = [
        { key: 'hero', label: t.tabs.hero },
        { key: 'whyUs', label: t.tabs.whyUs },
        { key: 'services', label: t.tabs.services },
        { key: 'partners', label: t.tabs.partners },
        { key: 'whyNewHeliopolis', label: t.tabs.whyNewHeliopolis },
        { key: 'quotes', label: t.tabs.quotes },
        { key: 'footer', label: t.tabs.footer },
    ];

    if (dataLoading || !siteContent) {
        return <div>Loading content manager...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex -mb-px space-x-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {tabs.map(tab => (
                        <TabButton key={tab.key} label={tab.label} isActive={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                {activeTab === 'hero' && (
                    <SectionEditor title="Hero Section" initialData={siteContent.hero} sectionKey="hero" onSaveSuccess={refetch}>
                        {(data, handleDataChange) => (
                            <div className="space-y-4">
                                <DualLanguageInput name="title" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Main Title" />
                                <DualLanguageTextarea name="subtitle" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Subtitle" />
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                     <h3 className="font-semibold text-lg mb-2">Hero Background Images</h3>
                                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {(data.images || []).map((image: string, index: number) => (
                                            <div key={index} className="relative group">
                                                <img src={image} alt={`Hero image ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" disabled={index === 0} onClick={() => {
                                                        const newImages = [...data.images];
                                                        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
                                                        handleDataChange('images', newImages);
                                                    }} className="p-1 bg-black/50 text-white rounded-full hover:bg-black/80 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4"/></button>
                                                    <button type="button" disabled={index === data.images.length - 1} onClick={() => {
                                                        const newImages = [...data.images];
                                                        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
                                                        handleDataChange('images', newImages);
                                                    }} className="p-1 bg-black/50 text-white rounded-full hover:bg-black/80 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4"/></button>
                                                    <button type="button" onClick={() => handleDataChange('images', data.images.filter((_:any, i:number) => i !== index))} className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        ))}
                                         <label className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                            <PhotoIcon className="w-8 h-8"/>
                                            <span className="text-sm mt-1">{t.uploadImage}</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                if(e.target.files?.[0]) {
                                                    const base64 = await fileToBase64(e.target.files[0]);
                                                    handleDataChange('images', [...(data.images || []), base64]);
                                                }
                                            }}/>
                                        </label>
                                     </div>
                                </div>
                            </div>
                        )}
                    </SectionEditor>
                )}
                {activeTab === 'whyUs' && (
                    <SectionEditor title="Why Choose Us" initialData={siteContent.whyUs} sectionKey="whyUs" onSaveSuccess={refetch}>
                        {(data, handleDataChange) => (
                            <div className="space-y-4">
                                <DualLanguageInput name="title" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Main Title" />
                                <DualLanguageTextarea name="description" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Main Description" />
                                <h3 className="text-lg font-semibold pt-4 border-t border-gray-200 dark:border-gray-600">Features</h3>
                                {data.ar.features.map((_: any, index: number) => (
                                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 relative">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Feature {index + 1}</h4>
                                            <div className="flex items-center gap-2">
                                                <button type="button" disabled={index === 0} onClick={() => {
                                                    const newFeaturesAr = [...data.ar.features]; const newFeaturesEn = [...data.en.features];
                                                    [newFeaturesAr[index - 1], newFeaturesAr[index]] = [newFeaturesAr[index], newFeaturesAr[index-1]];
                                                    [newFeaturesEn[index - 1], newFeaturesEn[index]] = [newFeaturesEn[index], newFeaturesEn[index-1]];
                                                    handleDataChange('ar.features', newFeaturesAr); handleDataChange('en.features', newFeaturesEn);
                                                }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUpIcon className="w-5 h-5"/></button>
                                                <button type="button" disabled={index === data.ar.features.length - 1} onClick={() => {
                                                     const newFeaturesAr = [...data.ar.features]; const newFeaturesEn = [...data.en.features];
                                                    [newFeaturesAr[index + 1], newFeaturesAr[index]] = [newFeaturesAr[index], newFeaturesAr[index+1]];
                                                    [newFeaturesEn[index + 1], newFeaturesEn[index]] = [newFeaturesEn[index], newFeaturesEn[index+1]];
                                                    handleDataChange('ar.features', newFeaturesAr); handleDataChange('en.features', newFeaturesEn);
                                                }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDownIcon className="w-5 h-5"/></button>
                                                <button type="button" onClick={() => {
                                                    handleDataChange('ar.features', data.ar.features.filter((_:any, i:number) => i !== index));
                                                    handleDataChange('en.features', data.en.features.filter((_:any, i:number) => i !== index));
                                                }} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                        <DualLanguageInput name={`features.${index}.title`} value={{ar: data.ar.features[index].title, en: data.en.features[index].title}} onChange={e => {
                                            const lang = e.target.name.split('.')[1];
                                            handleDataChange(`${lang}.features.${index}.title`, e.target.value);
                                        }} label="Feature Title"/>
                                        <DualLanguageTextarea name={`features.${index}.description`} value={{ar: data.ar.features[index].description, en: data.en.features[index].description}} onChange={e => {
                                            const lang = e.target.name.split('.')[1];
                                            handleDataChange(`${lang}.features.${index}.description`, e.target.value);
                                        }} label="Feature Description" />
                                    </div>
                                ))}
                                <button type="button" onClick={() => {
                                    handleDataChange('ar.features', [...data.ar.features, { title: '', description: '' }]);
                                    handleDataChange('en.features', [...data.en.features, { title: '', description: '' }]);
                                }} className="text-sm font-semibold text-amber-600 hover:text-amber-500">+ {t.addFeature}</button>
                            </div>
                        )}
                    </SectionEditor>
                )}
                 {activeTab === 'services' && (
                    <SectionEditor title="Our Services" initialData={siteContent.services} sectionKey="services" onSaveSuccess={refetch}>
                       {(data, handleDataChange) => (
                           <div className="space-y-4">
                                <DualLanguageInput name="title" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Main Title" />
                                <DualLanguageTextarea name="description" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Main Description" />
                                <h3 className="text-lg font-semibold pt-4 border-t border-gray-200 dark:border-gray-600">Service Cards</h3>
                                {data.ar.features.map((_:any, index: number) => (
                                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 relative">
                                         <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Service Card {index + 1}</h4>
                                            <div className="flex items-center gap-2">
                                                <button type="button" disabled={index === 0} onClick={() => {
                                                    const newFeaturesAr = [...data.ar.features]; const newFeaturesEn = [...data.en.features];
                                                    [newFeaturesAr[index - 1], newFeaturesAr[index]] = [newFeaturesAr[index], newFeaturesAr[index - 1]];
                                                    [newFeaturesEn[index - 1], newFeaturesEn[index]] = [newFeaturesEn[index], newFeaturesEn[index - 1]];
                                                    handleDataChange('ar.features', newFeaturesAr); handleDataChange('en.features', newFeaturesEn);
                                                }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUpIcon className="w-5 h-5"/></button>
                                                <button type="button" disabled={index === data.ar.features.length - 1} onClick={() => {
                                                    const newFeaturesAr = [...data.ar.features]; const newFeaturesEn = [...data.en.features];
                                                    [newFeaturesAr[index + 1], newFeaturesAr[index]] = [newFeaturesAr[index], newFeaturesAr[index + 1]];
                                                    [newFeaturesEn[index + 1], newFeaturesEn[index]] = [newFeaturesEn[index], newFeaturesEn[index + 1]];
                                                    handleDataChange('ar.features', newFeaturesAr); handleDataChange('en.features', newFeaturesEn);
                                                }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDownIcon className="w-5 h-5"/></button>
                                                <button type="button" onClick={() => {
                                                    handleDataChange('ar.features', data.ar.features.filter((_:any, i:number) => i !== index));
                                                    handleDataChange('en.features', data.en.features.filter((_:any, i:number) => i !== index));
                                                }} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                        <DualLanguageInput name={`features.${index}.title`} value={{ ar: data.ar.features[index].title, en: data.en.features[index].title }} onChange={e => { const lang = e.target.name.split('.')[1]; handleDataChange(`${lang}.features.${index}.title`, e.target.value); }} label="Card Title" />
                                        <DualLanguageTextarea name={`features.${index}.description`} value={{ ar: data.ar.features[index].description, en: data.en.features[index].description }} onChange={e => { const lang = e.target.name.split('.')[1]; handleDataChange(`${lang}.features.${index}.description`, e.target.value); }} label="Card Description" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor={`link-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link</label>
                                                <input id={`link-${index}`} type="text" value={data.ar.features[index].link} onChange={e => { handleDataChange(`ar.features.${index}.link`, e.target.value); handleDataChange(`en.features.${index}.link`, e.target.value); }} className={inputClasses}/>
                                            </div>
                                            <div>
                                                <label htmlFor={`icon-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                                                <select id={`icon-${index}`} value={data.ar.features[index].icon} onChange={e => { handleDataChange(`ar.features.${index}.icon`, e.target.value); handleDataChange(`en.features.${index}.icon`, e.target.value); }} className={`${inputClasses} appearance-none`}>
                                                    {iconOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => {
                                    const newFeature = { title: '', description: '', link: '/', icon: 'BuildingIcon' };
                                    handleDataChange('ar.features', [...data.ar.features, newFeature]);
                                    handleDataChange('en.features', [...data.en.features, newFeature]);
                                }} className="text-sm font-semibold text-amber-600 hover:text-amber-500">+ Add Service</button>
                           </div>
                       )}
                    </SectionEditor>
                )}
                 {activeTab === 'partners' && (
                    <SectionEditor title="Partners" initialData={siteContent.partners} sectionKey="partners" onSaveSuccess={refetch}>
                       {(data, handleDataChange) => (
                           <div className="space-y-4">
                               <DualLanguageInput name="title" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Section Title" />
                               <DualLanguageTextarea name="description" value={data} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Section Description" />
                               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-800 dark:text-blue-300">
                                   <p className="font-bold">Note:</p>
                                   <p className="text-sm">This section edits the title and description of the "Partners" block on the homepage. To add or manage individual partners, please go to the <Link to="/admin/partners" className="font-semibold underline hover:text-blue-600">Manage All Partners</Link> page.</p>
                               </div>
                           </div>
                       )}
                    </SectionEditor>
                )}
                 {activeTab === 'whyNewHeliopolis' && (
                    <SectionEditor title="Why New Heliopolis" initialData={siteContent.whyNewHeliopolis} sectionKey="whyNewHeliopolis" onSaveSuccess={refetch}>
                       {(data, handleDataChange) => (
                           <div className="space-y-4">
                                <DualLanguageInput name="title" value={{ ar: data.ar.title, en: data.en.title }} onChange={e => handleDataChange(e.target.name.replace('title.',''), e.target.value)} label="Section Title" />
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <h3 className="font-semibold text-lg mb-2">Location Section</h3>
                                    <DualLanguageInput name="location.title" value={{ar: data.ar.location.title, en: data.en.location.title}} onChange={e => handleDataChange(e.target.name.replace('location.',''), e.target.value)} label="Location Title" />
                                    <DualLanguageTextarea name="location.description" value={{ar: data.ar.location.description, en: data.en.location.description}} onChange={e => handleDataChange(e.target.name.replace('location.',''), e.target.value)} label="Location Description" />
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                     <h3 className="font-semibold text-lg mb-2">Images</h3>
                                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {(data.images || []).map((image: {src:string, alt:string}, index: number) => (
                                            <div key={index} className="relative group">
                                                <img src={image.src} alt={image.alt} className="w-full h-32 object-cover rounded-lg" />
                                                <button type="button" onClick={() => handleDataChange('images', data.images.filter((_:any, i:number) => i !== index))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                         <label className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                            <PhotoIcon className="w-8 h-8"/>
                                            <span className="text-sm mt-1">{t.uploadImage}</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                if(e.target.files?.[0]) {
                                                    const base64 = await fileToBase64(e.target.files[0]);
                                                    handleDataChange('images', [...(data.images || []), {src: base64, alt: 'New image'}]);
                                                }
                                            }}/>
                                        </label>
                                     </div>
                                </div>
                           </div>
                       )}
                    </SectionEditor>
                )}
                 {activeTab === 'quotes' && (
                    <SectionEditor title="Quotes" initialData={siteContent.quotes} sectionKey="quotes" onSaveSuccess={refetch}>
                        {(data, handleDataChange) => (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Manage Quotes</h3>
                                {data.map((quote: Quote, index: number) => (
                                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 relative">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Quote {index + 1}</h4>
                                            <div className="flex items-center gap-2">
                                                <button type="button" disabled={index === 0} onClick={() => {
                                                    const newData = [...data];
                                                    [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
                                                    handleDataChange('', newData);
                                                }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUpIcon className="w-5 h-5"/></button>
                                                <button type="button" disabled={index === data.length - 1} onClick={() => {
                                                    const newData = [...data];
                                                    [newData[index + 1], newData[index]] = [newData[index], newData[index + 1]];
                                                    handleDataChange('', newData);
                                                }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDownIcon className="w-5 h-5"/></button>
                                                <button type="button" onClick={() => {
                                                    handleDataChange('', data.filter((_:any, i:number) => i !== index));
                                                }} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                        <DualLanguageTextarea name="quote" value={quote.quote} onChange={e => {
                                            const lang = e.target.name.split('.')[1] as 'ar' | 'en';
                                            handleDataChange(`${index}.quote.${lang}`, e.target.value);
                                        }} label="Quote Text" />
                                        <DualLanguageInput name="author" value={quote.author} onChange={e => {
                                            const lang = e.target.name.split('.')[1] as 'ar' | 'en';
                                            handleDataChange(`${index}.author.${lang}`, e.target.value);
                                        }} label="Author Name" />
                                    </div>
                                ))}
                                <button type="button" onClick={() => {
                                    handleDataChange('', [...data, { quote: { ar: '', en: '' }, author: { ar: '', en: '' } }]);
                                }} className="text-sm font-semibold text-amber-600 hover:text-amber-500">+ Add Quote</button>
                            </div>
                        )}
                    </SectionEditor>
                )}
                 {activeTab === 'footer' && (
                    <SectionEditor title="Footer" initialData={siteContent.footer} sectionKey="footer" onSaveSuccess={refetch}>
                       {(data, handleDataChange) => (
                           <div className="space-y-4">
                               <DualLanguageTextarea name="description" value={{ar: data.ar.description, en: data.en.description}} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Footer Description" />
                               <DualLanguageInput name="address" value={{ar: data.ar.address, en: data.en.address}} onChange={e => handleDataChange(e.target.name, e.target.value)} label="Address" />
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div>
                                       <label className="block text-sm font-medium mb-1">Phone</label>
                                       <input type="text" name="phone" value={data.phone} onChange={e => handleDataChange(e.target.name, e.target.value)} className={inputClasses}/>
                                   </div>
                                    <div>
                                       <label className="block text-sm font-medium mb-1">Email</label>
                                       <input type="email" name="email" value={data.email} onChange={e => handleDataChange(e.target.name, e.target.value)} className={inputClasses}/>
                                   </div>
                               </div>
                           </div>
                       )}
                    </SectionEditor>
                )}
            </div>
        </div>
    );
};

export default AdminContentManagementPage;
