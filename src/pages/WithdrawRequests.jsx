import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, DollarSign, Copy, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/admin';

export default function WithdrawRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Refresh State

  // ၁။ Backend ကနေ Withdraw Requests တွေကို ဆွဲယူခြင်း
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/withdraw-requests`);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching withdraw requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ၂။ Refresh Function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // ၃။ Approve / Reject လုပ်ခြင်း
  const handleAction = async (id, action) => {
    try {
      await axios.put(`${API_URL}/withdraw-requests/${id}`, {
        status: action,
        admin_note: ''
      });
      
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: action } : req
      ));
      
      alert(`Withdraw request ${action} successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Failed to ${action} request`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading requests...</div>;

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Withdraw Requests</h2>
        <div className="flex items-center gap-3">
          
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Pending Count Badge */}
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm border border-yellow-500/20">
            Pending: {requests.filter(r => r.status === 'pending').length}
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">TRC20 Address</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{req.full_name || 'Unknown'}</div>
                    <div className="text-xs">{req.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-red-400 font-bold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> {req.amount} USDT
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs truncate max-w-[150px]">{req.trc20_address}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(req.trc20_address)}
                        className="text-gray-500 hover:text-white"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">{new Date(req.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAction(req.id, 'approved')}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}