import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
// Placeholders for FinBareng routes
const Dashboard = () => <div className="p-4"><h1>Dashboard</h1></div>;
const Transactions = () => <div className="p-4"><h1>Transactions</h1></div>;
const Wallets = () => <div className="p-4"><h1>Wallets</h1></div>;
const Budgets = () => <div className="p-4"><h1>Budgets</h1></div>;
const Goals = () => <div className="p-4"><h1>Goals</h1></div>;
const Family = () => <div className="p-4"><h1>Family</h1></div>;
const Settings = () => <div className="p-4"><h1>Settings</h1></div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="wallets" element={<Wallets />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
            <Route path="family" element={<Family />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
