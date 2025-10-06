import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationComponent from '../NavigationBar/NavigationBar';
import { t } from 'i18next';
const CreateTestOnline = () => {
    const navigate = useNavigate();
    const apiUrl = 'http://localhost:8000';
    const [testTitle, setTestTitle] = useState('');
    const [timeLimit, setTimeLimit] = useState(60); // Default 60 minutes
    const [docxFile, setDocxFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setDocxFile(file);
            setError(null);
        } else {
            setError(t('createTest.invalidFileError'));
            setDocxFile(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!testTitle.trim() || !docxFile) {
            setError(t('createTest.validationError'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', docxFile);
            const response = await fetch(`${apiUrl}/api/v1/process-docx`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                navigate(`/test/${data.uuid}`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || t('createTest.processingError'));
            }
        } catch (err) {
            console.error('Error uploading DOCX:', err);
            setError(t('createTest.connectionError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-600 font-medium">{t('createTest.loading')}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
                <h1 className="text-xl font-bold text-white text-center">{t('createTest.title')}</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Test Title */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                        <label htmlFor="testTitle" className="block text-sm font-medium text-slate-700 mb-1">
                            {t('createTest.testTitleLabel')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="testTitle"
                            value={testTitle}
                            onChange={(e) => setTestTitle(e.target.value)}
                            placeholder={t('createTest.testTitlePlaceholder')}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg"
                            required
                        />
                    </div>

                    {/* Time Limit */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                        <label htmlFor="timeLimit" className="block text-sm font-medium text-slate-700 mb-1">
                            {t('createTest.timeLimitLabel')} (phút) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="timeLimit"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm shadow-lg"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('createTest.fileUploadLabel')} <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                            <label
                                htmlFor="docx-upload"
                                className="cursor-pointer bg-gradient-to-r from-violet-100 to-indigo-100 hover:from-violet-200 hover:to-indigo-200 text-violet-700 py-2 px-4 rounded-xl shadow-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                            >
                                {t('createTest.chooseFileButton')}
                                <input
                                    id="docx-upload"
                                    type="file"
                                    accept=".docx"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <span className="text-slate-600 text-sm truncate flex-1">
                                {docxFile ? docxFile.name : t('createTest.noFileSelected')}
                            </span>
                        </div>
                        {docxFile && (
                            <p className="text-xs text-slate-500 mt-1">
                                {t('createTest.fileSize')}: {(docxFile.size / 1024).toFixed(2)} KB
                            </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            {t('createTest.fileTypeHint')}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isLoading || !testTitle.trim() || !docxFile}
                            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                                isLoading || !testTitle.trim() || !docxFile
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                            }`}
                        >
                            {isLoading ? t('createTest.creating') : t('createTest.createButton')}
                        </button>
                    </div>
                </form>
            </main>

            {/* Bottom Navigation */}
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <NavigationComponent />
            </div>
        </div>
    );
};

export default CreateTestOnline;