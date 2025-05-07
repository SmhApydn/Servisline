import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Gerekirse 10.0.2.2 veya gerçek IP ile değiştirilebilir
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

// Kullanıcılar için sahte veri (API yerine gerçek backend ile değiştirilebilir)
let users: User[] = [
  { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@servisline.com', role: 'Çalışan', serviceIds: ['1'] },
  { id: '2', name: 'Ayşe Demir', email: 'ayse@servisline.com', role: 'Çalışan', serviceIds: ['1'] },
  { id: '3', name: 'Ali Korkmaz', email: 'ali@servisline.com', role: 'Şoför', serviceIds: ['1'] },
];

export const getUsers = async (): Promise<User[]> => {
  return users;
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const newUser = { ...user, id: (users.length + 1).toString() };
  users.push(newUser);
  return newUser;
};

export const updateUser = async (id: string, user: Partial<User>): Promise<void> => {
  users = users.map(u => (u.id === id ? { ...u, ...user } : u));
};

export const deleteUser = async (id: string): Promise<void> => {
  users = users.filter(u => u.id !== id);
};

export interface Service {
  id: string;
  name: string;
  driver: string;
  plate: string;
  route?: string;
  assignedUsers?: string[]; // Atanan kullanıcıların ID'leri
}

let services: Service[] = [
  { id: '1', name: 'Sabah Servisi', driver: 'Ali Korkmaz', plate: '34 ABC 123', route: 'A-B', assignedUsers: ['1'] },
  { id: '2', name: 'Akşam Servisi', driver: 'Mehmet Kaya', plate: '34 XYZ 456', route: 'B-A', assignedUsers: ['1'] },
];

export const getServices = async (): Promise<Service[]> => {
  return services;
};

export const addService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  const newService = { ...service, id: (services.length + 1).toString() };
  services.push(newService);
  return newService;
};

export const updateService = async (id: string, service: Partial<Service>): Promise<void> => {
  services = services.map(s => (s.id === id ? { ...s, ...service } : s));
};

export const deleteService = async (id: string): Promise<void> => {
  services = services.filter(s => s.id !== id);
};

// Kullanıcı-Servis ilişkisi için yeni fonksiyonlar
export const assignUserToService = async (userId: string, serviceId: string): Promise<void> => {
  const user = users.find(u => u.id === userId);
  const service = services.find(s => s.id === serviceId);
  
  if (user && service) {
    // Kullanıcıya servis ekle
    user.serviceIds = [...(user.serviceIds || []), serviceId];
    // Servise kullanıcı ekle
    service.assignedUsers = [...(service.assignedUsers || []), userId];
  }
};

export const removeUserFromService = async (userId: string, serviceId: string): Promise<void> => {
  const user = users.find(u => u.id === userId);
  const service = services.find(s => s.id === serviceId);
  
  if (user && service) {
    // Kullanıcıdan servisi kaldır
    user.serviceIds = (user.serviceIds || []).filter(id => id !== serviceId);
    // Servisten kullanıcıyı kaldır
    service.assignedUsers = (service.assignedUsers || []).filter(id => id !== userId);
  }
};

export const getUsersByService = async (serviceId: string): Promise<User[]> => {
  return users.filter(user => user.serviceIds?.includes(serviceId));
};

export const getServicesByUser = async (userId: string): Promise<Service[]> => {
  return services.filter(service => service.assignedUsers?.includes(userId));
}; 