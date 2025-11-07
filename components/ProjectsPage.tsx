import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Project, Partner } from '../types';
import { translations } from '../data/translations';
import { BuildingIcon, GridIcon, ListIcon } from './icons/Icons';
import { useDataContext } from './shared/DataContext';
import SEO from './shared/SEO';
import ProjectCardSkeleton from './shared/ProjectCardSkeleton';
import ProjectListItem from './shared/ProjectListItem';
import ProjectListItemSkeleton from './shared/ProjectListItemSkeleton';

interface ProjectsPageProps {
  language: Language;
}

const ProjectCard: React.FC<{ project: Project; developer?: Partner; unitsCount: number; language: Language }> = ({ project, developer, unitsCount, language }) => {
    const t = translations[language];
    const unitsText = unitsCount === 1 ? t.projectsPage.unitsAvailable : t.projectsPage.unitsAvailablePlural;
    
    return (
        <Link to={`/projects/${project.id}`} className="block group h-full">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
                <div className="relative">
                    <img src={project.imageUrl} alt={project.name[language]} className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-white text-2xl font-bold">{project.name[language]}</h3>
                        {developer && (
                            <p className="text-amber-300 text-sm">{t.propertyCard.by} {developer.name}</p>
                        )}
                    </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow mb-4 line-clamp-3">{project.description[language]}</p>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto flex justify-between items-center text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                           <BuildingIcon className="w-5 h-5" />
                           <span>{unitsCount} {unitsText}</span>
                        </div>
                        <span className="font-semibold text-amber-500 group-hover:underline">
                            {t.propertyCard.viewProject}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const ProjectsPage: React.FC<ProjectsPageProps> = ({ language }) => {
  const t = translations[language].projectsPage;
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const { allProjects: projects, allPartners: partners, allProperties: properties, isLoading } = useDataContext();
  
  const projectsWithDetails = React.useMemo(() => {
    if (!projects || !partners || !properties) return [];
    return projects.map(project => {
        const developer = (partners || []).find(p => p.id === project.partnerId);
        const unitsCount = (properties || []).filter(p => p.projectId === project.id).length;
        return { project, developer, unitsCount };
    }).filter(item => item.developer?.status === 'active');
  }, [projects, partners, properties]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-20">
      <SEO 
        title={`${translations[language].nav.projects} | ONLY HELIO`}
        description={t.subtitle}
      />
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{t.subtitle}</p>
        </div>
        
        <div className="flex justify-end items-center mb-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-800">
                <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-700 text-amber-500 shadow' : 'text-gray-500 hover:text-amber-500'}`}
                    aria-label="Grid View"
                >
                    <GridIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-700 text-amber-500 shadow' : 'text-gray-500 hover:text-amber-500'}`}
                    aria-label="List View"
                >
                    <ListIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        {isLoading ? (
            view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {Array.from({ length: 3 }).map((_, i) => <ProjectListItemSkeleton key={i} />)}
                </div>
            )
        ) : (
            view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projectsWithDetails.map(({ project, developer, unitsCount }) => (
                        <ProjectCard 
                            key={project.id}
                            project={project}
                            developer={developer}
                            unitsCount={unitsCount}
                            language={language}
                        />
                    ))}
                </div>
            ) : (
                 <div className="space-y-4 max-w-4xl mx-auto">
                    {projectsWithDetails.map(({ project, developer, unitsCount }) => (
                        <ProjectListItem
                            key={project.id}
                            project={project}
                            developer={developer}
                            unitsCount={unitsCount}
                            language={language}
                        />
                    ))}
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;