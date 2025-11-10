
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Language, PartnerRequest } from '../../types';
import { ChevronLeftIcon } from '../icons/Icons';
import { getAllPartnerRequests, updatePartnerRequestStatus } from '../../services/partnerRequests';
import { addPartner } from '../../services/partners';
import { useQuery } from '@tanstack/react-query';
import DetailItem from '../shared/DetailItem';
import DetailSection from '../shared/DetailSection';
import { useLanguage } from '../shared/LanguageContext';

const AdminPartnerRequestDetailsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { data: partnerRequests, isLoading: dataLoading, refetch } = useQuery({ queryKey: ['partnerRequests'], queryFn: getAllPartnerRequests });
    const [actionLoading, setActionLoading] = useState(false);
    
    const t_req = t.adminDashboard.adminRequests;
    const t_shared = t.adminShared;
    const t_plans = t.subscriptionPlans;

    const request = useMemo(() => {
        return (partnerRequests || []).find(r => r.id === requestId);
    }, [partnerRequests, requestId]);

    const planName = useMemo(() => {
        if (!request) return '';
        
        const plansForType = t_plans[request.companyType];
        
        if (plansForType && (plansForType as any)[request.subscriptionPlan]) {
            return ((plansForType as any)[request.subscriptionPlan] as { name: string }).name;
        }
        
        return request.subscriptionPlan;
    }, [t_plans, request]);

    const handleApprove = async () => {
        if (!request) return;
        setActionLoading(true);
        await addPartner(request);
        await updatePartnerRequestStatus(request.id, 'approved');
        refetch();
        setActionLoading(false);
        navigate('/admin/partner-requests');
    };

    const handleReject = async () => {
        if (!request) return;
        setActionLoading(true);
        await updatePartnerRequestStatus(request.id, 'rejected');
        refetch();
        setActionLoading(false);
        navigate('/admin/partner-requests');
    };

    if (dataLoading) {
        return <div className="text-center p-8">Loading request...</div>;
    }

    if (!request) {
        return <div className="text-center p-8">Request not found.</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center mb-6">
                <div>
                     <Link to="/admin/partner-requests" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 mb-2">
                        <ChevronLeftIcon className="w-5 h-5" />
                        {t_shared.backToRequests}
                    </Link>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t_req.table.details}: {request.companyName}
                    </h3>
                </div>
                {request.status === 'pending' && (
                    <div className="flex gap-3">
                         <button onClick={handleReject} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600" disabled={actionLoading}>{t_req.table.reject}</button>
                         <button onClick={handleApprove} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600" disabled={actionLoading}>{t_req.table.approve}</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <DetailSection title={t_req.table.companyInfo}>
                        <div className="flex items-start gap-4 mb-4">
                            <img src={request.logo} alt={`${request.companyName} logo`} className="w-20 h-20 rounded-full object-cover border"/>
                            <div className="flex-grow space-y-1">
                                <h4 className="font-bold text-lg">{request.companyName}</h4>
                                <p className="text-sm text-gray-500">{request.companyType}</p>
                            </div>
                        </div>
                        <DetailItem layout="grid" label={t.subscriptionPlan} value={planName} />
                        <DetailItem layout="grid" label={t.partnerRequestForm.companyAddress} value={request.companyAddress} />
                        <DetailItem layout="grid" label={t.partnerRequestForm.website} value={request.website ? <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{request.website}</a> : '-'} />
                        <DetailItem layout="grid" label={t.partnerRequestForm.companyDescription} value={<p className="whitespace-pre-line">{request.description}</p>} />
                    </DetailSection>

                    <DetailSection title={t_req.table.primaryContact}>
                        <DetailItem layout="grid" label={t.partnerRequestForm.contactName} value={request.contactName} />
                        <DetailItem layout="grid" label={t.partnerRequestForm.contactEmail} value={request.contactEmail} />
                        <DetailItem layout="grid" label={t.partnerRequestForm.contactPhone} value={request.contactPhone} />
                    </DetailSection>
                </div>
                <div>
                     {request.managementContacts.length > 0 && (
                        <DetailSection title={t_req.table.managementContacts}>
                           <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-left text-gray-500 dark:text-gray-400">
                                        <tr>
                                            <th className="py-1 font-medium">{t.partnerRequestForm.managementName}</th>
                                            <th className="py-1 font-medium">{t.partnerRequestForm.managementPosition}</th>
                                            <th className="py-1 font-medium">{t.partnerRequestForm.managementEmail}</th>
                                            <th className="py-1 font-medium">{t.partnerRequestForm.managementPhone}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {request.managementContacts.map((contact, index) => (
                                            <tr key={index}>
                                                <td className="py-2 text-gray-900 dark:text-white">{contact.name}</td>
                                                <td className="py-2">{contact.position}</td>
                                                <td className="py-2">{contact.email}</td>
                                                <td className="py-2">{contact.phone}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                           </div>
                        </DetailSection>
                    )}

                     {request.documents.length > 0 && (
                         <DetailSection title={t_req.table.documents}>
                             <ul className="space-y-2">
                                {request.documents.map((doc, index) => (
                                    <li key={index}>
                                        <a href={doc.fileContent} download={doc.fileName} className="text-blue-500 hover:underline flex items-center gap-2">
                                           {doc.fileName} ({t_req.table.download})
                                        </a>
                                    </li>
                                ))}
                             </ul>
                         </DetailSection>
                     )}
                </div>
            </div>
        </div>
    );
};

export default AdminPartnerRequestDetailsPage;
