# 🚀 Production Deployment Guide: Next.js + MySQL via Docker on Ubuntu

This guide provides a comprehensive walkthrough for deploying the **AquaLedger V2** monolith to a fresh or existing Ubuntu Server utilizing Docker, Docker Compose, Nginx, and Let's Encrypt (SSL).

---

## 🏗️ Deployment Architecture

```mermaid
graph TD
    Client[Client / Web Browser] -- HTTPS:443 --> Nginx[Nginx Reverse Proxy]
    Nginx -- HTTP:3001 --> App[Next.js App Container]
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

Ensure your Ubuntu Server (20.04 or 22.04 LTS recommended) has a public IP address and your domain name (e.g. `aqua.kenwafula.cv`) is pointing to that IP address in your DNS settings.

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
NEXT_PUBLIC_APP_URL=https://aqua.kenwafula.cv

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
- `aqualedger-app` running and listening on port `3001` locally.

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

## 6. Cloudflare Tunnel Routing & SSL Setup

Since your home lab setup runs behind a home network (without a public IP), Nginx and Let's Encrypt Certbot are bypassed. Instead, traffic is securely routed from Cloudflare directly to port `3001` inside your Docker container using your active **`home-lab`** Cloudflare Tunnel (`cloudflared`).

### A. Configure Local Tunnel Rules
On your Ubuntu server, open your Cloudflare Tunnel configuration file:
```bash
nano ~/.cloudflared/config.yml
```

Ensure your configuration maps `aqua.kenwafula.cv` directly to port `3001` (where your app Docker container is listening):
```yaml
tunnel: fbd28d4d-4c8f-4e4b-9f54-13185231682f
credentials-file: /home/staticlumen/.cloudflared/fbd28d4d-4c8f-4e4b-9f54-13185231682f.json

ingress:
  - hostname: broda.kenwafula.cv
    service: http://localhost:80
  - hostname: aqua.kenwafula.cv
    service: http://localhost:3001
  - hostname: kenwafula.cv
    service: http://localhost:80
  - service: http_status:404
```

### B. Apply the Tunnel Rules
Restart the Cloudflare Tunnel client service to apply the new rules:
```bash
sudo systemctl restart cloudflared
```

### C. Create Cloudflare DNS Record
In the DNS settings of your Cloudflare Dashboard under `kenwafula.cv`:
1. Click **Add record**.
2. Fill in the fields:
   * **Type**: `CNAME`
   * **Name**: `aqua`
   * **Target**: `fbd28d4d-4c8f-4e4b-9f54-13185231682f.cfargotunnel.com`
   * **Proxy status**: `Proxied` (Orange Cloud)
3. Click **Save**.

*No Nginx server blocks, firewall ports, or Certbot Let's Encrypt runs are required! Cloudflare's Edge network automatically secures your subdomain with high-grade HTTPS (SSL) before forwarding traffic.*

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

When you make changes to the repository and want to redeploy them successfully on the Ubuntu server, execute the following workflow on the server. This guide covers **pulling changes, rebuilding, refreshing containers, conditionally migrating/seeding, and purging unused resources to reclaim disk space**.

#### 📋 Quick Upgrade Cheat-Sheet
Run this script on the server to execute the entire redeployment cycle:

```bash
# Step 1: Navigate to the application root directory
cd /var/www/aqualedger

# Step 2: Fetch and pull the latest code updates from GitHub
git pull origin main

# Step 3: Rebuild the standalone application Docker image
sudo docker compose -f docker-compose.prod.yml build app

# Step 4: Recreate and restart the container (Forces the container to use the new image)
sudo docker compose -f docker-compose.prod.yml up -d app

# Step 5: (IF NEEDED) Run database migrations (Safe, incremental schema updates)
# -> Run only if you added new .sql files to database/migrations/
sudo docker compose -f docker-compose.prod.yml exec app npm run db:migrate

