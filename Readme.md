# 💬 Talk-A-Tive — Real-Time MERN Chat Application

Talk-A-Tive is a full-featured, real-time chat application built using the MERN stack. It features a modern, clean, responsive user interface powered by Chakra UI, and handles instant communication via Socket.io.

---

## 🚀 Key Features

*   **🔒 Secure Authentication:** Sign up and login with secure password hashing (bcryptjs) and JWT-based session authorization.
*   **💬 Real-Time Messaging:** Instant message delivery and syncing across clients using Socket.io.
*   **👥 Dynamic Group Chats:** Create group chats, customize group names, add or remove members, and manage admin controls.
*   **🔍 Interactive User Search:** Find users quickly via their email or name to initiate a conversation.
*   **🔔 Live Notifications & Indicators:** Real-time typing indicators ("user is typing...") and notification badges for unread messages.
*   **🎨 Premium UI/UX:** Responsive layouts, beautiful modals, dark-mode-inspired accents, and smooth transitions built using Chakra UI and Framer Motion.

---

## 📸 Screenshots & Visual Preview

### 🏠 Landing & Welcome Page
A clean entrance to the application with smooth toggles between Login and Sign Up.
<p align="center">
  <img src="./image.png" alt="Talk-A-Tive Landing Page" width="85%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 10px 0;" />
</p>

### 🔑 Authentication (Sign-up / Login)
Secure credentials fields with password toggle visibility and field validation.
<p align="center">
  <img src="./image-1.png" alt="Authentication Page" width="85%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 10px 0;" />
</p>

### 💬 Active Chat Dashboard
The full chat interface including one-on-one chats, group chat details, typing indicators, user search side-drawer, and settings modals.
<p align="center">
  <img src="./image-2.png" alt="Chat Application Page" width="85%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 10px 0;" />
</p>

---

## 🛠️ Technology Stack

### Frontend
*   **React** (v17) - UI rendering and component architecture
*   **Chakra UI** - Elegant UI design system & responsive layout components
*   **Socket.io Client** - Client-side real-time event handling
*   **Framer Motion** - Fluid micro-animations and page transitions
*   **React Router DOM** (v5) - Single Page Application routing
*   **Axios** - Async HTTP requests to backend endpoints

### Backend
*   **Node.js** & **Express** - REST API server and routing
*   **MongoDB** & **Mongoose** - Document database and schema object modeling
*   **Socket.io** - WebSocket server for real-time bi-directional messaging events
*   **JWT (JSON Web Tokens)** - Stateless user authentication
*   **Bcrypt.js** - Secure salt and password hashing

---

## ⚙️ Setup and Installation

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v14+ recommended) and a running instance of [MongoDB](https://www.mongodb.com/) (either local database or Atlas cloud URI).

### 2. Clone the Repository
```bash
git clone <repository-url>
cd full-stack-chat-app
```

### 3. Backend Configuration
Create a `.env` file in the `backend/` directory and configure the environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 4. Install Dependencies
Run the install command in the root folder to install dependencies for both root, backend, and frontend:
```bash
npm run build
```
*(This triggers the custom build script which installs all root, backend, and frontend peer dependencies automatically)*

### 5. Running the Application
To run the server and client concurrently in development mode:

*   **To run Backend (Express Server):**
    ```bash
    npm run server
    ```
*   **To run Frontend (React App):**
    Open a separate terminal window:
    ```bash
    cd frontend
    npm start
    ```

The backend server will run on `http://localhost:5000` and the React application will open on `http://localhost:3000`.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── config/          # Database configuration and JWT token creation
│   ├── controllers/     # Route logic for users, chats, and messages
│   ├── middleware/      # Authentication & error handling middleware
│   ├── models/          # Mongoose database models (User, Chat, Message)
│   ├── routes/          # API endpoint routes
│   └── server.js        # Express application entry point & socket setup
├── frontend/
│   ├── public/          # Public static assets
│   └── src/
│       ├── components/  # React reusable components and modals
│       ├── Context/     # React Context for global state (ChatProvider)
│       ├── Pages/       # App pages (Homepage, Chatpage)
│       └── App.js       # App component and routes config
```

---

## 📄 License
Distributed under the ISC License. See `package.json` for details.