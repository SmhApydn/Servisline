import React, { useEffect, useState } from 'react';
import { User } from 'shared/types';
import { getUsers, addUser, deleteUser } from '../api/userApi';

const initialForm = { name: '', email: '', role: '' };

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const newUser = await addUser(form);
      setUsers(prev => [...prev, newUser]);
      setForm(initialForm);
      setError(null);
      setSuccess('Kullanıcı başarıyla eklendi!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSuccess('Kullanıcı silindi!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <div>
      <h2>Kullanıcılar</h2>
      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{color:'red'}}>Hata: {error}</p>}
      {success && <p style={{color:'green'}}>{success}</p>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <b>{user.name}</b> | {user.email} | Rol: {user.role}
            <button onClick={() => handleDelete(user.id)} style={{marginLeft:8}}>Sil</button>
          </li>
        ))}
      </ul>
      <h3>Yeni Kullanıcı Ekle</h3>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Ad Soyad" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="E-posta" required />
        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="">Rol Seç</option>
          <option value="Şoför">Şoför</option>
          <option value="Çalışan">Çalışan</option>
          <option value="Yönetici">Yönetici</option>
        </select>
        <button type="submit" disabled={adding}>Ekle</button>
      </form>
    </div>
  );
};

export default UsersList; 