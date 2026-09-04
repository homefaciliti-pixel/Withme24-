# Deployment Reference Guide

This document describes how to build, test, and deploy WithMe24 to staging and production servers.

---

## 🏗️ Production Build Checklist

### 1. Compile Backend API
1. Navigate to `/backend`.
2. Run clean builds:
   ```bash
   npm run build
   ```
   This compiles all TypeScript files from `src/` into the production-ready JavaScript bundle in `dist/`.

### 2. Compile Frontend Assets
1. Navigate to `/frontend`.
2. Run compiler:
   ```bash
   npm run build
   ```
   This compiles all React components, styles, and routes into a highly optimized, static bundle in `dist/`, ready to be served by Nginx or Cloudflare.

---

## ⚙️ Environment Variables Checklist

Ensure the following variables are configured in the server's environment:

| Variable | Description | Example (Prod) |
|---|---|---|
| `PORT` | API server port | `5000` |
| `DB_HOST` | MySQL database host | `127.0.0.1` |
| `DB_PORT` | MySQL database port | `3306` |
| `DB_NAME` | Database name | `withme24` |
| `DB_USER` | DB username | `withme_admin` |
| `DB_PASS` | DB password | `supersecretpassword` |
| `JWT_SECRET` | Secret key for access tokens | `longrandomstring123` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `anotherlongrandomstring456` |
| `HMAC_SECRET` | Secret key for document checks | `securehmackey789` |
| `RAZORPAY_KEY_ID` | Payment gateway API ID | `rzp_live_123` |
| `RAZORPAY_KEY_SECRET` | Payment gateway API Secret | `secretkey123` |

---

## 📈 Process Management (PM2)

To keep the Node/Express server running indefinitely in the background and automatically restart on crashes:

1. Install PM2 globally:
   ```bash
   npm install pm2 -g
   ```
2. Start the compiled backend server:
   ```bash
   pm2 start backend/dist/server.js --name "withme24-api"
   ```
3. Set PM2 to launch on server boot:
   ```bash
   pm2 startup
   pm2 save
   ```
