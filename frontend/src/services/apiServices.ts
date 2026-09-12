import api from '../api';

// Auth
export const login = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const register = (data: any) => api.post('/auth/register', data).then(res => res.data);

export const getHouseholds = () => api.get('/households').then(res => res.data.data);
export const getMembers = (householdId: string) => api.get(`/households/${householdId}/members`).then(res => res.data.data);
export const inviteMember = (householdId: string, email: string) => api.post(`/households/${householdId}/invite`, { email }).then(res => res.data);

// Transactions
export const getTransactions = (householdId?: string, page = 1, limit = 20) => 
  api.get('/transactions', { params: { household_id: householdId, page, limit } }).then(res => res.data.data);
export const createTransaction = (data: any) => api.post('/transactions', data).then(res => res.data.data);
export const updateTransaction = (id: string, data: any) => api.put(`/transactions/${id}`, data).then(res => res.data.data);
export const deleteTransaction = (id: string) => api.delete(`/transactions/${id}`).then(res => res.data);

// Wallets
export const getWallets = (householdId?: string) => 
  api.get('/wallets', { params: { household_id: householdId } }).then(res => res.data.data);
export const createWallet = (data: any) => api.post('/wallets', data).then(res => res.data.data);
export const updateWallet = (id: string, data: any) => api.put(`/wallets/${id}`, data).then(res => res.data.data);
export const deleteWallet = (id: string) => api.delete(`/wallets/${id}`).then(res => res.data);

// Categories
export const getCategories = (householdId?: string) => 
  api.get('/categories', { params: { household_id: householdId } }).then(res => res.data.data);
export const createCategory = (data: any) => api.post('/categories', data).then(res => res.data.data);
export const updateCategory = (id: string, data: any) => api.put(`/categories/${id}`, data).then(res => res.data.data);
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`).then(res => res.data);

// Budgets
export const getBudgets = (householdId?: string, month?: number, year?: number) => 
  api.get('/budgets', { params: { household_id: householdId, month, year } }).then(res => res.data.data);
export const createBudget = (data: any) => api.post('/budgets', data).then(res => res.data.data);
export const updateBudget = (id: string, data: any) => api.put(`/budgets/${id}`, data).then(res => res.data.data);
export const deleteBudget = (id: string) => api.delete(`/budgets/${id}`).then(res => res.data);

// Goals
export const getGoals = (householdId?: string) => 
  api.get('/goals', { params: { household_id: householdId } }).then(res => res.data.data);
export const createGoal = (data: any) => api.post('/goals', data).then(res => res.data.data);
export const updateGoal = (id: string, data: any) => api.put(`/goals/${id}`, data).then(res => res.data.data);
export const deleteGoal = (id: string) => api.delete(`/goals/${id}`).then(res => res.data);

// Reports
export const getReportSummary = (householdId: string, month?: string, year?: string) => 
  api.get('/reports/summary', { params: { household_id: householdId, month, year } }).then(res => res.data.data);
