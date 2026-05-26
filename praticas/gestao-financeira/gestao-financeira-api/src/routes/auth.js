const express = require('express');
const { z } = require('zod');
const prisma = require('../database/db');

const router = express.Router();

const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.errors });
  }
  try {
    const { email, password } = result.data;
    const user = await prisma.user.findFirst({ where: { email, password } });

    if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) { next(err); }
});

module.exports = router;
