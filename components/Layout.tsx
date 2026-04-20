
import React from 'react';
import { Outlet, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  ClipboardList, 
  LogOut, 
  ShieldCheck,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = `/dashboard/${user.role.toLowerCase().replace('_', '-')}`;

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: dashboardPath, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FIELD_STAFF] },
    { label: 'Manage Customers', icon: <Users size={20} />, path: '/customers/list', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { label: 'Create Customer', icon: <PlusCircle size={20} />, path: '/customers/create', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FIELD_STAFF] },
    { label: 'Manage Staff', icon: <ShieldCheck size={20} />, path: '/staff/list', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { label: 'Create Staff', icon: <UserPlus size={20} />, path: '/staff/create', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { label: 'Surveys', icon: <ClipboardList size={20} />, path: '/surveys/list', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FIELD_STAFF] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/DUA E KHAIR Logo.png" 
                alt="Logo" 
                className="w-12 h-12 rounded-lg object-contain"
              />
              <span className="font-black text-xl tracking-tight text-gray-900 leading-tight">Dua-E-Khair Foundation</span>
            </div>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
              <p className="font-bold text-gray-800 truncate">{user.employeeId}</p>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-8 justify-between sticky top-0 z-10 md:hidden">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="font-black text-lg text-gray-900">Dua-E-Khair Foundation</span>
          <div className="w-10"></div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
