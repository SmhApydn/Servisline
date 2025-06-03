export interface Service {
  id: string;
  name: string;
  plate: string;
  route?: string;
  driverId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
} 