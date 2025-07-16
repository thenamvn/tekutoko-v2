import React, { useState, useEffect } from 'react';
import styles from './ForgotPassword.module.css'; // Import the CSS module
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OTPVerify from './otp/OTPVerify';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [showOTP, setShowOtp] = useState(false);
  const [showForgetEmail, setForgetEmail] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('forgotPassword.error', { error: 'Failed to send password reset link' }));
      }
      setShowOtp(true);
    } catch (err) {
      setError(err.message);
      alert(err.message);
      setShowOtp(true);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (showOTP) {
      setForgetEmail(false);
    }
  }, [showOTP, setForgetEmail]);

  return (
    <>
      {showForgetEmail && (
        <div className={styles.forgotPasswordContainer}>
          <div className={styles.forgotPasswordBox}>
            <h2>{t('forgotPassword.title')}</h2>
            <p>
              {t('forgotPassword.rememberPassword')}{" "}
              <a className={styles.loginhere} onClick={handleLoginClick}>
                {t('forgotPassword.loginHere')}
              </a>
            </p>
            <form onSubmit={handleSubmit}>
              <label>{t('forgotPassword.emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('forgotPassword.emailPlaceholder')}
                required
              />
              <button type="submit">{t('forgotPassword.resetPasswordButton')}</button>
            </form>
            {error && <p style={{ color: 'red' }}>{t('forgotPassword.error', { error })}</p>}
          </div>
        </div>
      )}
      {showOTP && <OTPVerify email={email} />}
    </>
  );
}

export default ForgotPassword;