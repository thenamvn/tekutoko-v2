// src/components/QuizRoom/QuizRoom.js
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import NavigationComponent from '../NavigationBar/NavigationBar'; // Adjust the import path as needed
import NotFound from '../404/404'; // Adjust the import path as needed
import { useTranslation } from 'react-i18next'; // Uncomment if using i18n
import QRCode from "qrcode.react";
import { getUsernameFromToken, isTokenValid } from '../../utils/jwt_decode';
import UserRewardView from './UserRewardView'; // Adjust the import path as needed
import LocationModal from './LocationModal';
import ViewLocationModal from './ViewLocationModal';
import Leaderboard from './Leaderboard';
import ReportForm from '../report/ReportForm'; // Import ReportForm component
const QuizRoom = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const { t } = useTranslation(); // Uncomment if using i18n
  const { roomId } = useParams(); // Get room ID from URL
  const navigate = useNavigate(); // Hook for navigation
  const [roomInfo, setRoomInfo] = useState({ // Example state for room details
    room_id: "sampleRoomId",
    title: "Classroom Quiz",
    room_type: "public",
    description: "Take on the Kanji quiz around the classroom! It's fun. Keep solving!",
    bannerUrl: "https://via.placeholder.com/600x200.png?text=Quiz+Banner+(e.g.,+Nemophila)",
    hostAvatar: "https://avatar.iran.liara.run/username?username=Avatar",
    hostName: "Official_tekutoko",
    hostId: "sampleHostId",
    hostUsername: "sampleHost",
    how2play: "To play, simply click on the question you want to answer. You can answer them in any order. Good luck!",
    thumbnailUrl: "https://via.placeholder.co/600x200.png?text=Thumbnail+Image",
    location: { lat: 35.6895, lng: 139.6917 } // Example coordinates for Tokyo
  });
  const [progress, setProgress] = useState(0); // State to track quiz progress (you might fetch this)
  const [progressAll, setProgressAll] = useState(null); // State to track overall progress (if needed)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(5); // State to hold total questions (if needed)
  const [isQrCodeClicked, setIsQrCodeClicked] = useState(false); // State to track QR code click
  const [username, setUsername] = useState(null); // State to hold username from token
  const [isAdmin, setIsAdmin] = useState(false); // State to check if user is admin

  const [showUserReward, setShowUserReward] = useState(false);
  const [hasRewards, setHasRewards] = useState(false);
  const [voucher, setVoucher] = useState(null);

  // Thêm state cho image submissions
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [hasUploadQuestions, setHasUploadQuestions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  //location
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showViewLocationModal, setShowViewLocationModal] = useState(false);

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  //for gray correct answered
  const [questions, setQuestions] = useState([]); // State to hold quiz questions
  const [correctQuestionIds, setCorrectQuestionIds] = useState([]);

  // show report form
  const [showReportModal, setShowReportModal] = useState(false);
  const handleLocationSave = (location) => {
    setShowLocationModal(false);
  };

  // Helper function to check if a question is answered correctly
  const isQuestionCorrect = (questionNumber) => {
    const question = questions.find(q => q.number === questionNumber);
    return question && correctQuestionIds.includes(question.questionId);
  };

  // --- Mock Data Fetching ---
  useEffect(() => {
    let currentUsername = getUsernameFromToken();
    // console.log("Current Username:", currentUsername);
    if (!isTokenValid()) {
      currentUsername = null;
    }
    setUsername(currentUsername);
    // Check if room has rewards

    const checkAllCorrect = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/room/${roomId}/user/${currentUsername}/correct-answers`);
        const data = await response.json();
        if (data.success) {
          setShowUserReward(data.allCorrect);
          setCorrectQuestionIds(data.correctQuestionIds);
          setProgressAll(data);
        }
        if (currentUsername) {
          setProgress(data.correct)
        } else {
          setProgress(0);
        }
      } catch (error) {
        console.error('Error checking correct answers:', error);
      }
    };

    const joinRoom = async () => {
      if (!currentUsername) {
        console.error("No username found, cannot join room");
        return;
      }
      // Join the room by sending a POST request to the API
      try {
        const response = await fetch(`${apiUrl}/joinroom`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if needed
          },
          body: JSON.stringify({
            id: roomId,
            username: currentUsername,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to join room');
        }

        const data = await response.json();
      } catch (error) {
        console.error('Error joining room:', error);
      }
    };

    joinRoom(); // Call joinRoom to register user in the room
    const checkRewards = async () => {
      try {
        const response = await fetch(`${apiUrl}/get/vouchers/room/${roomId}`);
        const data = await response.json();
        setHasRewards(data.length > 0);
        setVoucher(data);
      } catch (error) {
        console.error('Error checking rewards:', error);
      }
    };

    const fetchRoomAndQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch room info from API
        const roomResponse = await fetch(`${apiUrl}/room/${roomId}/info`);

        if (!roomResponse.ok) {
          throw new Error('Failed to fetch room information');
        }

        const roomData = await roomResponse.json();

        // Set room info using the data from API
        const updatedRoomInfo = {
          title: roomData.room_title,
          description: roomData.description,
          bannerUrl: roomData.backgroundImage || "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Ftekutoko.services%40gmail.com%2F79a33164-16b6-4712-a5a1-61426a34a43d-blob?alt=media&token=3430d9e9-2090-4030-bc95-2868f8c06e98",
          hostAvatar: roomData.avatarImage || "https://avatar.iran.liara.run/username?username=" + encodeURIComponent(roomData.fullname),
          hostName: roomData.fullname,
          how2play: roomData.how2play || t('room.howToPlayDefault'),
          room_id: roomData.room_id,
          room_type: roomData.room_type,
          hostId: roomData.id,
          hostUsername: roomData.admin_username,
          location: roomData.location
        };

        setRoomInfo(updatedRoomInfo);

        // Check if current user is the admin/host of this room
        if (currentUsername && currentUsername === roomData.admin_username) {
          setIsAdmin(true);
          // console.log("User is admin of this room");
        } else {
          setIsAdmin(false);
        }

        // Fetch questions for this room
        const questionsResponse = await fetch(`${apiUrl}/api/rooms/${roomId}/questions`);

        if (!questionsResponse.ok) {
          // If no questions found, show empty state but don't throw error
          if (questionsResponse.status === 404) {
            setQuestions([]);
            setTotalQuestions(0); // Set total questions to 0 if none found
          } else {
            throw new Error('Failed to fetch questions');
          }
        } else {
          const questionsData = await questionsResponse.json();

          // Transform API data to match the expected format in your component
          const formattedQuestions = questionsData.map(q => ({
            id: `Q${q.number}`,
            questionId: q.id,
            number: q.number,
            text: q.text,
            type: q.type,
            hint: q.hint
          }));

          setQuestions(formattedQuestions);
          setTotalQuestions(questionsData.length); // Set total questions based on fetched data
          const hasUpload = questionsData.some(q => q.type === 'upload'); // Check if any question is of type 'upload'
          setHasUploadQuestions(hasUpload);
        }

      } catch (err) {
        console.error("Failed to fetch quiz data:", err);
        setError("Room Not Found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomAndQuestions();
    checkRewards(); // Check if room has rewards
    checkAllCorrect(); // Check if all answers are correct
  }, [roomId]); // Re-fetch if roomId changes

  useEffect(() => {
    if (hasUploadQuestions && isAdmin) {
      fetchUserSubmissions();
    }
  }, [hasUploadQuestions, isAdmin]);
  const fetchUserSubmissions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/room/${roomId}/user-submissions-upload`);
      if (response.ok) {
        const data = await response.json();
        setUserSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching user submissions:', error);
    }
  };
  const handleImageClick = (submission) => {
    setSelectedImage(submission);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };
  // --- Event Handlers ---
  const handleQuestionClick = (questionNumber) => {
    navigate(`/quiz/room/${roomId}/question/${questionNumber}`); // Use navigate
  };

  const handleQrCodeClick = () => {
    setIsQrCodeClicked(true);
  };
  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) {
      return userSubmissions;
    }

    return userSubmissions.filter(submission =>
      submission.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userSubmissions, searchTerm]);
  // --- Render Loading/Error States ---
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 max-w-md mx-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white text-xl font-bold text-center shadow-md">Loading Quiz...</div>
        <div className="flex-1 flex items-center justify-center"><p>Loading...</p></div>
        <div className="fixed w-full max-w-md bottom-0 z-50"><NavigationComponent /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 max-w-md mx-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white text-xl font-bold text-center shadow-md">Error</div>
        {/* <div className="flex-1 flex items-center justify-center p-4 text-center text-red-600"><p>{error}</p></div> */}
        <NotFound errorText={error} /> {/* Render NotFound component here */}
        <div className="fixed w-full mx-auto max-w-md bottom-0 z-50"><NavigationComponent /></div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
      {/* Header với gradient */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Report button - Left side */}
          {username && !isAdmin && (
            <button
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
              onClick={() => setShowReportModal(true)}
              title="Report room"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill='white'
                viewBox="0 0 24 24"
              >

                <path d="M12 5.177l8.631 15.823h-17.262l8.631-15.823zm0-4.177l-12 22h24l-12-22zm-1 9h2v6h-2v-6zm1 9.75c-.689 0-1.25-.56-1.25-1.25s.561-1.25 1.25-1.25 1.25.56 1.25 1.25-.561 1.25-1.25 1.25z" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white text-center">
              {roomInfo.title}
            </h1>
          </div>
          <button
            className="text-white hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
            onClick={() => {
              if (isAdmin) {
                // Admin: Mở modal để chọn/thay đổi vị trí
                setShowLocationModal(true);
              } else {
                // User: Mở modal để xem vị trí phòng trên map
                setShowViewLocationModal(true);
              }
            }}
            title={isAdmin ? "Chọn vị trí phòng" : "Xem vị trí phòng"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 0115 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 scrollbar-hide">

        {/* Introduction Section với glassmorphism */}
        <div className="mb-6 flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
          <img
            src={roomInfo.bannerUrl}
            alt="Introduction Banner"
            className="w-full rounded-xl shadow-lg mb-4 object-cover max-h-48"
          />
          <div className="flex items-center mb-3 cursor-pointer group" onClick={() => navigate(`/profile/${roomInfo.hostId}`)}>
            <img
              src={roomInfo.hostAvatar}
              alt="Host Avatar"
              referrerPolicy='no-referrer'
              className="w-12 h-12 rounded-full mr-3 border-2 border-white shadow-lg"
            />
            <span className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors duration-200">
              {roomInfo.hostName}
            </span>
          </div>
          <p className="text-slate-600 text-sm mb-4 text-center leading-relaxed whitespace-pre-line">
            {roomInfo.description}
          </p>

          {/* Progress indicators với modern design */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center space-x-2 mb-3">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <div
                  key={`progress-dot-${index}`}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index < progress
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-500 scale-110 shadow-lg shadow-violet-500/25'
                    : 'bg-slate-300'
                    }`}
                />
              ))}
            </div>
            <div className="text-slate-500 text-sm font-medium">
              {progress} / {totalQuestions} {t('room.Completed')}
            </div>
          </div>
        </div>

        {/* How to Play (Rules) với modern design */}
        <details className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6 cursor-pointer group">
          <summary className="font-semibold text-slate-800 list-none flex items-center group-hover:text-violet-600 transition-colors duration-200">
            <svg className="w-4 h-4 mr-2 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {t('room.howToPlay')}
          </summary>
          <p className="text-slate-600 mt-3 text-sm leading-relaxed whitespace-pre-line">
            {roomInfo.how2play || t('room.howToPlayDefault')}
          </p>
        </details>

        {/* Rewards Section với gradient button */}
        {hasRewards && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-slate-800 flex items-center">
              <span className="mr-2 text-2xl">🎁</span> {t('room.rewards')}
            </h2>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {t('room.rewardDescription')}
            </p>
            <button
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => setShowUserReward(true)}
            >
              {t('room.viewRewards')}
            </button>
          </div>
        )}

        {/* Question List Section với modern cards */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
            <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('room.questions')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {questions.map((question) => {
              const isCorrect = isQuestionCorrect(question.number);
              return (
                <div
                  key={question.id}
                  className={`group rounded-xl shadow-lg border cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center h-32 text-center hover:scale-[1.02] relative ${isCorrect
                    ? 'bg-gray-300/80 backdrop-blur-sm border-gray-400/30 hover:bg-gray-400/80'
                    : 'bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white'
                    }`}
                  onClick={() => handleQuestionClick(question.number)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuestionClick(question.number)}
                >
                  {/* Add check icon for completed questions */}
                  {isCorrect && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className={`font-bold mb-2 transition-colors duration-200 ${isCorrect
                    ? 'text-gray-600 group-hover:text-gray-700'
                    : 'text-violet-600 group-hover:text-indigo-600'
                    }`}>
                    {question.id}
                  </div>
                  <p className={`text-sm line-clamp-3 px-2 leading-relaxed ${isCorrect ? 'text-gray-700' : 'text-slate-800'
                    }`}>
                    {question.text}
                  </p>
                </div>
              );
            })}

            {/* Placeholder for locked questions */}
            {questions.length < totalQuestions && Array.from({ length: totalQuestions - questions.length }).map((_, index) => (
              <div key={`placeholder-${index}`} className="bg-slate-200/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-300/30 flex flex-col justify-center items-center h-32 text-center opacity-60">
                <div className="font-bold text-slate-500 mb-2">
                  {`Q${questions.length + index + 1}`}
                </div>
                <p className="text-slate-500 text-sm">(Locked)</p>
              </div>
            ))}

          </div>
        </div>
        {/* Leaderboard Section - Only show for admin */}
        {isAdmin && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
              <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bảng thành tích
            </h2>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Xem kết quả và thành tích của tất cả người tham gia
            </p>
            <button
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => setShowLeaderboard(true)}
            >
              Xem bảng thành tích
            </button>
          </div>
        )}
        {/* User Submissions Section - Only show for admin and if there are upload questions */}
        {isAdmin && hasUploadQuestions && userSubmissions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
              <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('room.userSubmissions')} ({filteredSubmissions.length})
            </h2>

            {/* Search input */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Image gallery container với scrollbar */}
            <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-gray-100 hover:scrollbar-thumb-violet-400">
              <div className="grid grid-cols-3 gap-2 pr-2">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission, index) => (
                    <div
                      key={index}
                      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                      onClick={() => handleImageClick(submission)}
                    >
                      <img
                        src={submission.submitted_file_url}
                        alt={`Submission by ${submission.fullname}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Overlay with user name */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end">
                        <div className="p-2 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {submission.fullname}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm">No submissions found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Show search results info */}
            {searchTerm && (
              <div className="mt-3 text-center text-sm text-slate-500">
                {filteredSubmissions.length > 0 ? (
                  `Found ${filteredSubmissions.length} submission${filteredSubmissions.length > 1 ? 's' : ''} matching "${searchTerm}"`
                ) : (
                  `No submissions found for "${searchTerm}"`
                )}
              </div>
            )}
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-auto">
              <ReportForm
                roomId={roomId}
                username={roomInfo.hostUsername}
                onClose={() => setShowReportModal(false)}
                reporter={username}
              />
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={closeImageModal}>
            <div className="relative max-w-4xl max-h-full overflow-auto scrollbar-hide">
              <button
                className="absolute top-4 right-4 text-white text-2xl font-bold z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={closeImageModal}
              >
                ×
              </button>
              <img
                src={selectedImage.submitted_file_url}
                alt={`Submission by ${selectedImage.fullname}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* User info cố định ở viewport, không scroll theo ảnh */}
            <div className="fixed bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg z-[61] backdrop-blur-sm">
              <p className="font-semibold">{selectedImage.fullname}</p>
              {/* <p className="text-sm text-gray-300">User ID: {selectedImage.user_id}</p> */}
            </div>
          </div>
        )}
        {/* User Reward Modal */}
        {showUserReward && (
          <UserRewardView
            className="z-[51] m-5"
            username={username}
            room_id={roomId}
            room_title={roomInfo.title}
            voucher={voucher}
            progress={progressAll}
            onClose={() => setShowUserReward(false)}
          />
        )}

        {/* QR Code Section với modern design */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mx-auto mb-6 w-full max-w-sm">
          <div className="flex-shrink-0 relative group" onClick={() => { handleQrCodeClick() }}>
            <QRCode
              className="w-20 h-20 rounded-xl shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-105"
              value={window.location.href}
              size={150}
            />
          </div>
          <div className="flex-grow ml-4">
            <p className="text-slate-800 font-semibold text-sm mb-1 flex items-center">
              {t('room.shareThisQuiz')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </p>
            <p className="text-slate-500 text-xs mb-3">
              {t('room.scanQRCode')}
            </p>
            <button
              className="text-sm w-full bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 py-2 px-3 rounded-xl font-semibold hover:from-violet-200 hover:to-indigo-200 transition-all duration-200 hover:scale-[1.02]"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert(t('room.copiedToClipboard'));
              }}
            >
              {t('room.copyLink')}
            </button>
          </div>
        </div>
        {/* Leaderboard Modal */}
        <Leaderboard
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          roomId={roomId}
          apiUrl={apiUrl}
          isAdmin={isAdmin}
        />
        {/* QR Code popup với glassmorphism */}
        {isQrCodeClicked && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-[51] cursor-pointer" onClick={() => setIsQrCodeClicked(false)}>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">{t('room.qrCode')}</h2>
              <QRCode value={window.location.href} size={256} className="rounded-xl" />
            </div>
          </div>
        )}

        {/* Delete Room Button for Admin với gradient */}
        {isAdmin && (
          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:scale-[1.02]"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this room?")) {
                  fetch(`${apiUrl}/user/delete/room/${roomId}/${username}`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  })
                    .then(response => {
                      if (response.ok) {
                        alert("Room deleted successfully");
                        navigate('/dashboard');
                      } else {
                        alert("Failed to delete room");
                      }
                    })
                    .catch(err => console.error("Error deleting room:", err));
                }
              }}
            >
              {t('room.deleteRoom')}
            </button>
          </div>
        )}
      </div>
      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSave={handleLocationSave}
          roomId={roomId}
          username={username}
          apiUrl={apiUrl}
        />
      )}
      {showViewLocationModal && (
        <ViewLocationModal
          isOpen={showViewLocationModal}
          onClose={() => setShowViewLocationModal(false)}
          roomInfo={roomInfo}
        />
      )}
      {/* Footer Navigation với glassmorphism */}
      <div className="fixed w-full max-w-md bottom-0 z-50">
        <div className="bg-white/90 backdrop-blur-lg border-t border-white/20">
          <NavigationComponent />
        </div>
      </div>
    </div>
  );
}

export default QuizRoom;