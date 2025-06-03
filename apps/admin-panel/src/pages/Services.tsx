import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { getServices, addService, deleteService, getServiceUsers, assignUserToService, removeUserFromService } from '../api/serviceApi';
import { getDrivers } from '../api/driverApi';
import { getUsers } from '../api/userApi';
import { Service } from 'shared/types';
import { User } from 'shared/types';

const initialForm = { name: '', plate: '', driverId: '' };

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const [serviceUsers, setServiceUsers] = useState<Record<string, User[]>>({});
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    getDrivers().then(setDrivers);
    getUsers().then(users => setUsers(users.filter(u => u.role === 'USER')));
  }, []);

  useEffect(() => {
    if (!adding && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [adding]);

  const validateForm = () => {
    if (!form.name.trim() || form.name.length < 3) return 'Servis adı en az 3 karakter olmalı.';
    if (!form.plate.trim() || form.plate.length < 3) return 'Plaka en az 3 karakter olmalı.';
    if (!form.driverId) return 'Şoför seçmelisiniz.';
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const newService = await addService(form);
      setServices(prev => [...prev, newService]);
      setForm(initialForm);
      setError(null);
      setSuccess('Servis başarıyla eklendi!');
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
      await deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      setSuccess('Servis silindi!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    }
  };

  const handleToggle = async (serviceId: string) => {
    if (openServiceId === serviceId) {
      setOpenServiceId(null);
    } else {
      setOpenServiceId(serviceId);
      const users = await getServiceUsers(serviceId);
      if (Array.isArray(users)) {
        const userArray = users.map(user => {
          if (typeof user === 'string') {
            return { id: user, name: user, email: user, role: 'USER' } as User;
          }
          return user as User;
        });
        setServiceUsers(prev => ({ ...prev, [serviceId]: userArray }));
      }
    }
  };

  const handleAssign = async (serviceId: string) => {
    await assignUserToService(serviceId, selectedUserId);
    const users = await getServiceUsers(serviceId);
    if (Array.isArray(users)) {
      const userArray = users.map(user => {
        if (typeof user === 'string') {
          return { id: user, name: user, email: user, role: 'USER' } as User;
        }
        return user as User;
      });
      setServiceUsers(prev => ({ ...prev, [serviceId]: userArray }));
    }
  };

  const handleRemove = async (serviceId: string, userId: string) => {
    await removeUserFromService(serviceId, userId);
    const users = await getServiceUsers(serviceId);
    if (Array.isArray(users)) {
      const userArray = users.map(user => {
        if (typeof user === 'string') {
          return { id: user, name: user, email: user, role: 'USER' } as User;
        }
        return user as User;
      });
      setServiceUsers(prev => ({ ...prev, [serviceId]: userArray }));
    }
  };

  const handleDriverChange = async (serviceId: string, driverId: string) => {
    await fetch(`/api/services/${serviceId}/driver`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: driverId || null })
    });
    fetchServices(); // Şoför değişince servisleri güncelle
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Servisler</h1>
      </div>
      <div className="bg-white shadow overflow-hidden rounded-md p-4">
        {loading && <div className="text-center py-4"><span className="animate-spin inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full"></span></div>}
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 animate-fade-in">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-2 animate-fade-in">{success}</div>}
        <div className="space-y-4">
          {services.map(service => (
            <div key={service.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-2 hover:bg-blue-50 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900 font-sans tracking-wide">{service.name}</div>
                  <div className="text-sm text-gray-500 font-sans">Plaka: {service.plate}</div>
                  <div className="text-xs font-medium text-blue-600 mt-1 font-sans flex items-center gap-2">
                    Şoför:
                    <select
                      value={service.driverId || ''}
                      onChange={e => handleDriverChange(service.id, e.target.value)}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                      style={{ minWidth: 120 }}
                    >
                      <option value="">Şoför Yok</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded shadow"
                >
                  Sil
                </button>
              </div>
              <button
                onClick={() => handleToggle(service.id)}
                className={
                  `mt-2 px-2 py-1 w-auto min-w-[120px] text-sm font-normal text-black bg-white border border-gray-300 rounded shadow-sm transition-colors duration-200
                  hover:bg-blue-600 hover:text-white self-start ml-0`
                }
              >
                {openServiceId === service.id ? 'Çalışanları Gizle' : 'Çalışanları Göster'}
              </button>
              {openServiceId === service.id && (
                <div className="mt-2 p-2 bg-gray-50 rounded w-full">
                  <div className="flex gap-2 mb-2">
                    <select
                      value={selectedUserId}
                      onChange={e => setSelectedUserId(e.target.value)}
                      className="border rounded px-2 py-1 bg-white text-gray-900 placeholder-gray-400"
                    >
                      <option value="">Çalışan Seç</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(service.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      disabled={!selectedUserId}
                    >
                      Ata
                    </button>
                  </div>
                  <div>
                    <b>Atanmış Çalışanlar:</b>
                    <ul className="mt-1 space-y-2">
                      {(serviceUsers[service.id] || []).map(u => (
                        <li key={u.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                          <span style={{ color: 'black', fontWeight: 500 }}>{u.name || u.email || JSON.stringify(u)}</span>
                          <button
                            onClick={() => handleRemove(service.id, u.id)}
                            className="ml-2 px-3 py-1 text-red-600 bg-white border border-red-200 hover:bg-red-600 hover:text-white rounded shadow-sm transition-colors duration-200"
                          >
                            Çıkar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <h3 className="mt-6 mb-2 text-lg font-semibold">Yeni Servis Ekle</h3>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-center">
          <input
            ref={nameInputRef}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Servis Adı"
            required
            className="border rounded px-2 py-1 bg-white text-gray-900 placeholder-gray-400"
            minLength={3}
          />
          <input
            name="plate"
            value={form.plate}
            onChange={handleChange}
            placeholder="Plaka"
            required
            className="border rounded px-2 py-1 bg-white text-gray-900 placeholder-gray-400"
            minLength={3}
          />
          <select
            name="driverId"
            value={form.driverId}
            onChange={handleChange}
            required
            className="border rounded px-2 py-1 bg-white text-gray-900 placeholder-gray-400"
          >
            <option value="">Şoför Seç</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
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