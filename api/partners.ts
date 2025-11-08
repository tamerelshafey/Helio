// Note: This is a mock API. In a real application, these functions would make network requests
// to a backend service. The data is modified in-memory for simulation purposes.

import { translations } from '../data/translations';
import { partnersData } from '../data/partners';
import type { Partner, PartnerStatus, PartnerRequest, AdminPartner, PartnerType, Role, SubscriptionPlan, PartnerDisplayType } from '../types';
import { mapPartnerTypeToRole } from '../data/permissions';
import { addNotification } from './notifications';

const SIMULATED_DELAY = 300;

// Helper to get all partners for a specific language
const getAllPartnersByLang = (lang: 'ar' | 'en'): Partner[] => {
    return partnersData.map(basePartner => {
        const trans = translations[lang].partnerInfo[basePartner.id] || { name: basePartner.id, description: '' };
        return {
            ...basePartner,
            ...trans,
            role: mapPartnerTypeToRole(basePartner.type)
        } as Partner;
    });
};

export const getAllPartners = (): Partner[] => {
    return getAllPartnersByLang('en');
};

export const getAllPartnersForAdmin = (): Promise<AdminPartner[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = partnersData.map(basePartner => {
                 const enTrans = translations.en.partnerInfo[basePartner.id] || { name: basePartner.id, description: '' };
                 const arTrans = translations.ar.partnerInfo[basePartner.id] || { name: basePartner.id, description: '' };
                 return {
                     ...basePartner,
                     name: enTrans.name,
                     description: enTrans.description,
                     nameAr: arTrans.name,
                     descriptionAr: arTrans.description,
                     role: mapPartnerTypeToRole(basePartner.type)
                 } as AdminPartner;
            });
            resolve(result);
        }, SIMULATED_DELAY);
    });
};

export const getPartnerById = (id: string): Promise<Partner | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const basePartner = partnersData.find(p => p.id === id);
      if (!basePartner) {
        resolve(undefined);
        return;
      }
      
      const enTrans = translations.en.partnerInfo[basePartner.id] || { name: basePartner.id, description: '' };
      resolve({
          ...basePartner,
          ...enTrans,
          role: mapPartnerTypeToRole(basePartner.type)
      } as Partner);
    }, SIMULATED_DELAY);
  });
};

export const getPartnerByEmail = (email: string): Partner | undefined => {
    const basePartner = partnersData.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!basePartner) return undefined;

    const enTrans = translations.en.partnerInfo[basePartner.id] || { name: basePartner.id, description: '' };
    return {
        ...basePartner,
        ...enTrans,
        role: mapPartnerTypeToRole(basePartner.type)
    } as Partner;
};

export const updatePartner = (id: string, updates: {
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    imageUrl?: string;
}): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let found = false;

            // Update AR translations
            const arTranslations = translations.ar.partnerInfo[id];
            if (arTranslations) {
                arTranslations.name = updates.nameAr;
                arTranslations.description = updates.descriptionAr;
                found = true;
            }

            // Update EN translations
            const enTranslations = translations.en.partnerInfo[id];
            if (enTranslations) {
                enTranslations.name = updates.nameEn;
                enTranslations.description = updates.descriptionEn;
                found = true;
            }

            // Update non-translatable fields in partnersData
            if (updates.imageUrl) {
                const partnerIndex = partnersData.findIndex(p => p.id === id);
                if (partnerIndex > -1) {
                    const partner = partnersData[partnerIndex] as any;
                    if (partner.imageUrl !== updates.imageUrl) {
                        partner.imageUrl = updates.imageUrl;
                        if (updates.imageUrl.includes('unsplash.com')) {
                             const url = new URL(updates.imageUrl);
                            url.searchParams.set('w', '480'); partner.imageUrl_small = url.toString();
                            url.searchParams.set('w', '800'); partner.imageUrl_medium = url.toString();
                            url.searchParams.set('w', '1200'); partner.imageUrl_large = url.toString();
                        } else {
                            partner.imageUrl_small = updates.imageUrl;
                            partner.imageUrl_medium = updates.imageUrl;
                            partner.imageUrl_large = updates.imageUrl;
                        }
                    }
                    found = true;
                }
            }
            resolve(found);
        }, 300);
    });
};

const updatePartnerProperty = (id: string, property: keyof Partner, value: any): boolean => {
    const partnerIndex = partnersData.findIndex(p => p.id === id);
    if (partnerIndex > -1) {
        (partnersData[partnerIndex] as any)[property] = value;
        return true;
    }
    return false;
};

