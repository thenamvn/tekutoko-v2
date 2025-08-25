import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavigationComponent from '../NavigationBar/NavigationBar';
// import { getUsernameFromToken, isTokenValid } from '../../utils/jwt_decode';
import { translateText } from '../../utils/AutoTranslate';
import { useTranslation } from 'react-i18next';

const UserProfileCard = () => {
    const { t } = useTranslation();
    const lang = localStorage.getItem('language') || 'en';
    const { userprofile } = useParams();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [createdRooms, setCreatedRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State mới cho tính năng follow
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const currentUsername = localStorage.getItem('username');
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Ảnh placeholder mặc định
    const defaultBackgroundImage = "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Ftekutoko.services%40gmail.com%2F79a33164-16b6-4712-a5a1-61426a34a43d-blob?alt=media&token=3430d9e9-2090-4030-bc95-2868f8c06e98";
    const defaultAvatarImage = "https://placeholder.co/150.png?text=Avatar";
    const defaultRoomThumbnail = "https://placeholder.co/150/DDEFEF/86A8D9?text=Room";

    const apiUrl = process.env.REACT_APP_API_URL;

    // Hàm chuẩn hóa count values
    const normalizeCount = (count) => {
        if (count === null || count === undefined || count === 'N/A' || count === 'n/a' || isNaN(count)) {
            return 0;
        }
        const numCount = parseInt(count);
        return isNaN(numCount) ? 0 : Math.max(0, numCount);
    };

    useEffect(() => {
        const fetchAllUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch thông tin profile người dùng
                const profileResponse = await fetch(`${apiUrl}/info/userprofile/${userprofile}`);
                if (!profileResponse.ok) {
                    if (profileResponse.status === 404) {
                        alert("User Profile does not exist.");
                        setError("User not found");
                        setUserData(null);
                    } else {
                        throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`);
                    }
                } else {
                    const data = await profileResponse.json();
                    data.description = await(translateText(data.description || '', lang));
                    
                    // Chuẩn hóa follower count và follow count
                    data.followerCount = normalizeCount(data.followerCount);
                    data.followCount = normalizeCount(data.followCount);
                    
                    setUserData(data);
                }

                // 2. Fetch các phòng đã tạo bởi người dùng này
                const roomsResponse = await fetch(`${apiUrl}/user/${userprofile}/hosted-rooms`);
                if (!roomsResponse.ok) {
                    console.warn(`Could not fetch hosted rooms for ${userprofile}: ${roomsResponse.statusText}`);
                    setCreatedRooms([]);
                } else {
                    const roomsData = await roomsResponse.json();
                    setCreatedRooms(Array.isArray(roomsData) ? roomsData : (Array.isArray(roomsData.rooms) ? roomsData.rooms : []));
                }

                // 3. Kiểm tra xem người dùng hiện tại có đang follow người dùng này không
                if (currentUsername) {
                    try {
                        const followStatusResponse = await fetch(`${apiUrl}/follow/status`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                                follower: currentUsername,
                                following: userprofile
                            })
                        });

                        if (followStatusResponse.ok) {
                            const { isFollowing } = await followStatusResponse.json();
                            setIsFollowing(isFollowing);
                        }
                    } catch (err) {
                        console.error("Error checking follow status:", err);
                    }
                }

            } catch (err) {
                console.error("Error fetching user data or rooms:", err);
                setError(err.message || "An error occurred.");
                setUserData(null);
                setCreatedRooms([]);
            } finally {
                setLoading(false);
            }
        };

        if (userprofile) {
            fetchAllUserData();
        }
    }, [userprofile, apiUrl, lang, currentUsername]);

    const handleRoomCardClick = (roomId) => {
        navigate(`/quiz/room/${roomId}`);
    };

    // Hàm xử lý follow/unfollow
    const handleFollowToggle = async () => {
        // Nếu chưa đăng nhập, hiển thị prompt đăng nhập
        if (!currentUsername) {
            setShowLoginPrompt(true);
            return;
        }

        // Không thể follow chính mình
        if (currentUsername === userprofile) {
            return;
        }

        setFollowLoading(true);
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const response = await fetch(`${apiUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    follower: currentUsername,
                    following: userprofile
                })
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);

                // Cập nhật số lượng followers
                if (userData) {
                    // Sử dụng hàm normalizeCount để đảm bảo tính nhất quán
                    const currentFollowerCount = normalizeCount(userData.followerCount);

                    // Tính toán giá trị mới
                    const newFollowerCount = isFollowing
                        ? Math.max(0, currentFollowerCount - 1) // Đảm bảo không âm khi unfollow
                        : currentFollowerCount + 1;

                    setUserData({
                        ...userData,
                        followerCount: newFollowerCount
                    });
                }
            } else {
                console.error("Failed to toggle follow status");
            }
        } catch (err) {
            console.error("Error toggling follow status:", err);
        } finally {
            setFollowLoading(false);
        }
    };

    // Đóng prompt đăng nhập và chuyển hướng tới trang đăng nhập
    const handleLoginRedirect = () => {
        setShowLoginPrompt(false);
        navigate('/login', { state: { returnUrl: `/profile/${userprofile}` } });
    };

    const renderMobileLayout = () => {
        if (loading) {
            return (
                <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)] items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-600 font-medium">Loading profile...</p>
                    </div>
                </div>
            );
        }

        if (error || !userData) {
            return (
                <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)] items-center justify-center p-4">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <p className="text-red-600 text-center mb-4">{error || "Could not load user profile."}</p>
                        <Link 
                            to="/dashboard" 
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            );
        }

        const userLinks = [];
        if (userData.homepage) userLinks.push({ url: userData.homepage, text: userData.homepage.replace(/^https?:\/\//, '') });
        if (userData.twitter) userLinks.push({ url: userData.twitter, text: 'Twitter Profile' });

        return (
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
                <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
                    {/* Cover Image & Avatar Section */}
                    <div className="relative mb-12">
                        <div className="relative overflow-hidden">
                            <img
                                src={userData.backgroundImage || defaultBackgroundImage}
                                alt="Cover"
                                className="w-full h-40 sm:h-48 object-cover"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1 rounded-full shadow-lg border border-white/20">
                                <img
                                    src={userData.avatarImage || defaultAvatarImage}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover rounded-full"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* User Information Section */}
                    <div className="bg-white/80 backdrop-blur-sm mx-4 p-6 rounded-2xl shadow-lg border border-white/20 text-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                            {userData.fullname || userprofile || "User Name"}
                        </h1>
                        <div className="text-sm text-slate-600 mt-2 flex justify-center space-x-6">
                            <div className="text-center">
                                <div className="font-bold text-violet-600">{normalizeCount(userData.followCount)}</div>
                                <div className="text-xs text-slate-500">{t('userProfileCard.following')}</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-violet-600">{normalizeCount(userData.followerCount)}</div>
                                <div className="text-xs text-slate-500">{t('userProfileCard.followers')}</div>
                            </div>
                        </div>

                        {/* Follow Button */}
                        {currentUsername !== userprofile && (
                            <div className="mt-4">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className={`
                                        py-2 px-6 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg hover:scale-[1.02]
                                        ${isFollowing 
                                            ? 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50' 
                                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                                        }
                                        ${followLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {followLoading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Loading...
                                        </span>
                                    ) : (
                                        isFollowing ? t('userProfileCard.following') : t('userProfileCard.follow')
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Introduction Section */}
                    {userData.description && (
                        <div className="bg-white/80 backdrop-blur-sm mx-4 mt-6 p-6 rounded-2xl shadow-lg border border-white/20">
                            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t('userProfileCard.introduction')}
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {userData.description}
                            </p>
                        </div>
                    )}

                    {/* Links Section */}
                    {(userLinks.length > 0) && (
                        <div className="bg-white/80 backdrop-blur-sm mx-4 mt-6 p-6 rounded-2xl shadow-lg border border-white/20">
                            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                {t('userProfileCard.links')}
                            </h2>
                            <div className="space-y-2">
                                {userLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-violet-600 hover:text-violet-700 bg-gradient-to-r from-violet-50 to-indigo-50 p-3 rounded-xl border border-violet-200 hover:border-violet-300 transition-all duration-200 truncate"
                                    >
                                        {link.text}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Created Rooms Section */}
                    <div className="bg-white/80 backdrop-blur-sm mx-4 mt-6 p-6 rounded-2xl shadow-lg border border-white/20">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {t('userProfileCard.createdRooms')}
                        </h2>
                        {createdRooms.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {createdRooms.map((room) => (
                                    <div
                                        key={room.room_id}
                                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col aspect-[3/4]"
                                        onClick={() => handleRoomCardClick(room.room_id)}
                                    >
                                        <div className="w-full h-3/5 sm:h-2/3 bg-gradient-to-br from-slate-100 to-slate-200">
                                            <img
                                                src={room.thumbnail || room.avatarImage || defaultRoomThumbnail}
                                                alt={room.room_title || "Room Thumbnail"}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        <div className="p-3 flex-grow flex flex-col justify-center items-center text-center">
                                            <h3 className="text-xs sm:text-sm font-medium text-violet-700 hover:text-violet-800 truncate w-full">
                                                {room.room_title || room.room_id}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📚</span>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {t('userProfileCard.noCreatedRooms')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Login Prompt Modal */}
                {showLoginPrompt && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 max-w-sm w-full mx-4 relative shadow-xl border border-white/20">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🔐</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Login Required</h3>
                                <p className="text-slate-600 text-sm">Please log in to follow this user.</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowLoginPrompt(false)}
                                    className="flex-1 bg-white border-2 border-slate-300 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleLoginRedirect}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation với glassmorphism */}
                <div className="fixed w-full max-w-md bottom-0 z-50">
                    <div className="">
                        <NavigationComponent />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {renderMobileLayout()}
        </div>
    );
};

export default UserProfileCard;