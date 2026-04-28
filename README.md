# API Entregas

API RESTful para gerenciamento de entregas, desenvolvida com Node.js, Express, TypeScript e PostgreSQL via Prisma ORM. Permite o cadastro de usuários, autenticação com JWT, controle de entregas com fluxo de status e registro de logs por entrega.

## Funcionalidades

- Cadastro e autenticação de usuários com JWT
- Controle de acesso baseado em papéis (RBAC): `customer` e `sale`
- Criação e listagem de entregas
- Atualização de status das entregas com criação automática de log
- Registro manual de logs por entrega
- Visualização de entrega com histórico completo de logs
- Validação de dados com Zod
- Testes automatizados com Jest e Supertest

## Tecnologias

- **Runtime:** Node.js
- **Framework:** Express 5
- **Linguagem:** TypeScript
- **ORM:** Prisma 7 + driver `pg` para PostgreSQL
- **Autenticação:** JSON Web Token (jsonwebtoken) + bcrypt
- **Validação:** Zod
- **Testes:** Jest, ts-jest, Supertest, jest-mock-extended
- **Banco de dados:** PostgreSQL (via Docker Compose)

## Pré-requisitos

- Node.js >= 18
- Docker e Docker Compose (para o banco de dados)

## Instalação e execução

```bash
# Clone o repositório
git clone https://github.com/viniciusrbr/api-entregas.git
cd api-entregas

# Instale as dependências
npm install

# Suba o banco de dados PostgreSQL via Docker
docker-compose up -d

# Copie o arquivo de variáveis de ambiente
cp .env-example .env
# Edite o .env com seus valores (veja a seção de variáveis abaixo)

# Execute as migrations do banco
npx prisma migrate deploy

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3333`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env-example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api
JWT_SECRET=sua_chave_secreta_aqui
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo watch (desenvolvimento) |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Executa o build de produção |
| `npm run test:dev` | Executa os testes em modo watch |

## Banco de dados

O schema possui três modelos:

### User

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| name | String | Nome do usuário |
| email | String (único) | E-mail do usuário |
| password | String | Senha (hash bcrypt) |
| role | Enum | `customer` (padrão) ou `sale` |
| createdAt / updatedAt | DateTime | Timestamps automáticos |

### Delivery

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| userId | UUID (FK) | Usuário dono da entrega |
| description | String | Descrição da entrega |
| status | Enum | `processing` (padrão), `shipped` ou `delivered` |
| createdAt / updatedAt | DateTime | Timestamps automáticos |

### DeliveryLog

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| deliveryId | UUID (FK) | Entrega relacionada |
| description | String | Descrição do log |
| createdAt / updatedAt | DateTime | Timestamps automáticos |

## Rotas da API

### Usuários

#### `POST /users`
Cria um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "customer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Sessões

#### `POST /sessions`
Autentica um usuário e retorna um token JWT.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

O token expira em **1 dia** e deve ser enviado nas rotas protegidas como `Authorization: Bearer <token>`.

---

### Entregas

> Todas as rotas de entregas requerem autenticação e papel `sale`.

#### `POST /deliveries`
Cria uma nova entrega.

**Body:**
```json
{
  "user_id": "uuid-do-usuario",
  "description": "Caixa com eletrônicos"
}
```

**Resposta (201):** objeto da entrega criada.

---

#### `GET /deliveries`
Lista todas as entregas com dados do usuário associado.

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "description": "Caixa com eletrônicos",
    "status": "processing",
    "user": {
      "name": "João Silva",
      "email": "joao@email.com"
    }
  }
]
```

---

#### `PATCH /deliveries/:id/status`
Atualiza o status de uma entrega e cria um log automático.

**Body:**
```json
{
  "status": "shipped"
}
```

Status permitidos: `processing` | `shipped` | `delivered`

**Resposta (200):** objeto da entrega atualizada.

---

### Logs de entrega

> Requer autenticação. Criação e listagem exigem papel `sale` ou `customer` conforme a rota.

#### `POST /delivery-logs`
Adiciona um log manual a uma entrega.

> Regras de negócio:
> - Não é possível adicionar logs a entregas com status `delivered`.
> - Só é possível adicionar logs a entregas com status `shipped`.

**Body:**
```json
{
  "delivery_id": "uuid-da-entrega",
  "description": "Entrega saiu para distribuição"
}
```

**Resposta (201):** objeto do log criado.

---

#### `GET /delivery-logs/:delivery_id/show`
Retorna os detalhes de uma entrega com todos os seus logs.

> Clientes (`customer`) só podem visualizar suas próprias entregas.

**Resposta (200):**
```json
{
  "id": "uuid",
  "description": "Caixa com eletrônicos",
  "status": "shipped",
  "user": {
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "logs": [
    {
      "id": "uuid",
      "description": "Status atualizado para shipped",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Autenticação e autorização

Todas as rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

### Papéis (roles)

| Papel | Permissões |
|---|---|
| `sale` | Criar e listar entregas, atualizar status, criar e visualizar logs de qualquer entrega |
| `customer` | Visualizar logs das próprias entregas |

---

## Testes

Os testes utilizam Prisma mockado com `jest-mock-extended`, sem necessidade de banco de dados real.

```bash
# Modo watch (desenvolvimento)
npm run test:dev
```

**Cobertura atual:**
- Criação de usuário (sucesso, e-mail duplicado, e-mail inválido)
- Autenticação (sucesso, geração de token)

---

## Estrutura do projeto

```
src/
├── @types/            # Extensões de tipos do Express
├── configs/           # Configurações (ex: auth JWT)
├── controllers/       # Lógica de negócio por recurso
├── database/          # Inicialização do Prisma e mock para testes
├── middleware/        # Autenticação, autorização e tratamento de erros
├── routes/            # Definição das rotas
├── tests/             # Testes automatizados
├── utils/             # Utilitários (ex: AppError)
├── env.ts             # Validação de variáveis de ambiente com Zod
├── app.ts             # Configuração do Express
└── server.ts          # Ponto de entrada do servidor
prisma/
└── schema.prisma      # Schema do banco de dados
```

---