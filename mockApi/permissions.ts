import { rolePermissions } from '../data/permissions';
import { Role, Permission } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getRolePermissions = async (): Promise<Map<Role, Permission[]>> => {
    await delay(100);
    return new Map(rolePermissions);
};

export const updateRolePermissions = async (newPermissions: Map<Role, Permission[]>): Promise<boolean> => {
    await delay(500);
    // FIX: Mutate the map in place instead of reassigning the import.
    rolePermissions.clear();
    newPermissions.forEach((value, key) => {
        rolePermissions.set(key, value);
    });
    return true;
};
