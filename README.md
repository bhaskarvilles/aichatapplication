# Kerdos AI Chat Application

A real-time AI chat application built with React, Node.js, and MongoDB.

## Features

- Real-time chat interface with AI
- User authentication with Auth0
- Modern UI with ShadcnUI components
- Secure API with JWT authentication
- MongoDB for persistent storage

## Tech Stack

### Frontend
- React with TypeScript
- ShadcnUI components
- Auth0 for authentication
- Deployed on Netlify

### Backend
- Node.js with Express
- MongoDB Atlas
- JWT authentication
- Deployed on Render

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Auth0 account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_uri
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_AUDIENCE=your_auth0_audience
   CORS_ORIGIN=your_frontend_url
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   VITE_AUTH0_DOMAIN=your_auth0_domain
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id
   VITE_API_URL=your_backend_url
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard

### Backend (Render)
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables in Render dashboard

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://bhaskarvilles:zGuGLAZDdum0v2E5@aichatapp.iz5v9.mongodb.net/?retryWrites=true&w=majority&appName=aichatapp
AUTH0_DOMAIN=kerdos.us.auth0.com
AUTH0_AUDIENCE=https://ai-chat-backend-ujxv.onrender.com
CORS_ORIGIN=https://ai-chat-kerdos.netlify.app
```

### Frontend (.env)
```
VITE_AUTH0_DOMAIN=kerdos.us.auth0.com
VITE_AUTH0_CLIENT_ID=epVtYDnsu25qv73N67doIz3IxxQSak1b
VITE_API_URL=https://ai-chat-backend-ujxv.onrender.com
```

## License

ISC 