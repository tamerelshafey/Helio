
import { rolePermissions } from '../data/permissions';
import type { Role, Permission } from '../types';

const SIMULATED_DELAY = 200;

export const getRolePermissions = (): Promise<Map<Role, Permission[]>> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Return a deep copy to prevent direct mutation issues before "saving"
            resolve(new Map(JSON.parse(JSON.stringify(Array.from(rolePermissions.entries())))));
        }, SIMULATED_DELAY);
    });
};

export const updateRolePermissions = (updatedPermissions: Map<Role, Permission[]>): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, you'd send this to an API endpoint.
            // Here, we'll update the in-memory map.
            updatedPermissions.forEach((permissions, role) => {
                rolePermissions.set(role, permissions);
            });
            resolve(true);
        }, SIMULATED_DELAY);
    });
};
