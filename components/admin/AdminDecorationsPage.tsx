import React, { useState, useMemo } from 'react';
import type { Language, PortfolioItem, Lead, DecorationCategory, LeadStatus } from '../../types';
import { translations } from '../../data/translations';
import { useData } from '../shared/DataContext';
import AdminPortfolioItemFormModal from './AdminPortfolioItemFormModal';
import AdminDecorationCategoryFormModal from './AdminDecorationCategoryFormModal';
import { useAuth } from '../auth/AuthContext';
import { inputClasses, selectClasses } from '../shared/FormField';
import { ArrowDownIcon, ArrowUpIcon } from '../icons/Icons';

const isDecorationLead = (lead: Lead) => {
    const title = lead.serviceTitle.toLowerCase();
    const keywords = [
        'decoration', 'decor', 'sculpture', 'painting', 'antique',
        'ديكور', 'منحوتة', 'لوحة', 'تحف', 'عمل مشابه', 'تصميم خاص'
    ];
    return keywords.some(keyword => title.includes(keyword));
};

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};


// Portfolio Management Component
const PortfolioManagement: React.FC<{ language: Language }> = ({ language }) => {
    const { portfolio, partners, decorationCategories, loading, deletePortfolioItem } = useData();
    const t = translations[language].adminDashboard.decorationsManagement;

    const [modalState, setModalState] = useState<{ isOpen: boolean; itemToEdit?: PortfolioItem }>({ isOpen: false });
    
    const decorationCategoryNames = useMemo(() => decorationCategories.flatMap(c => [c.name.en, c.name.ar]), [decorationCategories]);

    const decorationItems = useMemo(() => 
        portfolio.filter(item => 
            decorationCategoryNames.includes(item.category.en) || 
            decorationCategoryNames.includes(item.category.ar)
        ).map(item => ({...item, partnerName: partners.find(p => p.id === item.partnerId)?.name || 'N/A' })),
    [portfolio, partners, decorationCategoryNames]);

    const groupedItems = useMemo(() => {
        const groups: { [key: string]: typeof decorationItems } = {};
        decorationItems.forEach(item => {
            const categoryName = item.category[language];
            if (!groups[categoryName]) {
                groups[categoryName] = [];
            }
            groups[categoryName].push(item);
        });
        return groups;
    }, [decorationItems, language]);

    const handleDelete = async (itemId: string) => {
        if (window.confirm(t.confirmDelete)) {
            await deletePortfolioItem(itemId);
        }
    };

    return (
        <div className="mt-6">
            {modalState.isOpen && (
                <AdminPortfolioItemFormModal
                    itemToEdit={modalState.itemToEdit}
                    onClose={() => setModalState({ isOpen: false })}
                    onSave={() => setModalState({ isOpen: false })}
                    language={language}
                />
            )}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setModalState({ isOpen: true })}
                    className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                    {t.addNewItem}
                </button>
            </div>
            
            {loading ? (
                <p className="text-center p-8">Loading...</p>
            ) : Object.keys(groupedItems).length > 0 ? (
                <div className="space-y-10">
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category}>
                             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">{category}</h2>
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">{t.itemImage}</th>
                                            <th className="px-6 py-3">{t.itemTitle}</th>
                                            <th className="px-6 py-3">{t.itemPartner}</th>
                                            <th className="px-6 py-3">{t.itemActions}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* FIX: Cast `items` to a typed array to resolve TypeScript's `unknown` type inference issue. */}
                                        {(items as (PortfolioItem & { partnerName: string })[]).map(item => (
                                            <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-6 py-4"><img src={item.src} alt={item.alt} className="w-16 h-16 object-cover rounded-md" /></td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.title[language]}</td>
                                                <td className="px-6 py-4">{item.partnerName}</td>
                                                <td className="px-6 py-4 space-x-2">
                                                    <button onClick={() => setModalState({ isOpen: true, itemToEdit: item })} className="font-medium text-amber-600 hover:underline">{translations[language].dashboard.propertyTable.edit}</button>
                                                    <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 hover:underline">{translations[language].dashboard.propertyTable.delete}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p>{t.noItems}</p>
                </div>
            )}
        </div>
    );
};


// Requests Management Component
const RequestsManagement: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    const { leads, partners, loading, deleteLead, updateLeadStatus, updateLeadNotes } = useData();
    const t_decor = translations[language].adminDashboard.decorationsManagement;
    const t_leads_table = translations[language].dashboard.leadTable;
    const t_lead_status = translations[language].dashboard.leadStatus;
    const t_filter = translations[language].adminDashboard.filter;
    const t_partner_table = translations[language].adminDashboard.partnerTable;

    const isAdminView = currentUser?.type === 'admin';

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [partnerFilter, setPartnerFilter] = useState('all');

    type SortableKeys = 'customerName' | 'serviceTitle' | 'createdAt' | 'updatedAt' | 'status' | 'partnerName';
    type SortConfig = { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
    
    const decorationPartners = useMemo(() => partners.filter(p => p.type === 'finishing' || p.type === 'decorations'), [partners]);

    const sortedAndFilteredLeads = useMemo(() => {
        let filteredLeads = leads.filter(isDecorationLead);

        if (!isAdminView && currentUser) {
            filteredLeads = filteredLeads.filter(lead => lead.partnerId === currentUser.id);
        }

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredLeads = filteredLeads.filter(lead =>
                lead.customerName.toLowerCase().includes(lowercasedFilter) ||
                lead.customerPhone.includes(lowercasedFilter) ||
                lead.serviceTitle.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        if (statusFilter !== 'all') filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
        if (partnerFilter !== 'all') filteredLeads = filteredLeads.filter(lead => lead.partnerId === partnerFilter);
        if (startDate) filteredLeads = filteredLeads.filter(l => new Date(l.createdAt) >= new Date(startDate));
        if (endDate) filteredLeads = filteredLeads.filter(l => new Date(l.createdAt) <= new Date(endDate));

        if (sortConfig) {
            filteredLeads.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Lead] || '';
                const bValue = b[sortConfig.key as keyof Lead] || '';
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        
        return filteredLeads;
    }, [leads, isAdminView, currentUser, searchTerm, statusFilter, startDate, endDate, partnerFilter, sortConfig]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="w-4 h-4 ml-1 inline-block text-gray-400"></span>;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />;
    };

    const handleDelete = async (leadId: string) => {
        if (window.confirm(t_leads_table.confirmDelete)) {
            await deleteLead(leadId);
        }
    };
    
    const handleStatusChange = async (leadId: string, status: LeadStatus) => {
        await updateLeadStatus(leadId, status);
    };

    const handleNotesChange = async (leadId: string, notes: string) => {
        await updateLeadNotes(leadId, notes);
    };

    return (
        <div className="mt-6">
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <input type="text" placeholder={t_filter.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputClasses} />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClasses}>
                        <option value="all">{t_filter.filterByStatus} ({t_filter.all})</option>
                        {Object.entries(t_lead_status).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                    {isAdminView && (
                        <select value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)} className={selectClasses}>
                            <option value="all">{t_decor.filterByPartner} ({t_filter.all})</option>
                            {decorationPartners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    )}
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} aria-label={t_decor.startDate} />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} aria-label={t_decor.endDate} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerName')}><div className="flex items-center">{t_leads_table.customer}{getSortIcon('customerName')}</div></th>
                            {isAdminView && <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('partnerName')}><div className="flex items-center">{t_partner_table.partner}{getSortIcon('partnerName')}</div></th>}
                            <th className="px-6 py-3">{t_leads_table.phone}</th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('serviceTitle')}><div className="flex items-center">{t_leads_table.service}{getSortIcon('serviceTitle')}</div></th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}><div className="flex items-center">{t_leads_table.date}{getSortIcon('createdAt')}</div></th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('updatedAt')}><div className="flex items-center">{t_decor.lastUpdated}{getSortIcon('updatedAt')}</div></th>
                            <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}><div className="flex items-center">{t_leads_table.status}{getSortIcon('status')}</div></th>
                            <th className="px-6 py-3">{t_decor.internalNotes}</th>
                            <th className="px-6 py-3">{t_leads_table.actions}</th>
                        </tr>
                    </thead>
                     <tbody>
                        {loading ? (
                            <tr><td colSpan={isAdminView ? 9 : 8} className="text-center p-8">Loading...</td></tr>
                        ) : sortedAndFilteredLeads.length > 0 ? (
                           sortedAndFilteredLeads.map(lead => (
                                <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {lead.customerName}
                                        {lead.customerNotes && <p className="font-normal text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-xs truncate" title={lead.customerNotes}>{lead.customerNotes}</p>}
                                    </th>
                                    {isAdminView && <td className="px-6 py-4">{lead.partnerName}</td>}
                                    <td className="px-6 py-4" dir="ltr">{lead.customerPhone}</td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={lead.serviceTitle}>{lead.serviceTitle}</td>
                                    <td className="px-6 py-4 text-xs">{new Date(lead.createdAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4 text-xs">{new Date(lead.updatedAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4">
                                        <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)} className={`text-xs font-medium px-2.5 py-1 rounded-full border-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 ${statusColors[lead.status]}`}>
                                           {Object.entries(t_lead_status).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 w-48">
                                        <textarea
                                            defaultValue={lead.internalNotes || ''}
                                            onBlur={(e) => handleNotesChange(lead.id, e.target.value)}
                                            rows={2}
                                            className="w-full text-xs p-1 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-amber-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(lead.id)} className="font-medium text-red-600 hover:underline">{t_leads_table.delete}</button>
                                    </td>
                                </tr>
                           ))
                        ) : (
                            <tr><td colSpan={isAdminView ? 9 : 8} className="text-center p-8">{t_decor.noRequests}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Categories Management Component
const CategoriesManagement: React.FC<{ language: Language }> = ({ language }) => {
    const { decorationCategories, loading, deleteDecorationCategory } = useData();
    const t = translations[language].adminDashboard.decorationsManagement;
    const [modalState, setModalState] = useState<{ isOpen: boolean; categoryToEdit?: DecorationCategory }>({ isOpen: false });

    const handleDelete = async (categoryId: string) => {
        if (window.confirm(t.confirmDelete)) {
            await deleteDecorationCategory(categoryId);
        }
    };
    
    return (
        <div className="mt-6">
            {modalState.isOpen && (
                <AdminDecorationCategoryFormModal
                    categoryToEdit={modalState.categoryToEdit}
                    onClose={() => setModalState({isOpen: false})}
                    onSave={() => setModalState({isOpen: false})}
                    language={language}
                />
            )}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setModalState({ isOpen: true })}
                    className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                    Add New Category
                </button>
            </div>
             <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan={3} className="text-center p-8">Loading...</td></tr>
                        ) : decorationCategories.map(cat => (
                            <tr key={cat.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.name[language]}</td>
                                <td className="px-6 py-4">{cat.description[language]}</td>
                                <td className="px-6 py-4 space-x-2">
                                     <button onClick={() => setModalState({ isOpen: true, categoryToEdit: cat })} className="font-medium text-amber-600 hover:underline">Edit</button>
                                     <button onClick={() => handleDelete(cat.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// Main Page Component
const AdminDecorationsPage: React.FC<{ language: Language, defaultTab?: 'portfolio' | 'requests' | 'categories' }> = ({ language, defaultTab = 'portfolio' }) => {
    const t = translations[language].adminDashboard.decorationsManagement;
    const activeTab = defaultTab;

    const pageTitle = {
        portfolio: t.portfolioTab,
        requests: t.requestsTab,
        categories: t.categoriesTab,
    }[activeTab];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{pageTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>

            <div>
                {activeTab === 'portfolio' && <PortfolioManagement language={language} />}
                {activeTab === 'requests' && <RequestsManagement language={language} />}
                {activeTab === 'categories' && <CategoriesManagement language={language} />}
            </div>
        </div>
    );
};

export default AdminDecorationsPage;