

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { CloseIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon, FileDownloadIcon } from '../icons/Icons';
import { inputClasses, selectClasses } from '../shared/FormField';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amiriFont } from '../../utils/amiriFont';
import { useApiQuery } from '../shared/useApiQuery';
import { getAIEstimatorConfig } from '../../api/aiConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AIEstimatorProps {
    language: Language;
    serviceType: 'finishing' | 'decorations';
    onClose: () => void;
}

interface Estimate {
    total_cost_min: number;
    total_cost_max: number;
    itemized_breakdown: { item: string; cost: number }[];
    ai_notes: string;
}

const AIEstimator: React.FC<AIEstimatorProps> = ({ language, serviceType, onClose }) => {
    const t = translations[language].aiEstimator;
    const { data: config, isLoading: isLoadingConfig } = useApiQuery('aiEstimatorConfig', getAIEstimatorConfig);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        propertyType: 'apartment',
        area: '150',
        finishes: {
            flooring: '',
            walls: '',
            ceiling: '',
            electrical: '',
            plumbing: '',
        },
        quality: 'premium',
        rooms: {
            reception: true,
            bedrooms: '2',
            bathrooms: '1',
            kitchen: true,
        },
        customRequests: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [estimate, setEstimate] = useState<Estimate | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    const contextStrings = useMemo(() => {
        if (serviceType === 'finishing') {
            return {
                promptContext: 'a finishing project',
                pdfTitle: 'تقدير تكلفة أعمال التشطيبات'
            };
        }
        return {
            promptContext: 'an interior decoration project',
            pdfTitle: 'تقدير تكلفة أعمال الديكور'
        };
    }, [serviceType]);
    
    useEffect(() => {
        if (config) {
            setFormData(prev => ({
                ...prev,
                finishes: {
                    flooring: config.options.flooring[0]?.key || '',
                    walls: config.options.walls[0]?.key || '',
                    ceiling: config.options.ceiling[0]?.key || '',
                    electrical: config.options.electrical[0]?.key || '',
                    plumbing: config.options.plumbing[0]?.key || '',
                }
            }));
        }
    }, [config]);


    useEffect(() => {
        if (step === 5) { // Loading step
            const messages = t.loading.messages;
            if (!messages || messages.length === 0) return;

            const interval = setInterval(() => {
                setLoadingMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
            }, 2500);

            return () => clearInterval(interval);
        }
    }, [step, t.loading.messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFinishesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            finishes: {
                ...prev.finishes,
                [name]: value,
            }
        }));
    };

    const handleRoomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            rooms: {
                ...prev.rooms,
                [name]: type === 'checkbox' ? checked : value,
            }
        }));
    };

    const handleExportPdf = () => {
        if (!estimate || !config) return;

        const doc = new jsPDF();
        doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        doc.setFont('Amiri');

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 20;

        const writeRight = (text: string, yPos: number) => {
            doc.text(text, pageWidth - margin, yPos, { align: 'right' });
        };

        const writeWrappedRight = (text: string, yPos: number): number => {
            const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
            doc.text(lines, pageWidth - margin, yPos, { align: 'right' });
            return yPos + (lines.length * 7); // Approximate line height
        };

        const reportTitle = contextStrings.pdfTitle;
        
        doc.setFontSize(22);
        writeRight(reportTitle, y);
        y += 15;

        doc.setFontSize(14);
        writeRight('ملخص المدخلات:', y);
        y += 8;
        doc.setFontSize(11);
        const getOptionName = (category: keyof typeof config.options, key: string) => {
            return config.options[category].find(opt => opt.key === key)?.[language] || key;
        };
        const summary = [
            `نوع الوحدة: ${formData.propertyType === 'apartment' ? 'شقة' : 'فيلا'}`,
            `المساحة: ${formData.area} متر مربع`,
            `الأرضيات: ${getOptionName('flooring', formData.finishes.flooring)}`,
            `الحوائط: ${getOptionName('walls', formData.finishes.walls)}`,
            `الأسقف: ${getOptionName('ceiling', formData.finishes.ceiling)}`,
            `مستوى التشطيب: ${t.step2[formData.quality as keyof typeof t.step2]}`,
        ];
        summary.forEach(line => {
            writeRight(line, y);
            y += 7;
        });
        y += 5;
        
        doc.setFontSize(14);
        writeRight('نطاق التكلفة الإجمالية:', y);
        y += 8;
        doc.setFontSize(16);
        doc.setTextColor(217, 119, 6); // Amber 600
        writeRight(`${estimate.total_cost_min.toLocaleString('ar-EG')} - ${estimate.total_cost_max.toLocaleString('ar-EG')} جنيه مصري`, y);
        doc.setTextColor(0, 0, 0);
        y += 15;

        doc.setFontSize(14);
        writeRight('مقايسة تقديرية:', y);
        y += 8;

        autoTable(doc, {
            startY: y,
            head: [['التكلفة (جنيه مصري)', 'البند']],
            body: estimate.itemized_breakdown.map(item => [item.cost.toLocaleString('ar-EG'), item.item]),
            styles: {
                font: 'Amiri',
                fontStyle: 'normal',
                halign: 'right',
            },
            headStyles: {
                fillColor: [245, 158, 11], // amber-500
                halign: 'center',
            },
            columnStyles: {
                0: { halign: 'center' },
            }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFontSize(14);
        writeRight('ملاحظات وتوصيات الذكاء الاصطناعي:', y);
        y += 8;
        doc.setFontSize(11);
        y = writeWrappedRight(estimate.ai_notes, y);
        y += 10;
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        writeWrappedRight(t.results.disclaimer, y);

        const pdfFilename = `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}-Estimate-${formData.area}m.pdf`;
        doc.save(pdfFilename);
    };

    const handleSubmit = async () => {
        if (!config) return;
        setIsLoading(true);
        setStep(5); // Move to loading step

        const prompt = `
            ${config.prompt.replace('a finishing project', contextStrings.promptContext)}

            Property Type: ${formData.propertyType}
            Area: ${formData.area} square meters
            
            Selected Finishes:
            - Flooring: ${formData.finishes.flooring}
            - Walls: ${formData.finishes.walls}
            - Ceiling: ${formData.finishes.ceiling}
            - Electrical: ${formData.finishes.electrical}
            - Plumbing: ${formData.finishes.plumbing}

            Quality Level: ${formData.quality}
            Rooms to finish: 
            - Reception: ${formData.rooms.reception ? 'Yes' : 'No'}
            - Bedrooms: ${formData.rooms.bedrooms}
            - Bathrooms: ${formData.rooms.bathrooms}
            - Kitchen: ${formData.rooms.kitchen ? 'Yes' : 'No'}
            
            Customer's specific requests: "${formData.customRequests || 'None'}"

            Your response must be a JSON object.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: config.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            total_cost_min: { type: Type.NUMBER, description: "The minimum estimated total cost in EGP." },
                            total_cost_max: { type: Type.NUMBER, description: "The maximum estimated total cost in EGP." },
                            itemized_breakdown: {
                                type: Type.ARRAY,
                                description: "A list of each item and its estimated cost in Arabic.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        item: { type: Type.STRING, description: "Name of the cost item (e.g., Flooring, Painting) in Arabic." },
                                        cost: { type: Type.NUMBER, description: "Estimated cost for this item in EGP." }
                                    },
                                    required: ['item', 'cost']
                                }
                            },
                            ai_notes: { type: Type.STRING, description: "Helpful notes or recommendations in Arabic based on the user's request." }
                        },
                        required: ['total_cost_min', 'total_cost_max', 'itemized_breakdown', 'ai_notes']
                    },
                },
            });

            const resultJson = JSON.parse(response.text);
            setEstimate(resultJson);
            setStep(6); // Move to results step
        } catch (error) {
            console.error("AI estimation failed:", error);
            setStep(7); // Error step
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendRequest = () => {
        if (!estimate) return;
        
        const serviceTitle = `${t.requestTitle}: ${formData.propertyType} ${formData.area}m²`;
        const notes = `
            AI Cost Estimate: EGP ${estimate.total_cost_min.toLocaleString()} - ${estimate.total_cost_max.toLocaleString()}
            ---
            User Requirements:
            - Quality: ${formData.quality}
            - Rooms: ${formData.rooms.reception ? 'Reception, ' : ''}${formData.rooms.bedrooms} Bedrooms, ${formData.rooms.bathrooms} Bathrooms, ${formData.rooms.kitchen ? 'Kitchen' : ''}
            - Custom Notes: ${formData.customRequests || 'None'}
            ---
            AI Notes:
            ${estimate.ai_notes}
        `;

        navigate('/request-service', {
            state: {
                serviceTitle,
                customerNotes: notes,
                partnerId: 'admin-user',
                serviceType: serviceType
            }
        });
        onClose();
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);
    
    const chartData = useMemo(() => {
        if (!estimate) return null;
        return {
            labels: estimate.itemized_breakdown.map(item => item.item),
            datasets: [{
                data: estimate.itemized_breakdown.map(item => item.cost),
                backgroundColor: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fcd34d', '#fbbf24'],
                hoverOffset: 4,
            }]
        };
    }, [estimate]);

    if (isLoadingConfig || !config) {
        return (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const t_options = {
        title: language === 'ar' ? 'التشطيبات والمواد' : 'Finishes & Materials',
        flooring: language === 'ar' ? 'الأرضيات' : 'Flooring',
        walls: language === 'ar' ? 'الحوائط' : 'Walls',
        ceiling: language === 'ar' ? 'الأسقف' : 'Ceilings',
        electrical: language === 'ar' ? 'الكهرباء' : 'Electrical',
        plumbing: language === 'ar' ? 'السباكة' : 'Plumbing',
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
            <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-amber-500"/>
                        {t.title}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><CloseIcon className="w-6 h-6"/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="animate-fadeIn">
                             <h3 className="text-2xl font-semibold mb-6 text-center">{t.step1.title}</h3>
                             <div className="max-w-md mx-auto space-y-4">
                                <div>
                                    <label htmlFor="propertyType" className="block text-sm font-medium mb-1">{t.step1.propertyType}</label>
                                    <select id="propertyType" name="propertyType" value={formData.propertyType} onChange={handleInputChange} className={selectClasses}>
                                        <option value="apartment">{t.step1.apartment}</option>
                                        <option value="villa">{t.step1.villa}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="area" className="block text-sm font-medium mb-1">{t.step1.area}</label>
                                    <input type="number" id="area" name="area" value={formData.area} onChange={handleInputChange} className={inputClasses} />
                                </div>
                             </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <h3 className="text-2xl font-semibold mb-6 text-center">{t_options.title}</h3>
                            <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.keys(config.options).map(key => {
                                    const optionKey = key as keyof typeof config.options;
                                    return (
                                        <div key={key} className={optionKey === 'plumbing' ? 'sm:col-span-2' : ''}>
                                            <label className="block text-sm font-medium mb-1">{t_options[optionKey]}</label>
                                            <select name={key} value={formData.finishes[optionKey]} onChange={handleFinishesChange} className={selectClasses}>
                                                {config.options[optionKey].map(opt => <option key={opt.key} value={opt.key}>{opt[language]}</option>)}
                                            </select>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                         <div className="animate-fadeIn">
                            <h3 className="text-2xl font-semibold mb-6 text-center">{t.step2.title}</h3>
                            <div className="max-w-md mx-auto space-y-4">
                               <div>
                                    <label htmlFor="quality" className="block text-sm font-medium mb-1">{t.step2.quality}</label>
                                    <select id="quality" name="quality" value={formData.quality} onChange={handleInputChange} className={selectClasses}>
                                        <option value="standard">{t.step2.standard}</option>
                                        <option value="premium">{t.step2.premium}</option>
                                        <option value="luxury">{t.step2.luxury}</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="bedrooms" className="block text-sm font-medium mb-1">{t.step2.bedrooms}</label>
                                        <input type="number" id="bedrooms" name="bedrooms" value={formData.rooms.bedrooms} onChange={handleRoomChange} className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label htmlFor="bathrooms" className="block text-sm font-medium mb-1">{t.step2.bathrooms}</label>
                                        <input type="number" id="bathrooms" name="bathrooms" value={formData.rooms.bathrooms} onChange={handleRoomChange} className={inputClasses}/>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                     <label className="flex items-center gap-2"><input type="checkbox" name="reception" checked={formData.rooms.reception} onChange={handleRoomChange} className="h-4 w-4 rounded"/>{t.step2.reception}</label>
                                     <label className="flex items-center gap-2"><input type="checkbox" name="kitchen" checked={formData.rooms.kitchen} onChange={handleRoomChange} className="h-4 w-4 rounded"/>{t.step2.kitchen}</label>
                                </div>
                            </div>
                         </div>
                    )}
                    
                     {step === 4 && (
                         <div className="animate-fadeIn">
                             <h3 className="text-2xl font-semibold mb-6 text-center">{t.step3.title}</h3>
                             <div className="max-w-lg mx-auto">
                                <label htmlFor="customRequests" className="block text-sm font-medium mb-1">{t.step3.requests}</label>
                                <textarea id="customRequests" name="customRequests" value={formData.customRequests} onChange={handleInputChange} className={inputClasses} rows={6} placeholder={t.step3.placeholder}></textarea>
                             </div>
                         </div>
                     )}
                     
                    {step === 5 && (
                        <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
                             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mb-6"></div>
                             <h3 className="text-2xl font-semibold text-center">{t.loading.title}</h3>
                             <p className="text-gray-500 dark:text-gray-400 mt-2 text-center h-6 transition-opacity duration-300">
                                {t.loading.messages?.[loadingMessageIndex] || t.loading.subtitle}
                             </p>
                        </div>
                    )}

                    {step === 6 && estimate && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-semibold text-center">{t.results.title}</h3>
                                <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                                    <FileDownloadIcon className="w-5 h-5"/>
                                    {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                <div className="space-y-6">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg text-center">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t.results.total}</p>
                                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                            {estimate.total_cost_min.toLocaleString(language)} - {estimate.total_cost_max.toLocaleString(language)} EGP
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-2">{t.results.breakdown}</h4>
                                        <ul className="divide-y dark:divide-gray-700">
                                            {estimate.itemized_breakdown.map(item => (
                                                <li key={item.item} className="py-2 flex justify-between">
                                                    <span>{item.item}</span>
                                                    <span className="font-semibold">{item.cost.toLocaleString(language)} EGP</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <h4 className="font-semibold mb-2">{t.results.notes}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{estimate.ai_notes}</p>
                                    </div>
                                </div>
                                <div className="h-96">{chartData && <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' }} }} />}</div>
                            </div>
                             <p className="text-xs text-center text-gray-400 mt-8">{t.results.disclaimer}</p>
                        </div>
                    )}
                     {step === 7 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                             <h3 className="text-2xl font-semibold text-red-500">{t.error.title}</h3>
                             <p className="text-gray-500 dark:text-gray-400 mt-2">{t.error.subtitle}</p>
                        </div>
                    )}

                </div>

                 <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    {step > 1 && step < 5 ? <button onClick={prevStep} className="flex items-center gap-1 font-semibold"><ChevronLeftIcon className="w-5 h-5"/>{t.back}</button> : <div></div>}
                    
                    {step < 4 && <button onClick={nextStep} className="bg-amber-500 text-gray-900 font-bold px-6 py-2 rounded-lg flex items-center gap-1">{t.next}<ChevronRightIcon className="w-5 h-5"/></button>}
                    {step === 4 && <button onClick={handleSubmit} className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg">{t.getEstimate}</button>}
                    {step === 6 && <button onClick={handleSendRequest} className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg">{t.results.sendRequest}</button>}
                    {step === 7 && <button onClick={() => setStep(1)} className="bg-amber-500 text-gray-900 font-bold px-6 py-2 rounded-lg">{t.error.retry}</button>}
                 </div>
            </div>
        </div>
    );
};

export default AIEstimator;
