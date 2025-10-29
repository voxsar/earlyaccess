# Migration Checklist

Use this checklist to migrate from the monolithic structure to the split backend/frontend architecture.

## Pre-Migration

- [ ] Review `SPLIT_SUMMARY.md` for overview
- [ ] Read `CODEBASE_SPLIT.md` for detailed architecture
- [ ] Understand data flow changes
- [ ] Identify hosting platform for backend
- [ ] Prepare DNS configuration
- [ ] Backup current deployment

## Backend Setup

### Local Development

- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment template: `cp .env.example .env`
- [ ] Configure `.env` file:
  - [ ] Set `SHOPIFY_API_KEY`
  - [ ] Set `SHOPIFY_API_SECRET`
  - [ ] Set `SHOPIFY_SHOP_DOMAIN`
  - [ ] Set `SHOPIFY_ACCESS_TOKEN`
  - [ ] Set `ALLOWED_ORIGINS`
- [ ] Start dev server: `npm run dev`
- [ ] Verify health check: `curl http://localhost:3000/api/health`
- [ ] Test API endpoints (see `TESTING_SPLIT.md`)

### Production Deployment

- [ ] Choose hosting platform (Heroku, DigitalOcean, AWS, Vercel)
- [ ] Create hosting account/project
- [ ] Configure production environment variables
- [ ] Deploy backend code
- [ ] Configure domain: `earlyaccessapi.dev.artslabcreatives.com`
- [ ] Setup SSL certificate
- [ ] Verify health check: `curl https://earlyaccessapi.dev.artslabcreatives.com/api/health`
- [ ] Test all API endpoints
- [ ] Configure monitoring (optional)
- [ ] Setup error tracking (optional)

## Frontend Setup

### Local Development

- [ ] Install dependencies:
  - [ ] `cd frontend/wishlist-customer-account && npm install`
  - [ ] `cd ../wishlist-admin && npm install`
- [ ] Update API URLs to local backend:
  - [ ] `frontend/wishlist-button-theme/assets/wishlist-button.js`
  - [ ] `frontend/wishlist-customer-account/src/api/backendApi.js`
  - [ ] `frontend/wishlist-admin/src/api/backendApi.js`
  - Set to: `http://localhost:3000`
- [ ] Verify `extensions` symlink exists
- [ ] Start Shopify dev server: `npm run dev`
- [ ] Test theme extension in theme editor
- [ ] Test customer account extension
- [ ] Test admin extension

### Production Deployment

- [ ] Update API URLs to production:
  - [ ] `frontend/wishlist-button-theme/assets/wishlist-button.js`
  - [ ] `frontend/wishlist-customer-account/src/api/backendApi.js`
  - [ ] `frontend/wishlist-admin/src/api/backendApi.js`
  - Set to: `https://earlyaccessapi.dev.artslabcreatives.com`
- [ ] Commit changes
- [ ] Deploy extensions: `shopify app deploy`
- [ ] Review app version in Partner Dashboard
- [ ] Release to production stores
- [ ] Verify extensions load correctly

## Testing

### Backend Tests

- [ ] Health endpoint responds
- [ ] Readiness check passes
- [ ] Add to wishlist works
- [ ] Remove from wishlist works
- [ ] Get wishlist returns correct data
- [ ] Error handling is appropriate
- [ ] CORS configuration allows store
- [ ] Authentication validates correctly
- [ ] API response times acceptable

### Frontend Tests

- [ ] Theme extension loads
- [ ] Wishlist button adds products
- [ ] Button state updates correctly
- [ ] Toast notifications display
- [ ] Customer account page loads
- [ ] Products display with images
- [ ] Remove functionality works
- [ ] Admin block displays
- [ ] Admin product links work
- [ ] Empty states show correctly

### Integration Tests

- [ ] Add product from storefront
- [ ] View product in customer account
- [ ] Remove product from wishlist
- [ ] View wishlist in admin
- [ ] Test on multiple devices
- [ ] Test error scenarios
- [ ] Verify performance
- [ ] Check for console errors

## Verification

### Backend

