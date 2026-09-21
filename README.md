# OpenJob RESTful API V2

RESTful API untuk platform rekrutmen kerja dengan fitur upload CV/Resume PDF, caching Redis, dan notifikasi email via RabbitMQ.

**Belajar Fundamental Back-End dengan JavaScript**

## Fitur Utama

- **Database Management** PostgreSQL + `node-pg-migrate`
- **Authentication & Authorization** JWT (access + refresh token)
- **Upload PDF** Multer + validasi size (max 5MB) & MIME type
- **Redis Caching** Cache di 6 endpoint + invalidate otomatis
- **Message Queue** RabbitMQ (publish & consume)
- **Email Notification** Nodemailer kirim ke job owner
- **Search Jobs** Query param `?title` & `?company-name`
- **Bookmark & Application Tracking**

## Tech Stack

**API:**

- Node.js v22
- Express.js
- PostgreSQL
- node-pg-migrate
- Joi (validation)
- JWT (auth)
- Redis (caching)
- RabbitMQ (message queue)
- Multer (upload)
- bcrypt (hashing)

**Consumer:**

- Node.js
- RabbitMQ (amqplib)
- Nodemailer (email)
- PostgreSQL

## 📁 Struktur Project
