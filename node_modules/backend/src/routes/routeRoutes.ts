import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/routes - Tüm rotaları listele
router.get('/', async (req, res) => {
  try {
    const routes = await prisma.route.findMany();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Rotalar alınamadı.' });
  }
});

// POST /api/routes - Yeni rota ekle
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const route = await prisma.route.create({ data: { name, description } });
    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ error: 'Rota eklenemedi.' });
  }
});

// PUT /api/routes/:id - Rota güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const route = await prisma.route.update({
      where: { id },
      data: { name, description },
    });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: 'Rota güncellenemedi.' });
  }
});

// DELETE /api/routes/:id - Rota sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.route.delete({ where: { id } });
    res.json({ message: 'Rota silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Rota silinemedi.' });
  }
});

export default router; 