import axios from 'axios';

const api = axios.create({
  baseURL: 'https://servisline-admin.onrender.com/api',
});

export interface ServiceRoute {
  id: string;
  name: string;
  start: string;
  end: string;
}

export const getServiceRoutes = async (): Promise<ServiceRoute[]> => {
  const res = await api.get('/routes');
  return res.data;
};

export const addServiceRoute = async (route: Omit<ServiceRoute, 'id'>): Promise<ServiceRoute> => {
  const res = await api.post('/routes', route);
  return res.data;
};

export const updateServiceRoute = async (id: string, route: Partial<ServiceRoute>): Promise<void> => {
  await api.put(`/routes/${id}`, route);
};

export const deleteServiceRoute = async (id: string): Promise<void> => {
  await api.delete(`/routes/${id}`);
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  serviceIds?: string[]; // Birden fazla servise atanabilir
}

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get('/users');
  return res.data;
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const res = await api.post('/users', user);
  return res.data;
};

export const updateUser = async (id: string, user: Partial<User>): Promise<void> => {
  await api.put(`/users/${id}`, user);
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export interface Service {
  id: string;
  name: string;
  driver: string;
  plate: string;
  route?: string;
  assignedUsers?: string[]; // Atanan kullanıcıların ID'leri
}

export const getServices = async (): Promise<Service[]> => {
  const res = await api.get('/services');
  return res.data;
};

export const addService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  const res = await api.post('/services', service);
  return res.data;
};

export const updateService = async (id: string, service: Partial<Service>): Promise<void> => {
  await api.put(`/services/${id}`, service);
};

export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/services/${id}`);
};

// Kullanıcı-Servis ilişkisi için yeni fonksiyonlar
export const assignUserToService = async (userId: string, serviceId: string): Promise<void> => {
  await api.post(`/services/${serviceId}/assign-user`, { userId });
};

export const removeUserFromService = async (userId: string, serviceId: string): Promise<void> => {
  await api.post(`/services/${serviceId}/remove-user`, { userId });
};

export const getUsersByService = async (serviceId: string): Promise<User[]> => {
  const res = await api.get(`/services/${serviceId}/users`);
  return res.data;
};

export const getServicesByUser = async (userId: string): Promise<Service[]> => {
  const res = await api.get(`/users/${userId}/services`);
  return res.data;
}; 