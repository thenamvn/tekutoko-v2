import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import styles from './404.module.css';
const NotFound = ({ errorText }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const back = () => {
        navigate('/home'); // Assuming '/home' is your homepage route
    };

    return (
        <div className="bg-white flex flex-col items-center justify-center h-screen">
            {/* Red Square Decoration */}
            <div className={styles.loader}></div>
            <div className="text-center">
                <h1 className="text-9xl font-extrabold text-blue-400 mb-4">404</h1>
                <h2 className="text-xl text-gray-700 font-medium mb-8">{errorText || t('NotFoundPage.message')}</h2>
                <button
                    onClick={back}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                >
                    {t('NotFoundPage.goback')}
                </button>
            </div>
        </div>
    );
};

export default NotFound;