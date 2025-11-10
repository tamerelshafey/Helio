import React from 'react';
import { useLanguage } from './shared/LanguageContext';
import { QuoteIcon } from './icons/Icons';

const testimonials = [
    {
        quote: {
            en: 'Only Helio helped me find the perfect villa for my family. The process was smooth and professional from start to finish!',
            ar: 'ساعدني أونلي هيليو في العثور على الفيلا المثالية لعائلتي. كانت العملية سلسة واحترافية من البداية إلى النهاية!',
        },
        author: {
            en: 'Ahmed Hassan',
            ar: 'أحمد حسن',
        },
        location: {
            en: 'New Heliopolis Resident',
            ar: 'من سكان هليوبوليس الجديدة',
        },
    },
    {
        quote: {
            en: 'The finishing services are top-notch. They transformed my apartment into a dream home. Highly recommended.',
            ar: 'خدمات التشطيب على أعلى مستوى. لقد حولوا شقتي إلى منزل الأحلام. أوصي بهم بشدة.',
        },
        author: {
            en: 'Fatima Ali',
            ar: 'فاطمة علي',
        },
        location: {
            en: 'New Cairo',
            ar: 'القاهرة الجديدة',
        },
    },
];

const Testimonial: React.FC = () => {
    const { language } = useLanguage();
    const sectionTitle = language === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say';
    const sectionSubtitle = language === 'ar' ? 'قصص حقيقية من أصحاب المنازل والشركاء الراضين.' : 'Real stories from satisfied homeowners and partners.';

    return (
        <section className="py-20 bg-white dark:bg-gray-900 subtle-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{sectionTitle}</h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{sectionSubtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                            <QuoteIcon className="w-12 h-12 text-amber-400 mb-4" />
                            <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic mb-6">
                                "{testimonial.quote[language]}"
                            </blockquote>
                            <footer className="font-semibold">
                                <p className="text-gray-900 dark:text-white">{testimonial.author[language]}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.location[language]}</p>
                            </footer>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
