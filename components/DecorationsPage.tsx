import React, { useState } from 'react';
import DecorationRequestModal from './DecorationRequestModal';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface DecorationsPageProps {
  language: Language;
}

const wallDecorGallery = [
    { src: "https://images.unsplash.com/photo-1596179783810-9582b1def325?q=80&w=1974&auto=format&fit=crop", alt: "Abstract wall sculpture" },
    { src: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=1965&auto=format&fit=crop", alt: "Floral wall relief" },
    { src: "https://images.unsplash.com/photo-1558244035-6085a8c27f3a?q=80&w=1964&auto=format&fit=crop", alt: "Geometric wooden wall art" },
    { src: "https://images.unsplash.com/photo-1618221319985-38542b515f4e?q=80&w=1964&auto=format&fit=crop", alt: "Modern minimalist wall decor" },
];

const paintingsGallery = [
    { src: "https://images.unsplash.com/photo-1547891654-e66ed711b999?q=80&w=2072&auto=format&fit=crop", alt: "Abstract canvas painting" },
    { src: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1974&auto=format&fit=crop", alt: "Colorful modern art" },
    { src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format&fit=crop", alt: "Classic still life painting" },
    { src: "https://images.unsplash.com/photo-1531816438848-92115164f9b2?q=80&w=2070&auto=format&fit=crop", alt: "Landscape oil painting" },
];

const antiquesGallery = [
    { src: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop", alt: "Antique vase" },
    { src: "https://images.unsplash.com/photo-1588399539396-a4a3504f4a3e?q=80&w=1974&auto=format&fit=crop", alt: "Vintage decorative plate" },
    { src: "https://images.unsplash.com/photo-1614728263953-f51c7b275135?q=80&w=1974&auto=format&fit=crop", alt: "Ornate sculpture" },
    { src: "https://images.unsplash.com/photo-1567102604928-1906a10065a3?q=80&w=2070&auto=format&fit=crop", alt: "Antique clock" },
];

interface DecorationServiceSectionProps {
    title: string;
    description: string;
    images: { src: string; alt: string; }[];
    onRequest: () => void;
    buttonText: string;
}

const DecorationServiceSection: React.FC<DecorationServiceSectionProps> = ({ title, description, images, onRequest, buttonText }) => (
    <section className="py-20">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
                <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">{description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {images.map((img, index) => (
                    <div key={index} className="group overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1 bg-gray-800">
                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                    </div>
                ))}
            </div>
            <div className="text-center">
                <button 
                    onClick={onRequest}
                    className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    </section>
);


const DecorationsPage: React.FC<DecorationsPageProps> = ({ language }) => {
    const t = translations[language].decorationsPage;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState('');

    const openModal = (title: string, type: string) => {
        setModalTitle(title);
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="bg-gray-900 text-white">
            {isModalOpen && <DecorationRequestModal onClose={closeModal} serviceTitle={modalTitle} serviceType={modalType} language={language} />}

            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')" }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{t.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">{t.heroSubtitle}</p>
                </div>
            </section>
            
            <DecorationServiceSection
                title={t.section1Title}
                description={t.section1Desc}
                images={wallDecorGallery}
                onRequest={() => openModal(t.section1ModalTitle, 'wall-decor')}
                buttonText={t.requestButton}
            />
            
            <div className="bg-gray-800">
                <DecorationServiceSection
                    title={t.section2Title}
                    description={t.section2Desc}
                    images={paintingsGallery}
                    onRequest={() => openModal(t.section2ModalTitle, 'painting')}
                    buttonText={t.requestButton}
                />
            </div>

            <DecorationServiceSection
                title={t.section3Title}
                description={t.section3Desc}
                images={antiquesGallery}
                onRequest={() => openModal(t.section3ModalTitle, 'antique')}
                buttonText={t.requestButton}
            />
        </div>
    );
};

export default DecorationsPage;