<div align="center">
  <h1>💬 ChatHub</h1>
  <p><strong>Real-time messaging platform with voice & video calling</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Go-1.26-00ADD8?logo=go" alt="Go">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/GORM-ORM-00A86B" alt="GORM">
    <img src="https://img.shields.io/badge/WebSocket-Real--time-010101" alt="WebSocket">
    <img src="https://img.shields.io/badge/WebRTC-P2P-EE2C2C" alt="WebRTC">
    <img src="https://img.shields.io/badge/Cloudflare_R2-Storage-F38020?logo=cloudflare" alt="R2">
    <img src="https://img.shields.io/badge/Vite-Build-646CFF?logo=vite" alt="Vite">
  </p>
</div>

---

## ✨ Features

- **Real-time messaging** — WebSocket-powered instant chat with typing indicators
- **Voice & video calls** — WebRTC-based peer-to-peer calling via PeerJS
- **File sharing** — Upload images, videos, and files to Cloudflare R2 (up to 50MB)
- **Direct & group chats** — 1-on-1 conversations and group messaging
- **User search** — Find users by name or email
- **Clerk authentication** — Secure auth with JWT session tokens
- **Webhook sync** — Automatic user profile sync via Clerk webhooks
- **Responsive UI** — Clean, modern interface built with React + Vite

## 🏗 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   Go API    │────▶│  PostgreSQL │
│   Frontend  │     │   (Chi)     │     │   + GORM    │
│   Vite      │     │   :5000     │     │             │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │  WebSocket        │  WebSocket
       │  (socket.io)      │  (gorilla/websocket)
       ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PeerJS     │     │  WebSocket  │     │ Cloudflare  │
│  Server     │     │    Hub      │     │     R2      │
│  :5001      │     │  (Go)       │     │  (S3 API)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Backend (Go)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Router | `chi` v5 | Lightweight, idiomatic HTTP routing |
| ORM | `GORM` | PostgreSQL database access |
| Auth | `Clerk SDK` | JWT session verification |
| WebSocket | `gorilla/websocket` | Real-time bidirectional communication |
| File storage | `AWS SDK v2` (S3) | Cloudflare R2 file uploads |
| Webhooks | `Svix` | Clerk webhook signature verification |
| Migrations | `dbmate` | Database schema versioning |

### Frontend (React)

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Auth | Clerk React SDK |
| Routing | React Router v7 |
| Styling | CSS-in-JS (inline styles) |
| WebSocket | Native WebSocket client |
| WebRTC | PeerJS |
| Icons | Lucide React |

## 🚀 Getting Started

### Prerequisites

- Go 1.26+
- Node.js 24+
- PostgreSQL 16+
- PeerJS server (optional, for calls)

### Environment Variables

The app uses separate config for API, WebSocket, and PeerJS connectivity:

- `CLIENT_URL` - frontend origin used by backend CORS
- `VITE_API_URL` - API base URL, usually `http://localhost:5000`
- `VITE_WS_URL` - optional explicit WebSocket URL, usually `ws://localhost:5000/ws`
- `VITE_PEER_HOST` - optional PeerJS host, defaults to `localhost`
- `VITE_PEER_PORT` - PeerJS port, defaults to `5001`
- `VITE_PEER_PATH` - PeerJS path, defaults to `/peerjs`

### Backend

```bash
# Clone and navigate
cd backend-go

# Copy environment config
cp .env.example .env
# Edit .env with your own credentials

# Run database migrations
dbmate up

# Start the server
go run ./cmd/server/
```

Server starts on **`http://localhost:5000`**

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App opens at **`http://localhost:5173`**

### PeerJS Server (for calls)

```bash
npx peerjs --port 5001 --path /peerjs
```

### Full Stack with Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:5002`
- PeerJS server: `http://localhost:5001/peerjs`

### GitHub Container Registry

The backend image is published by GitHub Actions on pushes to `main`:

- Image: `ghcr.io/<your-github-username>/real-time-chat-app-backend`
- Tags: `latest` and the short commit SHA
- Workflow: [`.github/workflows/backend-image.yml`](/home/h/real-time-chat-app/.github/workflows/backend-image.yml)

Pull it with:

```bash
docker pull ghcr.io/<your-github-username>/real-time-chat-app-backend:latest
```

### API Documentation

```bash
cd backend-go
npx @redocly/cli preview-docs openapi.yaml
```

Or build static HTML:

```bash
npx @redocly/cli build-docs openapi.yaml -o docs/index.html
```

## 📁 Project Structure

```
.
├── backend-go/                  # 🦫 Go backend
│   ├── cmd/server/main.go       # Entry point
│   ├── db/migrations/           # dbmate SQL migrations
│   ├── internal/
│   │   ├── config/              # Environment config
│   │   ├── db/                  # Database connection
│   │   ├── handler/             # HTTP handlers
│   │   ├── middleware/          # Auth middleware
│   │   ├── model/               # GORM models
│   │   ├── repository/          # Data access layer
│   │   ├── router/              # Route setup
│   │   └── ws/                  # WebSocket hub
│   ├── openapi.yaml             # API specification
│   └── go.mod
│
├── frontend/                    # ⚛️ React frontend
│   ├── src/
│   │   ├── api/                 # API client
│   │   ├── components/          # Reusable UI components
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Route pages
│   │   └── socket/              # Native WebSocket client
│   ├── package.json
│   └── vite.config.ts
│
└── .github/workflows/           # CI/CD pipelines
```

## 🌐 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | ❌ | Health check |
| `GET` | `/api/users` | ✅ | List all users |
| `POST` | `/api/users` | ✅ | Create/update current user |
| `GET` | `/api/users/search?q=` | ✅ | Search users |
| `GET` | `/api/chats` | ✅ | List user's chats |
| `POST` | `/api/chats` | ✅ | Create a chat |
| `GET` | `/api/chats/:id` | ✅ | Get chat details |
| `DELETE` | `/api/chats/:id` | ✅ | Delete direct chat |
| `GET` | `/api/messages/:chatId` | ✅ | Get messages |
| `POST` | `/api/messages/:chatId` | ✅ | Send message |
| `POST` | `/api/upload` | ✅ | Upload file |
| `POST` | `/api/webhooks/clerk` | ❌ | Clerk webhook |
| `WS` | `/ws` | ❌ | WebSocket connection |

## 🧪 Tech Stack

**Backend:** Go, Chi, GORM, PostgreSQL, gorilla/websocket, Clerk, Cloudflare R2, Svix, godotenv

**Frontend:** React 19, TypeScript, Vite, Clerk, Native WebSocket, PeerJS, React Router, Lucide

**Infrastructure:** Docker, GitHub Actions (CI/CD), Neon (PostgreSQL), Cloudflare R2, Clerk Auth, PeerJS

## 📄 License

MIT
