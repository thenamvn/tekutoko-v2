// src/components/login/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate ,useLocation} from 'react-router-dom';
import verifyToken from '../../utils/verify';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    verifyToken().then(isValid => setIsAuthenticated(isValid));
  }, []);

  if (isAuthenticated === null) {
    // You might want to render a loading spinner here
    return null;
  }

  if (!isAuthenticated) {
    localStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" />;
  }

  return <Component {...rest}/>;
};

export default PrivateRoute;