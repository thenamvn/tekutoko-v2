import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguagePrompt/LanguageSwitcher';
import ConfirmationModal from './ConfirmDelete';
import NavigationComponent from '../NavigationBar/NavigationBar';

const AccountPage = () => {
    const { t } = useTranslation();
    const [linkedProfile, setLinkedProfile] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const username = localStorage.getItem('username');
    const id = localStorage.getItem('id');
    const [isModalOpen, setModalOpen] = useState(false);
    const currentUsername = localStorage.getItem('current_username');
    const idFromLocalStorage = localStorage.getItem('id');


    useEffect(() => {
        setEmail(username);
        setLinkedProfile(`${window.location.origin}/profile/${idFromLocalStorage}`);
        setFullName(currentUsername);

    }, [username]);

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch(`${apiUrl}/user/delete/${username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                alert(t('accountPage.accountDeleted'));
                handleLogout();
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            console.error('There was an error deleting the account!', error);
            alert('There was an error deleting the account!');
        }
    };

    const handleAccountInfoSubmit = async (e) => {
        e.preventDefault();
        if (!fullName || fullName.trim() === '') {
            alert(t('accountPage.fullNameRequired', 'Full name cannot be empty or contain only spaces'));
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/user/update/fullname/${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ fullname: fullName })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.text();
            alert(result);
            localStorage.setItem('current_username', fullName);
        } catch (error) {
            console.error('There was an error updating the fullname!', error);
            alert('There was an error updating the fullname!');
        }
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.trim() === '' ) {
            alert(t('accountPage.newPasswordRequired', 'New password cannot be empty or contain only spaces'));
            return;
        }
        if (newPassword === confirmPassword) {
            try {
                const response = await fetch(`${apiUrl}/user/update/password/${email}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ password: newPassword })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.text();
                alert(result);
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('current_username');
                localStorage.removeItem('id');
                navigate('/login');
            } catch (error) {
                console.error('There was an error updating the password!', error);
                alert('There was an error updating the password!');
            }
        } else {
            alert(t('accountPage.passwordsDoNotMatch'));
        }
    };

    const handleLogout = () => {
        // Check if 'username' and 'password' exist in localStorage
        const usernameExists = localStorage.getItem('username');
        const passwordExists = localStorage.getItem('password');

        // If both 'username' and 'password' do not exist, remove all items
        if (usernameExists && passwordExists) {
            localStorage.removeItem('token');
            localStorage.removeItem('current_username');
            localStorage.removeItem('id');
        } else {
            localStorage.removeItem('username');
            localStorage.removeItem('password');
            localStorage.removeItem('token');
            localStorage.removeItem('current_username');
            localStorage.removeItem('id');
        }

        // Navigate to the home page
        navigate('/home');
    };
    const handleProfileGenerate = async (e) => {
        e.preventDefault();
        navigate(`/generator/${email}`);
    };
    const handleProfileModify = async (e) => {
        e.preventDefault();
        navigate(`/modify/${email}`);
    };

    const renderMobileLayout = () => (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            {/* Header với gradient */}
            <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
                <h1 className="text-xl font-bold text-white text-center">
                    {t('accountPage.accountInformation', 'Account Settings')}
                </h1>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
                
                {/* Account Information Section */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('accountPage.accountInformation')}
                    </h2>
                    
                    <form onSubmit={handleAccountInfoSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('accountPage.email')}
                            </label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled
                                className="w-full px-4 py-3 bg-slate-100 border-2 rounded-xl text-slate-700 cursor-not-allowed"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('accountPage.fullName')}
                            </label>
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-slate-700 shadow-lg"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        >
                            {t('accountPage.update')}
                        </button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {t('accountPage.changePassword')}
                    </h2>
                    
                    <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('accountPage.newPassword')}
                            </label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-slate-700 shadow-lg"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('accountPage.confirmPassword')}
                            </label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-slate-700 shadow-lg"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        >
                            {t('accountPage.update')}
                        </button>
                    </form>
                </div>

                {/* Profile Management Section */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {t('accountPage.accountProfile')}
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('accountPage.linkProfile')}
                            </label>
                            <a 
                                href={linkedProfile}
                                className="block text-violet-600 hover:text-violet-700 text-sm bg-gradient-to-r from-violet-50 to-indigo-50 p-3 rounded-xl border border-violet-200 hover:border-violet-300 transition-all duration-200 break-all"
                            >
                                {linkedProfile}
                            </a>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={handleProfileGenerate}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            >
                                {t('accountPage.createProfile')}
                            </button>
                            <button 
                                onClick={handleProfileModify}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            >
                                {t('accountPage.modifyProfile')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions Section */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('accountPage.termsAndConditions')}
                    </h2>
                    
                    <a 
                        href={`${window.location.origin}/terms-and-conditions`}
                        className="block text-violet-600 hover:text-violet-700 text-sm bg-gradient-to-r from-violet-50 to-indigo-50 p-3 rounded-xl border border-violet-200 hover:border-violet-300 transition-all duration-200 break-all"
                    >
                        {`${window.location.origin}/terms-and-conditions`}
                    </a>
                </div>

                {/* Language Settings Section */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {t('accountPage.changeLanguage')}
                    </h2>
                    
                    <LanguageSwitcher />
                </div>

                {/* Action Buttons Section */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 space-y-4">
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('accountPage.logout')}
                    </button>
                    
                    <button 
                        onClick={() => setModalOpen(true)} 
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t("confirmDelete.button", "Delete Account")}
                    </button>
                </div>
            </div>

            {/* Footer Navigation với glassmorphism */}
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <div className="">
                    <NavigationComponent />
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)}
                onConfirm={() => {
                    handleDeleteAccount();
                    setModalOpen(false);
                }}
            />
        </div>
    );

    return (
        <div>
            {renderMobileLayout()}
        </div>
    );
};

export default AccountPage;
