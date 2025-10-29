# Deployment Guide

This guide covers deployment of both the backend API and frontend Shopify extensions.

## Prerequisites

- [ ] Shopify Partner account
- [ ] Production Shopify store
- [ ] Domain configured: `earlyaccessapi.dev.artslabcreatives.com`
- [ ] Shopify API credentials
- [ ] Hosting platform account (Heroku, DigitalOcean, AWS, etc.)

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd backend
   heroku create earlyaccess-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3000
   heroku config:set SHOPIFY_API_KEY=your_api_key
   heroku config:set SHOPIFY_API_SECRET=your_api_secret
   heroku config:set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
   heroku config:set SHOPIFY_ACCESS_TOKEN=your_access_token
   heroku config:set SHOPIFY_API_VERSION=2025-10
   heroku config:set ALLOWED_ORIGINS=https://your-store.myshopify.com
   ```

4. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial backend deployment"
   heroku git:remote -a earlyaccess-api
   git push heroku main
   ```

5. **Configure Custom Domain**
   ```bash
   heroku domains:add earlyaccessapi.dev.artslabcreatives.com
   ```

6. **Verify Deployment**
   ```bash
   curl https://earlyaccessapi.dev.artslabcreatives.com/api/health
   ```

### Option 2: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean dashboard
   - Click "Create" > "App"
   - Connect your GitHub repository
   - Select the `backend` directory

2. **Configure Build Settings**
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Set Environment Variables**
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`

4. **Configure Domain**
   - Add custom domain: `earlyaccessapi.dev.artslabcreatives.com`
   - Configure DNS A record to point to DigitalOcean

5. **Deploy**
   - Click "Create Resources"
   - Wait for deployment to complete

### Option 3: AWS ECS/Fargate

1. **Create Dockerfile** (in backend directory)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Push Image**
   ```bash
   aws ecr create-repository --repository-name earlyaccess-api
   docker build -t earlyaccess-api .
   docker tag earlyaccess-api:latest <account-id>.dkr.ecr.<region>.amazonaws.com/earlyaccess-api:latest
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/earlyaccess-api:latest
   ```

3. **Create ECS Task Definition**
   - Set container image
   - Configure environment variables
   - Set port mapping: 3000

4. **Create ECS Service**
   - Use Fargate launch type
   - Configure ALB with SSL
   - Set auto-scaling

5. **Configure Route 53**
   - Create A record for `earlyaccessapi.dev.artslabcreatives.com`
   - Point to ALB

### Option 4: Vercel (Serverless)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure vercel.json** (in backend directory)
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   cd backend
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add SHOPIFY_API_KEY production
   vercel env add SHOPIFY_API_SECRET production
   vercel env add SHOPIFY_SHOP_DOMAIN production
   vercel env add SHOPIFY_ACCESS_TOKEN production
   vercel env add ALLOWED_ORIGINS production
   ```

5. **Configure Domain**
   ```bash
   vercel domains add earlyaccessapi.dev.artslabcreatives.com
   ```

## Frontend Deployment

### Deploy Shopify Extensions

1. **Update API URLs**
   
   Update the backend API URL in all frontend files to production URL:
   ```javascript
   const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';
   ```
   
   Files to update:
   - `frontend/wishlist-button-theme/assets/wishlist-button.js`
   - `frontend/wishlist-customer-account/src/api/backendApi.js`
   - `frontend/wishlist-admin/src/api/backendApi.js`

2. **Build Extensions**
   ```bash
   cd /path/to/earlyaccess
   shopify app deploy
   ```

3. **Create App Version**
   - Shopify CLI will build all extensions
   - Upload to Shopify CDN
   - Create new app version

4. **Review in Partner Dashboard**
   - Go to Shopify Partner Dashboard
   - Select your app
   - Review the new version
   - Check extension configurations

5. **Release to Production**
   - Click "Release" on the app version
   - Extensions will be available to all stores with the app installed

6. **Test in Production Store**
   - Install/update app in production store
   - Test theme extension (add to theme)
   - Test customer account extension
   - Test admin extension

## DNS Configuration

### Configure Domain

1. **Add DNS Record**
   
   Add an A record or CNAME for `earlyaccessapi.dev.artslabcreatives.com`:
   
   **Option A (A Record)**:
   ```
   Type: A
   Name: earlyaccessapi
   Value: <server-ip-address>
   TTL: 3600
   ```
   
   **Option B (CNAME)**:
   ```
   Type: CNAME
   Name: earlyaccessapi
   Value: <hosting-platform-url>
   TTL: 3600
   ```

