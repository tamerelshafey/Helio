import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import type { Language, LeadStatus, Lead } from '../../types';
import { translations } from '../../data/translations';
import { ChevronLeftIcon } from '../icons/Icons';
import { selectClasses, inputClasses } from '../shared/FormField';
// FIX: Imported 'updateLead' instead of non-existent 'updateLeadStatus' and 'updateLeadNotes'.
import { getAllLeads, updateLead } from '../../api/leads';
import { useApiQuery } from '../shared/useApiQuery';

// FIX: Added missing status keys 'site-visit' and 'quoted' to match the LeadStatus type.
const statusColors: { [key in LeadStatus]?: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-amber-500 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth = false }) => (
    value ? (
        <div className={fullWidth ? '' : 'sm:grid sm:grid-cols-3 sm:gap-4'}>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-md text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value}</dd>
        </div>
    ) : null
);

const AdminDecorationRequestDetailsPage: React.FC<{ language: Language }> = ({ language }) => {
    const { requestId } = useParams<{ requestId: string }>();
    const location = useLocation();
    const t = translations[language].adminDashboard.decorationsManagement;
    const t_lead_status = translations[language].dashboard.leadStatus;
    const t_shared = translations[language].adminShared;
    
    const { data: leads, isLoading: loading, refetch: refetchLeads } = useApiQuery('allLeadsAdmin', getAllLeads);

    const request = useMemo(() => (leads || []).find(l => l.id === requestId), [leads, requestId]);
    
    const [notes, setNotes] = useState('');
    useEffect(() => {
        if(request) {
            setNotes(request.internalNotes || '');
        }
    }, [request]);

    const handleNotesSave = async () => {
        if (request && request.internalNotes !== notes) {
            // FIX: Used 'updateLead' to update the internalNotes property.
            await updateLead(request.id, { internalNotes: notes });
            refetchLeads();
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (request) {
            // FIX: Used 'updateLead' to update the status property.
            await updateLead(request.id, { status: e.target.value as LeadStatus });
            refetchLeads();
        }
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
                         <DetailItem label={translations[language].dashboard.leadTable.service} value={request.serviceTitle} fullWidth />
                         <DetailItem label={translations[language].dashboard.leadTable.notes} value={<p className="whitespace-pre-wrap">{request.customerNotes || '-'}</p>} fullWidth />
                    </DetailSection>
                </div>

                <div className="space-y-8">
                     <DetailSection title={t.management}>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{translations[language].dashboard.leadTable.status}</label>
                            <select id="status" value={request.status} onChange={handleStatusChange} className={`${selectClasses} ${statusColors[request.status]}`}>
                                {Object.entries(t_lead_status).map(([key, value]) => (
                                    <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{value}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.internalNotes}</label>
                            <textarea
                                id="internalNotes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={handleNotesSave}
                                rows={10}
                                className={inputClasses}
                            />
                        </div>
                     </DetailSection>
                </div>
            </div>
        </div>
    );
};

export default AdminDecorationRequestDetailsPage;
