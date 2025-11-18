import React from 'react';
import { Modal, ModalContent, ModalFooter, ModalHeader } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useLanguage } from '../shared/LanguageContext';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
}) => {
    const { t } = useLanguage();
    const finalConfirmText = confirmText || t.adminShared.delete;
    const finalCancelText = cancelText || t.adminShared.cancel;

    return (
        <Modal isOpen={isOpen} onClose={onClose} aria-labelledby="confirmation-title">
            <ModalHeader onClose={onClose} id="confirmation-title">
                {title}
            </ModalHeader>
            <ModalContent className="pt-2">
                <p className="text-sm text-gray-600">{message}</p>
            </ModalContent>
            <ModalFooter className="justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                    {finalCancelText}
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    {finalConfirmText}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ConfirmationModal;