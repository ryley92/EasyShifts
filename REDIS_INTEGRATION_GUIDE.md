# Redis Integration Guide for EasyShifts

## Overview

This guide documents the comprehensive Redis integration implemented for EasyShifts, providing session management, caching, and WebSocket connection management using Redis Cloud.

## Redis Cloud Configuration

**Redis Instance**: `redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com:12649`

### Environment Variables Required

```bash
# Redis Connection
REDIS_HOST=redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com
REDIS_PORT=12649
REDIS_PASSWORD=your_redis_password_here
REDIS_DB=0

# Session Security
SESSION_SECRET_KEY=your_session_secret_key_here
CSRF_SECRET_KEY=your_csrf_secret_key_here

# Session Configuration
SESSION_TIMEOUT_MINUTES=480
REDIS_MAX_CONNECTIONS=20
```

## Components Implemented

### 1. Redis Configuration (`Backend/config/redis_config.py`)

**Features:**
- Connection pooling for both sync and async operations
- Automatic reconnection handling
- Session and cache key management
- Health monitoring

**Usage:**
```python
from config.redis_config import redis_config, session_manager, cache_manager

# Get Redis connection
redis_client = redis_config.get_sync_connection()

# Session management
session_manager.create_session(session_id, user_data)
session_data = session_manager.get_session(session_id)

# Caching
cache_manager.set_cache("user_profile", user_data, ttl=3600)
cached_data = cache_manager.get_cache("user_profile")
```

### 2. Secure Session Management (`Backend/security/secure_session.py`)

**Security Features:**
- Bcrypt password hashing with cost factor 12
- CSRF token generation and validation
- Session IP validation (optional)
- Secure session ID generation using cryptographically secure random
- Automatic session expiration and refresh

**Key Classes:**
- `SecureSessionManager`: Main session management
- `PasswordSecurity`: Password hashing and validation
- `WebSocketSessionManager`: WebSocket-specific session handling

**Usage:**
```python
from security.secure_session import secure_session_manager, password_security

# Create secure session
session_id, csrf_token = secure_session_manager.create_secure_session(user_data, client_ip)

# Validate session
session_data = secure_session_manager.validate_session(session_id, csrf_token, client_ip)

# Password operations
hashed = password_security.hash_password("user_password")
is_valid = password_security.verify_password("user_password", hashed)
```

### 3. Smart Caching System (`Backend/cache/redis_cache.py`)

**Features:**
- Intelligent TTL management per data type
- Automatic cache key generation
- Cache invalidation patterns
- Performance metrics tracking
- Proactive cache warming

**Cache Types and TTLs:**
- User profiles: 30 minutes
- Shift data: 15 minutes
- Job listings: 10 minutes
- Employee lists: 20 minutes
- Settings: 2 hours
- Schedule data: 5 minutes

**Usage:**
```python
from cache.redis_cache import smart_cache, cached

# Manual caching
smart_cache.set('user_profile', user_data, user_id)
cached_data = smart_cache.get('user_profile', user_id)

# Decorator-based caching
@cached('user_profile', ttl=1800)
def get_user_profile(user_id):
    return fetch_user_from_database(user_id)
```

### 4. WebSocket Connection Management (`Backend/websocket/redis_websocket_manager.py`)

**Features:**
- Redis-backed connection persistence
- User-to-connection mapping
- Heartbeat monitoring
- Stale connection cleanup
- Broadcasting capabilities

**Usage:**
```python
from websocket.redis_websocket_manager import redis_websocket_manager

# Register connection
await redis_websocket_manager.register_connection(websocket, ws_id, session_id, user_data)

# Send to specific user
await redis_websocket_manager.send_to_user(user_id, message)

# Broadcast to managers
await redis_websocket_manager.send_to_managers(message)
```

## Security Improvements

### Password Security Migration

The system now supports both legacy plain-text passwords and new bcrypt-hashed passwords:

1. **New passwords** are automatically hashed with bcrypt
2. **Legacy passwords** are verified and automatically upgraded on login
3. **Password strength validation** enforces security requirements

### Session Security

- **Secure session IDs** using `secrets.token_urlsafe(32)`
- **CSRF protection** with token validation
- **IP validation** (optional, disabled by default for mobile compatibility)
- **Session expiration** with automatic cleanup
- **Redis persistence** for session data

## Performance Optimizations

### 1. Database Query Caching

