import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon, CheckBadgeIcon, ShareIcon, HeartIcon, FloorIcon, CalendarIcon, WalletIcon } from './icons/Icons';
import type { Property, Language, Project } from '../types';
import { translations } from '../data/translations';
import { useFavorites } from './shared/FavoritesContext';
import Lightbox from './shared/Lightbox';
import { isCommercial } from '../utils/propertyUtils';
import BannerDisplay from './shared/BannerDisplay';
import { getPropertyById } from '../mockApi/properties';
import { getAllProjects } from '../mockApi/projects';
import { getAllAmenities } from '../mockApi/filters';
import { useApiQuery } from './shared/useApiQuery';
import DetailItem from './shared/DetailItem';

interface PropertyDetailsPageProps {
    language: Language;
}

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ language }) => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const t = translations[language];
    const navigate = useNavigate();
    
    const fetchProperty = useCallback(() => {
        if (!propertyId) return Promise.resolve(undefined);
        return getPropertyById(propertyId);
    }, [propertyId]);

    const { data: property, isLoading: isLoadingProperty } = useApiQuery(`property-${propertyId}`, fetchProperty, { enabled: !!propertyId });
    const { data: projects, isLoading: isLoadingProjects } = useApiQuery('allProjects', getAllProjects);
    const { data: amenities, isLoading: isLoadingAmenities } = useApiQuery('allAmenities', getAllAmenities);

    const isLoading = isLoadingProperty || isLoadingProjects || isLoadingAmenities;
    
    const [mainImage, setMainImage] = useState<string | undefined>(undefined);
    const [lightboxState, setLightboxState] = useState({ isOpen: false, startIndex: 0 });

    const project = useMemo(() => {
        if (property?.projectId && projects) {
            return projects.find(p => p.id === property.projectId);
        }
        return undefined;
    }, [property, projects]);

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
                alert(t.sharing.linkCopied);
            } catch (err) {
                console.error('Failed to copy link:', err);
                alert(t.sharing.shareFailed);
            }
        }
    };

    const handleContactRequest = () => {
        if (!property) return;
        const serviceTitle = `${t.propertyDetailsPage.inquiryAbout} "${property.title[language]}"`;
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: property.partnerId,
                propertyId: property.id,
            }
        });
    };

    const amenityMap = useMemo(() => {
        return new Map((amenities || []).map(a => [a.en, a[language]]));
    }, [amenities, language]);

    if (isLoading) {
        return (
             <div className="py-20 text-center text-xl">
                Loading property details...
            </div>
        )
    }

    if (!property) {
        return (
            <div className="py-20 text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.propertyDetailsPage.notFoundTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-4">{t.propertyDetailsPage.notFoundText}</p>
                <Link to="/properties" className="mt-8 inline-block bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600">
                    {t.propertyDetailsPage.backButton}
                </Link>
            </div>
        );
    }
    
    const isForSale = property.status.en === 'For Sale';
    const isCommercialProp = isCommercial(property);
    const currentGallery = [property.imageUrl, ...property.gallery].filter((url, index, self) => self.indexOf(url) === index);
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
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white py-12">
            {lightboxState.isOpen && (
                <Lightbox 
                    images={currentGallery}
                    startIndex={lightboxState.startIndex}
                    onClose={() => setLightboxState({ isOpen: false, startIndex: 0 })}
                    language={language}
                />
            )}
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold">{property.title[language]}</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">{property.address[language]}</p>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto flex items-center gap-2">
                         <button 
                            onClick={handleFavoriteClick}
                            className="flex-shrink-0 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                            aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}
                        >
                            <HeartIcon className={`w-6 h-6 transition-colors ${isFav ? 'text-red-500 fill-current' : ''}`} />
                            <span>{isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}</span>
                        </button>
                        <button 
                            onClick={handleShare}
                            className="flex-shrink-0 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:border-amber-500 hover:text-amber-500 transition-colors"
                        >
                            <ShareIcon className="w-6 h-6" />
                            <span>{t.sharing.shareProperty}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images and Map */}
                    <div className="lg:col-span-2">
                        {/* Image Gallery */}
                        <div className="mb-8">
                            <div className="relative mb-4">
                               <button 
                                    onClick={() => openLightbox(currentGallery.indexOf(mainImage ?? currentGallery[0]))}
                                    className="w-full block"
                                >
                                    <img 
                                        src={mainImage}
                                        srcSet={isDefaultImage ? `${property.imageUrl_small} 480w, ${property.imageUrl_medium} 800w, ${property.imageUrl_large || property.imageUrl} 1200w` : undefined}
                                        sizes={isDefaultImage ? "(max-width: 1024px) 90vw, 60vw" : undefined}
                                        alt={property.title[language]} 
                                        className="w-full h-[500px] object-cover rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                                        loading="lazy"
                                    />
                                </button>
                                <span className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} text-white font-semibold px-4 py-2 rounded-md text-base ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
                                  {property.status[language]}
                                </span>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {currentGallery.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setMainImage(img)}
                                        className="block"
                                    >
                                        <img 
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className={`w-full h-24 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === img ? 'border-amber-500' : 'border-transparent hover:border-amber-400'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
                            <h2 className="text-2xl font-bold text-amber-500 mb-4">{t.propertyDetailsPage.description}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{property.description[language]}</p>
                        </div>
                        
                        {/* Key Information */}
                         <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
                            <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.propertyDetailsPage.keyInfo}</h2>
                            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                                <DetailItem label={t.propertiesPage.typeLabel} value={property.type[language]} />
                                <DetailItem label={t.propertiesPage.statusLabel} value={property.status[language]} />
                                {property.finishingStatus && <DetailItem label={t.propertiesPage.finishing} value={property.finishingStatus[language]} />}
                                {property.floor !== undefined && <DetailItem label={t.propertiesPage.floor} value={property.floor} />}
                                {property.isInCompound !== undefined && <DetailItem label={t.propertyDetailsPage.inCompound} value={property.isInCompound ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />}
                            </dl>
                        </div>

                        {/* Amenities */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
                             <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.propertyDetailsPage.amenities}</h2>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {displayedAmenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckBadgeIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-300">{amenity}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Price and Details */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-8">
                            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-4xl font-bold text-amber-500">{property.price[language]}</p>
                                {isForSale && property.pricePerMeter && (
                                    <p className="text-lg text-gray-500 dark:text-gray-400 -mt-2 mb-6">{property.pricePerMeter[language]}</p>
                                )}
                                
                                <div className="flex justify-around items-center text-gray-600 dark:text-gray-300 border-y border-gray-200 dark:border-gray-700 py-6 mb-6">
                                    {isCommercialProp ? (
                                        <>
                                            <div className="flex flex-col items-center gap-2">
                                                <FloorIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                                <span className="font-bold">{property.floor}</span>
                                                <span>{t.propertyDetailsPage.floor}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <AreaIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                                <span className="font-bold">{property.area} m²</span>
                                                <span>{t.propertyDetailsPage.area}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center gap-2">
                                                <BedIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                                <span className="font-bold">{property.beds}</span>
                                                <span>{t.propertyDetailsPage.bedrooms}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <BathIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                                <span className="font-bold">{property.baths}</span>
                                                <span>{t.propertyDetailsPage.bathrooms}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <AreaIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                                <span className="font-bold">{property.area} m²</span>
                                                <span>{t.propertyDetailsPage.area}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.propertyDetailsPage.contactAgent}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">{t.propertyDetailsPage.contactText}</p>
                                <button onClick={handleContactRequest} className="w-full block text-center bg-amber-500 text-gray-900 font-bold px-6 py-4 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200">
                                    {t.propertyDetailsPage.contactButton}
                                </button>
                            </div>
                            
                             {project && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t.propertyDetailsPage.partOfProject}</h3>
                                     <Link to={`/projects/${project.id}`} className="block group">
                                        <div className="flex items-center gap-4">
                                            <img src={project.imageUrl} alt={project.name[language]} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                            <div>
                                                <p className="font-bold group-hover:text-amber-500 transition-colors">{project.name[language]}</p>
                                                <p className="text-sm text-amber-600 dark:text-amber-500 group-hover:underline">{t.propertyDetailsPage.viewProject}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                             )}

                             { (property.delivery || property.installments) &&
                                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.propertyDetailsPage.deliveryPayment}</h2>
                                    <div className="space-y-6">
                                        {property.delivery && (
                                            <div className="flex items-center gap-4">
                                                <CalendarIcon className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                <DetailItem label={t.propertyDetailsPage.deliveryDate} value={formatDeliveryDate(property.delivery)} />
                                            </div>
                                        )}
                                        {property.installments && (
                                             <div className="flex items-start gap-4">
                                                <WalletIcon className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
                                                <div>
                                                     <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{t.propertyDetailsPage.installmentsPlan}</h3>
                                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                                        <div>
                                                            <div className="font-bold text-amber-500">{property.installments.downPayment.toLocaleString(language)}</div>
                                                            <div className="text-gray-500 dark:text-gray-400">{t.propertyDetailsPage.downPayment}</div>
                                                        </div>
                                                         <div>
                                                            <div className="font-bold text-amber-500">{property.installments.monthlyInstallment.toLocaleString(language)}</div>
                                                            <div className="text-gray-500 dark:text-gray-400">{t.propertyDetailsPage.monthlyInstallment}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-amber-500">{property.installments.years}</div>
                                                            <div className="text-gray-500 dark:text-gray-400">{t.propertyDetailsPage.years}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                             }
                              <div className="!mt-0">
                                <BannerDisplay location="details" language={language} />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;