
import React, { useState, useMemo } from 'react';
import type { Banner } from '../../types';
import AdminBannerFormModal from './content/AdminBannerFormModal';
import { ArrowDownIcon, ArrowUpIcon, PhotoIcon } from '../ui/Icons';
import { getAllBanners, deleteBanner as apiDeleteBanner } from '../../services/banners';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../ui/Pagination';
import { useLanguage } from '../shared/LanguageContext';
import ConfirmationModal from '../ui/ConfirmationModal';
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
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_banners.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage advertising banners across the site.</p>
                </div>
                <Button onClick={() => setModalState({ isOpen: true })} className="flex items-center gap-2">
                    <PhotoIcon className="w-5 h-5" />
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
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading banners...</TableCell></TableRow>
                        ) : paginatedBanners.length > 0 ? (
                            paginatedBanners.map(banner => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <div className="w-32 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900 dark:text-white">{banner.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{banner.link}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {banner.locations.map(loc => (
                                                <span key={loc} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 capitalize">
                                                    {loc}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize inline-flex items-center gap-1 ${
                                            banner.status === 'active' 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${banner.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                            {banner.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="space-x-2 whitespace-nowrap">
                                        <Button variant="secondary" size="sm" onClick={() => setModalState({ isOpen: true, bannerToEdit: banner })}>{t_banners.edit}</Button>
                                        <Button variant="danger" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border-none" onClick={() => setBannerToDelete(banner.id)}>{t_banners.delete}</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center p-12 text-gray-500">No banners found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminBannersPage;
