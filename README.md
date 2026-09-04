# WithMe24 — Social Companionship Marketplace

WithMe24 is a verified social companionship marketplace connecting adults (18+) for legitimate social activities such as coffee, city walks, hobbies, events, and sports. 

> [!IMPORTANT]
> **Trust & Safety Notice:** WithMe24 is **NOT** a dating, matchmaking, escort, prostitution, adult service, or sexual services platform. We enforce a zero-tolerance policy against any policy breaches. Violating profiles are banned instantly, and user data is handed over to regional authorities.

---

## 🛠️ Technology Stack

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js + TypeScript
* **Database ORM:** Sequelize ORM (with MySQL)
* **API Documentation:** Swagger/OpenAPI v3
* **Testing:** Jest + Supertest

### Frontend
* **Core:** React 18 + Vite + TypeScript
* **Styling:** Tailwind CSS + Lucide Icons
* **Routing:** React Router v6
* **API Client:** Axios (with automated refresh interceptors)

---

## 📁 Repository Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/            # DB configuration
│   │   ├── controllers/       # Route request handlers
│   │   ├── middleware/        # Authorization, Rate-limiting, Zod validators
│   │   ├── models/            # Sequelize model definitions & mappings
│   │   ├── routes/            # Express REST endpoint maps
│   │   ├── services/          # SOS alerts, bookings transaction locks, secure files, payments
│   │   └── tests/             # Jest transaction test suite
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/        # Modals (SOS, Bookings), Layouts (Navbar, Footer, Sidebar)
    │   ├── context/           # Session management & JWT token refreshes
    │   ├── pages/             # Directory grid, details, profiles, and role dashboards
    │   ├── services/          # Axios instance
    │   └── main.tsx
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Startup Instructions

### 1. Database Setup
1. Start your local MySQL database server (e.g. via XAMPP, port `3306`).
2. Navigate to `/backend`, configure your `.env` variables matching your local credentials.
3. Run the migrations and seeders:
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

### 2. Run Backend API Server
```bash
cd backend
npm run dev
```
The REST API server starts on `http://localhost:5000`. Swagger API docs are served at `http://localhost:5000/api/docs`.

### 3. Run Frontend Web App
```bash
cd frontend
npm run dev
```
The web app starts on `http://localhost:5173`, with an automated API proxy routing traffic to port `5000`.
