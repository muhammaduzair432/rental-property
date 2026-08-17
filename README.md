# Rental Property Platform

A modern, full-stack rental property management and booking platform built with the MERN stack (MongoDB, Express.js, React, Node.js). This platform allows property owners to list and manage their properties, while users can browse, favorite, and book accommodations seamlessly.

## ✨ Features

- **Authentication & Authorization**: Secure login and registration using JWT and bcrypt.
- **Property Management**: Owners can create, read, update, and delete property listings.
- **Booking System**: Users can book properties for specific dates.
- **Favorites**: Users can save properties to their favorites list.
- **Image Uploads**: Secure image hosting using Cloudinary and Multer.
- **Real-Time Notifications**: Integrated with Pusher for real-time updates.
- **Responsive UI**: Modern design built with TailwindCSS and React.
- **Owner Dashboard**: Dedicated dashboard for property owners to track earnings and manage listings.

## 🛠 Tech Stack

**Frontend:**
- [React.js](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/) (State Management)
- [React Router DOM](https://reactrouter.com/) (Routing)
- [TailwindCSS](https://tailwindcss.com/) (Styling)
- [Axios](https://axios-http.com/) (HTTP Requests)
- [Lucide React](https://lucide.dev/) (Icons)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- [JWT (JSON Web Tokens)](https://jwt.io/)
- [Cloudinary](https://cloudinary.com/) (Image Storage)
- [Multer](https://github.com/expressjs/multer) (File Uploads)
- [Pusher](https://pusher.com/) & [Socket.io](https://socket.io/) (Real-time features)
- [Nodemailer](https://nodemailer.com/) (Email sending)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) Database (Local or MongoDB Atlas)
- [Cloudinary](https://cloudinary.com/) Account
- [Pusher](https://pusher.com/) Account

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd rental-property
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the following variables:

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
MONGO_DB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL=your_email@example.com
EMAIL_PASS=your_email_password
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend/rental property
npm install
```

Create a `.env` file in the `frontend/rental property` directory and add the following variables:

```env
VITE_API_URL=http://localhost:5000/api/v2
VITE_PUSHER_APP_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster
```

Start the frontend development server:

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

## 📁 Project Structure

```
rental-property/
├── backend/                  # Node.js Express backend
│   ├── src/
│   │   ├── controllers/      # Route controllers (logic)
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Custom middlewares (auth, multer)
│   │   └── index.js          # Entry point
│   └── package.json
└── frontend/
    └── rental property/      # React frontend (Vite)
        ├── src/
        │   ├── components/   # Reusable UI components
        │   ├── pages/        # Application pages
        │   ├── store/        # Redux store & slices
        │   ├── hooks/        # Custom React hooks
        │   └── App.jsx       # Main App component
        └── package.json
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
