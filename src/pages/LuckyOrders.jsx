import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, XCircle, RefreshCw, Target, DollarSign, User } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/admin/lucky-orders';

// ✅ Helper function: Request တိုင်းမှာ Token ပါအောင် ထည့်ပေးမယ့် Function
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

export default function LuckyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // ✅ user_phone ကို user_id သို့ ပြောင်းလဲထားပါသည်
  const [formData, setFormData] = useState({
    user_id: '',
    task_number: '',
    amount: '',
    commission: ''
  });

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching lucky orders:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired or invalid token. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        window.location.href = '/admin/login'; 
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCreate = async () => {
    // ✅ user_id စစ်ဆေးခြင်း
    if (!formData.user_id || !formData.task_number || !formData.amount || !formData.commission) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await axios.post(API_URL, formData, getAuthHeaders());
      alert('Lucky order assigned successfully!');
      setShowModal(false);
      setFormData({ user_id: '', task_number: '', amount: '', commission: '' });
      fetchOrders();
    } catch (error) {
      console.error('Create error:', error);
      alert(error.response?.data?.message || 'Failed to assign lucky order');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this lucky order?')) return;
    try {
      await axios.put(`${API_URL}/${id}/cancel`, {}, getAuthHeaders());
      fetchOrders();
    } catch (error) {
      console.error('Cancel error:', error);
      alert(error.response?.data?.message || 'Failed to cancel lucky order');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading lucky orders...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Lucky Order Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="h-4 w-4" /> Assign Lucky Order
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Task Number</th>
                <th className="px-6 py-4">Required Top-up</th>
                <th className="px-6 py-4">Commission Reward</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No lucky orders assigned yet</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">ID: {order.user_id || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.full_name || 'Unknown'} ({order.phone || 'No phone'})</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold">
                        Task #{order.task_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-red-400 font-bold">${parseFloat(order.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-green-400 font-bold">+${parseFloat(order.commission).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' 
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                          : order.status === 'completed'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleCancel(order.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Cancel Order"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-primary/20 rounded-lg">
                <Target className="h-6 w-6 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-bold text-white">Assign Lucky Order</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* ✅ User ID Input (Changed from User Phone Number) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" /> User ID
                </label>
                <input
                  type="number"
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="e.g., 2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the User ID from the User Management page</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Task Number (1-40)</label>
                  <input
                    type="number"
                    value={formData.task_number}
                    onChange={(e) => setFormData({...formData, task_number: e.target.value})}
                    className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    min="1" max="40"
                    placeholder="e.g., 15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-red-400" /> Required Top-up
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" /> Commission Reward
                </label>
                <input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData({...formData, commission: e.target.value})}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                className="flex-1 bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 rounded-lg transition-all"
              >
                Assign Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}