2. **Configure SSL Certificate**
   
   Most hosting platforms provide automatic SSL:
   - Heroku: Automatic with custom domains
   - DigitalOcean: Let's Encrypt automatic
   - AWS: Use ACM (AWS Certificate Manager)
   - Vercel: Automatic SSL

3. **Verify DNS**
   ```bash
   nslookup earlyaccessapi.dev.artslabcreatives.com
   curl https://earlyaccessapi.dev.artslabcreatives.com/api/health
   ```

## Environment Variables

### Backend Production Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Shopify API
SHOPIFY_API_KEY=<from-partner-dashboard>
SHOPIFY_API_SECRET=<from-partner-dashboard>
SHOPIFY_SHOP_DOMAIN=<your-store>.myshopify.com
SHOPIFY_ACCESS_TOKEN=<admin-api-token>
SHOPIFY_API_VERSION=2025-10

# CORS
ALLOWED_ORIGINS=https://<your-store>.myshopify.com,https://<your-custom-domain>

# Optional: Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=info
```

### Getting Shopify Credentials

1. **API Key & Secret**
   - Go to Shopify Partner Dashboard
   - Select your app
   - Copy API key and API secret

2. **Access Token**
   - Install app in your store
   - Generate access token via OAuth
   - OR: Use Shopify CLI to get token:
     ```bash
     shopify app info --web-env
     ```

## Post-Deployment Checklist

### Backend

- [ ] Health check endpoint responds: `GET /api/health`
- [ ] Readiness check passes: `GET /api/health/ready`
- [ ] SSL certificate is valid
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Logs are accessible
- [ ] Error tracking is configured (optional)

### Frontend

- [ ] Extensions are deployed
- [ ] Theme extension appears in theme editor
- [ ] Customer account extension is accessible
- [ ] Admin extension shows in customer details
- [ ] API calls to backend are working
- [ ] No console errors

### Integration Testing

- [ ] Add product to wishlist from storefront
- [ ] View wishlist in customer account
- [ ] Remove product from wishlist
- [ ] Admin can view customer wishlists
- [ ] Error handling works correctly
- [ ] Toast notifications appear

## Monitoring

### Backend Monitoring

1. **Health Checks**
   - Set up automated health check monitoring
   - Alert on failures
   - Monitor response times

2. **Logging**
   - Use structured logging (Winston, Pino)
   - Send logs to aggregation service (Datadog, LogDNA)
   - Set up error alerts

3. **Performance**
   - Monitor API response times
   - Track error rates
   - Monitor Shopify API usage

### Recommended Tools

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar
- **Logging**: Datadog, LogDNA, Papertrail
- **Performance**: New Relic, Datadog APM

## Rollback Strategy

### Backend Rollback

**Heroku**:
```bash
heroku releases
heroku rollback v<previous-version>
```

**DigitalOcean**:
- Use App Platform rollback feature
- Redeploy previous commit

**AWS ECS**:
- Update service to use previous task definition
- Use blue/green deployment

### Frontend Rollback

1. Go to Shopify Partner Dashboard
2. Select your app
3. Find previous app version
4. Click "Release" on previous version

## Troubleshooting

### Backend Issues

**Issue**: API returns 503
- **Solution**: Check environment variables are set
- **Solution**: Verify Shopify credentials are valid
- **Solution**: Check server logs

**Issue**: CORS errors
- **Solution**: Verify `ALLOWED_ORIGINS` includes your store domain
- **Solution**: Check CORS middleware configuration

**Issue**: Authentication failures
- **Solution**: Verify customer ID is being passed
- **Solution**: Check session token validation

### Frontend Issues

**Issue**: Extensions not loading
- **Solution**: Verify extensions are deployed
- **Solution**: Check browser console for errors
- **Solution**: Verify API URL is correct

**Issue**: API calls failing
- **Solution**: Check backend is accessible
- **Solution**: Verify CORS configuration
- **Solution**: Check network tab in dev tools

## Security Checklist

- [ ] All sensitive data in environment variables
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented (optional)
- [ ] Session tokens validated (recommended)
- [ ] API endpoints authenticated
- [ ] No API keys in frontend code
- [ ] Regular security updates

## Support

For deployment issues:
1. Check backend logs
2. Review Shopify app logs
3. Verify DNS configuration
4. Test API endpoints directly
5. Check Shopify API status

## Maintenance

### Regular Tasks

- [ ] Monitor API usage and performance
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup environment variables
- [ ] Review and rotate API credentials annually
- [ ] Monitor SSL certificate expiration

### Scaling

When traffic increases:
- Scale backend horizontally (add more instances)
- Implement caching (Redis)
- Add rate limiting
- Optimize database queries
- Use CDN for static assets
