import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon, CheckBadgeIcon, ShareIcon, HeartIcon, HeartIconSolid, FloorIcon, CalendarIcon, WalletIcon, BuildingIcon, WrenchScrewdriverIcon, CompoundIcon, BanknotesIcon } from './icons/Icons';
import type { Property, Language } from '../types';
import { useFavorites } from './shared/FavoritesContext';
import Lightbox from './shared/Lightbox';
import { isCommercial } from '../utils/propertyUtils';
import BannerDisplay from './shared/BannerDisplay';
import { getPropertyById } from '../services/properties';
import { useQuery } from '@tanstack/react-query';
import DetailItem from './shared/DetailItem';
import ContactOptionsModal from './shared/ContactOptionsModal';
import { useToast } from './shared/ToastContext';
import SEO from './shared/SEO';
import DetailSection from './shared/DetailSection';
import { getProjectById } from '../services/projects';
import { getAllAmenities } from '../services/filters';
import { getPartnerById } from '../services/partners';
import { useLanguage } from './shared/LanguageContext';
import PropertyDetailsSkeleton from './shared/PropertyDetailsSkeleton';


const PropertyDetailsPage: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const fetchProperty = useCallback(() => getPropertyById(propertyId!), [propertyId]);

    const { data: property, isLoading: isLoadingProperty } = useQuery({ queryKey: [`property-${propertyId}`], queryFn: fetchProperty, enabled: !!propertyId });
    
    const { data: project, isLoading: isLoadingProjs } = useQuery({
        queryKey: [`project-${property?.projectId}`],
        queryFn: () => getProjectById(property!.projectId!),
        enabled: !!property?.projectId,
    });

    const { data: partner, isLoading: isLoadingPartners } = useQuery({
        queryKey: [`partner-${property?.partnerId}`],
        queryFn: () => getPartnerById(property!.partnerId!),
        enabled: !!property?.partnerId,
    });
    
    const { data: amenities, isLoading: isLoadingAmenities } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });

    const isLoading = isLoadingProperty || isLoadingProjs || isLoadingAmenities || isLoadingPartners;
    
    const [mainImage, setMainImage] = useState<string | undefined>(undefined);
    const [lightboxState, setLightboxState] = useState({ isOpen: false, startIndex: 0 });
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [activeContactMethods, setActiveContactMethods] = useState<any>(null);

    useEffect(() => {
        if (property) {
            setMainImage(property.gallery[0] || property.imageUrl);
        }
    }, [property]);
    
    const { isFavorite, toggleFavorite } = useFavorites();
    const isFav = property ? isFavorite(property.id) : false;

    const handleFavoriteClick = () => {
        if (property) {
            toggleFavorite(property.id);
            if (!isFav) {
                showToast(t.favoritesPage.addedToFavorites, 'success');
            } else {
                showToast(t.favoritesPage.removedFromFavorites, 'success');
            }
        }
    };
    
    const openLightbox = (index: number) => {
        setLightboxState({ isOpen: true, startIndex: index });
    }

    const handleShare = async () => {
        if (!property) return;
        
        const baseUrl = window.location.href.split('#')[0];
        const propertyUrl = `${baseUrl}#/properties/${property.id}`;
        const shareData = {
            title: property.title[language],
            text: `${property.title[language]} - ${property.price[language]}`,
            url: propertyUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing property:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(propertyUrl);
                showToast(t.sharing.linkCopied, 'success');
            } catch (err) {
                console.error('Failed to copy link:', err);
                showToast(t.sharing.shareFailed, 'error');
            }
        }
    };

    const handleContactClick = () => {
        if (!property) return;

        if (property.contactMethod === 'direct' && property.ownerPhone) {
            const directContactMethods = {
                whatsapp: { enabled: true, number: property.ownerPhone },
                phone: { enabled: true, number: property.ownerPhone },
                form: { enabled: false }
            };
            setActiveContactMethods(directContactMethods);
            setIsContactModalOpen(true);
            return;
        }

        if (partner?.contactMethods) {
            const { contactMethods } = partner;
            const enabledMethods = Object.entries(contactMethods)
                .filter(([, value]) => typeof value === 'object' && value !== null && (value as any).enabled)
                .map(([key]) => key);

            if (enabledMethods.length === 1) {
                const method = enabledMethods[0];
                if (method === 'whatsapp' && contactMethods.whatsapp.number) {
                    window.open(`https://wa.me/${contactMethods.whatsapp.number.replace(/\D/g, '')}`, '_blank');
                } else if (method === 'phone' && contactMethods.phone.number) {
                    window.location.href = `tel:${contactMethods.phone.number.replace(/\s/g, '')}`;
                } else { 
                    navigateToServiceRequest();
                }
            } else if (enabledMethods.length > 1) {
                setActiveContactMethods(contactMethods);
                setIsContactModalOpen(true);
            } else { 
                navigateToServiceRequest();
            }
            return;
        }
        
        navigateToServiceRequest();
    };

    const navigateToServiceRequest = () => {
        if (!property) return;
        const serviceTitle = `${t.propertyDetailsPage.inquiryAbout} "${property.title[language]}"`;
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: property.partnerId,
                propertyId: property.id,
                serviceType: 'property',
            }
        });
    };

    const amenityMap = useMemo(() => {
        return new Map((amenities || []).map(a => [a.en, a[language]]));
    }, [amenities, language]);

    const isForSale = useMemo(() => property?.status.en === 'For Sale', [property]);

    const displayPricePerMeter = useMemo(() => {
        if (!property) return null;
        
        // If price per meter is already provided, use it.
        if (property.pricePerMeter?.[language]) {
            return property.pricePerMeter[language];
        }

        // Only calculate for properties that are for sale and have valid data.
        if (isForSale && property.priceNumeric && property.area && property.area > 0) {
            const perMeter = Math.round(property.priceNumeric / property.area);
            if (language === 'ar') {
                return `${perMeter.toLocaleString('ar-EG')} ج.م/م²`;
            }
            return `EGP ${perMeter.toLocaleString('en-US')}/m²`;
        }

        // Otherwise, don't show anything.
        return null;
    }, [property, isForSale, language]);

    if (isLoading) {
        return <PropertyDetailsSkeleton />;
    }

    if (!property) {
        return (
            <div className="py-20 text-center">
                <SEO title={t.propertyDetailsPage.notFoundTitle} description={t.propertyDetailsPage.notFoundText} />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.propertyDetailsPage.notFoundTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-4">{t.propertyDetailsPage.notFoundText}</p>
                <Link to="/properties" className="mt-8 inline-block bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600">
                    {t.propertyDetailsPage.backButton}
                </Link>
            </div>
        );
    }
    
    const pageTitle = `${property.title[language]} | ONLY HELIO`;
    const pageDescription = property.description[language].substring(0, 160);
    const pageUrl = window.location.href;
    const imageUrl = property.imageUrl_large || property.imageUrl;
    
    const isCommercialProp = isCommercial(property);
    const currentGallery = [property.imageUrl, ...property.gallery].filter((url, index, self) => url && self.indexOf(url) === index);
    const isDefaultImage = mainImage === property.imageUrl;
    
    const formatDeliveryDate = (delivery: Property['delivery']) => {
        if (!delivery) return '-';
        if (delivery.isImmediate) return t.propertyDetailsPage.immediate;
        if (delivery.date) {
             const [year, month] = delivery.date.split('-');
             const date = new Date(parseInt(year), parseInt(month) - 1);
             const formatted = date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
             return `${t.propertyDetailsPage.onDate} ${formatted}`;
        }
        return '-';
    }
    
    const displayedAmenities = property.amenities.en.map(amenityEn => amenityMap.get(amenityEn) || amenityEn);

    return (
        <>
        <SEO title={pageTitle} description={pageDescription} url={pageUrl} imageUrl={imageUrl} />
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white py-12">
            {lightboxState.isOpen && (
                <Lightbox 
                    images={currentGallery}
                    startIndex={lightboxState.startIndex}
                    onClose={() => setLightboxState({ isOpen: false, startIndex: 0 })}
                />
            )}
             {isContactModalOpen && activeContactMethods && (
                <ContactOptionsModal
                    isOpen={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                    contactMethods={activeContactMethods}
                    onSelectForm={navigateToServiceRequest}
                />
            )}
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold">{property.title[language]}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">{property.address[language]}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images and Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div>
                            <div className="relative mb-4 watermarked rounded-lg shadow-lg">
                               <button 
                                    onClick={() => openLightbox(currentGallery.indexOf(mainImage ?? currentGallery[0]))}
                                    className="w-full block"
                                    aria-label={language === 'ar' ? `عرض صورة مكبرة لـ ${property.title[language]}` : `View larger image of ${property.title[language]}`}
                                >
                                    <picture>
                                        {isDefaultImage && property.imageUrl_small && (
                                            <source
                                                type="image/webp"
                                                srcSet={`${property.imageUrl_small}&fm=webp 480w, ${property.imageUrl_medium}&fm=webp 800w, ${property.imageUrl_large || property.imageUrl}&fm=webp 1200w`}
                                                sizes="(max-width: 1024px) 90vw, 60vw"
                                            />
                                        )}
                                        <img 
                                            src={mainImage}
                                            srcSet={isDefaultImage ? `${property.imageUrl_small} 480w, ${property.imageUrl_medium} 800w, ${property.imageUrl_large || property.imageUrl} 1200w` : undefined}
                                            sizes={isDefaultImage ? "(max-width: 1024px) 90vw, 60vw" : undefined}
                                            alt={property.title[language]} 
                                            className="w-full h-[500px] object-cover rounded-lg hover:opacity-90 transition-opacity disable-image-interaction"
                                            onContextMenu={(e) => e.preventDefault()}
                                            loading="lazy"
                                        />
                                    </picture>
                                </button>
                                <span className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} text-white font-semibold px-4 py-2 rounded-md text-base ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
                                  {property.status[language]}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {currentGallery.map((img, index) => (
                                    <div key={index} className="relative watermarked rounded-md">
                                        <button
                                            onClick={() => setMainImage(img)}
                                            className="block w-full h-full"
                                            aria-label={language === 'ar' ? `عرض الصورة المصغرة ${index + 1}` : `View thumbnail ${index + 1}`}
                                        >
                                            <img 
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                className={`w-full h-24 object-cover rounded-md cursor-pointer border-2 transition-all disable-image-interaction ${mainImage === img ? 'border-amber-500' : 'border-transparent hover:border-amber-400'}`}
                                                onContextMenu={(e) => e.preventDefault()}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overview */}
                        <DetailSection title={language === 'ar' ? 'نظرة عامة' : 'Overview'}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                                <DetailItem icon={<BuildingIcon className="w-6 h-6" />} label={t.propertiesPage.typeLabel} value={property.type[language]} />
                                {!isCommercialProp && <DetailItem icon={<BedIcon className="w-6 h-6" />} label={t.propertyDetailsPage.bedrooms} value={property.beds} />}
                                {!isCommercialProp && <DetailItem icon={<BathIcon className="w-6 h-6" />} label={t.propertyDetailsPage.bathrooms} value={property.baths} />}
                                <DetailItem icon={<AreaIcon className="w-6 h-6" />} label={t.propertyDetailsPage.area} value={`${property.area.toLocaleString(language)} m²`} />
                                {property.finishingStatus && <DetailItem icon={<WrenchScrewdriverIcon className="w-6 h-6" />} label={t.propertiesPage.finishing} value={property.finishingStatus[language]} />}
                                {property.floor !== undefined && <DetailItem icon={<FloorIcon className="w-6 h-6" />} label={t.propertiesPage.floor} value={property.floor} />}
                            </div>
                        </DetailSection>
                        
                        {/* Description */}
                        <DetailSection title={t.propertyDetailsPage.description}>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{property.description[language]}</p>
                        </DetailSection>
                        
                        {/* Details */}
                        <DetailSection title={language === 'ar' ? 'التفاصيل' : 'Details'}>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                <DetailItem icon={<CompoundIcon className="w-5 h-5" />} label={t.propertyDetailsPage.inCompound} value={property.isInCompound ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                                {isForSale && (
                                    <DetailItem icon={<BanknotesIcon className="w-5 h-5" />} label={t.propertiesPage.realEstateFinance} value={property.realEstateFinanceAvailable ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                                )}
                                <DetailItem icon={<CalendarIcon className="w-5 h-5" />} label={t.propertyDetailsPage.deliveryDate} value={formatDeliveryDate(property.delivery)} />
                                {isForSale && (
                                    <DetailItem icon={<WalletIcon className="w-5 h-5" />} label={t.propertiesPage.installments} value={property.installmentsAvailable ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                                )}
                                {property.installmentsAvailable && property.installments && isForSale && (
                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold mb-2">{t.propertyDetailsPage.installmentsPlan}</h3>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div><dt className="text-sm text-gray-500">{t.propertyDetailsPage.downPayment}</dt><dd className="font-bold">{property.installments.downPayment.toLocaleString(language)}</dd></div>
                                            <div><dt className="text-sm text-gray-500">{t.propertyDetailsPage.monthlyInstallment}</dt><dd className="font-bold">{property.installments.monthlyInstallment.toLocaleString(language)}</dd></div>
                                            <div><dt className="text-sm text-gray-500">{t.propertyDetailsPage.years}</dt><dd className="font-bold">{property.installments.years}</dd></div>
                                        </div>
                                    </div>
                                )}
                            </dl>
                        </DetailSection>

                        {/* Amenities */}
                         {displayedAmenities.length > 0 && (
                            <DetailSection title={t.propertyDetailsPage.amenities}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {displayedAmenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckBadgeIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-300">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        {/* Location Map */}
                        {property.location && typeof property.location.lat === 'number' && typeof property.location.lng === 'number' && (
                            <DetailSection title={t.propertyDetailsPage.location}>
                                <div className="relative rounded-lg overflow-hidden border dark:border-gray-700" style={{ paddingTop: '56.25%' }}>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${property.location.lat},${property.location.lng}`} target="_blank" rel="noopener noreferrer" title="View on Google Maps" className="absolute inset-0">
                                        <img 
                                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${property.location.lat},${property.location.lng}&zoom=15&size=800x450&markers=color:0xf59e0b%7C${property.location.lat},${property.location.lng}&maptype=roadmap&style=feature:poi|visibility:off&style=feature:transit|visibility:off&key=${process.env.API_KEY}`}
                                            alt={`${t.propertyDetailsPage.mapOf} ${property.title[language]}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </a>
                                </div>
                            </DetailSection>
                        )}

                        {project && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-lg">
                                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">{t.propertyDetailsPage.partOfProject}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{project.name[language]}</p>
                                    <Link to={`/projects/${project.id}`} className="font-semibold text-blue-600 dark:text-blue-300 hover:underline">
                                        {t.propertyDetailsPage.viewProject}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-3xl font-bold text-amber-500">{property.price[language]}</p>
                                        {displayPricePerMeter && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{displayPricePerMeter}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={handleShare} className="p-2 text-gray-500 dark:text-gray-400 hover:text-amber-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={t.sharing.shareProperty}>
                                            <ShareIcon className="w-6 h-6" />
                                        </button>
                                        <button onClick={handleFavoriteClick} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}>
                                            {isFav ? (
                                                <HeartIconSolid className="w-6 h-6 text-red-500" />
                                            ) : (
                                                <HeartIcon className="w-6 h-6" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="my-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t.propertyDetailsPage.contactAgent}</p>
                                    {partner ? (
                                        <Link to={`/partners/${partner.id}`} className="flex items-center gap-3 group">
                                            <img src={partner.imageUrl} alt={partner.name} className="w-12 h-12 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white group-hover:text-amber-500">{partner.name}</p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <BuildingIcon className="w-6 h-6 text-gray-400"/>
                                            </div>
                                            <p className="font-bold text-gray-800 dark:text-white">{t.partnerInfo['individual-listings'].name}</p>
                                        </div>
                                    )}
                                </div>

                                <button onClick={handleContactClick} className="w-full bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors text-lg">
                                    {t.propertyDetailsPage.contactButton}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <BannerDisplay location="details" />
        </div>
        </>
    );
};

export default PropertyDetailsPage;