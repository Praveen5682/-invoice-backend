# Bus Booking App Backend

A NodeJS server on EC2 to handle ticketing for a bus company.

## Context
- 1 bus, 40 seats.
- One ticket per seat.

## Features Included
1. **Update Ticket Status**: Book an open seat by adding user details (name, email, phone).
2. **View Ticket Status**: Fetch the status of a specific ticket/seat.
3. **View Closed Tickets**: Fetch a list of all tickets currently booked.
4. **View Open Tickets**: Fetch a list of all tickets currently available.
5. **View User Details**: Fetch details of the person owning the ticket by seat ID.
6. **Reset Server**: An admin API to reset the server, opening up all tickets for booking again.

## Event-Driven Logic
The server emits internal Node `EventEmitter` actions during core situations:
- `ticketBooked`: Fired successfully when a seat is booked. The listener prints the user details.
- `serverReset`: Fired when an admin resets all seats. 

## Technology Stack
- **Node.js** & **Express**: Web framework for APIs.
- **MySQL2** & **Knex**: Used for database connectivity and schema building. Data persists in your local MySQL instance.
- **Joi**: Object schema validation to securely validate HTTP request payloads.

## Prerequisites
- Node.js (v14+ recommended)
- MySQL Server

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables in `.env` located at the root directory:
   ```env
   DEV_DB_HOST=127.0.0.1
   DEV_DB_USER=root
   DEV_DB_PASSWORD=your_password
   DEV_DB_NAME=bus_booking_app
   DEV_DB_PORT=3306
   ```

3. Ensure the `bus_booking_app` database exists in your MySQL server:
   ```sql
   CREATE DATABASE bus_booking_app;
   ```

4. Start the server (Development mode):
   ```bash
   npm run dev
   ```
   > **Note**: The application automatically checks for the `tickets` table on startup. If it doesn't exist, it creates it and seeds the database with 40 available open seats.

## API Endpoints (via `/api/ont/v1/dev`)

### 1. View Open Tickets
- **GET** `/booking/tickets/open`
- Returns a list of all available seats.

### 2. View Closed Tickets
- **GET** `/booking/tickets/closed`
- Returns a list of all booked seats.

### 3. View Specific Ticket Status
- **GET** `/booking/tickets/:id/status`
- Example: `/booking/tickets/1/status` returns whether seat 1 is open or closed.

### 4. Book a Ticket
- **PUT** `/booking/tickets/:id`
- JSON Body:
  ```json
  {
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "1234567890"
  }
  ```

### 5. View Seat Owner Details
- **GET** `/booking/tickets/:id/user`
- Returns the name, email, and phone of the person who booked the ticket (if closed).

### 6. Admin Reset Server
- **POST** `/booking/tickets/reset`
- Clears all bookings and makes all 40 seats `open` again.

## Using the Postman Collection
A pre-configured Postman Collection file `Bus_Booking_Postman_Collection.json` is located in the root repository. You can import this directly into Postman to easily execute and test the available REST APIs locally.
