import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

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
          
          <Route path="/" element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            {/* Placeholder routes for future implementation */}
            <Route path="transactions" element={<div className="p-10 font-serif text-2xl">Transactions (Coming Soon)</div>} />
            <Route path="budgets" element={<div className="p-10 font-serif text-2xl">Budgets (Coming Soon)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
