import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Eye, Ban, Trash2, X, AlertTriangle, 
  RefreshCw, ExternalLink, User, Calendar,
  CheckCircle, XCircle, Shield
} from 'lucide-react';
import Navigation from '../dashboardadmin/negative';

const ReportManager = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch reports from the API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/admin/reports`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token_admin')}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error('There was an error fetching the reports!', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const setActionLoadingState = (key, value) => {
    setActionLoading(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteUser = async (username) => {
    try {
      const response = await fetch(`${apiUrl}/delete/user/${username}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('User deleted successfully');
      } else {
        console.error('Failed to delete the user');
      }
    } catch (error) {
      console.error('There was an error deleting the user!', error);
    }
  };

  const handleBanUser = async (username) => {
    const loadingKey = `ban_${username}`;
    try {
      setActionLoadingState(loadingKey, true);
      
      await handleDeleteUser(username);

      const response = await fetch(`${apiUrl}/ban/user/${username}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to ban the user');
      }

      const reportToRemove = reports.find(report => report.username === username);
      if (reportToRemove) {
        await handleRemove(reportToRemove.id);
      }
      
      setReports(reports.filter(report => report.username !== username));
      setConfirmAction(null);
      console.log('User banned successfully');
    } catch (error) {
      console.error('There was an error deleting and banning the user!', error);
    } finally {
      setActionLoadingState(loadingKey, false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const loadingKey = `delete_room_${roomId}`;
    try {
      setActionLoadingState(loadingKey, true);
      
      const response = await fetch(`${apiUrl}/delete/room/${roomId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const reportToRemove = reports.find(report => report.room_id === roomId);
        if (reportToRemove) {
          await handleRemove(reportToRemove.id);
        }
        setReports(reports.filter(report => report.room_id !== roomId));
        setConfirmAction(null);
        console.log('Room deleted successfully');
      } else {
        console.error('Failed to delete the room');
      }
    } catch (error) {
      console.error('There was an error deleting the room!', error);
    } finally {
      setActionLoadingState(loadingKey, false);
    }
  };

  const handleRemove = async (reportId) => {
    const loadingKey = `remove_${reportId}`;
    try {
      setActionLoadingState(loadingKey, true);
      
      const response = await fetch(`${apiUrl}/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token_admin')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete the report');
      }
      
      setReports(reports.filter(report => report.id !== reportId));
      setConfirmAction(null);
      console.log('Removed report:', reportId);
    } catch (error) {
      console.error('Error removing report:', error);
    } finally {
      setActionLoadingState(loadingKey, false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'host') return report.role === 'host';
    if (filter === 'player') return report.role === 'player';
    return true;
  });

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
                  {action.type === 'ban' ? 'Ban User' : action.type === 'delete_room' ? 'Delete Room' : 'Remove Report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

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
                    <Shield className="w-8 h-8 text-purple-600" />
                    Report Manager
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage user reports and take necessary actions
                  </p>
                </div>
                
                <button
                  onClick={fetchReports}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Host Reports</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reports.filter(r => r.role === 'host').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Player Reports</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reports.filter(r => r.role === 'player').length}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All Reports' },
                  { key: 'host', label: 'Host Reports' },
                  { key: 'player', label: 'Player Reports' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Reports Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Report List ({filteredReports.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">#{report.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {report.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{report.username}</div>
                              <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                report.role === 'host' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {report.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{report.room_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900">{report.reason}</div>
                            {report.additional_info && (
                              <div className="text-sm text-gray-500 mt-1 truncate">
                                {report.additional_info}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {/* View Room */}
                            <button
                              onClick={() => window.open(`/quiz/room/${report.room_id}`, '_blank')}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Room"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>

                            {/* Ban User */}
                            <button
                              onClick={() => setConfirmAction({
                                type: 'ban',
                                message: `Are you sure you want to ban user "${report.username}"? This will delete their account and prevent them from creating new accounts.`,
                                action: () => handleBanUser(report.username)
                              })}
                              disabled={actionLoading[`ban_${report.username}`]}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Ban User"
                            >
                              {actionLoading[`ban_${report.username}`] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete Room (only for hosts) */}
                            {report.role === 'host' && (
                              <button
                                onClick={() => setConfirmAction({
                                  type: 'delete_room',
                                  message: `Are you sure you want to delete room "${report.room_id}"? This will permanently remove the room and all its data.`,
                                  action: () => handleDeleteRoom(report.room_id)
                                })}
                                disabled={actionLoading[`delete_room_${report.room_id}`]}
                                className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Room"
                              >
                                {actionLoading[`delete_room_${report.room_id}`] ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}

                            {/* Remove Report */}
                            <button
                              onClick={() => setConfirmAction({
                                type: 'remove',
                                message: `Are you sure you want to remove this report? This action cannot be undone.`,
                                action: () => handleRemove(report.id)
                              })}
                              disabled={actionLoading[`remove_${report.id}`]}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Remove Report"
                            >
                              {actionLoading[`remove_${report.id}`] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredReports.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-gray-600">
                      {filter === 'all' 
                        ? "Great! There are no reports to review." 
                        : `No ${filter} reports found.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
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

export default ReportManager;