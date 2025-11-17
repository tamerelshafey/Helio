


import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequestById, updateRequest } from '../../../services/requests';
import { addPartner } from '../../../services/partners';
import { addProperty } from '../../../services/properties';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
// FIX: Import missing types
import { Request, RequestType, Property, PartnerRequest } from '../../../types';
import DetailItem from '../../shared/DetailItem';
import { ArrowLeftIcon } from '../../ui/Icons';
import { Button } from '../../ui/Button';

const RequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const { showToast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: request, isLoading } = useQuery({ 
        queryKey: ['request', requestId], 
        queryFn: () => getRequestById(requestId!),
        enabled: !!requestId,
    });

    const mutation = useMutation({
        mutationFn: async ({ status, req }: { status: 'approved' | 'rejected', req: Request }) => {
            if (status === 'approved') {
                if (req.type === RequestType.PARTNER_APPLICATION) {
                    await addPartner(req.payload as any);
                } else if (req.type === RequestType.PROPERTY_LISTING_REQUEST) {
                    const r = req.payload as any;
                    const pd = r.propertyDetails;
                    // FIX: Correctly map the request payload to the Property type
                    const newProperty: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'> = {
                        partnerId: 'individual-listings',
                        title: { en: pd.address, ar: pd.address },
                        description: { en: pd.description, ar: pd.description },
                        price: { en: `EGP ${pd.price.toLocaleString()}`, ar: `${pd.price.toLocaleString('ar-EG')} ج.م` },
                        priceNumeric: pd.price,
                        imageUrl: r.images[0] || '',
                        gallery: r.images.slice(1),
                        listingStatus: 'active',
                        amenities: {en: [], ar: []},
                        status: pd.purpose,
                        type: { en: pd.propertyType.en as any, ar: pd.propertyType.ar },
                        finishingStatus: pd.finishingStatus ? { en: pd.finishingStatus.en, ar: pd.finishingStatus.ar } : undefined,
                        area: pd.area,
                        beds: pd.bedrooms || 0,
                        baths: pd.bathrooms || 0,
                        floor: pd.floor,
                        address: { en: pd.address, ar: pd.address },
                        location: pd.location,
                        isInCompound: pd.isInCompound,
                        installmentsAvailable: pd.hasInstallments,
                        realEstateFinanceAvailable: pd.realEstateFinanceAvailable,
                        delivery: {
                            isImmediate: pd.deliveryType === 'immediate',
                            date: pd.deliveryType === 'future' ? `${pd.deliveryYear}-${pd.deliveryMonth}` : undefined,
                        },
                        installments: pd.hasInstallments ? {
                            downPayment: pd.downPayment || 0,
                            monthlyInstallment: pd.monthlyInstallment || 0,
                            years: pd.years || 0,
                        } : undefined,
                        contactMethod: pd.contactMethod,
                        ownerPhone: pd.ownerPhone,
                        listingStartDate: pd.listingStartDate,
                        listingEndDate: pd.listingEndDate,
                    };
                    await addProperty(newProperty);
                }
            }
            await updateRequest(req.id, { status });
        },
        onSuccess: (_, variables) => {
            showToast(`Request has been ${variables.status}.`, 'success');
            queryClient.invalidateQueries({ queryKey: ['allRequests'] });
            navigate('/admin/requests');
        },
        onError: () => {
            showToast('Action failed. Please try again.', 'error');
        }
    });

    if (isLoading) return <div>Loading request...</div>;
    if (!request) return <div>Request not found.</div>;

    const renderPayload = () => {
        const { payload, type } = request;
        switch (type) {
            case RequestType.PARTNER_APPLICATION:
                const p = payload as any;
                return <div className="space-y-4">
                    <DetailItem label="Company" value={p.companyName} />
                    <DetailItem label="Type" value={p.companyType} />
                    <DetailItem label="Website" value={p.website} />
                    <DetailItem label="Description" value={<p className="whitespace-pre-line">{p.description}</p>} />
                </div>;
            case RequestType.PROPERTY_LISTING_REQUEST:
                const r = payload as any;
                return <div className="space-y-4">
                    <DetailItem label="Type" value={r.propertyDetails.propertyType[language]} />
                    <DetailItem label="Area" value={`${r.propertyDetails.area}m²`} />
                    <DetailItem label="Price" value={`EGP ${r.propertyDetails.price.toLocaleString()}`} />
                    <DetailItem label="Address" value={r.propertyDetails.address} />
                </div>;
            default:
                return <p className="whitespace-pre-line">{JSON.stringify(payload, null, 2)}</p>
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/admin/requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to All Requests
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Request Details</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-amber-500 mb-4">Requester Info</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailItem label="Name" value={request.requesterInfo.name} />
                        <DetailItem label="Phone" value={request.requesterInfo.phone} />
                        <DetailItem label="Email" value={request.requesterInfo.email} />
                     </div>
                </section>
                <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                     <h2 className="text-xl font-bold text-amber-500 mb-4">Request Payload</h2>
                     {renderPayload()}
                </section>

                {(request.status === 'new' || request.status === 'reviewed' || request.status === 'assigned') && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                         {(request.type === RequestType.PARTNER_APPLICATION || request.type === RequestType.PROPERTY_LISTING_REQUEST) && (
                            <>
                                <Button onClick={() => mutation.mutate({ status: 'rejected', req: request })} isLoading={mutation.isPending} variant="danger">
                                    {t.adminShared.reject}
                                </Button>
                                <Button onClick={() => mutation.mutate({ status: 'approved', req: request })} isLoading={mutation.isPending} variant="success">
                                    {t.adminShared.approve}
                                </Button>
                            </>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestDetailsPage;