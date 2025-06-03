import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { getDrivers, addDriver, deleteDriver } from '../api/driverApi';
import { User } from 'shared/types';

const initialForm = { name: '', email: '', password: '' };

export function Drivers() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!adding && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [adding]);

  const validateForm = () => {
    if (!form.name.trim() || form.name.length < 3) return 'İsim en az 3 karakter olmalı.';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) return 'Geçerli bir e-posta girin.';
    if (!form.password || form.password.length < 6) return 'Şifre en az 6 karakter olmalı.';
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Şoförler</h1>
      </div>
      <div className="bg-white shadow overflow-hidden rounded-md p-4">
        {loading && <div className="text-center py-4"><span className="animate-spin inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full"></span></div>}
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 animate-fade-in">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-2 animate-fade-in">{success}</div>}
        <div className="space-y-4">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between hover:bg-blue-50 transition-all duration-200">
              <div>
                <div className="text-lg font-semibold text-gray-900 font-sans tracking-wide">{driver.name}</div>
                <div className="text-sm text-gray-500 font-sans">{driver.email}</div>
              </div>
              <button
                onClick={() => handleDelete(driver.id)}
                className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded shadow"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
        <h3 className="mt-6 mb-2 text-lg font-semibold">Yeni Şoför Ekle</h3>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-center">
          <input
            ref={nameInputRef}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ad Soyad"
            required
            className="border rounded px-2 py-1 bg-white text-gray-900 placeholder-gray-400"
            minLength={3}
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="E-posta"
            required
            className="border rounded px-2 py-1 bg-white text-gray-900 placeholder-gray-400"
            type="email"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Şifre"
            required
            className="border rounded px-2 py-1 bg-white text-gray-900 placeholder-gray-400"
            type="password"
            minLength={6}
          />
          <button
            type="submit"
            disabled={adding}
            className={`px-4 py-1 text-white rounded ${adding ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {adding ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </form>
      </div>
    </div>
  );
} 