
# EasyShifts Local Build and Deploy Script
# This script builds Docker images locally and pushes to Artifact Registry

param(
    [string]$ProjectId = "goog-71174",
    [string]$Region = "us-central1"
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Cyan"

Write-Host "🚀 EasyShifts Local Build and Deploy to Cloud Run" -ForegroundColor $Green

# Check if Docker is installed
try {
    $null = Get-Command docker -ErrorAction Stop
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor $Red
    exit 1
}

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
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository
Write-Host "📦 Creating Artifact Registry repository" -ForegroundColor $Yellow
gcloud artifacts repositories create easyshifts-repo --repository-format=docker --location=$Region --description="EasyShifts Docker repository" 2>$null

# Configure Docker authentication
Write-Host "🔐 Configuring Docker authentication..." -ForegroundColor $Yellow
gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet

# Build backend image locally
Write-Host "🏗️ Building backend image locally" -ForegroundColor $Yellow
Set-Location Backend
$backendImage = "$Region-docker.pkg.dev/$ProjectId/easyshifts-repo/easyshifts-backend:latest"
docker build -t $backendImage .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed" -ForegroundColor $Red
    exit 1
}

# Push backend image
Write-Host "📤 Pushing backend image to Artifact Registry" -ForegroundColor $Yellow
docker push $backendImage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend push failed" -ForegroundColor $Red
    exit 1
}

# Deploy backend to Cloud Run
Write-Host "🚀 Deploying backend to Cloud Run" -ForegroundColor $Yellow

# Set DB_PASSWORD if not already set (using the known password from the connection string)
if (-not $env:DB_PASSWORD) {
    Write-Host "⚠️  DB_PASSWORD not set, using default password from connection string" -ForegroundColor $Yellow
    $env:DB_PASSWORD = "a61d15d9b4f2671739338d1082cc7b75c0084e21"
}

gcloud run deploy easyshifts-backend `
    --image $backendImage `
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
    --set-env-vars "DB_NAME=easyshiftsdb_danceshall" `
    --set-env-vars "DB_PASSWORD=$env:DB_PASSWORD"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed" -ForegroundColor $Red
    exit 1
}

# Use the correct backend URL
$BackendUrl = "https://easyshifts-backend-s5b2sxgpsa-uc.a.run.app"
Write-Host "✅ Using backend URL: $BackendUrl" -ForegroundColor $Green

# Build frontend image locally
Write-Host "🏗️ Building frontend image locally" -ForegroundColor $Yellow
Set-Location ../app
$frontendImage = "$Region-docker.pkg.dev/$ProjectId/easyshifts-repo/easyshifts-frontend:latest"
docker build -t $frontendImage .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor $Red
    exit 1
}

# Push frontend image
Write-Host "📤 Pushing frontend image to Artifact Registry" -ForegroundColor $Yellow
docker push $frontendImage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend push failed" -ForegroundColor $Red
    exit 1
}

# Deploy frontend to Cloud Run
Write-Host "🚀 Deploying frontend to Cloud Run" -ForegroundColor $Yellow
# Convert HTTP URL to WebSocket URL with /ws endpoint
$WsUrl = ($BackendUrl -replace "https:", "wss:") + "/ws"

gcloud run deploy easyshifts-frontend `
    --image $frontendImage `
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

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed" -ForegroundColor $Red
    exit 1
}

# Get frontend URL
$FrontendUrl = gcloud run services describe easyshifts-frontend --platform managed --region $Region --format 'value(status.url)'

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $Green
Write-Host "📱 Frontend URL: $FrontendUrl" -ForegroundColor $Green
Write-Host "🔧 Backend URL: $BackendUrl" -ForegroundColor $Green
Write-Host ""
Write-Host "📝 IMPORTANT: Update your Google OAuth settings!" -ForegroundColor $Yellow
Write-Host "Add these URLs to your Google OAuth configuration:" -ForegroundColor $Blue
Write-Host "   - $FrontendUrl" -ForegroundColor $Blue
Write-Host "   - $BackendUrl" -ForegroundColor $Blue
Write-Host ""
Write-Host "🔗 Google Cloud Console:" -ForegroundColor $Blue
Write-Host "   https://console.cloud.google.com/run?project=$ProjectId" -ForegroundColor $Blue

Set-Location ..
