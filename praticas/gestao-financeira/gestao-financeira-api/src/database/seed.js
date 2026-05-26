const { v4: uuidv4 } = require('uuid');
const prisma = require('./db');

async function seed() {
  // ── Categorias ──────────────────────────────────────────────────────────────
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    await prisma.category.createMany({
      data: [
        { id: uuidv4(), name: 'income',        displayName: 'Renda',       icon: 'attach-money',   background: '#B5EAD7', isIncome: true,  isDefault: true },
        { id: uuidv4(), name: 'food',          displayName: 'Alimentação', icon: 'restaurant',     background: '#FFDAC1', isIncome: false, isDefault: true },
        { id: uuidv4(), name: 'transport',     displayName: 'Transporte',  icon: 'directions-car', background: '#C7CEEA', isIncome: false, isDefault: true },
        { id: uuidv4(), name: 'entertainment', displayName: 'Lazer',       icon: 'sports-esports', background: '#FF9AA2', isIncome: false, isDefault: true },
        { id: uuidv4(), name: 'bills',         displayName: 'Contas',      icon: 'receipt',        background: '#FFF5BA', isIncome: false, isDefault: true },
      ],
    });
    console.log('Seed: 5 categorias padrão criadas.');
  }

  // ── Usuário ──────────────────────────────────────────────────────────────────
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await prisma.user.create({
      data: { id: uuidv4(), name: 'Admin', email: 'admin@financeiro.com', password: '123456' },
    });
    console.log('Seed: usuário admin@financeiro.com / 123456 criado.');
  }

  // ── Transações de demonstração ───────────────────────────────────────────────
  const txCount = await prisma.transaction.count();
  if (txCount > 0) return;

  const cats = await prisma.category.findMany();
  const c = (name) => cats.find((x) => x.name === name)?.id;

  const transactions = [
    // ── Dezembro 2025 ──
    { description: 'Salário dezembro',     value: 4200.00, date: '2025-12-05', categoryId: c('income') },
    { description: '13º salário',          value: 4200.00, date: '2025-12-10', categoryId: c('income') },
    { description: 'Aluguel',              value: 1200.00, date: '2025-12-05', categoryId: c('bills') },
    { description: 'Supermercado',         value:  520.90, date: '2025-12-08', categoryId: c('food') },
    { description: 'Confraternização fim de ano', value: 180.00, date: '2025-12-15', categoryId: c('entertainment') },
    { description: 'Passagem rodoviária',  value:  145.00, date: '2025-12-20', categoryId: c('transport') },
    { description: 'Internet + TV',        value:  149.90, date: '2025-12-10', categoryId: c('bills') },
    { description: 'Restaurante família',  value:  210.00, date: '2025-12-25', categoryId: c('food') },
    { description: 'Presente de Natal',    value:  320.00, date: '2025-12-22', categoryId: c('entertainment') },
    { description: 'Combustível',          value:  180.00, date: '2025-12-18', categoryId: c('transport') },

    // ── Janeiro 2026 ──
    { description: 'Salário janeiro',      value: 4200.00, date: '2026-01-05', categoryId: c('income') },
    { description: 'Aluguel',              value: 1200.00, date: '2026-01-05', categoryId: c('bills') },
    { description: 'IPTU parcela 1/10',    value:  210.00, date: '2026-01-10', categoryId: c('bills') },
    { description: 'Supermercado',         value:  498.30, date: '2026-01-12', categoryId: c('food') },
    { description: 'Academia',             value:   89.90, date: '2026-01-02', categoryId: c('entertainment') },
    { description: 'Uber',                 value:   67.40, date: '2026-01-15', categoryId: c('transport') },
    { description: 'Conta de luz',         value:  134.60, date: '2026-01-15', categoryId: c('bills') },
    { description: 'Lanche',               value:   42.00, date: '2026-01-20', categoryId: c('food') },
    { description: 'Streaming (Netflix, Spotify)', value: 65.80, date: '2026-01-05', categoryId: c('entertainment') },
    { description: 'Combustível',          value:  190.00, date: '2026-01-22', categoryId: c('transport') },

    // ── Fevereiro 2026 ──
    { description: 'Salário fevereiro',    value: 4200.00, date: '2026-02-05', categoryId: c('income') },
    { description: 'Aluguel',              value: 1200.00, date: '2026-02-05', categoryId: c('bills') },
    { description: 'Supermercado',         value:  430.10, date: '2026-02-10', categoryId: c('food') },
    { description: 'Carnaval — viagem',    value:  850.00, date: '2026-02-28', categoryId: c('entertainment') },
    { description: 'Combustível',          value:  160.00, date: '2026-02-14', categoryId: c('transport') },
    { description: 'Academia',             value:   89.90, date: '2026-02-02', categoryId: c('entertainment') },
    { description: 'Internet + TV',        value:  149.90, date: '2026-02-10', categoryId: c('bills') },
    { description: 'Conta de água',        value:   58.40, date: '2026-02-18', categoryId: c('bills') },
    { description: 'Restaurante',          value:   95.00, date: '2026-02-14', categoryId: c('food') },
    { description: 'IPTU parcela 2/10',    value:  210.00, date: '2026-02-10', categoryId: c('bills') },

    // ── Março 2026 ──
    { description: 'Salário março',        value: 4200.00, date: '2026-03-05', categoryId: c('income') },
    { description: 'Freelance desenvolvimento', value: 1500.00, date: '2026-03-18', categoryId: c('income') },
    { description: 'Aluguel',              value: 1200.00, date: '2026-03-05', categoryId: c('bills') },
    { description: 'Supermercado',         value:  512.70, date: '2026-03-09', categoryId: c('food') },
    { description: 'IPVA',                 value:  620.00, date: '2026-03-15', categoryId: c('bills') },
    { description: 'Combustível',          value:  175.00, date: '2026-03-20', categoryId: c('transport') },
    { description: 'Academia',             value:   89.90, date: '2026-03-02', categoryId: c('entertainment') },
    { description: 'Cinema',               value:   54.00, date: '2026-03-22', categoryId: c('entertainment') },
    { description: 'Internet + TV',        value:  149.90, date: '2026-03-10', categoryId: c('bills') },
    { description: 'Farmácia',             value:   87.30, date: '2026-03-12', categoryId: c('food') },
    { description: 'IPTU parcela 3/10',    value:  210.00, date: '2026-03-10', categoryId: c('bills') },

    // ── Abril 2026 ──
    { description: 'Salário abril',        value: 4200.00, date: '2026-04-05', categoryId: c('income') },
    { description: 'Aluguel',              value: 1200.00, date: '2026-04-05', categoryId: c('bills') },
    { description: 'Supermercado',         value:  475.90, date: '2026-04-07', categoryId: c('food') },
    { description: 'Show de música',       value:  220.00, date: '2026-04-19', categoryId: c('entertainment') },
    { description: 'Combustível',          value:  185.00, date: '2026-04-11', categoryId: c('transport') },
    { description: 'Academia',             value:   89.90, date: '2026-04-02', categoryId: c('entertainment') },
    { description: 'Internet + TV',        value:  149.90, date: '2026-04-10', categoryId: c('bills') },
    { description: 'Conta de luz',         value:  142.80, date: '2026-04-15', categoryId: c('bills') },
    { description: 'Restaurante',          value:  130.00, date: '2026-04-25', categoryId: c('food') },
    { description: 'Uber',                 value:   48.90, date: '2026-04-28', categoryId: c('transport') },
    { description: 'IPTU parcela 4/10',    value:  210.00, date: '2026-04-10', categoryId: c('bills') },

    // ── Maio 2026 ──
    { description: 'Salário maio',         value: 4200.00, date: '2026-05-05', categoryId: c('income') },
    { description: 'Aluguel',              value: 1200.00, date: '2026-05-05', categoryId: c('bills') },
    { description: 'Supermercado',         value:  389.60, date: '2026-05-06', categoryId: c('food') },
    { description: 'Academia',             value:   89.90, date: '2026-05-02', categoryId: c('entertainment') },
    { description: 'Internet + TV',        value:  149.90, date: '2026-05-10', categoryId: c('bills') },
    { description: 'Combustível',          value:  170.00, date: '2026-05-12', categoryId: c('transport') },
    { description: 'Presente dia das mães', value: 250.00, date: '2026-05-11', categoryId: c('entertainment') },
    { description: 'Farmácia',             value:   62.40, date: '2026-05-14', categoryId: c('food') },
  ];

  await prisma.transaction.createMany({
    data: transactions.map((t) => ({ id: uuidv4(), ...t })),
  });

  console.log(`Seed: ${transactions.length} transações de demonstração criadas.`);
}

module.exports = { seed };
