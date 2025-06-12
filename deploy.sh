#!/bin/bash

# EasyShifts Google Cloud Run Deployment Script
# Make sure to run: chmod +x deploy.sh

set -e

# Configuration
PROJECT_ID="goog-71174"  # Replace with your Google Cloud Project ID
REGION="us-central1"          # Replace with your preferred region
SERVICE_ACCOUNT="easyshifts-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting EasyShifts deployment to Google Cloud Run${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Not authenticated with gcloud. Please run: gcloud auth login${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}📋 Setting project to ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Create service account if it doesn't exist
echo -e "${YELLOW}👤 Creating service account${NC}"
gcloud iam service-accounts create easyshifts-sa \
    --display-name="EasyShifts Service Account" \
    --description="Service account for EasyShifts application" || true

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/cloudsql.client" || true

# Build and deploy backend
echo -e "${YELLOW}🏗️  Building backend image${NC}"
cd Backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/easyshifts-backend:latest .

echo -e "${YELLOW}🚀 Deploying backend to Cloud Run${NC}"
gcloud run deploy easyshifts-backend \
    --image gcr.io/$PROJECT_ID/easyshifts-backend:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --concurrency 100 \
    --timeout 300 \
    --service-account $SERVICE_ACCOUNT \
    --set-env-vars GOOGLE_CLIENT_ID="794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com" \
    --set-env-vars DB_HOST="miano.h.filess.io" \
    --set-env-vars DB_PORT="3305" \
    --set-env-vars DB_USER="easyshiftsdb_danceshall" \
    --set-env-vars DB_NAME="easyshiftsdb_danceshall"

# Get backend URL
BACKEND_URL=$(gcloud run services describe easyshifts-backend --platform managed --region $REGION --format 'value(status.url)')
echo -e "${GREEN}✅ Backend deployed at: ${BACKEND_URL}${NC}"

# Build and deploy frontend
echo -e "${YELLOW}🏗️  Building frontend image${NC}"
cd ../app
gcloud builds submit --tag gcr.io/$PROJECT_ID/easyshifts-frontend:latest .

echo -e "${YELLOW}🚀 Deploying frontend to Cloud Run${NC}"
# Convert HTTP URL to WebSocket URL
WS_URL=$(echo $BACKEND_URL | sed 's/https:/wss:/')

gcloud run deploy easyshifts-frontend \
    --image gcr.io/$PROJECT_ID/easyshifts-frontend:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 0.5 \
    --concurrency 100 \
    --timeout 300 \
    --set-env-vars REACT_APP_GOOGLE_CLIENT_ID="794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com" \
    --set-env-vars REACT_APP_API_URL="$WS_URL" \
    --set-env-vars REACT_APP_ENV="production"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe easyshifts-frontend --platform managed --region $REGION --format 'value(status.url)')

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📱 Frontend URL: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}🔧 Backend URL: ${BACKEND_URL}${NC}"
echo -e "${YELLOW}📝 Don't forget to update your Google OAuth settings with the new frontend URL${NC}"

cd ..


