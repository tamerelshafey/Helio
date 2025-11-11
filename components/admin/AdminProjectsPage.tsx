

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Project, AdminPartner, Property } from '../../types';
import { inputClasses, selectClasses } from '../shared/FormField';
import { deleteProject as apiDeleteProject } from '../../services/projects';
import { useQuery } from '@tanstack/react-query';
import { getAllProjects } from '../../services/projects';
import { getAllPartnersForAdmin } from '../../services/partners';
import { getAllProperties } from '../../services/properties';
import Pagination from '../shared/Pagination';
import { useAdminTable } from './shared/useAdminTable';
import { useLanguage } from '../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

const ITEMS_PER_PAGE = 10;

const AdminProjectsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_projects = t.adminDashboard.projects;
    const t_filter = t.adminDashboard.filter;
    
    const { data: projects, isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: partners, isLoading: isLoadingPartners, refetch: refetchPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: properties, isLoading: isLoadingProperties, refetch: refetchProperties } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });
    const isLoading = isLoadingProjects || isLoadingPartners || isLoadingProperties;
    const refetchAll = useCallback(() => {
        refetchProjects();
        refetchPartners();
        refetchProperties();
    }, [refetchProjects, refetchPartners, refetchProperties]);

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

    const {
        paginatedItems: paginatedProjects,
        totalPages,
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        filters, setFilter,
        requestSort, getSortIcon
    } = useAdminTable({
        data: projectsWithDetails,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: `name.${language}`, direction: 'ascending' },
        searchFn: (p: Project & { partnerName: string; unitsCount: number; }, term: string) => 
            p.name[language].toLowerCase().includes(term) ||
            p.partnerName.toLowerCase().includes(term),
        filterFns: {
            partner: (p: Project & { partnerName: string; unitsCount: number; }, v: string) => p.partnerId === v,
        }
    });
    
    const handleDelete = async (projectId: string) => {
        if (window.confirm(t_projects.confirmDelete)) {
            await apiDeleteProject(projectId);
            refetchAll();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_projects.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_projects.subtitle}</p>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder={t_filter.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClasses} md:col-span-2`}
                />
                 <select value={filters.partner || 'all'} onChange={(e) => setFilter('partner', e.target.value)} className={selectClasses}>
                    <option value="all">{t_filter.allPartners}</option>
                    {partnerOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => requestSort(`name.${language}`)}>
                                <div className="flex items-center">{t_projects.table.project}{getSortIcon(`name.${language}`)}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('partnerName')}>
                                <div className="flex items-center">{t_projects.table.partner}{getSortIcon('partnerName')}</div>
                            </TableHead>
                            <TableHead>{t_projects.table.units}</TableHead>
                            <TableHead>{t_projects.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center p-8">Loading projects...</TableCell></TableRow>
                        ) : paginatedProjects.length > 0 ? (
                            paginatedProjects.map(project => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                     <div className="flex items-center gap-3">
                                        <img src={project.imageUrl} alt={project.name[language]} className="w-16 h-16 object-cover rounded-md"/>
                                        {project.name[language]}
                                    </div>
                                </TableCell>
                                <TableCell>{project.partnerName}</TableCell>
                                <TableCell className="font-bold">{project.unitsCount}</TableCell>
                                <TableCell className="space-x-2 whitespace-nowrap">
                                    <Link to={`/admin/projects/edit/${project.id}`} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">Edit</Link>
                                    <button onClick={() => handleDelete(project.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                </TableCell>
                            </TableRow>
                        ))
                        ) : (
                             <TableRow><TableCell colSpan={4} className="text-center p-8">No projects found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminProjectsPage;