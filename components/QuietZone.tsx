import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';
import { quotes } from '../data/quotes';
import { CloseIcon } from './icons/Icons';

interface QuietZoneProps {
  onClose: () => void;
  language: Language;
}

const QuietZone: React.FC<QuietZoneProps> = ({ onClose, language }) => {
  const [currentQuote, setCurrentQuote] = useState({ quote: '', author: '' });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote({
      quote: randomQuote.quote[language],
      author: randomQuote.author[language],
    });
  }, [language]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    firstElement.focus();

    const handleTabKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };
    
    const currentModalRef = modalRef.current;
    currentModalRef?.addEventListener('keydown', handleTabKeyPress);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        currentModalRef?.removeEventListener('keydown', handleTabKeyPress);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiet-zone-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl p-12 rounded-2xl shadow-2xl animate-calm-background flex flex-col items-center text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close Quiet Zone"
        >
          <CloseIcon className="h-7 w-7" />
        </button>

        <blockquote className="relative">
          <p id="quiet-zone-title" className="text-2xl md:text-3xl font-semibold leading-normal text-white">
            "{currentQuote.quote}"
          </p>
        </blockquote>
        <cite className="mt-6 text-lg text-amber-400 font-medium tracking-wide">
          - {currentQuote.author}
        </cite>
      </div>
    </div>
  );
};

export default QuietZone;