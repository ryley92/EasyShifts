#!/usr/bin/env python3
"""
EasyShifts Backend-Only Deployment Script
Deploy just the backend to Cloud Run while frontend issues are being fixed
"""

import os
import subprocess
import json
from datetime import datetime
from pathlib import Path

def run_command(command, cwd=None):
    """Run command and return success status"""
    try:
        print(f"🔄 {command}")
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True, timeout=600)
        if result.returncode == 0:
            print(f"✅ Success")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Failed (exit code: {result.returncode})")
            if result.stderr.strip():
                print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"💥 Exception: {e}")
        return False

def main():
    """Deploy backend only"""
    print("🔧 EasyShifts Backend-Only Deploy")
    print("=" * 35)
    
    project_id = "goog-71174"
    region = "us-central1"
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    registry = f"gcr.io/{project_id}"
    
    # Paths
    root_dir = Path(__file__).parent.parent
    backend_dir = root_dir / "Backend"
    
    print(f"📁 Backend: {backend_dir}")
    print(f"🏗️  Project: {project_id}")
    print(f"🌍 Region: {region}")
    print()
    
    # Check prerequisites
    print("🔍 Checking tools...")
    tools = ["docker", "gcloud"]
    for tool in tools:
        if not run_command(f"{tool} --version"):
            print(f"❌ {tool} not found")
            return False
    
    # Authenticate Docker
    print("\n🔐 Authenticating Docker...")
    if not run_command("gcloud auth configure-docker"):
        return False
    
    # Build backend
    print("\n🏗️  Building Backend...")
    backend_image = f"{registry}/easyshifts-backend:{timestamp}"
    
    if run_command(f"docker build -t {backend_image} .", cwd=backend_dir):
        print("📤 Pushing backend...")
        if run_command(f"docker push {backend_image}"):
            print("🚀 Deploying backend...")
            
            # Environment variables
            env_vars = [
                "DB_HOST=miano.h.filess.io",
                "DB_PORT=3305", 
                "DB_NAME=easyshiftsdb_danceshall",
                "DB_USER=easyshiftsdb_danceshall",
                "DB_PASSWORD=a61d15d9b4f2671739338d1082cc7b75c0084e21",
                "REDIS_HOST=redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com",
                "REDIS_PORT=12649",
                "REDIS_PASSWORD=AtpYvgs0JUs0KvuZm93yvTEzkXEg4fNa",
                "SESSION_SECRET_KEY=your-session-secret-key-here",
                "CSRF_SECRET_KEY=your-csrf-secret-key-here"
            ]
            
            env_string = ",".join(env_vars)
            
            deploy_cmd = f"""gcloud run deploy easyshifts-backend --image {backend_image} --region {region} --platform managed --allow-unauthenticated --port 8080 --memory 1Gi --set-env-vars {env_string}"""
            
            if run_command(deploy_cmd):
                print("✅ Backend deployed!")
                
                # Get URL
                print("\n🌐 Getting backend URL...")
                url_cmd = f"gcloud run services describe easyshifts-backend --region {region} --format value(status.url)"
                result = subprocess.run(url_cmd, shell=True, capture_output=True, text=True)
                
                if result.returncode == 0:
                    backend_url = result.stdout.strip()
                    print(f"🔧 Backend URL: {backend_url}")
                    
                    # Test health endpoint
                    print("\n🧪 Testing backend...")
                    test_cmd = f"curl -f {backend_url}/health"
                    if run_command(test_cmd):
                        print("✅ Backend health check passed!")
                    else:
                        print("⚠️  Backend health check failed (but service is deployed)")
                    
                    print("\n🎉 BACKEND DEPLOYMENT COMPLETE!")
                    print("=" * 40)
                    print(f"🔧 Backend API: {backend_url}")
                    print("\n📋 Next Steps:")
                    print("1. Fix frontend Babel issue:")
                    print("   cd ../app")
                    print("   npm install --save-dev @babel/plugin-proposal-private-property-in-object")
                    print("   npm run build")
                    print("2. Deploy frontend separately when ready")
                    
                    return True
                else:
                    print("❌ Failed to get backend URL")
                    return False
            else:
                print("❌ Backend deployment failed")
                return False
        else:
            print("❌ Failed to push backend image")
            return False
    else:
        print("❌ Failed to build backend")
        return False

if __name__ == "__main__":
    try:
        if main():
            exit(0)
        else:
            exit(1)
    except KeyboardInterrupt:
        print("\n⏹️  Deployment cancelled")
        exit(1)
