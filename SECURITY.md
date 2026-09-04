# Security Protocols & Implementation

WithMe24 enforces a comprehensive security protocol to protect its members and ensure trust.

---

## 🔐 1. Authentication & Session Management
* **OTP Login:** Verification is handled by one-time password checks on mobile numbers. No passwords are saved, removing credential stuffing vectors.
* **JWT Tokens:** Uses secure JWT access tokens (short lifespan) and refresh tokens (stored in HTTPOnly cookies or storage) to maintain sessions.
* **Refresh Token Rotation:** Access tokens can be refreshed automatically through an API refresh loop when they expire. Old refresh tokens are blacklisted immediately.

---

## 🚫 2. Rate Limiting & Defense
* **Global Limiters:** Express rate limiters protect routes from denial-of-service and scraping attempts.
* **Login & OTP Limiters:** Stricter parameters block brute-force attempts on sensitive endpoints:
  * `/api/auth/send-otp` is limited to 5 attempts per hour per IP.
  * `/api/auth/verify-otp` is limited to 10 attempts per hour per IP.

---

## 📂 3. Document Protection & HMAC File URLs
* **Secure Uploads:** Government ID documents and face selfies are saved to private server directories (under `/uploads/` outside the public web server root).
* **Temporary Expiring URLs:** Files are served via `/api/uploads/file?path=...&expires=...&signature=...`.
* **HMAC Signature Check:** When serving a file, the server verifies a SHA256 HMAC signature calculated using a secret key. If the signature doesn't match or the timestamp has expired, the request is rejected with `403 Forbidden`, preventing document harvesting.

---

## 🚨 4. Emergency Assistance & Geolocation
* **SOS Triggers:** During active companion outings, users can activate the SOS Emergency modal.
* **Geolocation Logging:** If authorized, the browser resolves the member's current GPS coordinates (latitude, longitude) and sends them to the server to assist emergency services.
* **Local Helpline Directory:** Instantly displays regional emergency services and helpline phone contacts.
