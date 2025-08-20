import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { Language } from '../App';
import { translations } from '../data/translations';
import { QuietZoneIcon } from './icons/Icons';

interface HeaderProps {
  onAddPropertyClick: () => void;
  onToggleQuietZone: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddPropertyClick, onToggleQuietZone, language, onLanguageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = translations[language];

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.properties, href: "/properties" },
    { name: t.nav.map, href: "/map" },
    { name: t.nav.finishing, href: "/finishing" },
    { name: t.nav.decorations, href: "/decorations" },
    { name: t.nav.contact, href: "/contact" },
  ];

  const activeLinkClass = "text-amber-500";
  const inactiveLinkClass = "text-gray-300 hover:text-amber-500";

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-2xl font-bold text-amber-500">
              ONLY HELIO
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
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
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <button 
                onClick={() => onLanguageChange('en')}
                className={`transition-colors ${language === 'en' ? "text-amber-500 font-semibold" : "text-gray-400 hover:text-amber-500"}`}
              >
                EN
              </button>
              <span className="text-gray-500">|</span>
              <button 
                onClick={() => onLanguageChange('ar')}
                className={`transition-colors ${language === 'ar' ? "text-amber-500 font-semibold" : "text-gray-400 hover:text-amber-500"}`}
              >
                AR
              </button>
            </div>
             <button
              onClick={onToggleQuietZone}
              className="hidden sm:block text-gray-400 hover:text-amber-500 transition-colors"
              aria-label="Toggle Quiet Zone"
            >
              <QuietZoneIcon className="h-6 w-6" />
            </button>
            <button 
              onClick={onAddPropertyClick}
              className="bg-amber-500 text-gray-900 font-semibold px-5 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
            >
              {t.addProperty}
            </button>
            <button 
              className="lg:hidden text-gray-300"
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
          <div className="lg:hidden mt-4 border-t border-gray-700/50 pt-4 animate-fadeIn">
            <nav className="flex flex-col items-start gap-2">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.name} 
                  to={link.href} 
                  end={link.href === '/'}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => `w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-md ${isActive ? activeLinkClass + ' bg-gray-800' : inactiveLinkClass} transition-colors duration-200`}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-gray-700/50 mt-4 pt-4 flex flex-col items-start gap-3">
               <button
                  onClick={() => { onToggleQuietZone(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-md text-gray-300 hover:text-amber-500 hover:bg-gray-800 transition-colors"
                >
                  <QuietZoneIcon className="h-6 w-6" />
                  <span>المنطقة الهادئة</span>
                </button>
                <div className="flex items-center gap-2 text-sm p-3">
                  <button 
                    onClick={() => onLanguageChange('en')}
                    className={`transition-colors ${language === 'en' ? "text-amber-500 font-semibold" : "text-gray-400 hover:text-amber-500"}`}
                  >
                    EN
                  </button>
                  <span className="text-gray-500">|</span>
                  <button 
                    onClick={() => onLanguageChange('ar')}
                    className={`transition-colors ${language === 'ar' ? "text-amber-500 font-semibold" : "text-gray-400 hover:text-amber-500"}`}
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