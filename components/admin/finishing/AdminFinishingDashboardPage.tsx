
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads } from '../../../services/leads';
import { InboxIcon, WrenchScrewdriverIcon, CheckCircleIcon, SparklesIcon, ClipboardDocumentListIcon, CogIcon } from '../../ui/Icons';
import StatCard from '../../shared/StatCard';
import { useLanguage } from '../../shared/LanguageContext';
import { Card, CardContent } from '../../ui/Card';
import RequestList from '../../shared/RequestList';
import { Lead } from '../../../types';

const AdminFinishingDashboardPage: React.FC = () => {
    const { language, t: i18n } = useLanguage();
    const t = i18n.adminDashboard.finishingRequests;
    const t_dash = i18n.dashboard;
    const { data: allLeads, isLoading: loadingLeads } = useQuery({ queryKey: ['allLeads'], queryFn: getAllLeads });

    const dashboardData = useMemo(() => {
        if (!allLeads) return null;

        // Filter specifically for finishing service type
        const finishingLeads = allLeads.filter(lead => lead.serviceType === 'finishing');
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = {
            new: finishingLeads.filter(l => l.status === 'new').length,
            inProgress: finishingLeads.filter(l => ['contacted', 'quoted', 'in-progress', 'site-visit'].includes(l.status)).length,
            completedThisMonth: finishingLeads.filter(l => l.status === 'completed' && new Date(l.updatedAt) >= firstDayOfMonth).length,
        };
        
        const recentRequests = [...finishingLeads]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);

        return { stats, recentRequests };
    }, [allLeads]);

    if (loadingLeads || !dashboardData) return <div className="p-8 text-center">Loading Dashboard...</div>;

    const { stats, recentRequests } = dashboardData;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Stats */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {language === 'ar' ? 'نظرة عامة على الطلبات' : 'Requests Overview'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard title={t.newRequests} value={stats.new} icon={InboxIcon} linkTo="/admin/finishing-management/requests" />
                    <StatCard title={t.inProgress} value={stats.inProgress} icon={WrenchScrewdriverIcon} linkTo="/admin/finishing-management/requests" />
                    <StatCard title={t.completedThisMonth} value={stats.completedThisMonth} icon={CheckCircleIcon} linkTo="/admin/finishing-management/requests" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Requests List - Taking up 2 columns */}
                <div className="lg:col-span-2">
                     <RequestList<Lead>
                        title={language === 'ar' ? 'أحدث طلبات التشطيب' : 'Recent Finishing Requests'}
                        requests={recentRequests}
                        linkTo="/admin/finishing-management/requests"
                        itemRenderer={(lead) => (
                            <li key={lead.id} className="py-3">
                                <Link to={`/admin/requests/${lead.id}`} className="flex justify-between items-center group">
                                    <div>
                                        <p className="font-medium group-hover:text-amber-600">{lead.customerName}</p>
                                        <p className="text-sm text-gray-500 truncate max-w-xs" title={lead.serviceTitle}>{lead.serviceTitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600`}>
                                            {t_dash.leadStatus[lead.status]}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(lead.updatedAt).toLocaleDateString(language)}</p>
                                    </div>
                                </Link>
                            </li>
                        )}
                    />
                </div>

                {/* Management Tools - Taking up 1 column */}
                <div className="space-y-6">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'روابط سريعة' : 'Quick Actions'}
                    </h2>
                    {/* 1. Packages & Services Management */}
                    <Link to="/admin/finishing-management/services" className="block">
                        <Card className="hover:shadow-md transition-all border-l-4 border-l-blue-500 group cursor-pointer">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-md text-gray-900 dark:text-white">
                                        {language === 'ar' ? 'باقات الخدمات' : 'Service Packages'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {language === 'ar' ? 'الاستشارة والتصميم' : 'Consultation & Design'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* 2. Subscription Plans */}
                    <Link to="/admin/finishing-management/plans" className="block">
                        <Card className="hover:shadow-md transition-all border-l-4 border-l-green-500 group cursor-pointer">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-md text-gray-900 dark:text-white">
                                        {language === 'ar' ? 'خطط الشركاء' : 'Partner Plans'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {language === 'ar' ? 'باقات شركات التشطيب' : 'Finishing Companies'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    
                    {/* 3. AI Estimator */}
                    <Link to="/admin/finishing-management/estimator" className="block">
                        <Card className="hover:shadow-md transition-all border-l-4 border-l-purple-500 group cursor-pointer">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <CogIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-md text-gray-900 dark:text-white">
                                        {language === 'ar' ? 'المقايسة الذكية' : 'AI Estimator'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {language === 'ar' ? 'تحديث الأسعار والبنود' : 'Manage Prices & Items'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminFinishingDashboardPage;
