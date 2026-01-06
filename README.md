# TribeChat - IRC WebChat Client

TribeChat is a modern, real-time messaging application built with AdonisJS and Quasar Framework. It's now a Progressive Web App (PWA) that can be installed on any device!

## ✨ Features

- 💬 Real-time messaging with WebSocket support
- 👥 Multi-channel communication
- 🔐 Secure authentication
- 📱 Progressive Web App (PWA) - Install on any device
- 🌙 Dark mode support
- 🚀 Production-ready with Docker
- 📊 Health checks and monitoring
- 🔄 Offline support (PWA)

---

## 🚀 Quick Start (Development)

This project runs via **Docker Compose** (frontend + backend + database).

### 1. Clone the Repository

```bash
git clone https://github.com/damianecek/TribeChat.git
cd TribeChat
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

### 3. Generate APP_KEY

APP_KEY is required for security (cookie encryption, sessions):

```bash
docker compose run --rm backend node ace generate:key
```

Copy the generated key to `backend/.env` in the `APP_KEY` field.

### 4. Start the Project

```bash
docker compose up --build
```

### 5. Access the Application

* **Frontend**: [http://localhost:9000](http://localhost:9000) (dev mode)
* **Backend API**: [http://localhost:3333](http://localhost:3333)
* **Database**: PostgreSQL on port `5432`

Migrations run automatically when the backend starts.

---

## 📦 Production Deployment

For production deployment, see the comprehensive guide:

👉 **[Production Deployment Guide](DEPLOYMENT.md)**

Quick production start:

```bash
# Configure environment
cp backend/.env.production.example backend/.env
# Edit backend/.env with your settings

# Generate APP_KEY
docker compose -f docker-compose.production.yml run --rm backend node ace generate:key

# Build and start
docker compose -f docker-compose.production.yml up -d --build
```

---

## 📱 Progressive Web App (PWA)

TribeChat is a fully functional PWA! It can be installed on any device and works offline.

**Features:**
- 📲 Install on mobile and desktop
- ⚡ Fast loading with caching
- 🔌 Offline support
- 🎨 Native app experience

For complete PWA documentation, see:

👉 **[PWA Guide](PWA_GUIDE.md)**

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Complete production deployment instructions
- **[Environment Variables](ENV_VARIABLES.md)** - All environment configuration options
- **[PWA Guide](PWA_GUIDE.md)** - Progressive Web App features and setup

---

## 🛠️ Technology Stack

### Backend
- **AdonisJS 6** - Node.js web framework
- **PostgreSQL** - Database
- **Socket.IO** - Real-time communication
- **TypeScript** - Type-safe code

### Frontend
- **Quasar Framework** - Vue 3 component library
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **TypeScript** - Type-safe code
- **PWA** - Progressive Web App support

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Production web server

---

## 🔧 Development Commands

### Backend

```bash
cd backend

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

### Frontend

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Build PWA
quasar build -m pwa

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🗄️ Database Management

### Reset Database

```bash
docker compose down -v
```

This removes all data including the database volume.

### Run Migrations

```bash
# Development
docker compose exec backend node ace migration:run

# Production
docker compose -f docker-compose.production.yml exec backend node ace migration:run
```

### Rollback Migrations

```bash
docker compose exec backend node ace migration:rollback
```

---

## 🔍 API Endpoints

### Health Check
- `GET /health` - Check backend health status

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout (requires auth)
- `GET /me` - Get current user (requires auth)

### Users
- `GET /users` - List all users (requires auth)
- `PATCH /users/status` - Update user status (requires auth)

### Channels
- `GET /channels` - List all channels (requires auth)
- `POST /channels` - Create channel (requires auth)
- `GET /channels/:id` - Get channel details (requires auth)
- `GET /channels/:id/members` - Get channel members (requires auth)
- `PUT /channels/:id` - Update channel (requires auth)
- `DELETE /channels/:id` - Delete channel (requires auth)

### User Channels
- `GET /user-channels` - List user's channels (requires auth)
- `POST /user-channels` - Join channel (requires auth)
- `DELETE /user-channels/:id` - Leave channel (requires auth)

---

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Security headers in nginx
- HTTPS support (production)
- SQL injection protection
- XSS protection

---

## 📊 Monitoring & Health Checks

All services include health checks:

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Backend health
curl http://localhost:3333/health

# Frontend health
curl http://localhost:9000/health
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the UNLICENSED license.

---

## 👨‍💻 Author

**damianecek** - [GitHub](https://github.com/damianecek)

---

## 🐛 Issues & Support

If you encounter any issues or have questions:
- [Create an Issue](https://github.com/damianecek/TribeChat/issues)
- Check the documentation in this repository

---

## 🎯 Roadmap

Future features planned:
- [ ] Push notifications
- [ ] File sharing
- [ ] Voice/video calls
- [ ] Message reactions
- [ ] User typing indicators
- [ ] Message search
- [ ] User blocking
- [ ] Channel moderation tools
