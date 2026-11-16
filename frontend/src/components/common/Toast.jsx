import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import styles from './Toast.module.css';

const icons = {
    success: <CheckCircle size={20} color="var(--primary)" />,
    error: <AlertCircle size={20} color="#ef4444" />,
    warning: <AlertTriangle size={20} color="#f59e0b" />,
    info: <Info size={20} color="#3b82f6" />
};

const Toast = ({ id, type, title, message, duration = 5000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Wait for animation
    };

    return (
        <div className={`${styles.toast} ${styles[type]} ${isExiting ? styles.exiting : ''}`}>
            <div className={styles.icon}>
                {icons[type]}
            </div>
            <div className={styles.content}>
                {title && <div className={styles.title}>{title}</div>}
                <div className={styles.message}>{message}</div>
            </div>
            <button onClick={handleClose} className={styles.closeBtn}>
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
