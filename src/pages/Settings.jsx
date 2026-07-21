import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Wallet, Settings as SettingsIcon, AlertCircle, CheckCircle, RefreshCw, User, Lock, Key } from 'lucide-react';

// ✅ Dynamic API URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://hirenova-backend-production-32b1.up.railway.app';
const API_SETTINGS_URL = `${BASE_URL}/api/admin/settings`;
const API_PROFILE_URL = `${BASE_URL}/api/admin/update-profile`;

export default function Settings() {
  // System Settings States
  const [trc20Address, setTrc20Address] = useState('');
  const [minBalance, setMinBalance] = useState('30');

  // Admin Credentials States
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI Feedback States
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Helper function to get Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  // Backend ကနေ Settings များကို ဆွဲယူခြင်း
  const fetchSettings = async () => {
    try {
      setError(null);
      const response = await axios.get(API_SETTINGS_URL, getAuthHeaders());
      const settings = response.data.settings || {};
      setTrc20Address(settings.trc20_address || '');
      setMinBalance(settings.min_task_balance || '30');

      // Admin Token / Info ထဲမှ လက်ရှိ Username ကို ယူယူခြင်း
      const savedAdmin = localStorage.getItem('admin');
      if (savedAdmin) {
        try {
          const adminObj = JSON.parse(savedAdmin);
          if (adminObj.username) setUsername(adminObj.username);
        } catch (e) {
          console.error("Failed to parse admin stored info", e);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Settings & Credentials အားလုံးကို သိမ်းဆည်းခြင်း
  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg('');

      // 1. System Settings ကို Update လုပ်ခြင်း
      await axios.put(
        API_SETTINGS_URL, 
        {
          trc20_address: trc20Address.trim(),
          min_task_balance: minBalance
        }, 
        getAuthHeaders()
      );

      // 2. Username သို့မဟုတ် Password ဖြည့်ထားပါက Admin Profile ကို Update လုပ်ခြင်း
      if (username.trim() || newPassword) {
        if (newPassword && !currentPassword) {
          setError('Current password is required to set a new password.');
          setIsSaving(false);
          return;
        }

        const profileData = {};
        if (username.trim()) profileData.username = username.trim();
        if (newPassword) {
          profileData.currentPassword = currentPassword;
          profileData.newPassword = newPassword;
        }

        const profileRes = await axios.put(API_PROFILE_URL, profileData, getAuthHeaders());

        // Username ပြောင်းသွားပါက LocalStorage တွင်ပါ အသစ်ပြန်ပြင်မည်
        if (username.trim()) {
          const savedAdmin = localStorage.getItem('admin');
          if (savedAdmin) {
            const adminObj = JSON.parse(savedAdmin);
            adminObj.username = username.trim();
            localStorage.setItem('admin', JSON.stringify(adminObj));
          }
        }

        // Form Fields များ ပြန်လည် Reset လုပ်မည်
        setCurrentPassword('');
        setNewPassword('');
      }

      setSuccessMsg('All settings & credentials updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.response?.data?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await fetchSettings();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" /> Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Error & Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" /> {successMsg}
        </div>
      )}

      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          title="Refresh Settings"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ✅ Section 1: Admin Credentials (Username & Password Change) */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <User className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Admin Account Credentials</h3>
            <p className="text-xs text-gray-400">Update your login username and password.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Admin Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                placeholder="Enter new username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Current Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="Required if changing password"
                />
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="Enter new password"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: TRC20 Address */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-primary/20 rounded-lg">
            <Wallet className="h-6 w-6 text-brand-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Top-up TRC20 Address</h3>
            <p className="text-xs text-gray-400">This address will be shown to users when they request a Top-up.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Admin TRC20 Wallet Address</label>
            <input
              type="text"
              value={trc20Address}
              onChange={(e) => setTrc20Address(e.target.value)}
              className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              placeholder="Enter your USDT TRC20 address"
            />
          </div>
          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400">Make sure this is a valid TRC20 (Tron) address. Users will send USDT to this address.</p>
          </div>
        </div>
      </div>

      {/* Section 3: Task Rules */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Task & System Rules</h3>
            <p className="text-xs text-gray-400">Configure the basic rules for user tasks and transactions.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Min Balance to Start Tasks (USDT)</label>
            <input
              type="number"
              value={minBalance}
              onChange={(e) => setMinBalance(e.target.value)}
              className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
            <p className="text-xs text-gray-500 mt-1">Users need at least this amount to start matching tasks.</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveAll}
        disabled={isSaving}
        className="flex items-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white px-6 py-3 rounded-lg transition-colors font-bold shadow-lg shadow-brand-primary/30 disabled:opacity-50"
      >
        <Save className="h-5 w-5" /> {isSaving ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  );
}