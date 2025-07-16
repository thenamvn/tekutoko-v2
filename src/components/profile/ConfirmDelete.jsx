import React from 'react';
import styles from './ConfirmDelete.module.css'; // Create your own styles
import { useTranslation } from 'react-i18next';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{t("confirmDelete.title")}</h2>
        <p>{t("confirmDelete.message")}</p>
        <button onClick={onConfirm}>{t("confirmDelete.delete")}</button>
        <button onClick={onClose}>{t("confirmDelete.cancel")}</button>
      </div>
    </div>
  );
};

export default ConfirmationModal;