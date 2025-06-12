#!/usr/bin/env python3
"""
EasyShifts Full Deployment Script
Rebuilds and deploys both frontend and backend containers to Google Cloud Run
"""

import os
import sys
import subprocess
import json
import time
from datetime import datetime
from pathlib import Path

class EasyShiftsDeployer:
    def __init__(self):
        self.project_id = "goog-71174"  # Updated to your actual project ID
        self.region = "us-central1"
        self.backend_service = "easyshifts-backend"
        self.frontend_service = "easyshifts-frontend"
        
        # Paths
        self.root_dir = Path(__file__).parent.parent
        self.backend_dir = self.root_dir / "Backend"
        self.frontend_dir = self.root_dir / "app"
        
        # Container registry
        self.registry = f"gcr.io/{self.project_id}"
        
        # Build timestamp for unique tags
        self.timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        
        print(f"🚀 EasyShifts Full Deployment Script")
        print(f"📁 Root directory: {self.root_dir}")
        print(f"🏗️  Project ID: {self.project_id}")
        print(f"🌍 Region: {self.region}")
        print(f"⏰ Build timestamp: {self.timestamp}")
        print("=" * 60)

    def run_command(self, command, cwd=None, description=""):
        """Run a shell command with error handling"""
        try:
            if description:
                print(f"🔄 {description}")
            
            print(f"   Command: {command}")
            
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )
            
            if result.returncode == 0:
                print(f"   ✅ Success")
                if result.stdout.strip():
                    print(f"   Output: {result.stdout.strip()}")
                return True, result.stdout
            else:
                print(f"   ❌ Failed (exit code: {result.returncode})")
                if result.stderr.strip():
                    print(f"   Error: {result.stderr.strip()}")
                return False, result.stderr
                
        except subprocess.TimeoutExpired:
            print(f"   ⏰ Command timed out after 10 minutes")
            return False, "Command timed out"
        except Exception as e:
            print(f"   💥 Exception: {e}")
            return False, str(e)

    def check_prerequisites(self):
        """Check if all required tools are installed"""
        print("\n🔍 Checking Prerequisites")
        print("-" * 30)
        
        required_tools = [
            ("docker", "Docker"),
            ("gcloud", "Google Cloud CLI"),
            ("node", "Node.js"),
            ("npm", "NPM")
        ]
        
        all_good = True
        
        for tool, name in required_tools:
            success, output = self.run_command(f"{tool} --version", description=f"Checking {name}")
            if not success:
                print(f"   ❌ {name} not found or not working")
                all_good = False
            else:
                version = output.split('\n')[0] if output else "unknown"
                print(f"   ✅ {name}: {version}")
        
        # Check gcloud authentication
        success, output = self.run_command("gcloud auth list --filter=status:ACTIVE --format=value(account)")
        if success and output.strip():
            print(f"   ✅ Authenticated as: {output.strip()}")
        else:
            print(f"   ❌ Not authenticated with gcloud")
            all_good = False
        
        # Check project configuration
        success, output = self.run_command("gcloud config get-value project")
        if success and output.strip():
            current_project = output.strip()
            print(f"   ✅ Current project: {current_project}")
            if current_project != self.project_id:
                print(f"   ⚠️  Warning: Current project ({current_project}) != target project ({self.project_id})")
        
        return all_good

    def authenticate_docker(self):
        """Authenticate Docker with Google Container Registry"""
        print("\n🔐 Authenticating Docker with GCR")
        print("-" * 35)
        
        success, _ = self.run_command(
            "gcloud auth configure-docker",
            description="Configuring Docker for GCR"
        )
        
        return success

    def build_backend(self):
        """Build the backend Docker container"""
        print("\n🏗️  Building Backend Container")
        print("-" * 32)
        
        if not self.backend_dir.exists():
            print(f"   ❌ Backend directory not found: {self.backend_dir}")
            return False
        
        # Check if Dockerfile exists
        dockerfile = self.backend_dir / "Dockerfile"
        if not dockerfile.exists():
            print(f"   ❌ Dockerfile not found: {dockerfile}")
            return False
        
        # Build the container
        backend_image = f"{self.registry}/{self.backend_service}:{self.timestamp}"
        
        success, _ = self.run_command(
            f"docker build -t {backend_image} .",
            cwd=self.backend_dir,
            description=f"Building backend image: {backend_image}"
        )
        
        if success:
            # Tag as latest
            latest_image = f"{self.registry}/{self.backend_service}:latest"
            self.run_command(
                f"docker tag {backend_image} {latest_image}",
                description="Tagging as latest"
            )
            
            self.backend_image = backend_image
            self.backend_latest = latest_image
            return True
        
        return False

    def build_frontend(self):
        """Build the frontend Docker container"""
        print("\n🏗️  Building Frontend Container")
        print("-" * 33)
        
        if not self.frontend_dir.exists():
            print(f"   ❌ Frontend directory not found: {self.frontend_dir}")
            return False
        
        # Check if Dockerfile exists
        dockerfile = self.frontend_dir / "Dockerfile"
        if not dockerfile.exists():
            print(f"   ❌ Dockerfile not found: {dockerfile}")
            return False
        
        # Build the React app first
        print("   📦 Building React application...")

        # Update browserslist database first
        success, _ = self.run_command(
            "npx update-browserslist-db@latest",
            cwd=self.frontend_dir,
            description="Updating browserslist database"
        )

        # Install dependencies
        success, _ = self.run_command(
            "npm install",
            cwd=self.frontend_dir,
            description="Installing dependencies"
        )

        if not success:
            return False

        # Fix Babel dependency issue
        self.run_command(
            "npm install --save-dev @babel/plugin-proposal-private-property-in-object",
            cwd=self.frontend_dir,
            description="Installing missing Babel plugin"
        )

        # Fix audit issues (skip if it fails)
        self.run_command(
            "npm audit fix --legacy-peer-deps",
            cwd=self.frontend_dir,
            description="Fixing audit issues (optional)"
        )

        # Build the React app
        success, _ = self.run_command(
            "npm run build",
            cwd=self.frontend_dir,
            description="Building React app"
        )

        if not success:
            return False
        
        # Build the container
        frontend_image = f"{self.registry}/{self.frontend_service}:{self.timestamp}"
        
        success, _ = self.run_command(
            f"docker build -t {frontend_image} .",
            cwd=self.frontend_dir,
            description=f"Building frontend image: {frontend_image}"
        )
        
        if success:
            # Tag as latest
            latest_image = f"{self.registry}/{self.frontend_service}:latest"
            self.run_command(
                f"docker tag {frontend_image} {latest_image}",
                description="Tagging as latest"
            )
            
            self.frontend_image = frontend_image
            self.frontend_latest = latest_image
            return True
        
        return False

    def push_images(self):
        """Push Docker images to Google Container Registry"""
        print("\n📤 Pushing Images to GCR")
        print("-" * 26)
        
        images_to_push = []
        
        if hasattr(self, 'backend_image'):
            images_to_push.extend([self.backend_image, self.backend_latest])
        
        if hasattr(self, 'frontend_image'):
            images_to_push.extend([self.frontend_image, self.frontend_latest])
        
        all_success = True
        
        for image in images_to_push:
            success, _ = self.run_command(
                f"docker push {image}",
                description=f"Pushing {image}"
            )
            if not success:
                all_success = False
        
        return all_success

    def deploy_backend(self):
        """Deploy backend to Cloud Run"""
        print("\n🚀 Deploying Backend to Cloud Run")
        print("-" * 34)
        
        if not hasattr(self, 'backend_image'):
            print("   ❌ Backend image not built")
            return False
        
        # Environment variables for backend
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
        
        env_string = " ".join([f"--set-env-vars {var}" for var in env_vars])
        
        deploy_command = f"""gcloud run deploy {self.backend_service} \
            --image {self.backend_image} \
            --region {self.region} \
            --platform managed \
            --allow-unauthenticated \
            --port 8080 \
            --memory 1Gi \
            --cpu 1 \
            --timeout 300 \
            --concurrency 100 \
            --max-instances 10 \
            {env_string}"""
        
        success, output = self.run_command(
            deploy_command,
            description="Deploying backend service"
        )
        
        if success:
            # Extract service URL
            url_command = f"gcloud run services describe {self.backend_service} --region {self.region} --format 'value(status.url)'"
            url_success, url_output = self.run_command(url_command)
            if url_success:
                self.backend_url = url_output.strip()
                print(f"   🌐 Backend URL: {self.backend_url}")
        
        return success

    def test_deployments(self):
        """Test both deployed services"""
        print("\n🧪 Testing Deployed Services")
        print("-" * 28)

        # Test backend health
        if hasattr(self, 'backend_url'):
            success, _ = self.run_command(
                f"curl -f {self.backend_url}/health",
                description="Testing backend health endpoint"
            )
            if success:
                print("   ✅ Backend health check passed")
            else:
                print("   ⚠️  Backend health check failed")

        # Test frontend
        if hasattr(self, 'frontend_url'):
            success, _ = self.run_command(
                f"curl -f {self.frontend_url}",
                description="Testing frontend accessibility"
            )
            if success:
                print("   ✅ Frontend accessibility check passed")
            else:
                print("   ⚠️  Frontend accessibility check failed")

    def cleanup_local_images(self):
        """Clean up local Docker images to save space"""
        print("\n🧹 Cleaning Up Local Images")
        print("-" * 29)

        images_to_remove = []

        if hasattr(self, 'backend_image'):
            images_to_remove.extend([self.backend_image, self.backend_latest])

        if hasattr(self, 'frontend_image'):
            images_to_remove.extend([self.frontend_image, self.frontend_latest])

        for image in images_to_remove:
            self.run_command(
                f"docker rmi {image}",
                description=f"Removing {image}"
            )

        # Clean up dangling images
        self.run_command(
            "docker image prune -f",
            description="Removing dangling images"
        )

    def generate_deployment_report(self):
        """Generate a deployment report"""
        print("\n📊 Deployment Report")
        print("=" * 60)

        report = {
            "deployment_time": datetime.now().isoformat(),
            "timestamp": self.timestamp,
            "project_id": self.project_id,
            "region": self.region,
            "services": {}
        }

        if hasattr(self, 'backend_url'):
            report["services"]["backend"] = {
                "service_name": self.backend_service,
                "image": self.backend_image,
                "url": self.backend_url
            }
            print(f"🔧 Backend Service: {self.backend_service}")
            print(f"   Image: {self.backend_image}")
            print(f"   URL: {self.backend_url}")

        if hasattr(self, 'frontend_url'):
            report["services"]["frontend"] = {
                "service_name": self.frontend_service,
                "image": self.frontend_image,
                "url": self.frontend_url
            }
            print(f"🌐 Frontend Service: {self.frontend_service}")
            print(f"   Image: {self.frontend_image}")
            print(f"   URL: {self.frontend_url}")

        # Save report to file
        report_file = f"deployment_report_{self.timestamp}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n📄 Report saved to: {report_file}")

        return report

    def run_full_deployment(self):
        """Run the complete deployment process"""
        print("🚀 Starting Full EasyShifts Deployment")
        print("=" * 60)

        start_time = time.time()

        # Step 1: Check prerequisites
        if not self.check_prerequisites():
            print("\n❌ Prerequisites check failed. Please install missing tools.")
            return False

        # Step 2: Authenticate Docker
        if not self.authenticate_docker():
            print("\n❌ Docker authentication failed.")
            return False

        # Step 3: Build containers
        backend_built = self.build_backend()
        frontend_built = self.build_frontend()

        if not backend_built and not frontend_built:
            print("\n❌ No containers were built successfully.")
            return False

        # Step 4: Push images
        if not self.push_images():
            print("\n❌ Failed to push images to registry.")
            return False

        # Step 5: Deploy services
        backend_deployed = False
        frontend_deployed = False

        if backend_built:
            backend_deployed = self.deploy_backend()

        if frontend_built:
            frontend_deployed = self.deploy_frontend()

        if not backend_deployed and not frontend_deployed:
            print("\n❌ No services were deployed successfully.")
            return False

        # Step 6: Test deployments
        self.test_deployments()

        # Step 7: Generate report
        report = self.generate_deployment_report()

        # Step 8: Cleanup (optional)
        cleanup_choice = input("\n🧹 Clean up local Docker images? (y/N): ").lower()
        if cleanup_choice == 'y':
            self.cleanup_local_images()

        # Summary
        end_time = time.time()
        duration = end_time - start_time

        print("\n" + "=" * 60)
        print("🎉 DEPLOYMENT COMPLETE!")
        print("=" * 60)
        print(f"⏱️  Total time: {duration:.1f} seconds")

        if backend_deployed:
            print(f"✅ Backend deployed successfully")
        if frontend_deployed:
            print(f"✅ Frontend deployed successfully")

        print("\n🌐 Access your application:")
        if hasattr(self, 'frontend_url'):
            print(f"   Frontend: {self.frontend_url}")
        if hasattr(self, 'backend_url'):
            print(f"   Backend API: {self.backend_url}")

        return True

