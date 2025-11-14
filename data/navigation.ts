

import React from 'react';
import { Permission, Role } from '../types';
import {
  HomeIcon, ChartBarIcon, UserPlusIcon, ClipboardDocumentListIcon, SearchIcon,
  InboxIcon, WrenchScrewdriverIcon, UsersIcon, CubeIcon, BuildingIcon, QuoteIcon,
  CogIcon, PhotoIcon, SparklesIcon, ShieldCheckIcon, FileDownloadIcon, PhoneIcon,
  AdjustmentsHorizontalIcon
} from '../components/ui/Icons';

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
  // --- Group: Overview ---
  { name: t => t.nav.dashboard, href: '/admin', icon: HomeIcon, permission: Permission.VIEW_ADMIN_DASHBOARD, exact: true, group: 'Overview' },
  { name: t => t.nav.analytics, href: '/admin/analytics', icon: ChartBarIcon, permission: Permission.VIEW_ANALYTICS, group: 'Overview' },
  { name: t => t.nav.reports, href: '/admin/reports', icon: FileDownloadIcon, permission: Permission.VIEW_ANALYTICS, group: 'Overview' },
  
  // --- Group: Requests ---
  { name: t => t.nav.allLeads, href: '/admin/requests', icon: InboxIcon, permission: Permission.MANAGE_ALL_LEADS, group: 'Requests' },
  
  // --- Group: Management ---
  { name: t => t.nav.partners, href: '/admin/partners', icon: UsersIcon, permission: Permission.MANAGE_ALL_PARTNERS, group: 'Management' },
  { name: t => t.nav.properties, href: '/admin/properties', icon: BuildingIcon, permission: Permission.MANAGE_ALL_PROPERTIES, group: 'Management' },
  { name: t => t.nav.users, href: '/admin/users', icon: UsersIcon, permission: Permission.MANAGE_USERS, group: 'Management' },

  // --- Group: Content ---
  { name: t => t.nav.siteContent, href: '/admin/content', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_SITE_CONTENT, group: 'Content' },
  { name: t => t.nav.banners, href: '/admin/banners', icon: PhotoIcon, permission: Permission.MANAGE_BANNERS, group: 'Content' },
  { name: t => t.nav.finishingManagement, href: '/admin/finishing-management', icon: WrenchScrewdriverIcon, permission: Permission.MANAGE_FINISHING_LEADS, group: 'Content' },
  { name: t => t.nav.decorationsManagement, href: '/admin/decorations-management', icon: SparklesIcon, permission: Permission.MANAGE_DECORATIONS_CONTENT, group: 'Content' },
  
  // --- Group: System ---
  { name: t => t.nav.automationRules, href: '/admin/automation', icon: AdjustmentsHorizontalIcon, permission: Permission.MANAGE_AUTOMATION, group: 'System' },
  { name: t => t.nav.rolesAndPermissions, href: '/admin/roles', icon: ShieldCheckIcon, permission: Permission.MANAGE_ROLES_PERMISSIONS, group: 'System' },
  { name: t => t.nav.settings, href: '/admin/settings', icon: CogIcon, permission: Permission.MANAGE_SETTINGS, group: 'System' },
];

export const partnerNavLinks: NavLinkItem[] = [
  // --- PARTNER Group ---
  { name: t => t.nav.home, href: '/dashboard', icon: HomeIcon, permission: Permission.VIEW_PARTNER_DASHBOARD, exact: true, group: 'Partner' },
  { name: t => t.nav.analytics, href: '/dashboard/analytics', icon: ChartBarIcon, permission: Permission.VIEW_PARTNER_DASHBOARD, roles: [Role.DEVELOPER_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.nav.projects, href: '/dashboard/projects', icon: CubeIcon, permission: Permission.MANAGE_OWN_PROJECTS, roles: [Role.DEVELOPER_PARTNER], group: 'Partner' },
  { name: t => t.nav.properties, href: '/dashboard/properties', icon: BuildingIcon, permission: Permission.MANAGE_OWN_PROPERTIES, roles: [Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.nav.portfolio, href: '/dashboard/portfolio', icon: PhotoIcon, permission: Permission.MANAGE_OWN_PORTFOLIO, roles: [Role.FINISHING_PARTNER], group: 'Partner' },
  { name: t => t.nav.leads, href: '/dashboard/leads', icon: QuoteIcon, permission: Permission.VIEW_OWN_LEADS, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.nav.subscription, href: '/dashboard/subscription', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_OWN_SUBSCRIPTION, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.nav.profile, href: '/dashboard/profile', icon: UserPlusIcon, permission: Permission.MANAGE_OWN_PROFILE, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
];