import React from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface TestimonialProps {
  language: Language;
}

const Testimonial: React.FC<TestimonialProps> = ({ language }) => {
    const t = translations[language].testimonial;
    return (
        <section className="py-20 md:py-32 bg-gray-800">
            <div className="container mx-auto px-6 text-center">
                <blockquote className="max-w-4xl mx-auto">
                    <p className="text-2xl md:text-4xl font-medium text-white mb-8">
                        “{t.quote}”
                    </p>
                    <footer className="flex items-center justify-center space-x-4">
                        <img 
                            src="https://randomuser.me/api/portraits/men/32.jpg" 
                            alt={t.name}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <cite className="font-semibold text-white not-italic">{t.name}</cite>
                            <p className="text-gray-400">{t.title}</p>
                        </div>
                    </footer>
                </blockquote>
            </div>
        </section>
    );
};

export default Testimonial;