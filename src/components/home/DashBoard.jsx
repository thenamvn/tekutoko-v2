import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavigationComponent from "../NavigationBar/NavigationBar";

const DashBoard = () => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [hostRooms, setHostRooms] = useState([]);
    const [joinedRooms, setJoinedRooms] = useState([]);

    const handleCreateGame = () => {
        navigate("/create-room");
    };

    const handleJoinGameByCode = async () => {
        const roomCode = document.getElementById("room-code")?.value;
        if (!roomCode || roomCode.trim() === "") {
            alert(t("dashboard.enterRoomCodePlaceholder", "Please enter a room code."));
            return;
        }
        setLoading(true);
        try {
            const username = localStorage.getItem("username");
            const response = await fetch(`${apiUrl}/joinroom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id: roomCode, username: username })
            });

            if (response.ok) {
                navigate(`/quiz/room/${roomCode}`);
            } else {
                const errorData = await response.json();
                alert(t("dashboard.joinError", `Failed to join room: ${errorData.error || response.statusText}`));
            }
        } catch (error) {
            console.error(t("dashboard.errorJoiningRoom"), error);
            alert(t("dashboard.errorJoiningRoom", "An error occurred while trying to join the room."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const username = localStorage.getItem("username");
        if (!username) {
            navigate("/login");
            return;
        }

        setLoading(true);
        fetch(`${apiUrl}/room/${username}`)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then((data) => {
                const allUserRooms = Array.isArray(data) ? data : (Array.isArray(data.rooms) ? data.rooms : []);

                const hosted = allUserRooms.filter(
                    (room) => room.admin_username === username || room.role === "hostedroom"
                );
                const joined = allUserRooms.filter(
                    (room) => room.admin_username !== username && room.role !== "hostedroom"
                );

                setHostRooms(hosted);
                setJoinedRooms(joined);
            })
            .catch((error) => {
                console.error(t("dashboard.errorFetchingRooms"), error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [apiUrl, t, navigate]);

    const handleRoomCardClick = (roomId) => {
        navigate(`/quiz/room/${roomId}`);
    };

    const renderMobileLayout = () => (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            {/* Loading Overlay với glassmorphism */}
            {loading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-600 font-medium">Loading...</p>
                    </div>
                </div>
            )}

            {/* Header với gradient */}
            <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
                <h1 className="text-xl font-bold text-white">
                    {t("dashboard.title")}
                </h1>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 pb-20">
                {/* Form Join Room by Code với modern design */}
                <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {t("dashboard.joinWithCode")}
                    </h2>
                    <div className="flex items-center w-full gap-3">
                        <input
                            type="text"
                            id="room-code"
                            placeholder={t("dashboard.joinCodePlaceholder")}
                            className="flex-1 px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-lg"
                        />
                        <button
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                            onClick={handleJoinGameByCode}
                        >
                            {t("dashboard.joinButton")}
                        </button>
                    </div>
                </div>

                {/* Grid layout cho các phòng */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Card Tạo phòng mới với modern design */}
                    <div
                        className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-dashed border-violet-300 cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center aspect-square hover:scale-[1.02] hover:bg-white/90"
                        onClick={handleCreateGame}
                        title={t("dashboard.createGameButton", "Create New Game")}
                    >
                        <div className="p-4 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full mb-3 group-hover:from-violet-200 group-hover:to-indigo-200 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-violet-600 transition-colors duration-200">
                            {t("dashboard.createRoom", "Create New")}
                        </p>
                    </div>

                    {/* Danh sách các phòng đã tạo (Hosted Rooms) */}
                    {hostRooms.map((room) => (
                        <div
                            key={`host-${room.room_id}`}
                            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col aspect-square hover:scale-[1.02] hover:bg-white/90"
                            onClick={() => handleRoomCardClick(room.room_id)}
                        >
                            <div className="relative w-full h-3/5 overflow-hidden">
                                <img
                                    src={room.thumbnail || room.avatarImage || "https://via.placeholder.com/300x200.png?text=Room"}
                                    alt={room.room_title || "Room Thumbnail"}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-2 left-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800">
                                        {t("dashboard.host")}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="p-3 flex-grow flex flex-col justify-center">
                                <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-600 transition-colors duration-200">
                                    {room.room_title || room.room_id}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{t("dashboard.hostedByYou")}</p>
                            </div>
                        </div>
                    ))}

                    {/* Danh sách các phòng đã tham gia (Joined Rooms) */}
                    {joinedRooms.map((room) => (
                        <div
                            key={`joined-${room.room_id}`}
                            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col aspect-square hover:scale-[1.02] hover:bg-white/90"
                            onClick={() => handleRoomCardClick(room.room_id)}
                        >
                            <div className="relative w-full h-3/5 overflow-hidden">
                                <img
                                    src={room.thumbnail || room.avatarImage || "https://via.placeholder.com/300x200.png?text=Room"}
                                    alt={room.room_title || "Room Thumbnail"}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-2 left-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                                        {t("dashboard.joined")}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="p-3 flex-grow flex flex-col justify-center">
                                <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-600 transition-colors duration-200">
                                    {room.room_title || room.room_id}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{t("dashboard.joinedByYou")}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hiển thị nếu không có phòng nào */}
                {hostRooms.length === 0 && joinedRooms.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-medium">
                            {t("dashboard.noRooms")}
                        </p>
                        <p className="text-slate-400 text-sm mt-2">
                            {t("dashboard.noRoomsYet")}
                        </p>
                    </div>
                )}
            </main>

            {/* Bottom Navigation với glassmorphism */}
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <div className="">
                    <NavigationComponent />
                </div>
            </div>
        </div>
    );

    return renderMobileLayout();
};

export default DashBoard;