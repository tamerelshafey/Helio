
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
            // Deep merge for stages array
            if (updates.stages) {
                aiEstimatorConfigData.stages = updates.stages;
            }
            if (updates.prompt) {
                aiEstimatorConfigData.prompt = updates.prompt;
            }
            if (updates.model) {
                aiEstimatorConfigData.model = updates.model;
            }
            resolve(JSON.parse(JSON.stringify(aiEstimatorConfigData)));
        }, SIMULATED_DELAY);
    });
};
