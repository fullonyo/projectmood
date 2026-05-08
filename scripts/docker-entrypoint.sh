#!/bin/sh
set -e

echo "✦ MoodSpace Studio — Initializing Environment..."

# 1. Wait for Database to be ready
echo "✦ Check: Waiting for database connectivity (db:5432)..."
until nc -z db 5432; do
  echo "✦ Wait: Database node is not reachable yet. Retrying in 2s..."
  sleep 2
done

# 2. Sync Database Schema
echo "✦ Sync: Harmonizing database schema with Prisma..."
# We use the local bin to avoid version mismatches and ensure reliability
if [ -f "./node_modules/.bin/prisma" ]; then
  ./node_modules/.bin/prisma db push --accept-data-loss
else
  # Fallback to npx if binary is missing (though it shouldn't be)
  npx prisma db push --accept-data-loss
fi

echo "✦ Sync: Database is now synchronized."

# 3. Generate Prisma Client (Just in case it's missing in the volume/cache)
echo "✦ Core: Generating Prisma Client..."
if [ -f "./node_modules/.bin/prisma" ]; then
  ./node_modules/.bin/prisma generate
else
  npx prisma generate
fi

# 4. Start the Application
echo "✦ Studio: System is online. Launching..."
exec node server.js
