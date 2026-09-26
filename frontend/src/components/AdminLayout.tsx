import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, UserCog, LogOut, ArrowRightLeft, Tags, BarChart } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} className="stroke-[3]" /> },
    { name: 'Manajemen User', path: '/admin/users', icon: <Users size={20} className="stroke-[3]" /> },
    { name: 'Manajemen Keluarga', path: '/admin/households', icon: <UserCog size={20} className="stroke-[3]" /> },
    { name: 'Monitor Transaksi', path: '/admin/transactions', icon: <ArrowRightLeft size={20} className="stroke-[3]" /> },
    { name: 'Kategori Sistem', path: '/admin/categories', icon: <Tags size={20} className="stroke-[3]" /> },
  ];

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-surface border-r-4 border-text-primary shadow-[4px_0_0_0_#171B22] flex-col justify-between z-10 relative">
        <div>
          <div className="p-6 border-b-4 border-text-primary bg-primary text-surface">
            <h1 className="text-2xl font-black tracking-wider uppercase">FinBareng</h1>
            <p className="text-[10px] font-bold mt-1 tracking-widest uppercase bg-surface text-text-primary px-2 py-1 inline-block border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]">Admin Panel</p>
          </div>

          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 border-4 transition-all font-black uppercase tracking-wider text-sm
                    ${isActive 
                      ? 'border-text-primary bg-text-primary text-surface shadow-[4px_4px_0_0_#A3E635] translate-y-0.5' 
                      : 'border-transparent text-text-secondary hover:border-text-primary hover:text-text-primary hover:bg-surface-muted hover:shadow-[4px_4px_0_0_#171B22]'
                    }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t-4 border-text-primary">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-error text-surface border-4 border-text-primary font-black uppercase tracking-wider transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none"
          >
            <LogOut size={20} className="stroke-[3]" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
