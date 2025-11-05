import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApiQuery } from '../shared/useApiQuery';
import { getRolePermissions, updateRolePermissions } from '../../api/permissions';
import { Role, Permission } from '../../types';
import type { Language } from '../../types';
import { useToast } from '../shared/ToastContext';
import { translations } from '../../data/translations';

const permissionGroups = {
  adminAccess: {
    title: { ar: 'وصول الإدارة', en: 'Admin Access' },
    permissions: [Permission.VIEW_ADMIN_DASHBOARD]
  },
  userManagement: {
    title: { ar: 'إدارة المستخدمين والشركاء', en: 'User & Partner Management' },
    permissions: [Permission.MANAGE_USERS, Permission.MANAGE_ROLES_PERMISSIONS, Permission.MANAGE_ALL_PARTNERS, Permission.MANAGE_PARTNER_REQUESTS]
  },
  contentManagement: {
    title: { ar: 'إدارة المحتوى', en: 'Content Management' },
    permissions: [Permission.MANAGE_DECORATIONS_CONTENT, Permission.MANAGE_BANNERS, Permission.MANAGE_SITE_CONTENT, Permission.MANAGE_FILTERS, Permission.MANAGE_SETTINGS]
  },
  listingManagement: {
    title: { ar: 'إدارة العقارات والمشاريع', en: 'Listing & Project Management' },
    permissions: [Permission.MANAGE_ALL_PROPERTIES, Permission.MANAGE_ALL_PROJECTS, Permission.MANAGE_PROPERTY_REQUESTS]
  },
  leadManagement: {
    title: { ar: 'إدارة الطلبات والاستفسارات', en: 'Lead & Inquiry Management' },
    permissions: [Permission.MANAGE_ALL_LEADS, Permission.MANAGE_CONTACT_REQUESTS, Permission.MANAGE_PROPERTY_INQUIRIES, Permission.MANAGE_FINISHING_LEADS, Permission.MANAGE_DECORATIONS_LEADS]
  },
  financials: {
    title: { ar: 'الماليات والتحليلات', en: 'Financials & Analytics' },
    permissions: [Permission.MANAGE_PLANS, Permission.VIEW_ANALYTICS]
  },
  partnerAccess: {
    title: { ar: 'وصول لوحة تحكم الشريك', en: 'Partner Dashboard Access' },
    permissions: [Permission.VIEW_PARTNER_DASHBOARD, Permission.MANAGE_OWN_PROFILE, Permission.MANAGE_OWN_PROJECTS, Permission.MANAGE_OWN_PROPERTIES, Permission.MANAGE_OWN_PORTFOLIO, Permission.VIEW_OWN_LEADS, Permission.MANAGE_OWN_SUBSCRIPTION]
  },
};


const RolePermissions: React.FC<{
    role: Role;
    roleName: string;
    permissions: Permission[];
    onPermissionChange: (role: Role, permission: Permission, checked: boolean) => void;
    language: Language;
}> = ({ role, roleName, permissions, onPermissionChange, language }) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="p-4 bg-gray-50 dark:bg-gray-700/50 text-xl font-bold text-gray-800 dark:text-gray-200">{roleName}</h2>
            <div className="p-6 space-y-6">
                {Object.values(permissionGroups).map(group => (
                    <div key={group.title.en}>
                        <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-3">{group.title[language]}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                            {group.permissions.map(p => (
                                <label key={p} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes(p)}
                                        onChange={(e) => onPermissionChange(role, p, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    {p.replace(/_/g, ' ').toLowerCase()}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AdminRolesPage: React.FC<{ language: Language }> = ({ language }) => {
    const { data, isLoading, refetch } = useApiQuery('rolePermissions', getRolePermissions);
    const { showToast } = useToast();
    const t_nav = translations[language].adminDashboard.nav;
    
    const [permissionsMap, setPermissionsMap] = useState<Map<Role, Permission[]>>(new Map());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (data) {
            setPermissionsMap(data);
        }
    }, [data]);

    const handlePermissionChange = (role: Role, permission: Permission, checked: boolean) => {
        setPermissionsMap(prevMap => {
            const newMap = new Map(prevMap);
            const permissionsForRole = newMap.get(role);
            const currentPermissions: Permission[] = Array.isArray(permissionsForRole) ? permissionsForRole : [];
            
            if (checked) {
                if (!currentPermissions.includes(permission)) {
                    newMap.set(role, [...currentPermissions, permission]);
                }
            } else {
                newMap.set(role, currentPermissions.filter(p => p !== permission));
            }
            return newMap;
        });
    };
    
    const handleSaveChanges = async () => {
        setIsSaving(true);
        const success = await updateRolePermissions(permissionsMap);
        setIsSaving(false);
        if (success) {
            showToast('Permissions updated successfully!', 'success');
            refetch();
        } else {
            showToast('Failed to update permissions.', 'error');
        }
    };

    const rolesToManage = Object.values(Role).filter(role => role !== Role.SUPER_ADMIN);

    const getRoleName = (role: Role) => {
        return role.replace(/_/g, ' ').replace('PARTNER', '').toLowerCase();
    };
    
    if (isLoading) return <div>Loading roles and permissions...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_nav.rolesAndPermissions}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage what each user role can see and do on the platform.</p>

            <div className="space-y-6">
                {rolesToManage.map(role => (
                    <RolePermissions
                        key={role}
                        role={role}
                        roleName={getRoleName(role)}
                        permissions={permissionsMap.get(role) || []}
                        onPermissionChange={handlePermissionChange}
                        language={language}
                    />
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50"
                >
                    {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
            </div>
        </div>
    );
};

export default AdminRolesPage;
