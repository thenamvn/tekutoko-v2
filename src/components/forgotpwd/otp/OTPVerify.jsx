import React, { useState, useEffect, useRef } from 'react';
import styles from './OTPVerify.module.css'; // Import the CSS module
import { useTranslation } from 'react-i18next';
import ChangePassword from './ChangePassword';

const OTPVerify = ({ email }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const inputsRef = useRef([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOTP, setShowOtp] = useState(true);

  useEffect(() => {
    inputsRef.current[0].focus();
  }, []);

  const handleInput = (element, index) => {
    if (/^[0-9]$/.test(element.value)) {
      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      if (index < otp.length - 1) {
        inputsRef.current[index + 1].focus();
      } else {
        inputsRef.current[index].blur();
      }
    } else {
      element.value = "";
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (otp[index] === "") {
        inputsRef.current[index - 1]?.focus();
      }
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, otp.length);
    if (/^\d+$/.test(paste)) {
      const newOtp = paste.split("");
      setOtp(newOtp);
      newOtp.forEach((value, index) => {
        inputsRef.current[index].value = value;
      });
      inputsRef.current[newOtp.length - 1].focus();
    }
  };

  const resendOTP = async () => {
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
        throw new Error(data.error || t('otpVerify.error', { error: 'Failed to send password reset link' }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    const username = email; // Replace with actual username

    try {
      const response = await fetch(`${apiUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, otp: otpCode }),
      });

      const result = await response.json();
      if (response.ok) {
        if (result.message === 'OTP verified successfully') {
          setShowChangePassword(true);
        }
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Server error');
    }
  };

  useEffect(() => {
    if (showChangePassword) {
      setShowOtp(false);
    }
  }, [showChangePassword, setShowOtp]);

  return (
    <>
      {showOTP && (
        <div className={styles.verificationContainer}>
          <div className={styles.verificationBox}>
            <header className={styles.header}>
              <h1>{t('otpVerify.title')}</h1>
              <p>{t('otpVerify.description')}</p>
            </header>
            <form id="otp-form" onSubmit={handleSubmit}>
              <div className={styles.otpInputs}>
                {otp.map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={el => inputsRef.current[index] = el}
                    onInput={e => handleInput(e.target, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    className={styles.otpInput}
                  />
                ))}
              </div>
              <div className={styles.submitButtonContainer}>
                <button type="submit" className={styles.submitButton}>
                  {t('otpVerify.verifyButton')}
                </button>
              </div>
            </form>
            <div className={styles.resend}>
              <a onClick={resendOTP}>{t('otpVerify.resend')}</a>
            </div>
            {error && <p style={{ color: 'red' }}>{t('otpVerify.error', { error })}</p>}
          </div>
        </div>
      )}
      {showChangePassword && <ChangePassword email={email} otp={otp.join('')} />}
    </>
  );
}

export default OTPVerify;