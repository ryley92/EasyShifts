# EasyShifts Google Cloud Run Deployment Guide

This guide will help you deploy your EasyShifts application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud Project** created
3. **Docker** installed locally
4. **Google Cloud CLI** installed and configured
5. **Database password** for your MySQL database

## Quick Start

### 1. Initial Setup

Run the setup script to configure your Google Cloud environment:

```bash
chmod +x setup-gcloud.sh
./setup-gcloud.sh
```

This script will:
- Enable required Google Cloud APIs
- Create service accounts and permissions
- Store your database password in Secret Manager
- Update deployment configurations

### 2. Test Locally (Optional)

Test your Docker containers locally before deploying:

```bash
chmod +x test-docker.sh
./test-docker.sh
```

### 3. Deploy to Cloud Run

Deploy both frontend and backend to Google Cloud Run:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Local Container Deployment (Recommended)

If you're encountering Cloud Build bucket restrictions, use our local container deployment scripts:

### For Linux/Mac:

```bash
# Make the script executable
chmod +x deploy-local-containers.sh

# Deploy both frontend and backend
./deploy-local-containers.sh

# Deploy only backend
./deploy-local-containers.sh --backend-only

# Deploy only frontend
./deploy-local-containers.sh --frontend-only

# Skip building images (if already
```

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Set Environment Variables

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"
```

### 2. Build and Push Backend

```bash
cd Backend

# Build the image locally
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/easyshifts-repo/easyshifts-backend:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/$PROJECT_ID/easyshifts-repo/easyshifts-backend:latest
```

### 3. Deploy Backend

```bash
gcloud run deploy easyshifts-backend \
    --image gcr.io/$PROJECT_ID/easyshifts-backend:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --set-env-vars GOOGLE_CLIENT_ID="your-google-client-id" \
    --set-env-vars DB_HOST="your-db-host" \
    --set-env-vars DB_PORT="3305" \
    --set-env-vars DB_USER="your-db-user" \
    --set-env-vars DB_NAME="your-db-name"
```

### 4. Build and Push Frontend

```bash
cd ../app
gcloud builds submit --tag gcr.io/$PROJECT_ID/easyshifts-frontend:latest .
```

### 5. Deploy Frontend

```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe easyshifts-backend --platform managed --region $REGION --format 'value(status.url)')
WS_URL=$(echo $BACKEND_URL | sed 's/https:/wss:/')

gcloud run deploy easyshifts-frontend \
    --image gcr.io/$PROJECT_ID/easyshifts-frontend:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 0.5 \
    --set-env-vars REACT_APP_GOOGLE_CLIENT_ID="your-google-client-id" \
    --set-env-vars REACT_APP_API_URL="$WS_URL" \
    --set-env-vars REACT_APP_ENV="production"
```

## Configuration

### Environment Variables

#### Backend
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `DB_HOST`: Database hostname
- `DB_PORT`: Database port (default: 3305)
- `DB_USER`: Database username
- `DB_NAME`: Database name
- `DB_PASSWORD`: Database password (stored in Secret Manager)

#### Frontend
- `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `REACT_APP_API_URL`: WebSocket URL of your backend service
- `REACT_APP_ENV`: Environment (production/development)

### Google OAuth Setup

After deployment, update your Google OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your Cloud Run URLs to authorized origins:
   - `https://your-frontend-url.run.app`
   - `https://your-backend-url.run.app`

## Monitoring and Logs

### View Logs

```bash
# Backend logs
gcloud run services logs read easyshifts-backend --region=$REGION

# Frontend logs
gcloud run services logs read easyshifts-frontend --region=$REGION
```

### Monitor Services

```bash
# List services
gcloud run services list --region=$REGION

# Get service details
gcloud run services describe easyshifts-backend --region=$REGION
gcloud run services describe easyshifts-frontend --region=$REGION
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker files for syntax errors
   - Ensure all dependencies are in requirements.txt/package.json

2. **Database Connection Issues**
   - Verify database credentials
   - Check if database allows connections from Cloud Run IPs

3. **Google OAuth Issues**
   - Ensure OAuth URLs are correctly configured
   - Check that client ID matches in all configurations

4. **WebSocket Connection Issues**
   - Verify backend URL is correctly set in frontend
   - Check that backend health check is responding

### Health Checks

- Backend health check: `https://your-backend-url.run.app/health`
- Frontend health check: `https://your-frontend-url.run.app/health`

## Scaling and Performance

### Auto Scaling

Cloud Run automatically scales based on traffic. You can configure:

```bash
# Set minimum instances (to reduce cold starts)
gcloud run services update easyshifts-backend \
    --min-instances=1 \
    --region=$REGION

# Set maximum instances
gcloud run services update easyshifts-backend \
    --max-instances=10 \
    --region=$REGION
```

### Resource Limits

Adjust CPU and memory based on your needs:

```bash
gcloud run services update easyshifts-backend \
    --memory=2Gi \
    --cpu=2 \
    --region=$REGION
```

## Security

- Database password is stored in Google Secret Manager
- Services use least-privilege service accounts
- HTTPS is enforced by default
- CORS is properly configured

## Cost Optimization

- Cloud Run charges only for actual usage
- Consider setting minimum instances for frequently used services
- Monitor usage in Google Cloud Console
- Use appropriate resource limits

## Support

For issues with this deployment:
1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Test locally using the Docker testing script
4. Check Google Cloud Console for service status


