import React from 'react';

interface DetailItemProps {
    label: string;
    value?: string | number | null | boolean | React.ReactNode;
    layout?: 'stacked' | 'grid';
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, layout = 'stacked' }) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const formattedValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

    if (layout === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 py-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="text-sm text-gray-900 dark:text-white sm:col-span-2">{formattedValue}</dd>
            </div>
        );
    }
    
    // Default 'stacked' layout
    return (
        <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-md font-semibold text-gray-900 dark:text-white">{formattedValue}</dd>
        </div>
    );
};

export default DetailItem;
