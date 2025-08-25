import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const NavigationComponent = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);
  const location = useLocation();

  const shouldShowBottomNavigation = () => {
    const hideOnRoutes = ['/admin', '/admin/dashboard', '/admin/user-manager', '/admin/room-manager', '/admin/profile'];
    return !hideOnRoutes.includes(location.pathname);
  };

  useEffect(() => {
    const pathToValueMap = {
      '/home': 0,
      '/dashboard': 1,
      '/voucher': 2,
      '/me': 3,
    };
    setValue(pathToValueMap[location.pathname] || 0);
  }, [location]);

  return shouldShowBottomNavigation() ? (
    <BottomNavigation
      value={value}
      className='bg-gradient-to-br from-slate-50 to-violet-50'
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      showLabels={true}
    >
      <BottomNavigationAction label={t('navigationBottom.home')} icon={<HomeIcon />} component={Link} to="/home" />
      <BottomNavigationAction label={t('navigationBottom.game')} icon={<AddCircleOutlineIcon />} component={Link} to="/dashboard" />
      <BottomNavigationAction label={t('navigationBottom.vouchers')} icon={<CardGiftcardIcon />} component={Link} to="/voucher" />
      <BottomNavigationAction label={t('navigationBottom.myAccount')} icon={<AccountCircleIcon />} component={Link} to="/me" />

    </BottomNavigation>
  ) : null;
};

export default NavigationComponent;