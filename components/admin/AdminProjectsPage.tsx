import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Project, AdminPartner, Property } from '../../types';
import { translations } from '../../data/translations';
import { inputClasses, selectClasses } from '../shared/FormField';
import { ArrowDownIcon, ArrowUpIcon } from '../icons/Icons';
import { getAllProjects, deleteProject as apiDeleteProject } from '../../api/projects';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getAllProperties } from '../../api/properties';
import { useApiQuery } from '../shared/useApiQuery';
import Pagination from '../shared/Pagination';

type SortConfig = {
    key: 'name' | 'partnerName';
    direction: 'ascending' | 'descending';
} | null;

const ITEMS_PER_PAGE = 10;

const AdminProjectsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.projects;
    const t_filter = translations[language].adminDashboard.filter;
    
    const { data: projects, isLoading: loadingProjects, refetch: refetchProjects } = useApiQuery('allProjectsAdmin', getAllProjects);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);
    const { data: properties, isLoading: loadingProperties } = useApiQuery('allPropertiesAdmin', getAllProperties);
    const loading = loadingProjects || loadingPartners || loadingProperties;

    const [searchTerm, setSearchTerm] = useState('');
    const [partnerFilter, setPartnerFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const partnerOptions = useMemo(() => {
        return (partners || [])
            .filter(p => p.type === 'developer')
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [partners]);

    const projectsWithDetails = useMemo(() => {
        return (projects || []).map(project => {
            const partner = (partners || []).find(p => p.id === project.partnerId);
            const unitsCount = (properties || []).filter(p => p.projectId === project.id).length;
            return { ...project, partnerName: partner?.name || 'N/A', unitsCount };
        });
    }, [projects, partners, properties]);

    const sortedAndFilteredProjects = useMemo(() => {
        let filteredProjects = [...projectsWithDetails];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredProjects = filteredProjects.filter(p =>
                p.name[language].toLowerCase().includes(lowercasedFilter) ||
                p.partnerName.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (partnerFilter !== 'all') {
            filteredProjects = filteredProjects.filter(p => p.partnerId === partnerFilter);
        }

        if (sortConfig) {
            filteredProjects.sort((a, b) => {
                const aValue = sortConfig.key === 'name' ? a.name[language] : a.partnerName;
                const bValue = sortConfig.key === 'name' ? b.name[language] : b.partnerName;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filteredProjects;
    }, [projectsWithDetails, searchTerm, partnerFilter, sortConfig, language]);

    const totalPages = Math.ceil(sortedAndFilteredProjects.length / ITEMS_PER_PAGE);
    const paginatedProjects = sortedAndFilteredProjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, partnerFilter]);
    
    const requestSort = (key: 'name' | 'partnerName') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'name' | 'partnerName') => {
        if (!sortConfig || sortConfig.key !== key) return <span className="w-4 h-4 ml-1"></span>;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />;
    };
    
    const handleDelete = async (projectId: string) => {
        if (window.confirm(t.confirmDelete)) {
            await apiDeleteProject(projectId);
            refetchProjects();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder={t_filter.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClasses} md:col-span-2`}
                />
                 <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)} className={selectClasses}>
                    <option value="all">{t_filter.allPartners}</option>
                    {partnerOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                                    <div className="flex items-center">{t.table.project}{getSortIcon('name')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('partnerName')}>
                                    <div className="flex items-center">{t.table.partner}{getSortIcon('partnerName')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3">{t.table.units}</th>
                                <th scope="col" className="px-6 py-3">{t.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-8">Loading projects...</td></tr>
                            ) : paginatedProjects.length > 0 ? (
                                paginatedProjects.map(project => (
                                <tr key={project.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                         <div className="flex items-center gap-3">
                                            <img src={project.imageUrl} alt={project.name[language]} className="w-16 h-16 object-cover rounded-md"/>
                                            {project.name[language]}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{project.partnerName}</td>
                                    <td className="px-6 py-4 font-bold">{project.unitsCount}</td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <Link to={`/admin/projects/edit/${project.id}`} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">Edit</Link>
                                        <button onClick={() => handleDelete(project.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-8">No projects found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} language={language} />
            </div>
        </div>
    );
};

export default AdminProjectsPage;
