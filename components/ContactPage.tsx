import React from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';

const inputClasses = "w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-400";

interface ContactPageProps {
  language: Language;
}

const ContactPage: React.FC<ContactPageProps> = ({ language }) => {
    const t = translations[language].contactPage;

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t.title}</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-800 p-8 rounded-lg border border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.formTitle}</h2>
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="sr-only">{t.namePlaceholder}</label>
                                <input type="text" id="name" placeholder={t.namePlaceholder} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="phone" className="sr-only">{t.phonePlaceholder}</label>
                                <input type="tel" id="phone" placeholder={t.phonePlaceholder} className={inputClasses} required dir="ltr" />
                            </div>
                            <div>
                                <label htmlFor="contactTime" className="sr-only">{t.contactTimeLabel}</label>
                                <select id="contactTime" className={`${inputClasses} text-gray-400`} required defaultValue="">
                                    <option value="" disabled>{t.contactTimeDefault}</option>
                                    <option value="morning" className="text-white">{t.contactTimeMorning}</option>
                                    <option value="afternoon" className="text-white">{t.contactTimeAfternoon}</option>
                                    <option value="evening" className="text-white">{t.contactTimeEvening}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">{t.messagePlaceholder}</label>
                                <textarea id="message" rows={5} placeholder={t.messagePlaceholder} className={inputClasses} required></textarea>
                            </div>
                            <div>
                                <button type="submit" className="w-full bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200">
                                    {t.sendButton}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.contactInfoTitle}</h2>
                         <div className="flex items-start gap-4">
                            <span className="text-amber-500 mt-1">📍</span>
                            <div>
                                <h3 className="font-semibold text-white">{t.addressTitle}</h3>
                                <p className="text-gray-400">{t.addressText}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <span className="text-amber-500 mt-1">📞</span>
                            <div>
                                <h3 className="font-semibold text-white">{t.phoneTitle}</h3>
                                <p className="text-gray-400" dir="ltr">+20 123 456 7890</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-amber-500 mt-1">✉️</span>
                            <div>
                                <h3 className="font-semibold text-white">{t.emailTitle}</h3>
                                <p className="text-gray-400">info@onlyhelio.com</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <span className="text-amber-500 mt-1">⏰</span>
                            <div>
                                <h3 className="font-semibold text-white">{t.hoursTitle}</h3>
                                <p className="text-gray-400">{t.hoursText}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;