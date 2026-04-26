# Project Hyperion

Project Hyperion is a full-stack web application starter template featuring a React (Vite) frontend and an Express.js backend, containerized with Docker and orchestrated using Docker Compose.

## Features

- **Frontend:** React 19, Vite, Tailwind CSS, ESLint
- **Backend:** Express.js, Helmet, CORS, dotenv
- **Development:** Hot Module Replacement (HMR), Dockerized client and server, live reload
- **API:** Simple health check and API endpoint

## Project Structure

```
project-hyperion-test/
├── client/        # React frontend (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── server/        # Express backend
│   ├── index.js
│   ├── package.json
│   └── ...
├── docker-compose.yml
├── README.md
└── ...
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Local Development (without Docker)

#### 1. Start the Server
```bash
cd server
npm install
npm run dev
```
Server runs on [http://localhost:3000](http://localhost:3000)

#### 2. Start the Client
```bash
cd client
npm install
npm run dev
```
Client runs on [http://localhost:5173](http://localhost:5173)

### Using Docker Compose

To start both client and server with Docker Compose:

```bash
docker-compose up --build
```

- Client: [http://localhost:5173](http://localhost:5173)
- Server: [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /health` — Health check
- `GET /api` — Returns a simple status message

## Linting & Formatting

Run ESLint in the client:
```bash
cd client
npm run lint
```

## Customization

- Frontend: Edit files in `client/src/`
- Backend: Edit files in `server/`

## License

This project is licensed under the MIT License.
