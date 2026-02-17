# Frontend Deployment to Netlify

## Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **GitHub/GitLab/Bitbucket Account** - Repository hosting
3. **Frontend code** - Ready to be deployed

## Deployment Methods

### Method 1: Git Integration (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Netlify account
3. Click "Add new site" → "Import an existing project"
4. Choose your Git provider and authenticate
5. Select your repository
6. Configure build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Root directory**: `/agricultural-marketplace`

7. Add environment variables in Netlify UI:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

### Method 2: Drag and Drop

1. Build your project locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Drag the contents of the `frontend/dist` folder to Netlify's drag-and-drop interface

### Method 3: Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Navigate to the frontend directory:
   ```bash
   cd agricultural-marketplace/frontend
   ```

3. Run the deploy command:
   ```bash
   netlify deploy --prod
   ```

## Environment Configuration

### Setting API Endpoint

For the authentication to work properly, you need to configure the backend API URL:

In your Netlify dashboard:
1. Go to your site settings
2. Navigate to "Build & Deploy" → "Environment"
3. Add the following environment variable:

```
VITE_API_URL=https://your-backend-deployment.com/api
```

Replace `https://your-backend-deployment.com/api` with your actual backend URL.

### Example Environment Variables in Netlify:

```
VITE_API_URL=https://agricultural-marketplace-backend.onrender.com/api
```

## Build Configuration

The project is already configured with:
- Vite as the build tool
- Proper proxy handling for API calls
- Environment variable support

## Post-Deployment Configuration

### 1. Custom Domain (Optional)
- Go to "Domain Settings" in Netlify
- Add your custom domain
- Update DNS records as instructed

### 2. HTTPS/SSL Certificate
- Automatically provisioned by Netlify
- No additional setup required

### 3. Redirects Configuration
The project already includes `_redirects` files in both `public` and `dist` folders to handle SPA routing.

## Testing After Deployment

1. Visit your Netlify site URL
2. Try registering a new account
3. Try logging in with the registered account
4. Verify that API calls are working correctly
5. Check browser console for any errors

## Troubleshooting Common Issues

### Issue: API calls returning 404 or CORS errors
**Solution**: Verify that `VITE_API_URL` is set correctly in Netlify environment variables

### Issue: Authentication not working
**Solution**: 
1. Check that your backend is deployed and accessible
2. Verify the JWT secret is the same in both backend and frontend environments
3. Confirm CORS settings allow your Netlify domain

### Issue: Assets not loading
**Solution**: Check the `vite.config.js` file and ensure proper base path configuration

### Issue: Routing problems in production
**Solution**: Verify that `_redirects` files are properly placed in the public directory

## Connecting to Backend

Make sure your backend is deployed separately and accessible via HTTPS. Common backend hosting options:
- Render (recommended)
- Heroku
- AWS
- Google Cloud Platform

## Performance Optimization

The Vite build process automatically:
- Minifies JavaScript and CSS
- Optimizes images
- Implements code splitting
- Generates efficient bundles

## Rollback and Versioning

Netlify provides:
- Automatic versioning of deployments
- Easy rollback to previous versions
- Branch and context-based deployments