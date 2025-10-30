import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../types';
import { translations } from '../data/translations';

interface AboutCityProps {
  language: Language;
}

const AboutCity: React.FC<AboutCityProps> = ({ language }) => {
    const t = translations[language].aboutCity;
    const images = [
        {
            src: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop",
            alt: t.mapAlt
        },
        {
            src: "https://images.unsplash.com/photo-1595995449553-15104a37b3f9?q=80&w=2070&auto=format&fit=crop",
            alt: t.gateAlt
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const timeoutRef = useRef<number | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = window.setTimeout(
            () => setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1)),
            5000 // Change slide every 5 seconds
        );
        return () => {
            resetTimeout();
        };
    }, [currentSlide, images.length]);
    
    const goToSlide = (slideIndex: number) => {
        setCurrentSlide(slideIndex);
    }

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                           {t.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                           {t.description}
                        </p>
                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time1Value}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.time1Desc}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time2Value}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.time2Desc}</p>
                            </div>
                             <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time3Value}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.time3Desc}</p>
                            </div>
                             <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time4Value}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.time4Desc}</p>
                            </div>
                        </div>
                    </div>
                     <div className="relative w-full h-[500px] rounded-2xl shadow-xl overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                             {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-amber-500' : 'bg-gray-400/50 hover:bg-gray-400'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutCity;