import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';

const ModernDashboardAdmin = () => {
  const { t } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const [roomData, setRoomData] = useState({});
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [chartType, setChartType] = useState('bar');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch room data
      const roomResponse = await fetch(`${apiUrl}/admin/room/dashboard`);
      if (!roomResponse.ok) {
        throw new Error(`Error fetching room data: ${roomResponse.statusText}`);
      }
      const roomData = await roomResponse.json();
      setRoomData(roomData);

      // Fetch user data
      const userResponse = await fetch(`${apiUrl}/admin/user/dashboard`);
      if (!userResponse.ok) {
        throw new Error(`Error fetching user data: ${userResponse.statusText}`);
      }
      const userData = await userResponse.json();
      setUserData(userData);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every minute
    const intervalId = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  // Prepare chart data
  const roomChartData = roomData.total_rooms ? [
    {
      name: 'Active Rooms',
      value: roomData.total_rooms - roomData.empty_rooms - roomData.private_rooms,
      color: '#10B981'
    },
    {
      name: 'Empty Rooms',
      value: roomData.empty_rooms,
      color: '#6B7280'
    },
    {
      name: 'Private Rooms',
      value: roomData.private_rooms,
      color: '#8B5CF6'
    }
  ] : [];

  const userChartData = userData.total_users ? [
    {
      name: 'Active Users',
      value: userData.active_users,
      color: '#10B981'
    },
    {
      name: 'Inactive Users',
      value: userData.total_users - userData.active_users,
      color: '#6B7280'
    }
  ] : [];

  const barData = [
    {
      category: 'Rooms',
      active: roomData.total_rooms - (roomData.empty_rooms || 0) - (roomData.private_rooms || 0),
      inactive: roomData.empty_rooms || 0,
      private: roomData.private_rooms || 0
    },
    {
      category: 'Users',
      active: userData.active_users || 0,
      inactive: (userData.total_users || 0) - (userData.active_users || 0),
      private: 0
    }
  ];

  if (loading && !roomData.total_rooms) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Rooms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : roomData.total_rooms || 0}</p>
                <p className="text-sm text-gray-500">Total quiz rooms</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : userData.total_users || 0}</p>
                <p className="text-sm text-gray-500">Registered users</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : userData.active_users || 0}</p>
                <p className="text-sm text-gray-500">Currently online</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Active Rooms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Rooms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : (roomData.total_rooms || 0) - (roomData.empty_rooms || 0) - (roomData.private_rooms || 0)}
                </p>
                <p className="text-sm text-gray-500">Rooms with users</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Room Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Room Statistics</h3>
                <p className="text-gray-600 text-sm">Room distribution overview</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === 'bar' 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-lg transition-colors ${
                    chartType === 'pie' 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={roomChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                </PieChart>
              ) : (
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Bar dataKey="active" fill="#10B981" radius={[4, 4, 0, 0]} name="Active" />
                  <Bar dataKey="inactive" fill="#6B7280" radius={[4, 4, 0, 0]} name="Inactive" />
                  <Bar dataKey="private" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Private" />
                </BarChart>
              )}
            </ResponsiveContainer>

            {chartType === 'pie' && roomChartData.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {roomChartData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* User Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
              <p className="text-gray-600 text-sm">User activity breakdown</p>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>

            {userChartData.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {userChartData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Empty Rooms</h4>
            <p className="text-3xl font-bold text-blue-700">{roomData.empty_rooms || 0}</p>
            <p className="text-blue-600 text-sm">Rooms waiting for users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-purple-900 mb-2">Private Rooms</h4>
            <p className="text-3xl font-bold text-purple-700">{roomData.private_rooms || 0}</p>
            <p className="text-purple-600 text-sm">Invitation-only rooms</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-green-900 mb-2">Engagement Rate</h4>
            <p className="text-3xl font-bold text-green-700">
              {userData.total_users ? Math.round((userData.active_users / userData.total_users) * 100) : 0}%
            </p>
            <p className="text-green-600 text-sm">Active vs total users</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ModernDashboardAdmin;