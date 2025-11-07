import type { Partner } from '../types';

// SECURITY WARNING: This mock data includes hardcoded passwords for demonstration purposes ONLY.
// In a real-world application, never store plain-text passwords in your codebase.
// Use a secure authentication system with hashed and salted passwords.
export let partnersData: Omit<Partner, 'name' | 'description' | 'role'>[] = [
    // Developers
    {
        id: 'united-development',
        imageUrl: 'https://images.unsplash.com/photo-1542361303-334a16de71b1?q=80&w=2070&auto=format&fit=crop',
        email: 'dev1@onlyhelio.com',
        password: 'password',
        type: 'developer', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2025-12-31T00:00:00Z', displayType: 'mega_project',
        contactMethods: { whatsapp: { enabled: true, number: '+201012345678' }, phone: { enabled: true, number: '+201012345678' }, form: { enabled: true } },
    },
    {
        id: 'modern-construction-group',
        imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2071&auto=format&fit=crop',
        email: 'dev2@onlyhelio.com',
        password: 'password',
        type: 'developer', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-08-01T00:00:00Z', displayType: 'mega_project',
        contactMethods: { whatsapp: { enabled: true, number: '+201122334455' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
    {
        id: 'sodic',
        imageUrl: 'https://images.unsplash.com/photo-1605146769283-4a23588950c6?q=80&w=2070&auto=format&fit=crop',
        email: 'sodic@onlyhelio.com',
        password: 'password',
        type: 'developer', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2029-12-31T00:00:00Z', displayType: 'mega_project',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: true, number: '+201234567890' }, form: { enabled: true } },
    },
    {
        id: 'capital-group-properties',
        imageUrl: 'https://images.unsplash.com/photo-1599809275661-059052824c04?q=80&w=2070&auto=format&fit=crop',
        email: 'cgp@onlyhelio.com',
        password: 'password',
        type: 'developer', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2029-12-31T00:00:00Z', displayType: 'mega_project',
        contactMethods: { whatsapp: { enabled: true, number: '+201555666777' }, phone: { enabled: true, number: '+201555666777' }, form: { enabled: false } },
    },
    {
        id: 'heliopolis-developers-group',
        imageUrl: 'https://images.unsplash.com/photo-1560185893-a55d88652353?q=80&w=2070&auto=format&fit=crop',
        email: 'hdg@onlyhelio.com',
        password: 'password',
        type: 'developer', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2026-12-31T00:00:00Z', displayType: 'mega_project',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
    // Finishing Companies
    {
        id: 'el-mottaheda-group',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
        email: 'fin1@onlyhelio.com',
        password: 'password',
        type: 'finishing', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-06-20T00:00:00Z', displayType: 'featured',
        contactMethods: { whatsapp: { enabled: true, number: '+201011122233' }, phone: { enabled: true, number: '+201011122233' }, form: { enabled: true } },
    },
    {
        id: 'design-hub',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop',
        email: 'fin2@onlyhelio.com',
        password: 'password',
        type: 'finishing', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-10-10T00:00:00Z', displayType: 'featured',
        contactMethods: { whatsapp: { enabled: true, number: '+201144556677' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
    {
        id: 'ebdaa-integrated-finishes',
        imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop',
        email: 'fin4@onlyhelio.com',
        password: 'password',
        type: 'finishing', status: 'active', subscriptionPlan: 'commission',
        subscriptionEndDate: '2025-02-28T00:00:00Z', displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: true, number: '+201555123456' }, form: { enabled: true } },
    },
    // Agencies
    {
        id: 'future-real-estate',
        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop',
        email: 'agency1@onlyhelio.com',
        password: 'password',
        type: 'agency', status: 'active', subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-09-01T00:00:00Z', displayType: 'featured',
        contactMethods: { whatsapp: { enabled: true, number: '+201288990011' }, phone: { enabled: true, number: '+201288990011' }, form: { enabled: true } },
    },
    // Admins & System Users
    {
        id: 'admin-user',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
        email: 'admin@onlyhelio.com',
        password: 'password',
        type: 'admin', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2099-12-31T00:00:00Z', displayType: 'standard',
        contactMethods: { whatsapp: { enabled: true, number: '+201000000000' }, phone: { enabled: true, number: '+201000000000' }, form: { enabled: true } },
    },
    {
        id: 'service-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1531891437562-b1a5b0648509?q=80&w=1974&auto.format&fit=crop',
        email: 'service-manager@onlyhelio.com',
        password: 'password',
        type: 'service_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
     {
        id: 'customer-relations-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1543462378-94183658e3e4?q=80&w=1974&auto.format&fit=crop',
        email: 'customer-relations-manager@onlyhelio.com',
        password: 'password',
        type: 'customer_relations_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
    {
        id: 'listings-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1599948058230-787cd7a5f629?q=80&w=1974&auto.format&fit=crop',
        email: 'listings-manager@onlyhelio.com',
        password: 'password',
        type: 'listings_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
    {
        id: 'partner-relations-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop',
        email: 'partner-relations-manager@onlyhelio.com',
        password: 'password',
        type: 'partner_relations_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
    {
        id: 'content-manager-1',
        imageUrl: 'https://images.unsplash.com/photo-1587614295999-6c1c13675127?q=80&w=1974&auto=format&fit=crop',
        email: 'content-manager@onlyhelio.com',
        password: 'password',
        type: 'content_manager', status: 'active', subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
    },
    // Individual Listings (system partner)
    {
        id: 'individual-listings',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
        email: 'individual@onlyhelio.com',
        password: 'password',
        type: 'agency', status: 'active', subscriptionPlan: 'elite',
        subscriptionEndDate: '2099-12-31T00:00:00Z', displayType: 'standard',
        contactMethods: { whatsapp: { enabled: true, number: '+201000000001' }, phone: { enabled: true, number: '+201000000001' }, form: { enabled: true } },
    },
];

// Add responsive image URLs to all partners
partnersData.forEach(partner => {
    (partner as any).imageUrl_small = partner.imageUrl.replace('w=2070', 'w=480').replace('w=2071', 'w=480').replace('w=1974', 'w=480').replace('w=2158', 'w=480');
    (partner as any).imageUrl_medium = partner.imageUrl.replace('w=2070', 'w=800').replace('w=2071', 'w=800').replace('w=1974', 'w=800').replace('w=2158', 'w=800');
    (partner as any).imageUrl_large = partner.imageUrl.replace('w=2070', 'w=1200').replace('w=2071', 'w=1200').replace('w=1974', 'w=1200').replace('w=2158', 'w=1200');
});