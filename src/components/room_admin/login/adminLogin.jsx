import React from 'react';
import styles from './login.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;
        console.log(username, password);
        fetch(`${apiUrl}/adminlogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log('Login success');
                    localStorage.setItem('token_admin', data.token);
                    localStorage.setItem('admin_username', username);
                    const redirectPath = localStorage.getItem("redirectPathAdmin");
                    if (redirectPath) {
                      localStorage.removeItem("redirectPathAdmin");
                      navigate(redirectPath);
                    } else {
                        navigate('/admin/dashboard');
                    }
                } else {
                    console.log('Login failed');
                }
            });
    };

    return (
        <div className={styles.bgAdminLogin}>
            <div className={styles.loginContainer}>
                <div className={styles.loginBox}>
                    <h2>{t('adminLogin.adminPanel')}</h2>
                    <form>
                        <div className={styles.inputContainer}>
                            <input type="text" name="username" required />
                            <label>{t('adminLogin.username')}</label>
                            <div className={styles.icon}><i className="fas fa-user"></i></div>
                        </div>
                        <div className={styles.inputContainer}>
                            <input type="password" name="password" required />
                            <label>{t('adminLogin.password')}</label>
                            <div className={styles.icon}><i className="fas fa-lock"></i></div>
                        </div>
                        <button type="submit" className={styles.loginBtn} onClick={handleSubmit}>{t('adminLogin.loginButton')}</button>
                    </form>
                    <a href="#" className={styles.forgotPassword}>{t('adminLogin.forgotPassword')}</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;