import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext'; 

import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserManagement from './pages/UserManagement';
import TopupRequests from './pages/TopupRequests';
import WithdrawRequests from './pages/WithdrawRequests';
import TaskManagement from './pages/TaskManagement';
import InviteCodes from './pages/InviteCodes';
import LiveChat from './pages/LiveChat';
import Settings from './pages/Settings';
import LuckyOrders from './pages/LuckyOrders';

// ==========================================
// ✅ Protected Route Component (Production)
// Token မရှိရင် Login page ကို အလိုအလျောက် ပြန်ပို့ပါမယ်
// ==========================================
const ProtectedRoute = ({ children }) => {
  // ⚠️ သင့် Login page မှာ Token ကို ဘယ်နာမည်နဲ့ သိမ်းလဲဆိုတာ အောက်ပါအတိုင်း စစ်ဆေးပါ:
  // - 'adminToken' လား
  // - 'token' လား  
  // - 'hirenova_admin_token' လား
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// ==========================================
// Admin Layout Component
// ==========================================
const AdminLayout = ({ children }) => (
  <div className="flex h-screen bg-dark-bg overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-dark-bg">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          {/* 1. Default Route */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          
          {/* 2. Public Route - Login */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* 3. Protected Routes - Production Ready */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <AdminLayout><UserManagement /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/topup" 
            element={
              <ProtectedRoute>
                <AdminLayout><TopupRequests /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/withdraw" 
            element={
              <ProtectedRoute>
                <AdminLayout><WithdrawRequests /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/tasks" 
            element={
              <ProtectedRoute>
                <AdminLayout><TaskManagement /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/invite" 
            element={
              <ProtectedRoute>
                <AdminLayout><InviteCodes /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/lucky-orders" 
            element={
              <ProtectedRoute>
                <AdminLayout><LuckyOrders /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/chat" 
            element={
              <ProtectedRoute>
                <AdminLayout><LiveChat /></AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <AdminLayout><Settings /></AdminLayout>
              </ProtectedRoute>
            } 
          />

          {/* 4. Catch-All Route */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
}

export default App;