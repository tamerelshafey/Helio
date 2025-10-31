import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Language, PartnerRequest } from '../../types';
import { translations } from '../../data/translations';
import { useData } from '../shared/DataContext';
import { ChevronLeftIcon } from '../icons/Icons';

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-lg font-semibold text-amber-500 mb-3">{title}</h4>
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => (
    value ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 col-span-2">{value}</dd>
        </div>
    ) : null
);

const AdminPartnerRequestDetailsPage: React.FC<{ language: Language }> = ({ language }) => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { partnerRequests, approvePartnerRequest, rejectPartnerRequest, loading: dataLoading } = useData();
    const [actionLoading, setActionLoading] = useState(false);
    
    const t = translations[language].adminDashboard.adminRequests;

    const request = useMemo(() => {
        return partnerRequests.find(r => r.id === requestId);
    }, [partnerRequests, requestId]);

    const handleApprove = async () => {
        if (!request) return;
        setActionLoading(true);
        await approvePartnerRequest(request);
        setActionLoading(false);
        navigate('/admin/partner-requests');
    };

    const handleReject = async () => {
        if (!request) return;
        setActionLoading(true);
        await rejectPartnerRequest(request.id);
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
                        Back to requests
                    </Link>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t.table.details}: {request.companyName}
                    </h3>
                </div>
                {request.status === 'pending' && (
                    <div className="flex gap-3">
                         <button onClick={handleReject} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600" disabled={actionLoading}>{t.table.reject}</button>
                         <button onClick={handleApprove} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600" disabled={actionLoading}>{t.table.approve}</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <DetailSection title={t.table.companyInfo}>
                        <div className="flex items-start gap-4">
                            <img src={request.logo} alt={`${request.companyName} logo`} className="w-20 h-20 rounded-full object-cover border"/>
                            <div className="flex-grow space-y-1">
                                <DetailItem label={translations[language].partnerRequestForm.companyName} value={request.companyName} />
                                <DetailItem label={translations[language].partnerRequestForm.companyType} value={request.companyType} />
                                <DetailItem label={translations[language].partnerRequestForm.companyAddress} value={request.companyAddress} />
                                <DetailItem label={translations[language].partnerRequestForm.website} value={request.website ? <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{request.website}</a> : '-'} />
                                <DetailItem label={translations[language].partnerRequestForm.companyDescription} value={request.description} />
                            </div>
                        </div>
                    </DetailSection>

                    <DetailSection title={t.table.primaryContact}>
                        <DetailItem label={translations[language].partnerRequestForm.contactName} value={request.contactName} />
                        <DetailItem label={translations[language].partnerRequestForm.contactEmail} value={request.contactEmail} />
                        <DetailItem label={translations[language].partnerRequestForm.contactPhone} value={request.contactPhone} />
                    </DetailSection>
                </div>
                <div>
                     {request.managementContacts.length > 0 && (
                        <DetailSection title={t.table.managementContacts}>
                           <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-left text-gray-500 dark:text-gray-400">
                                        <tr>
                                            <th className="py-1 font-medium">{translations[language].partnerRequestForm.managementName}</th>
                                            <th className="py-1 font-medium">{translations[language].partnerRequestForm.managementPosition}</th>
                                            <th className="py-1 font-medium">{translations[language].partnerRequestForm.managementEmail}</th>
                                            <th className="py-1 font-medium">{translations[language].partnerRequestForm.managementPhone}</th>
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
                         <DetailSection title={t.table.documents}>
                             <ul className="space-y-2">
                                {request.documents.map((doc, index) => (
                                    <li key={index}>
                                        <a href={doc.fileContent} download={doc.fileName} className="text-blue-500 hover:underline flex items-center gap-2">
                                           {doc.fileName} ({t.table.download})
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
