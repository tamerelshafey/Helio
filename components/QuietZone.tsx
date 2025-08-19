import React, { useState, useEffect } from 'react';
import type { Language } from '../App';
import { quotes } from '../data/quotes';
import { CloseIcon } from './icons/Icons';

interface QuietZoneProps {
  onClose: () => void;
  language: Language;
}

const QuietZone: React.FC<QuietZoneProps> = ({ onClose, language }) => {
  const [currentQuote, setCurrentQuote] = useState({ quote: '', author: '' });

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote({
      quote: randomQuote.quote[language],
      author: randomQuote.author[language],
    });
  }, [language]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-white animate-fadeIn animate-calm-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiet-zone-title"
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
        aria-label="Close Quiet Zone"
      >
        <CloseIcon className="h-8 w-8" />
      </button>

      <div className="text-center max-w-4xl flex flex-col items-center">
        <blockquote className="relative">
          <p id="quiet-zone-title" className="text-2xl md:text-4xl lg:text-5xl font-semibold leading-tight md:leading-tight lg:leading-tight">
            "{currentQuote.quote}"
          </p>
        </blockquote>
        <cite className="mt-6 text-lg md:text-xl text-amber-400 font-medium tracking-wide">
          - {currentQuote.author}
        </cite>
      </div>

      <div className="absolute bottom-8 text-center">
         <button 
            onClick={onClose}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/20 transition-colors duration-200"
        >
            {language === 'ar' ? 'الخروج من الوضع الهادئ' : 'Exit Quiet Zone'}
        </button>
      </div>
    </div>
  );
};

export default QuietZone;