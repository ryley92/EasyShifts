#!/bin/sh

# Replace environment variables in built files and nginx config
# This allows runtime configuration of the React app

echo "=== EasyShifts Environment Configuration ==="
echo "PORT: ${PORT:-8080}"
echo "REACT_APP_GOOGLE_CLIENT_ID: ${REACT_APP_GOOGLE_CLIENT_ID}"
echo "REACT_APP_API_URL: ${REACT_APP_API_URL}"
echo "REACT_APP_ENV: ${REACT_APP_ENV}"

# Set default PORT if not provided
PORT=${PORT:-8080}

# Replace PORT in nginx config
echo "Configuring nginx to listen on port $PORT"
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/conf.d/default.conf

# Verify the nginx config was updated
echo "Nginx configuration:"
cat /etc/nginx/conf.d/default.conf | head -5

# Create a temporary file with environment variables
cat <<EOF > /tmp/env-config.js
window._env_ = {
  REACT_APP_GOOGLE_CLIENT_ID: "${REACT_APP_GOOGLE_CLIENT_ID}",
  REACT_APP_API_URL: "${REACT_APP_API_URL}",
  REACT_APP_ENV: "${REACT_APP_ENV}"
};
EOF

# Copy the environment config to the nginx html directory
cp /tmp/env-config.js /usr/share/nginx/html/env-config.js

echo "Environment variables configured for runtime"
echo "Nginx configured to listen on port $PORT"