- [ ] Server is running and accessible
- [ ] All endpoints return expected responses
- [ ] Logs are being captured
- [ ] SSL certificate is valid
- [ ] Health checks are passing
- [ ] Error rates are acceptable
- [ ] Response times are good

### Frontend

- [ ] All extensions deployed successfully
- [ ] API calls succeeding
- [ ] No console errors
- [ ] Images loading correctly
- [ ] Functionality works as expected
- [ ] Error handling is graceful
- [ ] Performance is acceptable

### Production

- [ ] Backend accessible at production URL
- [ ] Frontend making calls to production backend
- [ ] End-to-end flow working
- [ ] No CORS errors
- [ ] Authentication working
- [ ] Data persisting correctly

## Post-Migration

### Documentation

- [ ] Update team on new architecture
- [ ] Share deployment documentation
- [ ] Document any custom configurations
- [ ] Update runbooks/procedures
- [ ] Share testing documentation

### Monitoring

- [ ] Setup uptime monitoring for backend
- [ ] Configure alerts for errors
- [ ] Monitor API usage
- [ ] Track performance metrics
- [ ] Setup log aggregation (optional)

### Cleanup

- [ ] Remove old deployment artifacts
- [ ] Archive previous deployment configs
- [ ] Update CI/CD pipelines
- [ ] Update documentation links
- [ ] Notify stakeholders of completion

## Rollback Plan

If issues occur:

### Backend Rollback

- [ ] Identify the issue
- [ ] Check backend logs
- [ ] Roll back to previous version:
  - Heroku: `heroku rollback`
  - DigitalOcean: Redeploy previous commit
  - AWS: Update to previous task definition
  - Vercel: Rollback in dashboard

### Frontend Rollback

- [ ] Go to Shopify Partner Dashboard
- [ ] Select your app
- [ ] Find previous app version
- [ ] Click "Release" on previous version

### Communication

- [ ] Notify team of rollback
- [ ] Document what went wrong
- [ ] Create action items for fixes
- [ ] Schedule retry after fixes

## Common Issues

### Backend Won't Start

- [ ] Check `.env` file exists
- [ ] Verify all environment variables set
- [ ] Check port 3000 is available
- [ ] Verify Node.js version (need 18+)
- [ ] Check for dependency errors
- [ ] Review server logs

### CORS Errors

- [ ] Verify `ALLOWED_ORIGINS` includes store URL
- [ ] Check CORS middleware configuration
- [ ] Ensure request includes correct headers
- [ ] Test with curl to isolate issue

### Extensions Not Loading

- [ ] Check `extensions` symlink exists
- [ ] Verify running from root directory
- [ ] Check Shopify CLI output for errors
- [ ] Verify extension configurations
- [ ] Try `shopify app dev` again

### API Calls Failing

- [ ] Verify backend is running
- [ ] Check API URL in frontend code
- [ ] Review network tab in dev tools
- [ ] Check backend logs for errors
- [ ] Test endpoint with curl directly

## Support Resources

- **Architecture**: `CODEBASE_SPLIT.md`
- **Deployment**: `DEPLOYMENT.md`
- **Testing**: `TESTING_SPLIT.md`
- **Summary**: `SPLIT_SUMMARY.md`
- **Backend**: `backend/README.md`
- **Frontend**: `frontend/README.md`

## Success Criteria

Migration is complete when:

- ✅ Backend is deployed and healthy
- ✅ Frontend is deployed and functional
- ✅ All API endpoints working
- ✅ End-to-end flow tested
- ✅ No console errors
- ✅ Performance is acceptable
- ✅ Team is trained
- ✅ Documentation is updated
- ✅ Monitoring is configured

## Timeline Estimate

- **Local Setup**: 1-2 hours
- **Backend Deployment**: 2-4 hours
- **Frontend Deployment**: 1-2 hours
- **Testing**: 2-3 hours
- **Documentation**: 1 hour
- **Total**: 1-2 days

## Contact

For issues during migration:
- Review logs (backend and browser)
- Check documentation
- Test endpoints with curl
- Review configuration
- Verify environment variables

---

✅ **Mark items as complete as you progress through the migration.**

Last Updated: 2025-10-29
