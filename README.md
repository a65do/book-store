# Online Book Store

A full-stack e-commerce application for buying and selling books online.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

## Installation

1. Navigate to the project directory:
```bash
cd online-bookstore
```

2. Install dependencies:
```bash
npm install
```

## Setup

### Database

Make sure MongoDB is running on your machine. The application connects to `mongodb://127.0.0.1:27017/online-bookstore`

### Optional: Seed Database

To populate the database with sample data:
```bash
npm run seed
```

### Optional: Create Admin User

To create an admin user:
```bash
npm run create-admin
```

## Running the Application

### Start the Server

```bash
npm start
```

The server will start on `http://localhost:5000`

### Access the Frontend

Open your browser and navigate to:
```
http://localhost:5000/frontend/index.html
```

Or open the HTML files directly from the frontend folder:
- `frontend/index.html` - Home page
- `frontend/login.html` - Login/Register
- `frontend/books.html` - Browse books
- `frontend/cart.html` - Shopping cart
- `frontend/orders.html` - My orders
- `frontend/admin.html` - Admin dashboard (admin only)

## Features

### Customer Features
- User registration and login
- Browse and search books
- Filter books by category
- Sort books by price, rating, and popularity
- Add books to cart
- Place orders
- View order history
- Update profile information

### Admin Features
- Add new books
- Edit book information
- Delete books
- View all orders
- Manage order status

## Project Structure

```
online-bookstore/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Admin.js
│   │   └── CustomerUser.js
│   ├── routes/
│   │   ├── users.js
│   │   ├── books.js
│   │   ├── orders.js
│   │   └── middleware/
│   │       └── auth.js
│   ├── dbConnections/
│   ├── db.js
│   ├── server.js
│   └── seed.js
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── books.html
│   ├── cart.html
│   ├── orders.html
│   ├── admin.html
│   ├── script.js
│   ├── style.css
│   └── images/
├── package.json
└── README.md
```

## API Endpoints

### Users
- `POST /users/register` - Register a new user
- `POST /users/login` - Login user
- `GET /users/profile/:userId` - Get user profile
- `PUT /users/profile/:userId` - Update user profile

### Books
- `GET /books` - Get all books (with optional filtering and sorting)
- `GET /books/:id` - Get single book
- `POST /books` - Add new book (admin only)
- `PUT /books/:id` - Update book (admin only)
- `DELETE /books/:id` - Delete book (admin only)

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `DELETE /orders/:id` - Cancel order

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in `localStorage` and included in API requests.

Users can be either:
- **customer** (default) - Can browse and purchase books
- **admin** - Has access to admin dashboard for managing books and orders

## Notes

- Passwords are stored in plain text (not hashed). This is for demonstration purposes only. In production, always use proper password hashing (bcrypt, argon2, etc.)
- JWT secret is hardcoded in `routes/users.js`. Change this in production to an environment variable.
- All data persists in MongoDB

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running on localhost:27017
- Check database name is `online-bookstore`

### Port 5000 Already in Use
- Change the port in `backend/server.js`
- Or kill the process using port 5000

### Frontend Not Loading
- Make sure the server is running
- Check the API URL in `frontend/script.js` matches your server location

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

This requires `nodemon` which is included in devDependencies.
//abo_tamada
