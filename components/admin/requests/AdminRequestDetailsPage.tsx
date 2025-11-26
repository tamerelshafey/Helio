

import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequestById, updateRequest, addMessageToLead } from '../../../services/requests';
import { getAllPartnersForAdmin, addPartner } from '../../../services/partners';
import { addProperty } from '../../../services/properties';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { useAuth } from '../../auth/AuthContext';
import { Request, RequestType, Property, RequestStatus, Role, LeadStatus } from '../../../types';
import DetailItem from '../../shared/DetailItem';
import { ArrowLeftIcon, CheckCircleIcon, UserPlusIcon, BuildingIcon } from '../../ui/Icons';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Select } from '../../ui/Select';
import { Textarea } from '../../ui/Textarea';
import ConversationThread from '../../shared/ConversationThread';

const AdminRequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const { showToast } = useToast();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: request, isLoading } = useQuery({ 
        queryKey: ['request', requestId], 
        queryFn: () => getRequestById(requestId!),
        enabled: !!requestId,
    });
    
    const { data: partners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const managers = useMemo(() => (partners || []).filter(p => p.role.includes('_manager') || p.role === Role.SUPER_ADMIN), [partners]);

    // Form state for "Action Panel"
    const [actionStatus, setActionStatus] = useState<RequestStatus | LeadStatus>('pending');
    const [actionAssignee, setActionAssignee] = useState<string>('');
    const [actionNote, setActionNote] = useState<string>('');

    // Sync local state with request data when loaded
    React.useEffect(() => {
        if (request) {
            if (request.type === RequestType.LEAD) {
                 setActionStatus((request.payload as any).status);
            } else {
                 setActionStatus(request.status);
            }
            setActionAssignee(request.assignedTo || '');
        }
    }, [request]);

    const statusOptions = useMemo(() => {
        if (!request) return [];
        if (request.type === RequestType.LEAD) {
            return Object.entries(t.dashboard.leadStatus).map(([key, value]) => ({ key, value }));
        }
        return Object.entries(t_admin.requestStatus).map(([key, value]) => ({ key, value }));
    }, [request, t, t_admin]);


    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!request || !currentUser) return;
            
            const updates: any = {
                assignedTo: actionAssignee
            };
            
            let statusToSave = actionStatus;
            
            // Special handling for LEAD status vs REQUEST status mapping
            if (request.type === RequestType.LEAD) {
                 // Update payload status for Lead
                 updates.payload = { ...(request.payload as any), status: actionStatus };
                 
                 // Map Lead status to Request status for the parent object
                 if (['contacted', 'quoted', 'site-visit'].includes(actionStatus as string)) statusToSave = 'in-progress';
                 if (actionStatus === 'completed') statusToSave = 'closed';
                 if (actionStatus === 'cancelled') statusToSave = 'rejected';
                 if (actionStatus === 'new') statusToSave = 'new';
            }
            
            updates.status = statusToSave;

            // 1. Add Note if present (Required for significant changes usually, but optional here for flexibility)
            if (actionNote.trim()) {
                const senderType = currentUser.role === Role.SUPER_ADMIN || currentUser.role.includes('_manager') ? 'admin' : 'partner';
                // If it's a lead, add to conversation thread. If generic request, we might need a generic notes system,
                // but for now we reuse the Lead Message structure if possible or just logs.
                // *Limitation*: Current backend mock 'addMessageToLead' assumes Lead payload structure.
                // For generic requests, we can treat them like leads if we normalized the payload, 
                // or we can just update the request. 
                // For this implementation, we'll assume Lead-like structure for messages or just skip if not supported.
                
                try {
                     await addMessageToLead(request.id, {
                        sender: senderType,
                        senderId: currentUser.id,
                        type: 'note',
                        content: actionNote
                    });
                } catch (e) {
                    // Fallback for non-lead requests that don't support messages array yet in mock
                    console.log("Note added to request log (simulated):", actionNote);
                }
            }
            
            // 2. Update Request
            await updateRequest(request.id, updates);
        },
        onSuccess: () => {
            showToast('Request updated successfully', 'success');
            setActionNote(''); // Clear note
            queryClient.invalidateQueries({ queryKey: ['request', requestId] });
            queryClient.invalidateQueries({ queryKey: ['allRequests'] });
        },
        onError: () => showToast('Failed to update request', 'error')
    });
    
    const approvalMutation = useMutation({
        mutationFn: async (action: 'approved' | 'rejected') => {
            if (!request) return;
            if (action === 'approved') {
                if (request.type === RequestType.PARTNER_APPLICATION) {
                    await addPartner(request.payload as any);
                } else if (request.type === RequestType.PROPERTY_LISTING_REQUEST) {
                     // ... (Existing property creation logic) ...
                     const r = request.payload as any;
                     const pd = r.propertyDetails;
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
            await updateRequest(request.id, { status: action });
        },
        onSuccess: (_, action) => {
             showToast(`Request ${action}.`, 'success');
             queryClient.invalidateQueries({ queryKey: ['request', requestId] });
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
                    
                     {p.documents && p.documents.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">Documents</p>
                            <ul className="list-disc list-inside text-sm text-blue-600">
                                {p.documents.map((doc: any, i: number) => (
                                    <li key={i}><a href={doc.fileContent} download={doc.fileName}>{doc.fileName}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>;
            case RequestType.PROPERTY_LISTING_REQUEST:
                const r = payload as any;
                 return <div className="space-y-4">
                    <DetailItem label="Type" value={r.propertyDetails.propertyType[language]} />
                    <DetailItem label="Area" value={`${r.propertyDetails.area}m²`} />
                    <DetailItem label="Price" value={`EGP ${r.propertyDetails.price.toLocaleString()}`} />
                    <DetailItem label="Address" value={r.propertyDetails.address} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        {r.images && r.images.map((img: string, idx: number) => (
                             <img key={idx} src={img} alt="Property" className="w-full h-24 object-cover rounded-md" />
                        ))}
                    </div>
                </div>;
            case RequestType.LEAD:
                 const l = payload as any;
                 return <div className="space-y-4">
                     <DetailItem label="Service Type" value={l.serviceType} />
                     <DetailItem label="Service Title" value={l.serviceTitle} />
                     <DetailItem label="Initial Notes" value={l.customerNotes} />
                 </div>;
            default:
                return <p className="whitespace-pre-line">{JSON.stringify(payload, null, 2)}</p>
        }
    };
    
    const showApprovalActions = ['new', 'pending', 'reviewed'].includes(request.status) && (request.type === RequestType.PARTNER_APPLICATION || request.type === RequestType.PROPERTY_LISTING_REQUEST);

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn">
            <Link to="/admin/requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to All Requests
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN: INFO */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                         <CardHeader>
                             <div className="flex justify-between items-center">
                                 <CardTitle>Request Details</CardTitle>
                                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 capitalize">
                                     {request.type.replace(/_/g, ' ')}
                                 </span>
                             </div>
                         </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                     <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Requester</h4>
                                     <p className="font-bold text-lg">{request.requesterInfo.name}</p>
                                     <p className="text-gray-600">{request.requesterInfo.phone}</p>
                                     <p className="text-gray-600">{request.requesterInfo.email}</p>
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Metadata</h4>
                                     <DetailItem label="Created" value={new Date(request.createdAt).toLocaleString()} />
                                     <DetailItem label="Request ID" value={request.id} />
                                 </div>
                             </div>
                             
                             <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                 <h4 className="text-sm font-medium text-gray-500 uppercase mb-4">Payload Data</h4>
                                 {renderPayload()}
                             </div>
                             
                             {/* Approval Actions for Applications */}
                             {showApprovalActions && (
                                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-4">
                                     <Button 
                                        onClick={() => approvalMutation.mutate('approved')} 
                                        isLoading={approvalMutation.isPending} 
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                     >
                                         {request.type === RequestType.PARTNER_APPLICATION ? <UserPlusIcon className="w-4 h-4" /> : <BuildingIcon className="w-4 h-4" />}
                                         Approve & Create {request.type === RequestType.PARTNER_APPLICATION ? 'Partner' : 'Listing'}
                                     </Button>
                                     <Button 
                                        onClick={() => approvalMutation.mutate('rejected')} 
                                        isLoading={approvalMutation.isPending} 
                                        variant="danger"
                                     >
                                         Reject Request
                                     </Button>
                                 </div>
                             )}
                        </CardContent>
                    </Card>

                    {/* Conversation History */}
                    <Card>
                        <CardHeader><CardTitle>Conversation & History</CardTitle></CardHeader>
                        <CardContent>
                             <ConversationThread 
                                lead={request.type === RequestType.LEAD ? (request.payload as any) : { messages: (request.payload as any).messages || [] } } 
                                requestId={request.id} 
                                onMessageSent={() => queryClient.invalidateQueries({ queryKey: ['request', requestId] })} 
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: MANAGEMENT PANEL */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-t-4 border-t-amber-500 sticky top-6">
                        <CardHeader><CardTitle>Management Panel</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                                <Select value={actionStatus as string} onChange={(e) => setActionStatus(e.target.value as any)}>
                                    {statusOptions.map(opt => (
                                        <option key={opt.key} value={opt.key}>{opt.value as string}</option>
                                    ))}
                                </Select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Assignee</label>
                                <Select value={actionAssignee} onChange={(e) => setActionAssignee(e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {managers.map(m => (
                                        <option key={m.id} value={m.id}>{language === 'ar' ? m.nameAr : m.name}</option>
                                    ))}
                                </Select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Internal Note (Optional)</label>
                                <Textarea 
                                    value={actionNote} 
                                    onChange={(e) => setActionNote(e.target.value)} 
                                    rows={3} 
                                    placeholder="Reason for change or internal comment..."
                                />
                            </div>
                            
                            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending} className="w-full flex justify-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                Update Request
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminRequestDetailsPage;