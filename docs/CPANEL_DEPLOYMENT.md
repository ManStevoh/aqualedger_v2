# AquaERP — cPanel Deployment Guide

This guide describes how to deploy **AquaERP** (configured with Next.js `standalone` mode) on cPanel shared or dedicated hosting environments using the **Setup Node.js App** utility (which runs on CloudLinux + Phusion Passenger).

---

## ⚡ 0. In-Place Update Procedure (For Already Running Applications)

If your application is **already live and running on cPanel** and you are applying an update/upgrade:

1. **Upload & Extract updated `deploy.zip`**:
   - Log into cPanel **File Manager**.
   - Navigate to your existing application directory (e.g., `/home/username/aquaerp`).
   - Upload `deploy.zip` and extract it directly over the existing folder (confirming **Overwrite**).
   - *Your existing `.env` file and database remain untouched.*

2. **Execute New Database Migrations via Web (Zero Terminal Required)**:
   - Visit: `https://yourdomain.com/setup?key=1987` (or `https://yourdomain.com/api/setup?key=1987`).
   - Click **Run Setup & Migrations**.
   - *The automated installer detects pre-existing tables, skips schema creation, and executes ONLY new/pending migration SQL files.*

3. **Restart Application**:
   - In cPanel **Setup Node.js App**, click **Restart**.
   - Your updated application is live!

---

## 1. Fresh Database Setup (Initial Installation Only)

AquaERP runs on MySQL. Follow these steps to configure the database on cPanel:

1. **Create Database & User**:
   - Log into cPanel and search for **MySQL® Database Wizard**.
   - Create a database (e.g., `username_aquaerp`).
   - Create a database user (e.g., `username_aquauser`) and set a strong, random password.
   - Assign the user to the database, ticking **All Privileges**.
   - Note down the database name, database user, and password for your `.env` configuration.

