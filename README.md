# OptiGest (frontend + backend)

## Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+ (or 20+)
- MySQL (MAMP ok)

## Backend (Laravel)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
```

Update `backend/.env` (MAMP defaults):
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=8889
DB_DATABASE=opticsaas
DB_USERNAME=root
DB_PASSWORD=root
```

Optional super admin (also in `backend/.env`):
```
SUPER_ADMIN_EMAIL=superadmin@optic.local
SUPER_ADMIN_PASSWORD=superadmin123
SUPER_ADMIN_FIRST_NAME=Super
SUPER_ADMIN_LAST_NAME=Admin
```

Run migrations + seed:
```bash
php artisan migrate --seed
php artisan storage:link
```

Start the API:
```bash
php artisan serve
```

API runs at `http://localhost:8000`.

## Frontend (Vite React)
```bash
cd ../frontend
cp .env.example .env
```

Ensure `frontend/.env` contains:
```
VITE_API_URL=http://localhost:8000
```

Install and run:
```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:8080`.

## Quick check
- `http://localhost:8000/api/health` should return OK
- Open `http://localhost:8080/landing`
- Login with the super admin credentials you set in `.env`
