import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Wallet, Settings as SettingsIcon, Lock, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/settings';

export default function Settings() {
  const [trc20Address, setTrc20Address] = useState('');
  const [minBalance, setMinBalance] = useState('30');
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Backend ကနေ Settings တွေကို ဆွဲယူခြင်း
  const fetchSettings = async () => {
    try {
      const response = await axios.get(API_URL);
      const settings = response.data.settings;
      setTrc20Address(settings.trc20_address || '');
      setMinBalance(settings.min_task_balance || '30');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Settings ကို Save လုပ်ခြင်း
  const handleSave = async () => {
    try {
      await axios.put(API_URL, {
        trc20_address: trc20Address,
        min_task_balance: minBalance
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSettings();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="space-y-6">
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

      {/* Section 1: TRC20 Address */}
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

      {/* Section 2: Task Rules */}
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

      {/* Section 3: Admin Security (Placeholder) */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Lock className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Admin Security</h3>
            <p className="text-xs text-gray-400">Change your admin login password.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">New Admin Password</label>
          <input
            type="password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            placeholder="Enter new password"
            className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white px-6 py-3 rounded-lg transition-colors font-bold shadow-lg shadow-brand-primary/30"
      >
        <Save className="h-5 w-5" /> Save All Settings
      </button>
    </div>
  );
}