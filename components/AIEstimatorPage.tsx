
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations } from '../data/translations';
import { useApiQuery } from './shared/useApiQuery';
import { getAIEstimatorConfig } from '../api/aiConfig';
import { useLanguage } from './shared/LanguageContext';
import SEO from './shared/SEO';
import { ChevronRightIcon } from './icons/Icons';
import { inputClasses } from './shared/FormField';
import type { AIEstimatorStage, AIEstimatorItem } from '../types';

type Selection = {
    quantity: number;
    selected: boolean;
};

const AIEstimatorPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].aiEstimator;
    const { data: config, isLoading: isLoadingConfig } = useApiQuery('aiEstimatorConfig', getAIEstimatorConfig);
    const navigate = useNavigate();

    const [mainArea, setMainArea] = useState(150);
    const [selections, setSelections] = useState<Record<string, Selection>>({});

    useEffect(() => {
        if (config) {
            const initialSelections: Record<string, Selection> = {};
            config.stages.forEach(stage => {
                stage.basicItems.forEach(item => {
                    initialSelections[item.id] = { 
                        quantity: item.unit.en === 'm²' ? mainArea : 1, 
                        selected: true 
                    };
                });
                stage.optionalItems.forEach(item => {
                    initialSelections[item.id] = { 
                        quantity: item.unit.en === 'm²' ? mainArea : 1, 
                        selected: false 
                    };
                });
            });
            setSelections(initialSelections);
        }
    }, [config, mainArea]);

    const handleSelectionChange = (itemId: string, field: 'quantity' | 'selected', value: number | boolean) => {
        setSelections(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value }
        }));
    };
    
    const totalCost = useMemo(() => {
        if (!config) return 0;
        return config.stages.reduce((total, stage) => {
            const stageTotal = [...stage.basicItems, ...stage.optionalItems].reduce((stageSum, item) => {
                const selection = selections[item.id];
                if (selection && selection.selected) {
                    return stageSum + (item.price * selection.quantity);
                }
                return stageSum;
            }, 0);
            return total + stageTotal;
        }, 0);
    }, [config, selections]);

    const handleRequestQuote = () => {
        if(!config) return;

        const serviceTitle = `${t.requestTitle}: ${mainArea}m²`;
        let notes = `**Finishing Cost Estimation Details:**\n- Main Area: ${mainArea}m²\n\n**Selected Items:**\n`;
        
        config.stages.forEach(stage => {
            const selectedItems = [...stage.basicItems, ...stage.optionalItems].filter(item => selections[item.id]?.selected);
            if (selectedItems.length > 0) {
                notes += `\n*${stage.name[language]}*\n`;
                selectedItems.forEach(item => {
                    const selection = selections[item.id];
                    notes += `- ${item.name[language]}: ${selection.quantity} ${item.unit[language]} @ ${item.price} EGP = ${(selection.quantity * item.price).toLocaleString()} EGP\n`;
                });
            }
        });

        notes += `\n**AI Estimated Cost: EGP ${totalCost.toLocaleString()}**`;

        navigate('/request-service', {
            state: {
                serviceTitle,
                customerNotes: notes,
                partnerId: 'admin-user',
                serviceType: 'finishing'
            }
        });
    };

    if (isLoadingConfig || !config) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div></div>;
    }

    return (
        <>
            <SEO title={t.title} description={t.ctaSubtitle} />
            <div className="bg-gray-50 dark:bg-gray-900 py-20 min-h-screen">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">{t.ctaSubtitle}</p>
                    </div>

                    <div className="sticky top-24 z-10 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.results.total}</p>
                            <p className="text-4xl font-extrabold text-amber-500">{totalCost.toLocaleString(language)} EGP</p>
                        </div>
                    </div>
                    
                     <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <label htmlFor="mainArea" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">{language === 'ar' ? 'المساحة الإجمالية للمشروع' : 'Total Project Area'}</label>
                        <div className="flex items-center gap-2">
                             <input type="number" id="mainArea" value={mainArea} onChange={e => setMainArea(parseInt(e.target.value) || 0)} className={inputClasses} />
                             <span className="font-semibold text-gray-600 dark:text-gray-300">m²</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {config.stages.map(stage => (
                            <details key={stage.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden" open>
                                <summary className="flex justify-between items-center p-4 cursor-pointer font-bold text-xl text-amber-600 dark:text-amber-400">
                                    {stage.name[language]}
                                    <ChevronRightIcon className="w-6 h-6 transition-transform duration-200 rotate-on-open" />
                                </summary>
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                    {stage.basicItems.length > 0 && <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">{language === 'ar' ? 'البنود الأساسية' : 'Basic Items'}</h4>}
                                    <div className="space-y-3 mb-4">
                                        {stage.basicItems.map(item => <ItemRow key={item.id} item={item} selection={selections[item.id]} onChange={handleSelectionChange} />)}
                                    </div>
                                    {stage.optionalItems.length > 0 && <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">{language === 'ar' ? 'البنود الاختيارية' : 'Optional Items'}</h4>}
                                     <div className="space-y-3">
                                        {stage.optionalItems.map(item => <ItemRow key={item.id} item={item} selection={selections[item.id]} onChange={handleSelectionChange} />)}
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleRequestQuote} className="w-full sm:w-auto bg-green-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg shadow-green-500/20">
                           {t.results.sendRequest}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const ItemRow: React.FC<{ item: AIEstimatorItem, selection: Selection, onChange: (id: string, field: 'quantity' | 'selected', value: any) => void }> = ({ item, selection, onChange }) => {
    const { language } = useLanguage();
    if (!selection) return null;

    return (
        <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                <input type="checkbox" checked={selection.selected} onChange={e => onChange(item.id, 'selected', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                <label className="font-medium text-gray-800 dark:text-gray-200">{item.name[language]}</label>
            </div>
             <div className="col-span-6 sm:col-span-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-right sm:text-left">
                    {item.price.toLocaleString(language)} EGP / {item.unit[language]}
                </p>
            </div>
            <div className="col-span-6 sm:col-span-4 flex items-center gap-2">
                <label className="text-sm text-gray-500">{language === 'ar' ? 'الكمية' : 'Qty'}:</label>
                <input type="number" value={selection.quantity} onChange={e => onChange(item.id, 'quantity', parseInt(e.target.value) || 0)} className={`${inputClasses} !p-2 text-sm`} disabled={!selection.selected}/>
            </div>
        </div>
    );
};


export default AIEstimatorPage;
