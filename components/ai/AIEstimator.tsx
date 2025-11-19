
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAIEstimatorConfig } from '../../services/aiConfig';
import { addLead } from '../../services/leads';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { 
    CalculatorIcon, 
    CheckCircleIcon, 
    ChevronRightIcon, 
    ChevronLeftIcon, 
    WrenchScrewdriverIcon,
    BanknotesIcon
} from '../ui/Icons';

const CalculatorIconSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLineCap="round" strokeLineJoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AIEstimator: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const { data: config, isLoading } = useQuery({ queryKey: ['aiEstimatorConfig'], queryFn: getAIEstimatorConfig });

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({}); // stageId -> itemIds
    const [unitArea, setUnitArea] = useState<number>(100);

    const stages = config?.stages || [];
    const currentStage = stages[currentStep];

    const handleToggleItem = (stageId: string, itemId: string) => {
        setSelectedItems(prev => {
            const currentSelection = prev[stageId] || [];
            const newSelection = currentSelection.includes(itemId)
                ? currentSelection.filter(id => id !== itemId)
                : [...currentSelection, itemId];
            return { ...prev, [stageId]: newSelection };
        });
    };

    const totalPrice = useMemo(() => {
        if (!config) return 0;
        let total = 0;
        stages.forEach(stage => {
            const selectedInStage = selectedItems[stage.id] || [];
            const allItems = [...stage.basicItems, ...stage.optionalItems];
            selectedInStage.forEach(itemId => {
                const item = allItems.find(i => i.id === itemId);
                if (item) {
                    // Basic logic: Many finishing items are per m2, others are fixed. 
                    // For simplicity in this estimator, we assume prices marked as /m2 are multiplied by area, others are fixed/unit.
                    const isPerMeter = item.unit.en === 'm²' || item.unit.ar === 'م²';
                    total += isPerMeter ? item.price * unitArea : item.price;
                }
            });
        });
        return total;
    }, [config, selectedItems, unitArea, stages]);

    const mutation = useMutation({
        mutationFn: addLead,
        onSuccess: () => {
            showToast(language === 'ar' ? 'تم إرسال التقدير بنجاح! سيتواصل معك فريقنا.' : 'Estimation sent successfully! Our team will contact you.', 'success');
            navigate('/finishing');
        },
        onError: () => {
            showToast('Failed to submit request.', 'error');
        }
    });

    const handleSubmit = () => {
        // Construct a detailed note of the estimation
        let details = `Initial Estimation: ${totalPrice.toLocaleString()} EGP for ${unitArea}m² unit.\n\nSelections:\n`;
        
        stages.forEach(stage => {
            const selectedInStage = selectedItems[stage.id] || [];
            if (selectedInStage.length > 0) {
                details += `- ${stage.name.en}: `;
                const items = [...stage.basicItems, ...stage.optionalItems]
                    .filter(i => selectedInStage.includes(i.id))
                    .map(i => i.name.en)
                    .join(', ');
                