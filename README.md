# Projekt Setup

Tento projekt beží cez **Docker Compose** (frontend + backend + databáza).
Postupuj podľa krokov nižšie, aby si ho rozbehal lokálne.

---

## 1. Naklonovanie repozitára

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

---

## 5. Hotovo

* **Frontend** bude bežať na [http://localhost:9000](http://localhost:9000) (v dev režime).
* **Backend API** bude bežať na [http://localhost:3333](http://localhost:3333).
* Databáza (Postgres) beží na porte `5432`.

Migrácie sa spustia automaticky pri štarte backendu.

---

Ak by si chcel databázu resetovať, použi:

```bash
docker compose down -v
```

(tým zmažeš aj databázový volume).
