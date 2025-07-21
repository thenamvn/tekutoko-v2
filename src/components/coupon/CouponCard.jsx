import React, { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import QRCode from "qrcode.react";
import CryptoJS from 'crypto-js';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { useTranslation } from 'react-i18next';
import NavigationComponent from '../NavigationBar/NavigationBar';

const CouponCard = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const secret = 'ohShitHacker';
  const username = localStorage.getItem('username');
  const apiUrl = process.env.REACT_APP_API_URL;
  const [error, setError] = useState(null);
  const [errorCamera, setErrorCamera] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [rewardInfo, setRewardInfo] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [activeTab, setActiveTab] = useState('vouchers');

  const handleCloseQr = () => {
    setShowQr(false);
    setQrData(null);
  };

  const handleScan = async (result) => {
    if (result) {
      try {
        // Step 1: Decrypt the QR code data
        const bytes = CryptoJS.AES.decrypt(result[0].rawValue, secret);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        // console.log(decryptedData);

        // Step 2: Parse the decrypted data
        const [username, voucher_id] = decryptedData.split('|');

        // Step 3: Check if the voucher exists in the user_vouchers table
        const response = await fetch(`${apiUrl}/api/checkUserVoucher`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, voucher_id }),
        });

        const data = await response.json();
        if (data.exists) {
          // console.log('Voucher exists in the database');

          // Step 4: Fetch the voucher details
          try {
            const voucherResponse = await fetch(`${apiUrl}/api/voucher/${voucher_id}`);
            const voucherData = await voucherResponse.json();
            const host_username = voucherData.host_room;

            // Step 5: Check if current user is the host
            if (username !== host_username) {
              setError(t('couponCard.notAuthorized', 'You are not authorized to redeem this voucher. Only the host can scan and redeem vouchers.'));
              alert(t('couponCard.notAuthorized', 'You are not authorized to redeem this voucher. Only the host can scan and redeem vouchers.'));
              setScanning(false);
              return;
            }

            // Step 6: Set the reward information and update the state
            setRewardInfo(voucherData);
            setScanning(false);
            setShowResult(true);

            // Step 7: Delete the voucher from the user_vouchers table
            await fetch(`${apiUrl}/api/deleteUserVoucher`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, voucher_id }),
            });
          } catch (error) {
            console.error('Error fetching voucher information:', error);
          }
        } else {
          console.log('Voucher does not exist in the database');
          // Handle the case where the voucher does not exist
        }
      } catch (error) {
        // Step 7: Handle errors
        setError(t('couponCard.invalidQRCode'));
        setScanning(false);
      }
    }
  };

  const handleCloseRewardForm = () => {
    setShowResult(false);
    setRewardInfo(null);
  };

  function handleQrCreate(username, voucher_id) {
    try {
      const rewardString = `${username}|${voucher_id}`;
      const encryptedData = CryptoJS.AES.encrypt(rewardString, secret).toString();
      setQrData(encryptedData);
      setShowQr(true);
    } catch (error) {
      setError('An error occurred while creating QR code');
    }
  }

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
    if (err.name === "NotAllowedError") {
      setErrorCamera(t('couponCard.permissionDenied'));
    } else if (err.name === "NotFoundError") {
      setErrorCamera(t('couponCard.noCameraFound'));
    }
  }

  const handleScanClick = () => {
    setShowResult(false);
    setScanning(prevScanning => !prevScanning);
  };
  useEffect(() => {
    setLoading(true);
    const fetchVouchers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/vouchers/${username}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(t('couponCard.noVouchersFound'));
          } else {
            setError(t('couponCard.fetchError'));
          }
          return;
        }
        const data = await response.json();
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set current date to start of day
        // Filter out expired vouchers - keep vouchers that expire today
        const nonExpiredVouchers = data.filter(voucher => {
          const expirationDate = new Date(voucher.expiration_date);
          expirationDate.setHours(23, 59, 59, 999); // Set expiration to end of day
          return expirationDate >= currentDate;
        });
        // Remove expired vouchers from the user and then delete them
        const expiredVouchers = data.filter(voucher => {
          const expirationDate = new Date(voucher.expiration_date);
          expirationDate.setHours(23, 59, 59, 999); // Set expiration to end of day
          return expirationDate < currentDate;
        });
        // Delete expired vouchers
        for (const voucher of expiredVouchers) {
          // Remove voucher from user
          await fetch(`${apiUrl}/api/deleteUserVoucher`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              voucher_id: voucher.voucher_id,
            }),
          });

          // Delete voucher
          await fetch(`${apiUrl}/api/deleteVoucher/${voucher.voucher_id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        // Separate non-expired vouchers into discount and ticket vouchers
        const discountVouchers = nonExpiredVouchers.filter(voucher => voucher.reward_type === 'discount');
        const ticketVouchers = nonExpiredVouchers.filter(voucher => voucher.reward_type === 'ticket');
        setVouchers(discountVouchers);
        setTickets(ticketVouchers);
      } catch (err) {
        setError(t('couponCard.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [username]);

  const renderMobileLayout = () => (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
      {/* Loading Overlay với glassmorphism */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-600 font-medium">Loading rewards...</p>
          </div>
        </div>
      )}

      {/* Header với gradient */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
        <h1 className="text-xl font-bold text-white text-center">
          {t('couponCard.scanReward', 'My Rewards')}
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">

        {/* QR Scanner Section */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 2.3l-.7-.7M18 12h1M12 20v1m-6-2.3l.7.7M6 12H5m7-7a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
            {t('couponCard.scanReward', 'Scan QR Code')}
          </h2>

          <button
            onClick={handleScanClick}
            className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-violet-100 to-indigo-100 hover:from-violet-200 hover:to-indigo-200 text-violet-700 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] mb-4"
            aria-label={t('couponCard.scanQRCode')}
          >
            <DocumentScannerIcon className="text-3xl" />
          </button>

          {/* QR Scanner */}
          {scanning && (
            <div className="relative bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-violet-200 shadow-lg">
              <Scanner
                onScan={handleScan}
                onError={handleError}
              />
            </div>
          )}

          {/* Camera Error */}
          {errorCamera && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
              <p className="text-red-700 text-sm flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorCamera}
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'vouchers'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-white/50'
                }`}
              onClick={() => setActiveTab('vouchers')}
            >
              <span className="mr-2">🎫</span>
              {t('couponCard.vouchers', 'Vouchers')}
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'tickets'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-600 hover:bg-white/50'
                }`}
              onClick={() => setActiveTab('tickets')}
            >
              <span className="mr-2">🎟️</span>
              {t('couponCard.tickets', 'Tickets')}
            </button>
          </div>
        </div>

        {/* Vouchers Tab */}
        {activeTab === 'vouchers' && (
          <div className="space-y-4">
            {vouchers.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎫</span>
                </div>
                <p className="text-slate-500 font-medium">{t('couponCard.noVouchersFound', 'No vouchers available')}</p>
              </div>
            ) : (
              vouchers.map(voucher => (
                <div key={voucher.voucher_id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="p-4">
                    <div className="flex items-center border-b border-slate-200 pb-4 mb-4">
                      <div className="w-16 h-16 mr-4 overflow-hidden rounded-xl border border-white/20 shadow-lg">
                        <img src={voucher.host_avatar_url} alt="Host" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">{voucher.discount_name}</h3>
                        <p className="text-slate-600 text-sm">
                          <a href={`/profile/${voucher.user_id}`} className="hover:text-violet-600 transition-colors duration-200">
                            {voucher.host_fullname}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                          {voucher.discount_value}
                        </span>
                        <span className="text-slate-600 text-sm ml-2">{t("reward.coupon", "OFF")}</span>
                      </div>
                      <button
                        onClick={() => handleQrCreate(username, voucher.voucher_id)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2 px-4 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:scale-[1.02]"
                      >
                        {t('couponCard.use', 'Use')}
                      </button>
                    </div>

                    <p className="text-slate-500 text-xs mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t('couponCard.validTill', 'Valid until:')} {new Date(voucher.expiration_date).toLocaleDateString()}
                    </p>

                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-xl border border-white/20">
                      <p className="text-slate-700 text-sm leading-relaxed">{voucher.discount_description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎟️</span>
                </div>
                <p className="text-slate-500 font-medium">{t('couponCard.noTicketsFound', 'No tickets available')}</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.voucher_id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="p-4">
                    <div className="flex items-center border-b border-slate-200 pb-4 mb-4">
                      <div className="w-16 h-16 mr-4 overflow-hidden rounded-xl border border-white/20 shadow-lg">
                        <img src={ticket.ticket_image_url} alt="Ticket" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">{ticket.ticket_name}</h3>
                        <p className="text-slate-600 text-sm">
                          <a href={`/profile/${ticket.user_id}`} className="hover:text-violet-600 transition-colors duration-200">
                            {ticket.host_fullname}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-500 text-xs flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('couponCard.validTill', 'Valid until:')} {new Date(ticket.expiration_date).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleQrCreate(username, ticket.voucher_id)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2 px-4 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:scale-[1.02]"
                      >
                        {t('couponCard.use', 'Use')}
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-xl border border-white/20">
                      <p className="text-slate-700 text-sm leading-relaxed">{ticket.ticket_description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}


        {/* Reward Result Modal */}
        {showResult && rewardInfo && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 max-w-sm w-full mx-4 relative shadow-xl border border-white/20">
              <button
                onClick={handleCloseRewardForm}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
              >
                ×
              </button>

              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✓</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Reward Redeemed!</h2>
              </div>

              {rewardInfo.reward_type === 'discount' ? (
                <div className="space-y-4">
                  <div className="flex items-center border-b border-slate-200 pb-4">
                    <div className="w-12 h-12 mr-3 overflow-hidden rounded-xl border border-white/20">
                      <img src={rewardInfo.host_avatar_url} alt="Host" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{rewardInfo.discount_name}</h3>
                      <p className="text-slate-600 text-sm">
                        <a href={`/profile/${rewardInfo.user_id}`}>{rewardInfo.host_fullname}</a>
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      {rewardInfo.discount_value}
                    </span>
                    <span className="text-slate-600 ml-2">{t("reward.coupon", "OFF")}</span>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-xl">
                    <p className="text-slate-700 text-sm">{rewardInfo.discount_description}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center border-b border-slate-200 pb-4">
                    <div className="w-12 h-12 mr-3 overflow-hidden rounded-xl border border-white/20">
                      <img src={rewardInfo.ticket_image_url} alt="Ticket" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{rewardInfo.ticket_name}</h3>
                      <p className="text-slate-600 text-sm">
                        <a href={`/profile/${rewardInfo.user_id}`}>{rewardInfo.host_fullname}</a>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-xl">
                    <p className="text-slate-700 text-sm">{rewardInfo.ticket_description}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleCloseRewardForm}
                className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {t('couponCard.close', 'Close')}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 max-w-sm w-full mx-4 text-center relative shadow-xl border border-white/20">
            <button
              onClick={handleCloseQr}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-6">{t('couponCard.qrCode', 'QR Code')}</h2>

            {qrData && (
              <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                <QRCode value={qrData} size={200} className="mx-auto" />
              </div>
            )}

            <p className="text-slate-600 text-sm mt-4">{t('couponCard.showQrCode', 'Show this QR code to redeem your reward')}</p>
          </div>
        </div>
      )}

      {/* Footer Navigation với glassmorphism */}
      <div className="fixed w-full max-w-md bottom-0 z-50">
        <div className="bg-white/90 backdrop-blur-lg border-t border-white/20">
          <NavigationComponent />
        </div>
      </div>
    </div>
  );
  return (
    <div>
      {renderMobileLayout()}
    </div>
  );


};
export default CouponCard;