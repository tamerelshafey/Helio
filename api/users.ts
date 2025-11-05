// This data has been merged into data/partners.ts and api/partners.ts to create a unified user system.
// This file is kept empty to avoid breaking imports but is no longer in use.

import { usersData } from '../data/users';
import type { User } from '../types';

const SIMULATED_DELAY = 100;

export const getUserById = (id: string): Promise<User | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(usersData.find(u => u.id === id));
        }, SIMULATED_DELAY);
    });
};

export const getUserByEmail = (email: string): Promise<User | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(usersData.find(u => u.email.toLowerCase() === email.toLowerCase()));
        }, SIMULATED_DELAY);
    });
};

export const updateUser = (userId: string, updates: Partial<User>): Promise<User | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userIndex = usersData.findIndex(u => u.id === userId);
            if (userIndex > -1) {
                usersData[userIndex] = { ...usersData[userIndex], ...updates };
                resolve(usersData[userIndex]);
            } else {
                resolve(undefined);
            }
        }, SIMULATED_DELAY);
    });
};
