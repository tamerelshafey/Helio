import React, { useState, useEffect } from 'react';
import type { Language } from '../types';
import { quotes } from '../data/quotes';
import { translations } from '../data/translations';

interface TestimonialProps {
  language: Language;
}

const Testimonial: React.FC<TestimonialProps> = ({ language }) => {
  const [currentQuote, setCurrentQuote] = useState({ quote: '', author: '' });
  const t = translations[language].wisdomQuotes;

  useEffect(() => {
    // Select a random quote when the component mounts or language changes
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote({
      quote: randomQuote.quote[language],
      author: randomQuote.author[language],
    });
  }, [language]);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t.title}
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 mb-12">
          {t.description}
        </p>
        <div className="relative max-w-4xl mx-auto bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 p-8 md:p-12 rounded-2xl shadow-xl">
          <span className="absolute top-4 left-6 text-7xl font-serif text-amber-500/20 select-none">“</span>
          <blockquote className="relative">
            <p className="text-2xl md:text-3xl font-medium leading-normal text-gray-800 dark:text-white">
              {currentQuote.quote}
            </p>
          </blockquote>
          <cite className="mt-6 block text-lg text-amber-500 dark:text-amber-400 font-semibold tracking-wide">
            - {currentQuote.author}
          </cite>
          <span className="absolute bottom-4 right-6 text-7xl font-serif text-amber-500/20 select-none">”</span>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;