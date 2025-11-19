
import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, LinkedInIcon, FacebookIcon, InstagramIcon, WhatsAppIcon, PhoneIcon } from '../ui/Icons';
import { SiteLogo } from './SiteLogo';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useLanguage } from './LanguageContext';

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <li>
        <Link to={to} className="text-gray-500 hover:text-amber-500 transition-colors duration-200">
            {children}
        </Link>
    </li>
);

const SocialLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-amber-500 transition-colors duration-200"
    >
        {children}
    </a>
);

const Footer: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading } = useSiteContent();

    if (isLoading || !siteContent) {
        return <footer className="bg-gray-200 pt-16 h-64 animate-pulse"></footer>;
    }

    const content = siteContent.footer;
    const contentLang = content[language];

    const phoneLink = content.isWhatsAppOnly 
        ? `https://wa.me/${content.phone.replace(/\D/g, '')}` 
        : `tel:${content.phone.replace(/\s/g, '')}`;

    return (
        <footer className="bg-gray-200 pt-16 pb-12">
            <div className="container mx-auto px-6">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* About */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-amber-500 mb-4">
                            <SiteLogo className="h-10 w-10" />
                            <span className="text-2xl">ONLY HELIO</span>
                        </Link>
                        <p className="text-gray-600 max-w-md">{contentLang.description}</p>
                    </div>
                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900">{t.footer.quickLinks}</h3>
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
                        <h3 className="font-bold text-lg mb-4 text-gray-900">{t.footer.forPartners}</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/add-property">{t.addProperty}</FooterLink>
                            <FooterLink to="/register">{t.joinAsPartner}</FooterLink>
                            <FooterLink to="/login">{t.auth.login}</FooterLink>
                        </ul>
                    </div>
                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900">{t.footer.contactUs}</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span>📍</span>
                                <span>{contentLang.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                {content.isWhatsAppOnly ? <WhatsAppIcon className="w-5 h-5 text-green-600" /> : <PhoneIcon className="w-5 h-5 text-amber-500" />}
                                <a href={phoneLink} target={content.isWhatsAppOnly ? '_blank' : undefined} rel={content.isWhatsAppOnly ? "noopener noreferrer" : undefined} className="hover:text-amber-500 transition-colors">
                                    <span dir="ltr">{content.phone}</span>
                                    {content.isWhatsAppOnly && <span className="text-xs ml-1 block text-gray-500">{language === 'ar' ? '(واتساب)' : '(WhatsApp)'}</span>}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span>✉️</span>
                                <span>{content.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-500">
                            {content.copyright[language]}
                        </p>
                        <a
                            href={`mailto:${content.email}?subject=Feedback`}
                            className="text-gray-500 hover:text-amber-500 transition-colors duration-200"
                        >
                            {content.feedbackText[language]}
                        </a>
                    </div>
                    <div className={`flex space-x-6 ${language === 'ar' ? 'space-x-reverse' : ''} mt-4 sm:mt-0`}>
                        <SocialLink href={content.social.facebook}>
                            <FacebookIcon className="h-6 w-6" />
                        </SocialLink>
                        <SocialLink href={content.social.twitter}>
                            <TwitterIcon className="h-6 w-6" />
                        </SocialLink>
                        <SocialLink href={content.social.instagram}>
                            <InstagramIcon className="h-6 w-6" />
                        </SocialLink>
                        <SocialLink href={content.social.linkedin}>
                            <LinkedInIcon className="h-6 w-6" />
                        </SocialLink>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;