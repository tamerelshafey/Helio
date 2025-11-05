import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Language, FilterOption } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { addFilterOption, updateFilterOption, getAllPropertyTypes } from '../../api/filters';
import { useApiQuery } from '../shared/useApiQuery';

type DataType = 'propertyType' | 'finishingStatus' | 'amenity';

interface FilterItemFormModalProps {
    dataType: DataType;
    itemToEdit?: FilterOption;
    onClose: () => void;
    onSave: () => void;
    language: Language;
}

const FilterItemFormModal: React.FC<FilterItemFormModalProps> = ({ dataType, itemToEdit, onClose, onSave, language }) => {
    const { data: propertyTypes, refetch: refetchOptions } = useApiQuery('propertyTypes', getAllPropertyTypes);
    const t_shared = translations[language].adminShared;
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        ar: '',
        en: '',
    });
    const [applicableTo, setApplicableTo] = useState<string[]>([]);

    useEffect(() => {
        if (itemToEdit) {
            setFormData({ ar: itemToEdit.ar, en: itemToEdit.en });
            if (dataType === 'amenity' || dataType === 'finishingStatus') {
                setApplicableTo(itemToEdit.applicableTo || []);
            }
        }
    }, [itemToEdit, dataType]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplicableToChange = (typeEn: string) => {
        setApplicableTo(prev => 
            prev.includes(typeEn) ? prev.filter(t => t !== typeEn) : [...prev, typeEn]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data: Omit<FilterOption, 'id'> = {
            ...formData,
            ...((dataType === 'amenity' || dataType === 'finishingStatus') && { applicableTo })
        };
        
        if (itemToEdit) {
            await updateFilterOption(dataType, { ...itemToEdit, ...data });
        } else {
            await addFilterOption(dataType, data);
        }
        onSave();
        setLoading(false);
    };
    
    const title = itemToEdit ? `Edit ${dataType}` : `Add New ${dataType}`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-amber-500 capitalize">{title}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <FormField label="Name (Arabic)" id="ar">
                            <input name="ar" value={formData.ar} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <FormField label="Name (English)" id="en">
                            <input name="en" value={formData.en} onChange={handleChange} className={inputClasses} required />
                        </FormField>

                        {(dataType === 'amenity' || dataType === 'finishingStatus') && (
                            <div>
                                <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applicable to Property Types</h4>
                                <div className="grid grid-cols-2 gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                    {(propertyTypes || []).map(type => (
                                        <label key={type.id} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                                            <input 
                                                type="checkbox" 
                                                checked={applicableTo.includes(type.en)}
                                                onChange={() => handleApplicableToChange(type.en)}
                                                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                            />
                                            {type[language]}
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If no types are selected, this option will be available for all property types.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{t_shared.cancel}</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50">
                            {loading ? '...' : t_shared.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FilterItemFormModal;