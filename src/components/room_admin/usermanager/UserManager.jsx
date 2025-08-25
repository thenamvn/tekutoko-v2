import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, Search, Ban, Trash2, ChevronLeft, ChevronRight,
  Filter, AlertTriangle, RefreshCw, User, UserX, 
  Calendar, BarChart3, Eye
} from 'lucide-react';
import Navigation from '../dashboardadmin/negative';

const UserManager = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterOption, setFilterOption] = useState('all');
  const [minCreatedRooms, setMinCreatedRooms] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const usersPerPage = 10;

  const fetchUsers = async (params) => {
    setFetchLoading(true);
    try {
      const url = new URL(`${apiUrl}/admin/users`);
      Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    
      const response = await fetch(url.toString());
      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      console.error('There was an error fetching the users!', error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: usersPerPage,
      searchTerm,
      filterOption,
      minCreatedRooms,
    };
    fetchUsers(params);
  }, [currentPage, searchTerm, filterOption, minCreatedRooms]);

  const handleDeleteUser = async (username) => {
    setLoading(prevLoading => ({ ...prevLoading, [username]: true }));

    try {
      const response = await fetch(`${apiUrl}/delete/user/${username}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.username !== username));
        setTotalUsers(totalUsers - 1);
        setConfirmAction(null);
      } else {
        console.error('Failed to delete the user');
      }
    } catch (error) {
      console.error('There was an error deleting the user!', error);
    } finally {
      setLoading(prevLoading => ({ ...prevLoading, [username]: false }));
    }
  };

  const handleBanUser = async (username) => {
    setLoading(prevLoading => ({ ...prevLoading, [username]: true }));
    try {
      // Bước 1: Xóa người dùng
      await handleDeleteUser(username);
      
      // Bước 2: Cấm người dùng
      const response = await fetch(`${apiUrl}/ban/user/${username}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to ban the user');
      }
    } catch (error) {
      console.error('There was an error deleting and banning the user!', error);
    } finally {
      setLoading(prevLoading => ({ ...prevLoading, [username]: false }));
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

  const totalPages = Math.ceil(totalUsers / usersPerPage);

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
          Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
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

  const ConfirmDialog = ({ action, onConfirm, onCancel }) => (
    <AnimatePresence>
      {action && (
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
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">{action.message}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {action.type === 'ban' ? 'Ban User' : 'Delete User'}
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
                    <Users className="w-8 h-8 text-purple-600" />
                    User Manager
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage user accounts and monitor activity
                  </p>
                </div>
                
                <button
                  onClick={() => fetchUsers({
                    page: currentPage,
                    limit: usersPerPage,
                    searchTerm,
                    filterOption,
                    minCreatedRooms,
                  })}
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
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.joined_rooms > 0).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Room Creators</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.created_rooms > 0).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.joined_rooms === 0).length}
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
                    User Filters
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Users' },
                          { value: 'over_min', label: 'Active Creators' },
                          { value: 'inactive', label: 'Inactive Users' }
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
                    
                    {filterOption === 'over_min' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Created Rooms
                        </label>
                        <input
                          type="number"
                          value={minCreatedRooms}
                          onChange={(e) => setMinCreatedRooms(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* User List */}
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
                        User List ({users.length})
                      </h3>
                      
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
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
                      <p className="text-gray-600">Loading users...</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Username
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Activity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user, index) => (
                              <motion.tr
                                key={user.username}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold">
                                        {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                        user.joined_rooms > 0 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {user.joined_rooms > 0 ? 'Active' : 'Inactive'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-900">{user.username}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Eye className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm text-gray-600">{user.joined_rooms} joined</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <BarChart3 className="w-4 h-4 text-green-500" />
                                      <span className="text-sm text-gray-600">{user.created_rooms} created</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setConfirmAction({
                                        type: 'delete',
                                        message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
                                        action: () => handleDeleteUser(user.username)
                                      })}
                                      disabled={loading[user.username]}
                                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                      title="Delete User"
                                    >
                                      {loading[user.username] ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                    
                                    <button
                                      onClick={() => setConfirmAction({
                                        type: 'ban',
                                        message: `Are you sure you want to ban user "${user.username}"? This will delete their account and prevent them from creating new accounts.`,
                                        action: () => handleBanUser(user.username)
                                      })}
                                      disabled={loading[user.username]}
                                      className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
                                      title="Ban User"
                                    >
                                      {loading[user.username] ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Ban className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {users.length === 0 && !fetchLoading && (
                          <div className="text-center py-12">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                            <p className="text-gray-600">
                              No users match your current filter criteria.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {users.length > 0 && renderPagination()}
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
        action={confirmAction}
        onConfirm={() => {
          confirmAction.action();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default UserManager;