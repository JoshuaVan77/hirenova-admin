import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext'; // ✅ ChatProvider ကို Import လုပ်ပါ

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

// Admin Layout (Sidebar + Header ပါတဲ့ Page တွေအတွက်)
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
    // ✅ တစ်ခုလုံးကို ChatProvider နဲ့ Wrap လုပ်ထားပါတယ်
    <ChatProvider>
      <Router>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Protected Routes (Sidebar နဲ့ Header ပါဝင်သော Routes များ) */}
          <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
          <Route path="/admin/topup" element={<AdminLayout><TopupRequests /></AdminLayout>} />
          <Route path="/admin/withdraw" element={<AdminLayout><WithdrawRequests /></AdminLayout>} />
          <Route path="/admin/tasks" element={<AdminLayout><TaskManagement /></AdminLayout>} />
          <Route path="/admin/invite" element={<AdminLayout><InviteCodes /></AdminLayout>} />
          
          {/* ✅ Lucky Orders Route ကို AdminLayout အတွင်း ထည့်သွင်းထားသည် */}
          <Route path="/admin/lucky-orders" element={<AdminLayout><LuckyOrders /></AdminLayout>} />
          
          <Route path="/admin/chat" element={<AdminLayout><LiveChat /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
        </Routes>
      </Router>
    </ChatProvider>
  );
}

export default App;