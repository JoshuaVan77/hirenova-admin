import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ArrowUpCircle, ArrowDownCircle, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

// ✅ 1. Dynamic API URL (Production Ready)
const API_URL = import.meta.env.VITE_API_URL || 'https://hirenova-backend-production-32b1.up.railway.app';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTopups: 0,
    pendingWithdrawals: 0,
    totalRevenue: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null); // ✅ 2. Added Error State

  const fetchStats = async () => {
    try {
      setError(null);
      // ✅ 3. Get Token from Local Storage
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: {
          // ✅ 4. Send Token in Authorization Header (Required by Backend adminAuth)
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // ✅ 5. Show user-friendly error message
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load dashboard data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  // ✅ 6. Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" /> Loading dashboard...
        </div>
      </div>
    );
  }

  // ✅ 7. Error State Display
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-dark-card rounded-xl border border-red-500/20 p-6">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-400 text-lg font-medium mb-4">{error}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-brand-secondary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold text-white">{stats.totalUsers?.toLocaleString() || 0}</p>
        </div>

        {/* Pending Top-ups */}
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-brand-secondary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Pending Top-ups</p>
          <p className="text-3xl font-bold text-white">{stats.pendingTopups || 0}</p>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-brand-secondary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <ArrowDownCircle className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Pending Withdrawals</p>
          <p className="text-3xl font-bold text-white">{stats.pendingWithdrawals || 0}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-brand-secondary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-white">
            ${stats.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(!stats.recentTransactions || stats.recentTransactions.length === 0) ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                stats.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-white">{transaction.formatted_user_id || `USR${transaction.user_id}`}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 ${
                        transaction.type.includes('topup') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type.includes('topup') ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                        {transaction.type.replace('_', ' ').charAt(0).toUpperCase() + transaction.type.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold ${
                      transaction.type.includes('topup') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type.includes('topup') ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{formatTime(transaction.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'approved' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : transaction.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}