```python
# Before: Direct database query every time
def get_user_shifts(user_id):
    return database.query(shifts).filter(user_id=user_id).all()

# After: Cached with automatic invalidation
@cached('shift_data', ttl=900)
def get_user_shifts(user_id):
    return database.query(shifts).filter(user_id=user_id).all()
```

### 2. Connection Pooling

- **Redis connection pooling** prevents connection exhaustion
- **WebSocket connection tracking** in Redis for scalability
- **Automatic cleanup** of stale connections

### 3. Cache Warming

```python
# Proactively warm cache for frequently accessed data
await cache_warmer.warm_user_cache(user_id)
await cache_warmer.warm_shift_cache(job_id)
```

## Deployment Configuration

### Cloud Run Environment Variables

```yaml
env:
- name: REDIS_HOST
  value: "redis-12649.c328.europe-west3-1.gce.redns.redis-cloud.com"
- name: REDIS_PORT
  value: "12649"
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: redis-credentials
      key: password
- name: SESSION_SECRET_KEY
  valueFrom:
    secretKeyRef:
      name: session-secrets
      key: session-key
- name: CSRF_SECRET_KEY
  valueFrom:
    secretKeyRef:
      name: session-secrets
      key: csrf-key
```

### Docker Configuration

```dockerfile
# Install Redis dependencies
RUN pip install redis aioredis hiredis bcrypt

# Copy Redis configuration
COPY config/redis_config.py /app/config/
COPY security/secure_session.py /app/security/
COPY cache/redis_cache.py /app/cache/
```

## Monitoring and Metrics

### Cache Performance

```python
from cache.redis_cache import cache_metrics

# Get cache hit/miss ratios
metrics = cache_metrics.get_metrics()
print(f"User profile cache hit ratio: {metrics['user_profile']['hits'] / (metrics['user_profile']['hits'] + metrics['user_profile']['misses'])}")
```

### Connection Statistics

```python
from websocket.redis_websocket_manager import redis_websocket_manager

# Get WebSocket connection stats
stats = await redis_websocket_manager.get_connection_stats()
print(f"Total connections: {stats['total_connections']}")
print(f"Manager connections: {stats['manager_connections']}")
```

## Migration Steps

### 1. Install Dependencies

```bash
pip install redis aioredis hiredis bcrypt
```

### 2. Set Environment Variables

Configure Redis connection and security keys in your deployment environment.

### 3. Update Authentication

The login handler now automatically upgrades legacy passwords to bcrypt hashes.

### 4. Enable Caching

Add `@cached` decorators to frequently called functions:

```python
@cached('employee_list', ttl=1200)
def get_approved_employees():
    # Database query here
```

### 5. Update WebSocket Handling

Integrate Redis WebSocket manager in your WebSocket handlers.

## Best Practices

### 1. Cache Invalidation

```python
# Invalidate related caches when data changes
smart_cache.invalidate_user_cache(user_id)
smart_cache.invalidate_shift_cache(job_id=job_id)
```

### 2. Session Management

```python
# Always validate sessions with CSRF tokens
session_data = secure_session_manager.validate_session(
    session_id, 
    csrf_token, 
    client_ip
)
```

### 3. Error Handling

```python
try:
    result = smart_cache.get('data_key', param1, param2)
    if result is None:
        result = expensive_database_operation(param1, param2)
        smart_cache.set('data_key', result, param1, param2)
except Exception as e:
    logger.error(f"Cache operation failed: {e}")
    # Fallback to database
    result = expensive_database_operation(param1, param2)
```

## Troubleshooting

### Common Issues

1. **Redis Connection Errors**
   - Check Redis host and port configuration
   - Verify Redis password in environment variables
   - Ensure Redis Cloud instance is accessible

2. **Session Validation Failures**
   - Check CSRF token generation and validation
   - Verify session timeout configuration
   - Check IP validation settings

3. **Cache Miss Issues**
   - Monitor cache TTL settings
   - Check cache key generation
   - Verify cache invalidation patterns

### Debug Commands

```python
# Test Redis connection
from config.redis_config import redis_config
redis_client = redis_config.get_sync_connection()
redis_client.ping()

# Check session data
from security.secure_session import session_manager
session_data = session_manager.get_session(session_id)

# Monitor cache performance
from cache.redis_cache import cache_metrics
metrics = cache_metrics.get_metrics()
```

## Next Steps

1. **Monitor Performance**: Track cache hit ratios and session performance
2. **Scale Redis**: Consider Redis Cluster for high-traffic scenarios
3. **Add Metrics**: Implement comprehensive monitoring with Prometheus/Grafana
4. **Security Audit**: Regular security reviews of session and cache data
