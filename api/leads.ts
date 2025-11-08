// Note: This is a mock API. In a real application, these functions would make network requests
// to a backend service. The data is modified in-memory for simulation purposes.

import { leadsData } from '../data/leads';
import type { Lead, LeadStatus, PartnerType, LeadMessage } from '../types';
import { getPartnerById, getAllPartners } from './partners';
import { addNotification } from './notifications';

const SIMULATED_DELAY = 300;

// FIX: `getPartnerById` is async, so this function must be async and await the result.
const populateLeadWithPartnerInfo = async (lead: Lead): Promise<Lead & { partnerName?: string }> => {
    const partner = await getPartnerById(lead.partnerId);
    return { ...lead, partnerName: partner?.name };
};

export const getLeadsByPartnerId = (partnerId: string): Promise<Lead[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const partnerLeads = leadsData.filter(l => l.partnerId === partnerId)
                                         .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(partnerLeads);
        }, SIMULATED_DELAY);
    });
};

// FIX: This function now handles the async nature of `populateLeadWithPartnerInfo` using Promise.all.
export const getAllLeads = (): Promise<(Lead & { partnerName?: string })[]> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const populatedLeadsPromises = leadsData.map(populateLeadWithPartnerInfo);
            const populatedLeads = await Promise.all(populatedLeadsPromises);
            const allLeads = populatedLeads
                                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(allLeads);
        }, SIMULATED_DELAY);
    });
};

export const addLead = (leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<Lead> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const now = new Date().toISOString();
            
            const newLead: Lead = {
                ...leadData,
                id: `lead-${Date.now()}`,
                status: 'new',
                createdAt: now,
                updatedAt: now,
                messages: [],
            };
            leadsData.unshift(newLead);

            const targetUserId = newLead.managerId || newLead.partnerId;
            const link = newLead.managerId 
                ? (newLead.serviceType === 'finishing' ? '/admin/finishing-requests' : '/admin/decoration-requests')
                : '/dashboard/leads';

            addNotification({
                userId: targetUserId,
                message: {
                  ar: `لديك طلب عميل جديد من "${newLead.customerName}".`,
                  en: `New lead from "${newLead.customerName}".`,
                },
                link: link,
            });

            resolve(newLead);
        }, SIMULATED_DELAY);
    });
};

export const updateLead = (leadId: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const leadIndex = leadsData.findIndex(l => l.id === leadId);
            if (leadIndex > -1) {
                leadsData[leadIndex] = { ...leadsData[leadIndex], ...updates, updatedAt: new Date().toISOString() };
                resolve(leadsData[leadIndex]);
            } else {
                resolve(undefined);
            }
        }, SIMULATED_DELAY);
    });
};

export const addMessageToLead = (leadId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Lead | undefined> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const leadIndex = leadsData.findIndex(l => l.id === leadId);
            if (leadIndex > -1) {
                const lead = leadsData[leadIndex];
                const newMessage: LeadMessage = {
                    ...messageData,
                    id: `msg-${leadId}-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                };
                lead.messages.push(newMessage);
                lead.updatedAt = new Date().toISOString();
                
                // If a partner or admin sends a message, change status from 'new' to 'contacted'
                if (lead.status === 'new' && (messageData.sender === 'partner' || messageData.sender === 'admin')) {
                    lead.status = 'contacted';
                }

                resolve(lead);
            } else {
                reject(new Error('Lead not found'));
            }
        }, SIMULATED_DELAY);
    });
};

export const deleteLead = (leadId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = leadsData.length;
            const newData = leadsData.filter(l => l.id !== leadId);
            if (newData.length < initialLength) {
                leadsData.length = 0;
                Array.prototype.push.apply(leadsData, newData);
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};