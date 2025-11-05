import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, Property, AdminPartner } from '../../types';
import { translations } from '../../data/translations';
import { BuildingIcon, InboxIcon, UsersIcon, ChartBarIcon } from '../icons/Icons';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllLeads } from '../../api/leads';
import { getAllProperties } from '../../api/properties';
import { getAllPartnersForAdmin } from '../../api/partners';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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

const AdminAnalyticsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminAnalytics;
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

        const partnersWithDate = partners.map((p, i) => ({ ...p, createdAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000) }));
        const propertiesWithDate = properties.map(p => ({ ...p, createdAt: new Date(p.listingStartDate || Date.now()) }));

        const filteredLeads = leads.filter(l => {
            const leadDateTs = new Date(l.createdAt).getTime();
            return leadDateTs >= rangeStart.getTime() && leadDateTs <= rangeEnd.getTime();
        });
        const filteredPartners = partnersWithDate.filter(p => {
            const partnerDateTs = p.createdAt.getTime();
            return partnerDateTs >= rangeStart.getTime() && partnerDateTs <= rangeEnd.getTime();
        });
        const filteredProperties = propertiesWithDate.filter(p => {
            const propDateTs = p.createdAt.getTime();
            return propDateTs >= rangeStart.getTime() && propDateTs <= rangeEnd.getTime();
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

        const cumulativeGrowth = () => {
            const allDates = [...partnersWithDate.map(p => p.createdAt), ...propertiesWithDate.map(p => p.createdAt)]
                .filter(Boolean)
                .sort((a,b) => a.getTime() - b.getTime());
            if (allDates.length === 0) return { labels: [], partners: [], properties: [] };

            const startDate = allDates[0];
            const endDate = allDates[allDates.length - 1];

            const labels: string[] = [];
            let currentDate = new Date(startDate);
            
            while (currentDate.getTime() <= endDate.getTime()) {
                labels.push(currentDate.toLocaleDateString(language, { month: 'short', year: 'numeric' }));
                currentDate.setMonth(currentDate.getMonth() + 1);
            }

            let partnerCount = 0;
            let propertyCount = 0;
            let partnerIndex = 0;
            let propertyIndex = 0;

            const sortedPartners = partnersWithDate.sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
            const sortedProperties = propertiesWithDate.sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());

            return {
                labels,
                partners: labels.map(labelDate => {
                    const d = new Date(labelDate);
                    while(partnerIndex < sortedPartners.length && sortedPartners[partnerIndex].createdAt.getTime() <= d.getTime()) {
                        partnerCount++;
                        partnerIndex++;
                    }
                    return partnerCount;
                }),
                properties: labels.map(labelDate => {
                    const d = new Date(labelDate);
                    while(propertyIndex < sortedProperties.length && sortedProperties[propertyIndex].createdAt.getTime() <= d.getTime()) {
                        propertyCount++;
                        propertyIndex++;
                    }
                    return propertyCount;
                })
            }
        };

        const growthData = cumulativeGrowth();
        
        return {
            newLeads: filteredLeads.length,
            newPartners: filteredPartners.length,
            newProperties: filteredProperties.length,
            conversionRate,
            topProperties,
            topPartners,
            growthData,
        };
    }, [leads, properties, partners, rangeStart, rangeEnd, language]);

    if (loading || !analyticsData) return <div>Loading analytics...</div>;
    
    const { growthData } = analyticsData;
    const lineChartData = {
        labels: growthData.labels,
        datasets: [
            {
                label: t.partners,
                data: growthData.partners,
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
            },
            {
                label: t.users, // Using 'users' for properties for simplicity
                data: growthData.properties,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
                </div>
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
                    {(Object.keys(t) as (keyof typeof t)[]).filter(k => String(k).startsWith('last') || String(k).startsWith('this')).map(periodKey => {
                        const periodMap: Record<string, TimePeriod> = { last7Days: '7d', last30Days: '30d', thisMonth: 'month', thisYear: 'year' };
                        const key = String(periodKey).replace(/([A-Z])/g, ' $1').trim().split(' ').map(s=>s.toLowerCase()).join('');
                        const p = Object.keys(periodMap).find(k => k.toLowerCase() === key) as keyof typeof periodMap;
                        return (
                            <button key={p} onClick={() => setTimePeriod(periodMap[p])} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${timePeriod === periodMap[p] ? 'bg-white dark:bg-gray-700 shadow text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>{t[periodKey]}</button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title={t.newLeads} value={analyticsData.newLeads} icon={<InboxIcon className="w-6 h-6" />} />
                <StatCard title={t.newPartners} value={analyticsData.newPartners} icon={<UsersIcon className="w-6 h-6" />} />
                <StatCard title={t.newProperties} value={analyticsData.newProperties} icon={<BuildingIcon className="w-6 h-6" />} />
                <StatCard title={t.conversionRate} value={`${analyticsData.conversionRate} ${t.leadsPerProperty}`} icon={<ChartBarIcon className="w-6 h-6" />} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.userGrowth}</h3>
                <div className="h-80"><Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }}/></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.topPerformingProperties}</h3>
                     <ul className="space-y-3">
                        {analyticsData.topProperties.map(({ property, count }) => property && (
                            <li key={property.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md">
                                <img src={property.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm truncate">{property.title[language]}</p>
                                    <p className="text-xs text-gray-500">{property.partnerName}</p>
                                </div>
                                <div className="font-bold text-gray-800 dark:text-gray-200">{count} {t.leads}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.topPerformingPartners}</h3>
                     <ul className="space-y-3">
                        {analyticsData.topPartners.map(({ partner, count }) => partner && (
                            <li key={partner.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md">
                                <img src={partner.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm truncate">{partner.name}</p>
                                    <p className="text-xs text-gray-500">{partner.type}</p>
                                </div>
                                <div className="font-bold text-gray-800 dark:text-gray-200">{count} {t.leads}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;