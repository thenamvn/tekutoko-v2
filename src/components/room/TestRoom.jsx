import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationComponent from '../NavigationBar/NavigationBar';
import { useTranslation } from 'react-i18next';

const TestRoom = () => {
  const { t } = useTranslation();
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [results, setResults] = useState(null);

  // Fetch test data from API
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`http://localhost:8000/api/v1/quiz/${testId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch test data');
        }
        
        const data = await response.json();
        setTestData(data);
      } catch (err) {
        console.error('Error fetching test data:', err);
        setError(t('test.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    if (testId) {
      fetchTestData();
    }
  }, [testId, t]);

  // Enhanced text cleaning function
  const cleanTextContent = (text) => {
    if (!text) return '';
    
    let cleaned = text
      .replace(/\\pandocbounded\{/g, '')
      .replace(/\}\.\s*\\end\{quote\}/g, '')
      .replace(/\}\s*\\end\{quote\}/g, '')
      .replace(/\\end\{quote\}/g, '')
      .replace(/\\begin\{quote\}/g, '')
      .replace(/\\end\{[^}]*\}/g, '')
      .replace(/\\begin\{[^}]*\}/g, '')
      .replace(/\\\w+\{[^}]*\}/g, '')
      .replace(/^\}\s*/g, '')
      .replace(/\}\s*$/g, '')
      .replace(/^\.\s*/g, '')
      .replace(/\s*\.\s*$/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  };

  // Enhanced image rendering - all images small by default, clickable to enlarge
  const renderImage = (src, alt, isInQuestion = false) => {
    const sizeClasses = isInQuestion 
      ? 'h-8 md:h-12 max-w-20 md:max-w-24 cursor-pointer hover:scale-110 transition-transform duration-200' 
      : 'h-6 md:h-8 max-w-16 md:max-w-20 cursor-pointer hover:scale-110 transition-transform duration-200';

    return (
      <img 
        src={src} 
        alt={alt}
        className={`inline-block mx-1 object-contain rounded shadow-sm ${sizeClasses}`}
        onClick={() => setEnlargedImage(src)}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
        title={t('test.clickToEnlarge')}
      />
    );
  };

  // Render question blocks with enhanced image handling
  const renderQuestionBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2">
        {blocks.map((block, index) => {
          if (block.type === 'text' && block.content) {
            const cleanedText = cleanTextContent(block.content);
            if (!cleanedText) return null;
            
            return (
              <span key={index} className="text-slate-800">
                {cleanedText}
              </span>
            );
          }
          
          if (block.type === 'image' && block.src) {
            return (
              <div key={index} className="inline-block">
                {renderImage(block.src, `Question image ${index}`, true)}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };

  // Render option blocks with enhanced image handling
  const renderOptionBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2">
        {blocks.map((block, index) => {
          if (block.type === 'text' && block.content) {
            const cleanedText = cleanTextContent(block.content);
            if (!cleanedText) return null;
            
            return (
              <span key={index} className="text-slate-700">
                {cleanedText}
              </span>
            );
          }
          
          if (block.type === 'image' && block.src) {
            return (
              <div key={index} className="inline-block">
                {renderImage(block.src, `Option image ${index}`, false)}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };

  const handleAnswerSelect = (optionLabel) => {
    setSelectedAnswer(optionLabel);
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionLabel
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || '');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || '');
    }
  };

  const handleSubmitTest = async () => {
    // nếu chưa trả lời hết
    if (Object.keys(answers).length !== testData.questions.length) {
      const confirmSubmit = window.confirm('Bạn chưa trả lời hết các câu hỏi. Bạn có chắc chắn muốn nộp bài?');
      if (!confirmSubmit) {
        return; // user chọn No
      }
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        quiz_uuid: testId,
        answers: testData.questions.map((question, index) => ({
          question_id: question.id,
          selected_option: answers[index] || ''
        }))
      };

      const response = await fetch(`http://localhost:8000/api/v1/quiz/check-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error submitting test:', err);
      setSubmitError(t('test.submitError'));
    } finally {
      setSubmitting(false);
    }
  };


  // Image enlargement modal
  const ImageModal = () => {
    if (!enlargedImage) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        onClick={() => setEnlargedImage(null)}
      >
        <div className="relative max-w-full max-h-full">
          <button
            onClick={() => setEnlargedImage(null)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={enlargedImage} 
            alt="Enlarged view"
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
          <div className="absolute -bottom-12 left-0 right-0 text-center">
            <p className="text-white text-sm bg-black/50 rounded px-3 py-1 inline-block">
              {t('test.tapToClose')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Results Modal
  const ResultsModal = () => {
    if (!results) return null;

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin border border-white/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white rounded-t-2xl">
            <h2 className="text-2xl font-bold text-center">{t('test.resultsTitle')}</h2>
          </div>
          
          {/* Score Summary */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-700">{results.correct_answers}</div>
                <div className="text-sm text-green-600">{t('test.correctAnswers')}</div>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-red-200 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-700">{results.incorrect_answers}</div>
                <div className="text-sm text-red-600">{t('test.incorrectAnswers')}</div>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-700">{results.total_questions}</div>
                <div className="text-sm text-blue-600">{t('test.totalQuestions')}</div>
              </div>
              <div className="bg-gradient-to-r from-violet-100 to-indigo-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-violet-700">{results.score_percentage.toFixed(1)}%</div>
                <div className="text-sm text-violet-600">{t('test.scorePercentage')}</div>
              </div>
            </div>

            {/* Detailed Results */}
            <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('test.detailedResults')}</h3>
            <div className="space-y-3">
              {results.results.map((result, index) => (
                <div key={result.question_id} className={`p-4 rounded-xl border-2 ${result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{t('test.question')} {index + 1}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {result.is_correct ? t('test.correct') : t('test.incorrect')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    <span>{t('test.yourAnswer')}: {result.user_answer}</span>
                    {!result.is_correct && <span className="ml-4">{t('test.correctAnswer')}: {result.correct_answer}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setResults(null)}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white py-3 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                {t('test.reviewAnswers')}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                {t('test.backToDashboard')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen max-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
        <div className="container mx-auto max-w-7xl h-full">
          <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 md:p-6 shadow-lg">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">{t('test.loading')}</h1>
          </header>
          <div className="flex items-center justify-center h-[calc(100vh-120px)] p-4">
            <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl border border-white/30 text-center max-w-md">
              <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 border-violet-200 border-t-violet-600 mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-slate-600 font-medium">{t('test.loadingData')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="h-screen max-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
        <div className="container mx-auto max-w-7xl h-full">
          <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 md:p-6 shadow-lg">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center">{t('test.error')}</h1>
          </header>
          <div className="flex items-center justify-center h-[calc(100vh-120px)] p-4">
            <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl border border-white/30 text-center max-w-md">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">{t('test.notFound')}</h2>
              <p className="text-red-600 font-medium text-sm md:text-base">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const totalQuestions = testData.questions.length;

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex flex-col">
      <div className="container mx-auto max-w-7xl flex flex-col h-full">
        {/* Header */}
        <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 md:p-6 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 p-2 md:p-3 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center flex-1">
              {t('test.questionTitle')} {currentQuestionIndex + 1}/{totalQuestions}
            </h1>
            <div className="w-10 md:w-12"></div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 p-4 md:p-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm md:text-base font-semibold text-slate-700">{t('test.progress')}</span>
            <span className="text-sm md:text-base font-semibold text-slate-700">
              {Object.keys(answers).length}/{totalQuestions}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 md:h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 md:h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content - 2/3 and 1/3 Layout */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 justify-between">
          {/* Left Column - Question (2/3) */}
          <div className="lg:w-2/3 p-4 md:p-6 lg:p-8 flex flex-col">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 flex flex-col flex-1">
              <div className="p-6 md:p-8 flex flex-col h-full">
                <div className="mb-6 flex-shrink-0">
                  <span className="inline-block bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 px-4 py-2 rounded-lg text-sm md:text-base font-semibold mb-4">
                    {t('test.question')} {currentQuestion.id}
                  </span>
                </div>
                
                <div className="flex-1 flex items-center justify-center overflow-y-auto min-h-0">
                  <div className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-800 leading-relaxed text-center w-full py-4">
                    {renderQuestionBlocks(currentQuestion.blocks)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Answer Options (1/3) */}
          <div className="lg:w-1/3 p-4 md:p-6 lg:p-8 flex flex-col">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 flex flex-col flex-1">
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-6 flex-shrink-0">{t('test.chooseAnswer')}</h3>
                
                <div className="flex-1 flex flex-col space-y-4 overflow-y-auto min-h-0">
                  {currentQuestion.options.map((option) => (
                    <label
                      key={option.label}
                      className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                        selectedAnswer === option.label
                          ? 'border-violet-400 bg-gradient-to-r from-violet-50 to-indigo-50 shadow-xl'
                          : 'border-slate-200 bg-white/70 hover:border-violet-200 hover:bg-white/90'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option.label}
                        checked={selectedAnswer === option.label}
                        onChange={() => handleAnswerSelect(option.label)}
                        className="w-5 h-5 text-violet-600 border-slate-300 focus:ring-violet-500 focus:ring-2 mt-1 mr-4 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-violet-600 mr-3 text-lg">{option.label}.</span>
                        <div className="text-slate-700 text-base">
                          {renderOptionBlocks(option.blocks)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white/90 backdrop-blur-xl shadow-lg border-t border-white/30 p-4 md:p-6 flex-shrink-0 rounded-lg mb-2">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex-shrink-0 ${
                currentQuestionIndex === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-xl hover:scale-[1.02]'
              }`}
            >
              Trước
            </button>

            {/* Question Navigation */}
            <div className="flex-1 text-center px-4">
              <div className="flex flex-wrap justify-center gap-2">
                {testData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setSelectedAnswer(answers[index] || '');
                    }}
                    className={`w-6 h-6 rounded-lg text-sm font-bold transition-all duration-200 ${
                      index === currentQuestionIndex
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg scale-110'
                        : answers[index]
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 hover:scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105 border border-slate-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Next/Submit Button */}
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02] flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('test.submitting') : t('test.submit')}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02] flex-shrink-0"
              >
                Sau
              </button>
            )}
          </div>
          {submitError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-center">
              {submitError}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation - Only show on mobile */}
      <div className="fixed w-full bottom-0 z-50 lg:hidden">
        <NavigationComponent />
      </div>

      {/* Image Modal */}
      <ImageModal />

      {/* Results Modal */}
      <ResultsModal />
    </div>
  );
};

export default TestRoom;