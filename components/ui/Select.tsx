

import React from 'react';
import { ChevronDownIcon } from './Icons';

const selectWrapperVariants = 'relative';
const selectVariants =
    'w-full p-3 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 appearance-none';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
    const classes = [selectVariants, className].join(' ');

    return (
        <div className={selectWrapperVariants}>
            <select className={classes} ref={ref} {...props}>
                {children}
            </select>
            <ChevronDownIcon className="absolute top-1/2 -translate-y-1/2 right-3 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
    );
});
Select.displayName = 'Select';

export { Select };