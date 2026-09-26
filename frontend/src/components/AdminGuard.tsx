import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuthStore();

  if (!token || user?.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
