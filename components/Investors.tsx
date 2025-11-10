
import React from 'react';
import { useLanguage } from './shared/LanguageContext';

// Placeholder logos - replace with actual investor logos
const placeholderLogos = [
  'https://logo.clearbit.com/goldmansachs.com',
  'https://logo.clearbit.com/morganstanley.com',
  'https://logo.clearbit.com/blackrock.com',
  'https://logo.clearbit.com/jpmorganchase.com',
  'https://logo.clearbit.com/citigroup.com',
  'https://logo.clearbit.com/bankofamerica.com',
];

const Investors: React.FC = () => {
    const { language } = useLanguage();
    const sectionTitle = language === 'ar' ? 'شركاؤنا المستثمرون' : 'Our Investors';
    const sectionSubtitle = language === 'ar' ? 'نحن مدعومون من قبل رواد الصناعة الذين يثقون في رؤيتنا.' : 'We are backed by industry leaders who trust our vision.';

    return (
        <section className="py-20 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{sectionTitle}</h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{sectionSubtitle}</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
                    {placeholderLogos.map((logo, index) => (
                        <div key={index} className="flex-shrink-0">
                             <img
                                src={logo}
                                alt={`Investor logo ${index + 1}`}
                                className="h-8 sm:h-10 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Investors;
