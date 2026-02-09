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
    const [testRooms, setTestRooms] = useState([]);
    const [showCreateOptions, setShowCreateOptions] = useState(false);
    const [roomFilter, setRoomFilter] = useState('all'); // 'all', 'hosted', 'joined', 'tests'
    const [searchQuery, setSearchQuery] = useState(''); // Search filter
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, room: null });

    const handleCreateGame = () => {
        setShowCreateOptions(true);
    };

    const handleSelectRoomGame = () => {
        setShowCreateOptions(false);
        navigate("/create-room");
    };

    const handleSelectTestOnline = () => {
        setShowCreateOptions(false);
        navigate("/create-test");
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
                // Parse response data structure
                setHostRooms(data.hostedRooms || []);
                setJoinedRooms(data.joinedRooms || []);
                setTestRooms(data.testRooms || []);
            })
            .catch((error) => {
                console.error(t("dashboard.errorFetchingRooms"), error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [apiUrl, t, navigate]);

    const handleRoomCardClick = (room) => {
        // Navigate to test room if it's a test_exam type
        if (room.room_type === 'test_exam') {
            navigate(`/test/${room.room_id}`);
        } else {
            navigate(`/quiz/room/${room.room_id}`);
        }
    };

    // Handle right-click context menu
    const handleContextMenu = (e, room) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            room: room
        });
    };

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.visible) {
                setContextMenu({ visible: false, x: 0, y: 0, room: null });
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu.visible]);

    // Handle delete room
    const handleDeleteRoom = async (room) => {
        const username = localStorage.getItem("username");
        
        // Check if this is a joined room (cannot delete)
        const isJoined = joinedRooms.some(r => r.room_id === room.room_id);
        if (isJoined) {
            alert(t("dashboard.cannotDeleteJoined", "You cannot delete rooms you've joined. Only the host can delete."));
            setContextMenu({ visible: false, x: 0, y: 0, room: null });
            return;
        }

        // Confirm deletion
        const confirmMsg = room.room_type === 'test_exam' 
            ? t("dashboard.confirmDeleteTest", `Are you sure you want to delete test "${room.room_title}"?`)
            : t("dashboard.confirmDeleteRoom", `Are you sure you want to delete room "${room.room_title}"?`);
        
        if (!window.confirm(confirmMsg)) {
            setContextMenu({ visible: false, x: 0, y: 0, room: null });
            return;
        }

        setLoading(true);
        try {
            let deleteEndpoint = '';
            
            if (room.room_type === 'test_exam') {
                // Delete test exam
                deleteEndpoint = `${apiUrl}/user/delete/room/${room.room_id}/${username}`;
            } else {
                // Delete hosted room
                deleteEndpoint = `${apiUrl}/user/delete/test/${room.room_id}/${username}`;
            }

            const response = await fetch(deleteEndpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Remove from local state
                if (room.room_type === 'test_exam') {
                    setTestRooms(testRooms.filter(r => r.room_id !== room.room_id));
                } else {
                    setHostRooms(hostRooms.filter(r => r.room_id !== room.room_id));
                }
                alert(t("dashboard.deleteSuccess", "Room deleted successfully"));
            } else {
                const errorData = await response.json();
                alert(t("dashboard.deleteError", `Failed to delete: ${errorData.error || response.statusText}`));
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            alert(t("dashboard.deleteError", "An error occurred while deleting the room"));
        } finally {
            setLoading(false);
            setContextMenu({ visible: false, x: 0, y: 0, room: null });
        }
    };

    // Handle open room from context menu
    const handleOpenRoom = (room) => {
        setContextMenu({ visible: false, x: 0, y: 0, room: null });
        handleRoomCardClick(room);
    };

    // Filter rooms based on selected filter and search query
    const getFilteredRooms = () => {
        let rooms = [];
        switch (roomFilter) {
            case 'hosted':
                rooms = hostRooms.filter(room => room.room_type !== 'test_exam');
                break;
            case 'joined':
                rooms = joinedRooms;
                break;
            case 'tests':
                rooms = testRooms;
                break;
            default:
                // 'all' shows everything: hosted rooms, joined rooms, and test rooms
                rooms = [...hostRooms, ...joinedRooms, ...testRooms];
        }

        // Apply search filter if query exists
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            rooms = rooms.filter(room => 
                (room.room_title && room.room_title.toLowerCase().includes(query)) ||
                (room.room_id && room.room_id.toLowerCase().includes(query)) ||
                (room.description && room.description.toLowerCase().includes(query))
            );
        }

        return rooms;
    };

    const filteredRooms = getFilteredRooms();

    // Get room type badge
    const getRoomTypeBadge = (room) => {
        if (room.room_type === 'test_exam') {
            return {
                text: t("dashboard.testExam", "Test"),
                classes: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800'
            };
        }
        const isHosted = hostRooms.some(r => r.room_id === room.room_id);
        if (isHosted) {
            return {
                text: t("dashboard.host"),
                classes: 'bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800'
            };
        }
        return {
            text: t("dashboard.joined"),
            classes: 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800'
        };
    };

    const renderMobileLayout = () => (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 max-w-md mx-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            {/* Context Menu */}
            {contextMenu.visible && contextMenu.room && (
                <div 
                    className="fixed bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 py-2 z-[2000] min-w-[160px]"
                    style={{ 
                        left: `${contextMenu.x}px`, 
                        top: `${contextMenu.y}px`,
                        transform: 'translate(-50%, -10px)'
                    }}
                >
                    <button
                        onClick={() => handleOpenRoom(contextMenu.room)}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-violet-50 transition-colors duration-150 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {t("dashboard.openRoom", "Open")}
                    </button>
                    
                    {/* Show delete only for hosted and test rooms, not joined */}
                    {!joinedRooms.some(r => r.room_id === contextMenu.room.room_id) && (
                        <button
                            onClick={() => handleDeleteRoom(contextMenu.room)}
                            className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {t("dashboard.deleteRoom", "Delete")}
                        </button>
                    )}
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-3"></div>
                        <p className="text-sm text-slate-600 font-medium">{t("dashboard.loading")}</p>
                    </div>
                </div>
            )}

            {/* Modal for Create Options */}
            {showCreateOptions && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-sm w-full border border-white/30">
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white rounded-t-2xl">
                            <h2 className="text-xl font-bold text-center">{t("dashboard.createOptionsTitle")}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <button
                                onClick={handleSelectRoomGame}
                                className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            >
                                🏠 {t("dashboard.createRoomOption")}
                            </button>
                            <button
                                onClick={handleSelectTestOnline}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            >
                                📝 {t("dashboard.createTestOption")}
                            </button>
                            <button
                                onClick={() => setShowCreateOptions(false)}
                                className="w-full bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white py-2 px-4 rounded-xl font-medium shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            >
                                {t("dashboard.cancel")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg">
                <h1 className="text-xl font-bold text-white">
                    {t("dashboard.title")}
                </h1>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 pb-20">
                {/* Join Room by Code */}
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

                {/* Room Filter Section */}
                <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {t("dashboard.filterRooms")}
                    </h3>
                    
                    {/* Search Input */}
                    <div className="mb-3 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("dashboard.searchRooms", "Search rooms...")}
                            className="w-full pl-10 pr-4 py-2 bg-white/70 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm placeholder-slate-400 shadow-md transition-all duration-200 hover:bg-white/90"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setRoomFilter('all')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] ${
                                roomFilter === 'all'
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                                    : 'bg-white/70 text-slate-600 hover:bg-white/90'
                            }`}
                        >
                            {t("dashboard.filterAll")} ({hostRooms.length + joinedRooms.length + testRooms.length})
                        </button>
                        <button
                            onClick={() => setRoomFilter('hosted')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] ${
                                roomFilter === 'hosted'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                    : 'bg-white/70 text-slate-600 hover:bg-white/90'
                            }`}
                        >
                            {t("dashboard.filterHosted")} ({hostRooms.filter(r => r.room_type !== 'test_exam').length})
                        </button>
                        <button
                            onClick={() => setRoomFilter('joined')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] ${
                                roomFilter === 'joined'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                    : 'bg-white/70 text-slate-600 hover:bg-white/90'
                            }`}
                        >
                            {t("dashboard.filterJoined")} ({joinedRooms.length})
                        </button>
                        <button
                            onClick={() => setRoomFilter('tests')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] ${
                                roomFilter === 'tests'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                                    : 'bg-white/70 text-slate-600 hover:bg-white/90'
                            }`}
                        >
                            {t("dashboard.filterTests", "Tests")} ({testRooms.length})
                        </button>
                    </div>
                </div>

                {/* Grid layout - Scrollable Container */}
                <div className="max-h-[calc(100vh-450px)] overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-transparent hover:scrollbar-thumb-violet-400">
                    <div className="grid grid-cols-2 gap-4 pb-2">
                        {/* Create Room Card */}
                        {(roomFilter === 'all' || roomFilter === 'hosted') && (
                        <div
                            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-dashed border-violet-300 cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center aspect-square hover:scale-[1.02] hover:bg-white/90"
                            onClick={handleCreateGame}
                            title={t("dashboard.createGameButton")}
                        >
                            <div className="p-4 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full mb-3 group-hover:from-violet-200 group-hover:to-indigo-200 transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 group-hover:text-violet-600 transition-colors duration-200">
                                {t("dashboard.createRoom")}
                            </p>
                        </div>
                    )}

                    {/* Render filtered rooms */}
                    {filteredRooms.map((room) => {
                        const badge = getRoomTypeBadge(room);
                        const thumbnailUrl = room.thumbnail || room.avatarImage || "https://via.placeholder.com/300x200.png?text=Room";
                        
                        return (
                            <div
                                key={`room-${room.room_id}`}
                                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col aspect-square hover:scale-[1.02] hover:bg-white/90"
                                onClick={() => handleRoomCardClick(room)}
                                onContextMenu={(e) => handleContextMenu(e, room)}
                            >
                                <div className="relative w-full h-3/5 overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100">
                                    <img
                                        src={thumbnailUrl}
                                        alt={room.room_title || "Room"}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x200.png?text=Room";
                                        }}
                                    />
                                    <div className="absolute top-2 left-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.classes}`}>
                                            {badge.text}
                                        </span>
                                    </div>
                                    {room.room_type === 'test_exam' && (
                                        <div className="absolute top-2 right-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-700">
                                                📝
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-3 flex-grow flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-600 transition-colors duration-200">
                                        {room.room_title || room.room_id}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 truncate">
                                        {room.room_type === 'test_exam' 
                                            ? t("dashboard.testExam", "Test Exam")
                                            : badge.text
                                        }
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>

                {/* Empty State */}
                {filteredRooms.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-medium">
                            {roomFilter === 'hosted' && t("dashboard.noHostedRooms")}
                            {roomFilter === 'joined' && t("dashboard.noJoinedRooms")}
                            {roomFilter === 'tests' && t("dashboard.noTests", "No tests yet")}
                            {roomFilter === 'all' && t("dashboard.noRooms")}
                        </p>
                        <p className="text-slate-400 text-sm mt-2">
                            {roomFilter === 'hosted' && t("dashboard.noHostedRoomsDesc")}
                            {roomFilter === 'joined' && t("dashboard.noJoinedRoomsDesc")}
                            {roomFilter === 'tests' && t("dashboard.noTestsDesc", "Create a test to get started")}
                            {roomFilter === 'all' && t("dashboard.noRoomsYet")}
                        </p>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <div className="fixed w-full max-w-md bottom-0 z-50">
                <NavigationComponent />
            </div>
        </div>
    );

    return renderMobileLayout();
};

export default DashBoard;