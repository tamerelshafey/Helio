

import React from 'react';
import { useForm } from 'react-hook-form';
import type { Lead, Property, AdminPartner } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads } from '../../services/leads';
import { getAllProperties } from '../../services/properties';
import { getAllPartnersForAdmin } from '../../services/partners';
import { exportToCsv, exportToPdf } from '../../utils/exportUtils';
import { inputClasses, selectClasses } from '../ui/FormField';
import { useLanguage } from '../shared/LanguageContext';
import { Checkbox } from '../ui/Checkbox';

const AdminReportsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_reports = t.adminReports;
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
        defaultValues: {
            dataSource: '',
            columns: [],
            startDate: '',
            endDate: ''
        }
    });

    const dataSource = watch('dataSource');

    const { data: leads, isLoading: loadingLeads } = useQuery({ queryKey: ['allLeads'], queryFn: getAllLeads, enabled: dataSource === 'leads' });
    const { data: properties, isLoading: loadingProps } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties, enabled: dataSource === 'properties' });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartners'], queryFn: getAllPartnersForAdmin, enabled: dataSource === 'partners' });

    const dataMap = {
        leads,
        properties,
        partners
    };

    const columnOptions: Record<string, Record<string, string>> = {
        leads: { customerName: 'Customer Name', customerPhone: 'Phone', serviceTitle: 'Service', status: 'Status', createdAt: 'Date' },
        properties: { [`title.${language}`]: 'Title', [`type.${language}`]: 'Type', [`status.${language}`]: 'Status', priceNumeric: 'Price', area: 'Area (m²)' },
        partners: { name: 'Name', type: 'Type', email: 'Email', status: 'Status', subscriptionPlan: 'Plan' }
    };

    const onSubmit = (data: { dataSource: string, columns: string[], startDate: string, endDate: string }, exportType: 'csv' | 'pdf') => {
        if (data.columns.length === 0) {
            alert(t_reports.noColumnsSelected);
            return;
        }

        const sourceData = (dataMap as any)[data.dataSource] || [];
        let filteredData = [...sourceData];

        if (data.startDate) {
            filteredData = filteredData.filter(item => new Date(item.createdAt || item.listingStartDate || 0) >= new Date(data.startDate));
        }
        if (data.endDate) {
            filteredData = filteredData.filter(item => new Date(item.createdAt || item.listingStartDate || 0) <= new Date(data.endDate));
        }

        const columnsToExport = data.columns.reduce((acc, key) => {
            acc[key] = (columnOptions[data.dataSource] as any)[key];
            return acc;
        }, {} as Record<string, string>);

        const filename = `${data.dataSource}_report_${new Date().toISOString().split('T')[0]}`;

        if (exportType === 'csv') {
            exportToCsv(filename, columnsToExport, filteredData);
        } else {
            exportToPdf(filename, columnsToExport, filteredData, language);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_reports.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_reports.subtitle}</p>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700 space-y-8">
                {/* Step 1 */}
                <div>
                    <h2 className="text-xl font-bold text-amber-500 mb-3">{t_reports.step1}</h2>
                    <select {...register('dataSource', { required: true })} className={selectClasses}>
                        <option value="" disabled>{t_reports.selectDataSource}</option>
                        <option value="leads">{t_reports.dataSources.leads}</option>
                        <option value="properties">{t_reports.dataSources.properties}</option>
                        <option value="partners">{t_reports.dataSources.partners}</option>
                    </select>
                </div>
                
                {dataSource && (
                    <>
                        {/* Step 2 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h2 className="text-xl font-bold text-amber-500 mb-3">{t_reports.step2}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                {Object.entries(columnOptions[dataSource]).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                                        <Checkbox {...register('columns')} value={key} id={`col-${key}`} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                             <h2 className="text-xl font-bold text-amber-500 mb-3">{t_reports.step3}</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t_reports.startDate}</label>
                                    <input type="date" {...register('startDate')} className={inputClasses} />
                                </div>
                                 <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t_reports.endDate}</label>
                                    <input type="date" {...register('endDate')} className={inputClasses} />
                                </div>
                             </div>
                        </div>

                        {/* Step 4 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h2 className="text-xl font-bold text-amber-500 mb-3">{t_reports.step4}</h2>
                            <div className="flex gap-4">
                                <button onClick={handleSubmit(data => onSubmit(data, 'csv'))} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    {t_reports.exportCSV}
                                </button>
                                <button onClick={handleSubmit(data => onSubmit(data, 'pdf'))} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    {t_reports.exportPDF}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminReportsPage;