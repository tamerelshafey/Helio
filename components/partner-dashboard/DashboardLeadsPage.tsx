
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, LeadStatus } from '../../types';
import { useAuth } from '../auth/AuthContext';
import ExportDropdown from '../shared/ExportDropdown';
import { getAllRequests } from '../../services/requests';
import { RequestType } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../shared/LanguageContext';
import { Select } from '../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { ResponsiveList } from '../shared/ResponsiveList';
import CardSkeleton from '../ui/CardSkeleton';
import TableSkeleton from '../ui/TableSkeleton';
import { Input } from '../ui/Input';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type SortConfig = {
    key: keyof Lead;
    direction: 'ascending' | 'descending';
} | null;

const DashboardLeadsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_dash = t.dashboard;
    const { currentUser } = useAuth();

    const { data: allRequests, isLoading: loading } = useQuery({
        queryKey: ['allRequests'],
        queryFn: getAllRequests,
        enabled: !!currentUser,
    });

    const partnerLeads = useMemo((): Lead[] => {
        if (!allRequests || !currentUser) return [];

        return allRequests
            .filter(req => 
                req.type === RequestType.LEAD && 
                (req.payload as Lead).partnerId === currentUser.id
            )
            .map(req => {
                const leadPayload = req.payload as Lead;
                return {
                    ...leadPayload,
                    id: req.id, // Use the top-level Request ID
                    customerName: req.requesterInfo.name,
                    customerPhone: req.requesterInfo.phone,
                    createdAt: req.createdAt,
                    // Ensure status exists
                    status: leadPayload.status || 'new', 
                };
            });
    }, [allRequests, currentUser]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

    const sortedAndFilteredLeads = useMemo(() => {
        if (!partnerLeads) return [];
        let filteredLeads = [...partnerLeads];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredLeads = filteredLeads.filter(lead =>
                lead.customerName.toLowerCase().includes(lowercasedFilter) ||
                lead.serviceTitle.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (statusFilter !== 'all') {
            filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
        }

        if (sortConfig !== null) {
            filteredLeads.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredLeads;
    }, [partnerLeads, searchTerm, statusFilter, sortConfig]);

    const exportData = useMemo(() => (sortedAndFilteredLeads || []).map(lead => ({
        ...lead,
        status: t_dash.leadStatus[lead.status] || lead.status,
        createdAt: new Date(lead.createdAt).toLocaleDateString(language),
    })), [sortedAndFilteredLeads, t_dash.leadStatus, language]);

    const exportColumns = {
        customerName: t_dash.leadTable.customer,
        customerPhone: t_dash.leadTable.phone,
        serviceTitle: t_dash.leadTable.service,
        status: t_dash.leadTable.status,
        createdAt: t_dash.leadTable.date,
    };

    const renderCard = (lead: Lead) => (
        <Card key={lead.id} className="p-0">
            <CardContent className="p-4 space-y-2">
                <div>
                    <p className="text-xs text-gray-500">{t_dash.leadTable.customer}</p>
                    <p className="font-bold">{lead.customerName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">{lead.customerPhone}</p>
                </div>
                 <div>
                    <p className="text-xs text-gray-500">{t_dash.leadTable.service}</p>
                    <p className="font-semibold truncate">{lead.serviceTitle}</p>
                </div>
                <div className="flex justify-between items-center">
                     <div>
                        <p className="text-xs text-gray-500">{t_dash.leadTable.date}</p>
                        <p>{new Date(lead.createdAt).toLocaleDateString(language)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                        {t_dash.leadStatus[lead.status]}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50">
                <Link to={`/dashboard/leads/${lead.id}`} className="w-full">
                    <Button variant="ghost" className="w-full">
                        View Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );

    const renderTable = (leads: Lead[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t_dash.leadTable.customer}</TableHead>
                        <TableHead>{t_dash.leadTable.service}</TableHead>
                        <TableHead>{t_dash.leadTable.date}</TableHead>
                        <TableHead>{t_dash.leadTable.status}</TableHead>
                        <TableHead>{t_dash.leadTable.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">Loading leads...</TableCell></TableRow>
                    ) : leads.map(lead => (
                        <TableRow key={lead.id}>
                            <TableCell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <div>{lead.customerName}</div>
                                <div className="font-normal text-gray-500 dark:text-gray-400" dir="ltr">{lead.customerPhone}</div>
                            </TableCell>
                            <TableCell className="max-w-xs whitespace-normal break-words" title={lead.serviceTitle}>{lead.serviceTitle}</TableCell>
                            <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                                    {t_dash.leadStatus[lead.status]}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Link to={`/dashboard/leads/${lead.id}`} className="font-medium text-amber-600 hover:underline">
                                    View Details
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
    
    const loadingSkeletons = (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <div className="hidden lg:block">
                <TableSkeleton cols={5} />
            </div>
        </>
    );

    const emptyState = <p className="text-center py-8">{t_dash.leadTable.noLeads}</p>;

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_dash.leadsTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_dash.leadsSubtitle}</p>
                </div>
                <ExportDropdown data={exportData} columns={exportColumns} filename="my-leads" />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-4">
                <Input type="text" placeholder={t_dash.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
                    <option value="all">{t_dash.filter.filterByStatus} ({t_dash.filter.all})</option>
                    {Object.entries(t_dash.leadStatus).map(([key, value]) => (<option key={key} value={key}>{value as string}</option>))}
                </Select>
            </div>
            
            {loading ? loadingSkeletons : (
                <ResponsiveList
                    items={sortedAndFilteredLeads}
                    renderCard={renderCard}
                    renderTable={renderTable}
                    emptyState={emptyState}
                />
            )}
        </div>
    );
};

export default DashboardLeadsPage;
