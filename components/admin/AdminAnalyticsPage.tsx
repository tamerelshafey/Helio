
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, Property, AdminPartner } from '../../types';
import { translations } from '../../data/translations';
import { BuildingIcon, InboxIcon, UsersIcon, ChartBarIcon } from '../icons/Icons';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllLeads } from '../../api/leads';
import { getAllProperties } from '../../api/properties';
import { getAllPartnersForAdmin } from '../../api/partners';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useLanguage } from '../shared/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 p-3 rounded-full">
                {icon}
            </div>
        </div>
    </div>
);

type TimePeriod = '7d' | '30d' | 'month' | 'year';

const AdminAnalyticsPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminAnalytics;
    const t_dashboard = translations[language].dashboard;
    const { data: leads, isLoading: loadingLeads } = useApiQuery('allLeadsAnalytics', getAllLeads);
    const { data: properties, isLoading: loadingProperties } = useApiQuery('allPropertiesAnalytics', getAllProperties);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAnalytics', getAllPartnersForAdmin);
    
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
    
    const loading = loadingLeads || loadingProperties || loadingPartners;

    const { rangeStart, rangeEnd } = useMemo(() => {
        const end = new Date();
        let start = new Date();
        switch(timePeriod) {
            case '7d': start.setDate(end.getDate() - 7); break;
            case '30d': start.setDate(end.getDate() - 30); break;
            case 'month': start = new Date(end.getFullYear(), end.getMonth(), 1); break;
            case 'year': start = new Date(end.getFullYear(), 0, 1); break;
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { rangeStart: start, rangeEnd: end };
    }, [timePeriod]);

    const analyticsData = useMemo(() => {
        if (!leads || !properties || !partners) return null;

        const filteredLeads = leads.filter(l => {
            const leadDateTs = new Date(l.createdAt).getTime();
            return leadDateTs >= rangeStart.getTime() && leadDateTs <= rangeEnd.getTime();
        });
        
        const conversionRate = properties.length > 0 ? (Number(leads.length) / Number(properties.length)).toFixed(2) : "0.00";

        const leadsByProperty = leads.reduce((acc, lead) => {
            if(lead.propertyId) acc[lead.propertyId] = (acc[lead.propertyId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topProperties = Object.entries(leadsByProperty)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .slice(0, 5)
            .map(([id, count]) => ({ property: properties.find(p => p.id === id), count }))
            .filter(p => p.property);

        const leadsByPartner = leads.reduce((acc, lead) => {
            acc[lead.partnerId] = (acc[lead.partnerId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topPartners = Object.entries(leadsByPartner)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .slice(0, 5)
            .map(([id, count]) => ({ partner: partners.find(p => p.id === id), count }))
            .filter(p => p.partner);

        const leadsOverTime = (() => {
            const groupedData = new Map<string, number>();

            filteredLeads.forEach(lead => {
                const date = new Date(lead.createdAt);
                const key = timePeriod === 'year'
                    ? `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
                    : date.toISOString().split('T')[0];
                groupedData.set(key, (groupedData.get(key) || 0) + 1);
            });

            const labels: string[] = [];
            const data: number[] = [];
            let currentDate = new Date(rangeStart);

            if (timePeriod === 'year') {
                for (let i = 0; i < 12; i++) {
                    const monthDate = new Date(rangeStart.getFullYear(), i, 1);
                    labels.push(monthDate.toLocaleString(language, { month: 'short' }));
                    const key = `${monthDate.getFullYear()}-${String(i).padStart(2, '0')}`;
                    data.push(groupedData.get(key) || 0);
                }
            } else {
                while (currentDate <= rangeEnd) {
                    labels.push(currentDate.toLocaleDateString(language, { day: 'numeric', month: 'short' }));
                    const key = currentDate.toISOString().split('T')[0];
                    data.push(groupedData.get(key) || 0);
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            return { labels, data };
        })();
        
        const propertyTypes = properties.reduce((acc, prop) => {
            const type = prop.type[language];
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const leadStatuses = leads.reduce((acc, lead) => {
            const status = t_dashboard.leadStatus[lead.status];
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return {
            newLeads: filteredLeads.length,
            newPartners: partners.filter(p => new Date(p.subscriptionEndDate || 0) > rangeStart).length, // Simplified logic
            newProperties: properties.filter(p => new Date(p.listingStartDate || 0) > rangeStart).length, // Simplified logic
            conversionRate,
            topProperties,
            topPartners,
            leadsOverTime,
            propertyTypes,
            leadStatuses,
        };
    }, [leads, properties, partners, rangeStart, rangeEnd, language, t_dashboard.leadStatus, timePeriod]);

    if (loading || !analyticsData) return <div>Loading analytics...</div>;
    
    const { leadsOverTime, propertyTypes, leadStatuses } = analyticsData;
    
    const lineChartData = {
        labels: leadsOverTime.labels,
        datasets: [{
            label: t.newLeads,
            data: leadsOverTime.data,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            fill: true,
            tension: 0.3,
        }],
    };

    const doughnutChartData = {
        labels: Object.keys(propertyTypes),
        datasets: [{
            data: Object.values(propertyTypes),
            backgroundColor: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
            hoverOffset: 4,
        }],
    };
    
    const barChartData = {
        labels: Object.keys(leadStatuses),
        datasets: [{
            label: 'Lead Count',
            data: Object.values(leadStatuses),
            backgroundColor: '#FBBF24',
            borderRadius: 4,
        }],
    };

    const commonChartOptions = (title: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title, font: { size: 16 }, color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151' },
        },
        scales: {
             x: { ticks: { color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280' } },
             y: { ticks: { color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280' } },
        }
    });

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const, labels: { color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151' } },
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
                </div>
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
                    {(Object.keys(t) as (keyof typeof t)[]).filter(k => String(k).startsWith('last') || String(k).startsWith('this')).map(periodKey => {
                        const periodMap: Record<string, TimePeriod> = { last7days: '7d', last30days: '30d', thismonth: 'month', thisyear: 'year' };
                        const key = String(periodKey).replace(/([A-Z])/g, '$1').toLowerCase();
                        return (
                            <button key={key} onClick={() => setTimePeriod(periodMap[key])} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${timePeriod === periodMap[key] ? 'bg-white dark:bg-gray-700 shadow text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>{t[periodKey]}</button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t.newLeads} value={analyticsData.newLeads} icon={<InboxIcon className="w-6 h-6" />} />
                <StatCard title={t.newPartners} value={analyticsData.newPartners} icon={<UsersIcon className="w-6 h-6" />} />
                <StatCard title={t.newProperties} value={analyticsData.newProperties} icon={<BuildingIcon className="w-6 h-6" />} />
                <StatCard title={t.conversionRate} value={`${analyticsData.conversionRate} ${t.leadsPerProperty}`} icon={<ChartBarIcon className="w-6 h-6" />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="h-80"><Line data={lineChartData} options={commonChartOptions('Leads Over Time')}/></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="h-80"><Bar data={barChartData} options={{...commonChartOptions('Lead Status Distribution'), indexAxis: 'y'}}/></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-4">Property Type Distribution</h3>
                     <div className="h-72 w-full"><Doughnut data={doughnutChartData} options={doughnutOptions} /></div>
                </div>
                 <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.topPerformingPartners}</h3>
                        <ul className="space-y-3">
                            {analyticsData.topPartners.map(({ partner, count }) => partner && (
                                <li key={partner.id}>
                                     <Link to={`/admin/partners?edit=${partner.id}`} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <img src={partner.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm truncate">{partner.name}</p>
                                            <p className="text-xs text-gray-500">{partner.type}</p>
                                        </div>
                                        <div className="font-bold text-gray-800 dark:text-gray-200">{count} {t.leads}</div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.topPerformingProperties}</h3>
                        <ul className="space-y-3">
                            {analyticsData.topProperties.map(({ property, count }) => property && (
                                <li key={property.id}>
                                    <Link to={`/admin/properties/edit/${property.id}`} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <img src={property.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover" />
                                        <div className="flex-grow overflow-hidden">
                                            <p className="font-semibold text-sm truncate">{property.title[language]}</p>
                                            <p className="text-xs text-gray-500">{property.partnerName}</p>
                                        </div>
                                        <div className="font-bold text-gray-800 dark:text-gray-200 flex-shrink-0">{count} {t.leads}</div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
