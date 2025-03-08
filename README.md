# AI Chat App

A modern AI chat application built with Next.js, MongoDB, and Cloudflare Workers AI.

## Features

- User authentication (register, login, logout)
- Real-time chat with AI assistant
- Message history
- Modern UI with ShadcN UI components
- Secure password hashing
- JWT-based authentication
- MongoDB for data persistence

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, ShadcN UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **AI**: Cloudflare Workers AI (Llama 2)
- **Authentication**: JWT, bcrypt

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret for JWT signing
     - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user and get JWT token
- `POST /api/chat` - Send message to AI and get response
- `GET /api/chat/history` - Get user's chat history

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token for AI access

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 