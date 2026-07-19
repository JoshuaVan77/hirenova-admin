import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ArrowUpCircle, ArrowDownCircle, 
  Briefcase, Ticket, MessageSquare, Settings, LogOut, Target 
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useChat();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/topup', icon: ArrowUpCircle, label: 'Top-up Requests' },
    { path: '/admin/withdraw', icon: ArrowDownCircle, label: 'Withdraw Requests' },
    { path: '/admin/tasks', icon: Briefcase, label: 'Task Management' },
    { path: '/admin/invite', icon: Ticket, label: 'Invite Codes' },
    { path: '/admin/lucky-orders', icon: Target, label: 'Lucky Orders' },
    { path: '/admin/chat', icon: MessageSquare, label: 'Live Chat Support' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    // ✅ 'hidden md:flex' ကို ဖျက်ပြီး 'flex-shrink-0' ထည့်ထားပါတယ်
    <aside className="w-64 bg-dark-sidebar border-r border-gray-800 flex flex-col flex-shrink-0 h-screen">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-secondary to-brand-accent bg-clip-text text-transparent">
          HireNova
        </h1>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-brand-primary/20 text-brand-secondary border border-brand-secondary/30' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              
              {item.path === '/admin/chat' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={() => navigate('/admin/login')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}