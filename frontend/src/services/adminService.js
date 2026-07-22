import api from './api';

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminJobs = async (params = {}) => {
  const response = await api.get('/admin/jobs', { params });
  return response.data;
};

export const getAdminApplications = async (params = {}) => {
  const response = await api.get('/admin/applications', { params });
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

