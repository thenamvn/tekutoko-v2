import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../logo/logo";
import NavigationComponent from "../NavigationBar/NavigationBar";

const Discovery = () => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const [rooms, setRooms] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // ✅ THÊM STATE CHO TABS VÀ LOCATION
    const [activeTab, setActiveTab] = useState('popular'); // 'popular', 'nearby', 'search'
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [locationInfo, setLocationInfo] = useState(null); // ✅ THÊM STATE CHO LOCATION INFO

    const observer = useRef();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [scrollPosition, setScrollPosition] = useState(0);

    // ✅ HÀM REVERSE GEOCODE VỚI NOMINATIM
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'TekutokoApp/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to reverse geocode');
            }

            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                return {
                    city: addr.city || addr.city_district || addr.town || addr.village || '',
                    country: addr.country || '',
                    country_code: addr.country_code ? addr.country_code.toUpperCase() : '',
                    display_name: data.display_name || `${lat}, ${lng}`,
                    full_address: data.address
                };
            }
            return null;
        } catch (error) {
            console.error('Reverse geocode error:', error);
            return null;
        }
    };

    // ✅ HÀM LẤY VỊ TRÍ NGƯỜI DÙNG (CẬP NHẬT)
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(t("discovery.error.gpsNotSupported"));
            return;
        }

        setLoading(true);
        setLocationError(t("discovery.loading"));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // ✅ SET LOCATION TRƯỚC
                setUserLocation({
                    lat: latitude,
                    lng: longitude
                });

                // ✅ SAU ĐÓ REVERSE GEOCODE
                const locationInfo = await reverseGeocode(latitude, longitude);
                if (locationInfo) {
                    setLocationInfo(locationInfo);
                    setLocationError('');
                    // console.log('Location info:', locationInfo);
                } else {
                    setLocationInfo({
                        city: '',
                        country: '',
                        country_code: '',
                        display_name: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                        full_address: null
                    });
                    setLocationError('');
                }
                setLoading(false);
            },
            (error) => {
                setLocationError(t("discovery.error.cannotFindLocation"));
                console.error('Geolocation error:', error);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // Tăng timeout
                maximumAge: 60000
            }
        );
    };

    // ✅ FETCH POPULAR ROOMS (GIỮ NGUYÊN LOGIC CŨ)
    const fetchRooms = async (page, query = "") => {
        setLoading(true);
        try {
            const response = await fetch(
                `${apiUrl}/discovery/rooms?page=${page}&limit=20&query=${query}`
            );
            const data = await response.json();
            setRooms((prevRooms) => (page === 1 ? data.rooms : [...prevRooms, ...data.rooms]));
            setHasMore(data.rooms.length > 0);
        } catch (error) {
            console.error(t("discovery.errorFetchingRooms"), error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ FETCH NEARBY ROOMS (CẬP NHẬT VỚI CITY/COUNTRY FILTER)
    const fetchNearbyRooms = async (page = 1) => {
        if (!userLocation) {
            setLocationError(t("discovery.error.missUserLocation"));
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                lat: userLocation.lat,
                lng: userLocation.lng,
                limit: 20,
                max_distance: 50000, // 50km
                ...(page > 1 && rooms.length > 0 && {
                    last_distance: rooms[rooms.length - 1].distance_m,
                    last_id: rooms[rooms.length - 1].id
                })
            });

            // ✅ THÊM CITY/COUNTRY FILTER TỪ NOMINATIM
            if (locationInfo && locationInfo.city) {
                params.append('city', locationInfo.city);
            }
            if (locationInfo && locationInfo.country_code) {
                params.append('country', locationInfo.country_code);
            }

            // console.log('Nearby search params:', params.toString());

            const response = await fetch(`${apiUrl}/api/room/search/nearby?${params}`);
            const data = await response.json();

            if (response.ok) {
                setRooms((prevRooms) => (page === 1 ? data.data : [...prevRooms, ...data.data]));
                setHasMore(data.pagination.has_more);
                setLocationError('');
            } else {
                setLocationError(data.error || 'Lỗi khi tìm phòng gần đây');
            }
        } catch (error) {
            console.error('Error fetching nearby rooms:', error);
            setLocationError(t("discovery.error.errorConnectionGetNearbyRooms"));
        } finally {
            setLoading(false);
        }
    };

    // ✅ HANDLE TAB CHANGE
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
        setRooms([]);
        setHasMore(true);

        if (tab === 'nearby') {
            if (!userLocation) {
                getCurrentLocation();
            } else {
                fetchNearbyRooms(1);
            }
        } else if (tab === 'popular') {
            fetchRooms(1, '');
        }
        // Search tab chỉ hiển thị khi user gõ search query
    };

    // ✅ AUTO FETCH NEARBY KHI CÓ LOCATION VÀ LOCATION INFO
    useEffect(() => {
        if (userLocation && locationInfo && activeTab === 'nearby') {
            fetchNearbyRooms(1);
        }
    }, [userLocation, locationInfo]);

    // EXISTING EFFECTS
    useEffect(() => {
        if (activeTab === 'popular') {
            fetchRooms(page, searchQuery);
        } else if (activeTab === 'nearby' && userLocation && locationInfo) {
            fetchNearbyRooms(page);
        }
    }, [page]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1);
            if (searchQuery.trim()) {
                setActiveTab('search');
                fetchRooms(1, searchQuery);
            } else if (activeTab === 'search') {
                setActiveTab('popular');
                fetchRooms(1, '');
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        window.scrollTo(0, scrollPosition);
    }, [rooms]);

    const handleScroll = () => {
        setScrollPosition(window.pageYOffset);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const lastRoomElementRef = useCallback(
        (node) => {
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [hasMore, loading]
    );

    const handleRoomClick = (roomId) => {
        navigate(`/quiz/room/${roomId}`);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // ✅ FORMAT DISTANCE CHO NEARBY ROOMS
    const formatDistance = (distanceM) => {
        if (distanceM < 1000) {
            return `${Math.round(distanceM)}m`;
        }
        return `${(distanceM / 1000).toFixed(1)}km`;
    };

    const renderNewLayout = () => (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            {/* Header với gradient hiện đại */}
            <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-3 shadow-lg backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex-shrink-0">
                        <Logo />
                    </div>
                    <div className="flex-grow max-w-[260px] ml-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t("discovery.searchPlaceholder")}
                                className="w-full px-4 py-2.5 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-sm placeholder-slate-400 shadow-lg"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ TABS NAVIGATION */}
                <div className="mt-3 px-4">
                    <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
                        <button
                            onClick={() => handleTabChange('popular')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'popular'
                                ? 'bg-white text-violet-600 shadow-lg'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            🔥 {t("discovery.popular")}
                        </button>
                        <button
                            onClick={() => handleTabChange('nearby')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'nearby'
                                ? 'bg-white text-violet-600 shadow-lg'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            📍 {t("discovery.nearby")}
                            {locationInfo && (
                                <span className="ml-1 text-xs opacity-75">
                                    {locationInfo.city}
                                </span>
                            )}
                        </button>
                        {searchQuery && (
                            <button
                                onClick={() => handleTabChange('search')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'search'
                                    ? 'bg-white text-violet-600 shadow-lg'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                🔍 Search
                            </button>
                        )}
                    </div>
                </div>

                {/* ✅ HIỂN THỊ LOCATION INFO */}
                {activeTab === 'nearby' && locationInfo && (
                    <div className="mt-2 px-4">
                        <div className="text-xs text-white/80 bg-white/10 rounded-lg px-3 py-2">
                            <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">
                                    {locationInfo.city && locationInfo.country
                                        ? `${locationInfo.city}, ${locationInfo.country}`
                                        : locationInfo.display_name
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ✅ LOCATION ERROR/STATUS */}
            {activeTab === 'nearby' && locationError && (
                <div className="mx-4 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L1.732 13.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm text-orange-700 font-medium">{locationError}</p>
                            {!locationError.includes('Đang') && (
                                <button
                                    onClick={getCurrentLocation}
                                    className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium underline"
                                >
                                    {t("discovery.tryAgain", "Try again")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main content với cards hiện đại */}
            <main className="flex-1 overflow-y-auto p-4 pb-20">
                {rooms.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {rooms.map((room, index) => {
                            const roomCard = (
                                <div
                                    key={room.room_id || index}
                                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-white/20 hover:scale-[1.02] hover:bg-white/90"
                                    onClick={() => handleRoomClick(room.room_id)}
                                >
                                    <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                                        <img
                                            src={room.thumbnail || room.avatarImage || "https://via.placeholder.com/300x200.png?text=No+Image"}
                                            alt={room.room_title || "Room Image"}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* ✅ HIỂN THỊ DISTANCE CHO NEARBY */}
                                        {activeTab === 'nearby' && room.distance_m !== undefined && (
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                                📍 {formatDistance(room.distance_m)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-bold text-slate-800 mb-2 truncate group-hover:text-violet-600 transition-colors duration-200">
                                            {room.room_title || t("discovery.untitledRoom", "Untitled Room")}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {room.description}
                                        </p>

                                        {/* ✅ HIỂN THỊ ADMIN INFO CHO NEARBY */}
                                        {activeTab === 'nearby' && room.admin_info && (
                                            <div className="mt-2 flex items-center space-x-2">
                                                <img
                                                    src={room.admin_info.avatar || 'https://via.placeholder.com/24x24.png?text=A'}
                                                    alt={room.admin_info.fullname}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                />
                                                <span className="text-xs text-slate-400 truncate">
                                                    {room.admin_info.fullname}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-800">
                                                {activeTab === 'nearby' ? `${room.city || 'Unknown'}` : 'Active'}
                                            </span>
                                            <svg className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            );

                            if (rooms.length === index + 1) {
                                return (
                                    <div ref={lastRoomElementRef} key={`ref-${room.room_id || index}`}>
                                        {roomCard}
                                    </div>
                                );
                            }
                            return roomCard;
                        })}
                    </div>
                ) : (
                    !loading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 font-medium">
                                {activeTab === 'nearby'
                                    ? `${t("discovery.noMoreGames", "No games found.")}${locationInfo ? ` trong ${locationInfo.city}` : ''}`
                                    : t("discovery.noMoreGames", "No games found.")
                                }
                            </p>
                            {activeTab === 'nearby' && !userLocation && (
                                <button
                                    onClick={getCurrentLocation}
                                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                                >
                                    {t("discovery.enableLocation")}
                                </button>
                            )}
                        </div>
                    )
                )}

                {/* Loading với animation hiện đại */}
                {loading && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                            <p className="text-sm text-slate-600 font-medium">
                                {locationError.includes('Đang') ? locationError :
                                    activeTab === 'nearby' ? t("discovery.loading", "Loading nearby rooms...") : t("discovery.loading", "Loading...")}
                            </p>
                        </div>
                    </div>
                )}

                {!hasMore && rooms.length > 0 && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center space-x-2 text-slate-400">
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                            <span className="text-sm font-medium">{t("discovery.noMoreGames", "No more games")}</span>
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation với glassmorphism */}
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <div className="bg-white/90 backdrop-blur-lg border-t border-white/20">
                    <NavigationComponent />
                </div>
            </div>
        </div>
    );

    return renderNewLayout();
};

export default Discovery;