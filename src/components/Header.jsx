import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="bg-dark-card border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-lg font-semibold text-white">Admin Dashboard</h2>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">Administrator</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          
          <button 
            onClick={handleLogout}
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