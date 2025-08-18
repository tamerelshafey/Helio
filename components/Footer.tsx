import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, LinkedInIcon, FacebookIcon, InstagramIcon } from './icons/Icons';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface FooterProps {
    language: Language;
}

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <li>
        <Link to={to} className="text-gray-400 hover:text-amber-500 transition-colors duration-200">{children}</Link>
    </li>
);

const SocialLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
     <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white bg-gray-700 hover:bg-amber-500 p-2 rounded-full transition-colors duration-200">{children}</a>
);

const Footer: React.FC<FooterProps> = ({ language }) => {
    const t = translations[language];
    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2">
                        <Link to="/" className="text-3xl font-bold text-amber-500 mb-4 block">
                          ONLY HELIO
                        </Link>
                        <p className="text-gray-400 max-w-md">
                           {t.footer.description}
                        </p>
                        <div className={`flex space-x-4 mt-6 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                           <SocialLink href="#"><FacebookIcon className="h-5 w-5" /></SocialLink>
                           <SocialLink href="#"><TwitterIcon className="h-5 w-5" /></SocialLink>
                           <SocialLink href="#"><InstagramIcon className="h-5 w-5" /></SocialLink>
                           <SocialLink href="#"><LinkedInIcon className="h-5 w-5" /></SocialLink>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">{t.footer.quickLinks}</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/">{t.nav.home}</FooterLink>
                            <FooterLink to="/properties">{t.nav.properties}</FooterLink>
                            <FooterLink to="/finishing">{t.nav.finishing}</FooterLink>
                            <FooterLink to="/decorations">{t.nav.decorations}</FooterLink>
                            <FooterLink to="/contact">{t.nav.contact}</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">{t.footer.contactUs}</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span>📍</span>
                                <span>{t.footer.address}</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <span>📞</span>
                                <span dir="ltr">+20 123 456 7890</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <span>✉️</span>
                                <span>info@onlyhelio.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-700 text-center">
                    <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} ONLY HELIO. {t.footer.rightsReserved}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;