import { Role, Permission, PartnerType } from '../types';

export let rolePermissions: Map<Role, Permission[]> = new Map([
  [
    Role.SUPER_ADMIN,
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES_PERMISSIONS,
      Permission.MANAGE_ALL_PARTNERS,
      Permission.MANAGE_ALL_PROPERTIES,
      Permission.MANAGE_ALL_PROJECTS,
      Permission.MANAGE_ALL_LEADS,
      Permission.MANAGE_PARTNER_REQUESTS,
      Permission.MANAGE_PROPERTY_REQUESTS,
      Permission.MANAGE_CONTACT_REQUESTS,
      Permission.MANAGE_PROPERTY_INQUIRIES,
      Permission.MANAGE_FINISHING_LEADS,
      Permission.MANAGE_DECORATIONS_CONTENT,
      Permission.MANAGE_DECORATIONS_LEADS,
      Permission.MANAGE_PLANS,
      Permission.MANAGE_FILTERS,
      Permission.MANAGE_BANNERS,
      Permission.MANAGE_SITE_CONTENT,
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_SETTINGS,
    ],
  ],
  [
    Role.DEVELOPER_PARTNER,
    [
      Permission.VIEW_PARTNER_DASHBOARD,
      Permission.MANAGE_OWN_PROFILE,
      Permission.MANAGE_OWN_PROJECTS,
      Permission.VIEW_OWN_LEADS,
      Permission.MANAGE_OWN_SUBSCRIPTION,
    ],
  ],
  [
    Role.FINISHING_PARTNER,
    [
      Permission.VIEW_PARTNER_DASHBOARD,
      Permission.MANAGE_OWN_PROFILE,
      Permission.MANAGE_OWN_PORTFOLIO,
      Permission.VIEW_OWN_LEADS,
      Permission.MANAGE_OWN_SUBSCRIPTION,
    ],
  ],
  [
    Role.AGENCY_PARTNER,
    [
      Permission.VIEW_PARTNER_DASHBOARD,
      Permission.MANAGE_OWN_PROFILE,
      Permission.MANAGE_OWN_PROPERTIES,
      Permission.VIEW_OWN_LEADS,
      Permission.MANAGE_OWN_SUBSCRIPTION,
    ],
  ],
  // New Specialized Admin Roles
  [
    Role.FINISHING_MANAGER,
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_FINISHING_LEADS,
    ],
  ],
  [
    Role.DECORATIONS_MANAGER,
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_DECORATIONS_CONTENT,
      Permission.MANAGE_DECORATIONS_LEADS,
    ],
  ],
  [
    Role.LISTINGS_MANAGER,
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_ALL_PROPERTIES,
      Permission.MANAGE_PROPERTY_REQUESTS,
      Permission.MANAGE_PROPERTY_INQUIRIES,
    ],
  ],
  [
    Role.PARTNER_RELATIONS_MANAGER,
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_ALL_PARTNERS,
      Permission.MANAGE_PARTNER_REQUESTS,
    ],
  ],
   [
    Role.CONTENT_MANAGER,
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_BANNERS,
      Permission.MANAGE_SITE_CONTENT,
    ],
  ],
]);

// Helper to map old `type` to new `Role`
export const mapPartnerTypeToRole = (type: PartnerType): Role => {
    switch (type) {
        case 'admin': return Role.SUPER_ADMIN;
        case 'developer': return Role.DEVELOPER_PARTNER;
        case 'finishing': return Role.FINISHING_PARTNER;
        case 'agency': return Role.AGENCY_PARTNER;
        // Internal roles
        case 'finishing_manager': return Role.FINISHING_MANAGER;
        case 'decorations_manager': return Role.DECORATIONS_MANAGER;
        case 'listings_manager': return Role.LISTINGS_MANAGER;
        case 'partner_relations_manager': return Role.PARTNER_RELATIONS_MANAGER;
        case 'content_manager': return Role.CONTENT_MANAGER;
        default: return Role.AGENCY_PARTNER; // Fallback for safety
    }
}