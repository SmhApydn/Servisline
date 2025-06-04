import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// Tüm servisleri getir
router.get('/', async (req, res) => {
  const services = await prisma.service.findMany();
    res.json(services);
});

// Service sayısını dönen endpoint
router.get('/count', async (req, res) => {
  const count = await prisma.service.count();
  res.json({ count });
});

// Kullanıcıya atanmış servisi getir
router.get('/info', async (req, res) => {
  console.log('GET /api/services/info endpointine istek geldi');
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        assignedServices: {
          include: {
            driver: true
          }
        }
      }
    });

    if (!user || !user.assignedServices.length) {
      console.log('Servis bulunamadı');
      return res.status(404).json({ error: 'Servis bulunamadı' });
    }

    // İlk atanan servisi döndür
    const service = user.assignedServices[0];
    console.log('Servis bulundu ve dönülüyor:', service);
    res.json({
      id: service.id,
      name: service.name,
      plate: service.plate,
      driver: service.driver ? {
        id: service.driver.id,
        name: service.driver.name,
        phone: service.driver.phone
      } : null
    });
  } catch (err) {
    console.log('Geçersiz token veya hata:', err);
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

// Şoförün canlı konumunu döndür
router.get('/location', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    // Kullanıcının servisindeki şoförün id'sini bul
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { assignedServices: { include: { driver: true } } }
    });
    if (!user || !user.assignedServices.length) return res.status(404).json({ error: 'Servis bulunamadı' });
    // Şoförün kendi olduğu servisi bul
    const myService = user.assignedServices.find((s: any) => s.driver && s.driver.id === user.id);
    const driver = myService ? myService.driver : user.assignedServices[0].driver;
    if (!driver) return res.status(404).json({ error: 'Şoför bulunamadı' });
    const loc = driverLocations[driver.id];
    if (!loc) return res.status(404).json({ error: 'Şoför konumu bulunamadı' });
    res.json({ latitude: loc.latitude, longitude: loc.longitude, updatedAt: loc.updatedAt });
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

// Şoför canlı konumunu günceller
router.put('/location', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });
  const token = authHeader.split(' ')[1];
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'latitude ve longitude gerekli' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string, role?: string };
    console.log('[PUT /location] decoded.id:', decoded.id);
    // Kullanıcıyı bul ve rolünü kontrol et, assignedServices ilişkisini dahil et
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { assignedServices: true } });
    console.log('[PUT /location] user:', user);
    if (!user || user.role !== 'DRIVER') {
      console.log('[PUT /location] Kullanıcı yok veya rol DRIVER değil:', user?.role);
      return res.status(403).json({ error: 'Sadece şoförler konum paylaşabilir.' });
    }
    if (!user.assignedServices || !user.assignedServices.length) {
      console.log('[PUT /location] assignedServices yok veya boş:', user.assignedServices);
      return res.status(404).json({ error: 'Service not found' });
    }
    driverLocations[user.id] = { latitude, longitude, updatedAt: new Date() };
    console.log('[PUT /location] Konum kaydedildi:', driverLocations[user.id]);
    res.json({ success: true });
  } catch (err) {
    console.log('[PUT /location] Hata:', err);
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

// Çalışma arkadaşlarını getir (Attendance tabanlı)
router.get('/colleagues', async (req, res) => {
  console.log('>>> /colleagues endpointine istek geldi');
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });

  const token = authHeader.split(' ')[1];
  const { date, period } = req.query; // date: '2024-06-01', period: 'morning' veya 'evening'
  if (!date || !period) return res.status(400).json({ error: 'Tarih ve period gerekli' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        assignedServices: {
          include: {
            assignedUsers: {
              where: {
                role: {
                  not: 'DRIVER'
                }
              },
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.assignedServices.length) {
      return res.status(404).json({ error: 'Servis bulunamadı' });
    }

    const assignedUsers = user.assignedServices[0].assignedUsers;
    // Her kullanıcı için o gün ve period'a ait Attendance kaydını bul
    const userIds = assignedUsers.map((u: { id: string }) => u.id);
    const attendances = await prisma.attendance.findMany({
      where: {
        userId: { in: userIds },
        date: new Date(date as string),
        period: period as string
      }
    });
    const colleagues = assignedUsers.map((u: { id: string; name: string; role: string }) => {
      const att = attendances.find((a: { userId: string }) => a.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        status: att ? att.status : 'not_joining',
        updatedAt: att ? att.updatedAt : null
      };
    });
    res.json(colleagues);
  } catch (err) {
    console.log('Colleagues endpoint error:', err);
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

// Durum güncelle (Attendance tabanlı)
router.put('/colleagues/:id/status', async (req, res) => {
  console.log('>>> /colleagues/:id/status endpointine istek geldi');
  const { id } = req.params;
  const { date, period, status } = req.body; // date: '2024-06-01', period: 'morning' veya 'evening', status: 'joining' veya 'not_joining'
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });

  const token = authHeader.split(' ')[1];
  if (!date || !period || !status) return res.status(400).json({ error: 'Tarih, period ve status gerekli' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    if (decoded.id !== id) {
      return res.status(403).json({ error: 'Sadece kendi durumunu güncelleyebilirsin.' });
    }
    // Attendance kaydı var mı kontrol et
    const existing = await prisma.attendance.findFirst({
      where: {
        userId: id,
        date: new Date(date),
        period: period as string
      }
    });
    let attendance;
    if (existing) {
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: status as string }
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          userId: id,
          date: new Date(date),
          period: period as string,
          status: status as string
        }
      });
    }
    res.json({ success: true, attendance });
  } catch (err) {
    console.log('Durum güncellenemedi:', err);
    res.status(500).json({ error: 'Durum güncellenemedi.' });
  }
});

