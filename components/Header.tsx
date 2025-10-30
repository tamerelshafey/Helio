import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { Language, Theme } from '../types';
import { translations } from '../data/translations';
import { QuoteIcon, HeartIcon, MoonIcon, SunIcon } from './icons/Icons';
import { HelioLogo } from './HelioLogo';
import { useAuth } from './auth/AuthContext';

interface HeaderProps {
  onToggleQuietZone: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleQuietZone, language, onLanguageChange, theme, onThemeChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = translations[language];
  const { currentUser, logout } = useAuth();

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.properties, href: "/properties" },
    { name: t.nav.finishing, href: "/finishing" },
    { name: t.nav.decorations, href: "/decorations" },
    { name: t.nav.favorites, href: "/favorites" },
    { name: t.nav.contact, href: "/contact" },
  ];

  const activeLinkClass = "text-amber-500";
  const inactiveLinkClass = "text-gray-600 dark:text-gray-300 hover:text-amber-500";
  
  const dashboardPath = currentUser?.type === 'admin' ? '/admin' : '/dashboard';
  const dashboardText = currentUser?.type === 'admin' ? t.adminDashboard.title : t.dashboard.title;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-amber-500">
              <HelioLogo className="h-8 w-8 text-amber-500" />
              <span className="hidden sm:inline">ONLY HELIO</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.name} 
                  to={link.href} 
                  end={link.href === '/'}
                  className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} transition-colors duration-200 flex items-center gap-2`}
                >
                  {link.href === '/favorites' && <HeartIcon className="h-4 w-4" />}
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <button
                onClick={() => onThemeChange()}
                className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
              </button>
              <button 
                onClick={() => onLanguageChange('en')}
                className={`transition-colors ${language === 'en' ? "text-amber-500 font-semibold" : "text-gray-500 dark:text-gray-400 hover:text-amber-500"}`}
              >
                EN
              </button>
              <span className="text-gray-400 dark:text-gray-500">|</span>
              <button 
                onClick={() => onLanguageChange('ar')}
                className={`transition-colors ${language === 'ar' ? "text-amber-500 font-semibold" : "text-gray-500 dark:text-gray-400 hover:text-amber-500"}`}
              >
                AR
              </button>
            </div>
             <button
              onClick={onToggleQuietZone}
              className="hidden sm:block text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
              aria-label="Toggle Quiet Zone"
            >
              <QuoteIcon className="h-6 w-6" />
            </button>
            {currentUser ? (
              <>
                 <Link
                  to={dashboardPath}
                  className="hidden sm:block text-amber-500 border border-amber-500 font-semibold px-5 py-2 rounded-lg hover:bg-amber-500 hover:text-gray-900 transition-colors duration-200"
                >
                  {dashboardText}
                </Link>
                <button 
                  onClick={logout}
                  className="bg-amber-500 text-gray-900 font-semibold px-5 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                >
                  {t.auth.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/add-property"
                  className="bg-amber-500 text-gray-900 font-semibold px-5 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                >
                  {t.addProperty}
                </Link>
                <Link 
                  to="/login"
                  className="hidden sm:block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-5 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {t.auth.login}
                </Link>
              </>
            )}

            <button 
              className="lg:hidden text-gray-600 dark:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden mt-4 border-t border-gray-200 dark:border-gray-700/50 pt-4 animate-fadeIn">
            <nav className="flex flex-col items-start gap-2">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.name} 
                  to={link.href} 
                  end={link.href === '/'}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => `w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${isActive ? activeLinkClass + ' bg-gray-100 dark:bg-gray-800' : inactiveLinkClass} transition-colors duration-200 flex items-center gap-3`}
                >
                   {link.href === '/favorites' && <HeartIcon className="h-5 w-5" />}
                  <span>{link.name}</span>
                </NavLink>
              ))}
              {currentUser ? (
                <Link to={dashboardPath} onClick={() => setIsMenuOpen(false)} className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${inactiveLinkClass}`}>{dashboardText}</Link>
              ) : (
                <>
                  <Link to="/add-property" onClick={() => setIsMenuOpen(false)} className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${inactiveLinkClass}`}>{t.addProperty}</Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${inactiveLinkClass}`}>{t.auth.login}</Link>
                </>
              )}
            </nav>
            <div className="border-t border-gray-200 dark:border-gray-700/50 mt-4 pt-4 flex flex-col items-start gap-3">
               <button
                  onClick={() => { onToggleQuietZone(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-md text-gray-600 dark:text-gray-300 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <QuoteIcon className="h-6 w-6" />
                  <span>{language === 'ar' ? 'المنطقة الهادئة' : 'Quiet Zone'}</span>
                </button>
                 <div className="flex items-center gap-2 text-sm p-3">
                    <button
                        onClick={() => { onThemeChange(); setIsMenuOpen(false); }}
                        className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm p-3">
                  <button 
                    onClick={() => { onLanguageChange('en'); setIsMenuOpen(false); }}
                    className={`transition-colors ${language === 'en' ? "text-amber-500 font-semibold" : "text-gray-500 dark:text-gray-400 hover:text-amber-500"}`}
                  >
                    EN
                  </button>
                  <span className="text-gray-400 dark:text-gray-500">|</span>
                  <button 
                    onClick={() => { onLanguageChange('ar'); setIsMenuOpen(false); }}
                    className={`transition-colors ${language === 'ar' ? "text-amber-500 font-semibold" : "text-gray-500 dark:text-gray-400 hover:text-amber-500"}`}
                  >
                    AR
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;