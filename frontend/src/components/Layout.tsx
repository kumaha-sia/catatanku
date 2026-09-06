import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Layout = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center p-5 border-b border-charcoal/10 bg-background z-10">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal">Catatu.</h1>
        <button onClick={logout} className="p-2 text-charcoal/60 hover:text-charcoal bg-charcoal/5 rounded-full">
          <LogOut size={18} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-charcoal/10 flex-col p-8 bg-surface/50">
        <div className="mb-14">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-charcoal">
            Catatu.
          </h1>
        </div>
        
        <nav className="flex-1 space-y-3">
          <NavItem to="/" icon={<LayoutDashboard size={22} />} label="Overview" />
          <NavItem to="/transactions" icon={<Receipt size={22} />} label="Transactions" />
          <NavItem to="/budgets" icon={<PieChart size={22} />} label="Budgets" />
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 rounded-2xl transition-all w-full"
        >
          <LogOut size={22} />
          <span className="font-semibold text-lg">Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-0">
        <div className="max-w-5xl mx-auto p-5 md:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-charcoal/10 flex justify-around items-center p-2 pb-safe z-50">
        <MobileNavItem to="/" icon={<LayoutDashboard size={24} />} label="Home" />
        <MobileNavItem to="/transactions" icon={<Receipt size={24} />} label="History" />
        <MobileNavItem to="/budgets" icon={<PieChart size={24} />} label="Budgets" />
      </nav>

    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-semibold text-lg ${
          isActive 
            ? 'bg-charcoal text-surface shadow-lg scale-[1.02]' 
            : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
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
        `flex flex-col items-center justify-center w-full py-3 transition-all ${
          isActive 
            ? 'text-charcoal scale-110' 
            : 'text-charcoal/40 hover:text-charcoal/70'
        }`
      }
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </NavLink>
  );
};
