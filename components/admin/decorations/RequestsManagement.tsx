import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, LeadStatus } from '../../../types';
import { translations } from '../../../data/translations';
import { useApiQuery } from '../../shared/useApiQuery';
import { getAllLeads, deleteLead as apiDeleteLead } from '../../../api/leads';
import { getAllPartnersForAdmin } from '../../../api/partners';
import { inputClasses } from '../../shared/FormField';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const RequestsManagement: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.decorationsManagement;
    const { data: allLeads, refetch: refetchLeads, isLoading: loadingLeads } = useApiQuery('allLeads', getAllLeads);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);
    const loading = loadingLeads || loadingPartners;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const decorationLeads = useMemo(() => {
        const manager = (partners || []).find(p => p.type === 'decorations_manager');
        if (!manager) return [];

        let leads = (allLeads || []).filter(lead => lead.managerId === manager.id);
        
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            leads = leads.filter(l => new Date(l.createdAt) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23,59,59,999);
            leads = leads.filter(l => new Date(l.createdAt) <= end);
        }

        return leads.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    }, [allLeads, partners, startDate, endDate]);

    const handleDelete = async (itemId: string) => {
        if (window.confirm(t.confirmDelete)) {
            await apiDeleteLead(itemId);
            refetchLeads();
        }
    };
    
    return (
        <div className="animate-fadeIn">
             <div className="mb-4 flex gap-4">
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">{t.startDate}</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses}/>
                </div>
                 <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">{t.endDate}</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses}/>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Service</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                         {loading ? (
                            <tr><td colSpan={5} className="text-center p-8">Loading...</td></tr>
                        ) : decorationLeads.length > 0 ? (
                            decorationLeads.map(lead => (
                                <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{lead.customerName}<br/><span className="font-normal text-gray-500">{lead.customerPhone}</span></td>
                                    <td className="px-6 py-4">{lead.serviceTitle}</td>
                                    <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>{translations[language].dashboard.leadStatus[lead.status]}</span></td>
                                    <td className="px-6 py-4 space-x-4">
                                        <Link to={`/admin/decoration-requests/${lead.id}`} className="font-medium text-blue-600 hover:underline">View</Link>
                                        <button onClick={() => handleDelete(lead.id)} className="font-medium text-red-600 hover:underline">{translations[language].adminShared.delete}</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-8">{t.noRequests}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RequestsManagement;