
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAIEstimatorConfig } from '../services/aiConfig';
import { useLanguage } from './shared/LanguageContext';
import SEO from './shared/SEO';
import { ChevronRightIcon } from './icons/Icons';
import { inputClasses } from './shared/FormField';
import type { AIEstimatorStage, AIEstimatorItem } from '../types';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import { Input } from './ui/Input';

type Selection = {
    quantity: number;
    selected: boolean;
};

const AIEstimatorPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_ai = t.aiEstimator;
    const { data: config, isLoading: isLoadingConfig } = useQuery({ queryKey: ['aiEstimatorConfig'], queryFn: getAIEstimatorConfig });
    const navigate = useNavigate();

    const [mainArea, setMainArea] = useState(150);
    const [selections, setSelections] = useState<Record<string, Selection>>({});
    const [totalCost, setTotalCost] = useState<number | null>(null);

    useEffect(() => {
        if (config) {
            const initialSelections: Record<string, Selection> = {};
            config.stages.forEach(stage => {
                [...stage.basicItems, ...stage.optionalItems].forEach(item => {
                    initialSelections[item.id] = { 
                        quantity: item.unit.en === 'm²' ? mainArea : 1, 
                        selected: false // Start with all items unselected
                    };
                });
            });
            setSelections(initialSelections);
            setTotalCost(null); // Reset cost when area or config changes
        }
    }, [config, mainArea]);

    const handleSelectionChange = (itemId: string, field: 'quantity' | 'selected', value: number | boolean) => {
        setSelections(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value }
        }));
        setTotalCost(null); // Invalidate cost on any change
    };
    
    const calculateCost = () => {
        if (!config) return;
        const cost = config.stages.reduce((total, stage) => {
            const stageTotal = [...stage.basicItems, ...stage.optionalItems].reduce((stageSum, item) => {
                const selection = selections[item.id];
                if (selection && selection.selected) {
                    return stageSum + (item.price * selection.quantity);
                }
                return stageSum;
            }, 0);
            return total + stageTotal;
        }, 0);
        setTotalCost(cost);
    };

    const handleRequestQuote = () => {
        if(!config || totalCost === null) return;

        const serviceTitle = `${t_ai.requestTitle}: ${mainArea}m²`;
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
        return (
            <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading estimator settings...</p>
            </div>
        );
    }

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            <SEO
                title={`${t_ai.title} | ONLY HELIO`}
                description={t_ai.ctaSubtitle}
            />
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t_ai.title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{t_ai.ctaSubtitle}</p>
                </div>

                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="mb-6">
                        <label htmlFor="mainArea" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t_ai.step1.area}</label>
                        <Input
                            type="number"
                            id="mainArea"
                            value={mainArea}
                            onChange={(e) => setMainArea(parseInt(e.target.value, 10) || 0)}
                            className="max-w-xs"
                        />
                    </div>
                    
                    <div className="space-y-8">
                        {config.stages.map(stage => (
                            <details key={stage.id} className="border-t border-gray-200 dark:border-gray-700 pt-6" open>
                                <summary className="font-bold text-xl text-amber-500 cursor-pointer list-none flex justify-between items-center">
                                    {stage.name[language]}
                                    <ChevronRightIcon className="w-5 h-5 transition-transform rotate-on-open" />
                                </summary>
                                <div className="mt-4 space-y-4">
                                    {[...stage.basicItems, ...stage.optionalItems].map(item => (
                                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`item-${item.id}`}
                                                    checked={selections[item.id]?.selected || false}
                                                    onCheckedChange={(checked) => handleSelectionChange(item.id, 'selected', !!checked)}
                                                />
                                                <div>
                                                    <label htmlFor={`item-${item.id}`} className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer">{item.name[language]}</label>
                                                    <p className="text-xs text-gray-500">{item.price} EGP / {item.unit[language]}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                <Input
                                                    type="number"
                                                    value={selections[item.id]?.quantity || 0}
                                                    onChange={(e) => handleSelectionChange(item.id, 'quantity', parseInt(e.target.value, 10))}
                                                    className="w-24 text-center"
                                                    disabled={!selections[item.id]?.selected}
                                                />
                                                <span className="text-sm text-gray-500">{item.unit[language]}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        {totalCost !== null ? (
                            <div className="text-center animate-fadeIn">
                                <p className="text-lg text-gray-600 dark:text-gray-400">{t_ai.results.total}</p>
                                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 my-2">
                                    {totalCost.toLocaleString(language)} EGP
                                </p>
                                <p className="text-xs text-gray-500 mb-6">{t_ai.results.disclaimer}</p>
                                <Button size="lg" onClick={handleRequestQuote}>
                                    {t_ai.results.sendRequest}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Button size="lg" onClick={calculateCost}>
                                    {t_ai.getEstimate}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIEstimatorPage;
