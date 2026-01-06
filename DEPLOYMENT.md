# Production Deployment Guide

This guide provides detailed instructions for deploying TribeChat in a production environment.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional, for custom domain)
- SSL certificates (optional, for HTTPS)
- PostgreSQL database (included in docker-compose)

## Quick Start (Production)

### 1. Clone the Repository

```bash
git clone https://github.com/damianecek/TribeChat.git
cd TribeChat
```

### 2. Configure Backend Environment

Copy the example environment file and configure it:

```bash
cp backend/.env.production.example backend/.env
```

Edit `backend/.env` and configure the following:

```env
# Generate APP_KEY with:
# docker compose -f docker-compose.production.yml run --rm backend node ace generate:key
APP_KEY=your_generated_app_key_here

# Database credentials (change these!)
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password
DB_DATABASE=tribechat_prod

# CORS origins (comma-separated, include your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Other settings
NODE_ENV=production
LOG_LEVEL=info
```

### 3. Generate APP_KEY

```bash
docker compose -f docker-compose.production.yml run --rm backend node ace generate:key
```

Copy the generated key to your `backend/.env` file.

### 4. Build and Start Services

```bash
docker compose -f docker-compose.production.yml up -d --build
```

This will:
- Build optimized production images for frontend and backend
- Start PostgreSQL database
- Run database migrations
- Start the backend API on port 3333
- Start the frontend on port 80

### 5. Verify Deployment

Check that all services are running:

```bash
docker compose -f docker-compose.production.yml ps
```

Test the health endpoints:

```bash
# Backend health check
curl http://localhost:3333/health

# Frontend health check
curl http://localhost/health
```

## Production Configuration

### Environment Variables

#### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| APP_KEY | Application encryption key | (required) |
| NODE_ENV | Environment mode | production |
| PORT | Backend port | 3333 |
| HOST | Host address | 0.0.0.0 |
| DB_HOST | Database host | db |
| DB_PORT | Database port | 5432 |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | root |
| DB_DATABASE | Database name | app |
| CORS_ORIGINS | Allowed CORS origins | http://localhost |
| LOG_LEVEL | Logging level | info |

#### Docker Compose (.env in root)

Create a `.env` file in the root directory for docker-compose:

```env
# Database
DB_USER=tribechat_user
DB_PASSWORD=your_secure_password
DB_DATABASE=tribechat_prod
DB_PORT=5432

# Ports
BACKEND_PORT=3333
FRONTEND_PORT=80
```

## Advanced Configuration

### Using Custom Domain with HTTPS

#### Option 1: Reverse Proxy (Recommended)

Use nginx or Traefik as a reverse proxy with SSL termination.

Example nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option 2: Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com
```

### Scaling and Performance

#### Database Connection Pooling

Edit `backend/config/database.ts` to configure connection pool:

```typescript
pool: {
  min: 2,
  max: 20,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 100,
}
```

#### Horizontal Scaling

To run multiple backend instances:

```bash
docker compose -f docker-compose.production.yml up -d --scale backend=3
```

Add a load balancer (nginx/HAProxy) in front of backend instances.

### Monitoring and Logs

#### View Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f frontend
```

#### Health Checks

Services include health checks:
- Backend: `GET /health`
- Frontend: `GET /health`
- Database: PostgreSQL health check

Monitor with:
```bash
docker compose -f docker-compose.production.yml ps
```

### Backup and Restore

#### Database Backup

```bash
# Create backup
docker compose -f docker-compose.production.yml exec db pg_dump -U tribechat_user tribechat_prod > backup.sql

# Restore backup
docker compose -f docker-compose.production.yml exec -T db psql -U tribechat_user tribechat_prod < backup.sql
```

## Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

### Database Migrations

```bash
# Run migrations
docker compose -f docker-compose.production.yml run --rm backend node ace migration:run

# Rollback last migration
docker compose -f docker-compose.production.yml run --rm backend node ace migration:rollback
```

### Stopping Services

```bash
# Stop services (keeps data)
docker compose -f docker-compose.production.yml down

# Stop and remove all data
docker compose -f docker-compose.production.yml down -v
```

## Security Best Practices

1. **Change default passwords** - Update all default database credentials
2. **Use strong APP_KEY** - Generate a secure application key
3. **Enable HTTPS** - Use SSL/TLS for all connections
4. **Configure CORS** - Restrict CORS to your domain only
5. **Regular updates** - Keep dependencies and Docker images updated
6. **Database backups** - Schedule regular automated backups
7. **Monitor logs** - Set up log monitoring and alerting
8. **Use secrets management** - Consider using Docker secrets or external secrets manager

## Troubleshooting

### Services won't start

Check logs:
```bash
docker compose -f docker-compose.production.yml logs
```

### Database connection issues

Verify database is running:
```bash
docker compose -f docker-compose.production.yml ps db
```

### Port conflicts

Change ports in `.env` file or `docker-compose.production.yml`

### Permission issues

Ensure proper file permissions:
```bash
chmod -R 755 frontend/
chmod -R 755 backend/
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/damianecek/TribeChat/issues
- Documentation: See README.md

## License

See LICENSE file for details.
