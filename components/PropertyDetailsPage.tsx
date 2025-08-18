import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propertiesData } from '../data/properties';
import { BedIcon, BathIcon, AreaIcon, CheckCircleIcon } from './icons/Icons';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface PropertyDetailsPageProps {
    language: Language;
}

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ language }) => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const t = translations[language].propertyDetailsPage;
    
    const property = useMemo(() => 
        propertiesData.find(p => p.id === propertyId),
    [propertyId]);

    const [mainImage, setMainImage] = useState(property?.imageUrl);

    if (!property) {
        return (
            <div className="py-20 text-center">
                <h1 className="text-4xl font-bold text-white">{t.notFoundTitle}</h1>
                <p className="text-gray-400 mt-4">{t.notFoundText}</p>
                <Link to="/properties" className="mt-8 inline-block bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600">
                    {t.backButton}
                </Link>
            </div>
        );
    }
    
    const isForSale = property.status.en === 'For Sale';

    return (
        <div className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold">{property.title[language]}</h1>
                    <p className="text-lg text-gray-400 mt-2">{property.address[language]}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images and Map */}
                    <div className="lg:col-span-2">
                        {/* Image Gallery */}
                        <div className="mb-8">
                            <div className="relative mb-4">
                               <img src={mainImage} alt={property.title[language]} className="w-full h-[500px] object-cover rounded-lg shadow-lg" />
                                <span className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} text-white font-semibold px-4 py-2 rounded-md text-base ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
                                  {property.status[language]}
                                </span>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {property.gallery.map((img, index) => (
                                    <img 
                                        key={index}
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        className={`w-full h-24 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === img ? 'border-amber-500' : 'border-transparent hover:border-amber-400'}`}
                                        onClick={() => setMainImage(img)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 mb-8">
                            <h2 className="text-2xl font-bold text-amber-500 mb-4">{t.description}</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{property.description[language]}</p>
                        </div>
                        
                        {/* Amenities */}
                        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 mb-8">
                             <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.amenities}</h2>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.amenities[language].map(amenity => (
                                    <div key={amenity} className="flex items-center gap-3">
                                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-300">{amenity}</span>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Map */}
                        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                             <h2 className="text-2xl font-bold text-amber-500 mb-4">{t.mapLocation}</h2>
                             <div className="overflow-hidden rounded-lg">
                                 <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27625.686876055146!2d31.60533565!3d30.122421899999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14581bb448a04499%3A0x3977a7c06ac29759!2sNew%20Heliopolis%2C%20El%20Shorouk%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1678886543210!5m2!1sen!2seg"
                                    width="100%" 
                                    height="450" 
                                    style={{ border: 0 }} 
                                    allowFullScreen
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Price and Details */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-gray-800 p-8 rounded-lg border border-gray-700">
                            <p className="text-4xl font-bold text-amber-500 mb-6">{property.price[language]}</p>
                            
                            <div className="flex justify-around items-center text-gray-300 border-y border-gray-700 py-6 mb-6">
                                <div className="flex flex-col items-center gap-2">
                                    <BedIcon className="w-8 h-8 text-gray-400" />
                                    <span className="font-bold">{property.beds}</span>
                                    <span>{t.bedrooms}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <BathIcon className="w-8 h-8 text-gray-400" />
                                    <span className="font-bold">{property.baths}</span>
                                    <span>{t.bathrooms}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <AreaIcon className="w-8 h-8 text-gray-400" />
                                    <span className="font-bold">{property.area} m²</span>
                                    <span>{t.area}</span>
                                </div>
                            </div>
                             
                            <h3 className="text-xl font-bold text-white mb-4">{t.contactAgent}</h3>
                            <div className="space-y-4 mb-6">
                                <p className="text-gray-400">{t.contactText}</p>
                            </div>
                            <Link to="/contact" className="w-full block text-center bg-amber-500 text-gray-900 font-bold px-6 py-4 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200">
                                {t.contactButton}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;