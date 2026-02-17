# Backend Setup for Agricultural Marketplace

## Prerequisites

1. **MongoDB Atlas Account** (for production) or **Local MongoDB** (for development)
2. **Node.js** (version 18 or higher)
3. **npm** or **yarn**

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://your-netlify-frontend-url.netlify.app

# Payment Gateway Configuration (optional)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

NODE_ENV=production
```

## Deployment Options

### Option 1: Deploy to Render (Recommended)

1. Create an account at [Render](https://render.com)
2. Fork this repository or push it to GitHub
3. Create a new Web Service on Render
4. Connect to your GitHub repository
5. Set the environment variables in Render dashboard
6. Set Build Command: `cd backend && npm install`
7. Set Start Command: `cd backend && npm start`
8. Set Root Directory: `/agricultural-marketplace/backend`

### Option 2: Deploy to Heroku

1. Create an account at [Heroku](https://heroku.com)
2. Install Heroku CLI
3. Create a new app
4. Set environment variables in Config Vars
5. Deploy using Git

### Option 3: Deploy to AWS Elastic Beanstalk

1. Create an account at [AWS](https://aws.amazon.com)
2. Install EB CLI
3. Configure your application
4. Deploy using `eb deploy`

## MongoDB Setup

### MongoDB Atlas (Recommended for Production)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the network access list (or allow access from anywhere for production)
5. Copy the connection string and replace `<username>`, `<password>`, and `<cluster>` with your credentials

Connection string format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

### Local MongoDB (Development Only)

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/agricultural-marketplace`

## Testing the Backend

After deployment, test your API endpoints:

- GET `/` - Health check
- GET `/health` - Detailed health status
- POST `/api/users/register` - User registration
- POST `/api/users/login` - User login

## Connecting Frontend to Backend

Once your backend is deployed, update your frontend's API configuration:

In your Netlify environment variables, set:
```
VITE_API_URL=https://your-backend-deployment-url.com/api
```

Or update the `VITE_API_URL` in your frontend `.env.local` file:
```
VITE_API_URL=https://your-backend-deployment-url.com/api
```

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**: Check your MongoDB connection string and credentials
2. **Authentication Failures**: Verify JWT_SECRET is set correctly on both backend and frontend
3. **CORS Errors**: Ensure FRONTEND_URL is set correctly in backend environment variables
4. **Deployment Failures**: Check logs in your hosting platform dashboard

### Debugging Steps:

1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Test database connection independently
4. Confirm API endpoints are accessible