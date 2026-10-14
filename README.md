# DSA Sheet – Backend API

Node.js + Express 5 + MySQL API for the DSA Sheet app: authentication, the structured sheet (chapters → topics → problems), progress tracking and the study calendar.


## Run locally

Requirements: Node.js 18+ and MySQL 8

```bash
npm install
cp .env.example .env      # set DB_USER / DB_PASSWORD / JWT_SECRET
npm run db:setup          # creates the database + tables and seeds the sheet (safe to re-run)
npm run dev               # http://localhost:5000  (auto-restarts on changes)
```

Check it is running: `GET http://localhost:5000/api/health` → `{ "status": "ok" }`

## Scripts

| Script             | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start with file watching                        |
| `npm start`        | Start for production                            |
| `npm run db:setup` | Create DB/tables and seed content if empty      |

## Structure

```
src/
├─ server.js / app.js     # bootstrap, middleware, route mounting
├─ config/env.js          # environment variables
├─ db/                    # pool.js, schema.sql, seed-data.js, setup.js
├─ middleware/            # auth (JWT), error handling
├─ utils/                 # AppError, zod parse helper, date helpers
└─ modules/<feature>/     # routes → controller → service (+ validation)
   ├─ auth/  sheet/  progress/  plans/
```

## API overview

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| POST   | /api/auth/register     | Sign up → `{ user, token }`                    |
| POST   | /api/auth/login        | Log in → `{ user, token }`                     |
| GET    | /api/auth/me           | Current user                                   |
| GET    | /api/sheet             | Full sheet with the user's progress            |
| PUT    | /api/progress/:id      | `{ completed?, revision? }`                    |
| GET    | /api/progress/summary  | Dashboard stats, streak, resume info           |
| GET    | /api/plans             | Calendar plans and solved problems in a range  |
| POST   | /api/plans             | Create plan                                    |
| PATCH  | /api/plans/:id         | Update / complete plan                         |
| DELETE | /api/plans/:id         | Delete plan                                    |
| POST   | /api/plans/auto        | Auto-schedule unsolved problems                |

All endpoints except auth and health need `Authorization: Bearer <token>`.

