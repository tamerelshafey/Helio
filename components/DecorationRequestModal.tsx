import React, { useRef, useEffect } from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';
import FormField, { inputClasses } from './shared/FormField';

interface DecorationRequestModalProps {
    onClose: () => void;
    serviceTitle: string;
    serviceType: string;
    requestType: 'custom' | 'similar';
    imageUrl?: string;
    language: Language;
}

const DecorationRequestModal: React.FC<DecorationRequestModalProps> = ({ onClose, serviceTitle, serviceType, requestType, imageUrl, language }) => {
    const t = translations[language].decorationRequestModal;
    const modalRef = useRef<HTMLDivElement>(null);

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
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Decoration request submitted for:", serviceTitle, { requestType, imageUrl });
        alert(t.successMessage);
        onClose();
    };

    const isWallDecor = serviceType === 'wall-decor';
    const isSimilarRequest = requestType === 'similar';
    const subtitle = isSimilarRequest ? t.similarRequestSubtitle : t.customRequestSubtitle;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                ref={modalRef}
                className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <button onClick={onClose} className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-400 hover:text-white transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">{serviceTitle}</h2>
                    <p className="text-gray-400 text-center mb-6">{subtitle}</p>
                    
                    {isSimilarRequest && imageUrl && (
                        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg flex items-center gap-4 border border-gray-600">
                            <img src={imageUrl} alt="Reference design" className="w-20 h-20 object-cover rounded-md" />
                            <p className="text-sm text-gray-300">{t.similarRequestReference}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.fullName} id="fullName">
                                <input type="text" id="fullName" className={inputClasses} required />
                            </FormField>
                            <FormField label={t.phone} id="phone">
                                <input type="tel" id="phone" className={inputClasses} required dir="ltr" />
                            </FormField>
                        </div>
                        
                        {isWallDecor && (
                             <FormField label={t.dimensions} id="dimensions">
                                <input type="text" id="dimensions" placeholder={t.dimensionsPlaceholder} className={inputClasses} />
                            </FormField>
                        )}

                        <FormField label={t.description} id="description">
                            <textarea id="description" rows={4} placeholder={t.descriptionPlaceholder} className={inputClasses} required></textarea>
                        </FormField>

                        {!isSimilarRequest && (
                            <FormField label={t.attachImage} id="imageUpload">
                                <p className="text-xs text-gray-500 mb-2">{t.attachImageHint}</p>
                                <input type="file" id="imageUpload" className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-gray-900 hover:file:bg-amber-600 cursor-pointer`} />
                            </FormField>
                        )}


                        <div className="pt-2 flex justify-end">
                            <button type="submit" className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200">
                                {t.submitButton}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DecorationRequestModal;