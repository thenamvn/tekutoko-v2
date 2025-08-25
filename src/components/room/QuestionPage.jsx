import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationComponent from '../NavigationBar/NavigationBar';
import { useTranslation } from 'react-i18next';
import useFirebaseUpload from '../../utils/upload';

const QuestionPage = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { uploading, error: uploadError, uploadFiles } = useFirebaseUpload();
  const { t } = useTranslation();
  const { roomId, questionNumber } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ isCorrect: false, message: '', correctAnswer: null });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [userSubmission, setUserSubmission] = useState(null);

  // Fetch total questions from progress API
  const fetchTotalQuestions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/room/${roomId}/user/${username}/progress`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTotalQuestions(data.total);
        }
      }
    } catch (error) {
      console.error('Error fetching total questions:', error);
      setTotalQuestions(0);
    }
  };

  const fetchQuestionData = async (roomId, questionNumber) => {
    try {
      const response = await fetch(`${apiUrl}/room/${roomId}/question/${questionNumber}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Question not found');
        }
        throw new Error('Failed to load question data');
      }

      const data = await response.json();

      return {
        id: `Q${data.number}`,
        number: data.number,
        text: data.text,
        type: data.type,
        hint: data.hint,
        options: data.type === 'multiple-choice' ? data.options.map(opt => opt.text) : null
      };
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  };

  const fetchUserSubmission = async (roomId, questionNumber, username) => {
    try {
      const response = await fetch(`${apiUrl}/room/${roomId}/user/${username}/question/${questionNumber}/submission`);

      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user submission:', error);
      return { submitted: false };
    }
  };

  useEffect(() => {
    const loadQuestionAndSubmission = async () => {
      setIsLoading(true);
      setError(null);
      setSubmitError(null);
      setShowFeedbackPopup(false);
      setUserAnswer('');
      setSelectedOption('');
      setSelectedFile(null);

      try {
        // Load total questions
        await fetchTotalQuestions();

        // Load question data
        const data = await fetchQuestionData(roomId, questionNumber);
        setQuestionData(data);

        // Load user's previous submission if any
        if (username) {
          const submission = await fetchUserSubmission(roomId, questionNumber, username);

          if (submission.submitted) {
            setUserSubmission(submission);
            
            // Pre-fill the user's previous answer only if they got it wrong
            if (!submission.isCorrect) {
              if (submission.type === 'text') {
                setUserAnswer(submission.answer);
              } else if (submission.type === 'multiple-choice') {
                setSelectedOption(submission.answer);
              }
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load question');
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionAndSubmission();
  }, [roomId, questionNumber, username]);

  const handleInputChange = (event) => setUserAnswer(event.target.value);
  const handleOptionClick = (option) => setSelectedOption(option);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files && event.target.files[0] ? event.target.files[0] : null);
  };

  const submitAnswer = async (roomId, questionId, answerData) => {
    try {
      const token = localStorage.getItem('token');

      // Handle file upload
      if (answerData.type === 'upload' && answerData.file) {
        try {
          const fileUrls = await uploadFiles([answerData.file], roomId, username);

          if (fileUrls && fileUrls.length > 0) {
            const response = await fetch(`${apiUrl}/api/room/${roomId}/submit-file-answer`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : undefined
              },
              body: JSON.stringify({
                questionId,
                fileUrl: fileUrls[0]
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to submit file answer');
            }

            return await response.json();
          } else {
            throw new Error('File upload failed');
          }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      }
      // Handle text and multiple-choice answers
      else {
        const response = await fetch(`${apiUrl}/api/room/${roomId}/submit-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : undefined
          },
          body: JSON.stringify({
            questionId,
            answer: answerData.answer,
            userId: username,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Answer submission failed');
        }

        return await response.json();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setShowFeedbackPopup(false);

    if (!questionData) {
      setSubmitError("Cannot submit: Question data not loaded");
      setIsSubmitting(false);
      return;
    }

    // Prevent submission if already answered correctly
    if (userSubmission?.submitted && userSubmission?.isCorrect) {
      setSubmitError(t('questionPage.alreadyAnsweredMessage'));
      setIsSubmitting(false);
      return;
    }

    try {
      let result;

      switch (questionData.type) {
        case 'text':
          if (!userAnswer.trim()) {
            setSubmitError("Please enter an answer.");
            setIsSubmitting(false);
            return;
          }
          result = await submitAnswer(roomId, questionData.id, { answer: userAnswer });
          break;

        case 'multiple-choice':
          if (!selectedOption) {
            setSubmitError("Please select an option.");
            setIsSubmitting(false);
            return;
          }
          result = await submitAnswer(roomId, questionData.id, { answer: selectedOption });
          break;

        case 'upload':
          if (!selectedFile) {
            setSubmitError("Please choose a file to upload.");
            setIsSubmitting(false);
            return;
          }

          if (selectedFile.size > 10 * 1024 * 1024) {
            setSubmitError("File is too large. Maximum size is 10MB.");
            setIsSubmitting(false);
            return;
          }

          try {
            const fileUrls = await uploadFiles([selectedFile], roomId, localStorage.getItem('username') || 'anonymous');

            if (fileUrls && fileUrls.length > 0) {
              result = await fetch(`${apiUrl}/api/room/${roomId}/submit-file-answer`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  questionId: questionData.id,
                  fileUrl: fileUrls[0],
                  username: localStorage.getItem('username')
                })
              }).then(res => {
                if (!res.ok) throw new Error("Failed to submit answer");
                return res.json();
              });
            } else {
              throw new Error("Failed to upload file");
            }
          } catch (uploadErr) {
            setSubmitError(uploadErr.message || "File upload failed");
            setIsSubmitting(false);
            return;
          }
          break;

        default:
          setSubmitError("Cannot submit: Unknown question type.");
          setIsSubmitting(false);
          return;
      }

      // Handle result
      if (result.success) {
        setFeedbackData({
          isCorrect: result.isCorrect,
          message: result.message || (result.isCorrect ? "Correct!" : "Incorrect."),
          explanation: result.explanation || null,
          correctAnswer: result.correctAnswer || null
        });

        setShowFeedbackPopup(true);
        
        // Update submission state
        const newSubmission = {
          submitted: true,
          answer: questionData.type === 'text' ? userAnswer : selectedOption,
          isCorrect: result.isCorrect,
          submittedAt: new Date().toISOString(),
          type: questionData.type
        };
        setUserSubmission(newSubmission);
        
      } else {
        throw new Error(result.error || "Submission failed with an unknown error");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setSubmitError(err.message || "Failed to submit your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateAfterFeedback = () => {
    navigate(`/quiz/room/${roomId}/question/${parseInt(questionNumber) + 1}`);
    if (questionNumber < totalQuestions) {
      navigate(`/quiz/room/${roomId}/question/${parseInt(questionNumber) + 1}`);
    } else {
      navigate(`/quiz/room/${roomId}`);
    }
  };

  // Reset to try again
  const handleTryAgain = () => {
    setShowFeedbackPopup(false);
    setSubmitError(null);
    // Don't reset userAnswer and selectedOption so user can edit them
  };

  const renderQuestionInput = () => {
    if (!questionData) return null;
    
    // Disable input if submitting, showing feedback, or already answered correctly
    const isDisabled = isSubmitting || showFeedbackPopup || (userSubmission?.submitted && userSubmission?.isCorrect);

    switch (questionData.type) {
      case 'text':
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={handleInputChange}
            placeholder={t('questionPage.inputPlaceholder')}
            className={`w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          />
        );

      case 'multiple-choice':
        return (
          <div className="flex flex-col space-y-3">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`w-full px-4 py-3 text-left rounded-xl border transition-all duration-200 ${
                  selectedOption === option
                    ? 'bg-gradient-to-r from-violet-100 to-indigo-100 border-violet-300 ring-2 ring-violet-400/30 text-violet-800'
                    : 'bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 text-slate-700'
                } ${isDisabled
                  ? 'opacity-70 cursor-not-allowed !bg-slate-200 hover:!bg-slate-200'
                  : 'hover:scale-[1.02] shadow-lg'
                }`}
                disabled={isDisabled}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'upload':
        return (
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <label
                htmlFor="file-upload"
                className={`px-4 py-2 rounded-xl bg-gradient-to-r from-violet-100 to-indigo-100 hover:from-violet-200 hover:to-indigo-200 text-violet-700 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-lg font-semibold ${isDisabled ? 'opacity-70 cursor-not-allowed !bg-slate-200' : ''}`}
              >
                Choose File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                disabled={isDisabled}
              />
              <span className="text-slate-600 text-sm truncate flex-1">
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
            </div>
            {selectedFile && (
              <p className="text-xs text-slate-500 mt-2">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
        );

      default:
        return <p className="text-red-500">Error: Unknown question type.</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
        <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
          <h1 className="text-xl font-bold text-white text-center">Loading Question...</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-600 font-medium">Loading question...</p>
          </div>
        </div>
        <div className="fixed w-full max-w-md bottom-0 z-50">
          <div className="">
            <NavigationComponent />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
        <header className="bg-gradient-to-r from-red-500 to-red-600 p-4 shadow-lg">
          <h1 className="text-xl font-bold text-white text-center">Error</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
        <div className="fixed w-full max-w-md bottom-0 z-50">
          <div className="">
            <NavigationComponent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg relative">
        <button
          onClick={() => navigate(`/quiz/room/${roomId}`)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white text-center">
          {t('questionPage.title')} {questionNumber}/{totalQuestions || '?'}
        </h1>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-20 space-y-5">
        {/* Previous Submission Alert */}
        {userSubmission?.submitted && (
          <div className={`border p-4 rounded-xl ${
            userSubmission.isCorrect 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                userSubmission.isCorrect ? 'text-green-600' : 'text-amber-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-sm ${
                userSubmission.isCorrect ? 'text-green-800' : 'text-amber-800'
              }`}>
                {userSubmission.isCorrect 
                  ? t('questionPage.alreadyAnsweredMessage')
                  : t('questionPage.previousSubmissionIncorrect')
                }
                <span className={`font-semibold ml-1 ${
                  userSubmission.isCorrect ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {userSubmission.isCorrect ? t('questionPage.correctAnswer') : t('questionPage.incorrectAnswer')}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 leading-relaxed whitespace-pre-line">
            {questionData?.text}
          </h2>

          {questionData?.hint && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200 mb-4">
              <p className="text-sm text-blue-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <strong>{t('questionPage.hint')}:</strong> {questionData.hint}
              </p>
            </div>
          )}
        </div>

        {/* Answer Input Section */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-md font-semibold text-slate-700 mb-4">{t('questionPage.yourAnswer')}</h3>
          {renderQuestionInput()}

          {submitError && (
            <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-xl">
              <p className="text-red-700 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {submitError}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] ${
              (isSubmitting || showFeedbackPopup || (userSubmission?.submitted && userSubmission?.isCorrect))
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
            }`}
            disabled={isSubmitting || showFeedbackPopup || (userSubmission?.submitted && userSubmission?.isCorrect)}
          >
            {userSubmission?.submitted && userSubmission?.isCorrect
              ? t('questionPage.alreadyAnsweredMessage')
              : isSubmitting 
                ? t('questionPage.submitting') 
                : (userSubmission?.submitted && !userSubmission?.isCorrect ? 'Try Again' : t('questionPage.submitAnswer'))
            }
          </button>
        </div>
      </form>

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 max-w-sm w-full mx-4 text-center relative max-h-[80vh] overflow-y-auto shadow-xl border border-white/20">
            <button
              onClick={() => setShowFeedbackPopup(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>

            <div className={`text-6xl mb-4 ${feedbackData?.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
              {feedbackData?.isCorrect ? '✓' : '✗'}
            </div>

            <h3 className={`text-xl font-bold mb-3 ${feedbackData?.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
              {feedbackData?.isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>

            <p className="text-slate-600 mb-4 leading-relaxed">{feedbackData?.message}</p>

            {feedbackData?.explanation && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 text-left border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="mr-2">💡</span> {t("questionPage.explanation")}:
                </h4>
                <p className="text-blue-700 text-sm leading-relaxed">{feedbackData.explanation}</p>
              </div>
            )}

            {!feedbackData?.isCorrect && feedbackData?.correctAnswer && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl mb-4 text-left border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">{t("questionPage.correctAnswer")}:</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{feedbackData.correctAnswer}</p>
              </div>
            )}

            <div className="flex space-x-3">
              {!feedbackData?.isCorrect && (
                <button
                  onClick={handleTryAgain}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  Try Again
                </button>
              )}
              
              <button
                onClick={handleNavigateAfterFeedback}
                className={`${!feedbackData?.isCorrect ? 'flex-1' : 'w-full'} bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]`}
              >
                {t("questionPage.continue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="fixed w-full max-w-md bottom-0 z-50">
        <div className="">
          <NavigationComponent />
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;