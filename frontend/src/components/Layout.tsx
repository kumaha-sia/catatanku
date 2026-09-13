import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Receipt, Target, PieChart, Wallet, Users, Settings, Plus, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { AddTransactionSheet } from './AddTransactionSheet';
import { NotificationPanel } from './NotificationPanel';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../services/apiServices';

export const Layout = () => {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const openAddTransaction = useUIStore((state) => state.openAddTransaction);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 60000,
  });

  const unreadCount = notificationData?.unreadCount || 0;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden font-sans text-text-primary">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center px-4 py-3 bg-surface border-b-2 border-text-primary z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary border-2 border-text-primary flex items-center justify-center text-surface font-black text-xl shadow-[2px_2px_0_0_#171B22]">F</div>
          <h1 className="font-black text-[15px] tracking-widest uppercase text-text-primary mt-0.5">FinBareng</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNotificationOpen(true)} className="relative w-10 h-10 border-2 border-text-primary bg-surface hover:bg-accent flex items-center justify-center text-text-primary shadow-[2px_2px_0_0_#171B22] transition-colors">
            <Bell size={20} strokeWidth={2} />
            {unreadCount > 0 && (
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-none border-2 border-text-primary" />
            )}
          </button>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 border-2 border-text-primary bg-primary hover:bg-accent text-surface flex items-center justify-center font-black text-lg shadow-[2px_2px_0_0_#171B22] transition-colors group overflow-hidden">
            {useAuthStore(state => state.user)?.avatarUrl 
              ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${useAuthStore(state => state.user)?.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              : <span className="group-hover:text-text-primary">{useAuthStore(state => state.user)?.name?.charAt(0).toUpperCase() || 'U'}</span>
            }
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r-2 border-text-primary flex-col p-6 bg-surface">
        <div className="flex justify-between items-center mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-none border-2 border-text-primary flex items-center justify-center text-surface font-black text-2xl shadow-[4px_4px_0_0_#171B22]">F</div>
            <h1 className="font-black text-2xl tracking-widest uppercase text-text-primary mt-1">FinBareng</h1>
          </div>
          <button 
            onClick={() => setIsNotificationOpen(true)} 
            className="relative w-10 h-10 border-2 border-text-primary bg-surface hover:bg-accent flex items-center justify-center text-text-primary shadow-[2px_2px_0_0_#171B22] transition-colors shrink-0"
          >
            <Bell size={20} strokeWidth={2} />
            {unreadCount > 0 && (
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-none border-2 border-text-primary" />
            )}
          </button>
        </div>
        <div className="px-4 mb-8 mt-4">
          <button 
            onClick={openAddTransaction}
            className="w-full flex items-center justify-center gap-2 bg-primary text-surface py-3 border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] hover:text-text-primary hover:bg-accent active:translate-y-0 active:shadow-none transition-all font-black uppercase tracking-wider"
          >
            <Plus size={24} strokeWidth={2.5} />
            Catat Transaksi
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          <div>
            <p className="px-4 text-xs font-black uppercase tracking-widest text-text-primary mb-3">Main</p>
            <nav className="space-y-2">
              <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
              <NavItem to="/transactions" icon={<Receipt size={20} />} label="Transactions" />
              <NavItem to="/wallets" icon={<Wallet size={20} />} label="Wallets" />
            </nav>
          </div>

          <div>
            <p className="px-4 text-xs font-black uppercase tracking-widest text-text-primary mb-3">Planning</p>
            <nav className="space-y-2">
              <NavItem to="/budgets" icon={<Target size={20} />} label="Budgets" />
              <NavItem to="/goals" icon={<PieChart size={20} />} label="Goals" />
              <NavItem to="/reports" icon={<PieChart size={20} />} label="Laporan & Analitik" />
            </nav>
          </div>

          <div>
            <p className="px-4 text-xs font-black uppercase tracking-widest text-text-primary mb-3">Household</p>
            <nav className="space-y-2">
              <NavItem to="/family" icon={<Users size={20} />} label="Family" />
              <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
            </nav>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 mt-6 text-text-primary bg-surface border-2 border-transparent hover:border-text-primary hover:bg-error hover:shadow-[4px_4px_0_0_#171B22] transition-all w-full font-black uppercase tracking-wider group"
        >
          <LogOut size={20} className="group-hover:text-text-primary" strokeWidth={2} />
          <span className="font-black text-sm uppercase">Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[90px] md:pb-0 relative">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-text-primary flex justify-between items-center px-2 py-1 pb-safe z-40">
        <MobileNavItem to="/" icon={<Home size={22} />} label="Beranda" />
        <MobileNavItem to="/transactions" icon={<Receipt size={22} />} label="Riwayat" />
        
        {/* Floating Square FAB */}
        <div className="relative -top-5 px-1">
          <button 
            onClick={openAddTransaction}
            className="w-14 h-14 bg-primary text-surface hover:text-text-primary hover:bg-accent rounded-none border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] active:translate-y-1 active:shadow-[2px_2px_0_0_#171B22] transition-all"
          >
            <Plus size={30} strokeWidth={2.5} />
          </button>
        </div>

        <MobileNavItem to="/budgets" icon={<Target size={22} />} label="Anggaran" />
        <MobileNavItem to="/reports" icon={<PieChart size={22} />} label="Laporan" />
      </nav>

      <AddTransactionSheet />
      <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-none transition-all font-black uppercase tracking-wider text-sm border-2 ${
          isActive 
            ? 'bg-primary border-text-primary text-surface shadow-[4px_4px_0_0_#171B22]' 
            : 'border-transparent text-text-primary hover:border-text-primary hover:shadow-[4px_4px_0_0_#171B22]'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};

const MobileNavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className="flex flex-col items-center justify-center w-[70px] py-1 transition-all group"
    >
      {({ isActive }) => (
        <>
          <div className={`mb-1 p-1.5 flex items-center justify-center transition-all ${
            isActive 
              ? 'bg-accent border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] text-text-primary -translate-y-0.5' 
              : 'border-2 border-transparent text-text-secondary group-hover:text-text-primary'
          }`}>
            {React.cloneElement(icon as React.ReactElement, { strokeWidth: isActive ? 2.5 : 2 })}
          </div>
          <span className={`text-[10px] uppercase tracking-wider transition-all ${
            isActive ? 'font-black text-text-primary' : 'font-bold text-text-secondary group-hover:text-text-primary'
          }`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};
