#!/bin/bash
set -e

# Configuration
PROJECT_ID="goog-71174"
REGION="us-central1"
REPOSITORY="easyshifts-repo"
BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/easyshifts-backend:latest"
FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/easyshifts-frontend:latest"

# Parse command line arguments
SKIP_BUILD=false
BACKEND_ONLY=false
FRONTEND_ONLY=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function log_info() {
    echo -e "${CYAN}$1${NC}"
}

function log_success() {
    echo -e "${GREEN}$1${NC}"
}

function log_warning() {
    echo -e "${YELLOW}$1${NC}"
}

function log_error() {
    echo -e "${RED}$1${NC}"
}

log_info "🚀 Starting EasyShifts Local Container Deployment"
log_info "📋 Configuration:"
log_info "   Project ID: $PROJECT_ID"
log_info "   Region: $REGION"
log_info "   Repository: $REPOSITORY"
log_info "   Backend Image: $BACKEND_IMAGE"
log_info "   Frontend Image: $FRONTEND_IMAGE"

# Check prerequisites
log_info "🔍 Checking prerequisites..."

# Check if Docker is running
if ! docker version >/dev/null 2>&1; then
    log_error "❌ Docker is not running. Please start Docker."
    exit 1
fi
log_success "✅ Docker is running"

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    log_error "❌ gcloud is not authenticated. Please run 'gcloud auth login'"
    exit 1
fi

# Set project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    log_warning "⚠️ Setting project to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi
log_success "✅ gcloud is configured for project: $PROJECT_ID"

# Configure Docker for Artifact Registry
log_info "🔐 Configuring Docker for Artifact Registry..."
if ! gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet; then
    log_error "❌ Failed to configure Docker for Artifact Registry"
    exit 1
fi
log_success "✅ Docker configured for Artifact Registry"

# Create Artifact Registry repository if it doesn't exist
log_info "📦 Ensuring Artifact Registry repository exists..."
if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION >/dev/null 2>&1; then
    log_warning "Creating Artifact Registry repository..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="EasyShifts Docker repository"
fi
log_success "✅ Artifact Registry repository ready"

# Build and deploy backend
if [ "$FRONTEND_ONLY" != true ]; then
    log_info "🏗️ Building and deploying backend..."
    
    if [ "$SKIP_BUILD" != true ]; then
        log_info "📦 Building backend Docker image locally..."
        
        cd Backend
        
        # Build the image
        docker build -t $BACKEND_IMAGE .
        log_success "✅ Backend image built successfully"
        
        # Push to registry
        log_info "📤 Pushing backend image to Artifact Registry..."
        docker push $BACKEND_IMAGE
        log_success "✅ Backend image pushed successfully"
        
        cd ..
    fi
    
    # Deploy backend to Cloud Run
    log_info "🚀 Deploying backend to Cloud Run..."
    gcloud run deploy easyshifts-backend \
        --image $BACKEND_IMAGE \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 1Gi \
        --cpu 1 \
        --concurrency 100 \
        --timeout 300 \
        --set-env-vars "DB_HOST=miano.h.filess.io" \
        --set-env-vars "DB_PORT=3305" \
        --set-env-vars "DB_NAME=easyshiftsdb_danceshall" \
        --set-env-vars "DB_USER=easyshiftsdb_danceshall" \
        --set-env-vars "DB_PASSWORD=a61d15d9b4f2671739338d1082cc7b75c0084e21" \
        --set-env-vars "REDIS_HOST=redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com" \
        --set-env-vars "REDIS_PORT=12649" \
        --set-env-vars "REDIS_PASSWORD=AtpYvgs0JUs0KvuZm93yvTEzkXEg4fNa" \
        --set-env-vars "ENVIRONMENT=production"
        
    log_success "✅ Backend deployed successfully"
fi

# Get backend URL
BACKEND_URL=$(gcloud run services describe easyshifts-backend --platform managed --region $REGION --format 'value(status.url)')
WEBSOCKET_URL="${BACKEND_URL/https:/wss:}/ws"

log_info "🔗 Backend URL: $BACKEND_URL"
log_info "🔌 WebSocket URL: $WEBSOCKET_URL"

# Build and deploy frontend
if [ "$BACKEND_ONLY" != true ]; then
    log_info "🏗️ Building and deploying frontend..."
    
    if [ "$SKIP_BUILD" != true ]; then
        log_info "📦 Building frontend Docker image locally..."
        
        cd app
        
        # Build the image
        docker build -t $FRONTEND_IMAGE .
        log_success "✅ Frontend image built successfully"
        
        # Push to registry
        log_info "📤 Pushing frontend image to Artifact Registry..."
        docker push $FRONTEND_IMAGE
        log_success "✅ Frontend image pushed successfully"
        
        cd ..
    fi
    
    # Deploy frontend to Cloud Run
    log_info "🚀 Deploying frontend to Cloud Run..."
    gcloud run deploy easyshifts-frontend \
        --image $FRONTEND_IMAGE \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --concurrency 100 \
        --timeout 300 \
        --set-env-vars "REACT_APP_GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com" \
        --set-env-vars "REACT_APP_API_URL=$WEBSOCKET_URL" \
        --set-env-vars "REACT_APP_ENV=production"
        
    log_success "✅ Frontend deployed successfully"
fi

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe easyshifts-frontend --platform managed --region $REGION --format 'value(status.url)')

# Summary
log_success "🎉 Deployment completed successfully!"
log_success "📱 Frontend URL: $FRONTEND_URL"
log_success "🖥️ Backend URL: $BACKEND_URL"
log_success "🔌 WebSocket URL: $WEBSOCKET_URL"

log_info "📋 Next steps:"
log_info "1. Open the frontend URL in your browser"
log_info "2. Test login with admin/Hdfatboy1!"
log_info "3. Navigate to the enhanced schedule page"
log_info "4. Test the new bulk operations and analytics features"

# Test connectivity
log_info "🧪 Testing connectivity..."
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "200"; then
    log_success "✅ Backend health check passed"
else
    log_warning "⚠️ Backend health check failed"
fi

log_success "🚀 Deployment script completed!"
