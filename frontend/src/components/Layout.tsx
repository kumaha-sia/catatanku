import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Layout = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-charcoal/10 flex flex-col p-6">
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-charcoal">
            Catatu.
          </h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem to="/transactions" icon={<Receipt size={20} />} label="Transactions" />
          <NavItem to="/budgets" icon={<PieChart size={20} />} label="Budgets" />
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
          isActive 
            ? 'bg-charcoal text-surface' 
            : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};
