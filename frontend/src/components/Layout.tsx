import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Receipt, Target, PieChart, Wallet, Users, Settings, Plus, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { AddTransactionSheet } from './AddTransactionSheet';

export const Layout = () => {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const openAddTransaction = useUIStore((state) => state.openAddTransaction);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden font-sans text-text-primary">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center px-4 py-3 bg-surface border-b border-border z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-surface font-bold text-sm shadow-sm">F</div>
          <h1 className="font-bold tracking-tight text-text-primary">FinBareng</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary relative">
            <Bell size={18} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface" />
          </button>
          <button onClick={() => navigate('/settings')} className="w-8 h-8 rounded-full bg-primary text-surface flex items-center justify-center font-bold text-sm shadow-sm">
            A
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border flex-col p-6 bg-surface">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-surface font-bold text-lg">F</div>
          <h1 className="font-bold text-2xl tracking-tight text-text-primary">FinBareng</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-8">
          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Main</p>
            <nav className="space-y-1">
              <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
              <NavItem to="/transactions" icon={<Receipt size={20} />} label="Transactions" />
              <NavItem to="/wallets" icon={<Wallet size={20} />} label="Wallets" />
            </nav>
          </div>

          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Planning</p>
            <nav className="space-y-1">
              <NavItem to="/budgets" icon={<Target size={20} />} label="Budgets" />
              <NavItem to="/goals" icon={<PieChart size={20} />} label="Goals" />
              <NavItem to="/reports" icon={<PieChart size={20} />} label="Laporan & Analitik" />
            </nav>
          </div>

          <div>
            <p className="px-4 text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Household</p>
            <nav className="space-y-1">
              <NavItem to="/family" icon={<Users size={20} />} label="Family" />
              <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
            </nav>
          </div>
        </div>

        <button 
          onClick={openAddTransaction}
          className="flex items-center justify-center gap-2 bg-primary text-surface py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-bold mt-4"
        >
          <Plus size={20} />
          Catat Transaksi
        </button>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 mt-6 text-text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all w-full"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 relative">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-center px-2 py-1 pb-safe z-40">
        <MobileNavItem to="/" icon={<Home size={24} />} label="Beranda" />
        <MobileNavItem to="/transactions" icon={<Receipt size={24} />} label="Trans." />
        
        <div className="relative -top-5">
          <button 
            onClick={openAddTransaction}
            className="w-14 h-14 bg-primary text-surface rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>

        <MobileNavItem to="/budgets" icon={<Target size={24} />} label="Anggaran" />
        <MobileNavItem to="/reports" icon={<PieChart size={24} />} label="Laporan" />
      </nav>

      <AddTransactionSheet />
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
          isActive 
            ? 'bg-primary-soft text-primary' 
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
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
      className={({ isActive }) => 
        `flex flex-col items-center justify-center w-full py-2 transition-all ${
          isActive 
            ? 'text-primary' 
            : 'text-text-secondary hover:text-text-primary'
        }`
      }
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </NavLink>
  );
};
