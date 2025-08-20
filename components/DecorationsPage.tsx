import React, { useState } from 'react';
import DecorationRequestModal from './DecorationRequestModal';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface DecorationsPageProps {
  language: Language;
}

type TabType = 'wall' | 'painting' | 'antique';

const galleries = {
    wall: [
        { src: "https://images.unsplash.com/photo-1596179783810-9582b1def325?q=80&w=1974&auto=format&fit=crop", alt: "Abstract wall sculpture" },
        { src: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=1965&auto=format&fit=crop", alt: "Floral wall relief" },
        { src: "https://images.unsplash.com/photo-1558244035-6085a8c27f3a?q=80&w=1964&auto=format&fit=crop", alt: "Geometric wooden wall art" },
        { src: "https://images.unsplash.com/photo-1618221319985-38542b515f4e?q=80&w=1964&auto=format&fit=crop", alt: "Modern minimalist wall decor" },
        { src: "https://images.unsplash.com/photo-1533090481720-337a8a6f3874?q=80&w=1974&auto=format&fit=crop", alt: "Textured wall art"},
        { src: "https://images.unsplash.com/photo-1555485489-a3594a107297?q=80&w=1964&auto=format&fit=crop", alt: "Metallic wall feature"},
        { src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2070&auto=format&fit=crop", alt: "Living room wall decor"},
        { src: "https://images.unsplash.com/photo-1617103995830-675c35a854a5?q=80&w=1974&auto=format&fit=crop", alt: "Elegant wall panel"},
    ],
    painting: [
        { src: "https://images.unsplash.com/photo-1547891654-e66ed711b999?q=80&w=2072&auto=format&fit=crop", alt: "Abstract canvas painting" },
        { src: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1974&auto=format&fit=crop", alt: "Colorful modern art" },
        { src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format&fit=crop", alt: "Classic still life painting" },
        { src: "https://images.unsplash.com/photo-1531816438848-92115164f9b2?q=80&w=2070&auto=format&fit=crop", alt: "Landscape oil painting" },
        { src: "https://images.unsplash.com/photo-1579541626927-484f3a7c6460?q=80&w=1974&auto=format&fit=crop", alt: "Portrait painting"},
        { src: "https://images.unsplash.com/photo-1578926375333-68115538e12c?q=80&w=1974&auto=format&fit=crop", alt: "Watercolor art"},
        { src: "https://images.unsplash.com/photo-1579965342575-52a4a2826370?q=80&w=2070&auto=format&fit=crop", alt: "Impressionist painting"},
        { src: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=2080&auto=format&fit=crop", alt: "Modern triptych canvas"},
    ],
    antique: [
        { src: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop", alt: "Antique vase" },
        { src: "https://images.unsplash.com/photo-1588399539396-a4a3504f4a3e?q=80&w=1974&auto=format&fit=crop", alt: "Vintage decorative plate" },
        { src: "https://images.unsplash.com/photo-1614728263953-f51c7b275135?q=80&w=1974&auto=format&fit=crop", alt: "Ornate sculpture" },
        { src: "https://images.unsplash.com/photo-1567102604928-1906a10065a3?q=80&w=2070&auto=format&fit=crop", alt: "Antique clock" },
        { src: "https://images.unsplash.com/photo-1600172454133-31628132d73b?q=80&w=1974&auto=format&fit=crop", alt: "Vintage camera"},
        { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop", alt: "Classic car model"},
        { src: "https://images.unsplash.com/photo-1594705397505-5c1a7199c372?q=80&w=1974&auto=format&fit=crop", alt: "Old books and candle"},
        { src: "https://images.unsplash.com/photo-1549194282-3ac3a812b322?q=80&w=1974&auto=format&fit=crop", alt: "Gramophone"},
    ]
};

const DecorationsPage: React.FC<DecorationsPageProps> = ({ language }) => {
    const t = translations[language].decorationsPage;
    const [activeTab, setActiveTab] = useState<TabType>('wall');
    const [modalInfo, setModalInfo] = useState({
        isOpen: false,
        title: '',
        serviceType: '',
        requestType: 'custom' as 'custom' | 'similar',
        imageUrl: undefined as string | undefined,
    });

    const openModal = (
        serviceType: string, 
        requestType: 'custom' | 'similar', 
        imageUrl?: string
    ) => {
        let title = '';
        if (requestType === 'similar') {
            title = t.modalTitleSimilar;
        } else if (serviceType === 'wall-decor') {
            title = t.modalTitleCustomWallDecor;
        } else if (serviceType === 'painting') {
            title = t.modalTitleCustomPainting;
        } else {
            title = t.modalTitleCustomAntique;
        }

        setModalInfo({ isOpen: true, title, serviceType, requestType, imageUrl });
    };

    const closeModal = () => {
        setModalInfo({ isOpen: false, title: '', serviceType: '', requestType: 'custom', imageUrl: undefined });
    };

    const tabs: { key: TabType, name: string, desc: string, serviceType: string, gallery: {src:string, alt:string}[] }[] = [
        { key: 'wall', name: t.tab1, desc: t.tab1Desc, serviceType: 'wall-decor', gallery: galleries.wall },
        { key: 'painting', name: t.tab2, desc: t.tab2Desc, serviceType: 'painting', gallery: galleries.painting },
        { key: 'antique', name: t.tab3, desc: t.tab3Desc, serviceType: 'antique', gallery: galleries.antique },
    ];
    
    const activeTabData = tabs.find(tab => tab.key === activeTab);

    return (
        <div className="bg-gray-900 text-white">
            {modalInfo.isOpen && <DecorationRequestModal 
                onClose={closeModal} 
                serviceTitle={modalInfo.title} 
                serviceType={modalInfo.serviceType}
                requestType={modalInfo.requestType}
                imageUrl={modalInfo.imageUrl}
                language={language} 
            />}

            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')" }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{t.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">{t.heroSubtitle}</p>
                </div>
            </section>
            
            <div className="py-20">
                <div className="container mx-auto px-6">
                    {/* Tabs */}
                    <div className="border-b border-gray-700 mb-12">
                        <nav className="-mb-px flex justify-center space-x-4 lg:space-x-8" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${activeTab === tab.key ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Active Tab Content */}
                    {activeTabData && (
                        <div key={activeTab} className="animate-fadeIn">
                            <div className="text-center mb-12">
                                <p className="text-lg text-gray-400 max-w-3xl mx-auto">{activeTabData.desc}</p>
                            </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                                {activeTabData.gallery.map((img, index) => (
                                    <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1 bg-gray-800">
                                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                                            <button 
                                                onClick={() => openModal(activeTabData.serviceType, 'similar', img.src)}
                                                className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors transform translate-y-2 group-hover:translate-y-0 text-center"
                                            >
                                                {t.requestSimilarButton}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <button 
                                    onClick={() => openModal(activeTabData.serviceType, 'custom')}
                                    className="bg-gray-800 border border-amber-500 text-amber-500 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-amber-500 hover:text-gray-900 transition-colors duration-200 shadow-lg shadow-amber-500/10"
                                >
                                    {t.requestCustomButton}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DecorationsPage;