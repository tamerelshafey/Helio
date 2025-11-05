import React from 'react';
import { Permission, Role } from '../types';
import {
  HomeIcon, ChartBarIcon, UserPlusIcon, ClipboardDocumentListIcon, SearchIcon,
  InboxIcon, WrenchScrewdriverIcon, UsersIcon, CubeIcon, BuildingIcon, QuoteIcon,
  CogIcon, PhotoIcon, SparklesIcon, ShieldCheckIcon, FileDownloadIcon
} from '../components/icons/Icons';

export interface NavLinkItem {
  name: (t: any) => string;
  href: string;
  icon: React.FC<{ className?: string }>;
  permission: Permission;
  roles?: Role[];
  exact?: boolean;
  group: string;
}

export const adminNavLinks: NavLinkItem[] = [
  // --- SUPER ADMIN Group ---
  { name: t => t.nav.dashboard, href: '/admin', icon: HomeIcon, permission: Permission.VIEW_ADMIN_DASHBOARD, roles: [Role.SUPER_ADMIN], exact: true, group: 'Super Admin' },
  { name: t => t.nav.analytics, href: '/admin/analytics', icon: ChartBarIcon, permission: Permission.VIEW_ANALYTICS, roles: [Role.SUPER_ADMIN], group: 'Super Admin' },
  { name: t => t.nav.reports, href: '/admin/reports', icon: FileDownloadIcon, permission: Permission.VIEW_ANALYTICS, roles: [Role.SUPER_ADMIN], group: 'Super Admin' },
  
  // Requests Group
  { name: t => t.nav.partnerRequests, href: '/admin/partner-requests', icon: UserPlusIcon, permission: Permission.MANAGE_PARTNER_REQUESTS, roles: [Role.SUPER_ADMIN, Role.PARTNER_RELATIONS_MANAGER], group: 'Super Admin Requests' },
  { name: t => t.nav.propertyRequests, href: '/admin/property-requests', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_PROPERTY_REQUESTS, roles: [Role.SUPER_ADMIN, Role.LISTINGS_MANAGER], group: 'Super Admin Requests' },
  { name: t => t.nav.propertyInquiries, href: '/admin/property-inquiries', icon: SearchIcon, permission: Permission.MANAGE_PROPERTY_INQUIRIES, roles: [Role.SUPER_ADMIN, Role.LISTINGS_MANAGER], group: 'Super Admin Requests' },
  { name: t => t.nav.contactRequests, href: '/admin/contact-requests', icon: InboxIcon, permission: Permission.MANAGE_CONTACT_REQUESTS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Requests' },
  { name: t => t.nav.finishingRequests, href: '/admin/finishing-requests', icon: WrenchScrewdriverIcon, permission: Permission.MANAGE_FINISHING_LEADS, roles: [Role.SUPER_ADMIN, Role.FINISHING_MANAGER], group: 'Super Admin Requests' },
  { name: t => t.nav.decorationsRequests, href: '/admin/decoration-requests', icon: SparklesIcon, permission: Permission.MANAGE_DECORATIONS_LEADS, roles: [Role.SUPER_ADMIN, Role.DECORATIONS_MANAGER], group: 'Super Admin Requests' },
  
  // Management Group
  { name: t => t.nav.managePartners, href: '/admin/partners', icon: WrenchScrewdriverIcon, permission: Permission.MANAGE_ALL_PARTNERS, roles: [Role.SUPER_ADMIN, Role.PARTNER_RELATIONS_MANAGER], group: 'Super Admin Management' },
  { name: t => t.nav.users, href: '/admin/users', icon: UsersIcon, permission: Permission.MANAGE_USERS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Management' },
  { name: t => t.nav.rolesAndPermissions, href: '/admin/roles', icon: ShieldCheckIcon, permission: Permission.MANAGE_ROLES_PERMISSIONS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Management' },
  { name: t => t.nav.manageProjects, href: '/admin/projects', icon: CubeIcon, permission: Permission.MANAGE_ALL_PROJECTS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Management' },
  { name: t => t.nav.manageProperties, href: '/admin/properties', icon: BuildingIcon, permission: Permission.MANAGE_ALL_PROPERTIES, roles: [Role.SUPER_ADMIN, Role.LISTINGS_MANAGER], group: 'Super Admin Management' },
  { name: t => t.nav.manageLeads, href: '/admin/leads', icon: QuoteIcon, permission: Permission.MANAGE_ALL_LEADS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Management' },
  { name: t => t.nav.manageDecorations, href: '/admin/decorations', icon: SparklesIcon, permission: Permission.MANAGE_DECORATIONS_CONTENT, roles: [Role.SUPER_ADMIN, Role.DECORATIONS_MANAGER], group: 'Super Admin Management' },
  { name: t => t.nav.managePlans, href: '/admin/plans', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_PLANS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Management' },
  { name: t => t.nav.manageFilters, href: '/admin/filters', icon: CogIcon, permission: Permission.MANAGE_FILTERS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Management' },
  { name: t => t.nav.manageBanners, href: '/admin/banners', icon: PhotoIcon, permission: Permission.MANAGE_BANNERS, roles: [Role.SUPER_ADMIN, Role.CONTENT_MANAGER], group: 'Super Admin Management' },
  { name: t => t.nav.contentManagement, href: '/admin/content', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_SITE_CONTENT, roles: [Role.SUPER_ADMIN, Role.CONTENT_MANAGER], group: 'Super Admin Management' },
  { name: t => t.nav.settings, href: '/admin/settings', icon: CogIcon, permission: Permission.MANAGE_SETTINGS, roles: [Role.SUPER_ADMIN], group: 'Super Admin Management' },
];

export const partnerNavLinks: NavLinkItem[] = [
  // --- PARTNER Group ---
  { name: t => t.nav.home, href: '/dashboard', icon: HomeIcon, permission: Permission.VIEW_PARTNER_DASHBOARD, exact: true, group: 'Partner' },
  { name: t => t.nav.projects, href: '/dashboard/projects', icon: CubeIcon, permission: Permission.MANAGE_OWN_PROJECTS, roles: [Role.DEVELOPER_PARTNER], group: 'Partner' },
  { name: t => t.nav.properties, href: '/dashboard/properties', icon: BuildingIcon, permission: Permission.MANAGE_OWN_PROPERTIES, roles: [Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.nav.portfolio, href: '/dashboard/portfolio', icon: PhotoIcon, permission: Permission.MANAGE_OWN_PORTFOLIO, roles: [Role.FINISHING_PARTNER], group: 'Partner' },
  { name: t => t.nav.leads, href: '/dashboard/leads', icon: QuoteIcon, permission: Permission.VIEW_OWN_LEADS, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.nav.subscription, href: '/dashboard/subscription', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_OWN_SUBSCRIPTION, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.nav.profile, href: '/dashboard/profile', icon: UserPlusIcon, permission: Permission.MANAGE_OWN_PROFILE, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
];