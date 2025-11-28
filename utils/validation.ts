
import { z } from 'zod';

// Regex Patterns
export const PATTERNS = {
    // Email Pattern
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Egyptian Phone: Starts with 010, 011, 012, 015 followed by 8 digits
    EGYPTIAN_PHONE: /^01[0125][0-9]{8}$/,
    // Basic Password: Min 8 chars, at least one letter and one number
    STRONG_PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    // English Characters Only (for slugs/keys)
    ENGLISH_ONLY: /^[a-zA-Z0-9_-]+$/,
    // URL
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
};

// Helper messages
export const MESSAGES = {
    ar: {
        required: "هذا الحقل مطلوب",
        invalid_email: "البريد الإلكتروني غير صحيح",
        invalid_phone: "رقم الهاتف يجب أن يكون مصرياً صحيحاً (11 رقم يبدأ بـ 01)",
        invalid_url: "رابط غير صحيح",
        min_length: (min: number) => `يجب أن يحتوي على ${min} حروف على الأقل`,
        max_length: (max: number) => `يجب ألا يزيد عن ${max} حرف`,
        invalid_number: "يجب إدخال رقم صحيح",
    },
    en: {
        required: "This field is required",
        invalid_email: "Invalid email address",
        invalid_phone: "Invalid Egyptian phone number (11 digits starting with 01)",
        invalid_url: "Invalid URL",
        min_length: (min: number) => `Must be at least ${min} characters`,
        max_length: (max: number) => `Must not exceed ${max} characters`,
        invalid_number: "Must be a valid number",
    }
};

// Reusable Zod Schemas
export const commonSchemas = {
    email: z.string().email(),
    phoneEG: z.string().regex(PATTERNS.EGYPTIAN_PHONE),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2),
};
