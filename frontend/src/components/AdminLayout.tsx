import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, UserCog, LogOut, ArrowRightLeft, Tags, Settings } from 'lucide-react';

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
    { name: 'Pengaturan Sistem', path: '/admin/settings', icon: <Settings size={20} className="stroke-[3]" /> },
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
      <main className="flex-1 overflow-y-auto bg-background pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-4 border-text-primary flex justify-around items-center px-1 py-1 pb-safe z-40">
        <MobileNavItem to="/admin" icon={<LayoutDashboard size={20} />} label="Dash" location={location} />
        <MobileNavItem to="/admin/users" icon={<Users size={20} />} label="Users" location={location} />
        <MobileNavItem to="/admin/households" icon={<UserCog size={20} />} label="Fam" location={location} />
        <MobileNavItem to="/admin/transactions" icon={<ArrowRightLeft size={20} />} label="Tx" location={location} />
        <button 
          onClick={handleLogout}
          aria-label="Logout"
          className="flex flex-col items-center justify-center w-[60px] py-1 transition-all group text-error hover:text-error"
        >
          <div className="mb-1 p-1.5 flex items-center justify-center border-2 border-transparent">
            <LogOut size={20} className="stroke-[2] group-hover:stroke-[3]" />
          </div>
          <span className="text-[9px] uppercase tracking-wider font-bold truncate w-full text-center">Keluar</span>
        </button>
      </nav>
    </div>

  );
};


const MobileNavItem = ({ to, icon, label, location }: { to: string, icon: React.ReactNode, label: string, location: any }) => {
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center w-[60px] py-1 transition-all group"
    >
      <div className={`mb-1 p-1.5 flex items-center justify-center transition-all ${
        isActive 
          ? 'bg-accent border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] text-text-primary -translate-y-0.5' 
          : 'border-2 border-transparent text-text-secondary group-hover:text-text-primary'
      }`}>
        {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: isActive ? 3 : 2 })}
      </div>
      <span className={`text-[9px] uppercase tracking-wider transition-all truncate w-full text-center ${
        isActive ? 'font-black text-text-primary' : 'font-bold text-text-secondary group-hover:text-text-primary'
      }`}>
        {label}
      </span>
    </Link>
  );
};

export default AdminLayout;

