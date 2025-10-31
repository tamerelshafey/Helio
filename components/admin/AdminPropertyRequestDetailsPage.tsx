import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Language, AddPropertyRequest } from '../../types';
import { translations } from '../../data/translations';
import { useData } from '../shared/DataContext';
import { ChevronLeftIcon } from '../icons/Icons';

const DetailItem: React.FC<{ label: string; value?: string | number | null | boolean }> = ({ label, value }) => (
    value !== undefined && value !== null && value !== '' ? (
        <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-md text-gray-900 dark:text-white">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</dd>
        </div>
    ) : null
);

const AdminPropertyRequestDetailsPage: React.FC<{ language: Language }> = ({ language }) => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { propertyRequests, approvePropertyRequest, rejectPropertyRequest, loading } = useData();

    const request = useMemo(() => {
        return propertyRequests.find(r => r.id === requestId);
    }, [propertyRequests, requestId]);
    
    const t = translations[language].addPropertyPage;
    const t_admin = translations[language].adminDashboard;

    const handleApprove = async () => {
        if (!request) return;
        await approvePropertyRequest(request);
        navigate('/admin/property-requests');
    };
    
    const handleReject = async () => {
        if (!request) return;
        await rejectPropertyRequest(request.id);
        navigate('/admin/property-requests');
    }

    if (loading) {
        return <div className="text-center p-8">Loading request...</div>;
    }

    if (!request) {
        return <div className="text-center p-8">Request not found.</div>;
    }

    const details = request.propertyDetails;

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
             <div className="pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center mb-6">
                 <div>
                     <Link to="/admin/property-requests" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 mb-2">
                        <ChevronLeftIcon className="w-5 h-5" />
                        Back to requests
                    </Link>
                    <h3 className="text-2xl font-bold text-amber-500">{t_admin.adminRequests.propertyDetailsTitle}</h3>
                 </div>
                 {request.status === 'pending' && (
                    <div className="flex gap-3">
                         <button onClick={handleReject} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">{t_admin.adminRequests.table.reject}</button>
                         <button onClick={handleApprove} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600">{t_admin.adminRequests.table.approve}</button>
                    </div>
                )}
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="font-semibold">{t.ownerInfo}</h4>
                        <DetailItem label={t.fullName} value={request.customerName} />
                        <DetailItem label={t.phone} value={request.customerPhone} />
                        <DetailItem label={t.contactTime} value={request.contactTime} />
                    </div>
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="font-semibold">{t.propertyInfo}</h4>
                        <DetailItem label={t.purpose} value={details.purpose[language]} />
                        <DetailItem label={t.propertyType} value={details.propertyType[language]} />
                        <DetailItem label={t.finishingStatus} value={details.finishingStatus?.[language]} />
                        <DetailItem label={t.area} value={`${details.area.toLocaleString(language)} m²`} />
                        <DetailItem label={t.price} value={`${details.price.toLocaleString(language)} EGP`} />
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <DetailItem label={t.bedrooms} value={details.bedrooms} />
                       <DetailItem label={t.bathrooms} value={details.bathrooms} />
                       <DetailItem label={t.floor} value={details.floor} />
                       <DetailItem label={t.inCompound} value={details.isInCompound ? t.yes : t.no} />
                    </dl>
                 </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                     <DetailItem label={t.address} value={details.address} />
                     {details.description && <DetailItem label={t.description} value={details.description} />}
                 </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-2">{t.deliveryDate}</h4>
                    <DetailItem label={t.deliveryDate} value={details.deliveryType === 'immediate' ? t.immediate : `${t.future}: ${details.deliveryMonth}/${details.deliveryYear}`} />
                    <DetailItem label={t_admin.editPropertyModal.listingStartDate} value={details.listingStartDate} />
                    <DetailItem label={t_admin.editPropertyModal.listingEndDate} value={details.listingEndDate} />
                 </div>
                  {details.hasInstallments && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="font-semibold mb-2">{t.installments}</h4>
                        <dl className="grid grid-cols-3 gap-4">
                            <DetailItem label={t.downPayment} value={details.downPayment?.toLocaleString(language)} />
                            <DetailItem label={t.monthlyInstallment} value={details.monthlyInstallment?.toLocaleString(language)} />
                            <DetailItem label={t.years} value={details.years} />
                        </dl>
                    </div>
                 )}
                 {request.images && request.images.length > 0 && (
                     <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="font-semibold mb-2">{t.images}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {request.images.map((imgSrc, index) => (
                                <a key={index} href={imgSrc} target="_blank" rel="noopener noreferrer">
                                    <img src={imgSrc} alt={`Property image ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                </a>
                            ))}
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default AdminPropertyRequestDetailsPage;
