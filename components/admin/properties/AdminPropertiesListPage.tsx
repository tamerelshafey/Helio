
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProperties, updateProperty, deleteProperty } from '../../../services/properties';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import type { Property } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../ui/Pagination';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent } from '../../ui/Card';
import TableSkeleton from '../../ui/TableSkeleton';
import { LocationMarkerIcon, CalendarIcon } from '../../ui/Icons';

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
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [actionToConfirm, setActionToConfirm] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

    const { data: fetchedProperties, isLoading: isFetching } = useQuery({ 
        queryKey: ['allPropertiesAdmin'], 
        queryFn: getAllProperties,
        enabled: !propProperties, 
    });

    const properties = propProperties || fetchedProperties;
    const isLoading = propIsLoading || isFetching;

    // Safe Translation Accessors with Fallbacks
    const t_table = {
        image: t_admin?.propertyTable?.image || "Image",
        title: t.dashboard?.propertyTable?.title || "Title",
        partner: t_admin?.propertyTable?.partner || (language === 'ar' ? 'الشريك' : 'Partner'),
        price: t.dashboard?.propertyTable?.price || "Price",
        location: t.propertyDetailsPage?.location || "Location",
        liveStatus: t_admin?.propertyTable?.liveStatus || (language === 'ar' ? 'الحالة' : 'Live Status'),
        actions: t_admin?.propertyTable?.actions || "Actions",
        edit: t_admin?.propertyTable?.edit || t.dashboard?.propertyTable?.edit || "Edit",
        delete: t_admin?.propertyTable?.delete || t.dashboard?.propertyTable?.delete || "Delete",
    };

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] })
    });

    // Initialize filters from URL params only if we are in "full list" mode (not embedded)
    const initialFilters = useMemo(() => {
        if (propProperties) return {}; 
        return {
            status: searchParams.get('status') || 'all',
            source: searchParams.get('source') || 'all',
        };
    }, [searchParams, propProperties]);
    
    const { 
        paginatedItems, 
        totalPages, 
        currentPage, 
        setCurrentPage, 
        searchTerm, 
        setSearchTerm,
        filters,
        setFilter,
        requestSort,
        getSortIcon
    } = useAdminTable({
        data: properties,
        itemsPerPage: 10,
        initialSort: { key: 'listingStartDate', direction: 'descending' },
        initialFilters,
        searchFn: (item: Property, term) => 
            item.title.en.toLowerCase().includes(term) || 
            item.title.ar.includes(term) ||
            (item.partnerName?.toLowerCase() || '').includes(term),
        filterFns: {
             source: (item: Property, value: string) => {
                if (value === 'platform') {
                    return item.partnerId === 'individual-listings' || item.partnerId === 'admin-user';
                } else if (value === 'partner') {
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
    
    const updateUrlFilter = (key: string, value: string) => {
        setFilter(key, value);
        if (!propProperties) {
             setSearchParams(prev => {
                if (value === 'all') prev.delete(key);
                else prev.set(key, value);
                return prev;
            }, { replace: true });
        }
    };

    const renderTable = (items: Property[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
             {selectedProperties.length > 0 && (
                <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-sm text-amber-900 dark:text-amber-100">{selectedProperties.length} {t_admin.bulkActions.selected}</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActionToConfirm('activate')} className="bg-white dark:bg-gray-800 text-green-600 hover:bg-green-50"> {t_admin.bulkActions.activate}</Button>
                        <Button variant="ghost" size="sm" onClick={() => setActionToConfirm('deactivate')} className="bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50">{t_admin.bulkActions.deactivate}</Button>
                        <Button variant="ghost" size="sm" onClick={() => setActionToConfirm('delete')} className="bg-white dark:bg-gray-800 text-red-600 hover:bg-red-50">{t_admin.bulkActions.delete}</Button>
                    </div>
                    <button onClick={() => setSelectedProperties([])} className={`text-sm font-medium text-gray-500 hover:text-gray-700 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t_admin.bulkActions.clear}</button>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedProperties.length === items.length && items.length > 0} /></TableHead>
                        <TableHead>{t_table.image}</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort(`title.${language}`)}>
                            {t_table.title} {getSortIcon(`title.${language}`)}
                        </TableHead>
                        {!hideFilters.includes('partner') && (
                            <TableHead className="cursor-pointer" onClick={() => requestSort('partnerName')}>
                                {t_table.partner} {getSortIcon('partnerName')}
                            </TableHead>
                        )}
                        <TableHead className="cursor-pointer" onClick={() => requestSort('priceNumeric')}>
                            {t_table.price} {getSortIcon('priceNumeric')}
                        </TableHead>
                        <TableHead>{t_table.location}</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('listingStartDate')}>
                            Date {getSortIcon('listingStartDate')}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('listingStatus')}>
                            {t_table.liveStatus} {getSortIcon('listingStatus')}
                        </TableHead>
                        <TableHead>{t_table.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={hideFilters.includes('partner') ? 8 : 9} className="p-0"><TableSkeleton cols={hideFilters.includes('partner') ? 8 : 9} rows={5} /></TableCell></TableRow>
                    ) : items.length > 0 ? (
                        items.map(prop => (
                            <TableRow key={prop.id}>
                                <TableCell><input type="checkbox" checked={selectedProperties.includes(prop.id)} onChange={() => handleSelect(prop.id)} /></TableCell>
                                <TableCell>
                                    <div className="w-16 h-12 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <img src={prop.imageUrl_small || prop.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-gray-900 dark:text-white max-w-xs truncate" title={prop.title[language]}>
                                        {prop.title[language]}
                                    </div>
                                    <div className="text-xs text-gray-500">{prop.type[language]} • {prop.area} m²</div>
                                </TableCell>
                                {!hideFilters.includes('partner') && <TableCell className="text-sm text-gray-600 dark:text-gray-400">{prop.partnerName}</TableCell>}
                                <TableCell className="font-semibold text-amber-600 dark:text-amber-500 text-sm whitespace-nowrap">{prop.price[language]}</TableCell>
                                <TableCell>
                                    <div className="flex items-center text-xs text-gray-500 gap-1 max-w-[150px] truncate">
                                        <LocationMarkerIcon className="w-3 h-3 flex-shrink-0"/>
                                        {prop.address[language]}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                        <CalendarIcon className="w-3 h-3" />
                                        {prop.listingStartDate ? new Date(prop.listingStartDate).toLocaleDateString(language) : '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize inline-flex items-center gap-1 ${
                                        prop.listingStatus === 'active' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                        : prop.listingStatus === 'sold'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${prop.listingStatus === 'active' ? 'bg-green-500' : prop.listingStatus === 'sold' ? 'bg-blue-500' : 'bg-gray-500'}`}></span>
                                        {prop.listingStatus}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {/* Switch to Full Page Edit */}
                                    <Link to={`/admin/properties/edit/${prop.id}`}>
                                        <Button variant="secondary" size="sm" className="px-2 py-1 text-xs h-auto">
                                            {t_table.edit}
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={hideFilters.includes('partner') ? 8 : 9} className="text-center p-8 text-gray-500">No properties found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderCard = (prop: Property) => (
        <Card key={prop.id} className={`overflow-hidden ${selectedProperties.includes(prop.id) ? 'ring-2 ring-amber-500' : ''}`}>
            <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                 <img src={prop.imageUrl_small || prop.imageUrl} alt="" className="w-full h-full object-cover" />
                 <div className="absolute top-2 right-2 z-10">
                     <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 shadow-sm"
                        checked={selectedProperties.includes(prop.id)} 
                        onChange={() => handleSelect(prop.id)} 
                    />
                 </div>
                 <span className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-bold rounded-md capitalize shadow-sm ${
                     prop.listingStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300'
                 }`}>
                    {prop.listingStatus}
                </span>
                 <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-bold">
                     {prop.price[language]}
                 </span>
            </div>
            <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{prop.title[language]}</h3>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                     {!hideFilters.includes('partner') && <p>{prop.partnerName}</p>}
                     <p className="flex items-center gap-1"><LocationMarkerIcon className="w-3 h-3"/> {prop.address[language]}</p>
                     <p className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {prop.listingStartDate ? new Date(prop.listingStartDate).toLocaleDateString(language) : 'N/A'}</p>
                </div>
                
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                    <Link to={`/admin/properties/edit/${prop.id}`}>
                         <Button variant="secondary" size="sm">{t_table.edit}</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="animate-fadeIn">
            {actionToConfirm === 'delete' && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setActionToConfirm(null)}
                    onConfirm={handleBulkAction}
                    title={t_admin.bulkActions.delete}
                    message={`Are you sure you want to delete ${selectedProperties.length} properties? This action cannot be undone.`}
                    confirmText={t_admin.bulkActions.delete}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>
                 <Link to="/admin/properties/new">
                    <Button className="w-full sm:w-auto">{t.dashboard.addProperty}</Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {!hideFilters.includes('search') && (
                     <Input placeholder={t_admin.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="sm:max-w-xs bg-white dark:bg-gray-700"/>
                )}
                {!hideFilters.includes('source') && (
                    <Select 
                        value={filters.source || 'all'} 
                        onChange={(e) => updateUrlFilter('source', e.target.value)}
                        className="sm:max-w-[180px] bg-white dark:bg-gray-700"
                    >
                        <option value="all">{language === 'ar' ? 'كل المصادر' : 'All Sources'}</option>
                        <option value="platform">{language === 'ar' ? 'عقارات المنصة' : 'Platform Managed'}</option>
                        <option value="partner">{language === 'ar' ? 'عقارات الشركاء' : 'Partner Listings'}</option>
                    </Select>
                )}
                 <Select 
                    value={filters.status || 'all'} 
                    onChange={(e) => updateUrlFilter('status', e.target.value)}
                    className="sm:max-w-[150px] bg-white dark:bg-gray-700"
                >
                    <option value="all">{t_admin.filter.all} Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="sold">Sold</option>
                </Select>
            </div>
            
            {/* Mobile Bulk Actions Bar */}
            <div className="lg:hidden mb-4 sticky top-16 z-20">
                 {selectedProperties.length > 0 && (
                    <div className="p-3 bg-white dark:bg-gray-800 flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md animate-fadeIn">
                        <span className="font-semibold text-sm whitespace-nowrap">{selectedProperties.length} selected</span>
                        <div className="flex gap-2">
                             <Button variant="secondary" size="sm" onClick={() => setActionToConfirm('activate')}>Activate</Button>
                            <Button variant="danger" size="sm" onClick={() => setActionToConfirm('delete')}>Delete</Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedProperties([])} className="text-gray-500">X</Button>
                        </div>
                    </div>
                )}
            </div>

            <ResponsiveList 
                items={paginatedItems}
                renderTable={renderTable}
                renderCard={renderCard}
                emptyState={<div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700">No properties found matching your criteria.</div>}
            />

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertiesListPage;
