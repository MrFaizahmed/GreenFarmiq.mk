# Complete Deployment Guide for Agricultural Marketplace

## Overview

This guide explains how to deploy the Agricultural Marketplace application with a backend and frontend. The application consists of:
- Backend API built with Node.js/Express
- Frontend built with React/Vite
- MongoDB for data storage

## Architecture

The application follows a microservices architecture where:
- Backend runs on a server (Render, Heroku, etc.) 
- Frontend runs on Netlify
- Database is hosted separately (MongoDB Atlas)

## Backend Deployment

### Step 1: Prepare Backend for Deployment

1. Ensure you have a working MongoDB database (either MongoDB Atlas or self-hosted)
2. Update the backend `.env` file with production values:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_very_long_and_secure_random_string_for_production
FRONTEND_URL=https://your-frontend-url.netlify.app
NODE_ENV=production
```

### Step 2: Deploy Backend

#### Option A: Deploy to Render (Recommended)

1. Create an account at [Render](https://render.com)
2. Fork this repository to your GitHub account
3. On Render, create a new "Web Service"
4. Connect to your GitHub repository
5. Configure as follows:
   - Environment: `Docker` or `Node` 
   - Build Command: `cd agricultural-marketplace/backend && npm install`
   - Start Command: `cd agricultural-marketplace/backend && npm start`
   - Region: Choose closest to your users
   - Environment Variables: Add all from Step 1

6. Click "Create Web Service"

#### Option B: Deploy to Heroku

1. Create an account at [Heroku](https://heroku.com)
2. Install Heroku CLI
3. Create a new app
4. Under Settings → Config Vars, add environment variables
5. Deploy using Git

### Step 3: Test Backend API

After deployment, test these endpoints:
- `GET https://your-backend-url.onrender.com/` - Should return API status
- `GET https://your-backend-url.onrender.com/health` - Should return health status
- `POST https://your-backend-url.onrender.com/api/users/register` - Should allow registration
- `POST https://your-backend-url.onrender.com/api/users/login` - Should allow login

## Frontend Deployment to Netlify

### Step 1: Prepare Frontend

1. Make sure your backend is deployed and accessible
2. Note the backend URL (e.g., `https://your-backend.onrender.com/api`)

### Step 2: Deploy to Netlify

#### Option A: Git Integration (Recommended)

1. Push your code to a GitHub repository
2. Log in to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select GitHub and choose your repository
5. Configure build settings:
   - Base directory: `agricultural-marketplace`
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
6. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

#### Option B: Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build the project: `cd frontend && npm run build`
3. Deploy: `netlify deploy --prod`

## Environment Configuration

### Backend Environment Variables

These must be set in your backend hosting environment:

```env
# Required
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=very_secure_random_string
FRONTEND_URL=https://your-frontend.netlify.app

# Optional
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=your_stripe_secret
NODE_ENV=production
```

### Frontend Environment Variables

These must be set in your Netlify environment:

```
VITE_API_URL=https://your-backend-domain.com/api
```

## Connecting Frontend and Backend

1. Backend must be deployed first and accessible via HTTPS
2. Frontend environment variable `VITE_API_URL` must point to your backend
3. Backend's `FRONTEND_URL` must match your Netlify domain
4. Both must use HTTPS in production for security

## Testing the Complete Flow

After both deployments:

1. Visit your Netlify frontend URL
2. Try to register a new account
3. Log in with the new account
4. Verify that user data persists in the database
5. Test posting requirements and placing bids
6. Verify all functionality works end-to-end

## Common Issues and Solutions

### Backend Issues:

1. **Database Connection Errors**: Verify MongoDB connection string and network access
2. **Authentication Failing**: Ensure JWT_SECRET is identical in both frontend and backend
3. **CORS Errors**: Verify FRONTEND_URL matches your Netlify domain exactly

### Frontend Issues:

1. **API Calls Failing**: Verify VITE_API_URL points to your deployed backend
2. **Authentication Not Persisting**: Check browser settings aren't blocking localStorage
3. **Mixed Content Errors**: Ensure both frontend and backend use HTTPS

## Production Best Practices

1. Use strong, unique JWT secrets
2. Enable HTTPS for both frontend and backend
3. Implement proper error handling and logging
4. Monitor application performance and uptime
5. Regularly backup your database
6. Implement rate limiting to prevent abuse
7. Use environment-specific configurations

## Scaling Considerations

1. **Database**: Consider sharding for large datasets
2. **Backend**: Use load balancers for high traffic
3. **Frontend**: Leverage CDN for static assets
4. **Monitoring**: Implement health checks and alerts

## Maintenance

1. Regularly update dependencies
2. Monitor security advisories
3. Backup data regularly
4. Review and optimize database queries
5. Monitor API usage and performance

## Support

For issues with deployment:

1. Check server logs in your hosting platform dashboard
2. Verify all environment variables are set correctly
3. Test API endpoints directly using tools like Postman
4. Confirm network connectivity between frontend and backend
5. Review the specific error messages for troubleshooting clues