export const updatePartnerStatus = (id: string, status: PartnerStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(updatePartnerProperty(id, 'status', status)), 300);
    });
};

export const updatePartnerDisplayType = (id: string, displayType: Partner['displayType']): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(updatePartnerProperty(id, 'displayType', displayType)), 300);
    });
};

export const updatePartnerAdmin = (id: string, updates: Partial<Pick<AdminPartner, 'subscriptionPlan' | 'subscriptionEndDate' | 'contactMethods'>>): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let success = false;
            const partnerIndex = partnersData.findIndex(p => p.id === id);
            if (partnerIndex > -1) {
                if (updates.subscriptionPlan) {
                    (partnersData[partnerIndex] as any).subscriptionPlan = updates.subscriptionPlan;
                    success = true;
                }
                if (updates.subscriptionEndDate !== undefined) {
                    (partnersData[partnerIndex] as any).subscriptionEndDate = updates.subscriptionEndDate;
                    success = true;
                }
                if (updates.contactMethods) {
                    (partnersData[partnerIndex] as any).contactMethods = updates.contactMethods;
                    success = true;
                }
            }
            resolve(success);
        }, 300);
    });
};

export const addPartner = (request: PartnerRequest): Promise<Partner> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const { companyName, companyType, description, logo, contactEmail, subscriptionPlan } = request;
            const newPartnerId = `partner-${Date.now()}`;

            const newPartnerBaseData: Omit<Partner, 'name' | 'description' | 'role'> = {
                id: newPartnerId,
                imageUrl: logo,
                email: contactEmail,
                password: 'password123', 
                type: companyType,
                status: 'active' as PartnerStatus,
                subscriptionPlan: subscriptionPlan,
                displayType: 'standard', 
            };
            partnersData.push(newPartnerBaseData);

            translations.en.partnerInfo[newPartnerId] = { name: companyName, description: description };
            translations.ar.partnerInfo[newPartnerId] = { name: companyName, description: description };

            const newPartner: Partner = {
                ...newPartnerBaseData,
                name: companyName,
                description: description,
                role: mapPartnerTypeToRole(companyType)
            };

            addNotification({
                userId: newPartner.id,
                message: {
                    ar: "مرحباً بك! تم الموافقة على حساب الشراكة الخاص بك.",
                    en: "Welcome! Your partner account has been approved.",
                },
                link: '/dashboard',
            });

            resolve(newPartner);
        }, SIMULATED_DELAY);
    });
};

export const addInternalUser = (userData: { name: string, nameAr: string, email: string, password?: string, type: PartnerType }): Promise<AdminPartner> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const newUserId = `user-${Date.now()}`;
            const newPartnerBaseData = {
                id: newUserId,
                imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto.format&fit=crop',
                email: userData.email,
                password: userData.password || 'password123',
                type: userData.type,
                status: 'active' as PartnerStatus,
                subscriptionPlan: 'basic' as SubscriptionPlan,
                subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                displayType: 'standard' as PartnerDisplayType,
            };
            partnersData.push(newPartnerBaseData);

            translations.en.partnerInfo[newUserId] = { name: userData.name, description: `Internal user with role: ${userData.type}` };
            translations.ar.partnerInfo[newUserId] = { name: userData.nameAr, description: `مستخدم داخلي بصلاحية: ${userData.type}` };
            
            getPartnerById(newUserId).then(partner => resolve(partner as AdminPartner));
        }, SIMULATED_DELAY);
    });
};

export const updateUser = (userId: string, updates: { name: string, nameAr: string, email: string, type: PartnerType, status: PartnerStatus }): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const partnerIndex = partnersData.findIndex(p => p.id === userId);
            if (partnerIndex > -1) {
                partnersData[partnerIndex] = { ...partnersData[partnerIndex], email: updates.email, type: updates.type, status: updates.status };
                translations.en.partnerInfo[userId].name = updates.name;
                translations.ar.partnerInfo[userId].name = updates.nameAr;
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};

export const deletePartner = (userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = partnersData.length;
            const newData = partnersData.filter(p => p.id !== userId);
            if (newData.length < initialLength) {
                // HACK: This is to mutate the imported array in-place. In a real app, this would be a DELETE API call.
                partnersData.length = 0;
                Array.prototype.push.apply(partnersData, newData);
                delete translations.en.partnerInfo[userId];
                delete translations.ar.partnerInfo[userId];
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};