import api from '../api';

// Dashboard
export const getAdminStats = () => api.get('/admin/stats').then(res => res.data.data);

// Users
export const getAdminUsers = (params?: any) => api.get('/admin/users', { params }).then(res => res.data.data);
export const getAdminUserDetail = (id: string) => api.get(`/admin/users/${id}`).then(res => res.data.data);
export const updateAdminUserRole = (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }).then(res => res.data.data);
export const suspendAdminUser = (id: string) => api.patch(`/admin/users/${id}/suspend`).then(res => res.data.data);
export const deleteAdminUser = (id: string) => api.delete(`/admin/users/${id}`).then(res => res.data.data);

// Households
export const getAdminHouseholds = (params?: any) => api.get('/admin/households', { params }).then(res => res.data.data);
export const getAdminHouseholdDetail = (id: string) => api.get(`/admin/households/${id}`).then(res => res.data.data);
export const deleteAdminHousehold = (id: string) => api.delete(`/admin/households/${id}`).then(res => res.data.data);

// Transactions
export const getAdminTransactions = (params?: any) => api.get('/admin/transactions', { params }).then(res => res.data.data);

// Categories
export const getAdminCategories = () => api.get('/admin/categories').then(res => res.data.data);
export const createAdminCategory = (data: any) => api.post('/admin/categories', data).then(res => res.data.data);
export const updateAdminCategory = (id: string, data: any) => api.put(`/admin/categories/${id}`, data).then(res => res.data.data);
export const deleteAdminCategory = (id: string) => api.delete(`/admin/categories/${id}`).then(res => res.data.data);

// Debts
export const getAdminDebts = (params?: any) => api.get('/admin/debts', { params }).then(res => res.data.data);

// Analytics
export const getAdminGrowth = () => api.get('/admin/analytics/growth').then(res => res.data.data);
export const getAdminTopCategories = () => api.get('/admin/analytics/top-categories').then(res => res.data.data);
export const getAdminActivity = () => api.get('/admin/analytics/activity').then(res => res.data.data);
