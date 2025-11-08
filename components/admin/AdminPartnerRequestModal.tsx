
import React, { useEffect, useRef, useState } from 'react';
import type { Language, PartnerRequest } from '../../types';
import { translations } from '../../data/translations';
import { CloseIcon } from '../icons/Icons';
import { addPartner } from '../../api/partners';
import { updatePartnerRequestStatus } from '../../api/partnerRequests';
import { useLanguage } from '../shared/LanguageContext';

interface AdminPartnerRequestModalProps {
    request: PartnerRequest;
    onClose: () => void;
    onSave: () => void; // Added for consistency with other modals, triggers refetch
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-lg font-semibold text-amber-500 mb-3">{title}</h4>
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => (
    value ? (
        <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white col-span-2">{value}</dd>
        </div>
    ) : null
);

const AdminPartnerRequestModal: React.FC<AdminPartnerRequestModalProps> = ({ request, onClose, onSave }) => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.adminRequests;
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleApprove = async () => {
        setLoading(true);
        await addPartner(request);
        await updatePartnerRequestStatus(request.id, 'approved');
        setLoading(false);
        onSave();
        onClose();
    };

    const handleReject = async () => {
        setLoading(true);
        await updatePartnerRequestStatus(request.id, 'rejected');
        setLoading(false);
        onSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t.table.details}: {request.companyName}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
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

                    {request.managementContacts.length > 0 && (
                        <DetailSection title={t.table.managementContacts}>
                           <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-left">
                                        <tr>
                                            <th className="py-1">{translations[language].partnerRequestForm.managementName}</th>
                                            <th className="py-1">{translations[language].partnerRequestForm.managementPosition}</th>
                                            <th className="py-1">{translations[language].partnerRequestForm.managementEmail}</th>
                                            <th className="py-1">{translations[language].partnerRequestForm.managementPhone}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {request.managementContacts.map((contact, index) => (
                                            <tr key={index}>
                                                <td className="py-2">{contact.name}</td>
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

                <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" disabled={loading}>{language === 'ar' ? 'إغلاق' : 'Close'}</button>
                    {request.status === 'pending' && (
                        <>
                            <button onClick={handleReject} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600" disabled={loading}>{t.table.reject}</button>
                            <button onClick={handleApprove} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600" disabled={loading}>{t.table.approve}</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPartnerRequestModal;
