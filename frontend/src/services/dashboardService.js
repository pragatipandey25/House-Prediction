import api from './api';

export const getEmployerDashboard = async () => {
  const response = await api.get('/dashboard/employer');
  return response.data;
};

export const getCandidateDashboard = async () => {
  const response = await api.get('/dashboard/candidate');
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};

