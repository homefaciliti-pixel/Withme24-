# Database Schema Guide

This document describes the database schema, models, associations, and transaction locking mechanisms implemented in WithMe24.

---

## 📊 Database Models & Tables

The schema consists of 28 tables mapped through Sequelize ORM in `backend/src/models/`:

1. **User:** Core table for members. Stores name, phone number (authenticated via OTP), gender, city, and roles (`CUSTOMER`, `COMPANION`, `ADMIN`, etc.). Contains an `is_demo` flag to isolate seed testing datasets.
2. **Session:** Handles multiple active logins per user, tracking device user-agents, IP addresses, and tokens.
3. **Blacklist:** Track revoked JWT refresh tokens.
4. **City:** Registered cities (metadata table).
5. **Activity:** Platform-approved companionship activity categories (metadata table).
6. **CompanionProfile:** Profile fields for hosts (bio, rating, total reviews, visibility controls, experience).
7. **CompanionActivity:** Many-to-many relationship mapping companion profiles to specific activities they host, along with custom hourly rates (`price_per_hour`).
8. **Availability:** Calendar time blocks (date, start time, end time, and `is_booked` flags) owned by companion profiles.
9. **Booking:** Outing requests detailing booking status (`PENDING`, `ACCEPTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`), date, timings, duration, pricing breakdown, and customer/companion relationships.
10. **Payment:** Order records containing transaction details, status (`PENDING`, `SUCCESS`, `FAILED`), and gateway references.
11. **Refund:** Tracks cancellation refunds.
12. **Review:** Outing reviews storing star rating (1-5), customer comments, and the companion's replies.
13. **Block:** Bidirectional block logs, filtering profiles and booking grids.
14. **Report:** Mod complaints reporting policy breaches.
15. **ModerationCase:** Workflow cases mapping reports, severities, internal notes, and administrative decisions.
16. **UserSanction:** Sanction records (warnings, temporary suspensions, or bans) mapping to moderation cases.
17. **Wallet:** Financial ledgers owned by companions. Tracks total earnings, available balance, and pending settlements.
18. **Earning:** Individual credit events representing booking fee payouts.
19. **Payout:** Withdrawal requests requested by companions. Holds state (`PENDING`, `SUCCESS`, `REJECTED`) and bank UTR transaction references.
20. **AuditLog:** Records operations logs (admin KYC approvals, moderation decisions, payout transfers) tracking changes.
21. **EmergencyContact:** Location-based emergency contact directories.
22. **SystemConfig:** Global system configuration flags.
23. **NotificationTemplate:** E-mail/SMS notification blueprints.
24. **Notification:** Logs of user notifications.
25. **UserNotificationPreference:** Config channels (SMS, Email, Push) per user.
26. **AdminProfile:** Admin specific bio and role mapping.
27. **RefundPolicy:** System policies for refund conditions.
28. **CancellationPolicy:** Multi-tier time boundaries for cancellations.

---

## 🔒 Concurrency & Race Conditions Prevention

To prevent double-booking the same companion slot:
1. When a booking request is made, a database transaction is initialized.
2. The availability slot is locked using Sequelize `lock: transaction.LOCK.UPDATE` (`SELECT ... FOR UPDATE` query at database layer).
3. If the slot has `is_booked = true`, the transaction fails, preventing race conditions.
4. Only after verifying availability is the booking created, and the slot is updated to `is_booked = true`.
