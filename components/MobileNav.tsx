


import React, { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  QuoteIcon, HeartIcon, MoonIcon, SunIcon, HomeIcon, BuildingIcon, 
  CubeIcon, WrenchScrewdriverIcon, SparklesIcon, PhoneIcon, CloseIcon, UserPlusIcon, CogIcon, GlobeAltIcon
} from './icons/Icons';
import type { Partner } from '../types';
import { Permission } from '../types';
import { translations } from '../data/translations';
import { HelioLogo } from './HelioLogo';
import { useLanguage } from './shared/LanguageContext';
import { useTheme } from './shared/ThemeContext';

interface MobileNavProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onToggleQuietZone: () => void;
  currentUser: Partner | null;
  dashboardPath: string;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const NavItem: React.FC<{ to: string; icon: React.FC<{className?: string}>; label: string; onClick: () => void; isEnd?: boolean }> = ({ to, icon: Icon, label, onClick, isEnd = false }) => {
    const baseClasses = "flex items-center w-full p-3 rounded-lg transition-colors duration-200 text-lg";
    const activeClasses = "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 font-semibold";
    const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";
    
    return (
        <li>
            <NavLink
                to={to}
                end={isEnd}
                onClick={onClick}
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <Icon className="w-6 h-6 flex-shrink-0"/>
                <span className="mx-4">{label}</span>
            </NavLink>
        </li>
    );
};


const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, ...props }) => {
    const navRef = useRef<HTMLDivElement>(null);
    const { 
      id, onToggleQuietZone, currentUser, dashboardPath, logout, hasPermission 
    } = props;
    const { language, setLanguage: onLanguageChange } = useLanguage();
    const { theme, toggleTheme: onThemeChange } = useTheme();
    const isRTL = language === 'ar';
    
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        const firstFocusableElement = navRef.current?.querySelector('button');
        firstFocusableElement?.focus();

        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);
    
    const t = translations[language];
    const navLinks = [
        { name: t.nav.home, href: "/", icon: HomeIcon, isEnd: true },
        { name: t.nav.properties, href: "/properties", icon: BuildingIcon },
        { name: t.nav.projects, href: "/projects", icon: CubeIcon },
        { name: t.nav.finishing, href: "/finishing", icon: WrenchScrewdriverIcon },
        { name: t.nav.decorations, href: "/decorations", icon: SparklesIcon },
        { name: t.nav.contact, href: "/contact", icon: PhoneIcon },
    ];
    const dashboardText = hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? t.adminDashboard.title : t.dashboard.title;

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                id={id}
                ref={navRef}
                className={`fixed top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-80 flex flex-col bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out z-50 lg:hidden
                    ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`
                }
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-nav-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                     <Link to="/" onClick={onClose} id="mobile-nav-title" className="flex items-center gap-2 font-bold text-amber-500">
                        <HelioLogo className="h-8 w-8" />
                        <span className="text-xl">ONLY HELIO</span>
                    </Link>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                {/* Main Content */}
                <div className="flex-grow overflow-y-auto p-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 space-y-3">
                        <button onClick={() => { onLanguageChange(language === 'en' ? 'ar' : 'en'); }} className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-200 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-3">
                                <GlobeAltIcon className="w-5 h-5" />
                                <span className="font-semibold">{language === 'ar' ? 'اللغة' : 'Language'}</span>
                            </div>
                            <span className="font-semibold">{language === 'en' ? 'العربية' : 'English'}</span>
                        </button>
                        <button onClick={onThemeChange} className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-200 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-3">
                                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                                <span className="font-semibold">{language === 'ar' ? 'الوضع' : 'Theme'}</span>
                            </div>
                            <span className="font-semibold">{theme === 'light' ? (language === 'ar' ? 'فاتح' : 'Light') : (language === 'ar' ? 'داكن' : 'Dark')}</span>
                        </button>
                    </div>

                    <nav>
                        <ul className="space-y-1">
                            {navLinks.map(link => <NavItem key={link.href} to={link.href} icon={link.icon} label={link.name} onClick={onClose} isEnd={link.isEnd} />)}
                        </ul>
                    </nav>

                    <hr className="my-4 border-gray-200 dark:border-gray-700" />

                    <ul className="space-y-1">
                       <NavItem to="/favorites" icon={HeartIcon} label={t.nav.favorites} onClick={onClose} />
                       <li>
                           <button onClick={() => { onToggleQuietZone(); onClose(); }} className="flex items-center w-full p-3 rounded-lg transition-colors duration-200 text-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                               <QuoteIcon className="w-6 h-6"/>
                               <span className="mx-4">{t.wisdomQuotes.title}</span>
                           </button>
                       </li>
                    </ul>
                    
                    <hr className="my-4 border-gray-200 dark:border-gray-700" />
                    
                    {currentUser ? (
                        <ul className="space-y-1">
                            {(hasPermission(Permission.VIEW_ADMIN_DASHBOARD) || hasPermission(Permission.VIEW_PARTNER_DASHBOARD)) && (
                                <NavItem to={dashboardPath} icon={CogIcon} label={dashboardText} onClick={onClose} />
                            )}
                            <li>
                                <button onClick={() => { logout(); onClose(); }} className="w-full flex items-center p-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-lg">
                                    <CloseIcon className="w-6 h-6 transform rotate-45"/>
                                    <span className="mx-4">{t.auth.logout}</span>
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <div className="space-y-2">
                             <Link to="/login" onClick={onClose} className="w-full flex items-center justify-center p-3 rounded-lg bg-amber-500 text-gray-900 font-bold text-lg hover:bg-amber-600 transition-colors">
                                {t.auth.login}
                            </Link>
                             <Link to="/register" onClick={onClose} className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                {t.joinAsPartner}
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default MobileNav;