def main():
    """Main deployment function"""
    try:
        deployer = EasyShiftsDeployer()

        # Check if user wants to proceed
        print("\n⚠️  This will rebuild and deploy both frontend and backend containers.")
        print("   Make sure you have:")
        print("   - Docker installed and running")
        print("   - Google Cloud CLI installed and authenticated")
        print("   - Correct project ID configured")

        proceed = input("\n🤔 Do you want to proceed? (y/N): ").lower()
        if proceed != 'y':
            print("❌ Deployment cancelled by user.")
            return

        # Run deployment
        success = deployer.run_full_deployment()

        if success:
            print("\n🎊 All done! Your EasyShifts application is now live!")
            sys.exit(0)
        else:
            print("\n💥 Deployment failed. Check the logs above for details.")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n⏹️  Deployment interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

    def deploy_frontend(self):
        """Deploy frontend to Cloud Run"""
        print("\n🚀 Deploying Frontend to Cloud Run")
        print("-" * 35)
        
        if not hasattr(self, 'frontend_image'):
            print("   ❌ Frontend image not built")
            return False
        
        # Environment variables for frontend
        backend_url = getattr(self, 'backend_url', 'https://easyshifts-backend-123456789-uc.a.run.app')
        
        env_vars = [
            f"REACT_APP_BACKEND_URL={backend_url}",
            f"REACT_APP_WS_URL={backend_url.replace('https://', 'wss://')}/ws"
        ]
        
        env_string = " ".join([f"--set-env-vars {var}" for var in env_vars])
        
        deploy_command = f"""gcloud run deploy {self.frontend_service} \
            --image {self.frontend_image} \
            --region {self.region} \
            --platform managed \
            --allow-unauthenticated \
            --port 80 \
            --memory 512Mi \
            --cpu 1 \
            --timeout 300 \
            --concurrency 100 \
            --max-instances 5 \
            {env_string}"""
        
        success, output = self.run_command(
            deploy_command,
            description="Deploying frontend service"
        )
        
        if success:
            # Extract service URL
            url_command = f"gcloud run services describe {self.frontend_service} --region {self.region} --format 'value(status.url)'"
            url_success, url_output = self.run_command(url_command)
            if url_success:
                self.frontend_url = url_output.strip()
                print(f"   🌐 Frontend URL: {self.frontend_url}")
        
        return success
