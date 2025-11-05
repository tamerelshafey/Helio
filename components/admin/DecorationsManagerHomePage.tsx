import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllLeads } from '../../api/leads';
import { getAllPortfolioItems } from '../../api/portfolio';
import { getDecorationCategories } from '../../api/decorations';
import { getAllPartnersForAdmin } from '../../api/partners';
import { SparklesIcon, InboxIcon, ListIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';
import { translations } from '../../data/translations';

const DecorationsManagerHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { data: allLeads, isLoading: loadingLeads } = useApiQuery('allLeads', getAllLeads);
    const { data: portfolio, isLoading: loadingPortfolio } = useApiQuery('portfolio', getAllPortfolioItems);
    const { data: decorationCategories, isLoading: loadingCategories } = useApiQuery('decorationCategories', getDecorationCategories);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);

    const isLoading = loadingLeads || loadingPortfolio || loadingCategories || loadingPartners;
    
    const decorationCategoryNames = React.useMemo(() => (decorationCategories || []).flatMap(c => [c.name.en, c.name.ar]), [decorationCategories]);

    const decorationItemsCount = React.useMemo(() => (portfolio || []).filter(item => 
        decorationCategoryNames.includes(item.category.en) || 
        decorationCategoryNames.includes(item.category.ar)
    ).length, [portfolio, decorationCategoryNames]);
    
    const decorationLeads = React.useMemo(() => {
        const manager = (partners || []).find(p => p.type === 'decorations_manager');
        if (!manager) return [];
        return (allLeads || []).filter(lead => lead.managerId === manager.id);
    }, [allLeads, partners]);

    const newLeadsCount = decorationLeads.filter(l => l.status === 'new').length;
    const categoriesCount = (decorationCategories || []).length;

    if (isLoading) return <div>Loading decorations dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Decorations Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Overview of decoration items and service requests.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Decoration Items"
                    value={decorationItemsCount}
                    icon={SparklesIcon}
                    linkTo="/admin/decorations"
                />
                <StatCard 
                    title="New Decoration Leads"
                    value={newLeadsCount}
                    icon={InboxIcon}
                    linkTo="/admin/decoration-requests"
                />
                <StatCard 
                    title="Decoration Categories"
                    value={categoriesCount}
                    icon={ListIcon}
                    linkTo="/admin/decorations" // Link to the same page, user can switch tabs
                />
            </div>
            <div className="mt-8 space-x-4">
                <Link to="/admin/decorations" className="text-amber-600 hover:underline font-semibold">
                    {translations[language].adminDashboard.nav.decorationsPortfolio} &rarr;
                </Link>
                 <Link to="/admin/decoration-requests" className="text-amber-600 hover:underline font-semibold">
                    {translations[language].adminDashboard.nav.decorationsRequests} &rarr;
                </Link>
            </div>
        </div>
    );
};

export default DecorationsManagerHomePage;
