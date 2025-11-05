import React, { useState, useEffect, useCallback } from 'react';
import type { Language, SiteContent } from '../../types';
import { inputClasses } from '../shared/FormField';
import { translations } from '../../data/translations';
import { CloseIcon } from '../icons/Icons';
import { getContent, updateContent as updateSiteContent } from '../../api/content';
import { useApiQuery } from '../shared/useApiQuery';

interface AdminSettingsPageProps {
  language: Language;
}

const DualLanguageInput: React.FC<{ name: string; value: { ar: string, en: string }; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; label: string }> = ({ name, value, onChange, label }) => (
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

const DualLanguageTextarea: React.FC<{ name: string; value: { ar: string, en: string }; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; label: string }> = ({ name, value, onChange, label }) => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor={`${name}.ar`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (AR)</label>
            <textarea id={`${name}.ar`} name={`${name}.ar`} value={value.ar} onChange={onChange} className={inputClasses} rows={4} />
        </div>
        <div>
            <label htmlFor={`${name}.en`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} (EN)</label>
            <textarea id={`${name}.en`} name={`${name}.en`} value={value.en} onChange={onChange} className={inputClasses} rows={4} />
        </div>
    </div>
);

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ language }) => {
    const { data: siteContent, isLoading: dataLoading, refetch } = useApiQuery('siteContent', getContent);
    const t = translations[language];
    
    const [formData, setFormData] = useState<SiteContent | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'services'>('general');

    useEffect(() => {
        if (siteContent) {
            setFormData(JSON.parse(JSON.stringify(siteContent))); // Deep copy
        }
    }, [siteContent]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        setFormData(prevData => {
            if (!prevData) return null;
            const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy to ensure nested objects are updated
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!isNaN(Number(key))) { // It's an array index
                    current = current[Number(key)];
                } else {
                    current = current[key];
                }
            }
            
            const lastKey = keys[keys.length - 1];
            current[lastKey] = type === 'number' ? Number(value) : value;

            return newData;
        });
    };
    
    const handleAddTier = (serviceIndex: number) => {
        setFormData(prevData => {
            if (!prevData) return null;
            const newData = JSON.parse(JSON.stringify(prevData));
            if (!newData.finishingServices[serviceIndex].pricingTiers) {
                newData.finishingServices[serviceIndex].pricingTiers = [];
            }
            newData.finishingServices[serviceIndex].pricingTiers.push({
                unitType: { ar: '', en: '' },
                areaRange: { ar: '', en: '' },
                price: 0
            });
            return newData;
        });
    };

    const handleRemoveTier = (serviceIndex: number, tierIndex: number) => {
        setFormData(prevData => {
            if (!prevData) return null;
            const newData = JSON.parse(JSON.stringify(prevData));
            newData.finishingServices[serviceIndex].pricingTiers.splice(tierIndex, 1);
            return newData;
        });
    };


    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setFormData(prevData => {
                if (!prevData) return null;
                const newData = JSON.parse(JSON.stringify(prevData));
                newData.logoUrl = base64;
                return newData;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setIsSaving(true);
        await updateSiteContent(formData);
        refetch();
        setIsSaving(false);
        alert('Settings updated successfully!');
    };

    if (dataLoading || !formData) {
        return <div>Loading settings...</div>;
    }
    
    const TabButton: React.FC<{tabKey: 'general' | 'contact' | 'social' | 'services', label: string}> = ({tabKey, label}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === tabKey ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.adminDashboard.nav.settings}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage global settings for the website, such as footer content and contact information.</p>
            
            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 border-b border-gray-200 dark:border-gray-700">
                         <div className="flex -mb-px space-x-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <TabButton tabKey="general" label="General Settings" />
                            <TabButton tabKey="services" label="Services Pricing" />
                            <TabButton tabKey="contact" label="Contact Info" />
                            <TabButton tabKey="social" label="Social Media" />
                         </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {activeTab === 'general' && (
                             <div className="space-y-6 animate-fadeIn">
                                <DualLanguageTextarea 
                                    name="description" 
                                    value={{ ar: formData.footer.ar.description, en: formData.footer.en.description }} 
                                    onChange={e => {
                                        const { name, value } = e.target;
                                        const lang = name.endsWith('.ar') ? 'ar' : 'en';
                                        const field = name.substring(0, name.length - 3);
                                        handleInputChange({ target: { name: `footer.${lang}.${field}`, value, type: 'textarea' }} as React.ChangeEvent<HTMLTextAreaElement>);
                                    }} 
                                    label="Site Description (in Footer)" 
                                />
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Logo</label>
                                    <div className="flex items-center gap-4">
                                        {formData.logoUrl ? 
                                            <img src={formData.logoUrl} alt="Logo preview" className="w-20 h-20 rounded-full object-contain border p-1 bg-gray-100 dark:bg-gray-700" />
                                            : <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">No Logo</div>
                                        }
                                        <input 
                                            type="file" 
                                            id="logoUrl" 
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                                        />
                                    </div>
                                </div>
                                 <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label htmlFor="locationPickerMapUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Picker Map URL</label>
                                    <input 
                                        type="url" 
                                        id="locationPickerMapUrl" 
                                        name="locationPickerMapUrl" 
                                        value={formData.locationPickerMapUrl} 
                                        onChange={handleInputChange} 
                                        className={inputClasses} 
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'services' && (
                             <div className="space-y-6 animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Finishing Services</h3>
                                {formData.finishingServices?.map((service, serviceIndex) => (
                                    <div key={serviceIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Service {serviceIndex + 1}</h4>
                                        <DualLanguageInput name={`finishingServices.${serviceIndex}.title`} value={service.title} onChange={handleInputChange} label="Service Title" />
                                        <DualLanguageTextarea name={`finishingServices.${serviceIndex}.description`} value={service.description} onChange={handleInputChange} label="Service Description" />
                                        
                                        {service.price !== undefined && (
                                            <div>
                                                <label htmlFor={`finishingServices.${serviceIndex}.price`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (EGP)</label>
                                                <input type="number" id={`finishingServices.${serviceIndex}.price`} name={`finishingServices.${serviceIndex}.price`} value={service.price} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                        )}

                                        {service.pricingTiers && (
                                            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Pricing Tiers</h5>
                                                {service.pricingTiers.map((tier, tierIndex) => (
                                                    <div key={tierIndex} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-300 dark:border-gray-600 relative">
                                                        <button type="button" onClick={() => handleRemoveTier(serviceIndex, tierIndex)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1"><CloseIcon className="w-4 h-4" /></button>
                                                        <div className="space-y-4">
                                                            <DualLanguageInput name={`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.unitType`} value={tier.unitType} onChange={handleInputChange} label="Unit Type" />
                                                            <DualLanguageInput name={`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.areaRange`} value={tier.areaRange} onChange={handleInputChange} label="Area Range" />
                                                            <div>
                                                                <label htmlFor={`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.price`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (EGP)</label>
                                                                <input type="number" id={`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.price`} name={`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.price`} value={tier.price} onChange={handleInputChange} className={inputClasses} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                 <button type="button" onClick={() => handleAddTier(serviceIndex)} className="text-sm font-semibold text-amber-600 hover:text-amber-500">+ Add New Tier</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'contact' && (
                             <div className="space-y-4 animate-fadeIn">
                                <DualLanguageInput 
                                    name="address" 
                                    value={{ar: formData.footer.ar.address, en: formData.footer.en.address}} 
                                    onChange={e => {
                                        const { name, value } = e.target;
                                        const lang = name.endsWith('.ar') ? 'ar' : 'en';
                                        const field = name.substring(0, name.length - 3);
                                        handleInputChange({ target: { name: `footer.${lang}.${field}`, value, type: 'text' }} as React.ChangeEvent<HTMLInputElement>);
                                    }} 
                                    label="Address" 
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="footer.phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                        <input type="text" id="footer.phone" name="footer.phone" value={formData.footer.phone} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="footer.email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                        <input type="email" id="footer.email" name="footer.email" value={formData.footer.email} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'social' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="footer.social.facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                                        <input type="url" id="footer.social.facebook" name="footer.social.facebook" value={formData.footer.social.facebook} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="footer.social.twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter URL</label>
                                        <input type="url" id="footer.social.twitter" name="footer.social.twitter" value={formData.footer.social.twitter} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="footer.social.instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                                        <input type="url" id="footer.social.instagram" name="footer.social.instagram" value={formData.footer.social.instagram} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="footer.social.linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                                        <input type="url" id="footer.social.linkedin" name="footer.social.linkedin" value={formData.footer.social.linkedin} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;