import { Role, Permission, PartnerType } from '../types';

export let rolePermissions: Map<Role, Permission[]> = new Map([
  [
    Role.SUPER_ADMIN,
    Object.values(Permission), // Super admin gets all permissions
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
  // New & Refined Admin Roles
  [
    Role.SERVICE_MANAGER, // Combines Finishing & Decorations
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_FINISHING_LEADS,
      Permission.MANAGE_DECORATIONS_LEADS,
      Permission.MANAGE_DECORATIONS_CONTENT, // Manages portfolio items and categories
    ],
  ],
  [
    Role.CUSTOMER_RELATIONS_MANAGER, // Manages individual customer interactions
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_PROPERTY_REQUESTS,
      Permission.MANAGE_PROPERTY_INQUIRIES,
      Permission.MANAGE_CONTACT_REQUESTS,
    ],
  ],
  [
    Role.LISTINGS_MANAGER, // Focused on platform inventory
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_ALL_PROPERTIES,
      Permission.MANAGE_ALL_PROJECTS,
    ],
  ],
  [
    Role.PARTNER_RELATIONS_MANAGER, // Focused on commercial partners
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_ALL_PARTNERS,
      Permission.MANAGE_PARTNER_REQUESTS,
    ],
  ],
   [
    Role.CONTENT_MANAGER, // Focused on site-wide content
    [
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_BANNERS,
      Permission.MANAGE_SITE_CONTENT,
      Permission.MANAGE_FILTERS, // Added filter management
    ],
  ],
]);

// Helper to map `type` to new `Role`
export const mapPartnerTypeToRole = (type: PartnerType): Role => {
    switch (type) {
        case 'admin': return Role.SUPER_ADMIN;
        case 'developer': return Role.DEVELOPER_PARTNER;
        case 'finishing': return Role.FINISHING_PARTNER;
        case 'agency': return Role.AGENCY_PARTNER;
        // Internal roles
        case 'service_manager': return Role.SERVICE_MANAGER;
        case 'customer_relations_manager': return Role.CUSTOMER_RELATIONS_MANAGER;
        case 'listings_manager': return Role.LISTINGS_MANAGER;
        case 'partner_relations_manager': return Role.PARTNER_RELATIONS_MANAGER;
        case 'content_manager': return Role.CONTENT_MANAGER;
        default: return Role.AGENCY_PARTNER; // Fallback for safety
    }
}