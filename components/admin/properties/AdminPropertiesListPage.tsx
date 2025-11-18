import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProperties, updateProperty, deleteProperty } from '../../../services/properties';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import type { Property, ListingStatus } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../ui/Pagination';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import ConfirmationModal from '../../ui/ConfirmationModal';

interface AdminPropertiesListPageProps {
    title?: string;
    subtitle?: string;
    properties?: Property[];
    isLoading?: boolean;
    hideFilters?: ('search' | 'partner' | 'source')[];
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
    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [actionToConfirm, setActionToConfirm] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

    const { data: fetchedProperties, isLoading: isFetching } = useQuery({ 
        queryKey: ['allPropertiesAdmin'], 
        queryFn: getAllProperties,
        enabled: !propProperties, 
    });

    const properties = propProperties || fetchedProperties;
    const isLoading = propIsLoading || isFetching;

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Property> }) => updateProperty(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] })
    });
    
    const { 
        paginatedItems, 
        totalPages, 
        currentPage, 
        setCurrentPage, 
        searchTerm, 
        setSearchTerm,
        filters,
        setFilter 
    } = useAdminTable({
        data: properties,
        itemsPerPage: 10,
        initialSort: { key: 'listingStartDate', direction: 'descending' },
        searchFn: (item: Property, term) => 
            item.title.en.toLowerCase().includes(term) || 
            item.title.ar.includes(term) ||
            item.partnerName?.toLowerCase().includes(term),
        filterFns: {
             source: (item: Property, value: string) => {
                if (value === 'platform') {
                    // Individual listings or admin-user listings
                    return item.partnerId === 'individual-listings' || item.partnerId === 'admin-user';
                } else if (value === 'partner') {
                    // Anything NOT platform managed
                    return item.partnerId !== 'individual-listings' && item.partnerId !== 'admin-user';
                }
                return true;
            },
            status: (item: Property, value: string) => {
                if (value === 'all') return true;
                return item.listingStatus === value;
            }
        },
    });

    const title = propTitle || t_admin.propertiesTitle;
    const subtitle = propSubtitle || t_admin.propertiesSubtitle;

    const handleSelect = (id: string) => {
        setSelectedProperties(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProperties(paginatedItems.map(p => p.id));
        } else {
            setSelectedProperties([]);
        }
    };

    const handleBulkAction = async () => {
        if (!actionToConfirm) return;
        
        const promises = selectedProperties.map(id => {
            switch (actionToConfirm) {
                case 'activate': return updateProperty(id, { listingStatus: 'active' });
                case 'deactivate': return updateProperty(id, { listingStatus: 'inactive' });
                case 'delete': return deleteProperty(id);
                default: return Promise.resolve();
            }
        });

        await Promise.all(promises);
        queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] });
        setSelectedProperties([]);
        setActionToConfirm(null);
    };

    return (
        <div>
            {actionToConfirm === 'delete' && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setActionToConfirm(null)}
                    onConfirm={handleBulkAction}
                    title={t.adminDashboard.bulkActions.delete}
                    message={`Are you sure you want to delete ${selectedProperties.length} properties? This action cannot be undone.`}
                    confirmText={t.adminDashboard.bulkActions.delete}
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

            <div className="flex gap-4 mb-4 flex-wrap">
                {!hideFilters.includes('search') && (
                     <Input placeholder={t_admin.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm"/>
                )}
                {!hideFilters.includes('source') && (
                    <Select 
                        value={filters.source || 'all'} 
                        onChange={(e) => setFilter('source', e.target.value)}
                        className="max-w-xs"
                    >
                        <option value="all">{language === 'ar' ? 'كل المصادر' : 'All Sources'}</option>
                        <option value="platform">{language === 'ar' ? 'عقارات المنصة' : 'Platform Managed'}</option>
                        <option value="partner">{language === 'ar' ? 'عقارات الشركاء' : 'Partner Listings'}</option>
                    </Select>
                )}
                 <Select 
                    value={filters.status || 'all'} 
                    onChange={(e) => setFilter('status', e.target.value)}
                    className="max-w-xs"
                >
                    <option value="all">{t_admin.filter.all} Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="sold">Sold</option>
                </Select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                 {selectedProperties.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-sm">{selectedProperties.length} {t_admin.bulkActions.selected}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleBulkAction()}> {t_admin.bulkActions.activate}</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleBulkAction()}>{t_admin.bulkActions.deactivate}</Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setActionToConfirm('delete')}>{t_admin.bulkActions.delete}</Button>
                        <button onClick={() => setSelectedProperties([])} className={`text-sm font-medium text-gray-500 hover:text-gray-700 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t_admin.bulkActions.clear}</button>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedProperties.length === paginatedItems.length && paginatedItems.length > 0} /></TableHead>
                            <TableHead>{t_admin.propertyTable.image}</TableHead>
                            <TableHead>{t.dashboard.propertyTable.title}</TableHead>
                            {!hideFilters.includes('partner') && <TableHead>{t_admin.propertyTable.partner}</TableHead>}
                            <TableHead>{t_admin.propertyTable.liveStatus}</TableHead>
                            <TableHead>{t_admin.propertyTable.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={hideFilters.includes('partner') ? 5 : 6} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map(prop => (
                                <TableRow key={prop.id}>
                                    <TableCell><input type="checkbox" checked={selectedProperties.includes(prop.id)} onChange={() => handleSelect(prop.id)} /></TableCell>
                                    <TableCell><img src={prop.imageUrl_small || prop.imageUrl} alt="" className="w-16 h-16 object-cover rounded-md" /></TableCell>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">{prop.title[language]}</TableCell>
                                    {!hideFilters.includes('partner') && <TableCell>{prop.partnerName}</TableCell>}
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${prop.listingStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {prop.listingStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/admin/properties/edit/${prop.id}`}>
                                            <Button variant="link">{t_admin.propertyTable.edit}</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={hideFilters.includes('partner') ? 5 : 6} className="text-center p-8">No properties found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertiesListPage;