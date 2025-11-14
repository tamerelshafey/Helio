import { routingRulesData } from '../data/routingRules';
import type { RoutingRule } from '../data/routingRules';

let localRoutingRulesData: RoutingRule[] = [...routingRulesData];
const SIMULATED_DELAY = 200;

export const getAllRoutingRules = (): Promise<RoutingRule[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(JSON.stringify(localRoutingRulesData))), SIMULATED_DELAY);
    });
};

export const addRoutingRule = (rule: Omit<RoutingRule, 'id'>): Promise<RoutingRule> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newRule: RoutingRule = { ...rule, id: `rule-${Date.now()}` };
            localRoutingRulesData.push(newRule);
            resolve(newRule);
        }, SIMULATED_DELAY);
    });
};

export const updateRoutingRule = (id: string, updates: Partial<RoutingRule>): Promise<RoutingRule | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = localRoutingRulesData.findIndex(r => r.id === id);
            if (index > -1) {
                localRoutingRulesData[index] = { ...localRoutingRulesData[index], ...updates };
                resolve(localRoutingRulesData[index]);
            } else {
                resolve(null);
            }
        }, SIMULATED_DELAY);
    });
};

export const deleteRoutingRule = (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const initialLength = localRoutingRulesData.length;
            localRoutingRulesData = localRoutingRulesData.filter(r => r.id !== id);
            resolve(localRoutingRulesData.length < initialLength);
        }, SIMULATED_DELAY);
    });
};
