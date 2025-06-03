export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'DRIVER';
}

export interface Service {
  id: string;
  name: string;
  plate: string;
  route?: string;
  driverId?: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
} 