2. **Import Your Database Dump**:
   - Go to **phpMyAdmin** from cPanel.
   - Select your new database on the left sidebar.
   - Click the **Import** tab at the top.
   - Choose your custom database dump file (the `.sql` dump you want to use) and click **Go**.
   - This restores your existing database schema, tables, and records.

   > [!WARNING]
   > **Definer / Access Denied (Error #1227)**: If your SQL dump was generated from a local environment, it likely contains definer statements like `DEFINER=`root`@`localhost`` or `DEFINER=`root`@`%``. On cPanel shared hosting, you do not have `SUPER` privileges, causing the import to fail with error `#1227 - Access denied`.
   >
   > Before importing, strip the definers from your `.sql` dump:
   > - **Using terminal (Linux/macOS)**:
   >   ```bash
   >   sed -i 's/DEFINER=`[^`]*`@`[^`]*`//g' dump.sql
   >   sed -i 's/\/\*!50017 DEFINER=`[^`]*`@`[^`]*`\*\///g' dump.sql
   >   ```
   > - **Using a Text Editor**: Open the `.sql` file, search for `DEFINER=`root`@`%`` or `/*!50017 DEFINER=`root`@`%`*/` (or similar) and replace them with an empty string.

3. **Run Automatic Database Migrations & Setup (Zero Terminal Required)**:
   - Since you do not have cPanel SSH/Terminal access, AquaLedger includes an **Automated Web Setup & Migration Assistant**.
   - Simply navigate to your website URL appending `/setup` in your browser:
     ```
     https://yourdomain.com/setup?key=1987
     ```
   - Alternatively, you can make a direct API call or visit:
     ```
     https://yourdomain.com/api/setup?key=1987
     ```
   - **What happens automatically**:
     - Tests your MySQL database connection using credentials from `.env`.
     - Creates the database if it doesn't exist.
     - Initializes the base schema (`database/schema.sql`).
     - Executes all 35+ pending migration SQL scripts in `database/migrations/`.
     - Ensures the platform Super Admin user exists (`admin@aqualedger.co.ke` / `Admin@123`).
     - Returns a live execution log and status report.

---

## 2. Deploying Application Files

1. **Upload Package**:
   - Upload `deploy.zip` to your cPanel home folder using the **File Manager** (e.g., upload to `/home/username/`).
   - **Do not** extract it inside the `public_html` directory. Extracting it in a directory *outside* the public root (e.g., `/home/username/aquaerp`) is a security best practice that prevents raw environment variables (`.env`) or internal scripts from being directly accessed via URL.

2. **Extract Archive**:
   - Right-click `deploy.zip` and select **Extract** to a new directory (e.g., `/home/username/aquaerp`).

---

## 3. Configuring the Node.js App

1. **Create Node.js App**:
   - In cPanel, find and open the **Setup Node.js App** tool.
   - Click **Create Application**.
   - Fill in the configuration:
     * **Node.js version**: Select **20.x** (or **18.x** minimum).
     * **Application mode**: Select **Production**.
     * **Application root**: Path where files were extracted (e.g., `aquaerp` which matches `/home/username/aquaerp`).
     * **Application URL**: The subdomain where the application will be installed: `https://fishos.aqualedger.co.ke`.
     * **Application startup file**: Enter `app.js` (this acts as the bridge to Next.js's standalone `server.js`).

2. **Configure Environment Variables**:
   - Under **Environment variables**, click **Add Variable** for each of the following:

     | Variable Name | Example Value | Description |
     |---|---|---|
     | `NODE_ENV` | `production` | Enables React production optimizations |
     | `NEXT_PUBLIC_APP_URL` | `https://fishos.aqualedger.co.ke` | Base URL of your website |
     | `JWT_SECRET` | *[Use a 32+ character random string]* | Key for encrypting user sessions |
     | `CRON_SECRET` | *[Use a 32+ character random string]* | Security key for system exports/reports |
     | `DB_HOST` | `127.0.0.1` or `localhost` | MySQL Host |
     | `DB_PORT` | `3306` | MySQL Port |
     | `DB_USER` | `username_aquauser` | MySQL Database User |
     | `DB_PASSWORD` | *[Your MySQL password]* | MySQL Database Password |
     | `DB_NAME` | `username_aquaerp` | MySQL Database Name |

3. **Start Application**:
   - Click **Save** to apply the configuration.
   - Click **Start Application** at the top. The application will start running and serve traffic at `https://fishos.aqualedger.co.ke`.

---

## 4. Static Asset Routing Optimization (Recommended)

By default, all static asset requests (`.png`, `.js`, `.css`) go through the Node.js application process, which consumes CPU resources. You can optimize this by telling cPanel's Apache server to serve them directly:

1. Locate the public document root of your subdomain (e.g., `/home/username/public_html` or `/home/username/fishos.aqualedger.co.ke`).
2. Add the following rewrite rules to the `.htaccess` file inside that public folder (creating the file if it does not exist):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On

     # 1. Direct request to local Next.js static files if they exist
     RewriteCond %{DOCUMENT_ROOT}/.next/static/$1 -f
     RewriteRule ^_next/static/(.*)$ /.next/static/$1 [L]

     # 2. Direct request to public directory files if they exist
     RewriteCond %{DOCUMENT_ROOT}/$1 -f
     RewriteRule ^(.*)$ /$1 [L]
   </IfModule>
   ```
3. Create symbolic links (symlinks) inside the public folder pointing to the actual static folders in your node app directory:
   - Symlink `_next/static` to `/home/username/aquaerp/.next/static`
   - Symlink `public` folder files to `/home/username/public_html`
   *(This can be done using the cPanel Terminal or by running a cron job that creates the symlinks once).*

---

## 5. Setting Up Cron Jobs

AquaERP uses cron jobs to execute background tasks (like GDPR exports and automatic reports):

1. Go to **Cron Jobs** in cPanel.
2. Under **Add New Cron Job**, select the frequency (e.g., **Once Per Hour**: `0 * * * *`).
3. For the **Command**, copy the virtual environment command path shown at the top of your **Setup Node.js App** page, append the script execution, and redirect logs. It should look like this:
   ```bash
   source /home/username/nodevenv/aquaerp/20/bin/activate && cd /home/username/aquaerp && node scripts/process-exports.mjs >> /home/username/aquaerp/cron.log 2>&1
   ```
   *Replace `username` and `aquaerp` with your actual cPanel username and directory name.*

---

## 6. Troubleshooting

* **Page displays "Index of /" or "/api/health" returns "404 Not Found"**:
  - **Issue**: LiteSpeed/Apache is bypassing Node.js/Passenger entirely and serving the directory statically.
  - **Solution 1 (Check .htaccess)**: In cPanel **File Manager**, ensure hidden files are shown (click Settings in top right and check **Show Hidden Files (dotfiles)**). Open your `.htaccess` file inside `/home/wvectawx/fishos.aqualedger.co.ke/` (or your subdomain root folder) and verify it contains exactly this configuration:
    ```apache
    # DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
    PassengerAppRoot "/home/wvectawx/fishos.aqualedger.co.ke"
    PassengerBaseURI "/"
    PassengerNodejs "/home/wvectawx/nodevenv/fishos.aqualedger.co.ke/20/bin/node"
    PassengerAppType node
    PassengerStartupFile "app.js"
    # DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
    ```
    If these lines are missing or commented out, LiteSpeed won't boot your Node.js application.
  - **Solution 2 (Check App Status)**: In cPanel **Setup Node.js App**, verify the application status is green and says **Started**. If it shows "Stopped", click the **Start** button. If it is already started, click **Restart** to apply configuration changes.

* **cPanel Setup Node.js App crashes when clicking "Save" or "Restart"**:
  - **Issue**: There is a known cPanel bug where the environment variable manager crashes if values (such as `DB_PASSWORD` or `JWT_SECRET`) contain special shell characters like `$`, `!`, `&`, `#`, or parentheses.
  - **Solution (Bypass cPanel GUI Environment Manager)**:
    1. In **Setup Node.js App**, delete all variables from the GUI environment table so it is completely empty.
    2. Create a file named `.env` directly in your application root folder (e.g. `/home/wvectawx/fishos.aqualedger.co.ke/.env`).
    3. Paste your variables directly into `.env` (the `app.js` startup wrapper contains a custom JavaScript parser that loads these environment variables at boot time, bypassing the cPanel GUI entirely):
       ```env
       NODE_ENV=production
       DB_HOST=localhost
       DB_PORT=3306
       DB_NAME=wvectawx_fishos
       DB_USER=wvectawx_fishos
       DB_PASSWORD="your_password_with_special_characters"
       JWT_SECRET="your_jwt_secret"
       CRON_SECRET="your_cron_secret"
       NEXT_PUBLIC_APP_URL=https://fishos.aqualedger.co.ke
       ```
    4. Save the `.env` file and click **Restart** in the Setup Node.js App manager.

* **Page displays "503 Service Unavailable" or "Passenger Error"**:
  - Check the log file located at `/home/username/aquaerp/cron.log` or the passenger logs.
  - Verify that the database is reachable and that all environment variables are correctly configured in the `.env` file.
* **Database Access Denied**:
   - Ensure your cPanel MySQL user has been explicitly *added* to the database with all privileges granted.
* **Database Import Error (#1227 - Access Denied / Definer Privilege)**:
  - **Issue**: Importing triggers, views, or functions fails with `#1227 - Access denied; you need (at least one of) the SUPER or SET_USER_ID privilege(s)`.
  - **Solution**: Strip the `DEFINER` statements from the `.sql` dump before importing. Run these command line commands:
    ```bash
    # Strip normal DEFINER clauses
    sed -i 's/DEFINER=`[^`]*`@`[^`]*`/g' dump.sql
    # Strip commented DEFINER clauses used by MySQL dumps
    sed -i 's/\/\*!50017 DEFINER=`[^`]*`@`[^`]*`\*\///g' dump.sql
    ```
    Alternatively, open your `.sql` file in a text editor (e.g., VS Code or Notepad++), perform a global search & replace for `DEFINER=`root`@`localhost`` or `DEFINER=`root`@`%`` (and their commented forms like `/*!50017 DEFINER=`root`@`%`*/`), and replace them with nothing.
* **Missing CSS/JS or Assets on Site**:
  - Ensure the `.next/static` folder was correctly zipped and extracted, and that static pathing is set correctly.

---

## 7. Developer & AI Agent Notes

When modifying the build, routing, or packaging code, future developers and AI agents must adhere to these established patterns to avoid breaking the cPanel/Passenger deployment:

### 1. Startup Wrapper & Dependency-Free `.env` Loader
* **Context**: Next.js's standalone build mode does NOT copy `dotenv` or other unreferenced node modules into the standalone `node_modules` directory.
* **Constraint**: The `app.js` startup file uses a **pure-JS custom parser** to load `.env` variables at boot. Do NOT add `require('dotenv')` or any other external package imports to `app.js`.
* **Behavior**: The custom parser allows later variables in the `.env` file to overwrite earlier ones (last-write-wins). This prevents local Docker configs at the top from overriding production credentials at the bottom.

### 2. Secret Key Character Restrictions (No `$` symbols)
* **Context**: Next.js automatically executes `dotenv-expand` on variables containing a `$` symbol followed by letters/numbers (like `$rL5wZ`). This strips those sections from your secret values during runtime initialization, causing secrets to be shorter than 32 characters and crash the login API.
* **Constraint**: All generated secrets (such as `JWT_SECRET` and `CRON_SECRET`) **must be strictly alphanumeric** (no `$` or special shell symbols) to prevent truncation by `dotenv-expand` or cPanel GUI manager crashes.

### 3. Subdomain Redirect Exceptions (Staging Subdomains)
* **Context**: The app normally redirects users to tenant subdomains (e.g. `tenant.aqualedger.co.ke`). In staging environments where the application itself runs on a subdomain (e.g. `fishos.aqualedger.co.ke`), this creates nested subdomains (`tenant.fishos.aqualedger.co.ke`) which fail with `DNS_NAME_NOT_RESOLVED` unless wildcard DNS is enabled.
* **Constraint**: Any staging subdomain must be explicitly added to the bypass list in `performSubdomainRedirect` inside [app/login/page.tsx](file:///home/staticlumen/Projects/aqualedger_v2/app/login/page.tsx). This keeps users on the same domain and logs them in via path-based routing.

### 4. Staging Configuration Templates (`fishos.aqualedger.co.ke`)

For reference, here are the exact configurations used for the `fishos.aqualedger.co.ke` deployment environment:

#### `.htaccess` Reference (LiteSpeed / Passenger)
```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/wvectawx/fishos.aqualedger.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/wvectawx/nodevenv/fishos.aqualedger.co.ke/20/bin/node"
PassengerAppType node
PassengerStartupFile "app.js"
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

#### `.env` Production Reference
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wvectawx_fishos
DB_USER=wvectawx_fishos
DB_PASSWORD="5+*!K2rAf(MY}a?$"
JWT_SECRET="v8KpmN2qXrL5wZjT9yBcF3hD6nA0eP7q"
CRON_SECRET="Qs7eU4iG1oWkM8xPlvR2tYbj5nC9lH6t"
NEXT_PUBLIC_APP_URL=https://fishos.aqualedger.co.ke
```
