
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { addRequest } from '../../services/requests';
import { addLead } from '../../services/leads';
import { RequestType } from '../../types';
import { SiteLogo } from '../shared/SiteLogo';
import { useToast } from '../shared/ToastContext';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnersForAdmin } from '../../services/partners';
import { useLanguage } from '../shared/LanguageContext';
import { BanknotesIcon } from '../ui/Icons';
import DynamicForm from '../shared/DynamicForm';

const ServiceRequestPage: React.FC = () => {
    const { language, t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const t_modal = t.serviceRequestModal;
    const t_decor_modal = t.decorationRequestModal;
    const t_custom_decor_modal = t.customDecorationRequestModal;
    const t_decor = t.decorationsPage;
    
    const { serviceTitle, partnerId, propertyId, workItem, isCustom, serviceType, tier, isBooking, isPurchase } = location.state || {};
    const { data: allPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { showToast } = useToast();
    
    React.useEffect(() => {
        if (!serviceTitle || !partnerId) {
            navigate('/');
        }
    }, [serviceTitle, partnerId, navigate]);

    if (!serviceTitle || !partnerId) {
        return null;
    }

    const isPaymentFlow = isBooking || isPurchase;
    const formSlug = "service-request-full";

    // Determine dynamic titles
    const pageTitle = isPurchase 
        ? (language === 'ar' ? 'إتمام الشراء' : 'Complete Purchase') 
        : isBooking 
            ? (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking') 
            : isCustom 
                ? t_custom_decor_modal.title 
                : t_modal.title;

    const submitButtonText = isPaymentFlow
        ? (language === 'ar' ? 'متابعة للدفع' : 'Proceed to Payment')
        : (isCustom ? t_custom_decor_modal.submitButton : t_modal.submitButton);

    const handleCustomSubmit = (formData: any) => {
        // Prepare data
        let finalNotes = formData.customerNotes || '';
        // Note: referenceImage is already Base64 in formData if DynamicForm processed it
        if (isCustom && formData.referenceImage) {
             // Since it's base64 string now, we can't easily get the original filename unless we changed DynamicForm to return object {name, content}. 
             // For now, we just note it exists.
            finalNotes += `\n\n(Reference Image Uploaded)`;
        }
        
        let managerId: string | undefined = undefined;
        if (serviceType && allPartners) {
             const manager = allPartners.find(p => p.type === 'service_manager');
            if (manager) {
                managerId = manager.id;
            }
        }

        if (isBooking && tier) {
            // Redirect to Payment Page
            const bookingTitle = `${serviceTitle} - ${tier.unitType[language]} (${tier.areaRange[language]})`;
            navigate('/payment', {
                state: {
                    amount: tier.price,
                    description: `Finishing Service: ${bookingTitle}`,
                    type: 'service_payment',
                    userId: formData.customerPhone, // Temp ID
                    userName: formData.customerName,
                    data: {
                        ...formData,
                        customerNotes: finalNotes,
                        serviceType: serviceType,
                        serviceTitle: bookingTitle,
                        partnerId: partnerId,
                        managerId: 'platform-finishing-manager-1',
                        tierDetails: tier,
                        status: 'new'
                    }
                }
            });
        } else if (isPurchase && workItem) {
            // Redirect to Payment Page
            navigate('/payment', {
                state: {
                    amount: workItem.price,
                    description: `Product Purchase: ${workItem.title.en}`,
                    type: 'product_purchase',
                    userId: formData.customerPhone, // Temp ID
                    userName: formData.customerName,
                    data: {
                        ...formData,
                        customerNotes: finalNotes,
                        serviceType: serviceType,
                        serviceTitle: `Order: ${workItem.title[language]}`,
                        partnerId: partnerId,
                        managerId: 'decoration-manager-1', 
                        workItem: workItem,
                        status: 'new'
                    }
                }
            });
        } else {
            // Standard Lead Submission via API directly here to bypass DynamicForm default if needed, 
            // OR since DynamicForm supports customSubmit, we do the mutation here.
            // We'll use addLead directly to ensure correct type mapping (RequestType.LEAD wrapper in addRequest is also fine but addLead is more specific).
            
            // Actually, let's use addRequest consistent with DynamicForm's default but we need to construct the payload manually
            addRequest(RequestType.LEAD, {
                requesterInfo: { name: formData.customerName, phone: formData.customerPhone },
                payload: {
                    contactTime: formData.contactTime,
                    customerNotes: finalNotes,
                    partnerId: partnerId,
                    serviceTitle: serviceTitle,
                    managerId: managerId,
                    propertyId: propertyId,
                    serviceType: serviceType,
                    // If reference image exists in payload, pass it
                    referenceImage: formData.referenceImage
                }
            }).then(() => {
                 showToast(t_modal.successMessage, 'success');
                 setTimeout(() => navigate(-1), 2000);
            }).catch(() => {
                showToast('Submission failed. Please try again.', 'error');
            });
        }
    };

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-6">
                            <SiteLogo className="h-10 w-10" />
                            <span className="text-2xl">ONLY HELIO</span>
                        </Link>
                    </div>
                    
                    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">{pageTitle}</h2>
                        <p className="text-gray-500 text-center mb-8">({serviceTitle})</p>
                        
                        <DynamicForm 
                            slug={formSlug}
                            customSubmit={handleCustomSubmit}
                            submitButtonText={submitButtonText}
                            submitButtonIcon={isPaymentFlow ? <BanknotesIcon className="w-5 h-5" /> : undefined}
                            defaultValues={{
                                customerNotes: isCustom ? '' : '' // Can prepopulate if needed
                            }}
                        >
                             {/* Injected UI Elements */}
                            {workItem && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">{isPurchase ? (language === 'ar' ? 'المنتج' : 'Product') : t_decor_modal.reference}</p>
                                    <div className="flex gap-4 items-start">
                                        <img src={workItem.imageUrl} alt={workItem.alt} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 shadow-md" />
                                        <div className="space-y-1 text-sm flex-grow">
                                            <h3 className="font-bold text-gray-900 text-base">{workItem.title[language]}</h3>
                                            {workItem.dimensions && <p className="text-gray-500">{t_decor.dimensions}: {workItem.dimensions}</p>}
                                            {workItem.availability && <p className="text-gray-500">{t_decor.availability}: {workItem.availability === 'In Stock' ? t_decor.inStock : t_decor.madeToOrder}</p>}
                                        </div>
                                        {isPurchase && workItem.price && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">{language === 'ar' ? 'السعر' : 'Price'}</p>
                                                <p className="text-xl font-bold text-amber-600">{workItem.price.toLocaleString(language)} <span className="text-sm text-gray-500">EGP</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isBooking && tier && (
                                <div className="mb-6 p-5 bg-amber-50 rounded-lg border border-amber-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div>
                                        <p className="text-sm text-amber-800 font-semibold uppercase tracking-wider mb-1">{language === 'ar' ? 'تفاصيل الباقة' : 'Package Details'}</p>
                                        <h3 className="text-xl font-bold text-gray-900">{tier.unitType[language]}</h3>
                                        <p className="text-gray-600">{tier.areaRange[language]}</p>
                                    </div>
                                    <div className="text-center sm:text-right bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'السعر' : 'Price'}</p>
                                        <p className="text-2xl font-bold text-amber-600 flex items-center gap-1 justify-end">
                                            {tier.price.toLocaleString(language)} <span className="text-sm font-normal text-gray-500">EGP</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </DynamicForm>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestPage;
