import type { Partner } from '../types';

// This is the new single source of truth for partner data.
// Translatable fields like `name` and `description` have been moved to `data/translations.ts`.
export let partnersData: Omit<Partner, 'name' | 'description' | 'role'>[] = [
    // Developers
    {
        id: 'united-development',
        imageUrl: 'https://images.unsplash.com/photo-1542361303-334a16de71b1?q=80&w=2070&auto=format&fit=crop',
        email: 'dev1@onlyhelio.com',
        type: 'developer', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2025-12-31T00:00:00Z', displayType: 'mega_project',
    },
    {
        id: 'modern-construction-group',
        imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2071&auto=format&fit=crop',
        email: 'dev2@onlyhelio.com',
        type: 'developer', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-08-01T00:00:00Z', displayType: 'mega_project',
    },
    {
        id: 'sodic',
        imageUrl: 'https://images.unsplash.com/photo-1605146769283-4a23588950c6?q=80&w=2070&auto=format&fit=crop',
        email: 'sodic@onlyhelio.com',
        type: 'developer', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2029-12-31T00:00:00Z', displayType: 'mega_project',
    },
    {
        id: 'capital-group-properties',
        imageUrl: 'https://images.unsplash.com/photo-1599809275661-059052824c04?q=80&w=2070&auto=format&fit=crop',
        email: 'cgp@onlyhelio.com',
        type: 'developer', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2029-12-31T00:00:00Z', displayType: 'mega_project',
    },
    {
        id: 'heliopolis-developers-group',
        imageUrl: 'https://images.unsplash.com/photo-1560185893-a55d88652353?q=80&w=2070&auto=format&fit=crop',
        email: 'hdg@onlyhelio.com',
        type: 'developer', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2026-12-31T00:00:00Z', displayType: 'mega_project',
    },
    {
        id: 'alrowad-engineering',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
        email: 'dev3@onlyhelio.com',
        type: 'developer', status: 'pending', subscriptionPlan: 'basic',
        subscriptionEndDate: '2024-09-15T00:00:00Z', displayType: 'featured',
    },
    {
        id: 'future-real-estate-dev',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
        email: 'dev4@onlyhelio.com',
        type: 'developer', status: 'disabled', subscriptionPlan: 'basic',
        subscriptionEndDate: '2024-07-31T00:00:00Z', displayType: 'featured',
    },
    // Finishing Companies
    {
        id: 'el-mottaheda-group',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
        email: 'fin1@onlyhelio.com',
        type: 'finishing', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-06-20T00:00:00Z', displayType: 'featured',
    },
    {
        id: 'design-hub',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop',
        email: 'fin2@onlyhelio.com',
        type: 'finishing', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-10-10T00:00:00Z', displayType: 'featured',
    },
    {
        id: 'artistic-touch-decor',
        imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2070&auto=format&fit=crop',
        email: 'fin3@onlyhelio.com',
        type: 'finishing', status: 'pending', subscriptionPlan: 'commission',
        subscriptionEndDate: '2024-11-05T00:00:00Z', displayType: 'standard',
    },
    {
        id: 'ebdaa-integrated-finishes',
        imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop',
        email: 'fin4@onlyhelio.com',
        type: 'finishing', status: 'active', subscriptionPlan: 'commission',
        subscriptionEndDate: '2025-02-28T00:00:00Z', displayType: 'standard',
    },
    // Agencies
    {
        id: 'future-real-estate',
        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop',
        email: 'agency1@onlyhelio.com',
        type: 'agency', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-09-01T00:00:00Z', displayType: 'featured',
    },
    // Admins & System Users
    {
        id: 'admin-user',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
        email: 'admin@onlyhelio.com',
        type: 'admin', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2099-12-31T00:00:00Z', displayType: 'standard',
    },
    {
        id: 'finishing-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1531891437562-b1a5b0648509?q=80&w=1974&auto=format&fit=crop',
        email: 'finishing-manager@onlyhelio.com',
        type: 'finishing_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
    },
    {
        id: 'decorations-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1543462378-94183658e3e4?q=80&w=1974&auto=format&fit=crop',
        email: 'decorations-manager@onlyhelio.com',
        type: 'decorations_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
    },
    {
        id: 'listings-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1599948058230-787cd7a5f629?q=80&w=1974&auto=format&fit=crop',
        email: 'listings-manager@onlyhelio.com',
        type: 'listings_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
    },
    {
        id: 'partner-relations-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop',
        email: 'partner-relations-manager@onlyhelio.com',
        type: 'partner_relations_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
    },
    {
        id: 'content-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1587614295999-6c1c13675127?q=80&w=1974&auto=format&fit=crop',
        email: 'content-manager@onlyhelio.com',
        type: 'content_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
    },
    // Individual Listings (system partner)
    {
        id: 'individual-listings',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
        email: 'individual@onlyhelio.com',
        type: 'agency', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2099-12-31T00:00:00Z', displayType: 'standard',
    },
];

// Add responsive image URLs to all partners
partnersData.forEach(partner => {
    (partner as any).imageUrl_small = partner.imageUrl.replace('w=2070', 'w=480').replace('w=2071', 'w=480').replace('w=1974', 'w=480').replace('w=2158', 'w=480');
    (partner as any).imageUrl_medium = partner.imageUrl.replace('w=2070', 'w=800').replace('w=2071', 'w=800').replace('w=1974', 'w=800').replace('w=2158', 'w=800');
    (partner as any).imageUrl_large = partner.imageUrl.replace('w=2070', 'w=1200').replace('w=2071', 'w=1200').replace('w=1974', 'w=1200').replace('w=2158', 'w=1200');
});