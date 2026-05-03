# Installation Guide

Complete setup instructions for **macOS**, **Windows**, and **Linux**.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [macOS Setup](#macos-setup)
- [Windows Setup](#windows-setup)
- [Linux Setup](#linux-setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

You need the following installed before running the app:

| Tool | Version | Purpose |
|------|---------|---------|
| Java (JDK) | 17 | Backend runtime |
| Maven | 3.6+ | Backend build tool |
| Node.js | 18+ | Frontend runtime |
| npm | 9+ | Frontend package manager |
| MySQL | 8.0 | Database |

---

## macOS Setup

### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Java 17
```bash
brew install openjdk@17
```
Add Java to your PATH (add this to `~/.zshrc` or `~/.bash_profile`):
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```
Reload your shell:
```bash
source ~/.zshrc
```
Verify:
```bash
java -version   # should show openjdk 17
```

### 3. Install Maven
```bash
brew install maven
mvn -v   # verify
```

### 4. Install Node.js
```bash
brew install node
node -v && npm -v   # verify
```

### 5. Install and Start MySQL
```bash
brew install mysql
brew services start mysql
```
Set the root password (if not already set):
```bash
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

### 6. Install Project Dependencies
```bash
make setup
```

### 7. Start the App
```bash
make dev
```

---

## Windows Setup

### 1. Install Java 17

1. Download the **JDK 17** installer from [Adoptium](https://adoptium.net/temurin/releases/?version=17)
2. Run the installer — check **"Set JAVA_HOME variable"** and **"Add to PATH"** during setup
3. Open a new Command Prompt and verify:
```cmd
java -version
```

### 2. Install Maven

1. Download the binary zip from [maven.apache.org/download](https://maven.apache.org/download.cgi)
2. Extract to `C:\Program Files\Apache\maven`
3. Add to system environment variables:
   - **Variable:** `MAVEN_HOME` → `C:\Program Files\Apache\maven`
   - Add `%MAVEN_HOME%\bin` to the **Path** variable
4. Open a new terminal and verify:
```cmd
mvn -v
```

> **Tip:** Alternatively, install both Java and Maven via [Chocolatey](https://chocolatey.org):
> ```cmd
> choco install temurin17 maven -y
> ```

### 3. Install Node.js

1. Download the **LTS installer** from [nodejs.org](https://nodejs.org)
2. Run the installer (npm is included)
3. Verify:
```cmd
node -v && npm -v
```

> Or via Chocolatey:
> ```cmd
> choco install nodejs-lts -y
> ```

### 4. Install MySQL 8

1. Download **MySQL Community Server 8.0** from [dev.mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
2. Run the installer — select **Developer Default**
3. During setup, set the root password to `root` (or your preferred password)
4. Start MySQL:
```cmd
net start MySQL80
```

### 5. Install Project Dependencies

Open **Git Bash** or **PowerShell** in the project root:

**Option A — using Make (Git Bash / WSL)**
```bash
make setup
```

**Option B — manual (Command Prompt / PowerShell)**
```cmd
cd frontend
npm install
cd ..\backend
mvn dependency:resolve
cd ..
```

### 6. Start the App

**Option A — using Make (Git Bash / WSL)**
```bash
make dev
```

**Option B — manual (two separate terminals)**

Terminal 1 — Backend:
```cmd
cd backend
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
mvn spring-boot:run
```

Terminal 2 — Frontend:
```cmd
cd frontend
npm run dev
```

> **Note:** `make` is available in **Git Bash** (included with [Git for Windows](https://git-scm.com/download/win)) and **WSL**. For native PowerShell/CMD, use the manual two-terminal approach.

---

## Linux Setup

### Ubuntu / Debian

#### 1. Install Java 17
```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
```
Verify:
```bash
java -version
```
If multiple Java versions exist, set Java 17 as default:
```bash
sudo update-alternatives --config java
# select the entry for java-17
```
Add to `~/.bashrc`:
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
source ~/.bashrc
```

#### 2. Install Maven
```bash
sudo apt install -y maven
mvn -v   # verify
```

#### 3. Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v   # verify
```

#### 4. Install MySQL 8
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```
Secure and set root password:
```bash
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

#### 5. Install Project Dependencies
```bash
make setup
```

#### 6. Start the App
```bash
make dev
```

---

### Fedora / RHEL / CentOS

#### 1. Install Java 17
```bash
sudo dnf install -y java-17-openjdk-devel
java -version
```

#### 2. Install Maven
```bash
sudo dnf install -y maven
mvn -v
```

#### 3. Install Node.js 18+
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
node -v && npm -v
```

#### 4. Install MySQL 8
```bash
sudo dnf install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```
Set root password:
```bash
sudo mysql_secure_installation
# or directly:
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

#### 5. Install Project Dependencies
```bash
make setup
```

#### 6. Start the App
```bash
make dev
```

---

## Running the Application

Once setup is complete, the single command to start everything is:

```bash
make dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |

Press `Ctrl+C` to stop both servers.

### Individual servers
```bash
make backend    # backend only  (port 8080)
make frontend   # frontend only (port 5173)
```

---

## Environment Variables

Override defaults by setting these before running:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:mysql://localhost:3306/invoice_db` | Full JDBC connection URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | `root` | MySQL password |
| `JWT_SECRET` | built-in default | JWT signing secret — **change in production** |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origin |
| `PORT` | `8080` | Backend server port |

**macOS / Linux:**
```bash
export DB_PASSWORD=mypassword
make dev
```

**Windows (CMD):**
```cmd
set DB_PASSWORD=mypassword
mvn spring-boot:run
```

**Windows (PowerShell):**
```powershell
$env:DB_PASSWORD="mypassword"
mvn spring-boot:run
```

---

## Troubleshooting

### `java: command not found` / wrong Java version
Make sure `JAVA_HOME` points to JDK 17 and `$JAVA_HOME/bin` is on your PATH. Run `java -version` to confirm.

### `mvn: command not found`
Maven is not on your PATH. Verify the installation and that `mvn` (or `%MAVEN_HOME%\bin\mvn` on Windows) is in PATH.

### MySQL connection refused
- **macOS:** `brew services start mysql`
- **Linux:** `sudo systemctl start mysql`
- **Windows:** `net start MySQL80`

Check that credentials in `backend/src/main/resources/application.properties` match your MySQL setup.

### `Access denied for user 'root'@'localhost'`
Reset the root password:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
```

### Port 8080 already in use
```bash
# macOS / Linux
lsof -ti :8080 | xargs kill -9

# Windows (CMD)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Frontend not loading / blank page
Make sure the backend is running first, then start the frontend. Check the browser console for errors.

### `make: command not found` (Windows)
Use Git Bash (comes with Git for Windows), or run the backend and frontend manually in two separate terminals as shown in the [Windows Setup](#windows-setup) section.
