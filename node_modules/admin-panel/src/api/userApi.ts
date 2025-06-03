import { User } from 'shared/types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4001/api') + '/users';

export async function getUsers(): Promise<User[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Kullanıcılar alınamadı');
  return res.json();
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Kullanıcı eklenemedi');
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Kullanıcı silinemedi');
} 

export const updateUserStatus = async (id: string, { morningStatus, eveningStatus }: { morningStatus?: string; eveningStatus?: string }) => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ morningStatus, eveningStatus })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kullanıcı durumu güncellenirken bir hata oluştu');
  }
  return response.json();
}; 