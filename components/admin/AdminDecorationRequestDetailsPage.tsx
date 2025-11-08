
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { LeadStatus, Lead } from '../../types';
import { translations } from '../../data/translations';
import { ChevronLeftIcon } from '../icons/Icons';
import { selectClasses } from '../shared/FormField';
import { getAllLeads, updateLead } from '../../api/leads';
import { useApiQuery } from '../shared/useApiQuery';
import { useToast } from '../shared/ToastContext';
import ConversationThread from '../shared/ConversationThread';
import DetailSection from '../shared/DetailSection';
import DetailItem from '../shared/DetailItem';
import { useLanguage } from '../shared/LanguageContext';

const statusColors: { [key in LeadStatus]?: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AdminDecorationRequestDetailsPage: React.FC = () => {
    const { language } = useLanguage();
    const { requestId } = useParams<{ requestId: string }>();
    const t = translations[language].adminDashboard.decorationsManagement;
    const t_lead_status = translations[language].dashboard.leadStatus;
    const t_shared = translations[language].adminShared;
    const { showToast } = useToast();
    
    const { data: leads, isLoading: loading, refetch: refetchLeads } = useApiQuery('allLeadsAdmin', getAllLeads);

    const request = useMemo(() => (leads || []).find(l => l.id === requestId), [leads, requestId]);
    
    const [status, setStatus] = useState<LeadStatus>('new');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(request) {
            setStatus(request.status);
        }
    }, [request]);

    const handleSaveChanges = async () => {
        if (!request) return;
        setIsSaving(true);
        await updateLead(request.id, { status });
        await refetchLeads();
        setIsSaving(false);
        showToast('Request updated successfully!', 'success');
    };

    if (loading) {
        return <div className="p-8 text-center">Loading request details...</div>;
    }

    if (!request) {
        return <div className="p-8 text-center">Request not found.</div>;
    }

    return (
        <div>
            <Link to="/admin/decoration-requests" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 mb-4">
                <ChevronLeftIcon className={`w-5 h-5 ${language === 'ar' ? 'transform -scale-x-100' : ''}`} />
                <span className={`${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t_shared.backToRequests}</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t.requestDetails}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <DetailSection title={t.customerInformation}>
                        <DetailItem label={translations[language].customDecorationRequestModal.fullName} value={request.customerName} />
                        <DetailItem label={translations[language].customDecorationRequestModal.phone} value={<span dir="ltr">{request.customerPhone}</span>} />
                        <DetailItem label={translations[language].serviceRequestModal.preferredContactTime} value={request.contactTime} />
                    </DetailSection>

                    <DetailSection title={t.requestInformation}>
                         <DetailItem label={translations[language].dashboard.leadTable.service} value={request.serviceTitle} layout="grid" />
                         <DetailItem label={translations[language].dashboard.leadTable.notes} value={<p className="whitespace-pre-wrap">{request.customerNotes || '-'}</p>} layout="grid" />
                    </DetailSection>

                    <ConversationThread lead={request} onMessageSent={refetchLeads} />

                </div>

                <div className="space-y-8">
                     <DetailSection title={t.management}>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{translations[language].dashboard.leadTable.status}</label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className={`${selectClasses} ${statusColors[status]}`}>
                                {Object.entries(t_lead_status).map(([key, value]) => (
                                    <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{value}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="w-full bg-amber-500 text-gray-900 font-bold px-4 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? '...' : t_shared.save}
                        </button>
                     </DetailSection>
                </div>
            </div>
        </div>
    );
};

export default AdminDecorationRequestDetailsPage;
