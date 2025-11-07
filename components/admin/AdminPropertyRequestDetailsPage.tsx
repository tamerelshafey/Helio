

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Language, AddPropertyRequest, Property } from '../../types';
import { translations } from '../../data/translations';
import { ChevronLeftIcon } from '../icons/Icons';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../api/propertyRequests';
import { addProperty } from '../../api/properties';
import { useApiQuery } from '../shared/useApiQuery';
import DetailItem from '../shared/DetailItem';
import DetailSection from '../shared/DetailSection';

const AdminPropertyRequestDetailsPage: React.FC<{ language: Language }> = ({ language }) => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { data: propertyRequests, isLoading: loading, refetch } = useApiQuery('propertyRequests', getAllPropertyRequests);
    const [actionLoading, setActionLoading] = useState(false);

    const request = useMemo(() => {
        return (propertyRequests || []).find(r => r.id === requestId);
    }, [propertyRequests, requestId]);
    
    const t = translations[language].addPropertyPage;
    const t_admin = translations[language].adminDashboard;
    const t_shared = translations[language].adminShared;

    const handleApprove = async () => {
        if (!request) return;
        setActionLoading(true);
        
        const { propertyDetails: details } = request;

        const priceNumeric = details.price || 0;
        const formattedPriceAr = `${priceNumeric.toLocaleString('ar-EG')} ج.م`;
        const formattedPriceEn = `EGP ${priceNumeric.toLocaleString('en-US')}`;

        const pricePerMeterNumeric = Math.round(priceNumeric / (details.area || 1));
        const pricePerMeter = details.purpose.en === 'For Sale' && pricePerMeterNumeric > 0 ? {
            ar: `${pricePerMeterNumeric.toLocaleString('ar-EG')} ج.м/м²`,
            en: `EGP ${pricePerMeterNumeric.toLocaleString('en-US')}/m²`,
        } : undefined;

        const title = {
            ar: `${details.propertyType.ar} ${details.purpose.ar} في ${details.address.split(',')[0]}`,
            en: `${details.propertyType.en} ${details.purpose.en} in ${details.address.split(',')[0]}`,
        };

        const address = { ar: details.address, en: details.address };
        const description = { ar: details.description, en: details.description };

        const delivery = {
            isImmediate: details.deliveryType === 'immediate',
            date: details.deliveryType === 'future' ? `${details.deliveryYear}-${details.deliveryMonth?.padStart(2, '0')}` : undefined,
        };

        const installments = details.hasInstallments ? {
            downPayment: details.downPayment || 0,
            monthlyInstallment: details.monthlyInstallment || 0,
            years: details.years || 0,
        } : undefined;
        
        const newPropertyData: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'> = {
            partnerId: 'individual-listings', // Assign to the "Individual" partner
            status: details.purpose,
            type: details.propertyType,
            finishingStatus: details.finishingStatus,
            area: details.area,
            price: { ar: formattedPriceAr, en: formattedPriceEn },
            priceNumeric: priceNumeric,
            pricePerMeter: pricePerMeter,
            beds: details.bedrooms || 0,
            baths: details.bathrooms || 0,
            floor: details.floor,
            address: address,
            description: description,
            title: title,
            imageUrl: request.images[0] || '',
            gallery: request.images.slice(1),
            amenities: { ar: [], en: [] }, // No amenities in request form
            location: details.location,
            isInCompound: details.isInCompound,
            delivery: delivery,
            installmentsAvailable: details.hasInstallments,
            installments: installments,
            listingStartDate: details.listingStartDate,
            listingEndDate: details.listingEndDate,
            contactMethod: details.contactMethod,
            ownerPhone: request.customerPhone,
        };

        await addProperty(newPropertyData);
        await updatePropertyRequestStatus(request.id, 'approved');
        refetch();
        setActionLoading(false);
        navigate('/admin/property-requests');
    };
    
    const handleReject = async () => {
        if (!request) return;
        setActionLoading(true);
        await updatePropertyRequestStatus(request.id, 'rejected');
        refetch();
        setActionLoading(false);
        navigate('/admin/property-requests');
    }

    if (loading) {
        return <div className="text-center p-8">Loading request...</div>;
    }

    if (!request) {
        return <div className="text-center p-8">Request not found.</div>;
    }

    const details = request.propertyDetails;
    const cooperationModelText = t.cooperation[request.cooperationType]?.title || request.cooperationType;

    return (
        <div>
             <div className="pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center mb-6">
                 <div>
                     <Link to="/admin/property-requests" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 mb-2">
                        <ChevronLeftIcon className="w-5 h-5" />
                        {t_shared.backToRequests}
                    </Link>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t_admin.adminRequests.propertyDetailsTitle}</h3>
                 </div>
                 {request.status === 'pending' && (
                    <div className="flex gap-3">
                         <button onClick={handleReject} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600" disabled={actionLoading}>{t_admin.adminRequests.table.reject}</button>
                         <button onClick={handleApprove} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600" disabled={actionLoading}>{t_admin.adminRequests.table.approve}</button>
                    </div>
                )}
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailSection title={t.ownerInfo}>
                        <DetailItem label={t.fullName} value={request.customerName} />
                        <DetailItem label={t.phone} value={request.customerPhone} />
                        <DetailItem label={t.contactTime} value={request.contactTime} />
                        <DetailItem label={t_admin.adminRequests.cooperationType} value={cooperationModelText} />
                        {request.propertyDetails.contactMethod && (
                            <DetailItem label={t.contactPreference.title} value={t.contactPreference[request.propertyDetails.contactMethod]} />
                        )}
                    </DetailSection>
                    <DetailSection title={t.propertyInfo}>
                        <DetailItem label={t.purpose} value={details.purpose[language]} />
                        <DetailItem label={t.propertyType} value={details.propertyType[language]} />
                        <DetailItem label={t.finishingStatus} value={details.finishingStatus?.[language]} />
                        <DetailItem label={t.area} value={`${details.area.toLocaleString(language)} m²`} />
                        <DetailItem label={t.price} value={`${details.price.toLocaleString(language)} EGP`} />
                    </DetailSection>
                </div>
                 <DetailSection title="Key Details">
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <DetailItem label={t.bedrooms} value={details.bedrooms} />
                       <DetailItem label={t.bathrooms} value={details.bathrooms} />
                       <DetailItem label={t.floor} value={details.floor} />
                       <DetailItem label={t.inCompound} value={details.isInCompound ? t.yes : t.no} />
                    </dl>
                 </DetailSection>
                 <DetailSection title="Address & Description">
                     <DetailItem label={t.address} value={details.address} />
                     {details.description && <DetailItem label={t.description} value={details.description} />}
                 </DetailSection>
                  <DetailSection title="Delivery & Listing">
                    <DetailItem label={t.deliveryDate} value={details.deliveryType === 'immediate' ? t.immediate : `${t.future}: ${details.deliveryMonth}/${details.deliveryYear}`} />
                    <DetailItem label={t_admin.editPropertyModal.listingStartDate} value={details.listingStartDate} />
                    <DetailItem label={t_admin.editPropertyModal.listingEndDate} value={details.listingEndDate} />
                 </DetailSection>
                  {details.hasInstallments && (
                    <DetailSection title={t.installments}>
                        <dl className="grid grid-cols-3 gap-4">
                            <DetailItem label={t.downPayment} value={details.downPayment?.toLocaleString(language)} />
                            <DetailItem label={t.monthlyInstallment} value={details.monthlyInstallment?.toLocaleString(language)} />
                            <DetailItem label={t.years} value={details.years} />
                        </dl>
                    </DetailSection>
                 )}
                 {request.images && request.images.length > 0 && (
                     <DetailSection title={t.images}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {request.images.map((imgSrc, index) => (
                                <a key={index} href={imgSrc} target="_blank" rel="noopener noreferrer">
                                    <img src={imgSrc} alt={`Property image ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                </a>
                            ))}
                        </div>
                    </DetailSection>
                 )}
            </div>
        </div>
    );
};

export default AdminPropertyRequestDetailsPage;