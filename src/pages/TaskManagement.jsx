import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, RefreshCw, Image as ImageIcon, AlertCircle, CheckCircle, Power } from 'lucide-react';

// ✅ 1. Dynamic API URL (Production Ready)
const API_URL = import.meta.env.VITE_API_URL || 'https://hirenova-backend-production-32b1.up.railway.app';

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    hotel_name: '',
    hotel_image: '',
    description: '',
    order_amount: '',
    commission: ''
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

  const fetchTasks = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/admin/tasks`, getAuthHeaders());
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load tasks.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await fetchTasks();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleOpenModal = (task = null) => {
    setError(null);
    if (task) {
      setEditingTask(task);
      setFormData({
        hotel_name: task.hotel_name,
        hotel_image: task.hotel_image || '',
        description: task.description || '',
        order_amount: task.order_amount,
        commission: task.commission
      });
    } else {
      setEditingTask(null);
      setFormData({
        hotel_name: '',
        hotel_image: '',
        description: '',
        order_amount: '',
        commission: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingTask) {
        await axios.put(`${API_URL}/admin/tasks/${editingTask.id}`, formData, getAuthHeaders());
        setSuccessMsg('Task updated successfully!');
      } else {
        await axios.post(`${API_URL}/admin/tasks`, formData, getAuthHeaders());
        setSuccessMsg('Task created successfully!');
      }
      setShowModal(false);
      fetchTasks();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setError(error.response?.data?.message || 'Failed to save task.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    try {
      setError(null);
      await axios.delete(`${API_URL}/admin/tasks/${id}`, getAuthHeaders());
      setSuccessMsg('Task deleted successfully!');
      fetchTasks();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete task.');
    }
  };

  // ✅ 4. Added Toggle Status Function (Matches Backend)
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      await axios.patch(
        `${API_URL}/admin/tasks/${id}/status`, 
        { is_active: currentStatus === 1 ? 0 : 1 }, 
        getAuthHeaders()
      );
      setSuccessMsg('Task status updated successfully!');
      fetchTasks();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Toggle error:', error);
      setError('Failed to update task status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" /> Loading tasks...
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Task Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Tasks"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-brand-secondary hover:bg-brand-primary text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="h-4 w-4" /> Add Hotel Task
          </button>
        </div>
      </div>

      {/* Global Task Pool */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Global Task Pool</h3>
          <p className="text-sm text-gray-400 mt-1">
            These tasks will be randomly assigned to users daily (40 tasks per user)
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Hotel Photo</th>
                <th className="px-6 py-4">Hotel Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Order Amount</th>
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No tasks available. Click "Add Hotel Task" to create one.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      {task.hotel_image ? (
                        <img 
                          src={task.hotel_image} 
                          alt={task.hotel_name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{task.hotel_name}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{task.description || '-'}</td>
                    <td className="px-6 py-4 text-blue-400">${parseFloat(task.order_amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-green-400 font-bold">+${parseFloat(task.commission || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        task.is_active === 1 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {task.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* ✅ Toggle Status Button */}
                        <button 
                          onClick={() => handleToggleStatus(task.id, task.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            task.is_active === 1 
                              ? 'text-yellow-400 hover:bg-yellow-500/10' 
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          title={task.is_active === 1 ? 'Deactivate Task' : 'Activate Task'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(task)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card rounded-2xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingTask ? 'Edit Hotel Task' : 'Add New Hotel Task'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hotel Name *</label>
                <input
                  type="text"
                  value={formData.hotel_name}
                  onChange={(e) => setFormData({...formData, hotel_name: e.target.value})}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="e.g., Pacific Resort Hotel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hotel Image URL</label>
                <input
                  type="url"
                  value={formData.hotel_image}
                  onChange={(e) => setFormData({...formData, hotel_image: e.target.value})}
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="https://example.com/hotel-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a valid image URL (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  placeholder="e.g., Luxury beachfront resort with amazing views"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order Amount (USDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.order_amount}
                    onChange={(e) => setFormData({...formData, order_amount: e.target.value})}
                    className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Commission (USDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    onChange={(e) => setFormData({...formData, commission: e.target.value})}
                    className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    placeholder="0.00"
                    required
                  />
                </div>
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
                onClick={handleSubmit} 
                className="flex-1 bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 rounded-lg transition-all"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}