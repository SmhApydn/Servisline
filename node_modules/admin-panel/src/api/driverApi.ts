import { User } from 'shared/types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/drivers';

export async function getDrivers(): Promise<User[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Şoförler alınamadı');
  return res.json();
}

export async function addDriver(driver: Omit<User, 'id' | 'role'>): Promise<User> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driver),
  });
  if (!res.ok) throw new Error('Şoför eklenemedi');
  return res.json();
}

export async function deleteDriver(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Şoför silinemedi');
} 