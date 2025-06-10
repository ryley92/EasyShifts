# EasyShifts Google Cloud Run Deployment Script (PowerShell)

param(
    [string]$ProjectId = "goog-71174",
    [string]$Region = "us-central1"
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Cyan"

Write-Host "🚀 Starting EasyShifts deployment to Google Cloud Run" -ForegroundColor $Green

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "❌ gcloud CLI is not installed. Please install it first." -ForegroundColor $Red
    exit 1
}

# Check if user is authenticated
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $activeAccount) {
    Write-Host "⚠️ Not authenticated with gcloud. Please run: gcloud auth login" -ForegroundColor $Yellow
    exit 1
}

# Set the project
Write-Host "📋 Setting project to $ProjectId" -ForegroundColor $Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling required APIs" -ForegroundColor $Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository
Write-Host "📦 Creating Artifact Registry repository" -ForegroundColor $Yellow
gcloud artifacts repositories create easyshifts-repo --repository-format=docker --location=$Region --description="EasyShifts Docker repository" 2>$null

# Build and deploy backend
Write-Host "🏗️ Building backend image" -ForegroundColor $Yellow
Set-Location Backend
gcloud builds submit --tag "$Region-docker.pkg.dev/$ProjectId/easyshifts-repo/easyshifts-backend:latest" .

Write-Host "🚀 Deploying backend to Cloud Run" -ForegroundColor $Yellow
gcloud run deploy easyshifts-backend `
    --image "$Region-docker.pkg.dev/$ProjectId/easyshifts-repo/easyshifts-backend:latest" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --memory 1Gi `
    --cpu 1 `
    --concurrency 100 `
    --timeout 300 `
    --service-account "easyshifts-sa@$ProjectId.iam.gserviceaccount.com" `
    --set-env-vars "GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com" `
    --set-env-vars "DB_HOST=miano.h.filess.io" `
    --set-env-vars "DB_PORT=3305" `
    --set-env-vars "DB_USER=easyshiftsdb_danceshall" `
    --set-env-vars "DB_NAME=easyshiftsdb_danceshall"

# Get backend URL
$BackendUrl = gcloud run services describe easyshifts-backend --platform managed --region $Region --format 'value(status.url)'
Write-Host "✅ Backend deployed at: $BackendUrl" -ForegroundColor $Green

# Build and deploy frontend
Write-Host "🏗️ Building frontend image" -ForegroundColor $Yellow
Set-Location ../app
gcloud builds submit --tag "$Region-docker.pkg.dev/$ProjectId/easyshifts-repo/easyshifts-frontend:latest" .

Write-Host "🚀 Deploying frontend to Cloud Run" -ForegroundColor $Yellow
# Convert HTTP URL to WebSocket URL
$WsUrl = $BackendUrl -replace "https:", "wss:"

gcloud run deploy easyshifts-frontend `
    --image "$Region-docker.pkg.dev/$ProjectId/easyshifts-repo/easyshifts-frontend:latest" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --memory 512Mi `
    --cpu 1 `
    --concurrency 100 `
    --timeout 300 `
    --set-env-vars "REACT_APP_GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com" `
    --set-env-vars "REACT_APP_API_URL=$WsUrl" `
    --set-env-vars "REACT_APP_ENV=production"

# Get frontend URL
$FrontendUrl = gcloud run services describe easyshifts-frontend --platform managed --region $Region --format 'value(status.url)'

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $Green
Write-Host "📱 Frontend URL: $FrontendUrl" -ForegroundColor $Green
Write-Host "🔧 Backend URL: $BackendUrl" -ForegroundColor $Green
Write-Host "📝 Don't forget to update your Google OAuth settings with the new frontend URL" -ForegroundColor $Yellow

Set-Location ..
