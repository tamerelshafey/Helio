
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { FilterOption } from '../../types';
import FormField from '../ui/FormField';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { addFilterOption, updateFilterOption } from '../../services/filters';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';

interface FilterItemFormModalProps {
    dataType: 'propertyType' | 'finishingStatus' | 'amenity';
    itemToEdit?: FilterOption;
    onClose: () => void;
    onSave: () => void;
}

const FilterItemFormModal: React.FC<FilterItemFormModalProps> = ({ dataType, itemToEdit, onClose, onSave }) => {
    const { t } = useLanguage();
    const t_shared = t.adminShared;
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        en: itemToEdit?.en || '',
        ar: itemToEdit?.ar || '',
    });

    const mutation = useMutation({
        mutationFn: (data: { en: string; ar: string }) => {
            if (itemToEdit) {
                return updateFilterOption(dataType, { ...itemToEdit, en: data.en, ar: data.ar });
            } else {
                return addFilterOption(dataType, data);
            }
        },
        onSuccess: () => {
            showToast(`Filter option saved successfully!`, 'success');
            onSave();
        },
        onError: () => {
            showToast('Failed to save filter option.', 'error');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <Modal isOpen={true} onClose={onClose} aria-labelledby="filter-form-title">
            <ModalHeader onClose={onClose} id="filter-form-title">
                {itemToEdit ? t_shared.edit : t_shared.add} Filter Option
            </ModalHeader>
            <form onSubmit={handleSubmit}>
                <ModalContent className="space-y-4 pt-2">
                    <FormField label="Name (English)" id="en">
                        <Input type="text" name="en" value={formData.en} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Name (Arabic)" id="ar">
                        <Input type="text" name="ar" value={formData.ar} onChange={handleChange} required />
                    </FormField>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="secondary" onClick={onClose}>{t_shared.cancel}</Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {t_shared.save}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default FilterItemFormModal;
