import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AIQuestionGenerator = ({ onQuestionsGenerated, onClose }) => {
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;

    const [formData, setFormData] = useState({
        topic: '',
        numQuestions: 5,
        difficulty: 'medium',
        questionTypes: ['text', 'multiple-choice']
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    
    // ✅ Thêm state cho preview
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState(new Set());
    const [showPreview, setShowPreview] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // ✅ Cập nhật giới hạn từ 10 lên 25
        if (name === 'numQuestions') {
            const num = parseInt(value);
            if (value === '' || (num >= 1 && num <= 25)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value === '' ? '' : num
                }));
            }
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuestionTypeChange = (type) => {
        setFormData(prev => {
            const currentTypes = prev.questionTypes;
            if (currentTypes.includes(type)) {
                if (currentTypes.length > 1) {
                    return {
                        ...prev,
                        questionTypes: currentTypes.filter(t => t !== type)
                    };
                }
            } else {
                return {
                    ...prev,
                    questionTypes: [...currentTypes, type]
                };
            }
            return prev;
        });
    };

    // ✅ Hàm tính toán thời gian dự kiến
    const getEstimatedTime = (numQuestions) => {
        const timeSeconds = Math.max(30, numQuestions * 1.5);
        if (timeSeconds < 60) {
            return `${timeSeconds}s`;
        } else {
            const minutes = Math.floor(timeSeconds / 60);
            const seconds = timeSeconds % 60;
            return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
        }
    };

    // ✅ Validate form
    const isFormValid = () => {
        return formData.topic.trim() && 
               formData.numQuestions && 
               formData.numQuestions >= 1 && 
               formData.numQuestions <= 25 &&
               formData.questionTypes.length > 0;
    };

    // ✅ Cập nhật function generateQuestions với timeout động
    const generateQuestions = async () => {
        if (!isFormValid()) {
            setError(t('aiGenerator.validation.fillAllFields'));
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // ✅ Timeout động dựa trên số câu hỏi
            const timeoutMs = Math.max(35000, Math.round(formData.numQuestions * 1500) + 5000); // Thêm 5s buffer
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(`${apiUrl}/api/ai/generate-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 408) {
                    throw new Error(t('aiGenerator.errors.timeout', { time: getEstimatedTime(formData.numQuestions) }));
                }
                throw new Error(errorData.error || `HTTP ${response.status}: Server error`);
            }

            const data = await response.json();

            if (data.success && data.questions && data.questions.length > 0) {
                // ✅ Hiển thị preview thay vì add luôn
                setGeneratedQuestions(data.questions);
                setSelectedQuestions(new Set(data.questions.map((_, index) => index))); // Select all by default
                setShowPreview(true);
            } else {
                setError(t('aiGenerator.errors.cannotGenerate'));
            }

        } catch (error) {
            console.error('Error generating questions:', error);
            
            if (error.name === 'AbortError') {
                setError(t('aiGenerator.errors.timeout', { time: getEstimatedTime(formData.numQuestions) }));
            } else if (error.message.includes('Failed to fetch')) {
                setError(t('aiGenerator.errors.connectionError'));
            } else if (error.message.includes('timeout') || error.message.includes('thời gian')) {
                setError(t('aiGenerator.errors.aiOverloaded', { count: formData.numQuestions }));
            } else {
                setError(error.message || t('aiGenerator.errors.generalError'));
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // ✅ Toggle selection cho từng câu hỏi
    const toggleQuestionSelection = (index) => {
        setSelectedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // ✅ Select all / Deselect all
    const handleSelectAll = () => {
        if (selectedQuestions.size === generatedQuestions.length) {
            setSelectedQuestions(new Set());
        } else {
            setSelectedQuestions(new Set(generatedQuestions.map((_, index) => index)));
        }
    };

    // ✅ Confirm và add selected questions
    const handleConfirmSelection = () => {
        const questionsToAdd = generatedQuestions.filter((_, index) => selectedQuestions.has(index));
        if (questionsToAdd.length > 0) {
            onQuestionsGenerated(questionsToAdd);
            onClose();
        } else {
            setError(t('aiGenerator.validation.selectAtLeastOne'));
        }
    };

    // ✅ Back to form từ preview
    const handleBackToForm = () => {
        setShowPreview(false);
        setGeneratedQuestions([]);
        setSelectedQuestions(new Set());
        setError(null);
    };

    // ✅ Render question preview item
    const renderQuestionPreview = (question, index) => {
        const isSelected = selectedQuestions.has(index);
        
        return (
            <div 
                key={index} 
                className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => toggleQuestionSelection(index)}
            >
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleQuestionSelection(index)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                Q{index + 1}
                            </span>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {question.question_type}
                            </span>
                        </div>
                        
                        <h4 className="text-sm font-medium text-slate-800 mb-2">
                            {question.question_text}
                        </h4>
                        
                        {question.hint && (
                            <p className="text-xs text-slate-600 mb-2">
                                💡 <strong>{t('aiGenerator.preview.hint')}</strong> {question.hint}
                            </p>
                        )}
                        
                        {/* Hiển thị đáp án theo loại */}
                        {question.question_type === 'text' && question.correct_text_answer && (
                            <div className="text-xs">
                                <span className="font-medium text-green-700">{t('aiGenerator.preview.correctAnswer')} </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {question.correct_text_answer.split('|').map((answer, ansIndex) => (
                                        <span key={ansIndex} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                            {answer.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {question.question_type === 'multiple-choice' && question.options && (
                            <div className="text-xs space-y-1">
                                <span className="font-medium text-slate-700">{t('aiGenerator.preview.options')}</span>
                                {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className={`flex items-center space-x-2 ${option.is_correct ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                                        <span className={`w-2 h-2 rounded-full ${option.is_correct ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                        <span>{option.option_text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {question.question_type === 'upload' && (
                            <p className="text-xs text-slate-600">
                                📁 {t('aiGenerator.preview.uploadQuestion')}
                            </p>
                        )}
                        
                        {question.explanation && (
                            <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-600">
                                    <strong>{t('aiGenerator.preview.explanation')}</strong> {question.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ✅ Render Preview Mode
    if (showPreview) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-t-2xl flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <span className="mr-2">✨</span>
                                {t('aiGenerator.preview.title', { count: generatedQuestions.length })}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Selection Controls */}
                    <div className="p-4 border-b border-slate-200 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                >
                                    {selectedQuestions.size === generatedQuestions.length ? 
                                        t('aiGenerator.preview.deselectAll') : 
                                        t('aiGenerator.preview.selectAll')
                                    }
                                </button>
                                <span className="text-sm text-slate-600">
                                    {t('aiGenerator.preview.selected', { 
                                        selected: selectedQuestions.size, 
                                        total: generatedQuestions.length 
                                    })}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {t('aiGenerator.preview.topic', { topic: formData.topic })}
                            </span>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            {generatedQuestions.map((question, index) => renderQuestionPreview(question, index))}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-slate-200 p-4 bg-slate-50/50 rounded-b-2xl flex-shrink-0">
                        <div className="flex space-x-3">
                            <button
                                onClick={handleBackToForm}
                                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200"
                            >
                                {t('aiGenerator.preview.recreate')}
                            </button>
                            <button
                                onClick={handleConfirmSelection}
                                disabled={selectedQuestions.size === 0}
                                className={`flex-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                    selectedQuestions.size === 0
                                        ? 'bg-slate-400 cursor-not-allowed text-white'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-[1.02]'
                                }`}
                            >
                                {t('aiGenerator.preview.addSelected', { count: selectedQuestions.size })}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Render Form Mode 
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <span className="mr-2">🤖</span>
                            {t('aiGenerator.title')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('aiGenerator.topic')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleInputChange}
                            placeholder={t('aiGenerator.topicPlaceholder')}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm placeholder-slate-400"
                        />
                    </div>

                    {/* ✅ Number of Questions - Text Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('aiGenerator.numQuestions')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="numQuestions"
                                value={formData.numQuestions}
                                onChange={handleInputChange}
                                min="1"
                                max="25"
                                placeholder={t('aiGenerator.numQuestionsPlaceholder')}
                                className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm placeholder-slate-400 ${
                                    formData.numQuestions && (formData.numQuestions < 1 || formData.numQuestions > 25)
                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30'
                                        : 'border-slate-200'
                                }`}
                            />
                            {formData.numQuestions && formData.numQuestions >= 1 && formData.numQuestions <= 25 && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                        {t('aiGenerator.tips.estimatedTime', { time: getEstimatedTime(formData.numQuestions) })}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-slate-500">
                                {t('aiGenerator.tips.fasterGeneration', { time: getEstimatedTime(25) })}
                            </p>
                            {formData.numQuestions && (formData.numQuestions < 1 || formData.numQuestions > 25) && (
                                <p className="text-xs text-red-500 font-medium">
                                    {t('aiGenerator.validation.questionsRange')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('aiGenerator.difficulty')}
                        </label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm"
                        >
                            <option value="easy">{t('aiGenerator.easy')}</option>
                            <option value="medium">{t('aiGenerator.medium')}</option>
                            <option value="hard">{t('aiGenerator.hard')}</option>
                        </select>
                    </div>

                    {/* Question Types */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('aiGenerator.questionTypes')} <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors duration-200">
                                <input
                                    type="checkbox"
                                    checked={formData.questionTypes.includes('text')}
                                    onChange={() => handleQuestionTypeChange('text')}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-sm font-medium text-slate-700">
                                        {t('aiGenerator.textType')}
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        {t('aiGenerator.textTypeDesc')}
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors duration-200">
                                <input
                                    type="checkbox"
                                    checked={formData.questionTypes.includes('multiple-choice')}
                                    onChange={() => handleQuestionTypeChange('multiple-choice')}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-sm font-medium text-slate-700">
                                        {t('aiGenerator.multipleChoiceType')}
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        {t('aiGenerator.multipleChoiceTypeDesc')}
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors duration-200">
                                <input
                                    type="checkbox"
                                    checked={formData.questionTypes.includes('upload')}
                                    onChange={() => handleQuestionTypeChange('upload')}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-sm font-medium text-slate-700">
                                        {t('aiGenerator.uploadType')}
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        {t('aiGenerator.uploadTypeDesc')}
                                    </p>
                                </div>
                            </label>
                        </div>
                        {formData.questionTypes.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">
                                {t('aiGenerator.validation.selectQuestionType')}
                            </p>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50/50 rounded-b-2xl">
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200"
                        >
                            {t('common.cancel', 'Hủy')}
                        </button>
                        <button
                            onClick={generateQuestions}
                            disabled={isGenerating || !isFormValid()}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                isGenerating || !isFormValid()
                                    ? 'bg-slate-400 cursor-not-allowed text-white'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-[1.02]'
                            }`}
                        >
                            {isGenerating ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('aiGenerator.generating', { 
                                        count: formData.numQuestions || '?', 
                                        time: getEstimatedTime(formData.numQuestions || 5) 
                                    })}
                                </span>
                            ) : (
                                t('aiGenerator.generate')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIQuestionGenerator;