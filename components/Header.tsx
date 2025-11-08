


import React, { useState, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Role, Permission } from '../types';
import { translations } from '../data/translations';
import { QuoteIcon, HeartIcon, MoonIcon, SunIcon, MenuIcon, CloseIcon, GlobeAltIcon } from './icons/Icons';
import { HelioLogo } from './HelioLogo';
import { useAuth } from './auth/AuthContext';
import NotificationBell from './shared/NotificationBell';
import MobileNav from './MobileNav';
import { useLanguage } from './shared/LanguageContext';
import { useTheme } from './shared/ThemeContext';

interface HeaderProps {
  onToggleQuietZone: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleQuietZone }) => {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const { currentUser, logout, hasPermission } = useAuth();
    const { language, setLanguage: onLanguageChange } = useLanguage();
    const { theme, toggleTheme: onThemeChange } = useTheme();
    const t = translations[language];

    const dashboardPath = useMemo(() => {
        if (!currentUser) return '/login';
        if (hasPermission(Permission.VIEW_ADMIN_DASHBOARD)) {
            return '/admin';
        }
        if (hasPermission(Permission.VIEW_PARTNER_DASHBOARD)) {
            return '/dashboard';
        }
        return '/';
    }, [currentUser, hasPermission]);
    
    const dashboardText = hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? t.adminDashboard.title : t.dashboard.title;

    const navLinks = [
        { name: t.nav.home, href: "/" },
        { name: t.nav.properties, href: "/properties" },
        { name: t.nav.projects, href: "/projects" },
        { name: t.nav.finishing, href: "/finishing" },
        { name: t.nav.decorations, href: "/decorations" },
        { name: t.nav.contact, href: "/contact" },
    ];
    
    const activeLinkClass = "text-amber-500 font-semibold";
    const inactiveLinkClass = "text-gray-600 dark:text-gray-300 hover:text-amber-500";


    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-gray-200 dark:border-gray-700/50">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-amber-500">
                        <HelioLogo className="h-10 w-10" />
                        <span className="text-2xl hidden sm:block">ONLY HELIO</span>
                    </Link>
                    
                    <nav className="hidden lg:flex items-center gap-8 text-lg">
                        {navLinks.map((link) => (
                          <NavLink
                            key={link.name}
                            to={link.href}
                            end={link.href === '/'}
                            className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} transition-colors duration-200`}
                          >
                            {link.name}
                          </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 md:gap-4">
                         {currentUser && <NotificationBell />}
                        <Link to="/favorites" className="hidden lg:block text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors" aria-label="Favorites">
                            <HeartIcon className="h-6 w-6" />
                        </Link>
                        <button onClick={onToggleQuietZone} className="hidden lg:block text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors" aria-label="Quiet Zone">
                            <QuoteIcon className="h-6 w-6" />
                        </button>
                        <button
                            onClick={onThemeChange}
                            className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        </button>
                         <button
                            onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
                            className="hidden lg:flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-lg hover:border-amber-500 hover:text-amber-500 transition-colors"
                            aria-label="Toggle language"
                        >
                            {language === 'en' ? 'ع' : 'En'}
                        </button>
                        <div className="hidden lg:flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                            {currentUser ? (
                                <>
                                    <Link to={dashboardPath} className="text-gray-700 dark:text-gray-200 font-semibold hover:text-amber-500 transition-colors">{dashboardText}</Link>
                                    <button onClick={logout} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">{t.auth.logout}</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-700 dark:text-gray-200 font-semibold hover:text-amber-500 transition-colors">{t.auth.login}</Link>
                                    <Link to="/register" className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors">{t.joinAsPartner}</Link>
                                </>
                            )}
                        </div>
                        <div className="lg:hidden">
                            <button 
                                onClick={() => setIsMobileNavOpen(true)} 
                                className="text-gray-600 dark:text-gray-300"
                                aria-label="Open menu"
                                aria-controls="mobile-nav-menu"
                            >
                                <MenuIcon className="h-7 w-7" />
                            </button>
                        </div>
                    </div>
                </div>

                <MobileNav
                    id="mobile-nav-menu"
                    isOpen={isMobileNavOpen}
                    onClose={() => setIsMobileNavOpen(false)}
                    onToggleQuietZone={onToggleQuietZone}
                    currentUser={currentUser}
                    dashboardPath={dashboardPath}
                    logout={logout}
                    hasPermission={hasPermission}
                />
            </div>
        </header>
    );
};

export default Header;