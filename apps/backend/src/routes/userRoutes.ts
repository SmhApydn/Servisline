import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const roleMap = (role: string) => {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'Şoför' || role === 'DRIVER') return 'DRIVER';
  return 'USER';
};

// Kullanıcı bilgilerini getir
router.get('/me', async (req, res) => {
  console.log('GET /api/users/me endpointine istek geldi');
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

    if (!user) {
      console.log('Kullanıcı bulunamadı');
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    console.log('Kullanıcı bulundu ve dönülüyor:', user);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      assignedServices: user.assignedServices.map(service => ({
        id: service.id,
        name: service.name,
        plate: service.plate,
        driver: service.driver ? {
          id: service.driver.id,
          name: service.driver.name,
          phone: service.driver.phone
        } : null,
        route: service.route || ''
      }))
    });
  } catch (err) {
    console.log('Geçersiz token veya hata:', err);
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

// /me PUT endpointi: Kullanıcı kendi profilini güncelleyebilir
router.put('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token bulunamadı' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const { name, phone, department } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(department && { department })
      }
    });
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      department: updatedUser.department
    });
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz token veya güncelleme hatası' });
  }
});

// Kullanıcı durumunu güncelle
router.put('/me/status', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token bulunamadı' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const { morningStatus, eveningStatus } = req.body;
    const updateData: any = {};
    if (morningStatus !== undefined) {
      updateData.morningStatus = morningStatus;
      updateData.morningStatusUpdatedAt = new Date();
    }
    if (eveningStatus !== undefined) {
      updateData.eveningStatus = eveningStatus;
      updateData.eveningStatusUpdatedAt = new Date();
    }
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData
    });
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      morningStatus: updatedUser.morningStatus,
      eveningStatus: updatedUser.eveningStatus,
      morningStatusUpdatedAt: updatedUser.morningStatusUpdatedAt,
      eveningStatusUpdatedAt: updatedUser.eveningStatusUpdatedAt
    });
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz token veya güncelleme hatası' });
  }
});

// Tüm kullanıcıları getir
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      morningStatus: true,
      eveningStatus: true,
      morningStatusUpdatedAt: true,
      eveningStatusUpdatedAt: true,
    }
  });
  res.json(users);
});

// User sayısını dönen endpoint
router.get('/count', async (req, res) => {
  const count = await prisma.user.count({ where: { role: 'USER' } });
  res.json({ count });
});

// Tek kullanıcı getir
router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Yeni kullanıcı ekle
router.post('/', async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Eksik alan var' });
  }
  const user = await prisma.user.create({
    data: { name, email, role: roleMap(role), password: 'password' }
  });
  res.status(201).json(user);
});

// Kullanıcı güncelle
router.put('/:id', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, role: roleMap(role) }
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

// Kullanıcı sil
router.delete('/:id', async (req, res) => {
  try {
    const user = await prisma.user.delete({ where: { id: req.params.id } });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router; 