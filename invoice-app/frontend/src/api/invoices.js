import api from './axios';

export const getInvoices = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/invoices?${query}`);
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (data) => {
  const response = await api.post('/invoices', data);
  return response.data;
};

export const updateInvoice = async (id, data) => {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data;
};

export const deleteInvoice = async (id) => {
  await api.delete(`/invoices/${id}`);
};

export const updateInvoiceStatus = async (id, status) => {
  const response = await api.patch(`/invoices/${id}/status`, { status });
  return response.data;
};
