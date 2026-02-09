import { useTranslation } from 'react-i18next';

const LeaderboardModalTest = ({ isOpen, onClose, leaderboardData, leaderboardLoading, testData }) => {
  const { t } = useTranslation();

  if (!isOpen || !leaderboardData) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/30">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('LeaderboardModalTest.leaderboardTitle')}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{testData?.test_room?.title}</h3>
                <p className="text-sm text-slate-600">{t('LeaderboardModalTest.totalSubmissions')}: {leaderboardData.total_submissions}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">{t('LeaderboardModalTest.examUuid')}: {leaderboardData.exam_uuid}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboardData.results.map((result, index) => (
              <div key={result.student_username} className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                result.cheating_detected || result.exam_cancelled
                  ? 'border-red-200 bg-red-50'
                  : result.score_percentage >= 80
                  ? 'border-green-200 bg-green-50'
                  : result.score_percentage >= 60
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-700">#{index + 1}</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">{result.student_username}</h4>
                      <p className="text-sm text-slate-600">
                        {new Date(result.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{result.score_percentage.toFixed(1)}%</div>
                    <div className="text-sm text-slate-600">
                      {result.correct_answers}/{result.total_questions}
                    </div>
                  </div>
                </div>

                {/* Cheating/Security indicators */}
                {(result.cheating_detected || result.exam_cancelled || result.security_violation_detected) && (
                  <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-semibold text-red-700">
                        {result.exam_cancelled ? t('LeaderboardModalTest.examCancelled') : t('LeaderboardModalTest.cheatingDetected')}
                      </span>
                    </div>
                    {result.cheating_reason && (
                      <p className="text-sm text-red-600">{result.cheating_reason}</p>
                    )}
                  </div>
                )}

                {/* Suspicious activity summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-slate-700">{result.suspicious_activity.tabSwitches}</div>
                    <div className="text-slate-500">{t('antiCheat.tabSwitches')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-700">{result.suspicious_activity.devToolsAttempts}</div>
                    <div className="text-slate-500">{t('antiCheat.devToolsAttempts')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-700">{result.suspicious_activity.copyAttempts}</div>
                    <div className="text-slate-500">{t('antiCheat.copyAttempts')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-700">{result.suspicious_activity.keyboardShortcuts}</div>
                    <div className="text-slate-500">{t('antiCheat.keyboardShortcuts')}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                  IP: {result.ip_address}
                </div>
              </div>
            ))}
          </div>

          {leaderboardData.results.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">{t('LeaderboardModalTest.noSubmissionsYet')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModalTest;