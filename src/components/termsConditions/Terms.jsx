import modalStyles from './Modal.module.css'; // Import CSS Module
import { useTranslation } from 'react-i18next';
import NavigationComponent from '../NavigationBar/NavigationBar';

const TermsModal = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide pb-20">
                <div className={modalStyles.modal}>
                    <article>
                        <header className={modalStyles.modalContainerHeader}>
                            <span className={modalStyles.modalContainerTitle}>
                                <svg aria-hidden="true" height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M14 9V4H5v16h6.056c.328.417.724.785 1.18 1.085l1.39.915H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8v1h-7zm-2 2h9v5.949c0 .99-.501 1.916-1.336 2.465L16.5 21.498l-3.164-2.084A2.953 2.953 0 0 1 12 16.95V11zm2 5.949c0 .316.162.614.436.795l2.064 1.36 2.064-1.36a.954.954 0 0 0 .436-.795V13h-5v3.949z" fill="currentColor"></path>
                                </svg>
                                {t('signupForm.termsTitle')}
                            </span>
                        </header>
                        <section className={modalStyles.modalContainerBody}>
                            <div dangerouslySetInnerHTML={{ __html: t('signupForm.termsDescription') }} />
                            {/* Thêm nội dung điều khoản ở đây */}
                        </section>
                    </article>
                </div>
            </div>
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <NavigationComponent />
            </div>
        </div>
    );
}

export default TermsModal;