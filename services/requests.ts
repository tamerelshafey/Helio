





import { requestsData } from '../data/requests';
import { RequestType, Role } from '../types';
import type { Request, RequestStatus, Lead, LeadMessage, LeadStatus } from '../types';
import { addNotification } from './notifications';
import { getAllRoutingRules } from './routingRules';
import { getPartnerById } from './partners';
import { getLeadById } from './leads';

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
        setTimeout(async () => {
            let request = localRequestsData.find(r => r.id === id);
            
            // Fallback: if not found in requestsData, look in leadsData and wrap it
            if (!request) {
                const lead = await getLeadById(id);
                if (lead) {
                    request = {
                        id: lead.id,
                        type: RequestType.LEAD,
                        status: 'assigned', // Assuming active leads are assigned
                        assignedTo: lead.managerId || lead.partnerId,
                        createdAt: lead.createdAt,
                        updatedAt: lead.updatedAt,
                        requesterInfo: {
                            name: lead.customerName,
                            phone: lead.customerPhone,
                        },
                        payload: lead
                    };
                }
            }
            
            resolve(request);
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
        
        // Fix: Safely check if role exists and is a string before calling includes
        // Ensure assignee exists first
        const assigneeRole = assignee?.role as string | undefined;
        const isAdminOrManager = (assigneeRole && (assigneeRole.includes('_manager') || assigneeRole === Role.SUPER_ADMIN));
        
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

export const addMessageToLead = (requestId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Request | undefined> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let requestIndex = localRequestsData.findIndex(r => r.id === requestId);
            
            // If not in requests, we assume it's a direct lead update (handled elsewhere usually, but here for safety)
            // Actually, if it's a lead accessed via RequestDetailsPage, we need to update the lead directly.
            // But here we simulate the request update.
            
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

                if (!leadPayload.status) {
                    leadPayload.status = request.status as any;
                }
                
                if (leadPayload.status === 'new' && (messageData.sender === 'partner' || messageData.sender === 'admin')) {
                    leadPayload.status = 'contacted';
                    request.status = 'in-progress';
                }
                
                resolve(request);
            } else {
                // Fallback for leads not in localRequestsData - usually handled by direct lead service, 
                // but we can return undefined here to let the caller know or handle via lead service directly.
                // For this mock, assume failure if not in request list, OR ideally we update the lead service.
                // But since this function signature returns a Request, we stick to the Request domain.
                reject(new Error('Request not found in main request list.'));
            }
        }, SIMULATED_DELAY);
    });
};
