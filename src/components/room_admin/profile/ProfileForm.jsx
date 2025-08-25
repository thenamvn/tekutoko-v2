import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Lock, Eye, EyeOff, Shield, CheckCircle, 
  AlertCircle, ArrowLeft, Key
} from 'lucide-react';
import Navigation from '../dashboardadmin/negative';

const ProfileForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const admin_username = localStorage.getItem('admin_username');

    try {
      // Verify current password
      const infoResponse = await fetch(`${apiUrl}/admin/getinfo/${admin_username}`);
      if (!infoResponse.ok) {
        throw new Error('Failed to verify current password');
      }
      
      const userData = await infoResponse.json();
      
      if (userData.password !== formData.currentPassword) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      // Update password
      const updateResponse = await fetch(`${apiUrl}/admin/update/${admin_username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token_admin')
        },
        body: JSON.stringify({ password: formData.newPassword })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update password');
      }

      // Success - show notification and redirect
      alert('Password updated successfully! Please login again.');
      localStorage.removeItem('admin_username');
      localStorage.removeItem('token_admin');
      navigate('/admin');

    } catch (error) {
      console.error('Error updating password:', error);
      setErrors({ general: 'Failed to update password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ 
    name, 
    type, 
    label, 
    placeholder, 
    icon: Icon, 
    showPassword, 
    onTogglePassword 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pl-11 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        {type === 'password' && (
          <button
            type="button"
            onClick={() => onTogglePassword(name)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {errors[name] && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {errors[name]}
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16"> {/* Account for fixed navigation */}
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900">
                Update Password
              </h2>
              <p className="mt-2 text-gray-600">
                Change your admin account password
              </p>
            </div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
              {/* Back Button */}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>

              {/* General Error */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{errors.general}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <InputField
                  name="currentPassword"
                  type="password"
                  label="Current Password"
                  placeholder="Enter your current password"
                  icon={Key}
                  showPassword={showPasswords.current}
                  onTogglePassword={() => togglePasswordVisibility('current')}
                />

                {/* New Password */}
                <InputField
                  name="newPassword"
                  type="password"
                  label="New Password"
                  placeholder="Enter your new password"
                  icon={Lock}
                  showPassword={showPasswords.new}
                  onTogglePassword={() => togglePasswordVisibility('new')}
                />

                {/* Confirm Password */}
                <InputField
                  name="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  icon={Lock}
                  showPassword={showPasswords.confirm}
                  onTogglePassword={() => togglePasswordVisibility('confirm')}
                />

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </motion.button>
              </form>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Security Notice</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      After updating your password, you'll be logged out and need to sign in again with your new credentials.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-gray-500">
                Need help? Contact your system administrator
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;