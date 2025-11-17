


import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequestById, addMessageToLead, updateRequest } from '../../services/requests';
import { useLanguage } from '../shared/LanguageContext';
import { useAuth } from '../auth/AuthContext';
// FIX: Import 'RequestStatus' type to resolve 'Cannot find name' error.
import { Request, Lead, LeadStatus, RequestType, Role, RequestStatus } from '../../types';
import { ArrowLeftIcon } from '../ui/Icons';
import DetailItem from '../shared/DetailItem';
import ConversationThread from '../shared/ConversationThread';
import UpdateLeadStatusModal from '../shared/UpdateLeadStatusModal';
import { Button } from '../ui/Button';

function mapLeadStatusToRequestStatus(leadStatus: LeadStatus): RequestStatus {
    switch (leadStatus) {
        case 'new': return 'new';
        case 'contacted':
        case 'site-visit':
        case 'quoted':
        case 'in-progress': return 'in-progress';
        case 'completed': return 'closed';
        case 'cancelled': return 'rejected';
        default: return 'pending';
    }
}

const PartnerLeadDetailsPage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

    const { data: request, isLoading, isError } = useQuery({
        queryKey: ['request', leadId],
        queryFn: () => getRequestById(leadId!),
        enabled: !!leadId,
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateLeadMutation = useMutation({
        mutationFn: async ({ status, note }: { status: LeadStatus; note: string }) => {
            if (!request || !currentUser) throw new Error("Missing data for update");
            
            const senderType = currentUser.role.includes('_manager') || currentUser.role === Role.SUPER_ADMIN ? 'admin' : 'partner';
            
            await addMessageToLead(request.id, {
                sender: senderType,
                senderId: currentUser.id,
                type: 'note',
                content: note,
            });

            const leadPayload = request.payload as Lead;
            leadPayload.status = status;
            
            await updateRequest(request.id, { 
                status: mapLeadStatusToRequestStatus(status), 
                payload: leadPayload 
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['request', leadId] });
            queryClient.invalidateQueries({ queryKey: [`partner-leads-${currentUser?.id}`] });
            setIsModalOpen(false);
        },
    });

    const lead = useMemo(() => {
        if (!request || request.type !== RequestType.LEAD) return null;
        return request.payload as Lead;
    }, [request]);

    if (isLoading) return <div className="p-8 text-center">Loading lead details...</div>;
    if (isError || !request || !lead) return <div className="p-8 text-center text-red-500">Could not load lead details.</div>;

    // Security check: ensure the current partner is the owner of this lead
    if (currentUser?.id !== lead.partnerId) {
        return <div className="p-8 text-center text-red-500">You are not authorized to view this lead.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {isModalOpen && (
                 <UpdateLeadStatusModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={(status, note) => updateLeadMutation.mutate({ status, note })}
                    currentStatus={lead.status}
                    isLoading={updateLeadMutation.isPending}
                />
            )}
            <Link to="/dashboard/leads" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Leads
            </Link>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
                <section>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{request.requesterInfo.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">{lead.serviceTitle}</p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>Update Status</Button>
                    </div>
                </section>
                
                <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-amber-500 mb-4">Customer Info</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem label="Name" value={request.requesterInfo.name} />
                        <DetailItem label="Phone" value={request.requesterInfo.phone} />
                     </div>
                </section>
                
                <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-amber-500 mb-4">Conversation History</h2>
                    <ConversationThread 
                        lead={lead} 
                        requestId={request.id}
                        onMessageSent={() => queryClient.invalidateQueries({ queryKey: ['request', leadId] })} 
                    />
                </section>
            </div>
        </div>
    );
};

export default PartnerLeadDetailsPage;