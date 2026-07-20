import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Edit2, Ban, CheckCircle, XCircle, Lock, DollarSign, Star, RefreshCw, AlertCircle } from 'lucide-react';

// ✅ 1. Dynamic API URL (Production Ready)
const API_URL = import.meta.env.VITE_API_URL || 'https://hirenova-backend-production-32b1.up.railway.app';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    credit_score: '',
    balance: '',
    login_password: '',
    payment_password: ''
  });
  
  // ✅ 2. UI Feedback States
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // ✅ 3. Helper function to get Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // ၁။ Backend ကနေ User Data တွေကို ဆွဲယူခြင်း
  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/admin/users`, getAuthHeaders());
      const formattedUsers = response.data.users.map(u => ({
        ...u,
        status: u.is_banned === 1 ? 'banned' : 'active'
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ၂။ Edit Modal ဖွင့်ခြင်း
  const handleEdit = (user) => {
    setError(null);
    setEditingUser(user);
    setFormData({
      credit_score: user.credit_score || 0,
      balance: user.balance || 0,
      login_password: '',
      payment_password: ''
    });
  };

  // ၃။ Backend သို့ User Data Update ပို့ခြင်း
  const handleSave = async () => {
    try {
      setError(null);
      
      // ✅ Only send passwords if they are not empty
      const updateData = {
        credit_score: parseInt(formData.credit_score) || 0,
        balance: parseFloat(formData.balance) || 0
      };
      
      if (formData.login_password.trim()) {
        updateData.login_password = formData.login_password.trim();
      }
      if (formData.payment_password.trim()) {
        updateData.payment_password = formData.payment_password.trim();
      }

      await axios.put(`${API_URL}/admin/users/${editingUser.id}`, updateData, getAuthHeaders());
      
      setSuccessMsg('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
      
      setTimeout(() => setSuccessMsg(''), 3000); // Clear success message after 3s
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user.');
    }
  };

  // ၄။ Ban / Unban လုပ်ခြင်း
  const toggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      const is_banned = currentStatus === 'active' ? 1 : 0;
      await axios.put(`${API_URL}/admin/users/${id}`, { is_banned }, getAuthHeaders());
      
      setSuccessMsg(`User ${is_banned ? 'banned' : 'unbanned'} successfully!`);
      fetchUsers();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status.');
    }
  };

  // ၅။ Refresh Function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await fetchUsers();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" /> Loading users...
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

      {/* Header & Search & Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-input border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Credit Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-white">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.full_name || user.nickname || 'N/A'}</div>
                      <div className="text-xs">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-green-400 font-bold">${parseFloat(user.balance || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.credit_score >= 90 ? 'bg-green-500/10 text-green-400' :
                        user.credit_score >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {user.credit_score || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {user.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {user.status === 'active' ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit User Details"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(user.id, user.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active' 
                              ? 'text-red-400 hover:bg-red-500/10' 
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          title={user.status === 'active' ? 'Ban User' : 'Unban User'}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Edit User Details</h3>
            <p className="text-gray-400 text-sm mb-6">
              Updating information for <span className="text-white font-bold">{editingUser.full_name || editingUser.nickname}</span>
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" /> Credit Score
                </label>
                <input 
                  type="number" 
                  value={formData.credit_score} 
                  onChange={(e) => setFormData({...formData, credit_score: e.target.value})} 
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" /> Balance (USDT)
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.balance} 
                  onChange={(e) => setFormData({...formData, balance: e.target.value})} 
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-400" /> Login Password <span className="text-xs text-gray-500">(Leave empty to keep current)</span>
                </label>
                <input 
                  type="password" 
                  value={formData.login_password} 
                  onChange={(e) => setFormData({...formData, login_password: e.target.value})} 
                  placeholder="Enter new login password" 
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-400" /> Payment Password <span className="text-xs text-gray-500">(Leave empty to keep current)</span>
                </label>
                <input 
                  type="password" 
                  value={formData.payment_password} 
                  onChange={(e) => setFormData({...formData, payment_password: e.target.value})} 
                  placeholder="Enter new payment password" 
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setEditingUser(null); setError(''); }} 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 rounded-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}