
import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { Language, AIEstimatorConfig, AIEstimatorOption } from '../../types';
import { translations } from '../../data/translations';
import { useApiQuery } from '../shared/useApiQuery';
import { useToast } from '../shared/ToastContext';
import { getAIEstimatorConfig, updateAIEstimatorConfig } from '../../api/aiConfig';
import { inputClasses, selectClasses } from '../shared/FormField';
import { TrashIcon } from '../icons/Icons';

const AdminAIEstimatorPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.aiEstimatorSettings;
    const { data: config, isLoading, refetch } = useApiQuery('aiEstimatorConfig', getAIEstimatorConfig);
    const { showToast } = useToast();

    const { register, control, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<AIEstimatorConfig>();

    const { fields: flooringFields, append: appendFlooring, remove: removeFlooring } = useFieldArray({ control, name: "options.flooring" });
    const { fields: wallsFields, append: appendWalls, remove: removeWalls } = useFieldArray({ control, name: "options.walls" });
    const { fields: ceilingFields, append: appendCeiling, remove: removeCeiling } = useFieldArray({ control, name: "options.ceiling" });
    const { fields: electricalFields, append: appendElectrical, remove: removeElectrical } = useFieldArray({ control, name: "options.electrical" });
    const { fields: plumbingFields, append: appendPlumbing, remove: removePlumbing } = useFieldArray({ control, name: "options.plumbing" });

    useEffect(() => {
        if (config) {
            reset(config);
        }
    }, [config, reset]);

    const onSubmit = async (data: AIEstimatorConfig) => {
        await updateAIEstimatorConfig(data);
        refetch();
        showToast('AI Estimator settings updated successfully!', 'success');
    };

    if (isLoading) {
        return <div>Loading AI Estimator settings...</div>;
    }
    
    const optionCategories = [
        { title: 'Flooring', fields: flooringFields, append: appendFlooring, remove: removeFlooring, name: 'options.flooring' },
        { title: 'Walls', fields: wallsFields, append: appendWalls, remove: removeWalls, name: 'options.walls' },
        { title: 'Ceiling', fields: ceilingFields, append: appendCeiling, remove: removeCeiling, name: 'options.ceiling' },
        { title: 'Electrical', fields: electricalFields, append: appendElectrical, remove: removeElectrical, name: 'options.electrical' },
        { title: 'Plumbing', fields: plumbingFields, append: appendPlumbing, remove: removePlumbing, name: 'options.plumbing' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t.promptTitle}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.promptDescription}</p>
                    <textarea {...register('prompt')} rows={8} className={inputClasses} />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t.modelTitle}</h2>
                    <select {...register('model')} className={`${selectClasses} max-w-xs`}>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    </select>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t.optionsTitle}</h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.optionsDescription}</p>
                    <div className="space-y-6">
                        {optionCategories.map(cat => (
                            <div key={cat.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h3 className="font-semibold text-lg mb-4">{cat.title}</h3>
                                <div className="space-y-3">
                                    {cat.fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                            <input {...register(`${cat.name}.${index}.key` as const)} placeholder={t.optionKey} className={inputClasses} />
                                            <input {...register(`${cat.name}.${index}.ar` as const)} placeholder={t.optionAr} className={inputClasses} />
                                            <input {...register(`${cat.name}.${index}.en` as const)} placeholder={t.optionEn} className={inputClasses} />
                                            <button type="button" onClick={() => cat.remove(index)} className="text-red-500 hover:text-red-700 justify-self-start md:justify-self-center">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={() => cat.append({ key: '', ar: '', en: '' })} className="mt-4 text-sm font-semibold text-amber-600 hover:text-amber-500">
                                    + {t.addNewOption}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end items-center gap-4">
                    {isDirty && <span className="text-sm text-yellow-600 dark:text-yellow-400">{translations[language].adminDashboard.contentManagement.unsavedChanges}</span>}
                    <button type="submit" disabled={isSubmitting || !isDirty} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                        {isSubmitting ? translations[language].adminDashboard.contentManagement.saving : translations[language].adminDashboard.contentManagement.saveChanges}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAIEstimatorPage;
