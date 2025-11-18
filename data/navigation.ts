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
  exact?: boolean;
  group: string;
  permission: Permission;
  roles?: Role[];
}

export const adminNavLinks: NavLinkItem[] = [
  // --- Group: Overview ---
  { name: t => t.nav.dashboard, href: '/admin', icon: HomeIcon, permission: Permission.VIEW_ADMIN_DASHBOARD, exact: true, group: 'Overview' },
  { name: t => t.nav.analytics, href: '/admin/analytics', icon: ChartBarIcon, permission: Permission.VIEW_ANALYTICS, group: 'Overview' },
  { name: t => t.nav.reports, href: '/admin/reports', icon: FileDownloadIcon, permission: Permission.VIEW_ANALYTICS, group: 'Overview' },
  
  // --- Group: Request Triage ---
  { name: t => t.nav.allLeads, href: '/admin/requests', icon: InboxIcon, permission: Permission.MANAGE_ALL_LEADS, group: 'Request Triage' },

  // --- Group: Platform Operations ---
  { name: t => t.nav.platformProperties, href: '/admin/platform-properties', icon: BuildingIcon, permission: Permission.MANAGE_ALL_PROPERTIES, group: 'Platform Operations' },
  { name: t => t.nav.platformDecorations, href: '/admin/platform-decorations', icon: SparklesIcon, permission: Permission.MANAGE_DECORATIONS_CONTENT, group: 'Platform Operations' },
  { name: t => t.nav.platformFinishing, href: '/admin/platform-finishing', icon: WrenchScrewdriverIcon, permission: Permission.MANAGE_FINISHING_LEADS, group: 'Platform Operations' },

  // --- Group: Partner & Content Management ---
  { name: t => t.nav.partners, href: '/admin/partners', icon: UsersIcon, permission: Permission.MANAGE_ALL_PARTNERS, group: 'Partner & Content Management' },
  { name: t => t.nav.properties, href: '/admin/properties', icon: BuildingIcon, permission: Permission.MANAGE_ALL_PROPERTIES, group: 'Partner & Content Management' },
  { name: t => t.nav.projects, href: '/admin/projects', icon: CubeIcon, permission: Permission.MANAGE_ALL_PROJECTS, group: 'Partner & Content Management' },
  { name: t => t.nav.banners, href: '/admin/banners', icon: PhotoIcon, permission: Permission.MANAGE_BANNERS, group: 'Partner & Content Management' },
  { name: t => t.nav.siteContent, href: '/admin/content', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_SITE_CONTENT, group: 'Partner & Content Management' },
  
  // --- Group: System ---
  { name: t => t.nav.users, href: '/admin/users', icon: UsersIcon, permission: Permission.MANAGE_USERS, group: 'System' },
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