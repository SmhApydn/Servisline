import React, { useEffect, useState } from 'react';
import { User } from 'shared/types';
import { getDrivers, addDriver, deleteDriver } from '../api/driverApi';

const initialForm = { name: '', email: '' };

const DriversList: React.FC = () => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const newDriver = await addDriver(form);
      setDrivers(prev => [...prev, newDriver]);
      setForm(initialForm);
      setError(null);
      setSuccess('Şoför başarıyla eklendi!');
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
      await deleteDriver(id);
      setDrivers(prev => prev.filter(d => d.id !== id));
      setSuccess('Şoför silindi!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <div>
      <h2>Şoförler</h2>
      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{color:'red'}}>Hata: {error}</p>}
      {success && <p style={{color:'green'}}>{success}</p>}
      <ul>
        {drivers.map(driver => (
          <li key={driver.id}>
            <b>{driver.name}</b> | {driver.email}
            <button onClick={() => handleDelete(driver.id)} style={{marginLeft:8}}>Sil</button>
          </li>
        ))}
      </ul>
      <h3>Yeni Şoför Ekle</h3>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Ad Soyad" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="E-posta" required />
        <button type="submit" disabled={adding}>Ekle</button>
      </form>
    </div>
  );
};

export default DriversList; 