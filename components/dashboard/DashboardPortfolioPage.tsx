import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Language, PortfolioItem } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import FormField, { inputClasses } from '../shared/FormField';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { useData } from '../shared/DataContext';

type SortConfig = {
    key: 'title' | 'category';
    direction: 'ascending' | 'descending';
} | null;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const DashboardPortfolioPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].dashboard;
    const { currentUser } = useAuth();
    const { portfolio, loading, addPortfolioItem, deletePortfolioItem } = useData();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    
    const [newWorkFile, setNewWorkFile] = useState<File | null>(null);
    const [newWorkPreview, setNewWorkPreview] = useState<string>('');
    const [newItem, setNewItem] = useState({
        title: { ar: '', en: '' },
        category: { ar: '', en: '' }
    });
    
    const partnerPortfolio = useMemo(() => {
        if (!currentUser) return [];
        return portfolio.filter(item => item.partnerId === currentUser.id);
    }, [portfolio, currentUser]);

    const sortedAndFilteredPortfolio = useMemo(() => {
        let filteredItems = [...partnerPortfolio];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(item =>
                item.title[language].toLowerCase().includes(lowercasedFilter)
            );
        }
        
        if (sortConfig !== null) {
            filteredItems.sort((a, b) => {
                const aValue = a[sortConfig.key][language];
                const bValue = b[sortConfig.key][language];
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredItems;
    }, [partnerPortfolio, searchTerm, sortConfig, language]);

    const requestSort = (key: 'title' | 'category') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'title' | 'category') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };
    
    const handleDelete = async (itemId: string) => {
        if (window.confirm(t.confirmDeleteWork)) {
            await deletePortfolioItem(itemId);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [field, lang] = name.split('.');
            setNewItem(prev => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: value } }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewWorkFile(file);
            setNewWorkPreview(URL.createObjectURL(file));
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !newWorkFile) return;
        
        const imageSrc = await fileToBase64(newWorkFile);

        await addPortfolioItem({
            ...newItem,
            src: imageSrc,
            alt: newItem.title.en, // Use English title as alt text
            partnerId: currentUser.id
        });
        
        // Reset form
        setNewItem({ title: { ar: '', en: '' }, category: { ar: '', en: '' } });
        setNewWorkFile(null);
        setNewWorkPreview('');
        (e.target as HTMLFormElement).reset();
    };
    
    if (currentUser?.type !== 'finishing') {
        return null; // Render nothing while redirecting
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t.portfolioTitle}</h1>
            
            {/* Add New Work Form */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.addWork}</h2>
                 <form onSubmit={handleAdd} className="space-y-4">
                    <FormField label={t.workImageURL} id="src">
                        <div className="flex items-center gap-4">
                            {newWorkPreview && <img src={newWorkPreview} alt="New work preview" className="w-20 h-20 rounded-md object-cover border-2 border-gray-300 dark:border-gray-600" />}
                             <input 
                                type="file" 
                                id="src" 
                                accept="image/*"
                                onChange={handleFileChange} 
                                className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                                required
                            />
                        </div>
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t.workTitleAr} id="title.ar">
                            <input type="text" name="title.ar" value={newItem.title.ar} onChange={handleInputChange} className={inputClasses} required />
                        </FormField>
                        <FormField label={t.workTitleEn} id="title.en">
                            <input type="text" name="title.en" value={newItem.title.en} onChange={handleInputChange} className={inputClasses} required />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField label={t.workCategoryAr} id="category.ar">
                            <input type="text" name="category.ar" value={newItem.category.ar} onChange={handleInputChange} className={inputClasses} required />
                        </FormField>
                         <FormField label={t.workCategoryEn} id="category.en">
                            <input type="text" name="category.en" value={newItem.category.en} onChange={handleInputChange} className={inputClasses} required />
                        </FormField>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                            {t.saveWork}
                        </button>
                    </div>
                 </form>
            </div>

            <div className="mb-4">
                 <input
                    type="text"
                    placeholder={t.filter.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
            </div>

            {/* Portfolio Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t.portfolioTable.image}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('title')}>
                                <div className="flex items-center">{t.portfolioTable.title}{getSortIcon('title')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('category')}>
                                <div className="flex items-center">{t.portfolioTable.category}{getSortIcon('category')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t.portfolioTable.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-8">Loading...</td></tr>
                        ) : sortedAndFilteredPortfolio.length > 0 ? (
                            sortedAndFilteredPortfolio.map(item => (
                                <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <img src={item.src} alt={item.alt} className="w-16 h-16 object-cover rounded-md" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.title[language]}
                                    </th>
                                    <td className="px-6 py-4">{item.category[language]}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t.portfolioTable.delete}</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={4} className="text-center p-8">{t.portfolioTable.noWorks}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardPortfolioPage;