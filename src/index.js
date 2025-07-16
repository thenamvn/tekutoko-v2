import ReactDOM from 'react-dom/client';
import './output.css';
import App from './App';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactGA from 'react-ga4';
const clientIdKey = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Lấy client ID từ biến môi trường

ReactGA.initialize('G-XS2KHL5559');
ReactGA.send({
  hitType: 'pageview',
  page: window.location.pathname
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={clientIdKey}> {/* Sửa clientId */}
    <App />
  </GoogleOAuthProvider>
);