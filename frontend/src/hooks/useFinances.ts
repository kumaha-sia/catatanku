import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/apiServices';

// Household Hooks
export const useHouseholds = () => useQuery({ queryKey: ['households'], queryFn: api.getHouseholds });

export const useMembers = (householdId?: string) =>
  useQuery({ 
    queryKey: ['members', householdId], 
    queryFn: () => api.getMembers(householdId!),
    enabled: !!householdId
  });

export const useInviteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, email }: { householdId: string, email: string }) => api.inviteMember(householdId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] })
  });
};

// Transaction Hooks
export const useTransactions = (householdId?: string, page = 1) => 
  useQuery({ 
    queryKey: ['transactions', householdId, page], 
    queryFn: () => api.getTransactions(householdId, page)
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

// Wallet Hooks
export const useWallets = (householdId?: string) => 
  useQuery({
    queryKey: ['wallets', householdId],
    queryFn: () => api.getWallets(householdId)
  });

export const useCreateWallet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createWallet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] })
  });
};

export const useUpdateWallet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateWallet(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] })
  });
};

export const useDeleteWallet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteWallet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] })
  });
};

// Category Hooks
export const useCategories = (householdId?: string) => 
  useQuery({
    queryKey: ['categories', householdId],
    queryFn: () => api.getCategories(householdId)
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] })
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] })
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] })
  });
};

// Budget Hooks
export const useBudgets = (householdId?: string, month?: number, year?: number) => 
  useQuery({ 
    queryKey: ['budgets', householdId, month, year],
    queryFn: () => api.getBudgets(householdId, month, year),
    enabled: !!householdId && !!month && !!year
  });

export const useCreateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] })
  });
};

export const useUpdateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateBudget(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] })
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] })
  });
};

// Goal Hooks
export const useGoals = (householdId?: string) => 
  useQuery({
    queryKey: ['goals', householdId],
    queryFn: () => api.getGoals(householdId)
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] })
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateGoal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] })
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] })
  });
};

// Reports
export const useReportSummary = (householdId: string, month?: string, year?: string) => 
  useQuery({
    queryKey: ['reports', householdId, month, year],
    queryFn: () => api.getReportSummary(householdId, month, year),
    enabled: !!householdId
  });
