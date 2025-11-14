
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Language, PortfolioItem, AdminPartner } from '../../types';
import BannerDisplay from '../shared/BannerDisplay';
import SEO from '../shared/SEO';
import { usePortfolioItems } from '../../hooks/usePortfolioItems';
import { usePartners } from '../../hooks/usePartners';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import CTA from '../home/CTA';
import { useFavorites } from '../shared/FavoritesContext';
import { useToast } from '../shared/ToastContext';
import { HeartIcon, HeartIconSolid, ShareIcon } from '../ui/Icons';

const ServicePackageCard: React.FC<{
    service: any; // Type from siteContent is complex
    onRequest: (title: string) => void;
    language: Language;
    t: any;
}> = ({ service, onRequest, language, t }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { showToast } = useToast();
    const serviceId = service.title.en;
    const isFav = isFavorite(serviceId, 'service');

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(serviceId, 'service');
        showToast(isFav ? t.favoritesPage.removedFromFavorites : t.favoritesPage.addedToFavorites, 'success');
    };

    return (
        <Card className="flex flex-col h-full p-0">
            <CardContent className="p-8 flex flex-col flex-grow relative">
                 <button onClick={handleFavoriteClick} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10" aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}>
                    {isFav ? <HeartIconSolid className="w-6 h-6 text-red-500" /> : <HeartIcon className="w-6 h-6 text-gray-500" />}
                </button>
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">{service.title[language]}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex-grow mb-6">{service.description[language]}</p>

                <div className="space-y-3 mb-6">
                    {(service.pricingTiers || []).map((tier: any, index: number) => (
                        <div key={index} className="flex justify-between items-baseline p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{tier.unitType[language]}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{tier.areaRange[language]}</p>
                            </div>
                            <p className="font-bold text-gray-900 dark:text-white">
                                {tier.price.toLocaleString(language)} EGP
                            </p>
                        </div>
                    ))}
                </div>

                <Button onClick={() => onRequest(service.title[language])} className="w-full mt-auto">
                    {t.finishingPage.requestButton}
                </Button>
            </CardContent>
        </Card>
    );
};

const PortfolioCard: React.FC<{
    item: PortfolioItem & { partnerName?: string };
    onRequest: (partnerId: string, serviceTitle: string) => void;
    language: Language;
    t: any;
}> = ({ item, onRequest, language, t }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { showToast } = useToast();
    const serviceTitle = `${t.finishingPage.requestButton}: ${item.title[language]}`;
    const isFav = isFavorite(item.id, 'portfolio');

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(item.id, 'portfolio');
        showToast(isFav ? t.favoritesPage.removedFromFavorites : t.favoritesPage.addedToFavorites, 'success');
    };

    return (
        <Card className="group flex flex-col p-0 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                <img src={item.imageUrl} alt={item.alt} className="w-full h-full object-cover disable-image-interaction" onContextMenu={(e) => e.preventDefault()} />
                 <button onClick={handleFavoriteClick} className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors z-10" aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}>
                    {isFav ? <HeartIconSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-white" />}
                </button>
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1">{item.title[language]}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">By {item.partnerName}</p>
                <Button onClick={() => onRequest(item.partnerId, serviceTitle)} variant="secondary" className="w-full mt-auto">
                    {t.finishingPage.requestButton}
                </Button>
            </CardContent>
        </Card>
    );
};

const FinishingPage: React.FC = () => {
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { data: portfolio, isLoading: isLoadingPortfolio } = usePortfolioItems();
    const { data: partners, isLoading: isLoadingPartners } = usePartners();
    const { data: siteContent, isLoading: isLoadingContent } = useSiteContent();

    const isLoading = isLoadingPortfolio || isLoadingPartners || isLoadingContent;

    const handleRequestService = (serviceTitle: string, partnerId: string = 'admin-user') => {
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: partnerId,
                serviceType: 'finishing',
            },
        });
    };
    
    const handleShare = async () => {
        const baseUrl = window.location.href.split('#')[0];
        const urlToShare = `${baseUrl}#/finishing`;
        
        try {
            await navigator.share({
                title: `${t.nav.finishing} | ONLY HELIO`,
                text: t.finishingPage.heroSubtitle,
                url: urlToShare,
            });
        } catch (error) {
            try {
                await navigator.clipboard.writeText(urlToShare);
                showToast(t.sharing.linkCopied, 'success');
            } catch (err) {
                showToast(t.sharing.shareFailed, 'error');
            }
        }
    };


    const services = useMemo(() => {
        if (!siteContent?.finishingServices) return [];
        return siteContent.finishingServices;
    }, [siteContent]);

    const finishingPartnersPortfolio = useMemo(() => {
        if (!portfolio || !partners) return [];
        const finishingPartnerIds = partners.filter((p) => p.type === 'finishing' && p.status === 'active').map((p) => p.id);
        return portfolio
            .filter((item) => finishingPartnerIds.includes(item.partnerId))
            .map((item) => ({
                ...item,
                partnerName: partners.find((p) => p.id === item.partnerId)?.name,
            }));
    }, [portfolio, partners]);

    if (isLoading) {
        return <div className="animate-pulse h-screen bg-gray-50 dark:bg-gray-800"></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <SEO title={`${t.nav.finishing} | ONLY HELIO`} description={t.finishingPage.heroSubtitle} />
            {/* Hero Section */}
            <section
                className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?fm=webp&q=75&w=1600&auto=format&fit=crop')",
                }}
            >
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto text-white">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{t.finishingPage.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">
                        {t.finishingPage.heroSubtitle}
                    </p>
                    <div className="mt-6">
                        <Button
                            onClick={handleShare}
                            variant="secondary"
                            className="bg-white/20 text-white border-white/50 hover:bg-white/30"
                        >
                            <ShareIcon className="w-5 h-5 mr-2" />
                            {t.sharing.share}
                        </Button>
                    </div>
                </div>
            </section>

            <BannerDisplay location="finishing" />

            {/* Services Packages Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold">{t.finishingPage.servicesTitle}</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-4">{t.finishingPage.servicesIntro}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {services.map((service, index) => (
                            <ServicePackageCard
                                key={index}
                                service={service}
                                onRequest={handleRequestService}
                                language={language}
                                t={t}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Partner Gallery */}
            {finishingPartnersPortfolio.length > 0 && (
                <section className="py-20 bg-gray-50 dark:bg-gray-800">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold">{t.finishingPage.galleryTitle}</h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 mt-4">
                                {t.finishingPage.gallerySubtitle}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {finishingPartnersPortfolio.map((item) => (
                                <PortfolioCard
                                    key={item.id}
                                    item={item as PortfolioItem & { partnerName?: string }}
                                    onRequest={handleRequestService}
                                    language={language}
                                    t={t}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <CTA />
        </div>
    );
};

export default FinishingPage;
