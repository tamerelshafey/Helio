

import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllRequests, updateRequest } from '../../../services/requests';
import { getAllPartnersForAdmin } from '../../../services/partners';
import { useAdminTable } from '../../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Request, RequestStatus, RequestType, AdminPartner } from '../../../types';
import Pagination from '../../shared/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';

// FIX: Added 'pending' status to the color map to make the type complete.
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

const requestTypeLabels: Record<RequestType, { en: string; ar: string }> = {
    [RequestType.LEAD]: { en: 'Lead', ar: 'طلب عميل' },
    [RequestType.PARTNER_APPLICATION]: { en: 'Partner Application', ar: 'طلب شراكة' },
    [RequestType.PROPERTY_LISTING_REQUEST]: { en: 'Listing Request', ar: 'طلب عرض عقار' },
    [RequestType.CONTACT_MESSAGE]: { en: 'Contact Message', ar: 'رسالة تواصل' },
    [RequestType.PROPERTY_INQUIRY]: { en: 'Property Inquiry', ar: 'طلب بحث' },
};

const AdminAllRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const queryClient = useQueryClient();

    const { data: requests, isLoading: loadingRequests } = useQuery({ queryKey: ['allRequests'], queryFn: getAllRequests });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const isLoading = loadingRequests || loadingPartners;

    const managers = useMemo(() => (partners || []).filter(p => p.role.includes('_manager') || p.role === 'admin'), [partners]);

    const mutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Request> }) => updateRequest(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allRequests'] }),
    });

    const { paginatedItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm, filters, setFilter } = useAdminTable({
        data: requests,
        itemsPerPage: 15,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item, term) => item.requesterInfo.name.toLowerCase().includes(term),
        filterFns: {
            type: (item, value) => item.type === value,
            status: (item, value) => item.status === value,
            assignedTo: (item, value) => item.assignedTo === value,
        },
    });

    const getSubject = (request: Request) => {
        switch (request.type) {
            case RequestType.LEAD: return (request.payload as any).serviceTitle;
            case RequestType.PROPERTY_LISTING_REQUEST: return `${(request.payload as any).propertyDetails.propertyType[language]} - ${(request.payload as any).propertyDetails.area}m²`;
            case RequestType.CONTACT_MESSAGE: return (request.payload as any).message;
            case RequestType.PROPERTY_INQUIRY: return (request.payload as any).details;
            case RequestType.PARTNER_APPLICATION: return (request.payload as any).companyType;
            default: return 'N/A';
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.nav.allLeads}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Central hub for managing all incoming requests and leads.</p>
            
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                <Input placeholder={t_admin.filter.searchByRequesterOrPhone} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <Select value={filters.type || 'all'} onChange={e => setFilter('type', e.target.value)}>
                    <option value="all">{t_admin.filter.all} Types</option>
                    {Object.entries(requestTypeLabels).map(([key, value]) => <option key={key} value={key}>{value[language]}</option>)}
                </Select>
                 <Select value={filters.status || 'all'} onChange={e => setFilter('status', e.target.value)}>
                    <option value="all">{t_admin.filter.all} Statuses</option>
                    {Object.entries(t_admin.adminRequests.requestStatus).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                </Select>
                 <Select value={filters.assignedTo || 'all'} onChange={e => setFilter('assignedTo', e.target.value)}>
                    <option value="all">{t_admin.filter.all} Assignees</option>
                    {(managers || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : paginatedItems.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium text-gray-500">{requestTypeLabels[req.type][language]}</TableCell>
                                <TableCell>
                                    <div>{req.requesterInfo.name}</div>
                                    <div className="text-xs text-gray-400">{req.requesterInfo.phone}</div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate" title={getSubject(req)}>{getSubject(req)}</TableCell>
                                <TableCell className="text-xs">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                     <Select
                                        value={req.status}
                                        onChange={(e) => mutation.mutate({ id: req.id, updates: { status: e.target.value as RequestStatus } })}
                                        className={`text-xs font-medium w-32 ${statusColors[req.status]}`}
                                    >
                                        {Object.entries(t_admin.adminRequests.requestStatus).map(([key, value]) => (
                                            <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{value as string}</option>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={req.assignedTo || ''}
                                        onChange={(e) => mutation.mutate({ id: req.id, updates: { assignedTo: e.target.value, status: 'assigned' } })}
                                        className="text-xs w-40"
                                    >
                                        <option value="">Unassigned</option>
                                        {(managers || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Link to={`/admin/requests/${req.id}`}><Button variant="link" size="sm">Details</Button></Link>
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

export default AdminAllRequestsPage;
