# Projekt Setup

Tento projekt beží cez **Docker Compose** (frontend + backend + databáza).

> 📚 **Pre podrobný deployment guide (vrátane network access a production deployment)**, pozri [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Rýchly Štart (Development)

### 1. Naklonovanie repozitára

```bash
git clone https://github.com/damianecek/TribeChat.git
cd TribeChat
```

---

## 2. Konfigurácia prostredia

Skopíruj ukážkový `.env.example` súbor do `.env`:

```bash
cp backend/.env.example backend/.env
```

---

## 3. Vygenerovanie APP_KEY

APP_KEY je potrebný pre bezpečnosť (šifrovanie cookies, sessions).
Vygeneruješ ho príkazom:

```bash
docker compose run --rm backend node ace generate:key
```

Výsledný kľúč skopíruj do súboru `backend/.env` na miesto `APP_KEY`.

---

## 4. Spustenie projektu

Stačí spustiť:

```bash
docker compose up --build
```

Alebo použi pripravený skript:

```bash
./start-dev.sh
```

---

## 5. Hotovo

* **Frontend** bude bežať na [http://localhost:9000](http://localhost:9000) (v dev režime).
* **Backend API** bude bežať na [http://localhost:3333](http://localhost:3333).
* **Health Check**: [http://localhost:3333/health](http://localhost:3333/health)
* Databáza (Postgres) beží na porte `5432`.

Migrácie sa spustia automaticky pri štarte backendu.

---

## Prístup z Iných Zariadení v Sieti

Pre prístup z mobilov alebo iných zariadení na rovnakej sieti:

1. **Zisti svoju lokálnu IP adresu**:
   ```bash
   hostname -I  # Linux/Mac
   ipconfig     # Windows
   ```

2. **Nakonfiguruj frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://TVOJA_LOKALNA_IP:3333
   VITE_WS_URL=http://TVOJA_LOKALNA_IP:3333
   ```

3. **Aktualizuj CORS** (`backend/.env`):
   ```env
   ALLOWED_ORIGINS=http://localhost:9000,http://192.168.*.*:9000
   ```

4. **Reštartuj aplikáciu**:
   ```bash
   docker compose down
   docker compose up --build
   ```

5. **Na iných zariadeniach otvor**: `http://TVOJA_LOKALNA_IP:9000`

> 📖 Viac detailov nájdeš v [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Production Deployment

Pre production deployment použi:

```bash
./start-prod.sh
```

Alebo manuálne:

```bash
docker compose -f docker-compose.production.yml up --build -d
```

> ⚠️ **Pred production deploymentom** si prečítaj [DEPLOYMENT.md](DEPLOYMENT.md) pre kompletnú konfiguráciu!

---

## Resetovanie Databázy

Ak by si chcel databázu resetovať, použi:

```bash
docker compose down -v
```

(tým zmažeš aj databázový volume).

---

## Príkazy

| Príkaz | Popis |
|--------|-------|
| `docker compose up` | Spustí development server |
| `docker compose down` | Zastaví containery |
| `docker compose down -v` | Zastaví a zmaže databázový volume |
| `docker compose logs [service]` | Zobrazí logy (napr. `backend`, `frontend`, `db`) |
| `./start-dev.sh` | Spustí dev server s network info |
| `./start-prod.sh` | Spustí production server |

---

## Dokumentácia

- [DEPLOYMENT.md](DEPLOYMENT.md) - Komplетný deployment guide
- [DB_diagram.jpeg](DB_diagram.jpeg) - Databázová schéma

---

## Podpora

Pre problémy a otázky:
- GitHub Issues: https://github.com/damianecek/TribeChat/issues
- Deployment Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
