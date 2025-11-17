


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProjects, deleteProject as apiDeleteProject } from '../../../services/projects';
import { getAllPartnersForAdmin } from '../../../services/partners';
import { getAllProperties } from '../../../services/properties';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Project, AdminPartner } from '../../../types';
// FIX: Corrected import path for ConfirmationModal from '../shared/ConfirmationModal' to '../../ui/ConfirmationModal'.
import ConfirmationModal from '../../ui/ConfirmationModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
// FIX: Corrected import path for Pagination from '../shared/Pagination' to '../../ui/Pagination'.
import Pagination from '../../ui/Pagination';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

const AdminProjectsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const queryClient = useQueryClient();
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const { data: projects, isLoading: loadingProjects } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: properties, isLoading: loadingProperties } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });

    const isLoading = loadingProjects || loadingPartners || loadingProperties;

    const projectsWithDetails = React.useMemo(() => {
        if (isLoading) return [];
        return (projects || []).map(project => {
            const partner = (partners || []).find(p => p.id === project.partnerId);
            const unitsCount = (properties || []).filter(p => p.projectId === project.id).length;
            return { ...project, partnerName: partner?.name || 'N/A', unitsCount };
        });
    }, [projects, partners, properties, isLoading]);

    const deleteMutation = useMutation({
        mutationFn: async (projectId: string) => {
            const unitsToDelete = (properties || []).filter(p => p.projectId === projectId);
            // In a real app, this would be a single transactional API call
            await apiDeleteProject(projectId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allProjects'] });
            queryClient.invalidateQueries({ queryKey: ['allProperties'] });
            setProjectToDelete(null);
        }
    });
    
    const { paginatedItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm } = useAdminTable({
        data: projectsWithDetails,
        itemsPerPage: 10,
        initialSort: { key: 'name.en', direction: 'ascending' },
        searchFn: (item: typeof projectsWithDetails[0], term) => item.name.en.toLowerCase().includes(term) || item.name.ar.includes(term) || item.partnerName.toLowerCase().includes(term),
        filterFns: {},
    });

    return (
        <div>
            {projectToDelete && (
                <ConfirmationModal
                    isOpen={!!projectToDelete}
                    onClose={() => setProjectToDelete(null)}
                    onConfirm={() => deleteMutation.mutate(projectToDelete.id)}
                    title="Delete Project"
                    message={t_admin.projects.confirmDelete}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.projects.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_admin.projects.subtitle}</p>

            <div className="mb-4">
                 <Input placeholder={t_admin.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm"/>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_admin.projects.table.project}</TableHead>
                            <TableHead>{t_admin.projects.table.partner}</TableHead>
                            <TableHead>{t_admin.projects.table.units}</TableHead>
                            <TableHead>{t_admin.projects.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedItems.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img src={p.imageUrl} alt={p.name[language]} className="w-16 h-12 object-cover rounded-md"/>
                                        <div className="font-medium text-gray-900 dark:text-white">{p.name[language]}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{p.partnerName}</TableCell>
                                <TableCell>{p.unitsCount}</TableCell>
                                <TableCell>
                                    <Link to={`/admin/projects/edit/${p.id}`}><Button variant="link">{t.adminShared.edit}</Button></Link>
                                    <Button variant="link" className="text-red-500" onClick={() => setProjectToDelete(p)}>{t.adminShared.delete}</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminProjectsPage;