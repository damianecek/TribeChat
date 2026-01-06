# Environment Variables Documentation

This document describes all environment variables used in the TribeChat application.

## Backend Environment Variables

Configuration file: `backend/.env`

### Required Variables

#### APP_KEY
- **Description**: Encryption key used for cookies, sessions, and data encryption
- **Type**: String (base64 encoded)
- **Required**: Yes
- **Generation**: Run `docker compose run --rm backend node ace generate:key`
- **Example**: `APP_KEY=abc123...xyz`

### Application Settings

#### NODE_ENV
- **Description**: Application environment mode
- **Type**: String
- **Values**: `development`, `production`, `staging`
- **Default**: `development`
- **Example**: `NODE_ENV=production`

#### PORT
- **Description**: Port on which the backend server listens
- **Type**: Number
- **Default**: `3333`
- **Example**: `PORT=3333`

#### HOST
- **Description**: Host address the server binds to
- **Type**: String
- **Default**: `0.0.0.0`
- **Example**: `HOST=0.0.0.0`

#### LOG_LEVEL
- **Description**: Logging verbosity level
- **Type**: String
- **Values**: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- **Default**: `info`
- **Example**: `LOG_LEVEL=info`

#### TZ
- **Description**: Server timezone
- **Type**: String
- **Default**: `UTC`
- **Example**: `TZ=UTC`

### Database Configuration

#### DB_HOST
- **Description**: PostgreSQL database host
- **Type**: String
- **Default**: `localhost` (use `db` for Docker)
- **Example**: `DB_HOST=db`

#### DB_PORT
- **Description**: PostgreSQL database port
- **Type**: Number
- **Default**: `5432`
- **Example**: `DB_PORT=5432`

#### DB_USER
- **Description**: Database username
- **Type**: String
- **Required**: Yes
- **Example**: `DB_USER=tribechat_user`

#### DB_PASSWORD
- **Description**: Database password
- **Type**: String
- **Required**: Yes
- **Security**: Use a strong password in production
- **Example**: `DB_PASSWORD=your_secure_password`

#### DB_DATABASE
- **Description**: Database name
- **Type**: String
- **Required**: Yes
- **Example**: `DB_DATABASE=tribechat_prod`

### Security Settings

#### CORS_ORIGINS
- **Description**: Comma-separated list of allowed CORS origins
- **Type**: String (comma-separated)
- **Default**: `http://localhost`
- **Example**: `CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`

#### TRUST_PROXY
- **Description**: Trust proxy headers (use when behind reverse proxy)
- **Type**: Boolean
- **Default**: `false` (set to `true` in production behind proxy)
- **Example**: `TRUST_PROXY=true`

#### SESSION_DRIVER
- **Description**: Session storage driver
- **Type**: String
- **Values**: `cookie`, `memory`, `redis`
- **Default**: `cookie`
- **Example**: `SESSION_DRIVER=cookie`

## Frontend Environment Variables

Frontend uses Quasar's environment system. Variables can be set in `.env` files or passed during build.

### API Configuration

#### API_BASE_URL
- **Description**: Backend API base URL
- **Type**: String
- **Default**: `http://localhost:3333` (dev), `/api` (prod)
- **Example**: `API_BASE_URL=https://api.yourdomain.com`

#### WS_URL
- **Description**: WebSocket server URL
- **Type**: String
- **Default**: Same as API_BASE_URL
- **Example**: `WS_URL=wss://api.yourdomain.com`

## Docker Compose Environment Variables

Configuration file: `.env` in project root (for docker-compose)

### Database Configuration

#### POSTGRES_USER
- **Description**: PostgreSQL superuser username
- **Type**: String
- **Default**: `root`
- **Example**: `POSTGRES_USER=tribechat_admin`

#### POSTGRES_PASSWORD
- **Description**: PostgreSQL superuser password
- **Type**: String
- **Required**: Yes
- **Example**: `POSTGRES_PASSWORD=secure_password_here`

#### POSTGRES_DB
- **Description**: Initial database name to create
- **Type**: String
- **Default**: `app`
- **Example**: `POSTGRES_DB=tribechat`

### Port Configuration

#### BACKEND_PORT
- **Description**: Host port to expose backend service
- **Type**: Number
- **Default**: `3333`
- **Example**: `BACKEND_PORT=3333`

#### FRONTEND_PORT
- **Description**: Host port to expose frontend service
- **Type**: Number
- **Default**: `80`
- **Example**: `FRONTEND_PORT=8080`

#### DB_PORT
- **Description**: Host port to expose database
- **Type**: Number
- **Default**: `5432`
- **Example**: `DB_PORT=5432`

## Environment Files Structure

```
TribeChat/
├── .env                          # Docker Compose variables (optional)
├── backend/
│   ├── .env                      # Backend configuration
│   ├── .env.example              # Development example
│   └── .env.production.example   # Production example
└── frontend/
    └── .env                      # Frontend configuration (optional)
```

## Development vs Production

### Development (.env.example)
```env
NODE_ENV=development
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=debug
DB_HOST=db
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=app
```

### Production (.env.production.example)
```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
DB_HOST=db
DB_PORT=5432
DB_USER=tribechat_prod
DB_PASSWORD=<strong_password>
DB_DATABASE=tribechat_prod
CORS_ORIGINS=https://yourdomain.com
TRUST_PROXY=true
```

## Security Best Practices

1. **Never commit .env files** - They are in .gitignore
2. **Use strong passwords** - Especially for production databases
3. **Rotate secrets regularly** - Change APP_KEY and passwords periodically
4. **Restrict CORS origins** - Only allow your actual domain in production
5. **Use environment-specific files** - Different configs for dev/staging/prod
6. **Secure storage** - Use secrets management tools in production
7. **Limit access** - Restrict who can view environment variables

## Troubleshooting

### APP_KEY Missing
**Error**: "Missing APP_KEY environment variable"
**Solution**: Generate key with `node ace generate:key` and add to `.env`

### Database Connection Failed
**Error**: "Connection refused" or "Authentication failed"
**Solution**: 
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD are correct
- Ensure database service is running
- Verify network connectivity

### CORS Errors
**Error**: "CORS policy blocked"
**Solution**: 
- Add your frontend domain to CORS_ORIGINS
- Check that credentials are enabled in frontend requests

### Port Already in Use
**Error**: "Port 3333 already in use"
**Solution**: 
- Change PORT in .env file
- Or stop the conflicting service
- Update docker-compose port mapping

## References

- [AdonisJS Environment Variables](https://docs.adonisjs.com/guides/env-variables)
- [Quasar Environment Variables](https://quasar.dev/quasar-cli-vite/handling-process-env)
- [Docker Compose Environment](https://docs.docker.com/compose/environment-variables/)
