const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../database/db');

const router = express.Router();

const createSchema = z.object({
  name:        z.string().min(1, 'nome é obrigatório'),
  displayName: z.string().min(1, 'displayName é obrigatório'),
  icon:        z.string().min(1, 'ícone é obrigatório'),
  background:  z.string().min(1, 'cor de fundo é obrigatória'),
  isIncome:    z.boolean({ required_error: 'isIncome é obrigatório' }),
});

const updateSchema = z.object({
  name:        z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  icon:        z.string().min(1).optional(),
  background:  z.string().min(1).optional(),
  isIncome:    z.boolean().optional(),
});

// GET /categories
router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ isDefault: 'desc' }, { displayName: 'asc' }],
    });
    res.json(categories);
  } catch (err) { next(err); }
});

// POST /categories
router.post('/', async (req, res, next) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.errors });
  }
  try {
    const category = await prisma.category.create({
      data: { id: uuidv4(), ...result.data, isDefault: false },
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe uma categoria com esse nome' });
    }
    next(err);
  }
});

// PUT /categories/:id
router.put('/:id', async (req, res, next) => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.errors });
  }
  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo enviado para atualização' });
  }
  try {
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data:  result.data,
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Categoria não encontrada' });
    next(err);
  }
});

// DELETE /categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    if (category.isDefault) {
      return res.status(400).json({ error: 'Categorias padrão não podem ser excluídas' });
    }

    const linked = await prisma.transaction.count({ where: { categoryId: req.params.id } });
    if (linked > 0) {
      return res.status(409).json({ error: 'Não é possível excluir uma categoria com transações vinculadas' });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
