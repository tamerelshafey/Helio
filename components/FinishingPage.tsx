import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FinishingRequestModal from './FinishingRequestModal';
import { EyeIcon, CubeIcon, WrenchScrewdriverIcon } from './icons/Icons';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface FinishingPageProps {
  language: Language;
}

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onRequest: () => void;
    buttonText: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, onRequest, buttonText }) => (
    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center flex flex-col items-center h-full">
        <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 p-4 rounded-full mb-6">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed flex-grow">{description}</p>
        <button 
            onClick={onRequest}
            className="mt-6 bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200"
        >
            {buttonText}
        </button>
    </div>
);


const FinishingPage: React.FC<FinishingPageProps> = ({ language }) => {
    const t = translations[language].finishingPage;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const openModal = (title: string) => {
        setModalTitle(title);
        setIsModalOpen(true);
    };

    const services = [
        {
            icon: <EyeIcon className="w-8 h-8" />,
            title: t.service1Title,
            description: t.service1Desc,
            onRequest: () => openModal(t.service1Title),
        },
        {
            icon: <CubeIcon className="w-8 h-8" />,
            title: t.service2Title,
            description: t.service2Desc,
            onRequest: () => openModal(t.service2Title),
        },
        {
            icon: <WrenchScrewdriverIcon className="w-8 h-8" />,
            title: t.service3Title,
            description: t.service3Desc,
            onRequest: () => openModal(t.service3Title),
        }
    ];

    return (
        <div className="bg-gray-900 text-white">
             {isModalOpen && <FinishingRequestModal onClose={() => setIsModalOpen(false)} serviceTitle={modalTitle} language={language} />}

            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop')" }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{t.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">{t.heroSubtitle}</p>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">{t.servicesTitle}</h2>
                        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">{t.servicesSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <ServiceCard key={service.title} {...service} buttonText={t.requestButton} />
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Gallery Section */}
            <section className="py-20 bg-gray-800">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold">{t.galleryTitle}</h2>
                        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">{t.gallerySubtitle}</p>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="overflow-hidden rounded-lg shadow-lg">
                            <img src="https://images.unsplash.com/photo-1600607687939-ce8a67767e5c?q=80&w=2070&auto=format&fit=crop" alt="Finished project 1" className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="overflow-hidden rounded-lg shadow-lg">
                            <img src="https://images.unsplash.com/photo-1537726235470-8504e3b77ce8?q=80&w=1950&auto=format&fit=crop" alt="Finished project 2" className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="overflow-hidden rounded-lg shadow-lg">
                             <img src="https://images.unsplash.com/photo-1600607686527-6fb88629f44b?q=80&w=2070&auto=format&fit=crop" alt="Finished project 3" className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="overflow-hidden rounded-lg shadow-lg">
                             <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" alt="Finished project 4" className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                        {t.ctaTitle}
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-8">
                       {t.ctaSubtitle}
                    </p>
                    <Link to="/contact" className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20">
                        {t.ctaButton}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default FinishingPage;