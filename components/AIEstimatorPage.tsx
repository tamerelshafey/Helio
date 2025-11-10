import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAIEstimatorConfig } from '../api/aiConfig';
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

    if (isLoadingConfig || !config