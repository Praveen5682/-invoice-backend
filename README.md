Bus Booking Backend

This is the backend API for the Bus Booking Application, built with Node.js, Express, and MySQL.

It is deployed on Render, and the database is hosted on Railway.

Features
RESTful APIs for booking, tickets, and users
Environment-specific configuration (development & production)
Database migrations and seeds using Knex.js
Health check endpoint (/)

Tech Stack
Node.js
Express.js
MySQL (via mysql2)
Knex.js
dotenv
cors

Setup (Local Development)
Clone the repository:

git clone https://github.com/Praveen5682/Bus_booking_backend.git
cd Bus_booking_backend

Install dependencies:
npm install

Create a .env file with the following content:

# Local development

NODE_ENV=development

DEV_DB_HOST=localhost
DEV_DB_USER=root
DEV_DB_PASSWORD=yourpassword
DEV_DB_NAME=bus_booking
DEV_DB_PORT=3306

# Production DB

MYSQL_URL=mysql://root:oUUDvqrQpxLcnaLcMneUaOSKrhiLoYHe@crossover.proxy.rlwy.net:48011/

Run migrations and seeds:
npx knex migrate:latest --knexfile utils/knexfile
npx knex seed:run --knexfile utils/knexfile

Running the Server
Development mode (with auto-reload):
npm run dev

Production mode:
npm start

Server will run on port 10000 by default.

API Endpoints
Health Check
GET / – returns { message: "Server Running Successfully!" }

Dev APIs
https://bus-booking-backend-vsw1.onrender.com/api/booking/v1/dev/...

Live APIs
https://bus-booking-backend-vsw1.onrender.com/api/booking/v1/live/...

Notes
Ensure MYSQL_URL is correctly configured for production deployments.
Local development uses MySQL running on your machine.
Backend is deployed on Render, database on Railway.

GitHub Repository: Bus_booking_backend

Deployed Backend URL: https://bus-booking-backend-vsw1.onrender.com
