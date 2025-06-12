#!/usr/bin/env python3
"""
Deploy Debug Version of EasyShifts Backend
"""

import subprocess
from datetime import datetime

def run_command(command):
    """Run command and return success status"""
    try:
        print(f"🔄 {command}")
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=600)
        if result.returncode == 0:
            print(f"✅ Success")
            return True
        else:
            print(f"❌ Failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"💥 Exception: {e}")
        return False

def create_debug_dockerfile():
    """Create Dockerfile for debug server"""
    dockerfile_content = '''FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    default-libmysqlclient-dev \\
    pkg-config \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \\
    && chown -R app:app /app
USER app

# Environment
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

# Use debug server
CMD ["python", "-u", "debug_server.py"]
'''
    
    with open('Dockerfile.debug', 'w') as f:
        f.write(dockerfile_content)
    
    print("✅ Created debug Dockerfile")

def main():
    """Deploy debug version"""
    print("🐛 EasyShifts Debug Deployment")
    print("=" * 32)
    
    project_id = "goog-71174"
    region = "us-central1"
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    registry = f"gcr.io/{project_id}"
    
    # Create debug Dockerfile
    create_debug_dockerfile()
    
    # Build debug image
    debug_image = f"{registry}/easyshifts-backend-debug:{timestamp}"
    
    if run_command(f"docker build -f Dockerfile.debug -t {debug_image} ."):
        if run_command(f"docker push {debug_image}"):
            # Deploy debug version
            deploy_cmd = f"gcloud run deploy easyshifts-backend --image {debug_image} --region {region} --platform managed --allow-unauthenticated --port 8080 --memory 1Gi --timeout 900 --set-env-vars DB_HOST=miano.h.filess.io,DB_PORT=3305,DB_NAME=easyshiftsdb_danceshall,DB_USER=easyshiftsdb_danceshall,DB_PASSWORD=a61d15d9b4f2671739338d1082cc7b75c0084e21,REDIS_HOST=redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com,REDIS_PORT=12649,REDIS_PASSWORD=AtpYvgs0JUs0KvuZm93yvTEzkXEg4fNa"
            
            if run_command(deploy_cmd):
                print("✅ Debug version deployed!")
                print("\n🌐 Test these URLs:")
                print("   https://easyshifts-backend-794306818447.us-central1.run.app/health")
                print("   https://easyshifts-backend-794306818447.us-central1.run.app/debug")
                print("   https://easyshifts-backend-794306818447.us-central1.run.app/test-db")
                return True
    
    return False

if __name__ == "__main__":
    main()
