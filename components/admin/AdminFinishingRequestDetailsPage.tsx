import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Language, LeadStatus, Lead, AdminPartner } from '../../types';
import { translations } from '../../data/translations';
import { ChevronLeftIcon } from '../icons/Icons';
import { selectClasses, inputClasses } from '../shared/FormField';
import { getAllLeads, updateLead } from '../../api/leads';
import { getAllPartnersForAdmin } from '../../api/partners';
import { useApiQuery } from '../shared/useApiQuery';
import DetailItem from '../shared/DetailItem';
import { useToast } from '../shared/ToastContext';

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


const AdminFinishingRequestDetailsPage: React.FC<{ language: Language }> = ({ language }) => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const t_req = translations[language].adminDashboard.decorationsManagement;
    const t_lead_status = translations[language].dashboard.leadStatus;
    const t_finishing = translations[language].adminDashboard.finishingRequests;
    const t_shared = translations[language].adminShared;
    const { showToast } = useToast();
    
    const { data: leads, isLoading: loadingLeads, refetch: refetchLeads } = useApiQuery('allLeadsAdmin', getAllLeads);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);

    const request = useMemo(() => (leads || []).find(l => l.id === requestId), [leads, requestId]);
    
    const finishingPartners = useMemo(() => (partners || []).filter(p => p.type === 'finishing'), [partners]);

    const [status, setStatus] = useState<LeadStatus>('new');
    const [assignedTo, setAssignedTo] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(request) {
            setStatus(request.status);
            setAssignedTo(request.assignedTo || 'internal-team');
            setInternalNotes(request.internalNotes || '');
        }
    }, [request]);

    const handleSaveChanges = async () => {
        if (!request) return;
        setIsSaving(true);
        await updateLead(request.id, {
            status,
            assignedTo,
            internalNotes,
        });
        await refetchLeads();
        setIsSaving(false);
        showToast('Request updated successfully!', 'success');
        navigate('/admin/finishing-requests');
    };

    if (loadingLeads || loadingPartners) {
        return <div className="p-8 text-center">Loading request details...</div>
    }

    if (!request) {
        return <div className="p-8 text-center">Request not found.</div>
    }

    return (
        <div>
            <Link to="/admin/finishing-requests" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 mb-4">
                <ChevronLeftIcon className={`w-5 h-5 ${language === 'ar' ? 'transform -scale-x-100' : ''}`} />
                <span className={`${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t_shared.backToRequests}</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t_req.requestDetails}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <DetailSection title={t_req.customerInformation}>
                        <DetailItem label={translations[language].customDecorationRequestModal.fullName} value={request.customerName} />
                        <DetailItem label={translations[language].customDecorationRequestModal.phone} value={<span dir="ltr">{request.customerPhone}</span>} />
                        <DetailItem label={translations[language].serviceRequestModal.preferredContactTime} value={request.contactTime} />
                    </DetailSection>

                    <DetailSection title={t_req.requestInformation}>
                         <DetailItem label={translations[language].dashboard.leadTable.service} value={request.serviceTitle} fullWidth />
                         <DetailItem label={translations[language].dashboard.leadTable.notes} value={<p className="whitespace-pre-wrap">{request.customerNotes || '-'}</p>} fullWidth />
                    </DetailSection>
                </div>

                <div className="space-y-8">
                     <DetailSection title={t_req.management}>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{translations[language].dashboard.leadTable.status}</label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className={`${selectClasses} ${statusColors[status]}`}>
                                {Object.entries(t_lead_status).map(([key, value]) => (
                                    <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{value}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t_finishing.assignedTo}</label>
                            <select id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={selectClasses}>
                                <option value="internal-team">{t_finishing.internalTeam}</option>
                                {finishingPartners.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t_req.internalNotes}</label>
                            <textarea
                                id="internalNotes"
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                rows={8}
                                className={inputClasses}
                            />
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

export default AdminFinishingRequestDetailsPage;