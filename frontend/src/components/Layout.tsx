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
      <div className="md:hidden flex justify-between items-center px-4 py-3 bg-surface border-b-4 border-text-primary z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-none border-2 border-text-primary flex items-center justify-center text-text-primary font-black text-lg shadow-[2px_2px_0_0_#171B22]">F</div>
          <h1 className="font-black tracking-widest uppercase text-text-primary">FinBareng</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-none border-2 border-text-primary bg-accent flex items-center justify-center text-text-primary relative shadow-[2px_2px_0_0_#171B22]">
            <Bell size={20} />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-error rounded-none border-2 border-text-primary" />
          </button>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-none border-2 border-text-primary bg-primary text-text-primary flex items-center justify-center font-black text-lg shadow-[2px_2px_0_0_#171B22]">
            {useAuthStore(state => state.user)?.name?.charAt(0).toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r-4 border-text-primary flex-col p-6 bg-surface">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-12 h-12 bg-primary rounded-none border-2 border-text-primary flex items-center justify-center text-text-primary font-black text-2xl shadow-[4px_4px_0_0_#171B22]">F</div>
          <h1 className="font-black text-2xl tracking-widest uppercase text-text-primary">FinBareng</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-8">
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
          onClick={openAddTransaction}
          className="flex items-center justify-center gap-2 bg-primary text-text-primary py-3 rounded-none border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all font-black uppercase tracking-wider mt-4"
        >
          <Plus size={20} />
          Catat Transaksi
        </button>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 mt-6 text-text-primary bg-surface border-2 border-transparent hover:border-text-primary hover:bg-error hover:shadow-[4px_4px_0_0_#171B22] transition-all w-full font-black uppercase tracking-wider"
        >
          <LogOut size={20} />
          <span className="font-black text-sm uppercase">Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 relative">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-4 border-text-primary flex justify-around items-center px-2 py-1 pb-safe z-40">
        <MobileNavItem to="/" icon={<Home size={24} />} label="Beranda" />
        <MobileNavItem to="/transactions" icon={<Receipt size={24} />} label="Trans." />
        
        <div className="relative -top-5">
          <button 
            onClick={openAddTransaction}
            className="w-14 h-14 bg-primary text-text-primary rounded-none border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] active:translate-y-1 active:shadow-[2px_2px_0_0_#171B22] transition-all"
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
        `flex items-center gap-3 px-4 py-3 rounded-none transition-all font-black uppercase tracking-wider text-sm border-2 ${
          isActive 
            ? 'bg-primary border-text-primary text-text-primary shadow-[4px_4px_0_0_#171B22]' 
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
      className={({ isActive }) => 
        `flex flex-col items-center justify-center w-full py-2 transition-all ${
          isActive 
            ? 'text-text-primary font-black translate-y-[-2px]' 
            : 'text-text-secondary font-bold'
        }`
      }
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </NavLink>
  );
};
