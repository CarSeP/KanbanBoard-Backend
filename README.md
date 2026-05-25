# KanbanBoard Backend

RESTful API for a collaborative Kanban board with real-time WebSocket support, Google OAuth authentication, and role-based access control.

## Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express 5
- **ORM:** Prisma 6 + PostgreSQL 17
- **Validation:** Zod 4
- **WebSockets:** Socket.IO 4
- **Auth:** JWT + Google OAuth 2.0
- **Logging:** Pino
- **Testing:** Jest 30

## Models

```
User (id, email?, name, provider: GOOGLE|GUEST)
  └── BoardMember (userId, boardId, role: OWNER|ADMIN|EDITOR|VIEWER)

Board (id[7], name, createdAt, updatedAt)
  ├── BoardMember[]
  ├── BoardInvitation (token[32], role, expiresAt)
  │     └── invitedBy: User
  └── Column (id, title, order, boardId)
        └── Card (id, title, content?, order, columnId, createdAt, updatedAt)
```

## Prerequisites

- Node.js >= 18
- Docker (for PostgreSQL)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp example.env .env

# 3. Start the database
docker compose up -d

# 4. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# 5. Start development server
npm run dev
```

The HTTP server runs on `http://localhost:3000` and the WebSocket server on port `8080`.

## Environment variables

| Variable               | Description                           |
| ---------------------- | ------------------------------------- |
| `PORT`                 | HTTP server port (default: 3000)      |
| `WS_PORT`              | WebSocket server port (default: 8080) |
| `POSTGRES_USER`        | PostgreSQL user                       |
| `POSTGRES_PASSWORD`    | PostgreSQL password                   |
| `POSTGRES_DB`          | PostgreSQL database name              |
| `POSTGRES_PORT`        | PostgreSQL port                       |
| `DATABASE_URL`         | Prisma connection string              |
| `JWT_SECRET`           | Secret key for JWT signing            |
| `FRONTEND_URL`         | Frontend URL for CORS                 |
| `APP_URL`              | Application URL for OAuth callbacks   |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret            |
| `GOOGLE_REDIRECT_URI`  | Google OAuth redirect URI             |

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Development server with hot-reload |
| `npm test`        | Run tests                          |
| `npm run swagger` | Generate Swagger documentation     |
| `npm run prisma`  | Open Prisma Studio                 |

## API

### Authentication

| Method | Path                    | Description                | Auth |
| ------ | ----------------------- | -------------------------- | ---- |
| `POST` | `/auth/register/guest`  | Sign in as guest           | No   |
| `GET`  | `/auth/validate`        | Validate current session   | No   |
| `POST` | `/auth/logout`          | Sign out                   | No   |
| `GET`  | `/auth/google`          | Initiate Google OAuth flow | No   |
| `GET`  | `/auth/google/callback` | Google OAuth callback      | No   |

### Boards

| Method   | Path         | Description                      | Auth |
| -------- | ------------ | -------------------------------- | ---- |
| `GET`    | `/board/`    | List all boards                  | Yes  |
| `PUT`    | `/board/`    | Create or update a board         | Yes  |
| `GET`    | `/board/:id` | Get board with columns and cards | Yes  |
| `DELETE` | `/board/:id` | Delete a board                   | Yes  |

### Invitations

| Method | Path                          | Description                | Auth |
| ------ | ----------------------------- | -------------------------- | ---- |
| `POST` | `/board/:boardId/invite/link` | Generate invitation link   | Yes  |
| `POST` | `/board/:boardId/invite/user` | Invite user by email       | Yes  |
| `POST` | `/board/invite/accept/:token` | Accept invitation by token | Yes  |

### Columns

| Method   | Path                 | Description               | Auth |
| -------- | -------------------- | ------------------------- | ---- |
| `PUT`    | `/column/`           | Create or update a column | Yes  |
| `DELETE` | `/column/:id`        | Delete a column           | Yes  |
| `POST`   | `/column/:id/:order` | Reorder a column          | Yes  |

### Cards

| Method   | Path                         | Description             | Auth |
| -------- | ---------------------------- | ----------------------- | ---- |
| `PUT`    | `/card/`                     | Create or update a card | Yes  |
| `DELETE` | `/card/:id`                  | Delete a card           | Yes  |
| `POST`   | `/card/:id/:columnId/:order` | Move a card             | Yes  |

Swagger documentation is available at `/swagger` (development only).

## Authentication

The API uses JWT-based authentication via cookies or `Authorization: Bearer <token>` headers. All board, column, card, and invitation endpoints require authentication.

Users can authenticate via:

- **Guest:** `POST /auth/register/guest` returns a JWT for anonymous users
- **Google OAuth:** `GET /auth/google` initiates the OAuth 2.0 flow

## Roles

Boards support role-based access control through `BoardMember`:

| Role     | Permissions                                           |
| -------- | ----------------------------------------------------- |
| `OWNER`  | Full control including deletion and member management |
| `ADMIN`  | Manage board content and members                      |
| `EDITOR` | Create, edit, and delete columns and cards            |
| `VIEWER` | Read-only access                                      |

## WebSocket

The Socket.IO server broadcasts real-time board updates. Clients can join board-specific rooms to receive targeted updates.

| Event        | Direction       | Description                                           |
| ------------ | --------------- | ----------------------------------------------------- |
| `board`      | Client → Server | Broadcast board update (optionally scoped to a board) |
| `joinBoard`  | Client → Server | Join a board's room                                   |
| `leaveBoard` | Client → Server | Leave a board's room                                  |
| `disconnect` | Client → Server | Client disconnected                                   |

## Related projects

- [KanbanBoard Frontend](https://github.com/CarSeP/KanbanBoard-Frontend) — React frontend for this API

## Project structure

```
├── index.ts                  # Entry point
├── swagger.ts                # Swagger generation script
├── generated/
│   └── prisma/               # Generated Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
├── http/                     # HTTP request examples (VS Code REST Client)
└── src/
    ├── controller/           # HTTP request handlers
    │   ├── auth.controller.ts
    │   ├── board.controller.ts
    │   ├── card.controller.ts
    │   ├── column.controller.ts
    │   └── invitation.controller.ts
    ├── interfaces/           # TypeScript interfaces
    │   ├── board.interface.ts
    │   ├── card.interface.ts
    │   ├── column.interface.ts
    │   ├── role.type.ts
    │   └── user.interface.ts
    ├── middlewares/          # Express middlewares
    │   ├── auth.middleware.ts
    │   └── swagger.middleware.ts
    ├── routers/              # Route definitions
    │   ├── auth.router.ts
    │   ├── board.router.ts
    │   ├── card.router.ts
    │   ├── column.router.ts
    │   ├── invitation.router.ts
    │   ├── notFound.router.ts
    │   └── swagger.router.ts
    ├── schemas/              # Zod validation schemas
    │   ├── board.schema.ts
    │   ├── card.schema.ts
    │   ├── column.schema.ts
    │   └── invitation.schema.ts
    ├── services/             # Business logic and DB access
    │   ├── auth.service.ts
    │   ├── board.service.ts
    │   ├── card.service.ts
    │   ├── column.service.ts
    │   ├── cors.service.ts
    │   ├── google-auth.service.ts
    │   ├── id.service.ts
    │   ├── invitation.service.ts
    │   ├── pino.service.ts
    │   └── prisma.service.ts
    ├── tests/                # Unit tests
    ├── main.ts               # Express app setup
    └── websocket.ts          # Socket.IO server
```

## License

MIT
