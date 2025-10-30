import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Language, Partner, PortfolioItem, Property } from '../types';
import { translations } from '../data/translations';
import ServiceRequestModal from './ServiceRequestModal';
import Lightbox from './shared/Lightbox';
import FeatureSection from './FeatureSection';
import { useData } from './shared/DataContext';


interface PartnerProfilePageProps {
    language: Language;
}

const PartnerProfilePage: React.FC<PartnerProfilePageProps> = ({ language }) => {
    const { partnerId } = useParams<{ partnerId: string }>();
    const t = translations[language];
    const { partners, portfolio, properties, loading } = useData();

    const [partnerInfo, setPartnerInfo] = useState<Partner | undefined>();
    const [partnerPortfolio, setPartnerPortfolio] = useState<PortfolioItem[]>([]);
    const [partnerProperties, setPartnerProperties] = useState<Property[]>([]);
    
    useEffect(() => {
        if (!loading && partnerId) {
            const partner = partners.find(p => p.id === partnerId);
            setPartnerInfo(partner);
            if (partner) {
                if (partner.type === 'finishing') {
                    setPartnerPortfolio(portfolio.filter(item => item.partnerId === partnerId));
                } else {
                    setPartnerProperties(properties.filter(prop => prop.partnerId === partnerId));
                }
            }
        }
    }, [partnerId, partners, portfolio, properties, loading]);
    
    const localizedPartner = useMemo(() => {
        if (!partnerInfo) return null;
        return [
            ...t.partners.developers, 
            ...t.partners.finishing_companies, 
            ...t.partners.agencies
        ].find(p => p.id === partnerInfo.id);
    }, [partnerInfo, t.partners]);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lightboxState, setLightboxState] = useState({
        isOpen: false,
        images: [] as string[],
        startIndex: 0,
    });

    const openLightbox = (gallery: PortfolioItem[], startIndex: number) => {
        setLightboxState({
            isOpen: true,
            images: gallery.map(img => img.src),
            startIndex,
        });
    };

    if (loading) {
        return <div className="py-20 text-center">Loading...</div>;
    }

    if (!partnerInfo || !localizedPartner) {
        return (
            <div className="py-20 text-center container mx-auto px-6">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.partnerProfilePage.partnerNotFound}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-4">{t.partnerProfilePage.partnerNotFoundText}</p>
                <Link to="/" className="mt-8 inline-block bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600">
                    {t.partnerProfilePage.backToHome}
                </Link>
            </div>
        );
    }
    
    const serviceTitle = `${t.partnerProfilePage.serviceRequestFor} ${localizedPartner.name}`;

    return (
        <div className="bg-white dark:bg-gray-900">
             {isModalOpen && (
                <ServiceRequestModal
                    onClose={() => setIsModalOpen(false)}
                    serviceTitle={serviceTitle}
                    partnerId={partnerInfo.id}
                    language={language}
                />
            )}
            {lightboxState.isOpen && (
                <Lightbox 
                    images={lightboxState.images}
                    startIndex={lightboxState.startIndex}
                    onClose={() => setLightboxState({ isOpen: false, images: [], startIndex: 0 })}
                    language={language}
                />
            )}
            
            {/* Hero Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-6 text-center">
                    <img src={partnerInfo.imageUrl} alt={localizedPartner.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white dark:border-gray-700 shadow-lg"/>
                    <h1 className="text-4xl md:text-5xl font-bold text-amber-500">{localizedPartner.name}</h1>
                    <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mt-4">{localizedPartner.description}</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-8 bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20"
                    >
                        {t.partnerProfilePage.requestService}
                    </button>
                </div>
            </section>
            
            {/* Content Section */}
            {partnerInfo.type === 'finishing' && (
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t.partnerProfilePage.galleryTitle}</h2>
                        </div>
                        {partnerPortfolio.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {partnerPortfolio.map((img, index) => (
                                    <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-800">
                                        <img src={img.src} alt={img.alt} className="w-full h-80 object-cover transform transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                                            <button 
                                                onClick={() => openLightbox(partnerPortfolio, index)}
                                                className="bg-white/20 backdrop-blur-sm text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                                                aria-label="View image"
                                            >
                                            {language === 'ar' ? 'عرض' : 'View'}
                                            </button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                            <h3 className="text-white font-semibold">{img.title[language]}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">This partner has not uploaded any works yet.</p>
                        )}
                    </div>
                </section>
            )}

            {(partnerInfo.type === 'developer' || partnerInfo.type === 'agency') && (
                 <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t.partnerProfilePage.ourListings}</h2>
                        </div>
                         {partnerProperties.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {partnerProperties.map((prop) => (
                                    <FeatureSection key={prop.id} {...prop} language={language} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">This partner has not listed any properties yet.</p>
                        )}
                    </div>
                </section>
            )}

        </div>
    );
};

export default PartnerProfilePage;