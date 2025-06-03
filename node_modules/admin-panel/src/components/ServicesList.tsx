import React, { useEffect, useState } from 'react';
import { Service, User } from 'shared/types';
import { getServices, addService, deleteService, assignUserToService, removeUserFromService, getUsersByService } from '../api/serviceApi';
import Modal from './Modal';

const initialForm = { name: '', plate: '', route: '', driverId: '' };

interface ServicesListProps {
  users: User[];
  drivers: User[];
}

const ServicesList: React.FC<ServicesListProps> = ({ users, drivers }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Kullanıcı atama modalı işlemleri
  const openAssignModal = async (service: Service) => {
    setSelectedService(service);
    const userIds = await getUsersByService(service.id);
    setAssignedUserIds(userIds);
    setAssignModalOpen(true);
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedService) return;
    await assignUserToService(selectedService.id, userId);
    const userIds = await getUsersByService(selectedService.id);
    setAssignedUserIds(userIds);
    setSuccess('Kullanıcı atandı!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedService) return;
    await removeUserFromService(selectedService.id, userId);
    const userIds = await getUsersByService(selectedService.id);
    setAssignedUserIds(userIds);
    setSuccess('Kullanıcı kaldırıldı!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div>
      <h2>Servisler</h2>
      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{color:'red'}}>Hata: {error}</p>}
      {success && <p style={{color:'green'}}>{success}</p>}
      <ul>
        {services.map(service => (
          <li key={service.id}>
            <b>{service.name}</b> | Plaka: {service.plate} | Güzergah: {service.route} | Şoför ID: {service.driverId}
            <button onClick={() => handleDelete(service.id)} style={{marginLeft:8}}>Sil</button>
            <button onClick={() => openAssignModal(service)} style={{marginLeft:8}}>Kullanıcı Ata</button>
          </li>
        ))}
      </ul>
      <h3>Yeni Servis Ekle</h3>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Servis Adı" required />
        <input name="plate" value={form.plate} onChange={handleChange} placeholder="Plaka" required />
        <input name="route" value={form.route} onChange={handleChange} placeholder="Güzergah" required />
        <select name="driverId" value={form.driverId} onChange={handleChange} required>
          <option value="">Şoför Seç</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>
        <button type="submit" disabled={adding}>Ekle</button>
      </form>
      {/* Kullanıcı Atama Modalı */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={selectedService ? `${selectedService.name} - Kullanıcı Ata` : ''}>
        {selectedService && (
          <>
            <select onChange={e => handleAssignUser(e.target.value)} defaultValue="">
              <option value="">Kullanıcı seç</option>
              {users.filter(u => !assignedUserIds.includes(u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
            <div style={{marginTop:8}}>
              <b>Atanmış Kullanıcılar:</b>
              <ul>
                {assignedUserIds.map(uid => {
                  const user = users.find(u => u.id === uid);
                  return user ? (
                    <li key={uid}>
                      {user.name} ({user.role})
                      <button onClick={() => handleRemoveUser(uid)} style={{marginLeft:8}}>Kaldır</button>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ServicesList; 