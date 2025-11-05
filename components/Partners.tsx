import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Partner, Project, AdminPartner, SiteContent } from '../types';
import { translations } from '../data/translations';
import { getAllPartnersForAdmin } from '../mockApi/partners';
import { getAllProjects } from '../mockApi/projects';
import { useApiQuery } from './shared/useApiQuery';
import { getContent } from '../mockApi/content';

interface PartnersProps {
    language: Language;
}

const PartnerCard: React.FC<{ partner: Partner, language: Language }> = ({ partner, language }) => {
    const t = translations[language];
    // Find localized partner data robustly
    const localizedPartner = useMemo(() => {
        return (t.partnerInfo as any)[partner.id];
    }, [partner.id, t.partnerInfo]);
    
    if (!localizedPartner) return null;

    return (
        <Link to={`/partners/${partner.id}`} className="block h-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 group h-full flex flex-col">
                <img 
                    src={partner.imageUrl_large || partner.imageUrl}
                    srcSet={`${partner.imageUrl_small} 480w, ${partner.imageUrl_medium} 800w, ${partner.imageUrl_large || partner.imageUrl} 1200w`}
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                    alt={localizedPartner.name} 
                    className="w-full h-48 object-cover"
                    loading="lazy"
                />
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-amber-500 mb-2 group-hover:text-amber-400 transition-colors">{localizedPartner.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow">{localizedPartner.description}</p>
                </div>
            </div>
        </Link>
    );
};

const ProjectCard: React.FC<{ project: Project, developer: Partner, language: Language }> = ({ project, developer, language }) => (
    <Link to={`/projects/${project.id}`} className="block h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 group h-full flex flex-col">
        <div className="relative">
            <img 
                src={project.imageUrl_large || project.imageUrl}
                srcSet={`${project.imageUrl_small} 480w, ${project.imageUrl_medium} 800w, ${project.imageUrl_large || project.imageUrl} 1200w`}
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 30vw"
                alt={project.name[language]} 
                className="w-full h-56 object-cover"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white text-xl font-bold">{project.name[language]}</h3>
                <p className="text-amber-300 text-sm">{translations[language].propertyCard.by} {developer.name}</p>
            </div>
        </div>
      </div>
    </Link>
);


const Partners: React.FC<PartnersProps> = ({ language }) => {
    const t = translations[language].partners;
    const { data: partners, isLoading: isLoadingPartners } = useApiQuery<AdminPartner[]>('allPartners', getAllPartnersForAdmin);
    const { data: projects, isLoading: isLoadingProjects } = useApiQuery('allProjects', getAllProjects);
    const { data: siteContent, isLoading: isLoadingContent } = useApiQuery('siteContent', getContent);

    const loading = isLoadingPartners || isLoadingProjects || isLoadingContent;

    const categorizedPartners = useMemo(() => {
        const activePartners = (partners || []).filter(p => p.status === 'active');
        const megaProjectDevelopers = activePartners.filter(p => p.type === 'developer' && p.displayType === 'mega_project');
        
        const partnerIdsWithMegaProjects = megaProjectDevelopers.map(p => p.id);
        const megaProjects = (projects || []).filter(proj => partnerIdsWithMegaProjects.includes(proj.partnerId));

        const otherPartners = activePartners.filter(p => p.displayType !== 'mega_project' && p.type !== 'admin' && p.type !== 'decorations' && p.id !== 'individual-listings');
        
        const sections = [
            { title: t.developers_title, partners: otherPartners.filter(p => p.type === 'developer') },
            { title: t.finishing_companies_title, partners: otherPartners.filter(p => p.type === 'finishing') },
            { title: t.agencies_title, partners: otherPartners.filter(p => p.type === 'agency') },
        ].filter(section => section.partners.length > 0);

        return { megaProjects, megaProjectDevelopers, sections };
    }, [partners, projects, t]);
    
    if (loading) {
        return <div className="py-20 bg-gray-50 dark:bg-gray-900 animate-pulse h-[500px]"></div>;
    }

    const content = siteContent.partners[language];

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {content.title}
                    </h2>
                     <p className="max-w-3xl mx-auto text-lg text-gray-500 dark:text-gray-400 mb-12">
                        {content.description}
                    </p>
                </div>

                {/* Mega Projects Section */}
                {categorizedPartners.megaProjects.length > 0 && (
                     <div className="mb-16">
                        <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-8">{t.mega_projects_title}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                           {categorizedPartners.megaProjects.map(project => {
                               const developer = categorizedPartners.megaProjectDevelopers.find(p => p.id === project.partnerId);
                               if (!developer) return null;
                               return <ProjectCard key={project.id} project={project} developer={developer} language={language} />;
                           })}
                        </div>
                    </div>
                )}


                {/* Other Partners */}
                {categorizedPartners.sections.map(section => (
                    <div key={section.title} className="mb-16">
                        <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-8">{section.title}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {section.partners.map((partner) => (
                               <PartnerCard key={partner.id} partner={partner} language={language} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Partners;