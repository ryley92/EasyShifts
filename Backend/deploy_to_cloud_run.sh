#!/bin/bash
# EasyShifts Backend Deployment Script
# Generated: 2025-06-11T15:10:36.209079

set -e  # Exit on any error

echo "🚀 EasyShifts Backend Deployment to Cloud Run"
echo "=============================================="

# Configuration
PROJECT_ID="easyshifts-434822"
REGION="us-central1"
SERVICE_NAME="easyshifts-backend"

echo "📋 Deployment Configuration:"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service: $SERVICE_NAME"
echo ""

# Pre-deployment validation
echo "🔍 Running pre-deployment validation..."
python pre_deployment_validation.py
if [ $? -ne 0 ]; then
    echo "❌ Pre-deployment validation failed!"
    exit 1
fi
echo ""

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --concurrency 100 \
    --timeout 300 \
    --port 8080 \
    --set-env-vars DB_HOST=miano.h.filess.io \
    --set-env-vars DB_PORT=3305 \
    --set-env-vars DB_NAME=easyshiftsdb_danceshall \
    --set-env-vars DB_USER=easyshiftsdb_danceshall \
    --set-env-vars DB_PASSWORD=a61d15d9b4f2671739338d1082cc7b75c0084e21 \
    --set-env-vars REDIS_HOST=redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com \
    --set-env-vars REDIS_PORT=12649 \
    --set-env-vars REDIS_PASSWORD=AtpYvgs0JUs0KvuZm93yvTEzkXEg4fNa \
    --set-env-vars REDIS_DB=0 \
    --set-env-vars SESSION_SECRET_KEY=K8mP9vN2xQ7wE5tR1yU6iO3pA8sD4fG9hJ2kL5nM7bV0cX1zQ6wE9rT3yU8iO5pA \
    --set-env-vars CSRF_SECRET_KEY=X9mN2bV5cQ8wE1rT4yU7iO0pA3sD6fG2hJ5kL8nM1bV4cX7zQ0wE3rT6yU9iO2pA \
    --set-env-vars GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com \
    --set-env-vars ENVIRONMENT=production \
    --set-env-vars DEBUG=false \
    --set-env-vars SESSION_TIMEOUT=3600 \
    --set-env-vars REDIS_MAX_CONNECTIONS=20

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🧪 Testing deployed service..."
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    echo "🌐 Service URL: $SERVICE_URL"
    
    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    curl -f "$SERVICE_URL/health" || echo "⚠️  Health check failed"
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📋 Next steps:"
    echo "   1. Test login functionality"
    echo "   2. Monitor service logs: gcloud run logs read $SERVICE_NAME --region=$REGION"
    echo "   3. Update frontend to use new backend URL if needed"
else
    echo "❌ Deployment failed!"
    exit 1
fi
