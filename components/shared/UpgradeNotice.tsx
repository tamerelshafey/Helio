import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { SparklesIcon } from '../icons/Icons';

interface UpgradeNoticeProps {
    language: Language;
}

const UpgradeNotice: React.FC<UpgradeNoticeProps> = ({ language }) => {
    const t = translations[language].upgradePlanModal;

    return (
        <div className="container mx-auto px-6 py-20 flex justify-center">
            <div className="max-w-2xl w-full bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-8 rounded-r-lg text-center">
                <SparklesIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">{t.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">{t.message}</p>
                <Link
                    to="/dashboard/subscription"
                    className="bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                >
                    {t.upgradeButton}
                </Link>
            </div>
        </div>
    );
};

export default UpgradeNotice;
