import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.FC<{ className?: string }>;
    linkTo: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, linkTo }) => (
    <Link to={linkTo} className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-amber-500/50 transition-all transform hover:-translate-y-1">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 p-3 rounded-full">
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </Link>
);

export default StatCard;