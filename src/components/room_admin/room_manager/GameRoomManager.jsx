import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Search, Trash2, ChevronLeft, ChevronRight,
  Filter, RefreshCw, Users, ExternalLink,
  AlertTriangle, Eye, Settings
} from 'lucide-react';
import Navigation from '../dashboardadmin/negative';

const GameRoomManager = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const roomsPerPage = 10;

  const fetchRooms = async (page = currentPage, limit = roomsPerPage) => {
    setFetchLoading(true);
    try {
      const url = new URL(`${apiUrl}/admin/roommanager`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }
      
      if (filterOption !== 'all') {
        url.searchParams.append('filter', filterOption);
        if (filterOption === 'over_max') {
          url.searchParams.append('maxPlayers', maxPlayers);
        }
      }

      const response = await fetch(url.toString());
      const data = await response.json();
      setRooms(data.rooms);
      setTotalRooms(data.total);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchRooms(1);
  }, [searchTerm, filterOption, maxPlayers]);

  useEffect(() => {
    fetchRooms(currentPage);
  }, [currentPage]);

  const handleDelete = async (roomId) => {
    setLoading(prevLoading => ({ ...prevLoading, [roomId]: true }));
    try {
      const response = await fetch(`${apiUrl}/delete/room/${roomId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedRooms = rooms.filter(room => room.room_id !== roomId);
        setRooms(updatedRooms);
        setTotalRooms(totalRooms - 1);
        setConfirmDelete(null);
      } else {
        console.error('Failed to delete the room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    } finally {
      setLoading(prevLoading => ({ ...prevLoading, [roomId]: false }));
    }
  };

  const handleFilterChange = (value) => {
    setFilterOption(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRooms / roomsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    const halfMaxPageButtons = Math.floor(maxPageButtons / 2);

    let startPage = currentPage - halfMaxPageButtons;
    let endPage = currentPage + halfMaxPageButtons;

    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(totalPages, maxPageButtons);
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * roomsPerPage) + 1} to {Math.min(currentPage * roomsPerPage, totalRooms)} of {totalRooms} rooms
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                currentPage === number
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const ConfirmDialog = ({ room, onConfirm, onCancel }) => (
    <AnimatePresence>
      {room && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Room</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete room <strong>"{room.room_title}"</strong>? 
                This will permanently remove the room and all its data.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(room.room_id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Room
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    Game Room Manager
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage and monitor all game rooms
                  </p>
                </div>
                
                <button
                  onClick={() => fetchRooms(currentPage)}
                  disabled={fetchLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${fetchLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {rooms.filter(r => r.room_members > 0).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Eye className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Empty Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {rooms.filter(r => r.room_members === 0).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Private Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {rooms.filter(r => r.room_type === 'private').length}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="xl:col-span-1"
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5" />
                    Room Filters
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Rooms' },
                          { value: 'empty', label: 'Empty Rooms' },
                          { value: 'over_max', label: 'Popular Rooms' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value={option.value}
                              checked={filterOption === option.value}
                              onChange={() => handleFilterChange(option.value)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {filterOption === 'over_max' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Members
                        </label>
                        <input
                          type="number"
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Room List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="xl:col-span-3"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Room List ({rooms.length})
                      </h3>
                      
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search rooms..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {fetchLoading ? (
                    <div className="p-12 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading rooms...</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Room Info
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Owner
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Members
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {rooms.map((room, index) => (
                              <motion.tr
                                key={room.room_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">#{room.room_id}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 mt-1">{room.room_title}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {room.admin_fullname?.charAt(0)?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{room.admin_fullname}</div>
                                      <div className="text-xs text-gray-500">@{room.room_owner}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{room.room_members}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    room.room_type === 'private'
                                      ? 'bg-purple-100 text-purple-800'
                                      : room.room_members > 0
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {room.room_type === 'private' ? 'Private' : room.room_members > 0 ? 'Active' : 'Empty'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => window.open(`/quiz/room/${room.room_id}`, '_blank')}
                                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                      title="View Room"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </button>
                                    
                                    <button
                                      onClick={() => setConfirmDelete(room)}
                                      disabled={loading[room.room_id]}
                                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                      title="Delete Room"
                                    >
                                      {loading[room.room_id] ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {rooms.length === 0 && !fetchLoading && (
                          <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
                            <p className="text-gray-600">
                              No rooms match your current filter criteria.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {rooms.length > 0 && renderPagination()}
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        room={confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default GameRoomManager;