#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick deployment of EasyShifts frontend with enhanced schedule features
.DESCRIPTION
    This script builds and deploys only the frontend to showcase the new schedule functionality
#>

param(
    [string]$ProjectId = "goog-71174",
    [string]$Region = "us-central1",
    [string]$Repository = "easyshifts-repo"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

$FRONTEND_IMAGE = "$Region-docker.pkg.dev/$ProjectId/$Repository/easyshifts-frontend:latest"
$BACKEND_URL = "https://easyshifts-backend-794306818447.us-central1.run.app"
$WEBSOCKET_URL = "wss://easyshifts-backend-794306818447.us-central1.run.app/ws"

Write-Info "🚀 Quick Frontend Deployment - Enhanced Schedule Features"
Write-Info "📦 Frontend Image: $FRONTEND_IMAGE"
Write-Info "🔌 WebSocket URL: $WEBSOCKET_URL"

# Check Docker
try {
    docker version | Out-Null
    Write-Success "✅ Docker is running"
} catch {
    Write-Error "❌ Docker is not running. Please start Docker Desktop."
    exit 1
}

# Configure Docker for Artifact Registry
Write-Info "🔐 Configuring Docker for Artifact Registry..."
gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet
Write-Success "✅ Docker configured"

# Build frontend
Write-Info "🏗️ Building frontend with enhanced schedule features..."
Set-Location "app"

try {
    # Build the Docker image
    docker build -t $FRONTEND_IMAGE .
    Write-Success "✅ Frontend image built successfully"

    # Push to registry
    Write-Info "📤 Pushing to Artifact Registry..."
    docker push $FRONTEND_IMAGE
    Write-Success "✅ Image pushed successfully"

} catch {
    Write-Error "❌ Failed to build/push frontend: $($_.Exception.Message)"
    exit 1
}

# Deploy to Cloud Run
Write-Info "🚀 Deploying enhanced frontend to Cloud Run..."
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
    Write-Error "❌ Failed to deploy frontend: $($_.Exception.Message)"
    exit 1
}

# Get frontend URL
$FRONTEND_URL = gcloud run services describe easyshifts-frontend --platform managed --region $Region --format 'value(status.url)'

Write-Success "🎉 Enhanced Schedule Frontend Deployed!"
Write-Success "📱 Frontend URL: $FRONTEND_URL"
Write-Success "🖥️ Backend URL: $BACKEND_URL"

Write-Info "🆕 New Enhanced Schedule Features:"
Write-Info "   ✨ Bulk Operations Panel - Select multiple shifts for bulk actions"
Write-Info "   📊 Schedule Analytics - View utilization, costs, and performance metrics"
Write-Info "   📋 Shift Templates - Create and apply reusable shift patterns"
Write-Info "   🔄 Auto-refresh - Real-time schedule updates"
Write-Info "   🎯 Advanced Filtering - Multi-criteria search and filtering"
Write-Info "   📈 Visual Improvements - Enhanced UI with better UX"

Write-Info "🧪 To test the enhanced schedule:"
Write-Info "1. Open: $FRONTEND_URL"
Write-Info "2. Login with: admin / Hdfatboy1!"
Write-Info "3. Navigate to: Manager Profile → Schedule"
Write-Info "4. Try the new bulk operations and analytics features"

Write-Success "🚀 Deployment completed! Enjoy the enhanced scheduling experience!"
