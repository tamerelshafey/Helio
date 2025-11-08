
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Banner } from '../../types';
import { translations } from '../../data/translations';
import AdminBannerFormModal from './AdminBannerFormModal';
import { ArrowDownIcon, ArrowUpIcon } from '../icons/Icons';
import { getAllBanners, deleteBanner as apiDeleteBanner } from '../../api/banners';
import { useApiQuery } from '../shared/useApiQuery';
import Pagination from '../shared/Pagination';
import { useLanguage } from '../shared/LanguageContext';

type SortConfig = {
    key: 'title' | 'locations' | 'status';
    direction: 'ascending' | 'descending';
} | null;

const ITEMS_PER_PAGE = 10;

const AdminBannersPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.manageBanners;
    const { data: banners, isLoading: loading, refetch } = useApiQuery('banners', getAllBanners);
    const [modalState, setModalState] = useState<{ isOpen: boolean, bannerToEdit?: Banner }>({ isOpen: false });
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

    const handleDelete = async (bannerId: string) => {
        if (window.confirm(t.confirmDelete)) {
            await apiDeleteBanner(bannerId);
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                <button
                    onClick={() => setModalState({ isOpen: true })}
                    className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                    {t.addBanner}
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t.tableImage}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('title')}>
                                    <div className="flex items-center">{t.tableTitle}{getSortIcon('title')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('locations')}>
                                    <div className="flex items-center">{t.tableLocations}{getSortIcon('locations')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>
                                    <div className="flex items-center">{t.tableStatus}{getSortIcon('status')}</div>
                                </th>
                                <th scope="col" className="px-6 py-3">{t.tableActions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8">Loading...</td></tr>
                            ) : paginatedBanners.length > 0 ? (
                                paginatedBanners.map(banner => (
                                    <tr key={banner.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">
                                            <img src={banner.imageUrl} alt={banner.title} className="w-24 h-12 object-cover rounded-md" />
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {banner.title}
                                        </th>
                                        <td className="px-6 py-4 capitalize">{banner.locations.join(', ')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${banner.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                                                {banner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            <button onClick={() => setModalState({ isOpen: true, bannerToEdit: banner })} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">{t.edit}</button>
                                            <button onClick={() => handleDelete(banner.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t.delete}</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center p-8">No banners found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminBannersPage;
