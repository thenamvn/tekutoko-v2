import React from 'react';
import styles from './Spinner.module.css'; // Import CSS Module

const Spinner = () => {
    return (
        <div className={styles.spinnerContainer}>
            <svg className={styles.spinner} viewBox="25 25 50 50">
                <circle className={styles.circle} r="20" cy="50" cx="50"></circle>
            </svg>
        </div>
    );
};

export default Spinner;