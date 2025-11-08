
import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, LinkedInIcon, FacebookIcon, InstagramIcon } from './icons/Icons';
import { translations } from '../data/translations';
import { HelioLogo } from './HelioLogo';
import { useApiQuery } from './shared/useApiQuery';
import { getContent } from '../api/content';
import { useLanguage } from './shared/LanguageContext';

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <li>
        <Link to={to} className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors duration-200">{children}</Link>
    </li>
);

const SocialLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
     <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors duration-200">{children}</a>
);

const Footer: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const { data: siteContent, isLoading } = useApiQuery('siteContent', getContent);

    if (isLoading || !siteContent) {
        return <footer className="bg-gray-200 dark:bg-gray-900 pt-16 h-64 animate-pulse"></footer>;
    }

    const content = siteContent.footer;
    const contentLang = content[language];

    return (
        <footer className="bg-gray-200 dark:bg-gray-900 pt-16 pb-12">
            <div className="container mx-auto px-6">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* About */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-amber-500 mb-4">
                          <HelioLogo className="h-10 w-10" />
                          <span className="text-2xl">ONLY HELIO</span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                           {contentLang.description}
                        </p>
                    </div>
                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t.footer.quickLinks}</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/">{t.nav.home}</FooterLink>
                            <FooterLink to="/properties">{t.nav.properties}</FooterLink>
                            <FooterLink to="/finishing">{t.nav.finishing}</FooterLink>
                            <FooterLink to="/decorations">{t.nav.decorations}</FooterLink>
                            <FooterLink to="/contact">{t.nav.contact}</FooterLink>
                            <FooterLink to="/privacy-policy">{t.nav.privacyPolicy}</FooterLink>
                            <FooterLink to="/terms-of-use">{t.nav.termsOfUse}</FooterLink>
                        </ul>
                    </div>
                    {/* For Partners */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t.footer.forPartners}</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/add-property">{t.addProperty}</FooterLink>
                            <FooterLink to="/register">{t.joinAsPartner}</FooterLink>
                            <FooterLink to="/login">{t.auth.login}</FooterLink>
                        </ul>
                    </div>
                    {/* Contact Info */}
                    <div>
                         <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t.footer.contactUs}</h3>
                        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-3">
                                <span>📍</span>
                                <span>{contentLang.address}</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <span>📞</span>
                                <span dir="ltr">{content.phone}</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <span>✉️</span>
                                <span>{content.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-500 dark:text-gray-500">
                            &copy; {new Date().getFullYear()} ONLY HELIO. {t.footer.rightsReserved}
                        </p>
                        <a href={`mailto:${content.email}?subject=Beta Feedback`} className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors duration-200">
                            {t.footer.sendFeedback}
                        </a>
                    </div>
                    <div className={`flex space-x-6 ${language === 'ar' ? 'space-x-reverse' : ''} mt-4 sm:mt-0`}>
                       <SocialLink href={content.social.facebook}><FacebookIcon className="h-6 w-6" /></SocialLink>
                       <SocialLink href={content.social.twitter}><TwitterIcon className="h-6 w-6" /></SocialLink>
                       <SocialLink href={content.social.instagram}><InstagramIcon className="h-6 w-6" /></SocialLink>
                       <SocialLink href={content.social.linkedin}><LinkedInIcon className="h-6 w-6" /></SocialLink>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
