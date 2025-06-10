# 🚀 EasyShifts Google Cloud Run Setup - Complete Guide

Your EasyShifts application is now ready for Google Cloud Run deployment! This guide provides everything you need to deploy your application to the cloud.

## 📁 Files Created

### Docker Configuration
- `Backend/Dockerfile` - Backend containerization
- `app/Dockerfile` - Frontend containerization with Nginx
- `app/nginx.conf` - Nginx configuration for React app
- `docker-compose.yml` - Local development with Docker

### Cloud Run Configuration
- `cloudrun-backend.yaml` - Backend service configuration
- `cloudrun-frontend.yaml` - Frontend service configuration
- `Backend/.env.production` - Production environment variables

### Deployment Scripts
- `setup-gcloud.ps1` - PowerShell setup script for Windows
- `deploy.ps1` - PowerShell deployment script for Windows
- `setup-gcloud.sh` - Bash setup script for Linux/Mac
- `deploy.sh` - Bash deployment script for Linux/Mac
- `test-docker.sh` - Local Docker testing script

### Support Files
- `Backend/health_server.py` - Health check server for Cloud Run
- `app/src/utils/env.js` - Runtime environment configuration
- `app/env.sh` - Environment variable injection script
- `DEPLOYMENT.md` - Detailed deployment documentation

## 🚀 Quick Start (Windows)

### 1. Prerequisites
- Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Have a Google Cloud Project with billing enabled
- Know your database password

### 2. Setup Google Cloud
```powershell
# Run the setup script
.\setup-gcloud.ps1
```

### 3. Deploy to Cloud Run
```powershell
# Deploy both frontend and backend
.\deploy.ps1
```

## 🐧 Quick Start (Linux/Mac)

### 1. Prerequisites
Same as Windows, but install appropriate versions for your OS.

### 2. Setup Google Cloud
```bash
# Make scripts executable
chmod +x setup-gcloud.sh deploy.sh test-docker.sh

# Run the setup script
./setup-gcloud.sh
```

### 3. Deploy to Cloud Run
```bash
# Deploy both frontend and backend
./deploy.sh
```

## 🧪 Local Testing (Optional)

Test your Docker containers locally before deploying:

```bash
# Linux/Mac
./test-docker.sh

# Windows (manual)
docker build -t easyshifts-backend:test ./Backend
docker build -t easyshifts-frontend:test ./app
```

## 🔧 What the Setup Does

### Google Cloud Configuration
1. **Enables Required APIs**:
   - Cloud Build API (for building containers)
   - Cloud Run API (for hosting services)
   - Container Registry API (for storing images)
   - Secret Manager API (for secure password storage)

2. **Creates Service Account**:
   - `easyshifts-sa` with minimal required permissions
   - Access to Secret Manager for database password
   - Cloud SQL client permissions

3. **Stores Secrets**:
   - Database password in Google Secret Manager
   - Secure access from Cloud Run services

### Application Architecture
```
Internet → Cloud Run Frontend (Nginx + React)
              ↓ WebSocket
          Cloud Run Backend (Python + WebSocket)
              ↓ MySQL
          External Database (miano.h.filess.io)
```

## 🌐 URLs and Configuration

After deployment, you'll get URLs like:
- **Frontend**: `https://easyshifts-frontend-[hash]-uc.a.run.app`
- **Backend**: `https://easyshifts-backend-[hash]-uc.a.run.app`

### Google OAuth Setup
**IMPORTANT**: Update your Google OAuth configuration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your Cloud Run URLs to:
   - **Authorized JavaScript origins**
   - **Authorized redirect URIs**

## 💰 Cost Estimation

Google Cloud Run pricing (approximate):
- **Backend**: ~$5-20/month for moderate usage
- **Frontend**: ~$2-10/month for moderate usage
- **Total**: ~$7-30/month depending on traffic

Cloud Run charges only for actual usage (CPU, memory, requests).

## 🔍 Monitoring and Troubleshooting

### View Logs
```bash
# Backend logs
gcloud run services logs read easyshifts-backend --region=us-central1

# Frontend logs
gcloud run services logs read easyshifts-frontend --region=us-central1
```

### Health Checks
- Backend: `https://your-backend-url/health`
- Frontend: `https://your-frontend-url/health`

### Common Issues
1. **Build Failures**: Check Dockerfile syntax and dependencies
2. **Database Connection**: Verify credentials and network access
3. **OAuth Issues**: Ensure URLs are added to Google OAuth settings
4. **WebSocket Issues**: Check backend URL configuration in frontend

## 🔒 Security Features

- **HTTPS Enforced**: All traffic encrypted by default
- **Secret Management**: Database password stored securely
- **Service Accounts**: Minimal privilege access
- **CORS Configuration**: Proper cross-origin setup
- **Container Security**: Non-root user execution

## 📈 Scaling Configuration

Cloud Run auto-scales based on traffic:
- **Minimum instances**: 0 (cost-effective)
- **Maximum instances**: 100 (configurable)
- **Concurrency**: 100 requests per instance
- **CPU allocation**: Only during request processing

## 🔄 CI/CD Integration

For automated deployments, you can:
1. Use GitHub Actions with the deployment scripts
2. Set up Cloud Build triggers
3. Use the provided YAML configurations

## 📞 Support

If you encounter issues:
1. Check the logs using the commands above
2. Review `DEPLOYMENT.md` for detailed troubleshooting
3. Verify all environment variables are correctly set
4. Test locally using Docker before deploying

## 🎉 Next Steps

After successful deployment:
1. ✅ Update Google OAuth settings with new URLs
2. ✅ Test all functionality in production
3. ✅ Set up monitoring and alerting
4. ✅ Configure custom domain (optional)
5. ✅ Set up automated backups for your database

Your EasyShifts application is now ready for production use on Google Cloud Run! 🚀
