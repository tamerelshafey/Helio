
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProperties, deleteProperty as apiDeleteProperty } from '../../../services/properties';
import { getAllPartnersForAdmin } from '../../../services/partners';
import { getAllProjects } from '../../../services/projects';
import { getAllPropertyTypes } from '../../../services/filters';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Property, AdminPartner, Project, FilterOption } from '../../../types';
import ConfirmationModal from '../../shared/ConfirmationModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';

const AdminPropertiesListPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

    const { data: properties, isLoading: loadingProps } = useQuery({ queryKey: ['allPropertiesAdmin'], queryFn: getAllProperties });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: projects, isLoading: loadingProjects } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: propertyTypes, isLoading: loadingTypes } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const isLoading = loadingProps || loadingPartners || loadingProjects || loadingTypes;

    const deleteMutation = useMutation({
        mutationFn: apiDeleteProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] });
            setPropertyToDelete(null);
        }
    });
    
    const { 
        paginatedItems, totalPages, currentPage, setCurrentPage, 
        searchTerm, setSearchTerm, filters, setFilter 
    } = useAdminTable({
        data: properties,
        itemsPerPage: 10,
        initialSort: { key: 'listingStartDate', direction: 'descending' },
        searchFn: (item, term) => 
            item.title.en.toLowerCase().includes(term) || 
            item.title.ar.includes(term) ||
            item.partnerName?.toLowerCase().includes(term),
        filterFns: {
            status: (item, value) => item.status.en === value,
            type: (item, value) => item.type.en === value,
            partner: (item, value) => item.partnerId === value,
            project: (item, value) => item.projectId === value,
        },
    });

    return (
        <div>
            {propertyToDelete && (
                <ConfirmationModal
                    isOpen={!!propertyToDelete}
                    onClose={() => setPropertyToDelete(null)}
                    onConfirm={() => deleteMutation.mutate(propertyToDelete)}
                    title={t_admin.propertyTable.delete}
                    message={t_admin.propertyTable.confirmDelete}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_admin.propertiesTitle}</h1>
                 <Link to="/admin/properties/new">
                    <Button>{t.dashboard.addProperty}</Button>
                </Link>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                <Input placeholder={t_admin.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="lg:col-span-2"/>
                <Select value={filters.status || 'all'} onChange={e => setFilter('status', e.target.value)}>
                    <option value="all">{t.propertiesPage.allStatuses}</option>
                    <option value="For Sale">{t.propertiesPage.forSale}</option>
                    <option value="For Rent">{t.propertiesPage.forRent}</option>
                </Select>
                <Select value={filters.type || 'all'} onChange={e => setFilter('type', e.target.value)}>
                    <option value="all">{t.propertiesPage.allTypes}</option>
                    {(propertyTypes || []).map(opt => <option key={opt.id} value={opt.en}>{opt[language]}</option>)}
                </Select>
                <Select value={filters.partner || 'all'} onChange={e => setFilter('partner', e.target.value)}>
                    <option value="all">{t_admin.filter.allPartners}</option>
                    {(partners || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_admin.propertyTable.image}</TableHead>
                            <TableHead>{t.dashboard.propertyTable.title}</TableHead>
                            <TableHead>{t_admin.propertyTable.partner}</TableHead>
                            <TableHead>{t_admin.propertyTable.liveStatus}</TableHead>
                            <TableHead>{t_admin.propertyTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map(prop => (
                                <TableRow key={prop.id}>
                                    <TableCell><img src={prop.imageUrl_small || prop.imageUrl} alt="" className="w-16 h-16 object-cover rounded-md" /></TableCell>
                                    <TableCell className="font-medium text-gray-900 dark:text-white max-w-xs truncate">{prop.title[language]}</TableCell>
                                    <TableCell>
                                        <Link to={`/admin/partners?edit=${prop.partnerId}`} className="hover:underline text-blue-500">{prop.partnerName}</Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${prop.listingStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                                            {prop.listingStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell className="space-x-2 whitespace-nowrap">
                                        <Button variant="link" onClick={() => navigate(`/admin/properties/edit/${prop.id}`)}>{t_admin.propertyTable.edit}</Button>
                                        <a href={`#/properties/${prop.id}`} target="_blank" rel="noopener noreferrer"><Button variant="link">{t_admin.propertyTable.preview}</Button></a>
                                        <Button variant="link" className="text-red-500" onClick={() => setPropertyToDelete(prop.id)}>{t.adminShared.delete}</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={5} className="text-center p-8">No properties found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertiesListPage;
