# 🚀 Production Deployment Guide: Next.js + MySQL via Docker on Ubuntu

This guide provides a comprehensive walkthrough for deploying the **AquaLedger V2** monolith to a fresh or existing Ubuntu Server utilizing Docker, Docker Compose, Nginx, and Let's Encrypt (SSL).

---

## 🏗️ Deployment Architecture

```mermaid
graph TD
    Client[Client / Web Browser] -- HTTPS:443 --> Nginx[Nginx Reverse Proxy]
    Nginx -- HTTP:3000 --> App[Next.js App Container]
    App -- Internal Port 3306 --> DB[(MySQL Container)]
    
    subgraph Host Network
        Nginx
    end
    
    subgraph Docker Network (aqualedger-network)
        App
        DB
    end

    Volume[(Docker Volume: db-data)] -.-> DB
```

---

## 📋 Table of Contents
1. [Prerequisites & Server Setup](#1-prerequisites--server-setup)
2. [Project Transfer to Ubuntu](#2-project-transfer-to-ubuntu)
3. [Environment Configuration](#3-environment-configuration)
4. [Spinning up the Containers](#4-spinning-up-the-containers)
5. [Database Setup & Seeding](#5-database-setup--seeding)
6. [Nginx Reverse Proxy & SSL Setup](#6-nginx-reverse-proxy--ssl-setup)
7. [Cron Jobs & Ongoing Maintenance](#7-cron-jobs--ongoing-maintenance)

---

## 1. Prerequisites & Server Setup

Ensure your Ubuntu Server (20.04 or 22.04 LTS recommended) has a public IP address and your domain name (e.g. `app.yourdomain.com`) is pointing to that IP address in your DNS settings.

Log in to your Ubuntu server via SSH and execute the following commands to install Docker and Docker Compose:

### A. Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### B. Install Docker (Official Repository Method)
```bash
# Add Docker's official GPG key:
sudo apt-get install ca-certificates curl gnupg -y
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

# Install Docker packages:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

### C. Verify Installation & Enable Docker Service
```bash
sudo docker --version
sudo docker compose version

# Configure Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 2. Project Transfer to Ubuntu

To deploy the application, you need to copy the project files to the Ubuntu server. The best and cleanest way to do this is using Git, but you can also use `rsync` or SFTP.

### Option A: Using Git (Highly Recommended)
Clone your repository directly onto the server into a deployment directory:
```bash
mkdir -p /var/www
cd /var/www
# Replace with your actual repository URL:
git clone https://github.com/your-github-username/aqualedger_v2.git aqualedger
cd aqualedger
```

### Option B: Using rsync (Without Git Remote)
Run this command from your local machine to upload files directly to your server:
```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' . user@your-server-ip:/var/www/aqualedger
```

---

## 3. Environment Configuration

Next.js and MySQL in our production Compose file read environment variables from a `.env` file located in the root of the project directory.

Create the production `.env` file on your server:
```bash
cd /var/www/aqualedger
nano .env
```

Paste the following configuration and customize the credentials. 

> [!IMPORTANT]
> Change the secrets, passwords, and URLs to match your production domain. Keep all passwords secure.

```env
# Database Credentials (used to initialize MySQL and connect the Next.js app)
DB_ROOT_PASSWORD=InsertStrongRootPasswordHere
DB_NAME=aqualedger_prod
DB_USER=aqualedger_user
DB_PASSWORD=InsertStrongUserPasswordHere

# Security
# Run: openssl rand -base64 32 to generate a secure secret
JWT_SECRET=InsertGenerated32CharJwtSecretHere

# URL Configurations (Crucial for secure cookies, redirection and M-Pesa callbacks)
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Cron GDPR Export Secret
# Run: openssl rand -base64 32 to generate
CRON_SECRET=InsertGeneratedCronSecretHere

# (Optional integrations - configure when ready)
# MPESA_CONSUMER_KEY=
# MPESA_CONSUMER_SECRET=
# STRIPE_SECRET_KEY=
# SMTP_HOST=
# SMTP_USER=
```
Save and exit `nano` (`Ctrl + O`, `Enter`, then `Ctrl + X`).

---

## 4. Spinning up the Containers

Now we are ready to build the optimized multi-stage Next.js Docker image and boot up both the app and MySQL.

### A. Pull base images and build Next.js monolith
```bash
sudo docker compose -f docker-compose.prod.yml build
```
*Note: The first build might take a few minutes as it pulls the base alpine images and runs Next.js's production compilation (`npm run build`). Subsequent builds will be much faster because of Docker layer caching.*

### B. Start the containers in detached mode
```bash
sudo docker compose -f docker-compose.prod.yml up -d
```

### C. Verify the containers are running and healthy
```bash
sudo docker compose -f docker-compose.prod.yml ps
```
You should see:
- `aqualedger-db` running and marked as **healthy** (after ~15 seconds).
- `aqualedger-app` running and listening on port `3000` locally.

To view logs for troubleshooting:
```bash
sudo docker compose -f docker-compose.prod.yml logs -f app
```

---

## 5. Database Setup & Seeding

Since this is a fresh setup, we need to initialize the database schema and seed the initial super-admin platform user.

Run the setup commands **inside the running Next.js application container**:

### A. Check MySQL connectivity
```bash
sudo docker compose -f docker-compose.prod.yml exec app npm run db:check
```

### B. Setup Database Schema & Seed Super-Admin User
```bash
sudo docker compose -f docker-compose.prod.yml exec app npm run db:setup
```
*This command runs `node scripts/setup-fresh-database.mjs` inside the container which provisions all the database tables.*

### C. Run Verification Tests
```bash
sudo docker compose -f docker-compose.prod.yml exec app npm run db:verify
```

---

## 6. Nginx Reverse Proxy & SSL Setup

Our Next.js app container is listening on `127.0.0.1:3000`. We will use Nginx on the host server to handle public HTTPS traffic, route requests to our container, and automatically manage SSL certificates.

### A. Install Nginx and Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### B. Create an Nginx Server Block Configuration
Create a configuration file for your application:
```bash
sudo nano /etc/nginx/sites-available/aqualedger
```

Paste the following reverse proxy configuration (replace `app.yourdomain.com` with your domain):
```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    # Secure Header Configuration
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Set maximum upload size (useful for GDPR / document uploads)
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Connection headers for WebSockets support (Next.js HMR/realtime)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Forward Client IP headers (Crucial for audit trails and security logs)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable buffering for low-latency streaming if needed
        proxy_buffering off;
    }
}
```

### C. Enable the Site and Test Configuration
```bash
# Link the configuration to sites-enabled
sudo ln -s /etc/nginx/sites-available/aqualedger /etc/nginx/sites-enabled/

# Remove Nginx default index site if active
sudo rm /etc/nginx/sites-enabled/default

# Test configuration for syntax errors
sudo nginx -t
```
If the test is successful, restart Nginx:
```bash
sudo systemctl restart nginx
```

### D. Obtain SSL Certificate with Certbot (Let's Encrypt)
Run Certbot to automatically fetch and configure a secure HTTPS certificate for your domain:
```bash
sudo certbot --nginx -d app.yourdomain.com
```
Follow the interactive prompts:
1. Enter your email address (for certificate renewal notifications).
2. Accept the terms of service.
3. Choose whether to redirect HTTP traffic to HTTPS (highly recommended!).

Once complete, Certbot will automatically rewrite Nginx config to serve over HTTPS (port 443) and set up a systemd cron job to renew the certificates before they expire!

---

## 7. Cron Jobs & Ongoing Maintenance

### A. Set Up System Cron Job for GDPR Exports
AquaLedger uses a background worker script to process scheduled reports and GDPR tenant data exports. To automate this on the host machine:

Run the following command to edit the root system crontab:
```bash
sudo crontab -e
```

Add the following line to run the export process every 30 minutes inside the running container (replace `/var/www/aqualedger` with your actual project directory on the server):
```cron
*/30 * * * * cd /var/www/aqualedger && docker compose -f docker-compose.prod.yml exec -T app npm run exports:process >> /var/log/aqualedger-exports.log 2>&1
```

### B. Deployment Upgrades (Deploying Updates)
When you commit changes to Git and want to redeploy them to the Ubuntu server, run this simple script on the server:

```bash
cd /var/www/aqualedger
git pull

# Rebuild and start container in background (zero downtime!)
sudo docker compose -f docker-compose.prod.yml up -d --build

# Run migrations (safe, won't delete data)
sudo docker compose -f docker-compose.prod.yml exec app npm run db:migrate

# Prune old Docker build cache and dangling images to save disk space
sudo docker image prune -f
```

---

## 🚀 Welcome to Production!
You are all set! Open your browser, navigate to `https://app.yourdomain.com/login` and sign in with the platform super admin credentials generated by the seeding step. Use the Platform Command Center (`/dashboard/admin`) to provision tenant organizations.
