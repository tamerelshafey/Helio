import { Role, Permission } from '../types';
import { rolePermissions } from '../data/permissions';

const SIMULATED_DELAY = 200;

export const getRolePermissions = (): Promise<Map<Role, Permission[]>> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(new Map(JSON.parse(JSON.stringify(Array.from(rolePermissions.entries())))));
        }, SIMULATED_DELAY);
    });
};

export const updateRolePermissions = (updatedPermissions: Map<Role, Permission[]>): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            updatedPermissions.forEach((permissions, role) => {
                rolePermissions.set(role, permissions);
            });
            resolve(true);
        }, SIMULATED_DELAY);
    });
};
