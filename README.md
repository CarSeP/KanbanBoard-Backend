# KanbanBoard Backend

RESTful API for a Kanban board with real-time WebSocket support.

## Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express 5
- **ORM:** Prisma 6 + PostgreSQL 17
- **Validation:** Zod 4
- **WebSockets:** Socket.IO 4
- **Testing:** Jest 30

## Models

```
Board (id, name, createdAt, updatedAt)
 └── Column (id, title, order, boardId, createdAt)
       └── Card (id, title, content?, order, columnId, createdAt, updatedAt)
```

## Prerequisites

- Node.js >= 18
- Docker (for PostgreSQL)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables and adjust if needed
cp example.env .env

# 3. Start the database
docker compose up -d

# 4. Run migrations
npx prisma generate
npx prisma migrate dev

# 5. Start development server
npm run dev
```

The HTTP server runs on `http://localhost:3000` and the WebSocket server on port `8080`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server with hot-reload |
| `npm test` | Run tests |
| `npm run swagger` | Generate Swagger documentation |
| `npm run prisma` | Open Prisma Studio |

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/board/` | List boards |
| `PUT` | `/board/` | Create or update a board |
| `GET` | `/board/:id` | Get board with columns and cards |
| `DELETE` | `/board/:id` | Delete a board |
| `PUT` | `/column/` | Create or update a column |
| `DELETE` | `/column/:id` | Delete a column |
| `POST` | `/column/:id/:order` | Reorder a column |
| `PUT` | `/card/` | Create or update a card |
| `DELETE` | `/card/:id` | Delete a card |
| `POST` | `/card/:id/:columnId/:order` | Move a card |

Swagger documentation is available at `/swagger` (development only).

## Project structure

```
src/
├── controller/   # HTTP request handlers
├── interfaces/   # TypeScript interfaces
├── routers/      # Route definitions
├── schemas/      # Zod validation schemas
├── services/     # Business logic and DB access
├── tests/        # Unit tests
├── main.ts       # Express app setup
└── websocket.ts  # Socket.IO server
```
