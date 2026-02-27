import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import secureStorage from '../../utils/secureStorage';
import LeaderboardModalTest from './LeaderboardModalTest';

const TestRoom = () => {
  const apiUrl = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8000';
  const { t } = useTranslation();
  const { testId } = useParams();
  const navigate = useNavigate();

  // Add new states for leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeStartFromServer, setTimeStartFromServer] = useState(null);
  const timerIntervalRef = useRef(null);
  // Ref to always hold the latest handleAutoSubmit so interval doesn't need to re-register
  const handleAutoSubmitRef = useRef(null);
 
  // Helper functions for secure storage
  const getSuspiciousActivityFromStorage = (testId) => {
    try {
      const stored = secureStorage.getSecureItem(`suspicious_activity_${testId}`, testId);
      return stored || {
        tabSwitches: 0,
        devToolsAttempts: 0,
        copyAttempts: 0,
        screenshotAttempts: 0,
        contextMenuAttempts: 0,
        keyboardShortcuts: 0
      };
    } catch (error) {
      console.warn('Failed to load suspicious activity from secure storage:', error.message);
      // Fallback to regular localStorage for backward compatibility
      try {
        const fallback = localStorage.getItem(`suspicious_activity_${testId}`);
        return fallback ? JSON.parse(fallback) : {
          tabSwitches: 0,
          devToolsAttempts: 0,
          copyAttempts: 0,
          screenshotAttempts: 0,
          contextMenuAttempts: 0,
          keyboardShortcuts: 0
        };
      } catch {
        return {
          tabSwitches: 0,
          devToolsAttempts: 0,
          copyAttempts: 0,
          screenshotAttempts: 0,
          contextMenuAttempts: 0,
          keyboardShortcuts: 0
        };
      }
    }
  };

  const getActivityLogFromStorage = (testId) => {
    try {
      const stored = secureStorage.getSecureItem(`activity_log_${testId}`, testId);
      return stored || [];
    } catch (error) {
      console.warn('Failed to load activity log from secure storage:', error.message);
      // Fallback to regular localStorage for backward compatibility
      try {
        const fallback = localStorage.getItem(`activity_log_${testId}`);
        return fallback ? JSON.parse(fallback) : [];
      } catch {
        return [];
      }
    }
  };

  const getTestSubmittedFromStorage = (testId) => {
    try {
      const stored = secureStorage.getSecureItem(`test_submitted_${testId}`, testId);
      return stored === true;
    } catch (error) {
      console.warn('Failed to load test submitted from secure storage:', error.message);
      // Fallback to regular localStorage for backward compatibility
      try {
        const fallback = localStorage.getItem(`test_submitted_${testId}`);
        return fallback === 'true';
      } catch {
        return false;
      }
    }
  };

  const getTestTerminatedFromStorage = (testId) => {
    try {
      const stored = secureStorage.getSecureItem(`test_terminated_${testId}`, testId);
      return stored === true;
    } catch (error) {
      console.warn('Failed to load test terminated from secure storage:', error.message);
      // Fallback to regular localStorage for backward compatibility
      try {
        const fallback = localStorage.getItem(`test_terminated_${testId}`);
        return fallback === 'true';
      } catch {
        return false;
      }
    }
  };

  // Initialize states with secure storage
  const [isTestSubmitted, setIsTestSubmitted] = useState(() => 
    getTestSubmittedFromStorage(testId)
  );
  const [isTestTerminated, setIsTestTerminated] = useState(() => 
    getTestTerminatedFromStorage(testId)
  );
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
  
  // Anti-cheating states
  const [suspiciousActivity, setSuspiciousActivity] = useState(() => 
    getSuspiciousActivityFromStorage(testId)
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [blockedForCheating, setBlockedForCheating] = useState(false);
  const [showBlockedResults, setShowBlockedResults] = useState(false);
  
  const activityLogRef = useRef(getActivityLogFromStorage(testId));
  const warningTimeoutRef = useRef(null);

  // Add new state for the incomplete warning modal
  const [showIncompleteWarningModal, setShowIncompleteWarningModal] = useState(false);

  // Security violation detection
  const [securityViolationDetected, setSecurityViolationDetected] = useState(false);

  // Check if current user is the creator of the test
  const [isCreator, setIsCreator] = useState(false);

  // Check storage integrity on component mount
  useEffect(() => {
    if (testId) {
      // Check if stored data was tampered with
      const activityValid = secureStorage.validateStorageIntegrity(`suspicious_activity_${testId}`, testId);
      const logValid = secureStorage.validateStorageIntegrity(`activity_log_${testId}`, testId);
      const submittedValid = secureStorage.validateStorageIntegrity(`test_submitted_${testId}`, testId);

      // If any storage is invalid, assume tampering
      if (!activityValid && localStorage.getItem(`suspicious_activity_${testId}`) ||
          !logValid && localStorage.getItem(`activity_log_${testId}`) ||
          !submittedValid && localStorage.getItem(`test_submitted_${testId}`)) {
        console.warn('Storage integrity check failed - possible tampering detected');
        setSecurityViolationDetected(true);
      }
    }
  }, [testId]);

  // Save to secure storage when states change
  useEffect(() => {
    if (testId && !securityViolationDetected) {
      secureStorage.setSecureItem(`suspicious_activity_${testId}`, suspiciousActivity, testId);
    }
  }, [suspiciousActivity, testId, securityViolationDetected]);

  useEffect(() => {
    if (testId && !securityViolationDetected) {
      secureStorage.setSecureItem(`test_submitted_${testId}`, isTestSubmitted, testId);
    }
  }, [isTestSubmitted, testId, securityViolationDetected]);

  useEffect(() => {
    if (testId && !securityViolationDetected) {
      secureStorage.setSecureItem(`test_terminated_${testId}`, isTestTerminated, testId);
    }
  }, [isTestTerminated, testId, securityViolationDetected]);

  useEffect(() => {
    if (testId && !securityViolationDetected) {
      secureStorage.setSecureItem(`activity_log_${testId}`, activityLogRef.current, testId);
    }
  }, [testId, securityViolationDetected]);

  // Helper function to clear storage
  const clearSecureStorage = useCallback(() => {
    if (testId) {
      secureStorage.removeSecureItem(`suspicious_activity_${testId}`);
      secureStorage.removeSecureItem(`activity_log_${testId}`);
      secureStorage.removeSecureItem(`test_submitted_${testId}`);
    }
  }, [testId]);

  // Add function to fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const response = await fetch(`${apiUrl}/api/v1/quiz/${testId}/results`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
        setShowLeaderboard(true);
      } else {
        console.error('Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Auto-submit test due to cheating
  const handleAutoSubmit = useCallback(async (reason) => {
    if (isTestSubmitted) return;
    
    try {
      setIsTestSubmitted(true);
      setIsTestTerminated(true); // Mark test as terminated
      
      const payload = {
        quiz_uuid: testId,
        student_username: localStorage.getItem('username') || '',
        answers: testData?.questions.map((question, index) => ({
          question_id: question.id,
          selected_option: answers[index] || ''
        })) || [],
        cheating_detected: true,
        cheating_reason: reason,
        activity_log: activityLogRef.current,
        suspicious_activity: suspiciousActivity,
        security_violation_detected: securityViolationDetected
      };

      const response = await fetch(`${apiUrl}/api/v1/quiz/check-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        
        // Clear secure storage after auto-submit (but keep terminated flag)
        clearSecureStorage();
      }
    } catch (err) {
      console.error('Error auto-submitting test:', err);
    }
  }, [testId, testData, answers, suspiciousActivity, isTestSubmitted, securityViolationDetected, clearSecureStorage]);

  // Keep ref up-to-date so timer interval can always call the latest version
  useEffect(() => {
    handleAutoSubmitRef.current = handleAutoSubmit;
  }, [handleAutoSubmit]);

  // Log suspicious activity
  const logSuspiciousActivity = useCallback((type, details = '') => {
    if (isTestSubmitted || securityViolationDetected || blockedForCheating) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = { 
      type, 
      details, 
      timestamp, 
      questionIndex: currentQuestionIndex,
      sessionId: secureStorage.getSessionId()
    };
    
    activityLogRef.current.push(logEntry);
    
    // Save to secure storage immediately
    if (testId) {
      secureStorage.setSecureItem(`activity_log_${testId}`, activityLogRef.current, testId);
    }
    
    setSuspiciousActivity(prev => {
      const newActivity = {
        ...prev,
        [type]: prev[type] + 1
      };
      
      // Save to secure storage immediately
      if (testId) {
        secureStorage.setSecureItem(`suspicious_activity_${testId}`, newActivity, testId);
      }
      
      return newActivity;
    });

    // Show warning based on activity type
    let message = '';
    switch (type) {
      case 'tabSwitches':
        message = t('antiCheat.tabSwitchWarning');
        break;
      case 'devToolsAttempts':
        message = t('antiCheat.devToolsWarning');
        break;
      case 'copyAttempts':
        message = t('antiCheat.copyWarning');
        break;
      case 'screenshotAttempts':
        message = t('antiCheat.screenshotWarning');
        break;
      case 'contextMenuAttempts':
        message = t('antiCheat.contextMenuWarning');
        break;
      case 'keyboardShortcuts':
        message = t('antiCheat.shortcutWarning');
        break;
    }

    setWarningMessage(message);
    setShowWarning(true);

    // Auto-hide warning after 3 seconds
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    // Check if user should be blocked - use current suspicious activity + 1 for the new violation
    const currentViolations = Object.values(suspiciousActivity).reduce((sum, count) => sum + count, 0);
    const totalViolations = currentViolations + 1; // +1 for the current violation
    
    if (totalViolations >= 5) {
      setBlockedForCheating(true);
      handleAutoSubmit('Quá nhiều hành vi gian lận được phát hiện');
    }
  }, [currentQuestionIndex, suspiciousActivity, t, isTestSubmitted, testId, securityViolationDetected, blockedForCheating]);

  // Anti-cheating effects
  useEffect(() => {
    // Nếu đã submit test hoặc đã bị blocked thì không cần theo dõi anti-cheat nữa
    if (isTestSubmitted || blockedForCheating || isCreator) return;
    
    const handleBeforeUnload = (e) => {
      if (!isTestSubmitted) {
        logSuspiciousActivity('tabSwitches', 'Page refresh/reload attempt');
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      logSuspiciousActivity('contextMenuAttempts');
      return false;
    };

    // Disable text selection and copy
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e) => {
      e.preventDefault();
      logSuspiciousActivity('copyAttempts');
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.metaKey && (e.key === 'u' || e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))
      ) {
        e.preventDefault();
        logSuspiciousActivity('keyboardShortcuts', `Attempted: ${e.key}`);
        return false;
      }
    };

    // Detect screenshot attempts (PrintScreen key)
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        logSuspiciousActivity('screenshotAttempts');
      }
    };

    // Detect window focus/blur (tab switching) - chỉ khi chưa submit
    const handleVisibilityChange = () => {
      if (document.hidden && !isTestSubmitted) {
        logSuspiciousActivity('tabSwitches');
      }
    };

    const handleWindowBlur = () => {
      if (!isTestSubmitted) {
        logSuspiciousActivity('tabSwitches');
      }
    };

    // Detect DevTools opening
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        logSuspiciousActivity('devToolsAttempts');
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('paste', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check for DevTools every 1 second
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Force fullscreen mode
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error('Could not enter fullscreen:', err);
      }
    };

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && testData) {
        logSuspiciousActivity('tabSwitches', 'Exited fullscreen');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    // Enter fullscreen when test starts
    if (testData && !isFullscreen) {
      enterFullscreen();
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('paste', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(devToolsInterval);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [logSuspiciousActivity, testData, isFullscreen, isTestSubmitted, blockedForCheating, isCreator]);

  // Check violations after all functions are defined
  useEffect(() => {
    // If user is creator, do not block
    if (isCreator) {
      setBlockedForCheating(false);
      return;
    }

    if (testId && !isTestSubmitted && testData) {
      // If test was previously terminated, block immediately
      if (isTestTerminated) {
        setBlockedForCheating(true);
        return;
      }
      
      // Check if violations already exceeded limit on mount
      const currentSuspiciousActivity = getSuspiciousActivityFromStorage(testId);
      const totalViolations = Object.values(currentSuspiciousActivity).reduce((sum, count) => sum + count, 0);
      
      if (totalViolations >= 5) {
        setBlockedForCheating(true);
        
        // Use setTimeout to ensure state is updated
        setTimeout(() => {
          handleAutoSubmit('Đã vượt quá giới hạn vi phạm cho phép');
        }, 500);
      }
    }
  }, [testId, isTestSubmitted, testData, isTestTerminated, handleAutoSubmit, isCreator]);

  // Start timer with API
  const startTimer = useCallback(async () => {
    if (timerStarted || isCreator) {
      console.log('Timer not starting:', { timerStarted, isCreator });
      return;
    }

    if (!testData?.time_limit) {
      console.log('No time limit set for this test');
      return;
    }

    try {
      const username = localStorage.getItem('username') || '';
      const currentTime = new Date().toISOString();
      
      console.log('Starting timer with:', { testId, username, currentTime, timeLimit: testData.time_limit });
      
      const response = await fetch(`${apiUrl}/api/v1/quiz/start-timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid_exam: testId,
          username: username,
          time_start: currentTime
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Timer API response:', data);
        
        // Fix timezone issue: if server returns time without Z or offset, assume it's UTC
        // because we sent it as ISO string (UTC)
        let timeStartStr = data.time_start;
        if (!timeStartStr.endsWith('Z') && !timeStartStr.includes('+') && !timeStartStr.match(/-\d{2}:\d{2}$/)) {
          timeStartStr += 'Z';
        }
        
        const serverTimeStart = new Date(timeStartStr);
        const currentTimeCheck = new Date();
        
        // Calculate time difference in seconds
        const timeDiffSeconds = (serverTimeStart - currentTimeCheck) / 1000;

        console.log('Time comparison:', { 
          originalTimeStr: data.time_start,
          parsedTimeStr: timeStartStr,
          serverTimeStart: serverTimeStart.toISOString(), 
          currentTimeCheck: currentTimeCheck.toISOString(),
          diffSeconds: timeDiffSeconds,
          isNew: data.is_new
        });

        // Check if server time_start is significantly in the future (tampering detected)
        // Allow 10 seconds tolerance for network latency and clock differences
        const TOLERANCE_SECONDS = 10;
        
        if (timeDiffSeconds > TOLERANCE_SECONDS) {
          console.error('Time tampering detected: server time_start is too far in the future', {
            diffSeconds: timeDiffSeconds,
            tolerance: TOLERANCE_SECONDS
          });
          setBlockedForCheating(true);
          handleAutoSubmitRef.current?.('Phát hiện gian lận: Thời gian bắt đầu không hợp lệ');
          return;
        }

        setTimeStartFromServer(serverTimeStart);
        
        // Calculate remaining time if test has time limit
        // time_limit is in MINUTES, convert to seconds
        const timeLimitSeconds = testData.time_limit * 60;
        
        // Use max(0, elapsed) to handle the case where serverTimeStart is slightly in future
        const elapsedSeconds = Math.max(0, Math.floor((currentTimeCheck - serverTimeStart) / 1000));
        const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
        
        console.log('Timer calculation:', { 
          timeLimitMinutes: testData.time_limit,
          timeLimitSeconds,
          elapsedSeconds, 
          remainingSeconds,
          willExpireAt: new Date(Date.now() + remainingSeconds * 1000).toISOString()
        });
        
        // If time already expired, auto-submit immediately
        if (remainingSeconds <= 0) {
          console.warn('⏰ Time already expired on load - auto-submitting immediately');
          setTimeRemaining(0);
          setTimerStarted(true);
          // Use setTimeout to ensure state is updated before submitting
          setTimeout(() => {
            handleAutoSubmitRef.current?.('Hết thời gian làm bài');
          }, 100);
          return;
        }
        
        // Set timeRemaining FIRST so the countdown useEffect sees a valid value
        // when timerStarted flips to true
        setTimeRemaining(remainingSeconds);
        setTimerStarted(true);
      } else {
        console.error('Timer API error:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Error starting timer:', err);
    }
  }, [testId, timerStarted, testData, isCreator, apiUrl]);

  // Timer countdown effect
  useEffect(() => {
    // Only start interval when both timerStarted=true AND timeRemaining has a valid positive value
    if (!timerStarted || timeRemaining === null || isCreator) return;

    // Don't set interval if time is already 0 - handled in startTimer
    if (timeRemaining <= 0) {
      console.log('Timer already at 0, not starting countdown');
      return;
    }

    // If an interval is already running, don't create another one
    if (timerIntervalRef.current) {
      return;
    }

    console.log('Starting countdown interval from:', timeRemaining);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          console.warn('⏰ Timer reached 0 during countdown - auto-submitting');
          // Use ref to avoid stale closure and prevent interval from being recreated
          handleAutoSubmitRef.current?.('Hết thời gian làm bài');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  // timeRemaining in deps so the effect fires once timeRemaining is set after API call.
  // The `if (timerIntervalRef.current) return` guard prevents duplicate intervals on subsequent renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerStarted, timeRemaining, isCreator]);

  // Format time for display
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch test data from API
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setIsLoading(true);
        const quizApiUrl = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8000';
        const mainApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:9999';
        
        const response = await fetch(`${quizApiUrl}/api/v1/quiz/${testId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch test data');
        }
        
        const data = await response.json();
        setTestData(data);

        // Verify if current user is creator
        const token = localStorage.getItem("token");
        if (token && data.username) {
          try {
             const verifyResponse = await fetch(`${mainApiUrl}/verify-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
             });
             
             if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                if (verifyData.success && verifyData.user && verifyData.user.username === data.username) {
                   setIsCreator(true);
                   console.log("Anti-cheat disabled for creator");
                }
             }
          } catch (e) {
             console.warn("Token verification failed:", e);
          }
        }

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

  // Start timer when test data is loaded
  useEffect(() => {
    console.log('Timer useEffect triggered:', { 
      hasTestData: !!testData, 
      timerStarted, 
      isTestSubmitted, 
      blockedForCheating, 
      isCreator,
      timeLimit: testData?.time_limit 
    });
    
    if (testData && !timerStarted && !isTestSubmitted && !blockedForCheating && !isCreator) {
      console.log('Calling startTimer()...');
      startTimer();
    }
  }, [testData, timerStarted, isTestSubmitted, blockedForCheating, isCreator, startTimer]);

  // ...existing helper functions (cleanTextContent, renderTextContent, etc.)...
  const cleanTextContent = (text) => {
    if (!text) return '';
    
    let cleaned = text
      .replace(/\\textsuperscript\{([^}]*)\}/g, '^$1')
      .replace(/\\textsubscript\{([^}]*)\}/g, '_$1')
      .replace(/\\textbf\{([^}]*)\}/g, '$1')
      .replace(/\\textit\{([^}]*)\}/g, '$1')
      .replace(/\\emph\{([^}]*)\}/g, '$1')
      .replace(/\$([^$]*)\$/g, '$1')
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\degree/g, '°')
      .replace(/\\%/g, '%')
      .replace(/\\pandocbounded\{/g, '')
      .replace(/\}\.\s*\\end\{quote\}/g, '')
      .replace(/\}\s*\\end\{quote\}/g, '')
      .replace(/\\end\{quote\}/g, '')
      .replace(/\\begin\{quote\}/g, '')
      .replace(/\\end\{[^}]*\}/g, '')
      .replace(/\\begin\{[^}]*\}/g, '')
      .replace(/\\\w+\{[^}]*\}/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/^\}\s*/g, '')
      .replace(/\}\s*$/g, '')
      .replace(/^\.\s*/g, '')
      .replace(/\s*\.\s*$/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  };

  const renderTextContent = (text) => {
    if (!text) return '';
    
    const cleanedText = cleanTextContent(text);
    
    const superscriptMap = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
    };
    
    const subscriptMap = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
    };
    
    let formattedText = cleanedText.replace(/\^([^\s]+)/g, (match, content) => {
      return content.split('').map(char => superscriptMap[char] || char).join('');
    });
    
    formattedText = formattedText.replace(/_([^\s]+)/g, (match, content) => {
      return content.split('').map(char => subscriptMap[char] || char).join('');
    });
    
    return formattedText;
  };

  const renderImage = (src, alt, isInQuestion = false) => {
    const sizeClasses = isInQuestion 
      ? 'h-12 md:h-16 cursor-pointer hover:scale-110 transition-transform duration-200' 
      : 'h-10 md:h-12 cursor-pointer hover:scale-110 transition-transform duration-200';

    return (
      <img 
        src={src} 
        alt={alt}
        className={`inline-block mx-1 object-contain ${sizeClasses} select-none`}
        onClick={() => setEnlargedImage(src)}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        title={t('test.clickToEnlarge')}
      />
    );
  };

  const renderQuestionBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2 select-none">
        {blocks.map((block, index) => {
          if (block.type === 'text' && block.content) {
            const formattedText = renderTextContent(block.content);
            if (!formattedText) return null;
            
            return (
              <span key={index} className="text-slate-800 select-none">
                {formattedText}
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

  const renderOptionBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2 select-none">
        {blocks.map((block, index) => {
          if (block.type === 'text' && block.content) {
            const formattedText = renderTextContent(block.content);
            if (!formattedText) return null;
            
            return (
              <span key={index} className="text-slate-700 select-none">
                {formattedText}
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
    // Không cho phép submit nếu đã bị blocked
    if (blockedForCheating) return;
    
    if (Object.keys(answers).length !== testData.questions.length) {
      setShowIncompleteWarningModal(true);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        quiz_uuid: testId,
        student_username: localStorage.getItem('username') || '',
        answers: testData.questions.map((question, index) => ({
          question_id: question.id,
          selected_option: answers[index] || ''
        })),
        activity_log: activityLogRef.current,
        suspicious_activity: suspiciousActivity,
        security_violation_detected: securityViolationDetected
      };

      const response = await fetch(`${apiUrl}/api/v1/quiz/check-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit answers');
      }

      setResults(data);
      setIsTestSubmitted(true);
      
      // Clear secure storage after successful submit
      clearSecureStorage();
      
    } catch (err) {
      console.error('Error submitting test:', err);
      setSubmitError(t(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // New component for the incomplete warning modal
  const IncompleteWarningModal = () => {
    if (!showIncompleteWarningModal) return null;

    const handleConfirmSubmit = async () => {
      setShowIncompleteWarningModal(false);
      // Proceed with submission
      try {
        setSubmitting(true);
        setSubmitError(null);

        const payload = {
          quiz_uuid: testId,
          student_username: localStorage.getItem('username') || '',
          answers: testData.questions.map((question, index) => ({
            question_id: question.id,
            selected_option: answers[index] || ''
          })),
          activity_log: activityLogRef.current,
          suspicious_activity: suspiciousActivity,
          security_violation_detected: securityViolationDetected
        };

        const response = await fetch(`${apiUrl}/api/v1/quiz/check-answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log('Submission response:', data);
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to submit answers');
        }
        
        setResults(data);
        setIsTestSubmitted(true);
        
        // Clear secure storage
        clearSecureStorage();
        
      } catch (err) {
        console.error('Error submitting test:', err);
        setSubmitError(t(err.message));
      } finally {
        setSubmitting(false);
      }
    };

    const handleCancelSubmit = () => {
      setShowIncompleteWarningModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/30">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white rounded-t-2xl">
            <h2 className="text-xl font-bold">{t('test.incompleteWarningTitle')}</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-700 mb-6">{t('test.incompleteWarning')}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelSubmit}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
              >
                {t('test.cancel')}
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('test.submitting') : t('test.confirmSubmit')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Anti-cheat warning modal
  const AntiCheatWarning = () => {
    if (!showWarning) return null;

    const handleCloseWarning = () => {
      setShowWarning(false);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };

    return (
      <div className="fixed inset-0 bg-red-900/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {t('antiCheat.warningTitle')}
              </h2>
              <button
                onClick={handleCloseWarning}
                className="text-white hover:text-red-200 p-1 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6 text-center">
            <p className="text-red-700 font-semibold mb-4">{warningMessage}</p>
            <div className="text-sm text-slate-600">
              <p>{t('antiCheat.violationCount')}: {Object.values(suspiciousActivity).reduce((sum, count) => sum + count, 0)}</p>
              <p className="text-red-600 font-medium mt-2">{t('antiCheat.consequences')}</p>
            </div>
            <button
              onClick={handleCloseWarning}
              className="mt-4 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
            >
              {t('antiCheat.understood')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle close blocked screen
  const handleCloseBlockedScreen = () => {
    if (results) {
      setShowBlockedResults(true);
    } else {
      navigate('/dashboard');
    }
  };

  // Blocked screen
  if ((blockedForCheating || isTestTerminated) && !showBlockedResults) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500 text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <button
                onClick={handleCloseBlockedScreen}
                className="absolute top-4 right-4 text-white hover:text-red-200 p-1 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h1 className="text-2xl font-bold">{t('antiCheat.testTerminated')}</h1>
          </div>
          <div className="p-6">
            <p className="text-red-700 font-semibold mb-4">{t('antiCheat.blockedMessage')}</p>
            <p className="text-sm text-slate-600 mb-6">{t('antiCheat.contactSupport')}</p>
            <button
              onClick={handleCloseBlockedScreen}
              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
            >
              {results ? t('antiCheat.viewResults') : t('antiCheat.backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Blocked background with results modal
  if ((blockedForCheating || isTestTerminated) && showBlockedResults && results) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center p-4 relative">
        {/* Background blur overlay */}
        <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm"></div>
        
        {/* Results Modal */}
        <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin border border-white/30">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t('test.resultsTitle')} - {t('antiCheat.cheatingDetected')}</h2>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-red-200 p-1 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Warning about cheating */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-bold text-red-700">{t('antiCheat.cheatingDetected')}</h3>
              </div>
              <p className="text-red-600 text-sm mb-2">{t('antiCheat.resultsMayBeInvalid')}</p>
              <p className="text-red-600 text-sm">{t('antiCheat.violationCount')}: {Object.values(suspiciousActivity).reduce((sum, count) => sum + count, 0)}</p>
            </div>

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

            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white py-3 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                {t('test.backToDashboard')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Debug timer display
  console.log('Timer display check:', {
    hasTimeLimit: !!testData?.time_limit,
    timeLimit: testData?.time_limit,
    timerStarted,
    isCreator,
    timeRemaining,
    shouldShow: testData?.time_limit && timerStarted && !isCreator
  });

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex flex-col overflow-hidden select-none">
      <div className="container mx-auto max-w-full flex flex-col h-full">
        {/* Header - Fixed */}
        <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 md:p-6 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const confirmExit = window.confirm(t('test.confirmExit'));
                if (confirmExit) {
                  navigate(-1);
                }
              }}
              className="text-white hover:bg-white/20 p-2 md:p-3 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center flex-1 min-w-0 px-4">
              <h1 className="text-lg md:text-xl font-bold text-white truncate w-full text-center">
                {testData?.title || t('test.title')}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm md:text-base text-white/90 font-medium bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm">
                  {t('test.questionTitle')} {currentQuestionIndex + 1}/{totalQuestions}
                </span>
                {/* Timer Display - Show if test has time limit and timer started with valid value */}
                {testData?.time_limit && timerStarted && timeRemaining !== null && (
                  <span className={`text-sm md:text-base font-bold px-3 py-0.5 rounded-full backdrop-blur-sm ${
                    timeRemaining !== null && timeRemaining < 300
                      ? 'bg-red-500/90 text-white animate-pulse'
                      : 'bg-white/20 text-white/90'
                  }`}>
                    <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(timeRemaining)}
                  </span>
                )}
                {/* Debug info - Remove after testing */}
                {testData?.time_limit && (
                  <span className="text-xs text-white/70 bg-black/20 px-2 py-1 rounded">
                    {isCreator ? 'Creator' : `T:${timerStarted && timeRemaining !== null ? 'Y' : 'N'}`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Copy Link Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className="text-white hover:bg-white/20 p-2 md:p-3 rounded-xl transition-all duration-200 hover:scale-105"
                title={copySuccess ? t('test.linkCopied') : t('test.copyLink')}
              >
                {copySuccess ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* Leaderboard button for admin */}
              {localStorage.getItem('username') === testData?.username && (
                <button
                  onClick={fetchLeaderboard}
                  disabled={leaderboardLoading}
                  className="text-white hover:bg-white/20 p-2 md:p-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  title={t('test.viewLeaderboard')}
                >
                  {leaderboardLoading ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* Fullscreen button */}
              {!isFullscreen && (
                <button
                  onClick={async () => {
                    try {
                      await document.documentElement.requestFullscreen();
                    } catch (err) {
                      console.error('Could not enter fullscreen:', err);
                    }
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                  title={t('antiCheat.enterFullscreen')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Anti-cheat status bar */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200 p-2 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-orange-700 font-medium">{t('antiCheat.secureMode')}</span>
              {!isFullscreen && (
                <span className="text-red-600 font-medium">{t('antiCheat.fullscreenRequired')}</span>
              )}
            </div>
            <div className="text-orange-600 text-xs">
              {t('antiCheat.violations')}: {Object.values(suspiciousActivity).reduce((sum, count) => sum + count, 0)}
            </div>
          </div>
        </div>

        {/* ...rest of the normal test interface... */}
        {/* Progress Bar - Fixed */}
        <div className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 p-2 md:p-4 flex-shrink-0">
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
        
        {/* Main Content - Fixed height with scroll */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left Column - Question */}
          <div className="w-full lg:w-2/3 p-4 md:p-6 lg:p-8 flex flex-col min-h-0">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 flex flex-col h-full min-h-0">
              <div className="p-6 md:p-8 flex flex-col h-full min-h-0">
                <div className="mb-6 flex-shrink-0">
                  <span className="inline-block bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 px-4 py-2 rounded-lg text-sm md:text-base font-semibold mb-4">
                    {t('test.question')} {currentQuestion.id}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  <div className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-800 leading-relaxed p-4">
                    {renderQuestionBlocks(currentQuestion.blocks)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Answer Options */}
          <div className="w-full lg:w-1/3 p-4 md:p-6 lg:p-8 flex flex-col min-h-0">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 flex flex-col h-full min-h-0">
              <div className="p-6 md:p-8 flex flex-col h-full min-h-0">
                <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-6 flex-shrink-0">{t('test.chooseAnswer')}</h3>
                
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2">
                  <div className="space-y-4">
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
        </div>

        {/* Bottom Navigation - Fixed */}
        <div className="bg-white/90 backdrop-blur-xl shadow-lg border-t border-white/30 p-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex-shrink-0 ${
                currentQuestionIndex === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-xl hover:scale-[1.02]'
              }`}
            >
              {t('test.previous')}
            </button>

            <div className="flex-1 text-center px-4">
              <div className="flex flex-wrap justify-center gap-2 max-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {testData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setSelectedAnswer(answers[index] || '');
                    }}
                    className={`w-6 h-6 rounded-lg text-sm font-bold transition-all duration-200 flex-shrink-0 ${
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

            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={submitting || blockedForCheating}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02] flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('test.submitting') : blockedForCheating ? t('antiCheat.testTerminated') : t('test.submit')}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={blockedForCheating}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-xl transition-all duration-200 hover:scale-[1.02] flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('test.next')}
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

      {/* Add the new modal before the closing div */}
      <IncompleteWarningModal />

      {/* Anti-cheat Warning Modal */}
      <AntiCheatWarning />

      <LeaderboardModalTest 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
        leaderboardData={leaderboardData} 
        leaderboardLoading={leaderboardLoading} 
        testData={testData} 
      />


      {/* Image Modal */}
      {enlargedImage && (
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
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/50 rounded px-3 py-1 inline-block">
                {t('test.tapToClose')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Normal Results Modal */}
      {results && !blockedForCheating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin border border-white/30">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white rounded-t-2xl">
              <h2 className="text-2xl font-bold text-center">{t('test.resultsTitle')}</h2>
            </div>
            
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
      )}
    </div>
  );
};

export default TestRoom;