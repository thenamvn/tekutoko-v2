import { useTranslation } from 'react-i18next';
import styles from './LineLogin.module.css';
const LineLogin = () => {
  const { t } = useTranslation();
  const url = window.location.origin;
  const client_id = process.env.REACT_APP_LINE_CLIENT_ID;
  const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  };
  const handleLineLogin = async () => {
    const state = generateRandomString(16);
    localStorage.setItem('lineState', state);
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${client_id}&redirect_uri=${url}/line&state=${state}&scope=profile%20openid%20email`;
    // Mở URL đăng nhập Line trong một tab mới
    window.open(lineLoginUrl, '_self');
  };

  return (
    <button className={styles.lineLoginButton} type="button" onClick={handleLineLogin}>
      {t('loginForm.loginWithLine')}
    </button>
  );
};

export default LineLogin;