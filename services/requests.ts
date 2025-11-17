


import { requestsData } from '../data/requests';
import { RequestType } from '../types';
// FIX: Add Lead, LeadMessage, and LeadStatus types for new function
import type { Request, RequestStatus, Lead, LeadMessage, LeadStatus } from '../types';
import { addNotification } from './notifications';
import { getAllRoutingRules } from './routingRules';
import { getPartnerById } from './partners';

// Create a mutable, in-memory copy of the data to simulate a database.
let localRequestsData: Request[] = [...requestsData];

const SIMULATED_DELAY = 300;

// Helper to access nested properties of an object using a string path
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const checkCondition = (request: Request, condition: any): boolean => {
    const value = getNestedValue(request, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
        case 'equals': return value == conditionValue;
        case 'not_equals': return value != conditionValue;
        case 'contains': return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
        case 'greater_than':
        case 'less_than':
             const numValue = parseFloat(value);
             const numConditionValue = parseFloat(conditionValue);
             if (isNaN(numValue) || isNaN(numConditionValue)) return false;
             return condition.operator === 'greater_than' ? numValue > numConditionValue : numValue < numConditionValue;
        default: return false;
    }
}


export const getAllRequests = (): Promise<Request[]> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
             const populatedRequests = await Promise.all(localRequestsData.map(async (req) => {
                if (req.assignedTo) {
                    const partner = await getPartnerById(req.assignedTo);
                    return { ...req, assignedToName: partner?.name || req.assignedTo };
                }
                return req;
            }));
            resolve([...populatedRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, SIMULATED_DELAY);
    });
};

export const getRequestById = (id: string): Promise<Request | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(localRequestsData.find(r => r.id === id));
        }, SIMULATED_DELAY);
    });
};

export const addRequest = async (type: RequestType, data: Omit<Request, 'id' | 'type' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
    const newRequest: Request = {
        ...data,
        id: `req-${Date.now()}`,
        type,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // --- Dynamic Routing Logic ---
    const rules = await getAllRoutingRules();
    const activeRules = rules.filter(r => r.active);
    
    for (const rule of activeRules) {
        const isMatch = rule.conditions.every(condition => checkCondition(newRequest, condition));
        if (isMatch) {
            newRequest.assignedTo = rule.action.assignTo;
            newRequest.status = 'assigned';
            break; // Apply first matching rule
        }
    }
    // --- End Dynamic Routing Logic ---

    // If no rule matched, assign based on type
    if (!newRequest.assignedTo) {
        switch(type) {
            case RequestType.LEAD:
                newRequest.assignedTo = (data.payload as any).managerId || (data.payload as any).partnerId || 'service-manager-1';
                break;
            case RequestType.PARTNER_APPLICATION:
                newRequest.assignedTo = 'partner-relations-manager-1';
                break;
            case RequestType.PROPERTY_LISTING_REQUEST:
            case RequestType.PROPERTY_INQUIRY:
            case RequestType.CONTACT_MESSAGE:
            default:
                newRequest.assignedTo = 'customer-relations-manager-1';
                break;
        }
    }
    
    localRequestsData.unshift(newRequest);

    // Notification Logic
    if (newRequest.assignedTo) {
         const assignee = await getPartnerById(newRequest.assignedTo);
        const isAdminOrManager = assignee?.role.includes('_manager') || assignee?.role === 'admin';
        
        addNotification({
            userId: newRequest.assignedTo,
            message: {
                ar: `لديك طلب جديد من "${data.requesterInfo.name}".`,
                en: `New ${type.toLowerCase().replace(/_/g, ' ')} from "${data.requesterInfo.name}".`,
            },
            link: isAdminOrManager ? `/admin/requests/${newRequest.id}` : `/dashboard/leads`,
        });
    }

    return newRequest;
};

export const updateRequest = (id: string, updates: Partial<Request>): Promise<Request | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = localRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                localRequestsData[requestIndex] = { ...localRequestsData[requestIndex], ...updates, updatedAt: new Date().toISOString() };
                resolve(localRequestsData[requestIndex]);
            }
            resolve(undefined);
        }, SIMULATED_DELAY);
    });
};

// FIX: Add missing 'addMessageToLead' function to support unified request handling for leads.
export const addMessageToLead = (requestId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Request | undefined> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const requestIndex = localRequestsData.findIndex(r => r.id === requestId);
            if (requestIndex > -1) {
                const request = localRequestsData[requestIndex];
                if (request.type !== RequestType.LEAD) {
                    return reject(new Error('Request is not a lead'));
                }
                
                const leadPayload = request.payload as Partial<Lead>;
                if (!leadPayload.messages) {
                    leadPayload.messages = [];
                }
                
                const newMessage: LeadMessage = {
                    ...messageData,
                    id: `msg-${requestId}-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                };
                leadPayload.messages.push(newMessage);
                request.updatedAt = new Date().toISOString();

                // if 'status' doesn't exist on payload, initialize it.
                if (!leadPayload.status) {
                    leadPayload.status = request.status as any;
                }
                
                if (leadPayload.status === 'new' && (messageData.sender === 'partner' || messageData.sender === 'admin')) {
                    // Update the status inside the payload to a LeadStatus
                    leadPayload.status = 'contacted';
                    // also update top-level status to a valid RequestStatus
                    request.status = 'in-progress';
                }
                
                resolve(request);
            } else {
                reject(new Error('Request not found'));
            }
        }, SIMULATED_DELAY);
    });
};