# 💬 WIRED | ChatApp

A modern real-time chat application built with **React**, **Node.js**, **Socket.IO**, and **PostgreSQL**. Users can communicate instantly with live typing indicators, online presence, read receipts, unread message counts, and emoji support.

## 🌐 Live Demo

**Frontend:** [WIRED](https://wiredchat.vercel.app)

---

## ✨ Features

### Highlights

- ⚡ Real-time messaging
- 🟢 Online presence
- ✍️ Live typing indicators
- ✅ Read receipts
- 🔔 Unread message counts
- 😀 Emoji picker & `:emoji:` shortcuts
- 📱 Responsive mobile-first layout
- 🔒 JWT Authentication

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes
- Secure password hashing using bcrypt

### Messaging
- Real-time messaging with Socket.IO
- Optimistic message updates
- Edit messages
- Delete messages
- Multi-line messages (Shift + Enter)
- Emoji picker
- `:emoji:` shortcut support (e.g. `:smile:`)

### Chat Experience
- Typing indicator
- Online/offline status
- Read receipts
- Unread message count
- Latest message preview
- Automatic scrolling
- Search users

### Profile
- View profile
- Edit first and last name
- Delete account

### UI
- Responsive layout for desktop and mobile
- Dark theme
- Loading skeletons
- Toast notifications

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Router
- Socket.IO Client
- Lucide React
- Emoji Picker React

### Backend
- Node.js
- Express.js
- PostgreSQL
- Socket.IO
- JWT
- bcrypt

### Deployment
- Vercel (Frontend)
- Render (Backend)
- Neon PostgreSQL

---

## 📸 Screenshots

### Desktop

#### Register

![Register](https://github.com/user-attachments/assets/69b96780-9afc-46bb-886e-dc3e722d9e1c)

#### Login

![Login](https://github.com/user-attachments/assets/b29cd786-ac62-44ea-ad46-4caf83c28125)

#### Home

![Home](https://github.com/user-attachments/assets/b5f92e24-d003-4da5-82ca-06cd42193c89)

#### Chat

![Chat](https://github.com/user-attachments/assets/873c01be-4805-47b7-9101-d80d81cca77a)

#### Profile

![Profile](https://github.com/user-attachments/assets/a8e00dc0-cd17-4efd-8b6e-faf220ca0f7d)

### Mobile

#### Register

![Register](https://github.com/user-attachments/assets/51e18823-d503-40c0-bfae-a601df05be50)

#### Login

![Login](https://github.com/user-attachments/assets/acae4f65-66b4-4870-9b61-e9c186531a52)

#### Home

![Home](https://github.com/user-attachments/assets/6cbb7592-df04-4e08-bd30-1f187422002f)

#### Chat

![Chat](https://github.com/user-attachments/assets/5e5e01d0-0fff-4954-9bac-6fd961052485)

#### Profile

![Profile](https://github.com/user-attachments/assets/f1da89c2-5786-47d9-b13c-d7bed9579962)

---

## 🚀 Running Locally

### Clone

```bash
git clone https://github.com/<your-username>/ChatApp.git
cd ChatApp
```

### Backend

```bash
cd backend
npm install
```

Create a `.env`

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
PORT=3000
```

Start the backend

```bash
npm run dev
```

---

### Frontend

```bash
cd frontend
npm install
```

Create a `.env`

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

Start

```bash
npm run dev
```

---

## 📁 Project Structure

```
ChatApp
├── frontend
│   ├── @
│   ├── src
│   │    ├── apis
│   │    ├── components
│   │    ├── context
│   │    ├── hook
│   │    ├── pages
│   │    ├── socket
│   │    └── type
│   └── public
│   
│
└── backend
    ├── controllers
    ├── middleware
    ├── routes
    ├── socket
    └── database
```

---

## 💡 What I Learned

Building this project helped me gain hands-on experience with:

- Real-time communication using Socket.IO
- JWT authentication
- PostgreSQL relational database design
- Optimistic UI updates
- TanStack Query caching
- Responsive UI development
- REST API design
- Deployment using Render, Vercel and Neon
- Managing WebSocket state alongside HTTP APIs

---

## 📌 Future Improvements

- Profile pictures
- Message reactions
- Image and file sharing
- Group chats
- Push notifications
- Voice messages
- Message search
- End-to-end encryption
