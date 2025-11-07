
import type { AIEstimatorConfig } from '../types';

export let aiEstimatorConfigData: AIEstimatorConfig = {
    model: 'gemini-2.5-flash',
    prompt: `Act as an expert Egyptian quantity surveyor and pricing engineer using 2024 local Egyptian market prices for materials and labor.
Based on the following requirements for a finishing project in Egypt, provide a detailed cost estimation in Egyptian Pounds (EGP).
Your response must be a JSON object.`,
    options: {
        flooring: [
            { key: 'porcelain', en: 'Porcelain', ar: 'بورسلين' },
            { key: 'ceramic', en: 'Ceramic', ar: 'سيراميك' },
            { key: 'hdf', en: 'HDF', ar: 'HDF' },
            { key: 'marble', en: 'Marble', ar: 'رخام' },
        ],
        walls: [
            { key: 'paint', en: 'Paint', ar: 'دهانات' },
            { key: 'wallpaper', en: 'Wallpaper', ar: 'ورق حائط' },
            { key: 'wood_alternative', en: 'Wood/Marble Alternative', ar: 'بديل خشب/رخام' },
        ],
        ceiling: [
            { key: 'paint_only', en: 'Paint Only', ar: 'دهان فقط' },
            { key: 'gypsum_simple', en: 'Simple Gypsum Board', ar: 'جبسون بورد تصميم بسيط' },
            { key: 'gypsum_complex', en: 'Complex Gypsum Board', ar: 'جبسون بورد تصميم معقد' },
        ],
        electrical: [
            { key: 'standard', en: 'Standard Wiring', ar: 'تأسيس عادي' },
            { key: 'smart_home', en: 'Smart Home Wiring', ar: 'تأسيس سمارت هوم' },
        ],
        plumbing: [
            { key: 'standard', en: 'Standard Plumbing', ar: 'تأسيس عادي' },
            { key: 'suspended', en: 'Suspended Plumbing', ar: 'تأسيس معلق' },
        ],
    },
};
