const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../database/db');

const router = express.Router();

const createSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  value:       z.number({ required_error: 'Valor é obrigatório' }).positive('Valor deve ser positivo'),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  categoryId:  z.string().uuid('categoryId inválido'),
});

const updateSchema = z.object({
  description: z.string().min(1).optional(),
  value:       z.number().positive().optional(),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  categoryId:  z.string().uuid().optional(),
});

// GET /transactions/months — meses distintos com lançamentos + mês atual
router.get('/months', async (_req, res, next) => {
  try {
    const rows = await prisma.transaction.findMany({ select: { date: true } });

    const now     = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const set = new Set(rows.map((r) => r.date.substring(0, 7)));
    set.add(current); // mês atual sempre presente

    const months = [...set].sort().reverse(); // mais recente primeiro
    res.json(months);
  } catch (err) { next(err); }
});

// GET /transactions?month=4&year=2026
router.get('/', async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const where = {};

    if (month && year) {
      const m = String(month).padStart(2, '0');
      where.date = { startsWith: `${year}-${m}` };
    } else if (year) {
      where.date = { startsWith: String(year) };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include:  { category: true },
      orderBy:  { date: 'desc' },
    });
    res.json(transactions);
  } catch (err) { next(err); }
});

// POST /transactions
router.post('/', async (req, res, next) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.errors });
  }
  try {
    const { description, value, date, categoryId } = result.data;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(400).json({ error: 'Categoria não encontrada' });

    const transaction = await prisma.transaction.create({
      data:    { id: uuidv4(), description, value, date, categoryId },
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (err) { next(err); }
});

// PUT /transactions/:id
router.put('/:id', async (req, res, next) => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.errors });
  }
  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo enviado para atualização' });
  }
  try {
    if (result.data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: result.data.categoryId } });
      if (!cat) return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    const updated = await prisma.transaction.update({
      where:   { id: req.params.id },
      data:    result.data,
      include: { category: true },
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Transação não encontrada' });
    next(err);
  }
});

// DELETE /transactions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Transação não encontrada' });
    next(err);
  }
});

module.exports = router;
