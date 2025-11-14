import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Language, Property } from '../../types';
import { CloseIcon, SparklesIcon } from '../ui/Icons';
import { useLanguage } from '../shared/LanguageContext';

interface AIContentHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newText: string) => void;
  originalText: string;
  propertyData: Partial<Property>;
  context: {
    field: 'description.ar' | 'description.en';
  };
}

const AIContentHelper: React.FC<Omit<AIContentHelperProps, 'language'>> = ({
  isOpen,
  onClose,
  onApply,
  originalText,
  propertyData,
  context,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setGeneratedText('');
      setCurrentAction(null);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const callGemini = async (prompt: string, action: string) => {
    setIsLoading(true);
    setGeneratedText('');
    setCurrentAction(action);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setGeneratedText(response.text.trim());
    } catch (error) {
      console.error(`${action} failed:`, error);
      setGeneratedText(`Error: Could not generate content. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromData = () => {
    const targetLang = context.field === 'description.ar' ? 'Arabic' : 'English';
    const dataForPrompt = {
        Type: propertyData.type?.en,
        Status: propertyData.status?.en,
        Area: `${propertyData.area} m²`,
        Price: propertyData.priceNumeric,
        Bedrooms: propertyData.beds,
        Bathrooms: propertyData.baths,
        Floor: propertyData.floor,
        Finishing: propertyData.finishingStatus?.en,
        Amenities: propertyData.amenities?.en?.join(', '),
        Location: propertyData.address?.en,
        'In Compound': propertyData.isInCompound ? 'Yes' : 'No',
    };

    const prompt = `You are a professional real estate copywriter. Based on the following property data, write a compelling and attractive property description in ${targetLang}. Make it sound luxurious and highlight the key features. The description should be 2-3 paragraphs.\n\nProperty Data:\n${JSON.stringify(dataForPrompt, null, 2)}\n\nWrite the description now.`;
    callGemini(prompt, 'generate');
  };
  
  const handleImproveWriting = () => {
    if (!originalText.trim()) return;
    const targetLang = context.field === 'description.ar' ? 'Arabic' : 'English';
    const prompt = `You are a professional copy editor. Improve the following real estate description to make it more appealing, professional, and persuasive. Keep the language in ${targetLang}. \n\nOriginal Text:\n"${originalText}"\n\nImproved Text:`;
    callGemini(prompt, 'improve');
  };

  const handleTranslate = () => {
    if (!originalText.trim()) return;
    const targetLang = context.field === 'description.ar' ? 'English' : 'Arabic';
    const prompt = `Translate the following text to ${targetLang}. Do not add any extra commentary or introductory phrases, just provide the translation.\n\nText:\n"${originalText}"`;
    callGemini(prompt, 'translate');
  };
  
  const handleApply = () => {
    if (generatedText && !generatedText.startsWith('Error:')) {
      onApply(generatedText);
    }
    onClose();
  };

  const actionButtons = [
    { id: 'generate', label: language === 'ar' ? 'إنشاء من البيانات' : 'Generate from Data', action: handleGenerateFromData, disabled: false },
    { id: 'improve', label: language === 'ar' ? 'تحسين النص' : 'Improve Writing', action: handleImproveWriting, disabled: !originalText.trim() },
    { id: 'translate', label: language === 'ar' ? 'ترجمة' : 'Translate', action: handleTranslate, disabled: !originalText.trim() },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose} role="dialog">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-amber-500" />
            {language === 'ar' ? 'مساعد المحتوى الذكي' : 'AI Content Assistant'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Left Column: Actions & Original Text */}
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="font-semibold mb-3">{language === 'ar' ? 'اختر إجراءً' : 'Choose an action'}</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                {actionButtons.map(btn => (
                  <button key={btn.id} onClick={btn.action} disabled={btn.disabled || isLoading} className="flex-1 px-4 py-2 text-sm font-semibold rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{language === 'ar' ? 'النص الأصلي' : 'Original Text'}</h4>
              <textarea value={originalText} readOnly className="w-full h-64 p-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
            </div>
          </div>
          
          {/* Right Column: AI Suggestion */}
          <div>
            <h4 className="font-semibold mb-2">{language === 'ar' ? 'اقتراح الذكاء الاصطناعي' : 'AI Suggestion'}</h4>
            <div className="relative w-full h-full min-h-[20rem] p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-white/50 dark:bg-gray-800/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentAction === 'generate' ? (language === 'ar' ? 'جاري الإنشاء...' : 'Generating...') : 
                     currentAction === 'improve' ? (language === 'ar' ? 'جاري التحسين...' : 'Improving...') : 
                     (language === 'ar' ? 'جاري الترجمة...' : 'Translating...')}
                  </p>
                </div>
              )}
              <textarea value={generatedText} readOnly className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-sm" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold">{t.adminShared.cancel}</button>
          <button onClick={handleApply} disabled={!generatedText || isLoading || generatedText.startsWith('Error:')} className="px-6 py-2 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50">
            {language === 'ar' ? 'تطبيق النص' : 'Apply Text'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIContentHelper;