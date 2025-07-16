import React from 'react';
import styles from './ProfileForm.module.css';
import Navigation from '../dashboardadmin/negative';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfileForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleSubmit = (e) => {
        e.preventDefault();
        const admin_username = localStorage.getItem('admin_username');
        const current_password = document.getElementsByName('old-password')[0].value;
        const new_password = document.getElementsByName('new-password')[0].value;
        const re_new_password = document.getElementsByName('re-new-password')[0].value;
        if (new_password !== re_new_password) {
            alert(t('profileForm.passwordMismatch'));
            return;
        }
        // get password of current user by api
        fetch(`${apiUrl}/admin/getinfo/${admin_username}`)
            .then(async (response) => {
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `Network response was not ok: ${response.status} - ${errorText}`
                    );
                }
                return response.json();
            })
            .then((data) => {
                if (data.password === current_password) {
                    fetch(`${apiUrl}/admin/update/${admin_username}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('token_admin')
                        },
                        body: JSON.stringify({ password: new_password })
                    })
                        .then(async (response) => {
                            if (!response.ok) {
                                const errorText = await response.text();
                                throw new Error(
                                    `Network response was not ok: ${response.status} - ${errorText}`
                                );
                            }
                            return response.json();
                        })
                        .then((data) => {
                            alert(t('profileForm.passwordUpdateSuccess'));
                            localStorage.removeItem('admin_username');
                            localStorage.removeItem('token_admin');
                            navigate('/admin');
                        })
                        .catch((error) => {
                            console.error(t('profileForm.errorUpdatingPassword'), error);
                        });
                } else {
                    alert(t('profileForm.currentPasswordIncorrect'));
                }
            })
            .catch((error) => {
                console.error(t('profileForm.errorUpdatingPassword'), error);
            });
    };

    return (
        <div>
            <Navigation />
            <div className={styles.bgAdminLogin}>
                <div className={styles.container}>
                    <div className={styles.loginContainer}>
                        <div className={styles.loginBox}>
                            <h2>{t('profileForm.passwordUpdate')}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.inputContainer}>
                                    <input type="password" name="old-password" required />
                                    <label>{t('profileForm.currentPassword')}</label>
                                    <div className={styles.icon}><i className="fas fa-lock"></i></div>
                                </div>
                                <div className={styles.inputContainer}>
                                    <input type="password" name="new-password" required />
                                    <label>{t('profileForm.newPassword')}</label>
                                    <div className={styles.icon}><i className="fas fa-lock"></i></div>
                                </div>
                                <div className={styles.inputContainer}>
                                    <input type="password" name="re-new-password" required />
                                    <label>{t('profileForm.confirmPassword')}</label>
                                    <div className={styles.icon}><i className="fas fa-lock"></i></div>
                                </div>
                                <button type="submit" className={styles.loginBtn}>{t('profileForm.changePasswordButton')}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileForm;