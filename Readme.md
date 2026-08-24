# Talkative — Real-Time Chat App

A full-stack MERN chat application with friend-gated messaging, group chats, file sharing, WebRTC video calls, and end-to-end encrypted text messages.

## Features

### Authentication
- Email/password signup and login with JWT-based sessions (30-day expiry).
- Passwords hashed with bcrypt; profile picture support.
- Guest login credentials available on the sign-in screen for quick demos.

### Friend System
- Send, accept, and decline friend requests between users.
- Search users by name or email to send a request.
- Direct (1-on-1) chats can only be started between friends — enforced server-side.
- Accepting a friend request automatically opens a chat with them, so it shows up immediately in "My Chats".

### Messaging
- One-on-one and group chats.
- Real-time delivery via Socket.io — no polling.
- Typing indicators ("typing…" animation) per chat.
- Message notifications for chats not currently open.
- File attachments (images, documents, etc.) up to 25MB, with inline image previews and a download link for other file types.

### End-to-End Encryption
- Text messages are encrypted client-side and the server never has access to plaintext.
- Each browser generates a private ECDH (P-256) identity keypair on first login, stored locally (IndexedDB) — the private key never leaves the device.
- Each message is encrypted with a one-time AES-256-GCM key, which is then individually wrapped for every member of the chat using ECDH-derived keys, so the same scheme works for both direct and group chats.
- The database only ever stores ciphertext and wrapped keys, never message content.
- **Scope/limitations:** file attachments are not encrypted; there is no multi-device key sync (a new browser/device generates a new identity, so older message history becomes unreadable there); a chat partner must have logged in at least once since this feature shipped for their public key to be on file before you can message them.

### Group Chats
- Create group chats with multiple friends and a custom group name.
- Rename group, add/remove members, and leave a group.
- Group admin controls for membership changes.

### Video Calling
- One-on-one WebRTC video calls, signaled through Socket.io (offer/answer/ICE candidate exchange).
- Uses public Google STUN servers for NAT traversal.
- Call controls: mute/unmute microphone, toggle camera, reject/end call.
- Handles disconnects gracefully — a dropped connection ends the call only for the actual peer in that call.

### Profile & UX
- View and edit your profile (name, email, picture).
- Responsive layout for desktop and mobile.
- Toast notifications for errors and key actions throughout the app.

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, bcrypt, Multer (file uploads)

**Frontend:** React, React Router, Chakra UI, Socket.io-client, native Web Crypto API (E2E encryption), WebRTC

## Project Structure

```
backend/
  config/       # DB connection, JWT token generation, Multer upload config
  controllers/  # Route handlers: users, chats, messages, uploads
  middleware/   # Auth (JWT) and error-handling middleware
  models/       # Mongoose schemas: User, Chat, Message
  routes/       # Express route definitions
  uploads/      # Uploaded file storage
  server.js     # App entry point + Socket.io event handlers

frontend/
  src/
    Context/        # Global chat/auth state (React Context)
    Pages/          # Landing, login/signup, and main chat page
    components/     # Chat list, message thread, group/profile modals,
                     # friend requests, video calling
    crypto/         # End-to-end encryption (Web Crypto API)
    config/         # Chat display logic helpers
```

## Getting Started

### Prerequisites
- Node.js
- A MongoDB connection string (e.g. from MongoDB Atlas)

### Setup

1. Clone the repo and install dependencies:
   ```
   npm install --legacy-peer-deps
   cd frontend && npm install --legacy-peer-deps
   ```

2. Create a `.env` file in `backend/`:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

3. Run the backend:
   ```
   npm run server
   ```

4. Run the frontend (in a separate terminal):
   ```
   cd frontend && npm start
   ```

The frontend dev server proxies API requests to `http://127.0.0.1:5000`.

### Production Build

```
npm run build
npm start
```

This installs dependencies for both backend and frontend, builds the React app, and serves it from the Express server.
