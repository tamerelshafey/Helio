import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { QuoteIcon, HeartIcon, MoonIcon, SunIcon } from './icons/Icons';
import type { Language, Theme, Partner } from '../types';
import { Role, Permission } from '../types';
import { translations } from '../data/translations';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: () => void;
  onToggleQuietZone: () => void;
  currentUser: Partner | null;
  dashboardPath: string;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, language, onLanguageChange, theme, onThemeChange, onToggleQuietZone, currentUser, dashboardPath, logout, hasPermission }) => {
  if (!isOpen) return null;

  const t = translations[language];
  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.properties, href: "/properties" },
    { name: t.nav.projects, href: "/projects" },
    { name: t.nav.finishing, href: "/finishing" },
    { name: t.nav.decorations, href: "/decorations" },
    { name: t.nav.favorites, href: "/favorites" },
    { name: t.nav.contact, href: "/contact" },
  ];
  const activeLinkClass = "text-amber-500";
  const inactiveLinkClass = "text-gray-600 dark:text-gray-300 hover:text-amber-500";
  const dashboardText = currentUser?.role === Role.SUPER_ADMIN ? t.adminDashboard.title : t.dashboard.title;


  return (
    <div className="lg:hidden mt-4 border-t border-gray-200 dark:border-gray-700/50 pt-4 animate-fadeIn">
      <nav className="flex flex-col items-start gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end={link.href === '/'}
            onClick={onClose}
            className={({ isActive }) => `w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${isActive ? activeLinkClass + ' bg-gray-100 dark:bg-gray-800' : inactiveLinkClass} transition-colors duration-200 flex items-center gap-3`}
          >
             {link.href === '/favorites' && <HeartIcon className="h-5 w-5" />}
            <span>{link.name}</span>
          </NavLink>
        ))}
        {currentUser ? (
          <>
            {(hasPermission(Permission.VIEW_ADMIN_DASHBOARD) || hasPermission(Permission.VIEW_PARTNER_DASHBOARD)) && (
              <Link to={dashboardPath} onClick={onClose} className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${inactiveLinkClass}`}>{dashboardText}</Link>
            )}
             <button onClick={() => { logout(); onClose(); }} className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md text-red-500 font-medium hover:bg-red-500/10`}>
                {t.auth.logout}
            </button>
          </>
        ) : (
          <>
            <Link to="/add-property" onClick={onClose} className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${inactiveLinkClass}`}>{t.addProperty}</Link>
            <Link to="/login" onClick={onClose} className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${inactiveLinkClass}`}>{t.auth.login}</Link>
          </>
        )}
      </nav>
      <div className="border-t border-gray-200 dark:border-gray-700/50 mt-4 pt-4 flex flex-col items-start gap-3">
         <button
            onClick={() => { onToggleQuietZone(); onClose(); }}
            className="w-full flex items-center gap-3 p-3 rounded-md text-gray-600 dark:text-gray-300 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <QuoteIcon className="h-6 w-6" />
            <span>{language === 'ar' ? 'المنطقة الهادئة' : 'Quiet Zone'}</span>
          </button>
           <div className="flex items-center gap-2 text-sm p-3">
              <button
                  onClick={() => { onThemeChange(); onClose(); }}
                  className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
                  aria-label="Toggle theme"
              >
                  {theme === 'light' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
              </button>
          </div>
          <div className="flex items-center gap-2 text-sm p-3">
            <button 
              onClick={() => { onLanguageChange('en'); onClose(); }}
              className={`transition-colors ${language === 'en' ? "text-amber-500 font-semibold" : "text-gray-500 dark:text-gray-400 hover:text-amber-500"}`}
            >
              EN
            </button>
            <span className="text-gray-400 dark:text-gray-500">|</span>
            <button 
              onClick={() => { onLanguageChange('ar'); onClose(); }}
              className={`transition-colors ${language === 'ar' ? "text-amber-500 font-semibold" : "text-gray-500 dark:text-gray-400 hover:text-amber-500"}`}
            >
              AR
            </button>
          </div>
      </div>
    </div>
  );
};

export default MobileNav;