# PurpleMerit — User Management System

Full-stack MERN application for managing users with role-based access control.

## Live Demo

| Service  | URL                                                                                       |
| -------- | ----------------------------------------------------------------------------------------- |
| Frontend | [purple-merit-assignment-omega.vercel.app](https://purple-merit-assignment-omega.vercel.app) |
| Backend  | [purple-merit-assignment-1.onrender.com](https://purple-merit-assignment-1.onrender.com)     |

## Features

- JWT authentication (access + refresh tokens)
- Role-based access control — Admin, Manager, User
- Paginated, searchable, filterable user list
- User CRUD with soft-delete (deactivation)
- Profile management for all roles
- Responsive sidebar layout with dark theme

## Tech Stack

| Layer    | Tech                                  |
| -------- | ------------------------------------- |
| Frontend | React 19, Vite, React Router, Axios  |
| Backend  | Node.js, Express, Mongoose           |
| Database | MongoDB                              |
| Auth     | JWT (access + refresh), bcryptjs     |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Server

```bash
cd server
cp .env.example .env   # fill in your MongoDB URI and secrets
npm install
npm run seed            # seeds default admin + sample users
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Default Credentials

| Role    | Email                     | Password    |
| ------- | ------------------------- | ----------- |
| Admin   | admin@purplemerit.com     | Admin@123   |
| Manager | manager@purplemerit.com   | Manager@123 |
| User    | john@purplemerit.com      | User@123    |

## Project Structure

```
purplemerit/
├── server/
│   └── src/
│       ├── config/        # DB connection, roles & permissions
│       ├── controllers/   # Auth & user business logic
│       ├── middleware/     # Auth, authorization, validation, errors
│       ├── models/        # Mongoose schemas
│       ├── routes/        # Express route definitions
│       ├── seed.js        # Database seeder
│       └── index.js       # App entry point
└── client/
    └── src/
        ├── api/           # Axios instance with interceptors
        ├── components/    # Layout, ProtectedRoute
        ├── contexts/      # AuthContext (global auth state)
        └── pages/         # Login, Dashboard, UserList, UserForm, UserDetail, Profile
```

## Docker Deployment

Run the entire stack with Docker Compose:

```bash
# Make sure server/.env exists with a valid MONGODB_URI
# For Docker, use: MONGODB_URI=mongodb://mongo:27017/purplemerit

docker-compose up --build
```

This starts three containers:
- **pm-client** — React app served via nginx on port 80
- **pm-server** — Express API on port 5000
- **pm-mongo** — MongoDB on port 27017

After containers are up, seed the database:

```bash
docker exec pm-server node src/seed.js
```

Open [http://localhost](http://localhost) in your browser.

## Environment Variables

Create a `.env` file inside `server/` with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/purplemerit
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=https://purple-merit-assignment-omega.vercel.app
NODE_ENV=production
```
