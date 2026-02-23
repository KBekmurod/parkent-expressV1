#!/bin/bash
# Generate self-signed SSL certificate for IP-based deployment
# Run this script on your Digital Ocean droplet before starting Docker

set -e

SSL_DIR="./nginx/ssl"
mkdir -p "$SSL_DIR"

echo "🔐 Generating self-signed SSL certificate..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$SSL_DIR/selfsigned.key" \
    -out "$SSL_DIR/selfsigned.crt" \
    -subj "/C=UZ/ST=Tashkent/L=Tashkent/O=ParkentExpress/CN=165.232.52.72" \
    -addext "subjectAltName=IP:165.232.52.72"

chmod 600 "$SSL_DIR/selfsigned.key"
chmod 644 "$SSL_DIR/selfsigned.crt"

echo "✅ SSL certificate generated at $SSL_DIR/"
echo ""
echo "⚠️  IMPORTANT: Since this is a self-signed certificate, browsers will show"
echo "   a security warning. For production, use Let's Encrypt with a domain name."
echo ""
echo "📋 Next steps:"
echo "   1. Update Vercel environment variable:"
echo "      VITE_API_URL=https://165.232.52.72/api/v1"
echo "   2. Restart Docker: docker-compose -f docker-compose.prod.yml up -d --build"
echo "   3. Visit https://165.232.52.72/api/v1/health to accept the certificate"
echo "   4. Then your Vercel admin panel should work"
