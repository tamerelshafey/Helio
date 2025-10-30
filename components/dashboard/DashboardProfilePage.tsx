import React, { useState, useEffect } from 'react';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { inputClasses } from '../shared/FormField';
import { useData } from '../shared/DataContext';

const textareaClasses = `${inputClasses} min-h-[120px]`;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const DashboardProfilePage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].dashboard;
    const { currentUser } = useAuth();
    const { updatePartner } = useData();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            const localizedPartner = [
                ...translations[language].partners.developers, 
                ...translations[language].partners.finishing_companies, 
                ...translations[language].partners.agencies
            ].find(p => p.id === currentUser.id);

            setName(localizedPartner?.name || currentUser.name);
            setDescription(localizedPartner?.description || currentUser.description);
            setLogoPreview(currentUser.imageUrl);
        }
    }, [currentUser, language]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setLoading(true);
        setSuccess('');

        let imageUrl = currentUser.imageUrl;
        if (logoFile) {
            imageUrl = await fileToBase64(logoFile);
        }
        
        const result = await updatePartner(currentUser.id, { name, description, imageUrl }, language);

        setLoading(false);
        if (result) {
            setSuccess(t.profileUpdateSuccess);
        }
    };
    
    if (!currentUser) return null;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.profileTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.profileSubtitle}</p>

            <div className="max-w-2xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerName}</label>
                        <input type="text" id="partnerName" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="partnerDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerDescription}</label>
                        <textarea id="partnerDescription" value={description} onChange={e => setDescription(e.target.value)} className={textareaClasses} required />
                    </div>
                     <div>
                        <label htmlFor="partnerImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerImageUrl}</label>
                        <div className="flex items-center gap-4">
                            {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" />}
                             <input 
                                type="file" 
                                id="partnerImageUrl" 
                                accept="image/*"
                                onChange={handleLogoChange} 
                                className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                            />
                        </div>
                    </div>
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading} className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                            {loading ? '...' : t.saveChanges}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DashboardProfilePage;