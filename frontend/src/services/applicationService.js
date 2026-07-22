import api from './api';

export const applyForJob = async (jobId, resumeId) => {
  const response = await api.post('/applications', { jobId, resumeId });
  return response.data;
};

export const getCandidateApplications = async () => {
  const response = await api.get('/applications/candidate');
  return response.data;
};

export const getJobApplications = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

export const getCandidateRankings = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}/rankings`);
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await api.patch(`/applications/${id}/status`, { status });
  return response.data;
};

export const withdrawApplication = async (id) => {
  const response = await api.patch(`/applications/${id}/withdraw`);
  return response.data;
};

