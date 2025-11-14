import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutingRule } from '../../../data/routingRules';
import { addRoutingRule, updateRoutingRule } from '../../../services/routingRules';
import { getAllPartnersForAdmin } from '../../../services/partners';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { TrashIcon } from '../../ui/Icons';

interface RoutingRuleFormModalProps {
    ruleToEdit?: RoutingRule;
    onClose: () => void;
    onSave: () => void;
}

const RoutingRuleFormModal: React.FC<RoutingRuleFormModalProps> = ({ ruleToEdit, onClose, onSave }) => {
    const { language, t } = useLanguage();
    const t_auto = t.adminDashboard.automation.modal;
    const t_shared = t.adminShared;
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });

    const { register, handleSubmit, control, formState: { errors } } = useForm<RoutingRule>({
        defaultValues: ruleToEdit || { name: { en: '', ar: '' }, active: true, conditions: [{ field: 'type', operator: 'equals', value: '' }], action: { assignTo: '' } }
    });
    
    const { fields, append, remove } = useFieldArray({ control, name: "conditions" });

    const mutation = useMutation({
        mutationFn: (data: RoutingRule) => {
            if (ruleToEdit) {
                return updateRoutingRule(ruleToEdit.id, data) as Promise<RoutingRule | null>;
            }
            return addRoutingRule(data);
        },
        onSuccess: () => {
            showToast(`Rule ${ruleToEdit ? 'updated' : 'created'} successfully!`, 'success');
            onSave();
        },
        onError: () => {
            showToast('Failed to save rule.', 'error');
        }
    });

    const onSubmit = (data: RoutingRule) => {
        mutation.mutate(data);
    };

    const conditionFields = ['type', 'status', 'payload.serviceType', 'payload.companyType', 'payload.cooperationType', 'payload.area', 'payload.price'];
    const operators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'];
    const managers = (partners || []).filter(p => p.role.includes('_manager') || p.role === 'admin');

    return (
        <Modal isOpen={true} onClose={onClose} aria-labelledby="rule-form-title" className="max-w-3xl">
            <ModalHeader onClose={onClose} id="rule-form-title">{ruleToEdit ? t_auto.editTitle : t_auto.addTitle}</ModalHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ModalContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label>{t_auto.ruleName} (EN)</label>
                            <Input {...register('name.en', { required: true })} />
                        </div>
                        <div>
                            <label>{t_auto.ruleName} (AR)</label>
                            <Input {...register('name.ar', { required: true })} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">{t_auto.conditions}</h4>
                        <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-4 gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <Select {...register(`conditions.${index}.field`)} defaultValue="type">
                                    {conditionFields.map(f => <option key={f} value={f}>{f}</option>)}
                                </Select>
                                <Select {...register(`conditions.${index}.operator`)} defaultValue="equals">
                                    {operators.map(op => <option key={op} value={op}>{op}</option>)}
                                </Select>
                                <Input {...register(`conditions.${index}.value`, { required: true })} placeholder="Value" className="col-span-1" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <TrashIcon className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        </div>
                         <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => append({ field: 'type', operator: 'equals', value: '' })}>
                            {t_shared.add} Condition
                        </Button>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">{t_auto.action}</h4>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label>{t_auto.assignTo}</label>
                                <Select {...register('action.assignTo', { required: true })}>
                                    <option value="" disabled>Select a user...</option>
                                    {managers.map(p => (
                                        <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.name}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="secondary" onClick={onClose}>{t_shared.cancel}</Button>
                    <Button type="submit" isLoading={mutation.isPending}>{t_shared.save}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default RoutingRuleFormModal;
