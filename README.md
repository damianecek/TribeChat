# TribeChat

TribeChat je full-stack projekt s Quasar frontendom (SPA) a AdonisJS backendom. PostgreSQL databáza beží v Docker konte, všetko spravované cez `docker-compose`.

---

## Požiadavky

- Docker & Docker Compose
- Node.js (len ak chceš bežať mimo kontajnerov)
- PostgreSQL client (voliteľné, pre prístup k DB)
- VSCode s príslušnými extensionmi pre AdonisJS a Quasar (odporúčané)

---

## Štruktúra projektu

TribeChat/
├── backend/       # AdonisJS backend
├── frontend/      # Quasar frontend
├── docker-compose.yml
└── README.md

---

## Spustenie projektu

1. Klonuj repozitár:

git clone https://github.com/damianecek/TribeChat.git
cd TribeChat

2. Skopíruj `.env.example` do `.env` a uprav hodnoty podľa potreby:

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

3. Spusti Docker kontajnery:

docker-compose up --build

- Backend bude dostupný na: http://localhost:3333
- Frontend bude dostupný na: http://localhost:8080
- PostgreSQL bude na porte 5432

---

## Práca s backendom

Ak potrebuješ spúšťať migrácie, seedovanie alebo iné príkazy:

docker-compose exec backend <command>

Príklady:

docker-compose exec backend node ace migration:run
docker-compose exec backend node ace db:seed
docker-compose exec backend node ace serve --watch

---

## Práca s frontendom

Frontend beží vo vlastnom kontajneri:

docker-compose exec frontend quasar dev

- FE volá BE cez http://backend:3333 (z Docker network)
- Ak chceš testovať mimo kontajnera, môžeš použiť http://localhost:3333

---

## Práca s databázou

Prístup do PostgreSQL:

docker-compose exec db psql -U root -d app

- Pripojenie: Host: localhost, Port: 5432, Database: app, User: root, Password: root

- Použi node ace serve --watch pre hot-reload backendu
- Použi quasar dev pre hot-reload frontendu
- Vždy pracuj cez Docker, aby sa zachovala konzistencia prostredí
- Pri zmene .env reštartuj príslušné kontajnery
