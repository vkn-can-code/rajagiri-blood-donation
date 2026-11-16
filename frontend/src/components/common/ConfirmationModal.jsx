import React from 'react';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // danger | primary
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.btn} ${styles.confirmBtn} ${type === 'primary' ? styles.primary : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
