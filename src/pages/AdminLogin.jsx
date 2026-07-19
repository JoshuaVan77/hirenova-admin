import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Shield } from 'lucide-react';
import axios from 'axios'; // ✅ Axios ကို Import လုပ်ပါ

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // ✅ Error ပြသရန် State
  const [loading, setLoading] = useState(false); // ✅ Loading ပြသရန် State
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ ၁။ Backend API ကို အမှန်တကယ် ခေါ်ယူအသုံးပြုခြင်း
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        username,
        password
      });

      // ✅ ၂။ Backend က ပြန်ပို့တဲ့ Token ရှိမရှိ စစ်ဆေးခြင်း
      if (response.data && response.data.token) {
        // ✅ ၃။ Token ကို Local Storage ထဲသို့ သိမ်းဆည်းခြင်း (LuckyOrders.jsx နှင့် Key တူညီရမည်)
        localStorage.setItem('adminToken', response.data.token);
        
        // (Optional) Admin အချက်အလက်ကိုပါ သိမ်းဆည်းထားနိုင်ပါသည်
        if (response.data.admin) {
          localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        }

        // ✅ ၄။ Dashboard သို့ Redirect လုပ်ခြင်း
        navigate('/admin/dashboard');
      } else {
        setError('Login successful, but no token received from server.');
      }
    } catch (err) {
      // ✅ ၅။ Error ဖြစ်ပါက Message ပြသခြင်း
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid username or password. Please try again.');
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

        {/* ✅ Error Message ပြသရန် အပိုင်း */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
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
                className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                placeholder="Enter admin username"
                required
                disabled={loading}
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
                className="w-full bg-dark-input border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                placeholder="Enter admin password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}