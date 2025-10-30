import React, { useState } from 'react';
import type { Language, ManagementContact, OfficialDocument } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses, selectClasses } from '../shared/FormField';
import { CheckCircleIcon, CloseIcon } from '../icons/Icons';
import { addPartnerRequest } from '../../api/partnerRequests';

interface RegisterPageProps {
    language: Language;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const RegisterPage: React.FC<RegisterPageProps> = ({ language }) => {
    const t = translations[language];
    const t_form = t.partnerRequestForm;
    const t_auth = t.auth;
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        companyType: '' as 'developer' | 'finishing' | 'agency' | '',
        companyAddress: '',
        website: '',
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [managementContacts, setManagementContacts] = useState<ManagementContact[]>([]);
    const [documents, setDocuments] = useState<File[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleManagementChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const list = [...managementContacts];
        list[index] = { ...list[index], [name]: value };
        setManagementContacts(list);
    };

    const addManagementContact = () => {
        setManagementContacts([...managementContacts, { name: '', position: '', email: '', phone: '' }]);
    };
    
    const removeManagementContact = (index: number) => {
        const list = [...managementContacts];
        list.splice(index, 1);
        setManagementContacts(list);
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };
    
    const removeDocument = (index: number) => {
        const list = [...documents];
        list.splice(index, 1);
        setDocuments(list);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logo) {
            alert('Please upload a company logo.');
            return;
        }
        setLoading(true);

        const logoBase64 = await fileToBase64(logo);

        const documentsBase64: OfficialDocument[] = await Promise.all(documents.map(async (doc) => ({
            fileName: doc.name,
            fileContent: await fileToBase64(doc),
        })));

        await addPartnerRequest({
            ...formData,
            logo: logoBase64,
            managementContacts,
            documents: documentsBase64,
        } as any);

        setLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="py-20 bg-white dark:bg-gray-900 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="max-w-2xl mx-auto px-6">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t_auth.registerSuccessTitle}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t_auth.registerSuccessMessage}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-amber-500">{t_auth.registerTitle}</h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t_auth.registerSubtitle}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 space-y-8">
                        
                        <fieldset className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-8">
                            <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.companyInfo}</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label={t_form.companyName} id="companyName"><input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={inputClasses} required /></FormField>
                                <FormField label={t_form.companyType} id="companyType"><select name="companyType" value={formData.companyType} onChange={handleChange} className={selectClasses} required><option value="" disabled>{t_form.selectType}</option><option value="developer">{t_form.developer}</option><option value="finishing">{t_form.finishing}</option><option value="agency">{t_form.agency}</option></select></FormField>
                            </div>
                            <FormField label={t_form.companyAddress} id="companyAddress"><input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} className={inputClasses} required /></FormField>
                            <FormField label={t_form.website} id="website"><input type="url" name="website" value={formData.website} onChange={handleChange} className={inputClasses} /></FormField>
                            <FormField label={t_form.companyDescription} id="description"><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClasses} required></textarea></FormField>
                             <FormField label={t_form.companyLogo} id="logo"><div className="flex items-center gap-4">{logoPreview && <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-full object-cover border-2" />}<input type="file" id="logo" onChange={handleLogoChange} accept="image/*" className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} required /></div></FormField>
                        </fieldset>

                        <fieldset className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-8">
                            <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.primaryContact}</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField label={t_form.contactName} id="contactName"><input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className={inputClasses} required /></FormField>
                                <FormField label={t_form.contactEmail} id="contactEmail"><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className={inputClasses} required /></FormField>
                                <FormField label={t_form.contactPhone} id="contactPhone"><input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className={inputClasses} required /></FormField>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-8">
                            <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.managementContacts}</legend>
                            {managementContacts.map((contact, index) => (
                                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 relative">
                                    <button type="button" onClick={() => removeManagementContact(index)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1"><CloseIcon className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label={t_form.managementName} id={`mgmt-name-${index}`}><input type="text" name="name" value={contact.name} onChange={e => handleManagementChange(index, e)} className={inputClasses} required /></FormField>
                                        <FormField label={t_form.managementPosition} id={`mgmt-pos-${index}`}><input type="text" name="position" value={contact.position} onChange={e => handleManagementChange(index, e)} className={inputClasses} required /></FormField>
                                        <FormField label={t_form.managementEmail} id={`mgmt-email-${index}`}><input type="email" name="email" value={contact.email} onChange={e => handleManagementChange(index, e)} className={inputClasses} required /></FormField>
                                        <FormField label={t_form.managementPhone} id={`mgmt-phone-${index}`}><input type="tel" name="phone" value={contact.phone} onChange={e => handleManagementChange(index, e)} className={inputClasses} required /></FormField>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addManagementContact} className="text-amber-600 dark:text-amber-500 font-semibold text-sm">+ {t_form.addManagementContact}</button>
                        </fieldset>
                        
                        <fieldset className="space-y-4">
                            <legend className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t_form.officialDocs}</legend>
                            <FormField label={t_form.uploadDocs} id="documents">
                                <input type="file" id="documents" onChange={handleDocumentChange} multiple className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} />
                            </FormField>
                            {documents.length > 0 && (
                                <ul className="space-y-2">
                                    {documents.map((doc, index) => (
                                        <li key={index} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                            <span>{doc.name}</span>
                                            <button type="button" onClick={() => removeDocument(index)} className="text-red-500"><CloseIcon className="w-4 h-4" /></button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </fieldset>

                        <div className="pt-6 flex justify-end">
                            <button type="submit" disabled={loading} className="w-full md:w-auto bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                {loading ? '...' : t_form.submitRequest}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;