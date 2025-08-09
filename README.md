# RJCouriers - Modern Package Delivery Management System

A full-stack web application for managing courier services with JWT authentication and MongoDB integration.

## Features

- User authentication with JWT
- Package booking and tracking
- Real-time status updates
- User profile management
- Responsive modern UI

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Chart.js for analytics
- Font Awesome for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd RJCouriers-Customer-Only
```

2. Install dependencies
```
npm install
```

3. Configure environment variables
   - Create a `.env` file in the root directory
   - Add the following variables:
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
```
   - For MongoDB Atlas:
     - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Create a new cluster
     - Click on "Connect" and select "Connect your application"
     - Copy the connection string and replace `<username>`, `<password>`, `<cluster>`, and `<dbname>` with your values

### Fallback Storage

The application includes a fallback storage mechanism that uses browser localStorage when MongoDB is not available. This ensures the application can function even without a database connection.

When MongoDB connection fails:
1. The server will automatically switch to fallback mode
2. User data and package information will be stored in localStorage
3. All API endpoints will continue to work with the fallback storage
4. The application will function normally with minimal impact to the user experience

4. Start the server
```
npm start
```

5. Access the application
   - Open your browser and navigate to `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get token

### User Profile
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Package Management
- `POST /api/packages` - Create a new package booking (protected)
- `GET /api/packages` - Get all packages for a user (protected)
- `GET /api/packages/:id` - Get a specific package by ID (protected)
- `GET /api/packages/track/:trackingId` - Track a package by tracking ID (public)

## License

MIT