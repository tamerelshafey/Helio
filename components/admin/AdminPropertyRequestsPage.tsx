import React, { useState, useMemo } from 'react';
import type { Language, AddPropertyRequest, RequestStatus } from '../../types';
import { translations } from '../../data/translations';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { inputClasses } from '../shared/FormField';
import { useData } from '../shared/DataContext';

const statusColors: { [key in RequestStatus]: string } = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const DetailItem: React.FC<{ label: string; value?: string | number | null | boolean }> = ({ label, value }) => (
    value !== undefined && value !== null && value !== '' ? (
        <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-md text-gray-900 dark:text-white">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</dd>
        </div>
    ) : null
);

const PropertyRequestModal: React.FC<{ request: AddPropertyRequest; onClose: () => void; language: Language }> = ({ request, onClose, language }) => {
    const t = translations[language].addPropertyPage;
    const t_admin = translations[language].adminDashboard;
    const details = request.propertyDetails;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-amber-500">{t_admin.adminRequests.propertyDetailsTitle}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold">{t.ownerInfo}</h4>
                            <DetailItem label={t.fullName} value={request.customerName} />
                            <DetailItem label={t.phone} value={request.customerPhone} />
                            <DetailItem label={t.contactTime} value={request.contactTime} />
                        </div>
                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold">{t.propertyInfo}</h4>
                            <DetailItem label={t.purpose} value={details.purpose[language]} />
                            <DetailItem label={t.propertyType} value={details.propertyType[language]} />
                            <DetailItem label={t.finishingStatus} value={details.finishingStatus[language]} />
                            <DetailItem label={t.area} value={`${details.area.toLocaleString(language)} m²`} />
                            <DetailItem label={t.price} value={`${details.price.toLocaleString(language)} EGP`} />
                        </div>
                    </div>
                     <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <DetailItem label={t.bedrooms} value={details.bedrooms} />
                           <DetailItem label={t.bathrooms} value={details.bathrooms} />
                           <DetailItem label={t.floor} value={details.floor} />
                           <DetailItem label={t.inCompound} value={details.isInCompound} />
                        </dl>
                     </div>
                     <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                         <DetailItem label={t.address} value={details.address} />
                         {details.description && <DetailItem label={t.description} value={details.description} />}
                     </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="font-semibold mb-2">{t.deliveryDate}</h4>
                        <DetailItem label={t.deliveryDate} value={details.deliveryType === 'immediate' ? t.immediate : `${t.future}: ${details.deliveryMonth}/${details.deliveryYear}`} />
                        <DetailItem label={t_admin.editPropertyModal.listingStartDate} value={details.listingStartDate} />
                        <DetailItem label={t_admin.editPropertyModal.listingEndDate} value={details.listingEndDate} />
                     </div>
                      {details.hasInstallments && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold mb-2">{t.installments}</h4>
                            <dl className="grid grid-cols-3 gap-4">
                                <DetailItem label={t.downPayment} value={details.downPayment?.toLocaleString(language)} />
                                <DetailItem label={t.monthlyInstallment} value={details.monthlyInstallment?.toLocaleString(language)} />
                                <DetailItem label={t.years} value={details.years} />
                            </dl>
                        </div>
                     )}
                     {request.images && request.images.length > 0 && (
                         <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold mb-2">{t.images}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {request.images.map((imgSrc, index) => (
                                    <a key={index} href={imgSrc} target="_blank" rel="noopener noreferrer">
                                        <img src={imgSrc} alt={`Property image ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                    </a>
                                ))}
                            </div>
                        </div>
                     )}
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 text-right">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Close</button>
                </div>
            </div>
        </div>
    )
}

type SortConfig = {
    key: 'customerName' | 'propertyInfo' | 'createdAt';
    direction: 'ascending' | 'descending';
} | null;


const AdminPropertyRequestsPage: React.FC<{ language: Language }> = ({ language }) => {
    const t_req = translations[language].adminDashboard.adminRequests;
    const { propertyRequests, loading, approvePropertyRequest, rejectPropertyRequest } = useData();

    const [selectedRequest, setSelectedRequest] = useState<AddPropertyRequest | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });


    const sortedAndFilteredRequests = useMemo(() => {
        let filteredReqs = [...propertyRequests];
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredReqs = filteredReqs.filter(req =>
                req.customerName.toLowerCase().includes(lowercasedFilter) ||
                req.customerPhone.includes(lowercasedFilter)
            );
        }

        if (sortConfig) {
            filteredReqs.sort((a, b) => {
                let aValue: string;
                let bValue: string;

                if (sortConfig.key === 'propertyInfo') {
                    aValue = `${a.propertyDetails.propertyType.en}-${a.propertyDetails.area}`;
                    bValue = `${b.propertyDetails.propertyType.en}-${b.propertyDetails.area}`;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
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
        return filteredReqs;
    }, [propertyRequests, searchTerm, sortConfig]);

     const requestSort = (key: 'customerName' | 'propertyInfo' | 'createdAt') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: 'customerName' | 'propertyInfo' | 'createdAt') => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="w-4 h-4 ml-1 inline-block"></span>;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    };

    const handleApprove = async (request: AddPropertyRequest) => {
        await approvePropertyRequest(request);
    };
    
    const handleReject = async (id: string) => {
        await rejectPropertyRequest(id);
    }

    return (
        <div>
            {selectedRequest && <PropertyRequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} language={language} />}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_req.propertyRequestsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_req.propertyRequestsSubtitle}</p>
            
             <div className="mb-4">
                <input
                    type="text"
                    placeholder={translations[language].adminDashboard.filter.searchByRequesterOrPhone}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + " max-w-xs"}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('customerName')}>
                               <div className="flex items-center">{t_req.table.requester}{getSortIcon('customerName')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('propertyInfo')}>
                                <div className="flex items-center">{t_req.table.propertyInfo}{getSortIcon('propertyInfo')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                <div className="flex items-center">{t_req.table.date}{getSortIcon('createdAt')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">{t_req.table.status}</th>
                            <th scope="col" className="px-6 py-3">{t_req.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-8">Loading requests...</td></tr>
                        ) : sortedAndFilteredRequests.length > 0 ? (
                            sortedAndFilteredRequests.map(req => (
                                <tr key={req.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{req.customerName}</div>
                                        <div className="text-xs text-gray-500">{req.customerPhone}</div>
                                    </td>
                                    <td className="px-6 py-4">{`${req.propertyDetails.propertyType[language]} - ${req.propertyDetails.area}m²`}</td>
                                    <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString(language)}</td>
                                    <td className="px-6 py-4">
                                         <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[req.status]}`}>
                                            {t_req.requestStatus[req.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => setSelectedRequest(req)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t_req.table.details}</button>
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(req)} className="font-medium text-green-600 dark:text-green-500 hover:underline">{t_req.table.approve}</button>
                                                <button onClick={() => handleReject(req.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t_req.table.reject}</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-8">{t_req.noPropertyRequests}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPropertyRequestsPage;