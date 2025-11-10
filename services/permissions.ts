
import { Role, Permission } from '../types';
import { rolePermissions } from '../data/permissions';

const SIMULATED_DELAY = 200;

export const getRolePermissions = (): Promise<Map<Role, Permission[]>> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Create a new map from a serialized/deserialized version to ensure no direct mutation
            resolve(new Map(JSON.parse(JSON.stringify(Array.from(rolePermissions.entries())))));
        }, SIMULATED_DELAY);
    });
};

export const updateRolePermissions = (updatedPermissions: Map<Role, Permission[]>): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real DB, you'd save this. Here, we mutate the in-memory map.
            updatedPermissions.forEach((permissions, role) => {
                rolePermissions.set(role, permissions);
            });
            resolve(true);
        }, SIMULATED_DELAY);
    });
};
