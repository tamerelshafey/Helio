

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Language, Project } from '../../types';
import { useAuth } from '../auth/AuthContext';
import FormField, { inputClasses } from '../shared/FormField';
import { addProject, updateProject } from '../../services/projects';
import { useQuery } from '@tanstack/react-query';
import { getAllProjects } from '../../services/projects';
import { Role, Permission } from '../../types';
import { useSubscriptionUsage } from '../shared/useSubscriptionUsage';
import UpgradeNotice from '../shared/UpgradeNotice';
import { useLanguage } from '../shared/LanguageContext';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ProjectFormPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { currentUser, hasPermission } = useAuth();
    const { data: projects, isLoading: projectsLoading } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects, enabled: !!projectId });
    const t_form = t.projectDashboard.projectForm;

    const { isLimitReached } = useSubscriptionUsage('projects');

    const [formData, setFormData] = useState({
        name: { ar: '', en: '' },
        description: { ar: '', en: '' },
    });
    const [image, setImage] = useState<string>('');
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (projectId && projects) {
            const project = projects.find(p => p.id === projectId);
            if (project && currentUser && 'type' in currentUser && (project.partnerId === currentUser.id || hasPermission(Permission.MANAGE_ALL_PROJECTS))) {
                setFormData({
                    name: project.name,
                    description: project.description,
                });
                setImage(project.imageUrl);
            } else if (!projectsLoading) { // check if projects have been loaded
                 const redirectPath = currentUser && 'type' in currentUser && hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? '/admin/projects' : '/dashboard/projects';
                navigate(redirectPath);
            }
        }
    }, [projectId, currentUser, navigate, projects, projectsLoading, hasPermission]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('.');
        setFormData(prev => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: value } }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setImage(base64);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !('type' in currentUser)) return;
        setFormLoading(true);

        const existingProject = projectId ? projects?.find(p => p.id === projectId) : undefined;

        const projectData: Omit<Project, 'id' | 'createdAt'> = {
            name: formData.name,
            description: formData.description,
            imageUrl: image,
            partnerId: existingProject?.partnerId || currentUser.id,
            features: existingProject?.features || [],
        };

        if (projectId) {
            await updateProject(projectId, projectData);
        } else {
            await addProject(projectData);
        }
        
        setFormLoading(false);
        const redirectPath = currentUser && 'type' in currentUser && hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? '/admin/projects' : '/dashboard/projects';
        navigate(redirectPath);
    };
    
     if (projectsLoading && projectId) return <div>Loading project...</div>

    const isAdmin = currentUser && 'type' in currentUser && hasPermission(Permission.MANAGE_ALL_PROJECTS);

    if (isLimitReached && !projectId && !isAdmin) {
        return <UpgradeNotice />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {projectId ? t_form.editTitle : t_form.addTitle}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={t_form.nameAr} id="name.ar">
                        <input type="text" name="name.ar" value={formData.name.ar} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                     <FormField label={t_form.nameEn} id="name.en">
                        <input type="text" name="name.en" value={formData.name.en} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                </div>
                <div>
                     <FormField label={t_form.descriptionAr} id="description.ar">
                        <textarea name="description.ar" value={formData.description.ar} onChange={handleChange} className={inputClasses} rows={4} required />
                    </FormField>
                </div>
                 <div>
                     <FormField label={t_form.descriptionEn} id="description.en">
                        <textarea name="description.en" value={formData.description.en} onChange={handleChange} className={inputClasses} rows={4} required />
                    </FormField>
                </div>
                 <FormField label={t_form.image} id="image">
                    <div className="flex items-center gap-4">
                        {image && <img src={image} alt="Project preview" className="w-24 h-24 rounded-md object-cover border" />}
                        <input type="file" id="image" accept="image/*" onChange={handleImageChange} className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`} required={!projectId} />
                    </div>
                </FormField>
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={formLoading} className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {formLoading ? '...' : (projectId ? t_form.saveChanges : t_form.createProject)}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectFormPage;