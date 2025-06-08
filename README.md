# 📚 Fullstack Open - Part 8: GraphQL

This repository contains the exercises and project implementation for **Part 8 (GraphQL)** of the [Fullstack Open](https://fullstackopen.com/en/) course offered by the University of Helsinki.

## 📦 Technologies Used

### Backend
- Node.js
- Apollo Server
- Express
- MongoDB + Mongoose
- GraphQL (Queries, Mutations, Subscriptions)
- JWT Authentication

### Frontend
- React
- Apollo Client
- GraphQL
- Subscriptions over WebSocket
- Local Storage for Auth Token

---

## 🔧 How to Run

### Backend Setup

```bash
cd backend
npm install
Create a .env file inside the backend/ folder:

ini
Copy code
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/library?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
Start the server:
npm run dev
The GraphQL playground will be available at:

bash
Copy code
http://localhost:4000/graphql
Frontend Setup
bash
Copy code
cd frontend
npm install
npm run dev
The frontend app will be available at:

arduino
Copy code
http://localhost:5173
```
