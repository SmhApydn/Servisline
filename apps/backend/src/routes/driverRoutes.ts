import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Tüm şoförleri getir
router.get('/', async (req, res) => {
  const drivers = await prisma.user.findMany({ where: { role: 'DRIVER' } });
  res.json(drivers);
});

// Driver sayısını dönen endpoint
router.get('/count', async (req, res) => {
  const count = await prisma.user.count({ where: { role: 'DRIVER' } });
  res.json({ count });
});

// Tek şoför getir
router.get('/:id', async (req, res) => {
  const driver = await prisma.user.findUnique({ where: { id: req.params.id, role: 'DRIVER' } });
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json(driver);
});

// Yeni şoför ekle
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Eksik alan var' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newDriver = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'DRIVER' }
  });
  res.status(201).json(newDriver);
});

// Şoför güncelle
router.put('/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email }
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Driver not found' });
  }
});

// Şoför sil
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await prisma.user.delete({ where: { id: req.params.id } });
    res.json(deleted);
  } catch {
    res.status(404).json({ error: 'Driver not found' });
  }
});

export default router; 