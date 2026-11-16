import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ConfirmationContext = createContext();

export const useConfirm = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmationProvider');
    }
    return context;
};

export const ConfirmationProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: () => { },
        onCancel: () => { }
    });

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title: options.title || 'Are you sure?',
                message: options.message || 'This action cannot be undone.',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                type: options.type || 'danger',
                onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <ConfirmationContext.Provider value={confirm}>
            {children}
            <ConfirmationModal {...modalState} />
        </ConfirmationContext.Provider>
    );
};
