
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
        title: { ar: 'طلب خدمة سريع', en: 'Quick Service Request' },
        description: { ar: 'نموذج مختصر لطلبات الخدمة', en: 'Short form for service requests' },
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
        id: 'form-finishing',
        slug: 'finishing-request',
        title: { ar: 'طلب تشطيب', en: 'Finishing Request' },
        description: { ar: 'نموذج تفصيلي لخدمات التشطيب', en: 'Detailed form for finishing services' },
        category: 'lead_gen',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال طلب المعاينة', en: 'Request Site Visit' },
        fields: [
            { id: 'fr1', key: 'customerName', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half' },
            { id: 'fr2', key: 'customerPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half', placeholder: { ar: '+20...', en: '+20...' } },
            { id: 'fr3', key: 'unitType', type: 'select', label: { ar: 'نوع الوحدة', en: 'Unit Type' }, required: true, width: 'half', options: ['Apartment', 'Villa', 'Duplex', 'Commercial', 'Office'] },
            { id: 'fr4', key: 'unitArea', type: 'number', label: { ar: 'المساحة التقريبية (م٢)', en: 'Approx Area (m2)' }, required: true, width: 'half' },
            { id: 'fr5', key: 'currentStatus', type: 'select', label: { ar: 'حالة الوحدة الحالية', en: 'Current Status' }, required: true, width: 'half', options: ['Core & Shell (على الطوب)', 'Semi-finished (محارة)', 'Old Renovation (قديم)'] },
            { id: 'fr6', key: 'finishingLevel', type: 'select', label: { ar: 'مستوى التشطيب المطلوب', en: 'Desired Finishing' }, required: true, width: 'half', options: ['Economic', 'Super Lux', 'Ultra Lux', 'Hotel Standard'] },
            { id: 'fr7', key: 'contactTime', type: 'select', label: { ar: 'وقت التواصل المفضل', en: 'Preferred Contact Time' }, required: true, width: 'full', options: ['Morning (9am-12pm)', 'Afternoon (12pm-3pm)', 'Evening (3pm-6pm)'] },
            { id: 'fr8', key: 'customerNotes', type: 'textarea', label: { ar: 'ملاحظات إضافية', en: 'Additional Notes' }, required: false, width: 'full', placeholder: { ar: 'أي تفاصيل أخرى تود إضافتها...', en: 'Any other details...' } },
        ]
    },
    {
        id: 'form-decor',
        slug: 'decoration-request',
        title: { ar: 'طلب ديكور / عمل فني', en: 'Decoration Request' },
        description: { ar: 'نموذج طلب أعمال فنية خاصة', en: 'Form for custom art and decoration requests' },
        category: 'lead_gen',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال الطلب', en: 'Submit Request' },
        fields: [
            { id: 'dr1', key: 'customerName', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half' },
            { id: 'dr2', key: 'customerPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half', placeholder: { ar: '+20...', en: '+20...' } },
            { id: 'dr3', key: 'itemCategory', type: 'select', label: { ar: 'نوع العمل المطلوب', en: 'Item Category' }, required: true, width: 'half', options: ['Wall Sculpture', 'Canvas Painting', 'Custom Furniture', 'Antique/Decor Piece'] },
            { id: 'dr4', key: 'dimensions', type: 'text', label: { ar: 'الأبعاد المطلوبة (سم)', en: 'Dimensions (cm)' }, required: false, width: 'half', placeholder: { ar: 'مثال: 100x80', en: 'e.g. 100x80' } },
            { id: 'dr5', key: 'contactTime', type: 'select', label: { ar: 'وقت التواصل', en: 'Preferred Time' }, required: true, width: 'full', options: ['Any time', 'Morning', 'Evening'] },
            { id: 'dr6', key: 'customerNotes', type: 'textarea', label: { ar: 'وصف الفكرة / ملاحظات', en: 'Description / Notes' }, required: true, width: 'full', placeholder: { ar: 'صف التصميم الذي تتخيله، الألوان المفضلة، أو المكان الذي سيوضع فيه العمل...', en: 'Describe your vision, preferred colors, or placement...' } },
            { id: 'dr7', key: 'referenceImage', type: 'file', label: { ar: 'صورة مرجعية (اختياري)', en: 'Reference Image (Optional)' }, required: false, width: 'full' },
        ]
    }
];
