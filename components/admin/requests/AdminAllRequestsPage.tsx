
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllRequests, updateRequest } from '../../../services/requests';
import { getAllPartnersForAdmin } from '../../../services/partners';
// FIX: Corrected import path for useAdminTable hook.
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Request, RequestStatus, RequestType, Lead, Role } from '../../../types';
// FIX: Corrected import path for Pagination from 'ui' to 'shared'.
import Pagination from '../../shared/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { ResponsiveList } from '../../shared/ResponsiveList';
import CardSkeleton from '../../ui/CardSkeleton';
// FIX: Corrected import path for TableSkeleton from 'shared' to 'ui'.
import TableSkeleton from '../../shared/TableSkeleton';
import { PlusIcon } from '../../ui/Icons';

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

const AdminAllRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const t_admin = t.adminDashboard;
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [viewMode, setViewMode] = useState<'mine' | 'all'>('mine');
    const isSuperAdmin = currentUser?.role === Role.SUPER_ADMIN;

    const { data: requests, isLoading: loadingRequests } = useQuery({ queryKey: ['allRequests'], queryFn: getAllRequests });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const isLoading = loadingRequests || loadingPartners;

    const managers = useMemo(() => (partners || []).filter(p => p.role.includes('_manager') || p.role === Role.SUPER_ADMIN), [partners]);

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Request> }) => updateRequest(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allRequests'] }),
    });
    
    const filteredData = useMemo(() => {
        if (!requests) return [];
        if (isSuperAdmin && viewMode === 'mine') {
            return requests.filter(req => req.assignedTo === currentUser?.id);
        }
        if (!isSuperAdmin) {
            return requests.filter(req => req.assignedTo === currentUser?.id);
        }
        return requests;
    }, [requests, isSuperAdmin, viewMode, currentUser]);
    
    // Initial filters from URL
    const initialFilters = useMemo(() => ({
        type: searchParams.get('type') || 'all',
        status: searchParams.get('status') || 'all',
        assignedTo: searchParams.get('assignedTo') || 'all',
    }), [searchParams]);

    const { paginatedItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm, filters, setFilter } = useAdminTable({
        data: filteredData,
        itemsPerPage: 15,
        initialSort: { key: 'createdAt', direction: 'descending' },
        initialFilters,
        searchFn: (item, term) => item.requesterInfo.name.toLowerCase().includes(term),
        filterFns: {
            type: (item, value) => item.type === value,
            status: (item, value) => item.status === value,
            assignedTo: (item, value) => item.assignedTo === value,
        },
    });
    
    const updateUrlFilter = (key: string, value: string) => {
        setFilter(key, value);
        setSearchParams(prev => {
            if (value === 'all') prev.delete(key);
            else prev.set(key, value);
            return prev;
        }, { replace: true });
    };

    const getSubject = (request: Request) => {
        const payload = request.payload as any;
        switch (request.type) {
            case RequestType.LEAD: return payload.serviceTitle;
            case RequestType.PROPERTY_LISTING_REQUEST: return `${payload.propertyDetails.propertyType[language]} - ${payload.propertyDetails.address}`;
            case RequestType.CONTACT_MESSAGE: 
                const message = payload.message || '';
                return message.length > 70 ? message.substring(0, 70) + '...' : message;
            case RequestType.PROPERTY_INQUIRY: 
                const details = payload.details || '';
                return details.length > 70 ? details.substring(0, 70) + '...' : details;
            case RequestType.PARTNER_APPLICATION: return payload.companyName;
            default: return 'N/A';
        }
    };
    
    const pageTitle = isSuperAdmin 
        ? t.adminDashboard.requestsTriage.title 
        : t.adminDashboard.nav.myRequests;
    
    const pageSubtitle = isSuperAdmin
        ? t.adminDashboard.requestsTriage.subtitle
        : (t.adminDashboard as any).manageLeadsSubtitle;

    const renderCard = (req: Request) => (
        <Card key={req.id} className="p-0">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-lg">{req.requesterInfo.name}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[req.status]}`}>
                        {req.type === RequestType.LEAD ? (t.dashboard.leadStatus[(req.payload as Lead).status] || (req.payload as Lead).status) : (t_admin.adminRequests.requestStatus[req.status] || req.status)}
                    </span>
                </div>
                <p className="text-sm text-gray-500">{t.adminDashboard.requestTypes[req.type]}</p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                    <p className="text-sm"><strong className="text-gray-500">Subject: </strong> <span className="line-clamp-2">{getSubject(req)}</span></p>
                    <p className="text-sm"><strong className="text-gray-500">Date: </strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                    <div className="text-sm"><strong className="text-gray-500">Assigned To: </strong> 
                        <Select
                            value={req.assignedTo || ''}
                            onChange={(e) => updateStatusMutation.mutate({ id: req.id, updates: { assignedTo: e.target.value, status: 'assigned' } })}
                            className="text-xs w-full mt-1"
                            disabled={!isSuperAdmin}
                        >
                            <option value="">Unassigned</option>
                            {(managers || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </Select>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50">
                <Link to={`/admin/requests/${req.id}`} className="w-full">
                    <Button variant="ghost" className="w-full">Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );

    const renderTable = (items: Request[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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
                    {items.map(req => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium text-gray-500 dark:text-gray-400">{t.adminDashboard.requestTypes[req.type]}</TableCell>
                            <TableCell>
                                <div>{req.requesterInfo.name}</div>
                                <div className="text-xs text-gray-400">{req.requesterInfo.phone}</div>
                            </TableCell>
                            <TableCell className="max-w-xs whitespace-normal break-words" title={getSubject(req)}>{getSubject(req)}</TableCell>
                            <TableCell className="text-xs">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[req.status]}`}>
                                    {req.type === RequestType.LEAD ? (t.dashboard.leadStatus[(req.payload as Lead).status] || (req.payload as Lead).status) : (t_admin.adminRequests.requestStatus[req.status] || req.status)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Select
                                    value={req.assignedTo || ''}
                                    onChange={(e) => updateStatusMutation.mutate({ id: req.id, updates: { assignedTo: e.target.value, status: 'assigned' } })}
                                    className="text-xs w-40"
                                    disabled={!isSuperAdmin}
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
    );
    
    const loadingSkeletons = (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <div className="hidden lg:block">
                <TableSkeleton cols={7} />
            </div>
        </>
    );
    
    const emptyState = <div className="text-center py-16 text-gray-500">No requests found.</div>;

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{pageTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{pageSubtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isSuperAdmin && (
                        <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex gap-1">
                            <Button variant={viewMode === 'mine' ? 'primary' : 'secondary'} onClick={() => setViewMode('mine')} className="!py-1.5">{t.adminDashboard.requestsTriage.myRequests}</Button>
                            <Button variant={viewMode === 'all' ? 'primary' : 'secondary'} onClick={() => setViewMode('all')} className="!py-1.5">{t.adminDashboard.requestsTriage.allRequests}</Button>
                        </div>
                    )}
                    <Link to="/admin/requests/new">
                        <Button className="flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" />
                            {t.adminShared.add} Request
                        </Button>
                    </Link>
                </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                <Input placeholder={t_admin.filter.searchByRequesterOrPhone} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <Select value={filters.type || 'all'} onChange={e => updateUrlFilter('type', e.target.value)}>
                    <option value="all">{t_admin.filter.all} Types</option>
                    {Object.entries(t_admin.requestTypes).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                </Select>
                 <Select value={filters.status || 'all'} onChange={e => updateUrlFilter('status', e.target.value)}>
                    <option value="all">{t_admin.filter.all} Statuses</option>
                    {Object.entries(t_admin.adminRequests.requestStatus).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                </Select>
                 {isSuperAdmin && viewMode === 'all' && (
                    <Select value={filters.assignedTo || 'all'} onChange={e => updateUrlFilter('assignedTo', e.target.value)}>
                        <option value="all">{t_admin.filter.all} Assignees</option>
                        {(managers || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                 )}
            </div>
            
            {isLoading ? loadingSkeletons : (
                <ResponsiveList
                    items={paginatedItems}
                    renderCard={renderCard}
                    renderTable={renderTable}
                    emptyState={emptyState}
                />
            )}
        </div>
    );
};

export default AdminAllRequestsPage;