// Basit mesajlaşma endpointleri (in-memory)
let messagesByService: { [serviceId: string]: { id: string, text: string, sender: string, serviceId: string, timestamp: Date }[] } = {};

// Kullanıcının atanmış olduğu tüm servisleri dönen endpoint
router.get('/my-services', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { assignedServices: true } });
    res.json(user?.assignedServices || []);
  } catch {
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

// Mesajları servisId'ye göre dönen endpoint
router.get('/messages', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });
  const token = authHeader.split(' ')[1];
  const { serviceId } = req.query;
  if (!serviceId || typeof serviceId !== 'string') return res.status(400).json({ error: 'serviceId gerekli' });
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { assignedServices: true } });
    // Kullanıcı bu servise atanmış mı kontrol et
    const assigned = user?.assignedServices.some((s: any) => s.id === serviceId);
    if (!assigned) return res.status(403).json({ error: 'Bu servise atanmadınız' });
    res.json(messagesByService[serviceId as string] || []);
  } catch {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
});

// Mesaj gönderirken serviceId body'de gelmeli
router.post('/messages', async (req, res) => {
  const { message, serviceId } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });
  if (!serviceId) return res.status(400).json({ error: 'serviceId gerekli' });

  const token = authHeader.split(' ')[1];
  let sender = 'Bilinmeyen';
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { assignedServices: true } });
    sender = user?.name || 'Bilinmeyen';
    // Kullanıcı bu servise atanmış mı kontrol et
    const assigned = user?.assignedServices.some((s: any) => s.id === serviceId);
    if (!assigned) return res.status(403).json({ error: 'Bu servise atanmadınız' });
  } catch {
    return res.status(401).json({ error: 'Geçersiz token' });
  }

  const newMsg = {
    id: uuidv4(),
    text: message,
    sender, // Kullanıcı adı
    serviceId,
    timestamp: new Date()
  };
  if (!messagesByService[serviceId]) messagesByService[serviceId] = [];
  messagesByService[serviceId].push(newMsg);
  res.status(201).json(newMsg);
});

// Tek servis getir
router.get('/:id', async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

// Yeni servis ekle
router.post('/', async (req, res) => {
  const { name, plate, driverId } = req.body;
  if (!name || !plate || !driverId) {
    return res.status(400).json({ error: 'Eksik alan var' });
  }
  // 1. Servisi oluştur
  const newService = await prisma.service.create({
    data: { name, plate, driverId }
  });
  // 2. Şoförün assignedServices alanına bu servisi ekle
  await prisma.user.update({
    where: { id: driverId },
    data: {
      assignedServices: {
        connect: { id: newService.id }
      }
    }
  });
  res.status(201).json(newService);
});

// Servis güncelle
router.put('/:id', async (req, res) => {
  const { name, plate, route, driverId } = req.body;
  try {
    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: { name, plate, route, driverId }
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Service not found' });
  }
});

// Servis sil
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await prisma.service.delete({ where: { id: req.params.id } });
    res.json(deleted);
  } catch {
    res.status(404).json({ error: 'Service not found' });
  }
});

// Servise çalışan ata
router.post('/:serviceId/assign-user', async (req, res) => {
  const { serviceId } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId gerekli' });
  try {
    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        assignedUsers: { connect: { id: userId } }
      }
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Service or user not found' });
  }
});

// Servisten çalışan çıkar
router.post('/:serviceId/remove-user', async (req, res) => {
  const { serviceId } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId gerekli' });
  try {
    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        assignedUsers: { disconnect: { id: userId } }
      }
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Service or user not found' });
  }
});

// Bir servise atanmış çalışanları getir
router.get('/:serviceId/users', async (req, res) => {
  const { serviceId } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { assignedUsers: true }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service.assignedUsers);
  } catch {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Şoförün canlı konumunu memory'de tutmak için basit bir obje
const driverLocations: { [driverId: string]: { latitude: number; longitude: number; updatedAt: Date } } = {};

// Servisin şoförünü güncelle
router.put('/:id/driver', async (req, res) => {
  const { driverId } = req.body;
  try {
    const updatedService = await prisma.service.update({
      where: { id: req.params.id },
      data: { driverId: driverId || null }
    });
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ error: 'Şoför güncellenemedi' });
  }
});

export default router; 