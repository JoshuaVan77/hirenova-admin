import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Shield, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔥 GUARANTEED FIX: Hardcoded URL to bypass any Environment Variable issues
  // (စမ်းသပ်ရန် URL ကို တိုက်ရိုက်ထည့်ထားပါသည်)
  const LOGIN_URL = 'https://hirenova-backend-production-32b1.up.railway.app/api/admin/login';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Attempting login to EXACT URL:', LOGIN_URL);
      
      const response = await axios.post(
        LOGIN_URL, // <-- Use the hardcoded URL directly
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log('✅ Login successful:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        if (response.data.admin) {
          localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        }

        console.log('🔑 Token stored successfully');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.error('❌ No token received from server');
        setError('Login successful, but no token received from server.');
      }
    } catch (err) {
      console.error('❌ Login error details:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your internet connection.');
      } else if (err.response) {
        console.error('Server responded with:', err.response.status, err.response.data);
        setError(err.response.data?.message || 'Invalid username or password.');
      } else if (err.request) {
        console.error('No response received from server');
        setError('Cannot connect to server. Please check backend status.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md bg-dark-card p-8 rounded-2xl shadow-2xl border border-gray-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/20 mb-4">
            <Shield className="h-8 w-8 text-brand-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">HireNova Management System</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-all"
                placeholder="Enter admin username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-all"
                placeholder="Enter admin password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            <span className="font-semibold text-gray-300">Demo Credentials:</span>
            <br />
            Username: <code className="text-brand-secondary">admin</code>
            <br />
            Password: <code className="text-brand-secondary">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}