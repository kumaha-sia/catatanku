import api from '../api';

// Auth
export const login = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const register = (data: any) => api.post('/auth/register', data).then(res => res.data);
export const uploadAvatar = (formData: FormData) => api.put('/auth/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const updateProfile = (data: { name: string, whatsapp?: string, reminder_enabled?: boolean, reminder_time?: string }) => api.put('/auth/profile', data).then(res => res.data);
export const deleteAvatar = () => api.delete('/auth/avatar').then(res => res.data);
export const changePassword = (data: { currentPassword: string, newPassword: string }) => api.post('/auth/change-password', data).then(res => res.data);

export const getHouseholds = () => api.get('/households').then(res => res.data.data);
export const getMembers = (householdId: string) => api.get(`/households/${householdId}/members`).then(res => res.data.data);
export const inviteMember = (householdId: string, email: string) => api.post(`/households/${householdId}/invite`, { email }).then(res => res.data);
export const getInviteLink = (householdId: string) => api.get(`/households/${householdId}/invite-link`).then(res => res.data.data);
export const joinHousehold = (code: string) => api.post(`/households/join`, { code }).then(res => res.data);
export const acceptHousehold = (householdId: string) => api.post(`/households/${householdId}/accept`).then(res => res.data);
export const rejectHousehold = (householdId: string) => api.post(`/households/${householdId}/reject`).then(res => res.data);
export const removeMember = (householdId: string, memberId: string) => api.delete(`/households/${householdId}/members/${memberId}`).then(res => res.data);
export const leaveHousehold = (householdId: string) => api.post(`/households/${householdId}/leave`).then(res => res.data);

// Transactions
export const getTransactions = (householdId?: string, page = 1, limit = 20, month?: string, year?: string) => 
  api.get('/transactions', { params: { household_id: householdId, page, limit, month, year } }).then(res => res.data);
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
export const rolloverBudgets = (data: { household_id: string, month: number, year: number }) => 
  api.post('/budgets/rollover', data).then(res => res.data.data);

// Goals
export const getGoals = (householdId?: string) => 
  api.get('/goals', { params: { household_id: householdId } }).then(res => res.data.data);
export const createGoal = (data: any) => api.post('/goals', data).then(res => res.data.data);
export const updateGoal = (id: string, data: any) => api.put(`/goals/${id}`, data).then(res => res.data.data);
export const deleteGoal = (id: string) => api.delete(`/goals/${id}`).then(res => res.data);

// Debts
export const getDebts = (householdId?: string) => 
  api.get('/debts', { params: { household_id: householdId } }).then(res => res.data.data);
export const createDebt = (data: any) => api.post('/debts', data).then(res => res.data.data);
export const updateDebt = (id: string, data: any) => api.put(`/debts/${id}`, data).then(res => res.data.data);
export const payDebt = (id: string, data: any) => api.post(`/debts/${id}/pay`, data).then(res => res.data.data);
export const deleteDebt = (id: string) => api.delete(`/debts/${id}`).then(res => res.data);

// Reports
export const getReportSummary = (householdId: string, month?: string, year?: string, scope?: string) => 
  api.get('/reports/summary', { params: { household_id: householdId, month, year, scope } }).then(res => res.data.data);

// Notifications
export const getNotifications = () => api.get('/notifications').then(res => res.data.data);
export const markNotificationAsRead = (id: string) => api.put(`/notifications/${id}/read`).then(res => res.data.data);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all').then(res => res.data);


export const scanReceipt = async (file: File) => {
  const formData = new FormData();
  formData.append('receipt', file);
  const res = await api.post('/transactions/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.data;
};


// --- WhatsApp Binding ---
export const generateWaBindToken = () => api.post('/auth/wa/bind/generate').then(res => res.data);
export const checkWaBindStatus = () => api.get('/auth/wa/bind/status').then(res => res.data);
export const unbindWa = () => api.post('/auth/wa/unbind').then(res => res.data);
