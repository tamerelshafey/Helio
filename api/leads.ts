import { leadsData } from '../data/leads';
import type { Lead, LeadStatus } from '../types';
import { getPartnerById } from './partners';

const SIMULATED_DELAY = 300;

const populateLeadWithPartnerInfo = (lead: Lead): Lead & { partnerName?: string } => {
    const partner = getPartnerById(lead.partnerId);
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

export const getAllLeads = (): Promise<(Lead & { partnerName?: string })[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allLeads = leadsData.map(populateLeadWithPartnerInfo)
                                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(allLeads);
        }, SIMULATED_DELAY);
    });
};

export const addLead = (leadData: Omit<Lead, 'id' | 'status' | 'createdAt'>): Promise<Lead> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newLead: Lead = {
                ...leadData,
                id: `lead-${Date.now()}`,
                status: 'new',
                createdAt: new Date().toISOString(),
            };
            leadsData.unshift(newLead);
            resolve(newLead);
        }, SIMULATED_DELAY);
    });
};

export const updateLeadStatus = (leadId: string, status: LeadStatus): Promise<Lead | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const leadIndex = leadsData.findIndex(l => l.id === leadId);
            if (leadIndex > -1) {
                leadsData[leadIndex].status = status;
                resolve(leadsData[leadIndex]);
            } else {
                resolve(undefined);
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
