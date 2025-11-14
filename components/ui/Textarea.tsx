import React from 'react';

const textareaVariants =
    'w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
    const classes = [textareaVariants, className].join(' ');
    return <textarea className={classes} ref={ref} {...props} />;
});
Textarea.displayName = 'Textarea';

export { Textarea };