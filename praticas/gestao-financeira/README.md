# Gestão Financeira

Aplicativo mobile de controle financeiro pessoal desenvolvido com **React Native + Expo** (frontend) e **Node.js + Express + Prisma** (backend).

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Instalação](#configuração-e-instalação)
  - [API (Backend)](#api-backend)
  - [App (Frontend)](#app-frontend)
- [Rodando o Projeto](#rodando-o-projeto)
- [Acesso padrão](#acesso-padrão)
- [Funcionalidades](#funcionalidades)
- [Casos de Uso](#casos-de-uso)
- [Documentação da API](#documentação-da-api)
- [Modelos de Dados](#modelos-de-dados)
- [Telas do App](#telas-do-app)

---

## Visão Geral

O **Gestão Financeira** permite que o usuário registre receitas e despesas, visualize resumos mensais com gráficos e filtre transações por período. Toda a lógica de negócio fica no backend (API REST) e o app mobile consome essa API via rede local.

---

## Stack Tecnológica

### Backend (API)
| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.x | Framework HTTP |
| Prisma | 5.x | ORM |
| SQLite | — | Banco de dados local |
| Zod | 3.x | Validação de esquema |
| UUID | 9.x | Geração de IDs |
| Nodemon | 3.x | Hot reload em dev |

### Frontend (App)
| Tecnologia | Versão | Função |
|---|---|---|
| React Native | 0.81 | Framework mobile |
| Expo | 54 | Toolchain |
| TypeScript | 5.9 | Tipagem estática |
| React Navigation | 6.x | Navegação |
| Axios | 1.x | Cliente HTTP |
| AsyncStorage | 2.x | Persistência local (token) |
| react-native-svg | 15.x | Gráfico de pizza |
| @expo/vector-icons | — | Ícones (MaterialIcons) |

---

## Estrutura do Projeto

```
gestao-financeira/
├── gestao-financeira-api/        # Backend
│   ├── prisma/
│   │   └── schema.prisma         # Schema do banco de dados
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js             # Instância do Prisma Client
│   │   │   └── seed.js           # Dados iniciais (usuário + categorias + transações)
│   │   ├── routes/
│   │   │   ├── auth.js           # POST /auth/login
│   │   │   ├── categories.js     # CRUD /categories
│   │   │   └── transactions.js   # CRUD /transactions
│   │   └── server.js             # Entrypoint da API
│   ├── .env.example
│   └── package.json
│
└── gestao-financeira-app/        # Frontend (React Native)
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.tsx   # Contexto de autenticação global
    │   ├── screens/
    │   │   ├── LoginScreen.tsx
    │   │   ├── TransactionListScreen.tsx
    │   │   ├── AddTransactionScreen.tsx
    │   │   └── SummaryScreen.tsx
    │   ├── components/
    │   │   ├── TransactionCard.tsx
    │   │   ├── EditDeleteModal.tsx
    │   │   ├── MonthYearFilter.tsx
    │   │   └── CategoryPickerModal.tsx
    │   ├── services/
    │   │   └── api.ts            # Funções de chamada à API (Axios)
    │   └── types.ts              # Interfaces e tipos TypeScript
    ├── App.tsx                   # Navegação raiz + providers
    ├── tsconfig.json
    └── package.json
```

---

## Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 9 ou superior
- **Expo Go** instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Celular e computador na **mesma rede Wi-Fi**

---

## Configuração e Instalação

### API (Backend)

```bash
cd gestao-financeira-api

# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente (opcional)
cp .env.example .env
# edite .env se quiser mudar a porta

# 3. Criar o banco de dados e aplicar o schema
npm run setup
# equivalente a: npx prisma db push

# 4. Descobrir o IP da sua máquina (necessário para o app)
#    Windows: ipconfig   →  "Endereço IPv4"
#    macOS/Linux: ifconfig / ip addr
```

> O banco SQLite (`gestao_financeira.db`) é criado automaticamente em `prisma/` na primeira execução. O seed popula automaticamente categorias, usuário admin e transações de demonstração.

---

### App (Frontend)

```bash
cd gestao-financeira-app

# 1. Instalar dependências
npm install

# 2. Configurar o IP da API
# Edite o arquivo src/services/api.ts e troque o IP:
#   const BASE_URL = 'http://SEU_IP_LOCAL:3000';
#
# Exemplos:
#   Celular físico na mesma Wi-Fi → 'http://192.168.0.5:3000'
#   Emulador Android (AVD)        → 'http://10.0.2.2:3000'
```

---

## Rodando o Projeto

### 1. Iniciar a API

```bash
cd gestao-financeira-api

# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

A API ficará disponível em `http://0.0.0.0:3000`.

### 2. Iniciar o App

```bash
cd gestao-financeira-app

# Limpar cache e iniciar (recomendado na primeira vez)
npx expo start --clear

# Iniciar normalmente
npx expo start
```

Escaneie o QR code com o **Expo Go** no celular.

---

## Acesso Padrão

| Campo | Valor |
|---|---|
| E-mail | `admin@financeiro.com` |
| Senha | `123456` |

> Criado automaticamente pelo seed na primeira execução da API.

---

## Funcionalidades

- **Autenticação** — login com e-mail e senha, token salvo localmente
- **Listagem de transações** — filtrada por mês/ano com pull-to-refresh
- **Resumo financeiro** — cards de receitas, despesas e saldo no topo
- **Adicionar transação** — descrição, valor, data e categoria
- **Editar / excluir transação** — via modal de ações
- **Gráfico de pizza** — despesas por categoria (tela Resumo)
- **Gráfico de barras** — proporção por categoria
- **Categorias customizadas** — criação inline no picker de categorias
- **Filtro por período** — seletor de mês/ano com os períodos disponíveis

---

## Casos de Uso

### UC01 — Login
**Ator:** Usuário  
**Fluxo:**
1. Usuário informa e-mail e senha.
2. App valida formato do e-mail e comprimento mínimo da senha (4 chars).
3. App envia credenciais para `POST /auth/login`.
4. API verifica no banco; se correto, retorna `{ user, token }`.
5. Token e dados do usuário são salvos no AsyncStorage.
6. App redireciona para a tela principal (Transações).

**Exceção:** credenciais inválidas → mensagem de erro exibida inline.

---

### UC02 — Visualizar Transações do Mês
**Ator:** Usuário autenticado  
**Fluxo:**
1. Tela carrega automaticamente as transações do mês atual.
2. Cards de resumo (Receitas / Despesas / Saldo) são calculados no front.
3. Usuário pode selecionar outro mês/ano no filtro de período.
4. Pull-to-refresh recarrega os dados.

---

### UC03 — Adicionar Transação
**Ator:** Usuário autenticado  
**Fluxo:**
1. Usuário acessa a aba "Adicionar".
2. Preenche: descrição, valor (R$), data (AAAA-MM-DD) e categoria.
3. Pode criar uma nova categoria inline (nome, ícone, cor, tipo).
4. Toca em "Adicionar Transação".
5. App envia `POST /transactions`.
6. Confirmação exibida; formulário é limpo para novo lançamento.

**Validações:** todos os campos obrigatórios, valor > 0, data no formato correto.

---

### UC04 — Editar Transação
**Ator:** Usuário autenticado  
**Fluxo:**
1. Na lista, usuário toca no ícone "⋮" de uma transação.
2. Modal de ações é exibido com "Editar" e "Excluir".
3. Usuário escolhe "Editar" → formulário pré-preenchido abre.
4. Altera os campos desejados e toca em "Salvar Alterações".
5. App envia `PUT /transactions/:id`.
6. Retorna para a lista atualizada.

---

### UC05 — Excluir Transação
**Ator:** Usuário autenticado  
**Fluxo:**
1. Usuário toca no ícone "⋮" e escolhe "Excluir".
2. Tela de confirmação é exibida com nome da transação.
3. Usuário confirma → App envia `DELETE /transactions/:id`.
4. Transação é removida da lista sem recarregar.

---

### UC06 — Visualizar Resumo Mensal
**Ator:** Usuário autenticado  
**Fluxo:**
1. Usuário acessa a aba "Resumo".
2. Totais de receitas, despesas e saldo do período são exibidos.
3. Gráfico de pizza mostra a proporção de despesas por categoria.
4. Gráfico de barras lista categorias em ordem decrescente de valor.
5. Seção de receitas lista cada entrada individualmente.
6. Usuário pode trocar o período pelo filtro de mês/ano.

---

### UC07 — Criar Categoria Personalizada
**Ator:** Usuário autenticado  
**Fluxo:**
1. No formulário de transação, usuário abre o seletor de categorias.
2. Toca em "+ Nova Categoria".
3. Preenche: nome interno, nome exibido, ícone (MaterialIcons), cor e tipo (receita/despesa).
4. Toca em "Criar Categoria" → App envia `POST /categories`.
5. Categoria criada é selecionada automaticamente.

---

## Documentação da API

Base URL: `http://<IP_LOCAL>:3000`

Todos os endpoints retornam JSON. Erros seguem o formato:
```json
{ "error": "mensagem", "details": [...] }
```

---

### Autenticação

#### `POST /auth/login`
Autentica o usuário e retorna um token.

**Body:**
```json
{
  "email": "admin@financeiro.com",
  "password": "123456"
}
```

**Resposta 200:**
```json
{
  "user": { "id": "uuid", "name": "Admin", "email": "admin@financeiro.com" },
  "token": "base64token"
}
```

| Código | Situação |
|---|---|
| 200 | Login bem-sucedido |
| 400 | Dados inválidos (e-mail mal formatado, senha vazia) |
| 401 | E-mail ou senha incorretos |

---

### Categorias

#### `GET /categories`
Lista todas as categorias ordenadas por padrão > nome.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "income",
    "displayName": "Renda",
    "icon": "attach-money",
    "background": "#B5EAD7",
    "isIncome": true,
    "isDefault": true
  }
]
```

---

#### `POST /categories`
Cria uma nova categoria personalizada.

**Body:**
```json
{
  "name": "health",
  "displayName": "Saúde",
  "icon": "favorite",
  "background": "#FF9AA2",
  "isIncome": false
}
```

| Código | Situação |
|---|---|
| 201 | Criada com sucesso |
| 400 | Dados inválidos |
| 409 | Nome já existe |

---

#### `PUT /categories/:id`
Atualiza campos de uma categoria (todos opcionais).

**Body (parcial):**
```json
{ "displayName": "Saúde e Bem-estar" }
```

| Código | Situação |
|---|---|
| 200 | Atualizada |
| 400 | Dados inválidos ou nenhum campo enviado |
| 404 | Categoria não encontrada |

---

#### `DELETE /categories/:id`
Remove uma categoria personalizada.

| Código | Situação |
|---|---|
| 204 | Removida com sucesso |
| 400 | Categoria padrão (não pode ser excluída) |
| 404 | Não encontrada |
| 409 | Possui transações vinculadas |

---

### Transações

#### `GET /transactions/months`
Retorna os meses com transações registradas + mês atual.

**Resposta 200:**
```json
["2026-05", "2026-04", "2026-03", "2026-02", "2026-01", "2025-12"]
```

---

#### `GET /transactions?month=5&year=2026`
Lista transações com categoria aninhada. Parâmetros opcionais.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "description": "Salário maio",
    "value": 4200.00,
    "date": "2026-05-05",
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "income",
      "displayName": "Renda",
      "icon": "attach-money",
      "background": "#B5EAD7",
      "isIncome": true,
      "isDefault": true
    }
  }
]
```

---

#### `POST /transactions`
Cria uma nova transação.

**Body:**
```json
{
  "description": "Supermercado",
  "value": 250.90,
  "date": "2026-05-20",
  "categoryId": "uuid-da-categoria"
}
```

| Código | Situação |
|---|---|
| 201 | Criada (retorna objeto com categoria aninhada) |
| 400 | Dados inválidos ou categoria não encontrada |

---

#### `PUT /transactions/:id`
Atualiza campos de uma transação (todos opcionais).

**Body (parcial):**
```json
{ "value": 310.50, "description": "Supermercado semanal" }
```

| Código | Situação |
|---|---|
| 200 | Atualizada |
| 400 | Dados inválidos ou categoria não encontrada |
| 404 | Transação não encontrada |

---

#### `DELETE /transactions/:id`

| Código | Situação |
|---|---|
| 204 | Removida com sucesso |
| 404 | Não encontrada |

---

## Modelos de Dados

```
User
  id          String (UUID)
  name        String
  email       String (único)
  password    String

Category
  id          String (UUID)
  name        String (único) — identificador interno
  displayName String          — nome exibido no app
  icon        String          — nome do MaterialIcon
  background  String          — cor hex de fundo
  isIncome    Boolean
  isDefault   Boolean         — categorias padrão não podem ser excluídas

Transaction
  id          String (UUID)
  description String
  value       Float
  date        String          — formato YYYY-MM-DD
  categoryId  String (FK → Category)
```

---

## Telas do App

| Tela | Descrição |
|---|---|
| **Login** | Formulário com e-mail, senha e validação inline |
| **Transações** | Lista do mês com cards de resumo (receitas/despesas/saldo) e filtro de período |
| **Adicionar** | Formulário para nova transação ou edição (rota modal) |
| **Resumo** | Gráfico de pizza + barras de proporção por categoria + lista de receitas |

---

## Categorias Padrão (Seed)

| Nome interno | Exibição | Tipo |
|---|---|---|
| `income` | Renda | Receita |
| `food` | Alimentação | Despesa |
| `transport` | Transporte | Despesa |
| `entertainment` | Lazer | Despesa |
| `bills` | Contas | Despesa |