# Step 6: (IF NEEDED) Run database seeds
# -> Run ONLY if you added new seeder definitions or want to ensure configs/staff are up to date:
sudo docker compose -f docker-compose.prod.yml exec app npm run db:seed:super-admin
# -> Or, if you explicitly want to WIPE all your demo database tables and seed fresh:
# sudo docker compose -f docker-compose.prod.yml exec app npm run db:seed:super-admin:fresh

# Step 7: (RECOMMENDED) Purge unused Docker resources to save disk space
# Free up dangling/untagged image layers:
sudo docker image prune -f
# Purge the Next.js compilation build cache (essential for space management):
sudo docker builder prune -f
```

---

#### 🔍 Detailed Explanations & "When to Run" Guidelines

##### 1. Pulling Changes (`git pull origin main`)
* **What it does:** Fetches the latest commits from your GitHub repository and merges them into your local server copy.
* **When is it needed:** Every time you push a bug fix, feature, or document update from your local development machine to GitHub and want it live on the server.

##### 2. Rebuilding the Image (`docker compose ... build app`)
* **What it does:** Starts the multi-stage Docker build pipeline from the `Dockerfile`. It installs clean production dependencies, compiles the Next.js codebase (`npm run build`), creates the optimized standalone build layer, and saves it as a new Docker image labeled `aqualedger-app:latest`.
* **When is it needed:** Every time you pull down any changes to frontend files (`.ts`, `.tsx`, `.css`), backend files (`.ts`), or seeder scripts. If the code changes, a rebuild is **strictly mandatory**.

##### 3. Refreshing the Container (`docker compose ... up -d app`)
* **What it does:** Compares the active running `aqualedger-app` container against the newly compiled `aqualedger-app:latest` image. Seeing a difference, Docker Compose gracefully tears down the old container and boots up a **fresh container** using the new image in under a second (near zero-downtime).
* **When is it needed:** **Mandatory** immediately after running `build app`. If you skip this step, your running container will continue running your old code in the background (even if the build succeeded!).

##### 4. Migrating the Database (`docker compose ... exec app npm run db:migrate`)
* **What it does:** Executes your database migration runner inside the running container. It reads the files in `database/migrations/` and applies any new table alterations, column changes, or indexes. This command is safe and incremental: it only executes *new* migration scripts and will **never** overwrite or delete your existing tenant data.
* **When is it needed:** **Only if your updates modified the database schema** (i.e. you added a new `.sql` file inside the `database/migrations/` directory). If you only changed frontend components, styling, or routing logic, you can safely skip this command.

##### 5. Seeding the Database (`docker compose ... exec app npm run db:seed:super-admin`)
* **What it does:** Runs the platform-level and tenant-level seeder scripts inside your running container. 
* **When is it needed:** 
  * **Standard Seed (`npm run db:seed:super-admin`):** Run this if you added a new platform configuration, staff account, or default settings to your seeds and want to apply them without affecting existing tenants.
  * **Fresh Seed (`npm run db:seed:super-admin:fresh`):** **CAUTION:** Run this ONLY if you want to completely wipe all demo data, drop your active tables, and reload a 100% clean, fresh set of 20 demo tenants. Do not run this if you have real data you want to preserve.

##### 6. Purging for Space (`docker image prune` & `docker builder prune`)
* **What it does:** 
  * `docker image prune -f` deletes all "dangling" or untagged Docker images. These are old compiled layers left behind every time you rebuild the application.
  * `docker builder prune -f` purges the BuildKit builder cache. During multi-stage Next.js builds, Docker caches npm package structures to speed up subsequent builds. This cache grows incredibly fast and can easily consume **10GB - 20GB+** of disk space on a small home-lab server.
* **When is it needed:** Highly recommended to run **after every rebuild**. Running this regularly keeps your server's disk usage perfectly lean and prevents the disk from filling up.

---

## 🚀 Welcome to Production!
You are all set! Open your browser, navigate to `https://aqua.kenwafula.cv/login` and sign in with the platform super admin credentials generated by the seeding step. Use the Platform Command Center (`/dashboard/admin`) to provision tenant organizations.
