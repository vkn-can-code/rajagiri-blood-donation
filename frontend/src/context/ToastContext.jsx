import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';
import styles from '../components/common/Toast.module.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, title, message, duration) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (message, title = 'Success', duration) => addToast('success', title, message, duration),
        error: (message, title = 'Error', duration) => addToast('error', title, message, duration),
        warning: (message, title = 'Warning', duration) => addToast('warning', title, message, duration),
        info: (message, title = 'Info', duration) => addToast('info', title, message, duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(t => (
                    <Toast
                        key={t.id}
                        {...t}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
