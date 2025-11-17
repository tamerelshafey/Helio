


import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllPropertyInquiries,
    updatePropertyInquiryStatus,
    deletePropertyInquiry,
} from '../../../services/propertyInquiries';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
// FIX: Corrected import path for Pagination from '../shared/Pagination' to '../../ui/Pagination'.
import Pagination from '../../ui/Pagination';
import type { PropertyInquiryRequest, RequestStatus } from '../../../types';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
// FIX: Corrected import path for ConfirmationModal from '../shared/ConfirmationModal' to '../../ui/ConfirmationModal'.
import ConfirmationModal from '../../ui/ConfirmationModal';

// FIX: Completed the `statusColors` object to include all possible `RequestStatus` types.
const statusColors: { [key in RequestStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    assigned: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AdminPropertyInquiriesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_requests = t_admin.adminRequests;
    const queryClient = useQueryClient();
    const [requestToDelete, setRequestToDelete] = React.useState<string | null>(null);

    const { data: requests, isLoading } = useQuery({
        queryKey: ['propertyInquiries'],
        queryFn: getAllPropertyInquiries,
    });

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => updatePropertyInquiryStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['propertyInquiries'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePropertyInquiry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['propertyInquiries'] });
            setRequestToDelete(null);
        },
    });

    const { paginatedItems, totalPages, currentPage, setCurrentPage } = useAdminTable({
        data: requests,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: PropertyInquiryRequest, term) =>
            item.customerName.toLowerCase().includes(term) || item.customerPhone.includes(term),
        filterFns: {},
    });

    return (
        <div>
            {requestToDelete && (
                <ConfirmationModal
                    isOpen={!!requestToDelete}
                    onClose={() => setRequestToDelete(null)}
                    onConfirm={() => deleteMutation.mutate(requestToDelete)}
                    title={t.adminShared.delete}
                    message={t_requests.confirmDelete}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.nav.propertyInquiries}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_admin.propertyInquiries.subtitle}</p>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_requests.table.requester}</TableHead>
                            <TableHead>{t_admin.propertyInquiries.table.details}</TableHead>
                            <TableHead>{t_requests.table.date}</TableHead>
                            <TableHead>{t_requests.table.status}</TableHead>
                            <TableHead>{t_requests.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {req.customerName}
                                        </div>
                                        <div className="text-sm text-gray-500">{req.customerPhone}</div>
                                    </TableCell>
                                    <TableCell className="max-w-sm truncate" title={req.details}>
                                        {req.details}
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={req.status}
                                            onChange={(e) =>
                                                mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })
                                            }
                                            className={`text-xs font-medium w-32 ${statusColors[req.status]}`}
                                        >
                                            {Object.entries(t_requests.requestStatus).map(([key, value]) => (
                                                <option
                                                    key={key}
                                                    value={key}
                                                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                >
                                                    {value as string}
                                                </option>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            className="text-red-500"
                                            onClick={() => setRequestToDelete(req.id)}
                                        >
                                            {t_requests.table.delete}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-8">
                                    {t_admin.propertyInquiries.noRequests}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertyInquiriesPage;