# Eight Coffee Roasters — Hybrid Smart Roastery

> **ระบบ Web ERP + E-Commerce สำหรับร้านคั่วกาแฟ** | รัน On-Premise บน Raspberry Pi 5 ผ่าน Docker + Cloudflare Tunnel

[![Deploy](https://github.com/waritp-lgtm/H
ybrid-Smart-Roastery/actions/workflows/deploy.yml/badge.svg)](https://github.com/waritp-lgtm/Hybrid-Smart-Roastery/actions/workflows/deploy.yml)

---

## 🏗️ System Architecture

```
Internet → Cloudflare Tunnel → Nginx (Port 80)
                                    ├── /api/*   → NestJS API  (Port 4000)
                                    └── /*       → Next.js Web (Port 3000)

Raspberry Pi 5 (16GB RAM)
  ├── PostgreSQL 16 + pgvector
  ├── Redis 7
  └── Synology NAS DS223j (SMB/NFS)
        ├── /media  — Product images, receipts
        └── /backup — DB backups
```

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, DM Serif + DM Sans |
| Backend API | NestJS, Prisma ORM, Swagger |
| Database | PostgreSQL 16 + pgvector, Redis 7 |
| Queue | BullMQ (notifications, PDF generation) |
| Auth | JWT (access + refresh tokens) |
| LINE | LINE OA (notify), LIFF v2 (order tracking, brew guide, AI Sommelier) |
| Payment | GB Prime Pay (PromptPay QR) |
| Logistics | Flash Express API |
| AI | Google Gemini AI (Coffee Sommelier) |
| IoT | Raspberry Pi GPIO — Load Cell, Temp/Humidity sensors |
| Deploy | Docker Compose, GitHub Actions → GHCR → SSH to RPi5 |
| Tunnel | Cloudflare Tunnel (no port forwarding) |

## 🗂️ Module Overview

```
apps/
  api/                    # NestJS API
    src/modules/
      auth/               # JWT login, roles (ADMIN/STAFF/CUSTOMER)
      users/              # User management
      products/           # Products + variants
      inventory/          # Green beans (FIFO) + roasted stock
      orders/             # Order state machine
      payments/           # GB Prime Pay integration
      logistics/          # Flash Express booking
      notifications/      # LINE OA + BullMQ queue
      iot/                # Load cell, temp sensors, Artisan bridge
  web/                    # Next.js Frontend
    app/[locale]/
      page.tsx            # Homepage (minimalist editorial)
      products/           # Catalog + filter
      products/[slug]/    # Product detail (FlavorRadar, brew guide)
      cart/               # Cart with free shipping threshold
      checkout/           # 3-step: address → QR → success
      orders/             # Order tracking timeline
      admin/              # ERP Dashboard (protected)
        dashboard/
        inventory/
        orders/
        roast/
        login/
    app/liff/             # LINE LIFF: orders + brew guide + AI Sommelier
packages/
  prisma/                 # Shared Prisma schema + migrations + seed
```

## 🚀 Quick Start (Development)

```bash
# 1. Clone & install
git clone https://github.com/waritp-lgtm/Hybrid-Smart-Roastery.git
cd Hybrid-Smart-Roastery
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Start database
docker compose up postgres redis -d

# 4. Setup database
cd packages/prisma
npx prisma migrate dev
npx prisma db seed

# 5. Start API
cd apps/api && npm run start:dev

# 6. Start Web (separate terminal)
cd apps/web && npm run dev

# Open: http://localhost:3000/th
# API Docs: http://localhost:4000/docs
# Admin: http://localhost:3000/th/admin/login
```

## 🍓 Deploy to Raspberry Pi 5

```bash
# First time setup
bash scripts/setup-rpi.sh

# Manual deploy
bash scripts/deploy.sh

# CI/CD: Push to main → GitHub Actions → Auto deploy
```

### GitHub Secrets Required

| Secret | Description |
|---|---|
| `RPI_HOST` | RPi5 IP address (e.g. 192.168.1.100) |
| `RPI_USER` | SSH username (e.g. pi) |
| `RPI_SSH_KEY` | Private SSH key (`cat ~/.ssh/id_rsa`) |
| `LINE_CHANNEL_ACCESS_TOKEN` | For deploy notifications |

## 🌐 URL Structure

| URL | Description |
|---|---|
| `/th` | Homepage (Thai) |
| `/en` | Homepage (English) |
| `/th/products` | Product catalog |
| `/th/products/[slug]` | Product detail |
| `/th/cart` | Shopping cart |
| `/th/checkout` | Checkout (PromptPay QR) |
| `/th/orders` | Order tracking |
| `/th/admin` | ERP Dashboard |
| `/th/admin/login` | Admin login |
| `/liff` | LINE LIFF (mobile mini-app) |
| `/api/v1/health` | Health check |
| `/docs` | Swagger API docs |

## 🔐 Default Dev Credentials

```
Admin: admin@eightcoffee.co.th / admin1234
Staff: roaster@eightcoffee.co.th / staff1234
```

> ⚠️ เปลี่ยนรหัสผ่านก่อน deploy จริง

## 📋 License

Private — Eight Coffee Roasters © 2026
