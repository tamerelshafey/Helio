import { leadsData } from '../data/leads';
import type { Lead, LeadStatus } from '../types';
import { addNotification } from './notifications';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllLeads = async (): Promise<Lead[]> => {
    await delay(200);
    return [...leadsData];
};

export const getLeadsByPartnerId = async (partnerId: string): Promise<Lead[]> => {
    await delay(200);
    return leadsData.filter(lead => lead.partnerId === partnerId);
};

export const addLead = async (lead: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    await delay(500);
    const newLead: Lead = {
        ...lead,
        id: `lead-${Date.now()}`,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    leadsData.unshift(newLead);
    
    const notifyUserId = newLead.managerId || newLead.partnerId;
    addNotification({
        userId: notifyUserId,
        message: {
            en: `You have a new lead from "${newLead.customerName}".`,
            ar: `لديك طلب عميل جديد من "${newLead.customerName}".`,
        },
        link: `/dashboard/leads`, // Assuming this is the correct link for all roles
    });

    return newLead;
};

export const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead | undefined> => {
    await delay(100);
    const lead = leadsData.find(l => l.id === id);
    if (lead) {
        Object.assign(lead, { ...updates, updatedAt: new Date().toISOString() });
        return lead;
    }
    return undefined;
};

export const deleteLead = async (id: string): Promise<boolean> => {
    await delay(100);
    // FIX: Use splice to mutate the array directly instead of reassigning the import.
    const index = leadsData.findIndex(l => l.id === id);
    if (index > -1) {
        leadsData.splice(index, 1);
        return true;
    }
    return false;
};
