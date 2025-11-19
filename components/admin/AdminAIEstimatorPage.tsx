
import React from 'react';
import { useLanguage } from '../shared/LanguageContext';

const AdminAIEstimatorPage: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">AI Estimator Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">
                This feature has been disabled.
            </p>
        </div>
    );
};

export default AdminAIEstimatorPage;
