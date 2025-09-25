#!/bin/sh
echo "Running migrations..."
node ace migration:run --force

echo "Starting server..."
node ace serve --watch
