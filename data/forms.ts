
import type { FormDefinition } from '../types';

export let formsData: FormDefinition[] = [
    {
        id: 'form-1',
        slug: 'contact-us',
        title: { ar: 'اتصل بنا', en: 'Contact Us' },
        description: { ar: 'نموذج التواصل العام', en: 'General Contact Form' },
        category: 'public',
        destination: 'crm_messages',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال', en: 'Send Message' },
        fields: [
            {
                id: 'f1',
                key: 'name',
                type: 'text',
                label: { ar: 'الاسم بالكامل', en: 'Full Name' },
                required: true,
                width: 'half',
                placeholder: { ar: 'أدخل اسمك', en: 'Enter your name' }
            },
            {
                id: 'f2',
                key: 'phone',
                type: 'tel',
                label: { ar: 'رقم الهاتف', en: 'Phone Number' },
                required: true,
                width: 'half',
                placeholder: { ar: '01xxxxxxxxx', en: '01xxxxxxxxx' }
            },
            {
                id: 'f3',
                key: 'email',
                type: 'email',
                label: { ar: 'البريد الإلكتروني', en: 'Email Address' },
                required: false,
                width: 'full',
            },
            {
                id: 'f4',
                key: 'message',
                type: 'textarea',
                label: { ar: 'الرسالة', en: 'Message' },
                required: true,
                width: 'full',
                placeholder: { ar: 'اكتب رسالتك هنا...', en: 'Type your message here...' }
            }
        ]
    },
    {
        id: 'form-2',
        slug: 'service-request',
        title: { ar: 'طلب خدمة', en: 'Service Request' },
        description: { ar: 'نموذج طلب خدمات التشطيب والديكور', en: 'Finishing and Decoration Request Form' },
        category: 'lead_gen',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'تأكيد الطلب', en: 'Confirm Request' },
        fields: [
            {
                id: 'sf0',
                key: 'customerName',
                type: 'text',
                label: { ar: 'الاسم بالكامل', en: 'Full Name' },
                required: true,
                width: 'half'
            },
            {
                id: 'sf00',
                key: 'customerPhone',
                type: 'tel',
                label: { ar: 'رقم الهاتف', en: 'Phone Number' },
                required: true,
                width: 'half'
            },
            {
                id: 'sf1',
                key: 'contactTime',
                type: 'select',
                label: { ar: 'وقت التواصل المفضل', en: 'Preferred Contact Time' },
                required: true,
                width: 'full',
                options: ['Morning (9am-12pm)', 'Afternoon (12pm-3pm)', 'Evening (3pm-6pm)']
            },
            {
                id: 'sf4',
                key: 'customerNotes',
                type: 'textarea',
                label: { ar: 'ملاحظات إضافية', en: 'Additional Notes' },
                required: false,
                width: 'full',
                placeholder: { ar: 'اذكر أي تفاصيل إضافية...', en: 'Mention any extra details...' }
            }
        ]
    },
    {
        id: 'form-3',
        slug: 'property-inquiry',
        title: { ar: 'طلب بحث عقاري', en: 'Property Search Request' },
        description: { ar: 'نموذج لتحديد مواصفات العقار المطلوب', en: 'Form to specify desired property details' },
        category: 'lead_gen',
        destination: 'crm_leads', 
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال الطلب', en: 'Submit Request' },
        fields: [
            {
                id: 'pi1',
                key: 'customerName',
                type: 'text',
                label: { ar: 'الاسم بالكامل', en: 'Full Name' },
                required: true,
                width: 'half'
            },
            {
                id: 'pi2',
                key: 'customerPhone',
                type: 'tel',
                label: { ar: 'رقم الهاتف', en: 'Phone Number' },
                required: true,
                width: 'half'
            },
            {
                id: 'pi3',
                key: 'contactTime',
                type: 'select',
                label: { ar: 'وقت التواصل', en: 'Preferred Time' },
                required: true,
                width: 'full',
                options: ['Morning', 'Afternoon', 'Evening']
            },
            {
                id: 'pi4',
                key: 'details',
                type: 'textarea',
                label: { ar: 'مواصفات العقار المطلوب', en: 'Property Details' },
                required: true,
                width: 'full',
                placeholder: { ar: 'مثال: شقة ٣ غرف في الحي الثاني...', en: 'e.g., 3 Bedroom apartment in 2nd district...' }
            }
        ]
    },
    {
        id: 'form-4',
        slug: 'service-request-full',
        title: { ar: 'طلب خدمة شامل', en: 'Service Request Full' },
        description: { ar: 'نموذج شامل لطلبات الخدمة مع دعم الملفات', en: 'Comprehensive service request form with file support' },
        category: 'lead_gen',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'تأكيد الطلب', en: 'Confirm Request' },
        fields: [
            {
                id: 'srf1',
                key: 'customerName',
                type: 'text',
                label: { ar: 'الاسم بالكامل', en: 'Full Name' },
                required: true,
                width: 'half'
            },
            {
                id: 'srf2',
                key: 'customerPhone',
                type: 'tel',
                label: { ar: 'رقم الهاتف', en: 'Phone Number' },
                required: true,
                width: 'half',
                placeholder: { ar: '+20...', en: '+20...' }
            },
            {
                id: 'srf3',
                key: 'contactTime',
                type: 'select',
                label: { ar: 'وقت التواصل المفضل', en: 'Preferred Contact Time' },
                required: true,
                width: 'full',
                options: ['Morning (9am-12pm)', 'Afternoon (12pm-3pm)', 'Evening (3pm-6pm)']
            },
            {
                id: 'srf4',
                key: 'customerNotes',
                type: 'textarea',
                label: { ar: 'تفاصيل الطلب / ملاحظات', en: 'Request Details / Notes' },
                required: false,
                width: 'full',
                placeholder: { ar: 'اذكر تفاصيل الفكرة، الأبعاد، الألوان، أو أي متطلبات أخرى...', en: 'Describe your idea, dimensions, colors, or other requirements...' }
            },
            {
                id: 'srf5',
                key: 'referenceImage',
                type: 'file',
                label: { ar: 'صورة مرجعية (اختياري)', en: 'Reference Image (Optional)' },
                required: false,
                width: 'full'
            }
        ]
    }
];
