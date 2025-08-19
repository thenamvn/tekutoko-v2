import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const UserRewardView = ({ username, room_id, onClose, room_title, voucher, progress }) => {
  const { t } = useTranslation();
  const [listVoucher, setListVoucher] = useState([]);
  const [listTicket, setListTicket] = useState([]);
  const [userProgress, setUserProgress] = useState({ answered: 0, total: 0, allCorrect: false });
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  // New states for detailed view
  const [selectedReward, setSelectedReward] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  useEffect(() => {
    fetchRewards();
    fetchUserProgress();
  }, [room_id, username]);

  const fetchRewards = async () => {
    try {
      if (voucher.length > 0) {
        const discountVouchers = voucher.filter(voucher => voucher.reward_type === 'discount');
        const ticketVouchers = voucher.filter(voucher => voucher.reward_type === 'ticket');
        setListVoucher(discountVouchers);
        setListTicket(ticketVouchers);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      if (progress) {
        const allCompleted = progress.correct === progress.total && progress.total > 0;

        setUserProgress({
          answered: progress.correct,
          total: progress.total,
          allCorrect: progress.allCorrect
        });

        setCanClaim(allCompleted && progress.allCorrect);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const handleClaimReward = async () => {
    if (!canClaim) return;

    setIsLoading(true);
    try {
      // Check if user already received reward
      const checkResponse = await fetch(`${apiUrl}/rewarded_users/check?room_id=${room_id}&username=${username}`);
      const checkData = await checkResponse.json();

      if (checkData.isRewarded) {
        alert(t("reward.alreadyReceived"));
        onClose();
        return;
      }

      // Give all available rewards to user
      const allVoucherIds = [...listVoucher, ...listTicket].map(v => v.voucher_id);

      const reward = {
        username: username,
        voucherIds: allVoucherIds,
      };

      const response = await fetch(`${apiUrl}/api/user-vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reward)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Add user to rewarded_users table
      await fetch(`${apiUrl}/rewarded_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ room_id, username })
      });

      alert(t("reward.claimSuccess"));
      onClose();

    } catch (error) {
      console.error('Error claiming reward:', error);
      alert(t("reward.claimError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewardClick = (reward) => {
    setSelectedReward(reward);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReward(null);
  };
  // Detailed reward modal component
  const RewardDetailModal = () => {
    if (!selectedReward) return null;

    const isVoucher = selectedReward.reward_type === 'discount';

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-sm w-full mx-4 shadow-xl border border-white/20 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={closeDetailModal}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-2xl border-2 border-white/30 shadow-lg">
                <img
                  src={isVoucher ? selectedReward.host_avatar_url : selectedReward.ticket_image_url}
                  alt={isVoucher ? "voucher" : "ticket"}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {isVoucher ? selectedReward.discount_name : selectedReward.ticket_name}
              </h2>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700">
                {isVoucher ? '🎫 Voucher' : '🎟️ Ticket'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {isVoucher ? (
              // Voucher details
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {selectedReward.discount_value}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Discount</div>
                  </div>
                </div>

                {selectedReward.discount_description && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-700 mb-2">Description:</h4>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedReward.discount_description.trim()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Ticket details
              <div className="space-y-4">
                {selectedReward.ticket_description && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-700 mb-2">Description:</h4>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedReward.ticket_description.trim()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Expiration */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 mt-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-amber-800">Valid Until</div>
                  <div className="text-sm text-amber-700">
                    {new Date(selectedReward.expiration_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={closeDetailModal}
              className="w-full mt-6 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileLayout = () => (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-md relative p-6 w-full mx-4 shadow-xl border border-white/20">
        <button
          type="button"
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          onClick={onClose}
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎁</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">{t("reward.title")}</h2>
        </div>

        {/* Progress Section */}
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-white/20">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
            <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("reward.yourProgress")}
          </h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">
              {t("reward.taskCompleted")}: {userProgress.answered}/{userProgress.total}
            </span>
            <span className={`text-sm font-medium px-2 py-1 rounded-lg ${userProgress.allCorrect
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
              }`}>
              {userProgress.allCorrect ? t("reward.allCorrect") : t("reward.someIncorrect")}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${userProgress.total > 0 ? (userProgress.answered / userProgress.total) * 100 : 0}%` }}
            ></div>
          </div>

          {!canClaim && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <p className="text-sm text-orange-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {(() => {
                  if (userProgress.answered < userProgress.total) {
                    return t("reward.needToComplete");
                  } else if (!userProgress.allCorrect) {
                    return t("reward.notAllCorrect");
                  } else {
                    return t("reward.requirementsNotMet");
                  }
                })()}
              </p>
            </div>
          )}
        </div>

        {/* Rewards List */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Vouchers Section */}
          {listVoucher.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <span className="mr-2">🎫</span>
                Vouchers ({listVoucher.length})
              </h4>
              {listVoucher.map((rewardInfo) => (
                <div
                  key={rewardInfo.voucher_id}
                  onClick={() => handleRewardClick(rewardInfo)}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-3 cursor-pointer hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 mr-3 overflow-hidden rounded-xl border border-white/20 shadow-lg">
                      <img src={rewardInfo.host_avatar_url} alt="coupon" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">{rewardInfo.discount_name}</h3>
                      <div className="flex items-center mb-1">
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                          {rewardInfo.discount_value}
                        </span>
                        <span className="text-xs text-slate-600 ml-1">OFF</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('couponCard.validTill')} {new Date(rewardInfo.expiration_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tickets Section */}
          {listTicket.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <span className="mr-2">🎟️</span>
                Tickets ({listTicket.length})
              </h4>
              {listTicket.map((rewardInfo) => (
                <div
                  key={rewardInfo.voucher_id}
                  onClick={() => handleRewardClick(rewardInfo)}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-3 cursor-pointer hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 mr-3 overflow-hidden rounded-xl border border-white/20 shadow-lg">
                      <img src={rewardInfo.ticket_image_url} alt="ticket" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">{rewardInfo.ticket_name}</h3>
                      <p className="text-xs text-slate-500 flex items-center mt-1">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('couponCard.validTill')} {new Date(rewardInfo.expiration_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Rewards Message */}
          {listVoucher.length === 0 && listTicket.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-slate-500 text-sm">{t('reward.noRewardsAvailable')}</p>
            </div>
          )}
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaimReward}
          disabled={!canClaim || isLoading || (listVoucher.length === 0 && listTicket.length === 0)}
          className={`w-full py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center ${canClaim && !isLoading && (listVoucher.length > 0 || listTicket.length > 0)
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2"></div>
          )}
          {(() => {
            if (isLoading) return 'Claiming...';
            if (canClaim && (listVoucher.length > 0 || listTicket.length > 0)) return 'Claim Rewards';
            if (listVoucher.length === 0 && listTicket.length === 0) return 'No Rewards Available';
            return 'Cannot Claim';
          })()}
        </button>
      </div>
      {showDetailModal && <RewardDetailModal />}
    </div>
  );

  return (
    <div>
      {renderMobileLayout()}
    </div>
  )
};

export default UserRewardView;