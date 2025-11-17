import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllRoutingRules, deleteRoutingRule, updateRoutingRule } from '../../../services/routingRules';
import { getAllPartnersForAdmin } from '../../../services/partners';
import type { RoutingRule } from '../../../data/routingRules';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Button } from '../../ui/Button';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import RoutingRuleFormModal from './RoutingRuleFormModal';
import ConfirmationModal from '../../ui/ConfirmationModal';

const RoutingRulesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_auto = t.adminDashboard.automation;
    const t_shared = t.adminShared;
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data: rules, isLoading: loadingRules } = useQuery({ queryKey: ['routingRules'], queryFn: getAllRoutingRules });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const isLoading = loadingRules || loadingPartners;
    
    const [modalState, setModalState] = useState<{ isOpen: boolean; ruleToEdit?: RoutingRule }>({ isOpen: false });
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
    
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<RoutingRule> }) => updateRoutingRule(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRoutingRule,
        onSuccess: () => {
            showToast('Rule deleted successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
            setRuleToDelete(null);
        }
    });

    const handleToggleStatus = (rule: RoutingRule) => {
        updateMutation.mutate({ id: rule.id, updates: { active: !rule.active } });
    };
    
    const handleSave = () => {
        setModalState({ isOpen: false });
        queryClient.invalidateQueries({ queryKey: ['routingRules'] });
    }

    return (
        <div>
            {modalState.isOpen && (
                <RoutingRuleFormModal
                    ruleToEdit={modalState.ruleToEdit}
                    onClose={() => setModalState({ isOpen: false })}
                    onSave={handleSave}
                />
            )}
             {ruleToDelete && (
                <ConfirmationModal
                    isOpen={!!ruleToDelete}
                    onClose={() => setRuleToDelete(null)}
                    onConfirm={() => deleteMutation.mutate(ruleToDelete)}
                    title={t_shared.delete}
                    message={t_auto.confirmDelete}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_auto.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_auto.subtitle}</p>
                </div>
                <Button onClick={() => setModalState({ isOpen: true })}>
                    {t_auto.addNewRule}
                </Button>
            </div>
            
             <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t_auto.table.ruleName}</TableHead>
                            <TableHead>{t_auto.table.status}</TableHead>
                            <TableHead>{t_auto.table.conditions}</TableHead>
                            <TableHead>{t_auto.table.action}</TableHead>
                            <TableHead>{t_auto.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             <TableRow><TableCell colSpan={5} className="text-center p-8">Loading rules...</TableCell></TableRow>
                        ) : (rules || []).map(rule => {
                            const assignedToUser = (partners || []).find(p => p.id === rule.action.assignTo);
                            const assignedToName = assignedToUser ? (language === 'ar' ? assignedToUser.nameAr : assignedToUser.name) : rule.action.assignTo;

                            return (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.name[language]}</TableCell>
                                    <TableCell>
                                        <ToggleSwitch
                                            checked={rule.active}
                                            onChange={() => handleToggleStatus(rule)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">
                                            {t_auto.conditionsCount.replace('{count}', rule.conditions.length)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{t_auto.assignToAction} {assignedToName}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="link" size="sm" onClick={() => setModalState({ isOpen: true, ruleToEdit: rule })}>{t_shared.edit}</Button>
                                        <Button variant="link" size="sm" className="text-red-500" onClick={() => setRuleToDelete(rule.id)}>{t_shared.delete}</Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default RoutingRulesPage;
