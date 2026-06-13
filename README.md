# dooh-mvp-server

Backend foundation for DOOH MVP.

Quick start:

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install deps: `npm install`
3. Start dev server: `npm run dev`

How to create a user

Using environment variables:
ADMIN_NAME="Admin" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="password123" node scripts/createUser.js

node scripts/createUser.js "Admin" "admin@example.com" "password123"

node scripts/createUser.js "Admin" "admin@example.com" "password123"

http://localhost:9000

https://kb-product-server.onrender.com

