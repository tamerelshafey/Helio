import { translations } from '../data/translations';
import type { Partner, PartnerStatus, PartnerRequest } from '../types';

const SIMULATED_DELAY = 300;

// This is a simulation. In a real app, this data would be in a database.
export const getAllPartners = (): Partner[] => {
    const { developers, finishing_companies, agencies, admins, individualListings, decorations_staff } = translations.en.partners as any;
    return [
        ...developers,
        ...finishing_companies,
        ...agencies,
        ...admins || [],
        ...individualListings || [],
        ...decorations_staff || [],
    ] as unknown as Partner[];
};

export const getAllPartnersForAdmin = (): Partner[] => {
    // In the EN data, combine all non-admin partners to get their types and emails
    const { developers, finishing_companies, agencies, individualListings, decorations_staff } = translations.en.partners as any;
    const allEnPartners = [...developers, ...finishing_companies, ...agencies, ...(individualListings || []), ...(decorations_staff || [])];

    // Get the localized names and descriptions
    const { developers: arDevs, finishing_companies: arFins, agencies: arAgencies, individualListings: arIndivs, decorations_staff: arDecor } = translations.ar.partners as any;
    const allArPartners = [...arDevs, ...arFins, ...arAgencies, ...(arIndivs || []), ...(arDecor || [])];
    
    return allEnPartners.map((enPartner: any) => {
        const arPartner = allArPartners.find((p: any) => p.id === enPartner.id);
        return {
            ...enPartner,
            nameAr: arPartner?.name,
            descriptionAr: arPartner?.description,
        }
    }) as (Partner & { nameAr?: string, descriptionAr?: string})[];
};

export const getPendingPartnerRequests = (): Promise<Partner[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allPartners = getAllPartnersForAdmin();
            resolve(allPartners.filter(p => p.status === 'pending'));
        }, SIMULATED_DELAY);
    });
};


export const getPartnerById = (id: string): Partner | undefined => {
    return getAllPartners().find(p => p.id === id);
};

export const getPartnerByEmail = (email: string) => {
    return getAllPartners().find(p => p.email.toLowerCase() === email.toLowerCase());
};

export const getTestPartners = (language: 'ar' | 'en') => {
    const enPartners = getAllPartners();

    const { developers, finishing_companies, agencies, admins, decorations_staff } = translations[language].partners as any;
    const localizedPartners = [...developers, ...finishing_companies, ...agencies, ...(admins || []), ...(decorations_staff || [])];
    
    return localizedPartners.map((localPartner: any) => {
        const enData = enPartners.find(p => p.id === localPartner.id);
        return {
            id: localPartner.id,
            name: localPartner.name,
            email: enData?.email,
            password: enData?.password,
            type: enData?.type,
        };
    }).filter(p => p.email && p.password);
};


export const updatePartner = (id: string, updates: { name?: string, description?: string, imageUrl?: string }): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let found = false;
            const updatePartnerInLang = (lang: 'en' | 'ar') => {
                 const partnerArrays = [
                    (translations[lang].partners as any).developers,
                    (translations[lang].partners as any).finishing_companies,
                    (translations[lang].partners as any).agencies,
                    (translations[lang].partners as any).decorations_staff,
                ];
                for (const arr of partnerArrays) {
                    if (!arr) continue;
                    const partner = arr.find((p: any) => p.id === id);
                    if (partner) {
                        if (updates.name) partner.name = updates.name;
                        if (updates.description) partner.description = updates.description;
                        if (updates.imageUrl) partner.imageUrl = updates.imageUrl;
                        found = true;
                    }
                }
            }
            updatePartnerInLang('en');
            // Update AR with the same values for simplicity in this mock setup.
            updatePartnerInLang('ar');
            resolve(found);
        }, 300);
    });
};

// New function to simulate updating status
export const updatePartnerStatus = (id: string, status: PartnerStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let found = false;
            const updateStatusInLang = (lang: 'en' | 'ar') => {
                const partnerArrays = [
                    (translations[lang].partners as any).developers,
                    (translations[lang].partners as any).finishing_companies,
                    (translations[lang].partners as any).agencies,
                    (translations[lang].partners as any).decorations_staff,
                ];
                for (const arr of partnerArrays) {
                     if (!arr) continue;
                    const partner = arr.find((p: any) => p.id === id);
                    if (partner) {
                        partner.status = status;
                        found = true;
                    }
                }
            }
            updateStatusInLang('en');
            updateStatusInLang('ar');
            resolve(found);
        }, 300);
    });
};

export const addPartner = (request: PartnerRequest): Promise<Partner> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const { companyName, companyType, description, logo, contactEmail } = request;
            
            const newPartnerData = {
                id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: companyName,
                description: description,
                imageUrl: logo, // It's a base64 string, but it will work in img src
                email: contactEmail,
                password: 'password123', // Default password for new partners
                type: companyType,
                status: 'active' as PartnerStatus,
            };

            let targetArrayKey: 'developers' | 'finishing_companies' | 'agencies';
            switch (companyType) {
                case 'developer':
                    targetArrayKey = 'developers';
                    break;
                case 'finishing':
                    targetArrayKey = 'finishing_companies';
                    break;
                case 'agency':
                    targetArrayKey = 'agencies';
                    break;
                default:
                    const err = new Error(`Invalid company type: ${companyType}`);
                    console.error(err);
                    reject(err);
                    return;
            }
            
            // Add to english translations
            (translations.en.partners as any)[targetArrayKey].push(newPartnerData);
            
            // Add to arabic translations (using same data for simulation)
            (translations.ar.partners as any)[targetArrayKey].push({
                ...newPartnerData,
                name: companyName,
                description: description,
            });

            resolve(newPartnerData as Partner);
        }, SIMULATED_DELAY);
    });
}