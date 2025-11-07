import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Language, AdminPartner, PartnerRequest } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { UsersIcon, UserPlusIcon, CheckCircleIcon, ClipboardDocumentListIcon } from '../icons/Icons';
import { translations } from '../../data/translations';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatCard: React.FC<{ title: string; value: number | string; icon: React.FC<{ className?: string }> }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

const PartnerRelationsHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.partnersManagement;
    const t_admin = translations[language].adminDashboard;

    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartners', getAllPartnersForAdmin);
    const { data: partnerRequests, isLoading: loadingReqs } = useApiQuery('partnerRequests', getAllPartnerRequests);

    const isLoading = loadingPartners || loadingReqs;

    const partnerData = useMemo(() => {
        if (!partners || !partnerRequests) return null;
        
        const allPartners = partners.filter(p => p.type !== 'admin' && p.id !== 'individual-listings' && !p.type.includes('manager'));
        const activePartners = allPartners.filter(p => p.status === 'active');
        const pendingRequests = partnerRequests.filter(r => r.status === 'pending');

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = activePartners.filter(p => {
            // A simple proxy for join date since we don't have it in the mock data
            // Let's assume their subscription end date was set recently
            const endDate = new Date(p.subscriptionEndDate || 0);
            return endDate.getFullYear() === now.getFullYear() && endDate.getMonth() >= now.getMonth() -1;
        }).length;
        
        const stats = {
            total: allPartners.length,
            active: activePartners.length,
            pending: pendingRequests.length,
            newThisMonth: newThisMonth
        };
        
        const recentRequests = [...pendingRequests].slice(0, 5);

        const partnersByType = activePartners.reduce((acc, partner) => {
            const typeName = t_admin.partnerTypes[partner.type as keyof typeof t_admin.partnerTypes] || partner.type;
            acc[typeName] = (acc[typeName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const chartData = {
            labels: Object.keys(partnersByType),
            datasets: [
                {
                    label: '# of Partners',
                    data: Object.values(partnersByType),
                    backgroundColor: ['#FBBF24', '#F97316', '#D97706'],
                    borderColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                    borderWidth: 2,
                },
            ],
        };

        const partnersByPlan = activePartners.reduce((acc, partner) => {
            const planName = partner.subscriptionPlan;
            acc[planName] = (acc[planName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { stats, recentRequests, chartData, partnersByPlan };

    }, [partners, partnerRequests, language, t_admin.partnerTypes]);


    if (isLoading || !partnerData) {
        return <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>;
    }
    
    const { stats, recentRequests, chartData, partnersByPlan } = partnerData;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t.totalPartners} value={stats.total} icon={UsersIcon} />
                <StatCard title={t.newPartnersThisMonth} value={stats.newThisMonth} icon={UserPlusIcon} />
                <StatCard title={t_admin.home.pendingPartnerRequests} value={stats.pending} icon={ClipboardDocumentListIcon} />
                <StatCard title={t_admin.partnerStatuses.active} value={stats.active} icon={CheckCircleIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.recentPartnerRequests}</h2>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="py-2">{t.companyName}</th>
                                    <th className="py-2">{t.requester}</th>
                                    <th className="py-2">{t_admin.adminRequests.table.date}</th>
                                    <th className="py-2">{t_admin.adminRequests.table.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {recentRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{req.companyName}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300">{req.contactName}</td>
                                        <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(req.createdAt).toLocaleDateString(language, { day: 'numeric', month: 'short' })}</td>
                                        <td className="py-3">
                                            <Link to={`/admin/partner-requests/${req.id}`} className="font-medium text-amber-600 hover:underline">
                                                {t_admin.home.review}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {recentRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">{t_admin.adminRequests.noPartnerRequests}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.partnerDistributionByType}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                         <div>
                             <div className="h-40 w-40 mx-auto">
                                <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                         </div>
                         <div>
                             <h3 className="text-center font-semibold text-gray-600 dark:text-gray-300 mb-2">{t.partnersByPlan}</h3>
                             <ul className="space-y-2 text-sm">
                                {Object.entries(partnersByPlan).map(([plan, count]) => (
                                    <li key={plan} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                        <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{plan}</span>
                                        <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">{count}</span>
                                    </li>
                                ))}
                             </ul>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerRelationsHomePage;