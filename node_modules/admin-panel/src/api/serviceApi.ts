import { Service, User } from 'shared/types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/services';

export async function getServices(): Promise<Service[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Servisler alınamadı');
  return res.json();
}

export async function addService(service: Omit<Service, 'id'>): Promise<Service> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
  });
  if (!res.ok) throw new Error('Servis eklenemedi');
  return res.json();
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Servis silinemedi');
}

export async function assignUserToService(serviceId: string, userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/${serviceId}/assign-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Atama başarısız');
  return res.json();
}

export async function removeUserFromService(serviceId: string, userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/${serviceId}/remove-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Çıkarma başarısız');
  return res.json();
}

export async function getServiceUsers(serviceId: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/${serviceId}/users`);
  if (!res.ok) throw new Error('Çalışanlar getirilemedi');
  return res.json();
} 