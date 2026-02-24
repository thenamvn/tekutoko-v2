import React, { useState } from 'react';
import styles from './ChangePassword.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ChangePassword = ({ email, otp }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(t('changePassword.passwordsDoNotMatch'));
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/change-password-forgot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password: newPassword, otp: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('changePassword.error', { error: 'Failed to change password' }));
      }

      setMessage(t('changePassword.updateSuccess'));
      setError(null);
      alert(t('changePassword.updateSuccess'));
      navigate('/login');
    } catch (err) {
      setError(err.message);
      setMessage(null);
    }
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.loginContainer}>
          <div className={styles.loginBox}>
            <h2>{t('changePassword.title')}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputContainer}>
                <input
                  type="password"
                  name="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <label>{t('changePassword.password')}</label>
                <div className={styles.icon}><i className="fas fa-lock"></i></div>
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="password"
                  name="re-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <label>{t('changePassword.confirmPassword')}</label>
                <div className={styles.icon}><i className="fas fa-lock"></i></div>
              </div>
              <button type="submit" className={styles.loginBtn}>{t('changePassword.updateButton')}</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;