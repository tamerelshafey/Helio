import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProperties, updateProperty } from '../../../services/properties';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import type { Property, ListingStatus } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../ui/Pagination';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import AdminPropertyEditModal from './AdminPropertyEditModal';

interface AdminPropertiesListPageProps {
    title?: string;
    subtitle?: string;
    properties?: Property[];
    isLoading?: boolean;
    hideFilters?: ('search' | 'partner')[];
}

const AdminPropertiesListPage: React.FC<AdminPropertiesListPageProps> = ({
    title: propTitle,
    subtitle: propSubtitle,
    properties: propProperties,
    isLoading: propIsLoading,
    hideFilters = [],
}) => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const queryClient = useQueryClient();

    const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

    const { data: fetchedProperties, isLoading: isFetching } = useQuery({ 
        queryKey: ['allPropertiesAdmin'], 
        queryFn: getAllProperties,
        enabled: !propProperties, // Only fetch if data is not passed as a prop
    });

    const properties = propProperties || fetchedProperties;
    const isLoading = propIsLoading || isFetching;

    const { paginatedItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm } = useAdminTable({
        data: properties,
        itemsPerPage: 10,
        initialSort: { key: 'listingStartDate', direction: 'descending' },
        searchFn: (item: Property, term) => 
            item.title.en.toLowerCase().includes(term) || 
            item.title.ar.includes(term) ||
            item.partnerName?.toLowerCase().includes(term),
        filterFns: {},
    });

    const title = propTitle || t_admin.propertiesTitle;
    const subtitle = propSubtitle || t_admin.propertiesSubtitle;

    return (
        <div>
            {propertyToEdit && (
                <AdminPropertyEditModal
                    property={propertyToEdit}
                    onClose={() => setPropertyToEdit(null)}
                    onSave={() => {
                        queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] });
                        setPropertyToEdit(null);
                    }}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>
                 <Link to="/admin/properties/new">
                    <Button>{t.dashboard.addProperty}</Button>
                </Link>
            </div>

            {!hideFilters.includes('search') && (
                 <div className="mb-4">
                    <Input placeholder={t_admin.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm"/>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_admin.propertyTable.image}</TableHead>
                            <TableHead>{t.dashboard.propertyTable.title}</TableHead>
                            {!hideFilters.includes('partner') && <TableHead>{t_admin.propertyTable.partner}</TableHead>}
                            <TableHead>{t_admin.propertyTable.liveStatus}</TableHead>
                            <TableHead>{t_admin.propertyTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={hideFilters.includes('partner') ? 4 : 5} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map(prop => (
                                <TableRow key={prop.id}>
                                    <TableCell><img src={prop.imageUrl_small || prop.imageUrl} alt="" className="w-16 h-16 object-cover rounded-md" /></TableCell>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">{prop.title[language]}</TableCell>
                                    {!hideFilters.includes('partner') && <TableCell>{prop.partnerName}</TableCell>}
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${prop.listingStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {prop.listingStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="link" onClick={() => setPropertyToEdit(prop)}>{t_admin.propertyTable.edit}</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={hideFilters.includes('partner') ? 4 : 5} className="text-center p-8">No properties found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertiesListPage;