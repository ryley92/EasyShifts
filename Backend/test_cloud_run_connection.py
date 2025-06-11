#!/usr/bin/env python3
"""
Test the Cloud Run WebSocket connection to verify the server is working
"""

import asyncio
import json
import websockets
import traceback

async def test_cloud_run_websocket():
    """Test WebSocket connection to Cloud Run"""
    print("🧪 Testing Cloud Run WebSocket Connection")
    print("=" * 45)
    
    ws_url = "wss://easyshifts-backend-s5b2sxgpsa-uc.a.run.app/ws"
    
    try:
        print(f"🔌 Connecting to: {ws_url}")
        
        # Connect to WebSocket
        async with websockets.connect(ws_url) as websocket:
            print("✅ WebSocket connection established to Cloud Run")
            
            # Test login request
            login_request = {
                "request_id": 10,
                "data": {
                    "username": "admin",
                    "password": "Hdfatboy1!"
                }
            }
            
            print("📤 Sending login request...")
            await websocket.send(json.dumps(login_request))
            
            # Wait for response
            print("⏳ Waiting for response...")
            response_data = await asyncio.wait_for(websocket.recv(), timeout=15)
            
            print(f"📥 Raw response received: {len(response_data)} characters")
            
            # Parse response
            try:
                response = json.loads(response_data)
                print("📋 Parsed response:")
                print(json.dumps(response, indent=2))
                
                # Check response
                if response.get('request_id') == 10:
                    print("✅ Correct request_id received")
                    
                    if response.get('data', {}).get('user_exists'):
                        print("🎉 LOGIN SUCCESSFUL!")
                        print(f"   Session ID: {response['data'].get('session_id', 'N/A')[:20]}...")
                        print(f"   CSRF Token: {response['data'].get('csrf_token', 'N/A')[:20]}...")
                        print(f"   Is Manager: {response['data'].get('is_manager')}")
                        print(f"   Is Admin: {response['data'].get('is_admin')}")
                        return True
                    else:
                        print("❌ Login failed")
                        print(f"   Error: {response.get('data', {}).get('error')}")
                        return False
                else:
                    print(f"❌ Wrong request_id: expected 10, got {response.get('request_id')}")
                    return False
                    
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse JSON response: {e}")
                print(f"Raw response: {response_data}")
                return False
                
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ WebSocket connection closed: {e.code} {e.reason}")
        return False
    except websockets.exceptions.InvalidStatus as e:
        print(f"❌ WebSocket connection rejected: {e}")
        return False
    except asyncio.TimeoutError:
        print("❌ Connection or response timeout")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        traceback.print_exc()
        return False

async def test_health_endpoint():
    """Test the health endpoint"""
    print("\n🧪 Testing Health Endpoint")
    print("=" * 30)
    
    try:
        import aiohttp
        
        health_url = "https://easyshifts-backend-s5b2sxgpsa-uc.a.run.app/health"
        print(f"🔍 Checking: {health_url}")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(health_url, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print("✅ Health check passed:")
                    print(json.dumps(data, indent=2))
                    return True
                else:
                    print(f"❌ Health check failed: HTTP {resp.status}")
                    text = await resp.text()
                    print(f"Response: {text}")
                    return False
                    
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

async def main():
    """Run all tests"""
    print("🚀 Cloud Run Connection Test")
    print("=" * 30)
    
    # Test 1: Health endpoint
    health_ok = await test_health_endpoint()
    
    # Test 2: WebSocket login
    websocket_ok = await test_cloud_run_websocket()
    
    # Summary
    print(f"\n{'='*30}")
    print("TEST SUMMARY")
    print('='*30)
    print(f"Health Endpoint: {'✅ PASSED' if health_ok else '❌ FAILED'}")
    print(f"WebSocket Login: {'✅ PASSED' if websocket_ok else '❌ FAILED'}")
    
    if health_ok and websocket_ok:
        print("\n🎉 ALL TESTS PASSED!")
        print("The Cloud Run server is working correctly.")
        print("Your frontend should be able to connect and login successfully.")
    else:
        print("\n❌ SOME TESTS FAILED")
        print("Check the Cloud Run deployment and server logs.")
    
    return health_ok and websocket_ok

if __name__ == "__main__":
    asyncio.run(main())
