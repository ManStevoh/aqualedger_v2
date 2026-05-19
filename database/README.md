# AquaLedger V2 - Database Setup Guide

## Prerequisites

- MySQL 8.0+ or MariaDB 10.5+
- Node.js 18+

## Quick Setup

### 1. Install MySQL

**macOS (Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
Download from https://dev.mysql.com/downloads/mysql/

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE aqualedger;
CREATE USER 'aqualedger_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON aqualedger.* TO 'aqualedger_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Run Schema

```bash
# From project root
mysql -u root -p aqualedger < database/schema.sql
```

Or run in MySQL client:
```sql
USE aqualedger;
SOURCE /path/to/project/database/schema.sql;
```

### 4. Configure Environment

Copy `.env.example` to `.env.local` and update:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=aqualedger_user
DB_PASSWORD=your_secure_password
DB_NAME=aqualedger
JWT_SECRET=generate-a-strong-random-string
```

### 5. Verify Connection

```bash
pnpm dev
# Visit http://localhost:3000/api/health
```

## Database Schema Overview

### Core Tables
- `users` - User accounts with roles
- `sessions` - JWT refresh tokens
- `wallets` - User wallet balances
- `transactions` - Financial transactions

### Fishing Operations
- `boats` - Registered vessels
- `boat_crew` - Crew assignments
- `boat_maintenance` - Maintenance records
- `fishing_trips` - Fishing expeditions
- `trip_crew` - Trip participants
- `catches` - Fish catch records
- `fish_species` - Species catalog

### Marketplace
- `fish_listings` - Marketplace listings
- `orders` - Purchase orders
- `order_items` - Order line items

### BMU & Compliance
- `bmu` - Beach Management Units
- `landing_sites` - Landing beaches
- `licenses` - Fishing/trading licenses
- `license_types` - License categories

### Financial Inclusion
- `credit_scores` - AI credit scores
- `credit_score_history` - Score history
- `loan_products` - Available loans
- `loan_applications` - Loan requests

### Climate & Alerts
- `climate_alerts` - Weather warnings
- `alert_subscriptions` - User subscriptions

### Storage
- `storage_facilities` - Cold storage
- `storage_inventory` - Stored fish

### System
- `expenses` - Operational expenses
- `notifications` - User notifications
- `audit_log` - Change tracking

## API Endpoints (v2)

All v2 endpoints require authentication and use the real database.

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Resources
- `GET/POST/PUT/DELETE /api/v2/boats` - Boat management
- `GET/POST/PUT /api/v2/trips` - Fishing trips
- `GET/POST/PUT/DELETE /api/v2/catches` - Catch records
- `GET/POST/PUT/DELETE /api/v2/marketplace` - Fish listings
- `GET/POST/PUT /api/v2/orders` - Purchase orders
- `GET/POST /api/v2/wallet` - Wallet operations
- `GET /api/v2/analytics` - Dashboard analytics
- `GET/POST/PUT/DELETE /api/v2/users` - User management (admin)

## Default Admin User

After running the schema, a default admin is created:
- **Email:** admin@aqualedger.co.ke
- **Password:** Admin@123

⚠️ **Change this password immediately in production!**

## Backup & Restore

### Backup
```bash
mysqldump -u root -p aqualedger > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
mysql -u root -p aqualedger < backup_20240101.sql
```

## Troubleshooting

### Connection Refused
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env.local`

### Access Denied
- Check user permissions
- Verify password is correct

### Schema Errors
- Ensure MySQL 8.0+ for UUID functions
- Check for existing tables before running schema

## Production Checklist

- [ ] Use strong passwords
- [ ] Enable SSL/TLS connections
- [ ] Set up regular backups
- [ ] Configure connection pooling
- [ ] Enable slow query logging
- [ ] Set up monitoring
- [ ] Use read replicas for scaling
