/* @jsxImportSource react */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export function Dashboard() {
  const { user, loading, token, isAuthenticated } = useAuth();
  const location = useLocation();
  const [serviceCount, setServiceCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const fetchCounts = async () => {
    console.log('fetchCounts çağrıldı');
    if (loading || !isAuthenticated || !token) return;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const [serviceRes, driverRes, userRes] = await Promise.all([
        fetch('/api/services/count', { credentials: 'include', headers }).then(async r => {
          console.log('services/count yanıt:', r.status);
          if (!r.ok) throw new Error('Service count error');
          const data = await r.json();
          console.log('services/count data:', data);
          return data;
        }),
        fetch('/api/drivers/count', { credentials: 'include', headers }).then(async r => {
          console.log('drivers/count yanıt:', r.status);
          if (!r.ok) throw new Error('Driver count error');
          const data = await r.json();
          console.log('drivers/count data:', data);
          return data;
        }),
        fetch('/api/users/count', { credentials: 'include', headers }).then(async r => {
          console.log('users/count yanıt:', r.status);
          if (!r.ok) throw new Error('User count error');
          const data = await r.json();
          console.log('users/count data:', data);
          return data;
        }),
      ]);
      setServiceCount(serviceRes.count); console.log('setServiceCount:', serviceRes.count);
      setDriverCount(driverRes.count); console.log('setDriverCount:', driverRes.count);
      setUserCount(userRes.count); console.log('setUserCount:', userRes.count);
    } catch (err) {
      console.error('Dashboard veri çekme hatası:', err);
    }
  };

  useEffect(() => {
    fetchCounts();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCounts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loading, token, isAuthenticated, location.pathname]);

  console.log('RENDER', { serviceCount, driverCount, userCount });

  if (loading) return <div>Yükleniyor...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Hoş Geldiniz, {user?.name}</h1>
      <button
        onClick={fetchCounts}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
      >
        Yenile
      </button>
      <div className="bg-white shadow overflow-hidden rounded-md">
        <div className="px-4 py-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Toplam Servis</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{serviceCount}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Toplam Şoför</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{driverCount}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Toplam Kullanıcı</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{userCount}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 