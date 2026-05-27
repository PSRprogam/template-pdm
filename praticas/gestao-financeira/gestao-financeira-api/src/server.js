const express = require('express');
const cors = require('cors');
const { seed } = require('./database/seed');

const categoriesRouter   = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const authRouter         = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, name: 'gestao-financeira-api' }));

app.use('/categories',   categoriesRouter);
app.use('/transactions', transactionsRouter);
app.use('/auth',         authRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

async function main() {
  await seed();
  app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando em http://0.0.0.0:${PORT}`));
}

main().catch(console.error);
