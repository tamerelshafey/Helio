
import React, { useEffect } from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getContent, updateContent } from '../../../services/content';
import { useToast } from '../../shared/ToastContext';
import { useLanguage } from '../../shared/LanguageContext';
import { Button } from '../../ui/Button';
import type { SiteContent } from '../../../types';

export type ContentFormContext = UseFormReturn<SiteContent>;
export function useContentFormContext() {
  return useOutletContext<ContentFormContext>();
}

const AdminContentLayout: React.FC = () => {
    const { language, t } = useLanguage();
    const t_content = t.adminDashboard.contentManagement;
    const { showToast } = useToast();
    const { data: initialContent, isLoading, refetch } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });
    
    const formMethods = useForm<SiteContent>();
    const { handleSubmit, reset, formState: { isSubmitting, isDirty } } = formMethods;

    useEffect(() => {
        if (initialContent) {
            reset(initialContent);
        }
    }, [initialContent, reset]);
    
    const onSubmit = async (data: SiteContent) => {
        await updateContent(data as Partial<SiteContent>);
        showToast('Site content updated successfully!', 'success');
        await refetch();
        reset(data); // Reset form with new data to clear dirty state
    };

    const navLinks = [
        { key: 'hero', href: 'hero' },
        { key: 'whyUs', href: 'why-us' },
        { key: 'services', href: 'services' },
        { key: 'partners', href: 'partners' },
        { key: 'testimonials', href: 'testimonials' },
        { key: 'socialProof', href: 'social-proof' },
        { key: 'whyNewHeliopolis', href: 'why-new-heliopolis' },
        { key: 'quotes', href: 'quotes' },
        { key: 'footer', href: 'footer' },
    ];
    
    const baseLinkClasses = "block px-4 py-2 text-md font-medium rounded-lg transition-colors";
    const activeLinkClasses = "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400";
    const inactiveLinkClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";

    if (isLoading) {
        return <div>Loading content editor...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_content.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_content.subtitle}</p>
                </div>
                {isDirty && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">{t_content.unsavedChanges}</span>
                        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                            {isSubmitting ? t_content.saving : t_content.saveChanges}
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <nav className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-40">
                    <ul className="space-y-1">
                        {navLinks.map(link => (
                            <li key={link.key}>
                                <NavLink
                                    to={link.href}
                                    className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                                >
                                    {t_content.tabs[link.key]}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[60vh]">
                    <Outlet context={formMethods} />
                </main>
            </div>
        </form>
    );
};

export default AdminContentLayout;
