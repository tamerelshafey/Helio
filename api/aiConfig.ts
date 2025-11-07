
import { aiEstimatorConfigData } from '../data/aiConfig';
import type { AIEstimatorConfig } from '../types';

const SIMULATED_DELAY = 200;

export const getAIEstimatorConfig = (): Promise<AIEstimatorConfig> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(aiEstimatorConfigData)));
        }, SIMULATED_DELAY);
    });
};

export const updateAIEstimatorConfig = (updates: Partial<AIEstimatorConfig>): Promise<AIEstimatorConfig> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            Object.assign(aiEstimatorConfigData, updates);
            resolve(JSON.parse(JSON.stringify(aiEstimatorConfigData)));
        }, SIMULATED_DELAY);
    });
};
