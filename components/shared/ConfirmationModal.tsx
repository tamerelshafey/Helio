import React from 'react';
import { Modal, ModalContent, ModalFooter, ModalHeader } from '../ui/Modal';
import { Button } from '../ui/Button';

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
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} aria-labelledby="confirmation-title">
            <ModalHeader onClose={onClose} id="confirmation-title">
                {title}
            </ModalHeader>
            <ModalContent className="pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </ModalContent>
            <ModalFooter className="justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                    {cancelText}
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    {confirmText}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ConfirmationModal;
