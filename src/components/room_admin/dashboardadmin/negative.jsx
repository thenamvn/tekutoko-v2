import React from 'react';
import styles from './Navigation.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate('/admin/dashboard');
  };

  const logoutFunc = () => {
    localStorage.removeItem('token_admin');
    localStorage.removeItem('admin_username');
    navigate('/admin');
  };

  const handleRoomManager = () => {
    navigate('/admin/room-manager');
  };

  const handleReportManager = () => {
    navigate('/admin/report-manager');
  };

  const handleUserManager = () => {
    navigate('/admin/user-manager');
  };

  const handleProfile = () => {
    navigate('/admin/profile');
  };

  return (
    <nav className={styles.mainMenu}>
      <ul>
        <li>
          <a onClick={handleDashboard}>
            <i className={`fa fa-home fa-2x ${styles.navIcon}`}></i>
            <span className={styles.navText}>{t('navigation.dashboard')}</span>
          </a>
        </li>
        <li>
          <a onClick={handleRoomManager}>
            <i className={`fa fa-book fa-2x ${styles.navIcon}`}></i>
            <span className={styles.navText}>{t('navigation.gameRoomManager')}</span>
          </a>
        </li>
        <li>
          <a onClick={handleUserManager}>
            <i className={`fa fa-cogs fa-2x ${styles.navIcon}`}></i>
            <span className={styles.navText}>{t('navigation.userManagement')}</span>
          </a>
        </li>
        <li>
          <a onClick={handleReportManager}>
            <i className={`fa fa-file-alt fa-2x ${styles.navIcon}`}></i>
            <span className={styles.navText}>{t('navigation.reportManager')}</span>
          </a>
        </li>
      </ul>
      <ul className={styles.logout}>
        <li className="user-profile">
          <a onClick={handleProfile}>
            <i className={`fa fa-user fa-2x ${styles.navIcon}`}></i>
            <span className={styles.navText}>{t('navigation.userProfile')}</span>
          </a>
        </li>

        <li>
          <a onClick={logoutFunc}>
            <i className={`fa fa-power-off fa-2x ${styles.navIcon}`}></i>
            <span className={styles.navText}>{t('navigation.logout')}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;