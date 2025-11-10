
import React from 'react';

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                type="checkbox"
                ref={ref}
                className={cn(
                    'h-4 w-4 shrink-0 rounded border-gray-300 text-amber-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600',
                    className,
                )}
                {...props}
            />
        );
    },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
