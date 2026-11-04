<div align="center">

# 🏷️ Cadê?

**A web-based lost-and-found management platform**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)

</div>

---

**Cadê?** is a full-stack lost-and-found platform. Visitors can browse, search, and filter registered items without an account. Administrators log in through a two-factor authentication flow, and can create, edit, and delete items, generate PDF and CSV reports, and inspect server access logs.

## Screenshots

### Public Experience

| Home — item listing | Item detail |
|---|---|
| ![Public item listing page showing a grid of lost-and-found items with search and filter controls](https://i.imgur.com/5DHe6xT.png) | ![Item detail page showing name, description, location, date, and item image](https://i.imgur.com/Yc26caF.png) |

The public listing page supports full-text search, period filters (last 7 days, 30 days, older), location filtering, and three sort orders — all reflected in the URL as query parameters.

---

### Reports

![Reports page showing PDF and CSV export cards with date range and delimiter options](https://i.imgur.com/UlwBvrF.png)

Both export formats are publicly accessible. The PDF generates a formatted A4 document via PDFKit. The CSV export supports date range filtering and a configurable column delimiter (`,` or `;`), with a UTF-8 BOM so the file opens correctly in Excel.

---

### Authentication

| Login | Register | Two-factor verification |
|---|---|---|
| ![Login page with email and password fields](https://i.imgur.com/EIq3hBc.png) | ![Account registration page](https://i.imgur.com/ehOQDfA.png) | ![Two-factor authentication page with a 6-digit code input](https://i.imgur.com/JmqZOah.png) |

Login is a two-step flow: credentials are submitted first, which triggers a 6-digit verification code sent by email. The code is valid for 5 minutes, allows up to 5 attempts, and can be resent up to 3 times with a 60-second cooldown between sends.

---

### Administrative Dashboard

| Item listing (admin view) | Create / Edit item | Access logs |
|---|---|---|
| ![Admin item listing with a "Register item" button visible](https://i.imgur.com/2gcnXUB.png) | ![Item creation form with fields for name, description, location, date, and image upload](https://i.imgur.com/MUTC8OA.png) | ![Access log table showing request method, route, and timestamp with date and timezone filters](https://i.imgur.com/SgoaQdJ.png) |

Authenticated users see a **Register item** button on the listing page. Items are created and edited through a form that accepts an optional image upload (JPEG, PNG, WebP, or GIF, up to 5 MB). Images are stored in Cloudinary and can be replaced or removed independently of the item record.

The access logs page shows all HTTP requests recorded since the server started, filterable by date, timezone, and HTTP method.

---

## Architecture

```
Cadê/
├── api/      # Express 5 REST API (Node.js)
└── web/      # React 19 SPA (Vite)
```

This is a **pnpm workspace** with two independent packages. The frontend communicates with the backend through a single HTTP client (`web/src/api/client.ts`). In development, Vite proxies all `/api` requests to `http://localhost:3000`, keeping CORS simple and ensuring that weekend/unavailability responses from the API arrive without being intercepted by the browser.

```
Browser → Vite dev server (/api proxy) → Express API → MongoDB
                                                      → Cloudinary (images)
                                                      → SMTP (2FA codes)
```

In production, the frontend's `vercel.json` applies the same `/api/*` rewrite to the deployed API URL.

---

## Features

### Public

- Browse all registered lost-and-found items in a responsive grid.
- Full-text search across name, description, and location (client-side, accent-normalized).
- Filter by period: all, last 7 days, last 30 days, or older than 30 days.
- Filter by location from a dynamically populated dropdown.
- Sort by most recent, oldest, or name (A–Z).
- All filters and sort state are stored in URL query parameters (`?q=`, `?periodo=`, `?local=`, `?ordem=`).
- Paginated "Load more" display (initial batch of 60 items, then 24 at a time).
- View full item details: name, description, location, date found, and image.
- Download a **PDF report** of all items (`GET /items/report`).
- Download a **CSV export** with optional date range and configurable column delimiter (`GET /items/export`).

### Authentication

- Register with name, email (unique), and a password of at least 8 characters.
- Login triggers a **two-factor challenge**: a 6-digit code is sent by email via Nodemailer.
- The 2FA challenge token is a short-lived JWT (5 minutes) distinct from the session JWT.
- Code hashes are stored using HMAC-SHA256 with the challenge ID as part of the key, so the same code generates a different hash per challenge.
- Comparison is performed with a constant-time equality check (`timingSafeEqual`) to prevent timing attacks.
- Failed attempts are counted per challenge; after 5 failed attempts the challenge is locked.
- Code resend is throttled: 60-second minimum interval, maximum 3 resends per challenge.
- On successful verification, the API issues a standard session JWT (`Authorization: Bearer`).
- Sessions are stored in `sessionStorage` and expire automatically when the JWT's `exp` claim is reached.
- A 401 response on a session-carrying request automatically clears the session and redirects to login.

### Administrative (requires authentication)

- Create items via `multipart/form-data` with an optional image file.
- Edit items via `PATCH` — only the changed fields and/or a new image are required.
- Delete items; image deletion from Cloudinary is attempted silently and never fails the database operation.
- View HTTP access logs, organized by date and timezone; filterable by HTTP method.
- Access to `/itens/novo`, `/itens/:id/editar`, `/registros`, and `/conta` is guarded by `RequireAuth`.

### System resilience

- The API rejects all requests on **weekends** (Saturday and Sunday) with HTTP 403.
- The frontend detects this 403 and renders a full-screen "closed" status page.
- If the MongoDB connection fails, the API returns HTTP 503; the frontend renders a "database unavailable" status page with a retry button.
- Network errors and offline state are detected and shown as a persistent banner.

---

## Tech Stack

### API (`api/`)

| Concern | Library |
|---|---|
| Framework | Express 5 |
| Language | TypeScript 6, executed with `tsx` |
| Database | MongoDB via Mongoose 9 |
| Auth | JSON Web Tokens (`jsonwebtoken`) + bcryptjs |
| Email (2FA) | Nodemailer |
| Image storage | Cloudinary (streamed, no disk writes) |
| File upload | Multer (memory storage) |
| PDF generation | PDFKit |
| Input validation | Zod 4 |
| Testing | Jest + Supertest + `mongodb-memory-server` |

### Web (`web/`)

| Concern | Library |
|---|---|
| Framework | React 19 |
| Bundler | Vite 7 |
| Routing | React Router 7 |
| Icons | Lucide React |
| Language | TypeScript 6 |
| Styling | CSS Modules with custom design tokens |
| Fonts | Bricolage Grotesque, Instrument Sans, IBM Plex Mono (Google Fonts) |

The frontend has **no state management library**. A minimal `createStore` / `useStore` utility is implemented in `web/src/lib/store.ts` and used for session state, challenge state, and system status.

---

## Project Structure

```
api/src/
├── app.ts                        # Express application entry point
├── config/
│   ├── cloudinary.ts             # Cloudinary client and configuration check
│   ├── database.ts               # MongoDB connection
│   ├── jwt.ts                    # JWT sign/verify helpers (session + challenge tokens)
│   └── mailer.ts                 # Nodemailer transporter
├── controllers/                  # Request handlers
│   ├── auth.controller.ts
│   ├── export.controller.ts
│   ├── items.controller.ts
│   ├── report.controller.ts
│   └── requestLog.controller.ts
├── data/
│   └── request-logs.ts           # In-memory log array (cleared on restart)
├── middlewares/
│   ├── auth.ts                   # JWT Bearer token verification
│   ├── business-days.ts          # 403 on weekends
│   ├── database.ts               # Lazy MongoDB connection per request
│   ├── request-logger.ts         # Pushes each request to in-memory log
│   └── upload.ts                 # Multer with MIME type and size validation
├── models/                       # Mongoose schemas
│   ├── item.model.ts
│   ├── twoFactorChallenge.model.ts
│   └── user.model.ts
├── repositories/                 # Database query layer
├── routes/                       # Express Router definitions
├── schemas/                      # Zod validation schemas
├── services/                     # Business logic
│   ├── auth.service.ts
│   ├── email.service.ts
│   ├── export.service.ts         # CSV generation
│   ├── items.service.ts
│   ├── report.service.ts         # PDF generation
│   ├── requestLog.service.ts     # Log filtering with timezone support
│   ├── storage.service.ts        # Cloudinary upload/delete
│   └── twoFactor.service.ts      # 2FA challenge lifecycle
├── types/                        # Shared TypeScript types
└── utils/
    ├── format-date.ts
    ├── generate-csv.ts           # RFC 4180 CSV with CSV-injection protection
    └── generate-pdf.ts           # PDFKit A4 table layout
```

```
web/src/
├── api/                          # API client and typed wrappers
│   ├── client.ts                 # Fetch wrapper with auth, error handling, file download
│   ├── auth.ts
│   ├── items.ts
│   ├── logs.ts
│   ├── reports.ts
│   └── types.ts                  # Shared API types (mirrors API contract)
├── auth/
│   ├── challenge.ts              # In-memory 2FA challenge store
│   ├── guards.tsx                # RequireAuth / RedirectIfAuthenticated
│   └── session.ts                # sessionStorage-backed session store
├── components/
│   ├── brand/Logo.tsx            # Tag-shaped SVG icon + wordmark
│   ├── items/                    # ItemCard, ItemGrid, DateStamp
│   ├── logs/LogTable.tsx
│   └── ui/                       # Button, Field, FilterBar, Modal, Toast, EmptyState, ImageUpload
├── layout/
│   ├── AppLayout.tsx             # Sidebar (desktop) + TopBar + TabBar (mobile)
│   ├── AuthLayout.tsx
│   ├── nav.ts                    # Navigation items and active-state helpers
│   └── PageHeader, Sidebar, TabBar, TopBar
├── lib/
│   ├── date.ts
│   ├── format.ts                 # Accent normalization, blob save
│   └── store.ts                  # Minimal reactive store (subscribe/get/set)
├── pages/
│   ├── auth/                     # LoginPage, RegisterPage, TwoFactorPage, AccountPage
│   ├── items/                    # ItemsListPage, ItemDetailPage, ItemFormPage
│   ├── logs/LogsPage.tsx
│   └── reports/ReportsPage.tsx
├── styles/
│   ├── global.css
│   └── tokens.css                # Design tokens (colors, spacing, typography, layout)
└── system/
    ├── system.ts                  # Global system state: ok | weekend | unavailable | offline
    └── SystemGate.tsx             # Full-screen status pages for weekend/unavailable states
```

---

## API Reference

All endpoints are relative to the API base URL.

### Items

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/items` | — | List all items |
| `GET` | `/items/:id` | — | Get a single item |
| `POST` | `/items` | ✓ | Create an item (`multipart/form-data`) |
| `PATCH` | `/items/:id` | ✓ | Update an item (partial, `multipart/form-data`) |
| `DELETE` | `/items/:id` | ✓ | Delete an item and its image |
| `GET` | `/items/report` | — | Download PDF report |
| `GET` | `/items/export` | — | Download CSV export (`?from=`, `?to=`, `?delimiter=`) |

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new administrator account |
| `POST` | `/auth/login` | Submit credentials → returns a challenge token |
| `POST` | `/auth/2fa/verify` | Submit 6-digit code → returns a session JWT |
| `POST` | `/auth/2fa/resend` | Resend the verification code |

### Logs

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/logs/:date` | ✓ | Get request logs for a date (`YYYY-MM-DD`). Pass `x-timezone` header for timezone-aware filtering. |

### Response Envelope

All JSON responses follow this shape:

```json
{
  "success": true,
  "code": 200,
  "message": "...",
  "data": { ... },
  "meta": { ... }
}
```

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **pnpm** 9 or later (`npm install -g pnpm`)
- A **MongoDB** instance (local or Atlas)
- A **Cloudinary** account (required for image uploads)
- An **SMTP** account for delivering 2FA codes

### Installation

```bash
git clone https://github.com/DavidEricson00/Cade.git
cd Cade
pnpm install
```

### Configuration

Copy the example files and fill in the values:

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env
```

See [Environment Variables](#environment-variables) for details.

### Development

Start both services in separate terminals:

```bash
# API — watches for changes with tsx
pnpm --filter cade dev

# Web — Vite dev server with /api proxy
pnpm --filter cade-web dev
```

The web app will be available at `http://localhost:5173`. All `/api` requests are proxied to the API at `http://localhost:3000`.

---

## Environment Variables

### `api/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port the API listens on. Default: `3000` |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `CORS_ORIGINS` | Yes | Comma-separated list of allowed origins (e.g. `http://localhost:5173`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes* | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | No | Destination folder in Cloudinary. Default: `cade/items` |
| `JWT_SECRET` | Yes | Secret key for signing session JWTs |
| `JWT_EXPIRES_IN` | No | Session token lifetime. Default: `1d` |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port. Default: `587` |
| `SMTP_SECURE` | No | `true` for TLS on port 465. Default: `false` |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASS` | Yes | SMTP password |
| `MAIL_FROM` | No | Sender address. Default: `Cadê? <no-reply@seudominio.com>` |
| `TWO_FACTOR_CODE_SECRET` | Yes | HMAC secret used to hash 2FA codes |

> \* Cloudinary variables are required for image uploads. If omitted, the API starts normally but returns an error when an image upload is attempted.

### `web/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | API base URL for production builds. Default: `/api` |

---

## Running Tests

The API has an integration test suite using Jest, Supertest, and an in-memory MongoDB instance:

```bash
# Run all tests
pnpm --filter cade test

# Watch mode
pnpm --filter cade test:watch

# Coverage report
pnpm --filter cade test:coverage
```

---

## Deployment

Both packages include a `vercel.json` configuration for deployment on Vercel.

### API

Deployed as a serverless function via `@vercel/node`. The PDFKit font files are explicitly included in the build output:

```json
"includeFiles": [
  "node_modules/pdfkit/js/standard-fonts/**/*",
  "node_modules/pdfkit/js/data/**/*"
]
```

Images are uploaded to Cloudinary via streaming — no temporary files are written to disk, which is compatible with serverless environments.

### Web

Deployed as a static site. The `vercel.json` rewrites:
- `/api/:path*` → deployed API URL
- `/*` → `index.html` (SPA routing)

> **Note:** Access logs are stored in the API process's memory and are cleared whenever the serverless function cold-starts. They are intended for operational inspection, not long-term retention.

---

## 👥 Contributors

<div align="center">

<table>
  <tr>
    <td align="center" width="200">
      <a href="https://github.com/DavidEricson00">
        <img src="https://avatars.githubusercontent.com/u/169815129?v=4&s=200" width="120" height="120" alt="DavidEricson00" /><br />
        <sub><b>David Ericson</b></sub><br />
        <sub>@DavidEricson00</sub>
      </a>
    </td>
    <td align="center" width="200">
      <a href="https://github.com/RodrigoMatos00">
        <img src="https://avatars.githubusercontent.com/u/164960237?v=4&s=200" width="120" height="120" alt="RodrigoMatos00" /><br />
        <sub><b>Rodrigo Matos</b></sub><br />
        <sub>@RodrigoMatos00</sub>
      </a>
    </td>
    <td align="center" width="200">
      <a href="https://github.com/leolucena22">
        <img src="https://avatars.githubusercontent.com/u/53834464?v=4&s=200" width="120" height="120" alt="leolucena22" /><br />
        <sub><b>Leo Lucena</b></sub><br />
        <sub>@leolucena22</sub>
      </a>
    </td>
  </tr>
</table>

</div>

---

## License

[MIT](LICENSE) — © 2026
