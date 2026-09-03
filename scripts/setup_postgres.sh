#!/bin/sh
set -e

echo "Configuring PostgreSQL 16..."
CONF="/var/lib/postgresql/data/postgresql.conf"
HBA="/var/lib/postgresql/data/pg_hba.conf"

sed -i '/unix_socket_directories/d' "$CONF"
sed -i '/listen_addresses/d' "$CONF"
echo "listen_addresses = '*'" >> "$CONF"
echo "unix_socket_directories = '/tmp'" >> "$CONF"

echo "host all all 0.0.0.0/0 trust" >> "$HBA"
echo "host all all ::/0 trust" >> "$HBA"

su - postgres -c "pg_ctl -D /var/lib/postgresql/data stop || true"
sleep 1
su - postgres -c "pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/data/server.log start"
sleep 2

su - postgres -c "psql -c \"CREATE USER skillsetu_user WITH SUPERUSER PASSWORD 'skillsetu_password';\" || true"
su - postgres -c "psql -c \"CREATE DATABASE skillsetu_db OWNER skillsetu_user;\" || true"
su - postgres -c "psql -d skillsetu_db -c \"CREATE EXTENSION IF NOT EXISTS \\\"uuid-ossp\\\"; CREATE EXTENSION IF NOT EXISTS \\\"pgcrypto\\\";\""

echo "PostgreSQL 16 is ready and listening!"
