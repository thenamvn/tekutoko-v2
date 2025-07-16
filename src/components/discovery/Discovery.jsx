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
    const observer = useRef();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [scrollPosition, setScrollPosition] = useState(0);

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

    useEffect(() => {
        fetchRooms(page, searchQuery);
    }, [page]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1);
            fetchRooms(1, searchQuery);
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
            </header>

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
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-bold text-slate-800 mb-2 truncate group-hover:text-violet-600 transition-colors duration-200">
                                            {room.room_title || t("discovery.untitledRoom", "Untitled Room")}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {/* {room.description || t("discovery.noDescription", "No description available.")} */}
                                            {room.description}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-800">
                                                Active
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
                            <p className="text-slate-500 font-medium">{t("discovery.noRoomsFound", "No games found.")}</p>
                        </div>
                    )
                )}

                {/* Loading với animation hiện đại */}
                {loading && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                            <p className="text-sm text-slate-600 font-medium">Loading...</p>
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