

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Control, UseFormRegister, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { GoogleGenAI, Type } from "@google/genai";
import type { AIEstimatorConfig, AIEstimatorStage, AIEstimatorItem } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { getAIEstimatorConfig, updateAIEstimatorConfig } from '../../api/aiConfig';
import { inputClasses } from '../shared/FormField';
import { TrashIcon, SparklesIcon, ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { useLanguage } from '../shared/LanguageContext';

type ItemSuggestions = Record<string, number>;

const ItemRow: React.FC<{
    control: Control<AIEstimatorConfig>;
    register: UseFormRegister<AIEstimatorConfig>;
    stageIndex: number;
    itemIndex: number;
    removeItem: (index: number) => void;
    itemType: 'basicItems' | 'optionalItems';
    suggestions: ItemSuggestions;
}> = ({ control, register, stageIndex, itemIndex, removeItem, itemType, suggestions }) => {
    const { fields } = useFieldArray({ control, name: `stages.${stageIndex}.${itemType}` });
    const field = fields[itemIndex] as unknown as AIEstimatorItem;
    const suggestion = suggestions[field.id];

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.name.ar`)} placeholder="Name (AR)" className={inputClasses} />
                <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.name.en`)} placeholder="Name (EN)" className={inputClasses} />
                <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.unit.ar`)} placeholder="Unit (AR)" className={inputClasses} />
                <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.unit.en`)} placeholder="Unit (EN)" className={inputClasses} />
            </div>
            <div className="flex items-center gap-4 mt-2">
                <div className="relative flex-grow">
                    <input type="number" {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.price`, { valueAsNumber: true })} placeholder="Price" className={inputClasses} />
                     {suggestion && (
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                           AI Suggests: {suggestion}
                        </span>
                    )}
                </div>
                <button type="button" onClick={() => removeItem(itemIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const StageEditor: React.FC<{
    control: Control<AIEstimatorConfig>;
    register: UseFormRegister<AIEstimatorConfig>;
    stageIndex: number;
    removeStage: (index: number) => void;
    swapStages: (index1: number, index2: number) => void;
    totalStages: number;
    getValues: UseFormGetValues<AIEstimatorConfig>;
    setValue: UseFormSetValue<AIEstimatorConfig>;
}> = ({ control, register, stageIndex, removeStage, swapStages, totalStages, getValues, setValue }) => {
    const { language } = useLanguage();
    const { fields: basicFields, append: appendBasic, remove: removeBasic } = useFieldArray({ control, name: `stages.${stageIndex}.basicItems` });
    const { fields: optionalFields, append: appendOptional, remove: removeOptional } = useFieldArray({ control, name: `stages.${stageIndex}.optionalItems` });
    const [isCheckingPrices, setIsCheckingPrices] = useState(false);
    const [priceSuggestions, setPriceSuggestions] = useState<ItemSuggestions>({});

    const handleCheckPrices = async () => {
        setIsCheckingPrices(true);
        setPriceSuggestions({});
        const stage = getValues(`stages.${stageIndex}`);
        if (!stage) {
            setIsCheckingPrices(false);
            return;
        }

        const items = [...stage.basicItems, ...stage.optionalItems];
        if (items.length === 0) {
            setIsCheckingPrices(false);
            return;
        }

        const itemsForPrompt = items.map(item => ({ id: item.id, name: item.name.en }));

        const prompt = `As a quantity surveyor for construction finishing in Egypt, provide the current average market prices in EGP for the following items. Return only a JSON object.
        
        Items: ${JSON.stringify(itemsForPrompt)}
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            prices: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        newPrice: { type: Type.NUMBER }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            const result = JSON.parse(response.text);
            const suggestions = (result.prices || []).reduce((acc: ItemSuggestions, item: { id: string; newPrice: number }) => {
                acc[item.id] = item.newPrice;
                return acc;
            }, {});
            setPriceSuggestions(suggestions);
        } catch (error) {
            console.error("AI Price Check Failed:", error);
        } finally {
            setIsCheckingPrices(false);
        }
    };
    
    const handleApplySuggestions = () => {
        const stage = getValues(`stages.${stageIndex}`);
        (stage.basicItems || []).forEach((item, index) => {
            if (priceSuggestions[item.id] !== undefined) {
                setValue(`stages.${stageIndex}.basicItems.${index}.price`, priceSuggestions[item.id], { shouldDirty: true });
            }
        });
        (stage.optionalItems || []).forEach((item, index) => {
            if (priceSuggestions[item.id] !== undefined) {
                setValue(`stages.${stageIndex}.optionalItems.${index}.price`, priceSuggestions[item.id], { shouldDirty: true });
            }
        });
        setPriceSuggestions({});
    };

    return (
        <details className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden" open>
            <summary className="flex justify-between items-center p-4 cursor-pointer">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input {...register(`stages.${stageIndex}.name.ar`)} placeholder="Stage Name (AR)" className={inputClasses} />
                    <input {...register(`stages.${stageIndex}.name.en`)} placeholder="Stage Name (EN)" className={inputClasses} />
                </div>
                 <div className="flex items-center ml-4">
                    <button type="button" onClick={() => swapStages(stageIndex, stageIndex - 1)} disabled={stageIndex === 0} className="p-2 disabled:opacity-30"><ArrowUpIcon className="w-5 h-5"/></button>
                    <button type="button" onClick={() => swapStages(stageIndex, stageIndex + 1)} disabled={stageIndex === totalStages - 1} className="p-2 disabled:opacity-30"><ArrowDownIcon className="w-5 h-5"/></button>
                    <button type="button" onClick={() => window.confirm('Are you sure you want to delete this entire stage?') && removeStage(stageIndex)} className="text-red-500 p-2"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </summary>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Items</h3>
                    <div className="flex items-center gap-2">
                        {Object.keys(priceSuggestions).length > 0 && (
                            <button type="button" onClick={handleApplySuggestions} className="text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-3 py-1.5 rounded-md">Apply Suggestions</button>
                        )}
                        <button type="button" onClick={handleCheckPrices} disabled={isCheckingPrices} className="text-sm font-semibold flex items-center gap-2 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-3 py-1.5 rounded-md disabled:opacity-50">
                            {isCheckingPrices ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <SparklesIcon className="w-4 h-4" />}
                            Check Market Prices with AI
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Basic Items</h4>
                        <div className="space-y-2">
                            {basicFields.map((field, index) => <ItemRow key={field.id} {...{ control, register, stageIndex, itemIndex: index, removeItem: removeBasic, itemType: 'basicItems', suggestions: priceSuggestions }} />)}
                        </div>
                        <button type="button" onClick={() => appendBasic({ id: `item-${Date.now()}`, name: { ar: '', en: '' }, unit: { ar: '', en: '' }, price: 0 })} className="mt-2 text-sm font-semibold text-amber-600 hover:text-amber-500">+ Add Basic Item</button>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Optional Items</h4>
                        <div className="space-y-2">
                            {optionalFields.map((field, index) => <ItemRow key={field.id} {...{ control, register, stageIndex, itemIndex: index, removeItem: removeOptional, itemType: 'optionalItems', suggestions: priceSuggestions }} />)}
                        </div>
                        <button type="button" onClick={() => appendOptional({ id: `item-${Date.now()}`, name: { ar: '', en: '' }, unit: { ar: '', en: '' }, price: 0 })} className="mt-2 text-sm font-semibold text-amber-600 hover:text-amber-500">+ Add Optional Item</button>
                    </div>
                </div>
            </div>
        </details>
    );
};


const AdminAIEstimatorPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_page = t.adminDashboard.aiEstimatorSettings;
    const { data: config, isLoading, refetch } = useQuery({ queryKey: ['aiEstimatorConfig'], queryFn: getAIEstimatorConfig });
    const { showToast } = useToast();

    const { control, register, handleSubmit, reset, getValues, setValue, formState: { isSubmitting } } = useForm<AIEstimatorConfig>({
        defaultValues: { stages: [] }
    });

    const { fields: stageFields, append, remove, swap } = useFieldArray({ control, name: "stages" });

    useEffect(() => {
        if (config) {
            reset(config);
        }
    }, [config, reset]);

    const onSubmit = async (data: AIEstimatorConfig) => {
        await updateAIEstimatorConfig({ stages: data.stages });
        refetch();
        showToast('AI Estimator settings updated successfully!', 'success');
    };

    if (isLoading || !config) {
        return <div>Loading AI Estimator settings...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_page.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage the pricing and items for the public cost estimator.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    {stageFields.map((field, index) => (
                        <StageEditor 
                            key={field.id} 
                            control={control} 
                            register={register} 
                            stageIndex={index}
                            removeStage={remove}
                            swapStages={swap}
                            totalStages={stageFields.length}
                            getValues={getValues}
                            setValue={setValue}
                        />
                    ))}
                </div>

                 <button
                    type="button"
                    onClick={() => append({ id: `stage-${Date.now()}`, name: { ar: '', en: '' }, basicItems: [], optionalItems: [] })}
                    className="w-full text-center font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900 p-4 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700"
                >
                    + Add New Stage
                </button>

                <div className="flex justify-end items-center gap-4">
                    <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAIEstimatorPage;