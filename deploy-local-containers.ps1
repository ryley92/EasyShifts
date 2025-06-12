#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy EasyShifts to Google Cloud Run using local Docker builds
.DESCRIPTION
    This script builds Docker containers locally and pushes them to Google Artifact Registry,
    then deploys to Cloud Run. This avoids Cloud Build bucket restrictions.
#>

param(
    [string]$ProjectId = "goog-71174",
    [string]$Region = "us-central1",
    [string]$Repository = "easyshifts-repo",
    [switch]$SkipBuild = $false,
    [switch]$BackendOnly = $false,
    [switch]$FrontendOnly = $false,
    [switch]$Verbose = $false
)

# Set error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

# Configuration
$BACKEND_IMAGE = "$Region-docker.pkg.dev/$ProjectId/$Repository/easyshifts-backend:latest"
$FRONTEND_IMAGE = "$Region-docker.pkg.dev/$ProjectId/$Repository/easyshifts-frontend:latest"

Write-Info "🚀 Starting EasyShifts Local Container Deployment"
Write-Info "📋 Configuration:"
Write-Info "   Project ID: $ProjectId"
Write-Info "   Region: $Region"
Write-Info "   Repository: $Repository"
Write-Info "   Backend Image: $BACKEND_IMAGE"
Write-Info "   Frontend Image: $FRONTEND_IMAGE"

# Check prerequisites
Write-Info "🔍 Checking prerequisites..."

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Success "✅ Docker is running"
} catch {
    Write-Error "❌ Docker is not running. Please start Docker Desktop."
    exit 1
}

# Check if gcloud is authenticated
try {
    $currentProject = gcloud config get-value project 2>$null
    if ($currentProject -ne $ProjectId) {
        Write-Warning "⚠️ Setting project to $ProjectId"
        gcloud config set project $ProjectId
    }
    Write-Success "✅ gcloud is configured for project: $ProjectId"
} catch {
    Write-Error "❌ gcloud is not authenticated. Please run 'gcloud auth login'"
    exit 1
}

# Configure Docker for Artifact Registry
Write-Info "🔐 Configuring Docker for Artifact Registry..."
try {
    gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet
    Write-Success "✅ Docker configured for Artifact Registry"
} catch {
    Write-Error "❌ Failed to configure Docker for Artifact Registry"
    exit 1
}

# Create Artifact Registry repository if it doesn't exist
Write-Info "📦 Ensuring Artifact Registry repository exists..."
try {
    $repoExists = gcloud artifacts repositories describe $Repository --location=$Region 2>$null
    if (-not $repoExists) {
        Write-Warning "Creating Artifact Registry repository..."
        gcloud artifacts repositories create $Repository `
            --repository-format=docker `
            --location=$Region `
            --description="EasyShifts Docker repository"
    }
    Write-Success "✅ Artifact Registry repository ready"
} catch {
    Write-Warning "⚠️ Repository might already exist or creation failed (continuing...)"
}

# Build and deploy backend
if (-not $FrontendOnly) {
    Write-Info "🏗️ Building and deploying backend..."
    
    if (-not $SkipBuild) {
        Write-Info "📦 Building backend Docker image locally..."
        try {
            Set-Location "Backend"

            # Build the image
            docker build -t $BACKEND_IMAGE .
            Write-Success "✅ Backend image built successfully"
            
            # Push to registry
            Write-Info "📤 Pushing backend image to Artifact Registry..."
            docker push $BACKEND_IMAGE
            Write-Success "✅ Backend image pushed successfully"
            
        } catch {
            Write-Error "❌ Failed to build/push backend image: $_"
            exit 1
        }
    }
    
    # Deploy backend to Cloud Run
    Write-Info "🚀 Deploying backend to Cloud Run..."
    try {
        gcloud run deploy easyshifts-backend `
            --image $BACKEND_IMAGE `
            --platform managed `
            --region $Region `
            --allow-unauthenticated `
            --memory 1Gi `
            --cpu 1 `
            --concurrency 100 `
            --timeout 300 `
            --set-env-vars "DB_HOST=miano.h.filess.io" `
            --set-env-vars "DB_PORT=3305" `
            --set-env-vars "DB_NAME=easyshiftsdb_danceshall" `
            --set-env-vars "DB_USER=easyshiftsdb_danceshall" `
            --set-env-vars "DB_PASSWORD=a61d15d9b4f2671739338d1082cc7b75c0084e21" `
            --set-env-vars "REDIS_HOST=redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com" `
            --set-env-vars "REDIS_PORT=12649" `
            --set-env-vars "REDIS_PASSWORD=AtpYvgs0JUs0KvuZm93yvTEzkXEg4fNa" `
            --set-env-vars "ENVIRONMENT=development"
            
        Write-Success "✅ Backend deployed successfully"
    } catch {
        Write-Error "❌ Failed to deploy backend: $_"
        exit 1
    }
}

# Get backend URL
$BACKEND_URL = gcloud run services describe easyshifts-backend --platform managed --region $Region --format 'value(status.url)'
$WEBSOCKET_URL = $BACKEND_URL -replace "https:", "wss:" 
$WEBSOCKET_URL = "$WEBSOCKET_URL/ws"

Write-Info "🔗 Backend URL: $BACKEND_URL"
Write-Info "🔌 WebSocket URL: $WEBSOCKET_URL"

# Build and deploy frontend
if (-not $BackendOnly) {
    Write-Info "🏗️ Building and deploying frontend..."
    
    if (-not $SkipBuild) {
        Write-Info "📦 Building frontend Docker image locally..."
        try {
            Set-Location "app"

            # Build the image
            docker build -t $FRONTEND_IMAGE .
            Write-Success "✅ Frontend image built successfully"
            
            # Push to registry
            Write-Info "📤 Pushing frontend image to Artifact Registry..."
            docker push $FRONTEND_IMAGE
            Write-Success "✅ Frontend image pushed successfully"
            
        } catch {
            Write-Error "❌ Failed to build/push frontend image: $_"
            exit 1
        }
    }
    
    # Deploy frontend to Cloud Run
    Write-Info "🚀 Deploying frontend to Cloud Run..."
    try {
        gcloud run deploy easyshifts-frontend `
            --image $FRONTEND_IMAGE `
            --platform managed `
            --region $Region `
            --allow-unauthenticated `
            --memory 512Mi `
            --cpu 1 `
            --concurrency 100 `
            --timeout 300 `
            --set-env-vars "REACT_APP_GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com" `
            --set-env-vars "REACT_APP_API_URL=$WEBSOCKET_URL" `
            --set-env-vars "REACT_APP_ENV=production"
            
        Write-Success "✅ Frontend deployed successfully"
    } catch {
        Write-Error "❌ Failed to deploy frontend: $_"
        exit 1
    }
}

# Get frontend URL
$FRONTEND_URL = gcloud run services describe easyshifts-frontend --platform managed --region $Region --format 'value(status.url)'

# Summary
Write-Success "🎉 Deployment completed successfully!"
Write-Success "📱 Frontend URL: $FRONTEND_URL"
Write-Success "🖥️ Backend URL: $BACKEND_URL"
Write-Success "🔌 WebSocket URL: $WEBSOCKET_URL"

Write-Info "📋 Next steps:"
Write-Info "1. Open the frontend URL in your browser"
Write-Info "2. Test login with admin/Hdfatboy1!"
Write-Info "3. Navigate to the enhanced schedule page"
Write-Info "4. Test the new bulk operations and analytics features"

# Test connectivity
Write-Info "🧪 Testing connectivity..."
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "✅ Backend health check passed"
    } else {
        Write-Warning "⚠️ Backend health check returned status: $($response.StatusCode)"
    }
} catch {
    Write-Warning "⚠️ Backend health check failed: $_"
}

Write-Success "🚀 Deployment script completed!"


