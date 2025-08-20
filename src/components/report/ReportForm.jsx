import React, { useState } from 'react';
import styles from './ReportForm.module.css'; // Giả sử bạn có một file CSS cho styles
import { Button, TextField, Select, MenuItem } from '@mui/material'; // Sử dụng Material-UI cho giao diện
import { useTranslation } from 'react-i18next';
const ReportForm = ({ handleReportForAdmin, onClose, roomId, username, reporter }) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL;
    const handleSubmit = async (e) => {
        console.log(roomId, username, reason, additionalInfo);
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ roomId, username, reason, additionalInfo, reporter })
            });
    
            const data = await response.json();
            
            // Check if the response indicates success
            if (response.ok) {
                alert(t(data.message)); // Show success alert
                if (handleReportForAdmin) {
                    handleReportForAdmin(username);
                    onClose();
                } else {    
                    onClose(); // Close the form on success
                }
            } else {
                alert(t(data.message)); // Show error alert
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert(error);
        }
    };
    return (
        <div className={styles.reportFormContainer}>
            <h2>{t("reportForm.title")}</h2>
            <form onSubmit={handleSubmit}>
                <Select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    displayEmpty
                    className={styles.select}
                >
                    <MenuItem value="" disabled>{t("reportForm.reason")}</MenuItem>
                    <MenuItem value="reportForm.inappropriate">{t("reportForm.inappropriate")}</MenuItem>
                    <MenuItem value="reportForm.harassment">{t("reportForm.harassment")}</MenuItem>
                    <MenuItem value="reportForm.spam">{t("reportForm.spam")}</MenuItem>
                    <MenuItem value="reportForm.other">{t("reportForm.other")}</MenuItem>
                </Select>
                <TextField
                    label={t("reportForm.additionalInfo")}
                    multiline
                    rows={4}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className={styles.textField}
                    inputProps={{ maxLength: 255 }}
                />
                <Button type="submit" variant="contained" color="primary">
                    {t("reportForm.submit")}
                </Button>
                <Button onClick={onClose} variant="outlined" color="secondary">
                    {t("reportForm.cancel")}
                </Button>
            </form>
        </div>
    );
};

export default ReportForm;