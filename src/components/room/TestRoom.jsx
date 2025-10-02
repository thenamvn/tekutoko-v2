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

  // Check if image is likely a mathematical formula/diagram
  const isMathImage = (src, text) => {
    if (!src) return false;
    
    // Check if it's in a mathematical context
    const mathKeywords = ['hàm số', 'biến thiên', 'đạo hàm', 'tích phân', 'vector', 'ma trận', 'phương trình', 'bất phương trình'];
    const hasText = text && mathKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    // Check filename patterns
    const hasMathFilename = src.includes('image') && (
      src.includes('table') || 
      src.includes('chart') || 
      src.includes('graph') ||
      hasText
    );
    
    return hasText || hasMathFilename;
  };

  // Enhanced image rendering with size optimization
  const renderImage = (src, alt, isInQuestion = false, questionText = '') => {
    const isMath = isMathImage(src, questionText);
    
    // Different sizes based on context and content type
    let sizeClasses;
    if (isInQuestion) {
      // Question images - larger for math content
      sizeClasses = isMath 
        ? 'max-h-32 max-w-full cursor-pointer hover:scale-105 transition-transform' 
        : 'max-h-8 max-w-16';
    } else {
      // Option images - moderate size
      sizeClasses = isMath 
        ? 'max-h-20 max-w-full cursor-pointer hover:scale-105 transition-transform'
        : 'max-h-8 max-w-16';
    }

    return (
      <img 
        src={src} 
        alt={alt}
        className={`inline-block mx-1 object-contain rounded shadow-sm ${sizeClasses}`}
        onClick={() => isMath && setEnlargedImage(src)}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  };

  // Render question blocks with enhanced image handling
  const renderQuestionBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    
    // Get all text content for context
    const allText = blocks
      .filter(block => block.type === 'text' && block.content)
      .map(block => cleanTextContent(block.content))
      .join(' ');
    
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
                {renderImage(block.src, `Question image ${index}`, true, allText)}
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
    
    const allText = blocks
      .filter(block => block.type === 'text' && block.content)
      .map(block => cleanTextContent(block.content))
      .join(' ');
    
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
                {renderImage(block.src, `Option image ${index}`, false, allText)}
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

  const handleSubmitTest = () => {
    console.log('Test answers:', answers);
    alert(t('test.submitSuccess'));
    navigate('/dashboard');
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
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
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

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
        <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
          <h1 className="text-xl font-bold text-white text-center">{t('test.loading')}</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto mb-4"></div>
            <p className="text-sm text-slate-600 font-medium">{t('test.loadingData')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
        <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
          <h1 className="text-xl font-bold text-white text-center">{t('test.error')}</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-3">{t('test.notFound')}</h2>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const totalQuestions = testData.questions.length;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white text-center flex-1">
            {t('test.questionTitle')} {currentQuestionIndex + 1}/{totalQuestions}
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
        {/* Progress Bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700">{t('test.progress')}</span>
            <span className="text-sm font-semibold text-slate-700">
              {Object.keys(answers).length}/{totalQuestions}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30">
          <div className="mb-6">
            <span className="inline-block bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 px-3 py-1 rounded-lg text-sm font-semibold mb-4">
              {t('test.question')} {currentQuestion.id}
            </span>
            <div className="text-lg font-semibold text-slate-800 leading-relaxed">
              {renderQuestionBlocks(currentQuestion.blocks)}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <label
                key={option.label}
                className={`flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
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

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
              currentQuestionIndex === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-xl hover:scale-[1.02]'
            }`}
          >
            {t('test.previous')}
          </button>
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              {t('test.submit')}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              {t('test.next')}
            </button>
          )}
        </div>

        {/* Question Navigation Grid */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-4">{t('test.questionNavigator')}</h3>
          <div className="grid grid-cols-5 gap-3">
            {testData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setSelectedAnswer(answers[index] || '');
                }}
                className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-200 ${
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
      </div>

      {/* Footer Navigation */}
      <div className="fixed w-full max-w-md bottom-0 z-50">
        <NavigationComponent />
      </div>

      {/* Image Modal */}
      <ImageModal />
    </div>
  );
};

export default TestRoom;