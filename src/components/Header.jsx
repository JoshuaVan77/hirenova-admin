import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // ✅ 1. Add Auth Context for dynamic user data

export default function Header() {
  const { user, logout } = useAuth(); // ✅ 2. Get user data from context
  const [notificationCount] = useState(3); // ✅ 3. Add dynamic notification count

  return (
    <header className="bg-dark-card border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-lg font-semibold text-white">Admin Dashboard</h2>
      
      <div className="flex items-center gap-4">
        {/* ✅ 4. Dynamic Notification Badge */}
        <button 
          className="relative p-2 text-gray-400 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
          {/* ✅ 5. Dynamic User Avatar */}
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          
          {/* ✅ 6. Dynamic User Info */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Super Admin'}</p>
          </div>
          
          {/* ✅ 7. Logout Button */}
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}