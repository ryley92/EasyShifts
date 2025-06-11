#!/usr/bin/env python3
"""
Deploy the fixed EasyShifts backend with database session fixes
"""

import os
import subprocess
import sys
from datetime import datetime

def check_prerequisites():
    """Check if all prerequisites are met for deployment"""
    print("🔍 Checking Deployment Prerequisites")
    print("=" * 40)
    
    # Check if gcloud is installed
    try:
        result = subprocess.run(['gcloud', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("   ✅ Google Cloud CLI installed")
        else:
            print("   ❌ Google Cloud CLI not found")
            return False
    except FileNotFoundError:
        print("   ❌ Google Cloud CLI not found")
        return False
    
    # Check if Docker is available (for local builds)
    try:
        result = subprocess.run(['docker', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("   ✅ Docker available")
        else:
            print("   ⚠️  Docker not available (will use Cloud Build)")
    except FileNotFoundError:
        print("   ⚠️  Docker not available (will use Cloud Build)")
    
    # Check if Dockerfile exists
    if os.path.exists('Dockerfile'):
        print("   ✅ Dockerfile found")
    else:
        print("   ❌ Dockerfile not found")
        return False
    
    return True

def create_deployment_dockerfile():
    """Create an optimized Dockerfile for deployment"""
    dockerfile_content = '''# EasyShifts Backend Dockerfile - Optimized for Production
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash easyshifts
RUN chown -R easyshifts:easyshifts /app
USER easyshifts

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD python -c "import requests; requests.get('http://localhost:8080/health')" || exit 1

# Start the application
CMD ["python", "start_server_with_env.py"]
'''
    
    with open('Dockerfile.optimized', 'w') as f:
        f.write(dockerfile_content)
    
    print("✅ Created optimized Dockerfile")

def deploy_to_cloud_run():
    """Deploy the backend to Google Cloud Run"""
    print("\n🚀 Deploying to Google Cloud Run")
    print("=" * 35)
    
    # Configuration
    project_id = "easyshifts-434822"
    region = "us-central1"
    service_name = "easyshifts-backend"
    
    # Build and deploy command
    deploy_cmd = [
        'gcloud', 'run', 'deploy', service_name,
        '--source', '.',
        '--platform', 'managed',
        '--region', region,
        '--allow-unauthenticated',
        '--memory', '1Gi',
        '--cpu', '1',
        '--concurrency', '100',
        '--timeout', '300',
        '--set-env-vars', 'DB_HOST=miano.h.filess.io',
        '--set-env-vars', 'DB_PORT=3305',
        '--set-env-vars', 'DB_NAME=easyshiftsdb_danceshall',
        '--set-env-vars', 'DB_USER=easyshiftsdb_danceshall',
        '--set-env-vars', 'DB_PASSWORD=a61d15d9b4f2671739338d1082cc7b75c0084e21',
        '--set-env-vars', 'REDIS_HOST=redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com',
        '--set-env-vars', 'REDIS_PORT=12649',
        '--set-env-vars', 'REDIS_PASSWORD=AtpYvgs0JUs0KvuZm93yvTEzkXEg4fNa',
        '--set-env-vars', 'REDIS_DB=0',
        '--set-env-vars', 'SESSION_SECRET_KEY=K8mP9vN2xQ7wE5tR1yU6iO3pA8sD4fG9hJ2kL5nM7bV0cX1zQ6wE9rT3yU8iO5pA',
        '--set-env-vars', 'CSRF_SECRET_KEY=X9mN2bV5cQ8wE1rT4yU7iO0pA3sD6fG2hJ5kL8nM1bV4cX7zQ0wE3rT6yU9iO2pA',
        '--set-env-vars', 'GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com',
        '--set-env-vars', 'ENVIRONMENT=production',
        '--set-env-vars', 'DEBUG=false',
        '--set-env-vars', 'SESSION_TIMEOUT=3600',
        '--set-env-vars', 'REDIS_MAX_CONNECTIONS=20'
    ]
    
    print("📦 Building and deploying...")
    print("   This may take several minutes...")
    
    try:
        result = subprocess.run(deploy_cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("   ✅ Deployment successful!")
            
            # Extract service URL from output
            output_lines = result.stdout.split('\n')
            service_url = None
            for line in output_lines:
                if 'Service URL:' in line:
                    service_url = line.split('Service URL:')[1].strip()
                    break
            
            if service_url:
                print(f"   🌐 Service URL: {service_url}")
                return service_url
            else:
                print("   ⚠️  Deployment successful but couldn't extract URL")
                return True
        else:
            print("   ❌ Deployment failed!")
            print(f"   Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"   ❌ Deployment error: {e}")
        return False

def test_deployed_service(service_url):
    """Test the deployed service"""
    if not service_url or service_url is True:
        service_url = "https://easyshifts-backend-794306818447.us-central1.run.app"
    
    print(f"\n🧪 Testing Deployed Service")
    print("=" * 30)
    
    try:
        import requests
        
        # Test health endpoint
        health_url = f"{service_url}/health"
        print(f"🏥 Testing health endpoint: {health_url}")
        
        response = requests.get(health_url, timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✅ Health check: {health_data.get('status')}")
            print(f"   📊 Service: {health_data.get('service')}")
            print(f"   🕐 Timestamp: {health_data.get('timestamp')}")
            return True
        else:
            print(f"   ❌ Health check failed: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Service test failed: {e}")
        return False

def create_monitoring_script():
    """Create a monitoring script for the deployed service"""
    monitoring_script = '''#!/usr/bin/env python3
"""
EasyShifts Backend Monitoring Script
"""

import requests
import time
import json
from datetime import datetime

def check_health():
    """Check service health"""
    try:
        response = requests.get(
            "https://easyshifts-backend-794306818447.us-central1.run.app/health",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {datetime.now().isoformat()}: Service healthy - {data.get('status')}")
            return True
        else:
            print(f"❌ {datetime.now().isoformat()}: Health check failed - HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {datetime.now().isoformat()}: Health check error - {e}")
        return False

def monitor_service(interval=60):
    """Monitor service continuously"""
    print("🔍 Starting EasyShifts Backend Monitoring")
    print(f"   Checking every {interval} seconds")
    print("   Press Ctrl+C to stop")
    print()
    
    try:
        while True:
            check_health()
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\\n⏹️  Monitoring stopped")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "monitor":
        monitor_service()
    else:
        check_health()
'''
    
    with open('monitor_backend.py', 'w') as f:
        f.write(monitoring_script)
    
    print("✅ Created monitoring script: monitor_backend.py")

def main():
    """Run the deployment process"""
    print("🚀 EasyShifts Backend Deployment")
    print("=" * 40)
    print(f"📅 Deployment Time: {datetime.now().isoformat()}")
    print()
    
    # Check prerequisites
    if not check_prerequisites():
        print("❌ Prerequisites not met. Please install required tools.")
        return False
    
    # Create optimized Dockerfile
    create_deployment_dockerfile()
    
    # Deploy to Cloud Run
    service_url = deploy_to_cloud_run()
    
    if service_url:
        # Test the deployed service
        test_success = test_deployed_service(service_url)
        
        # Create monitoring script
        create_monitoring_script()
        
        print("\n" + "=" * 40)
        print("📊 DEPLOYMENT SUMMARY")
        print("=" * 40)
        print(f"Deployment: {'✅ Success' if service_url else '❌ Failed'}")
        print(f"Service Test: {'✅ Passed' if test_success else '❌ Failed'}")
        
        if service_url and test_success:
            print("\n🎉 Backend successfully deployed with fixes!")
            print("\n📋 Next Steps:")
            print("1. Test login functionality in frontend")
            print("2. Monitor service: python monitor_backend.py")
            print("3. Run continuous monitoring: python monitor_backend.py monitor")
            print("4. Update frontend to use new backend URL if needed")
        else:
            print("\n⚠️  Deployment completed but service test failed")
            print("   Check logs: gcloud run logs read easyshifts-backend --region=us-central1")
    else:
        print("\n❌ Deployment failed")
        print("   Check your Google Cloud configuration and try again")

if __name__ == "__main__":
    main()
