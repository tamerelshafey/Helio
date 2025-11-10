
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Banner } from '../../types';
import AdminBannerFormModal from './AdminBannerFormModal';
import { ArrowDownIcon, ArrowUpIcon } from '../icons/Icons';
import { getAllBanners, deleteBanner as apiDeleteBanner } from '../../api/banners';
// FIX: Replaced deprecated `useApiQuery` with `useQuery` from `@tanstack/react-query`.
import { useQuery } from '@tanstack/react-query';
import Pagination from '../shared/Pagination';
import { useLanguage } from '../shared/LanguageContext';
import ConfirmationModal from '../shared/ConfirmationModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Button } from '../ui/Button';

type SortConfig = {
    key: 'title' | 'locations' | 'status';
    direction: 'ascending' | 'descending';
} | null;

const ITEMS_PER_PAGE = 10;

const AdminBannersPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_banners = t.adminDashboard.manageBanners;
    const { data: banners, isLoading: loading, refetch } = useQuery({ queryKey: ['banners'], queryFn: getAllBanners });
    const [modalState, setModalState] = useState<{ isOpen: boolean, bannerToEdit?: Banner }>({ isOpen: false });
    const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const sortedBanners = useMemo(() => {
        let sortableItems = [...(banners || [])];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | string[] = a[sortConfig.key];
                let bValue: string | string[] = b[sortConfig.key];
                if(sortConfig.key === 'locations') {
                    aValue = a.locations.join(', ');
                    bValue = b.locations.join(', ');
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [banners, sortConfig]);

    const totalPages = Math.ceil(sortedBanners.length / ITEMS_PER_PAGE);
    const paginatedBanners = sortedBanners.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const requestSort = (key: 'title' | 'locations' | 'status') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'title' | 'locations' | 'status') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1" />
            : <ArrowDownIcon className="w-4 h-4 ml-1" />;
    };

    const handleDelete = async () => {
        if (bannerToDelete) {
            await apiDeleteBanner(bannerToDelete);
            setBannerToDelete(null);
            refetch();
        }
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false });
        refetch();
    };

    return (
        <div>
            {modalState.isOpen && (
                <AdminBannerFormModal
                    bannerToEdit={modalState.bannerToEdit}
                    onClose={handleModalClose}
                />
            )}
            {bannerToDelete && (
                <ConfirmationModal
                    isOpen={!!bannerToDelete}
                    onClose={() => setBannerToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete Banner"
                    message={t_banners.confirmDelete}
                    confirmText="Delete"
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_banners.title}</h1>
                <Button onClick={() => setModalState({ isOpen: true })}>
                    {t_banners.addBanner}
                </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_banners.tableImage}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('title')}>
                                <div className="flex items-center">{t_banners.tableTitle}{getSortIcon('title')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('locations')}>
                                <div className="flex items-center">{t_banners.tableLocations}{getSortIcon('locations')}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                                <div className="flex items-center">{t_banners.tableStatus}{getSortIcon('status')}</div>
                            </TableHead>
                            <TableHead>{t_banners.tableActions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedBanners.length > 0 ? (
                            paginatedBanners.map(banner => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <img src={banner.imageUrl} alt={banner.title} className="w-24 h-12 object-cover rounded-md" />
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {banner.title}
                                    </TableCell>
                                    <TableCell className="capitalize">{banner.locations.join(', ')}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${banner.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                                            {banner.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="space-x-2 whitespace-nowrap">
                                        <Button variant="link" onClick={() => setModalState({ isOpen: true, bannerToEdit: banner })}>{t_banners.edit}</Button>
                                        <Button variant="link" className="text-red-600 dark:text-red-500" onClick={() => setBannerToDelete(banner.id)}>{t_banners.delete}</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">No banners found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminBannersPage;