import React, { useState, useEffect, useRef } from 'react';
import type { Language, PortfolioItem } from '../../types';
import { translations } from '../../data/translations';
import FormField, { inputClasses } from '../shared/FormField';
import { CloseIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';
// FIX: Corrected import path from 'api' to 'mockApi'.
import { addPortfolioItem, updatePortfolioItem } from '../../mockApi/portfolio';

interface PortfolioItemFormModalProps {
    itemToEdit?: PortfolioItem;
    onClose: () => void;
    onSave: () => void;
    language: Language;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const PortfolioItemFormModal: React.FC<PortfolioItemFormModalProps> = ({ itemToEdit, onClose, onSave, language }) => {
    const { currentUser } = useAuth();
    const t = translations[language].dashboard;
    const t_form = translations[language].portfolioForm;
    const t_shared = translations[language].adminShared;
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: { ar: itemToEdit?.title.ar || '', en: itemToEdit?.title.en || '' },
        category: { ar: itemToEdit?.category.ar || '', en: itemToEdit?.category.en || '' },
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(itemToEdit?.src || null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('.');
        setFormData(prev => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: value } }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser