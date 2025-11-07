import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Language } from '../types';
import { translations } from '../data/translations';
import PropertyCard from './shared/PropertyCard';
import BannerDisplay from './shared/BannerDisplay';
import { 
    ParkIcon, 
    ShieldCheckIcon, 
    ShoppingCartIcon, 
    SwimmingPoolIcon, 
    BuildingStorefrontIcon, 
    ParkingIcon, 
    ElevatorIcon 
} from './icons/Icons';
import { useDataContext } from './shared/DataContext';
import SEO from './shared/SEO';
import ProjectDetailsSkeleton from './shared/ProjectDetailsSkeleton';

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
    ParkIcon,
    ShieldCheckIcon,
    ShoppingCartIcon,
    SwimmingPoolIcon,
    BuildingStorefrontIcon,
    ParkingIcon,
    ElevatorIcon,
};

const FeatureIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
    const IconComponent = iconMap[name];
    return IconComponent ? <IconComponent className={className} /> : null;
};


const ProjectDetailsPage: React.FC<{ language: Language }> = ({ language }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const t = translations[language];
    const t_page = translations[language].propertyDetailsPage;

    const { allProjects: projects, allProperties: properties, allPartners: partners, isLoading } = useDataContext();

    const [activeType, setActiveType] = useState('all');

    const project = useMemo(() => (projects || []).find(p => p.id === projectId), [projects, projectId]);
    const developer = useMemo(() => project ? (partners || []).find(p => p.id === project.partnerId) : undefined, [partners, project]);
    const projectProperties = useMemo(() => (properties || []).filter(prop => prop.projectId === projectId), [properties, projectId]);

    const unitTypes = useMemo(() => {
        const types = new Set(projectProperties.map(p => p.type.en));
        return ['all', ...Array.from(types)];
    }, [projectProperties]);
    
    const filteredProperties = useMemo(() => {
        if (activeType === 'all') return projectProperties;
        return projectProperties.filter(p => p.type.en === activeType);
    }, [projectProperties, activeType]);


    if (isLoading) {
        return <ProjectDetailsSkeleton />;
    }

    if (!project) {
        return (
            <div className="text-center py-20 container mx-auto">
                <SEO title="Project Not Found | ONLY HELIO" description="Sorry, we couldn't find the project you're looking for." />
                <h1 className="text-4xl font-bold">Project Not Found</h1>
                <p className="mt-4 text-gray-500">Sorry, we couldn't find the project you're looking for.</p>
                <Link to="/" className="mt-8 inline-block bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg">Back to Home</Link>
            </div>
        );
    }

    const pageTitle = `${project.name[language]} | ONLY HELIO`;
    const pageDescription = project.description[language].substring(0, 160);
    const pageUrl = window.location.href;
    const imageUrl = project.imageUrl_large || project.imageUrl;
    
    return (
        <>
        <SEO title={pageTitle} description={pageDescription} url={pageUrl} imageUrl={imageUrl} />
        <div className="bg-gray-50 dark:bg-gray-900">
            {/* Project Hero */}
            <section className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url(${project.imageUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-16 text-white">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">{project.name[language]}</h1>
                    {developer && (
                        <p className="mt-2 text-xl font-medium">
                            {t.propertyCard.by} <Link to={`/partners/${developer.id}`} className="text-amber-300 hover:underline">{developer.name}</Link>
                        </p>
                    )}
                </div>
            </section>
            
            <div className="container mx-auto px-6 py-20">
                 {/* Project Description */}
                <div className="max-w-4xl mx-auto mb-20">
                    <h2 className="text-3xl font-bold text-center text-amber-500 mb-6">{t.propertyDetailsPage.description}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-center whitespace-pre-line">
                        {project.description[language]}
                    </p>
                </div>

                {/* Project Features */}
                {project.features && project.features.length > 0 && (
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">{t_page.projectFeatures}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            {project.features.map((feature, index) => (
                                <div key={index} className="text-center flex flex-col items-center">
                                    <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-full mb-4">
                                        <FeatureIcon name={feature.icon} className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <p className="font-semibold text-gray-700 dark:text-gray-200">{feature.text[language]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <BannerDisplay location="details" language={language} />

                {/* Project Properties */}
                <div className="mt-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
                        {t_page.availableUnits}
                    </h2>
                     {unitTypes.length > 2 && ( // Show filters only if there's more than one type
                        <div className="flex justify-center flex-wrap gap-3 mb-12">
                            {unitTypes.map(type => {
                                const typeName = type === 'all' 
                                    ? t_page.allUnits 
                                    : (properties || []).find(p => p.type.en === type)?.type[language] || type;

                                return (
                                    <button
                                        key={type}
                                        onClick={() => setActiveType(type)}
                                        className={`px-6 py-2 font-semibold rounded-full transition-colors ${
                                            activeType === type
                                                ? 'bg-amber-500 text-gray-900 shadow'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {typeName}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {filteredProperties.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProperties.map(prop => (
                                <PropertyCard key={prop.id} {...prop} project={project} language={language} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'لا توجد وحدات متاحة حاليًا في هذا المشروع.' : 'There are currently no available units in this project.'}
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
        </>
    );
};

export default ProjectDetailsPage;