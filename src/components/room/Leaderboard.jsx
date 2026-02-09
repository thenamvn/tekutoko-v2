import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import UserAnswersTable from './UserAnswersTable';
import AnswersMatrixTable from './AnswersMatrixTable';
const Leaderboard = ({ 
  isOpen, 
  onClose, 
  roomId, 
  apiUrl,
  isAdmin 
}) => {
  const { t } = useTranslation();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMatrix, setShowMatrix] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!isAdmin || !roomId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/room/${roomId}/all-users-results`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      } else {
        console.error('Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, roomId, isAdmin]);

  // Don't render if not open
  if (!isOpen) return null;

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0s";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Get rank icon
  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  // Get rank color
  const getRankColor = (index) => {
    if (index === 0) return 'text-yellow-600';
    if (index === 1) return 'text-gray-500';
    if (index === 2) return 'text-amber-600';
    return 'text-slate-600';
  };

  // Get completion status color - chỉ có 2 trạng thái
  const getStatusColor = (user) => {
    return user.allAnswered ? 'bg-green-500' : 'bg-gray-400';
  };

  // Get card background color - đơn giản hóa
  const getCardBackground = (user) => {
    if (user.allAnswered) {
      return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
    }
    return 'bg-gray-50 border-gray-200';
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('leaderboard.title')}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              <span className="ml-3 text-slate-600">{t('leaderboard.loading')}</span>
            </div>
          ) : leaderboardData.users && leaderboardData.users.length > 0 ? (
            <>
              {/* Stats Summary */}
              {leaderboardData.stats && (
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-violet-600">
                        {leaderboardData.stats.totalUsers}
                      </div>
                      <div className="text-xs text-slate-600">{t('leaderboard.stats.totalPlayers')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {leaderboardData.stats.completedUsers}
                      </div>
                      <div className="text-xs text-slate-600">{t('leaderboard.stats.completed')}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Results */}
              <div className="space-y-3">
                {leaderboardData.users
                  .sort((a, b) => {
                    // Sort by completion first, then by score percentage, then by correct answers
                    if (a.allAnswered !== b.allAnswered) {
                      return b.allAnswered - a.allAnswered; // Completed users first
                    }
                    if (b.score_percentage !== a.score_percentage) {
                      return parseFloat(b.score_percentage) - parseFloat(a.score_percentage);
                    }
                    if (b.correct_answers !== a.correct_answers) {
                      return b.correct_answers - a.correct_answers;
                    }
                    return new Date(a.last_submission) - new Date(b.last_submission);
                  })
                  .map((user, index) => (
                    <div
                      key={user.username}
                      className={`flex items-center p-3 rounded-xl border transition-all duration-200 ${getCardBackground(user)}`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm mr-3 shadow-sm">
                        {index < 3 && user.allAnswered ? (
                          <span className={getRankColor(index)}>
                            {getRankIcon(index)}
                          </span>
                        ) : (
                          <span className="text-slate-600">#{index + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <img
                        src={user.avatarImage}
                        alt={user.fullname}
                        className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                        referrerPolicy="no-referrer"
                      />

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate text-sm">
                          {user.fullname}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          @{user.username}
                        </div>
                        <button
                          className="text-xs text-violet-600 underline mt-1"
                          onClick={() => setSelectedUser(user)}
                          type="button"
                        >
                          {t('leaderboard.user.viewAnswers')}
                        </button>
                      </div>

                      {/* Score Info */}
                      <div className="text-right">
                        {user.allAnswered ? (
                          <>
                            <div className="font-bold text-sm text-green-600">
                              {user.score_percentage}%
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.correct_answers}/{leaderboardData.totalQuestions} {t('leaderboard.user.correct')}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-sm text-slate-500">
                              {t('leaderboard.user.incomplete')}
                            </div>
                            <div className="text-xs text-slate-400">
                              {user.answered_questions}/{leaderboardData.totalQuestions} {t('leaderboard.user.answered')}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="ml-2 flex-shrink-0">
                        <div 
                          className={`w-3 h-3 rounded-full ${getStatusColor(user)}`}
                          title={user.allAnswered ? t('leaderboard.user.completed') : t('leaderboard.user.incomplete')}
                        ></div>
                      </div>
                    </div>
                  ))}
                <div className="mt-6 text-center">
                  <button
                    className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transition-all"
                    onClick={() => setShowMatrix(true)}
                    type="button"
                  >
                    {t('leaderboard.actions.viewAllAnswers')}
                  </button>
                </div>
                {selectedUser && (
                  <UserAnswersTable
                    user={selectedUser}
                    roomId={roomId}
                    apiUrl={apiUrl}
                    onClose={() => setSelectedUser(null)}
                  />
                )}
                {showMatrix && (
                  <AnswersMatrixTable
                    users={leaderboardData.users}
                    roomId={roomId}
                    apiUrl={apiUrl}
                    onClose={() => setShowMatrix(false)}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-semibold mb-2">{t('leaderboard.empty.title')}</p>
              <p className="text-sm">{t('leaderboard.empty.description')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;