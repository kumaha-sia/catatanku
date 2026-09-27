import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/adminApiServices';
import { useToastStore } from '../store/toastStore';

export const useAdminStats = () => useQuery({ queryKey: ['adminStats'], queryFn: api.getAdminStats });

// Users
export const useAdminUsers = (params?: any) => useQuery({ queryKey: ['adminUsers', params], queryFn: () => api.getAdminUsers(params) });
export const useAdminUserDetail = (id: string) => useQuery({ queryKey: ['adminUserDetail', id], queryFn: () => api.getAdminUserDetail(id) });

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.updateAdminUserRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail', variables.id] });
      useToastStore.getState().success('Role berhasil diperbarui');
    },
    onError: (error: any) => useToastStore.getState().error(error.response?.data?.message || 'Gagal mengubah role')
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.suspendAdminUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail', id] });
      useToastStore.getState().success('Status suspend berhasil diubah');
    },
    onError: (error: any) => useToastStore.getState().error(error.response?.data?.message || 'Gagal mengubah status suspend')
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      useToastStore.getState().success('User berhasil dihapus');
    },
    onError: (error: any) => useToastStore.getState().error(error.response?.data?.message || 'Gagal menghapus user')
  });
};

// Households
export const useAdminHouseholds = (params?: any) => useQuery({ queryKey: ['adminHouseholds', params], queryFn: () => api.getAdminHouseholds(params) });
export const useAdminHouseholdDetail = (id: string) => useQuery({ queryKey: ['adminHouseholdDetail', id], queryFn: () => api.getAdminHouseholdDetail(id) });
export const useDeleteHousehold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAdminHousehold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHouseholds'] });
      useToastStore.getState().success('Household berhasil dihapus');
    },
    onError: (error: any) => useToastStore.getState().error(error.response?.data?.message || 'Gagal menghapus household')
  });
};

// Transactions
export const useAdminTransactions = (params?: any) => useQuery({ queryKey: ['adminTransactions', params], queryFn: () => api.getAdminTransactions(params) });

// Categories
export const useAdminCategories = () => useQuery({ queryKey: ['adminCategories'], queryFn: api.getAdminCategories });
export const useCreateSystemCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createAdminCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      useToastStore.getState().success('Kategori berhasil dibuat');
    }
  });
};
export const useUpdateSystemCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateAdminCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      useToastStore.getState().success('Kategori berhasil diperbarui');
    }
  });
};
export const useDeleteSystemCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAdminCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      useToastStore.getState().success('Kategori berhasil dihapus');
    }
  });
};

// Debts
export const useAdminDebts = (params?: any) => useQuery({ queryKey: ['adminDebts', params], queryFn: () => api.getAdminDebts(params) });

// Analytics
export const useAdminGrowth = () => useQuery({ queryKey: ['adminGrowth'], queryFn: api.getAdminGrowth });
export const useAdminTopCategories = () => useQuery({ queryKey: ['adminTopCategories'], queryFn: api.getAdminTopCategories });
export const useAdminActivity = () => useQuery({ queryKey: ['adminActivity'], queryFn: api.getAdminActivity });


export const useAdminSettings = () => useQuery({
  queryKey: ['adminSettings'],
  queryFn: api.getSettings
});

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      window.toast.success('Pengaturan sistem berhasil disimpan');
    },
    onError: (err: any) => {
      window.toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    }
  });
};
