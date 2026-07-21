import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Copy, CheckCircle, XCircle, RefreshCw, Tag, AlertCircle } from 'lucide-react';

// ✅ 1. FIXED: Separate BASE_URL and API_URL to ensure '/api' is always included
const BASE_URL = import.meta.env.VITE_API_URL || 'https://hirenova-backend-production-32b1.up.railway.app';
const API_URL = `${BASE_URL}/api/invite-codes`; // <-- ဒီနေရာမှာ /api ကို ထည့်ပေးလိုက်ပါပြီ

export default function InviteCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // ✅ 2. Helper function to get Auth Headers (Safely handles null token)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  const fetchCodes = async () => {
    try {
      setError(null);
      // ✅ Now calls /api/invite-codes
      const response = await axios.get(API_URL, getAuthHeaders());
      setCodes(response.data.codes || []);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        setError('API endpoint not found. Please check backend deployment.');
      } else {
        setError('Failed to load invite codes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await fetchCodes();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCreate = async () => {
    if (!newCode.trim() || !maxUses) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError(null);
      await axios.post(
        API_URL, 
        { code: newCode.trim(), max_uses: parseInt(maxUses) }, 
        getAuthHeaders()
      );
      
      setSuccessMsg('Invite code created successfully!');
      setShowModal(false);
      setNewCode('');
      setMaxUses('');
      fetchCodes();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Create error:', error);
      setError(error.response?.data?.message || 'Failed to create invite code');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      await axios.put(
        `${API_URL}/${id}`, 
        { is_active: currentStatus === 1 ? 0 : 1 }, 
        getAuthHeaders()
      );
      setSuccessMsg('Status updated successfully!');
      fetchCodes();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Toggle error:', error);
      setError('Failed to update status');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setSuccessMsg('Copied to clipboard!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" /> Loading invite codes...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error & Success Messages */}
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Invite Code Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setError(''); setShowModal(true); }}
            className="flex items-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="h-4 w-4" /> Create New Code
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Invite Code</th>
                <th className="px-6 py-4">Max Uses</th>
                <th className="px-6 py-4">Current Uses</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No invite codes found. Create one to get started.
                  </td>
                </tr>
              ) : (
                codes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">{item.code}</span>
                        <button onClick={() => copyToClipboard(item.code)} className="text-gray-500 hover:text-white transition-colors" title="Copy">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{item.max_uses}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${(item.used_count || 0) >= item.max_uses ? 'text-red-400' : 'text-green-400'}`}>
                        {item.used_count || 0}
                      </span>
                      <span className="text-gray-500"> / {item.max_uses}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_active === 1 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {item.is_active === 1 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {item.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">{item.created_by_name || 'Admin'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(item.id, item.is_active)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          item.is_active === 1 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {item.is_active === 1 ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-primary/20 rounded-lg">
                <Tag className="h-6 w-6 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-bold text-white">Create New Invite Code</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Invite Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="e.g., HIRE2024"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Uses</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowModal(false); setError(''); }} 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                className="flex-1 bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 rounded-lg transition-all"
              >
                Create Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}