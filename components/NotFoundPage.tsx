import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { SearchIcon } from './icons/Icons'; // Using a relevant icon

interface NotFoundPageProps {
  language: Language;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ language }) => {
  const t = translations[language].notFoundPage;

  return (
    <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="max-w-md">
        <div className="text-9xl font-extrabold text-amber-500">404</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
          {t.subtitle}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/"
            className="rounded-md bg-amber-500 px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-colors"
          >
            {t.backButton}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
