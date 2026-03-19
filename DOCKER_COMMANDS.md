# 🐳 Docker Commands Guide - Daraz eCommerce

## Project Directory
```bash
cd /home/hillol-chakma/web_isd/Daraz
```

---

## ✅ START THE PROJECT

### Option 1: Start All Services (Recommended)
```bash
sudo docker compose up -d
```
- `-d` flag runs in background (detached mode)
- Starts all 4 services: PostgreSQL, Backend, Frontend, Nginx
- First run may take 2-3 minutes for images to build

### Option 2: Start with Log Output (Debugging)
```bash
sudo docker compose up
```
- Without `-d`, you see real-time logs
- Press `Ctrl+C` to stop
- Useful for troubleshooting

### Option 3: Start Specific Service Only
```bash
# Start only database
sudo docker compose up -d db

# Start only backend
sudo docker compose up -d backend

# Start only frontend
sudo docker compose up -d frontend
```

---

## ⏹️ STOP THE PROJECT

### Option 1: Stop All Services (Keep Data)
```bash
sudo docker compose stop
```
- Stops containers gracefully
- Keeps volumes and data intact
- Faster to restart with `docker compose start`

### Option 2: Stop Specific Service
```bash
sudo docker compose stop backend
sudo docker compose stop frontend
sudo docker compose stop db
```

### Option 3: Stop & Remove Everything (Delete All Data)
```bash
sudo docker compose down -v
```
- `-v` removes volumes (database data will be DELETED)
- Use only if you want a fresh start
- Database will be re-seeded when you restart

### Option 4: Stop & Remove, Keep Database
```bash
sudo docker compose down
```
- Stops and removes containers
- Keeps volume data
- Database persists

---

## 🔄 RESTART SERVICES

### Restart All Services
```bash
sudo docker compose restart
```

### Restart Specific Service
```bash
sudo docker compose restart backend
sudo docker compose restart frontend
sudo docker compose restart db
```

### Rebuild & Restart (After Code Changes)
```bash
sudo docker compose up -d --build
```
- Rebuilds Docker images from Dockerfile
- Use when you modify `backend/` or `frontend/` code

---

## 📊 CHECK STATUS

### View All Running Containers
```bash
sudo docker compose ps
```

### View All Containers (Including Stopped)
```bash
sudo docker compose ps -a
```

### Check Service Health
```bash
# All services
sudo docker compose ps

# Specific service
sudo docker compose ps backend
```

---

## 📝 VIEW LOGS

### View All Logs (Real-time)
```bash
sudo docker compose logs -f
```
- `-f` follows log output
- Press `Ctrl+C` to exit

### View Specific Service Logs
```bash
# Backend logs
sudo docker compose logs -f backend

# Frontend logs
sudo docker compose logs -f frontend

# Database logs
sudo docker compose logs -f db

# Nginx logs
sudo docker compose logs -f nginx
```

### View Last N Lines
```bash
# Last 50 lines
sudo docker compose logs backend --tail 50

# Last 20 lines
sudo docker compose logs -f backend --tail 20
```

---

## 🔗 ACCESS YOUR APPLICATION

### Open in Browser
```
http://localhost:9000
```

### Direct Service Access (Internal)
- Backend API: `http://localhost:4000/api`
- Frontend: `http://localhost:3000`
- Database: `localhost:5432`
- Nginx Proxy: `http://localhost:9000`

---

## 🔍 TROUBLESHOOTING

### Check Database Connection
```bash
sudo docker compose exec db psql -U daraz_user -d daraz_db -c "\dt"
```

### Test Backend API Health
```bash
sudo docker compose exec backend curl -s http://localhost:4000/health
```

### Check Container Details
```bash
sudo docker compose exec backend env
sudo docker compose exec db env
```

### View Container Logs with Timestamps
```bash
sudo docker compose logs --timestamps backend
```

### Delete Everything & Fresh Start
```bash
sudo docker compose down -v
sudo docker compose up -d
```

---

## 📋 QUICK REFERENCE TABLE

| Action | Command |
|--------|---------|
| **Start All** | `sudo docker compose up -d` |
| **Stop All** | `sudo docker compose stop` |
| **Stop & Remove** | `sudo docker compose down` |
| **Stop & Delete Data** | `sudo docker compose down -v` |
| **Restart All** | `sudo docker compose restart` |
| **Rebuild & Start** | `sudo docker compose up -d --build` |
| **View Status** | `sudo docker compose ps` |
| **View Logs** | `sudo docker compose logs -f` |
| **Logs (Backend)** | `sudo docker compose logs -f backend` |
| **Logs (Frontend)** | `sudo docker compose logs -f frontend` |
| **Logs (Database)** | `sudo docker compose logs -f db` |

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue 1: Port 9000 Already in Use
```bash
# Find process using port 9000
sudo lsof -i :9000

# Kill the process
sudo kill -9 <PID>

# Then restart Docker
sudo docker compose down
sudo docker compose up -d
```

### Issue 2: Database Won't Connect
```bash
# Restart just the database
sudo docker compose restart db

# Or rebuild everything
sudo docker compose down -v
sudo docker compose up -d --build
```

### Issue 3: Container Keeps Restarting
```bash
# Check logs
sudo docker compose logs backend

# Rebuild and clear cache
sudo docker compose down -v
sudo docker compose up -d --build
```

### Issue 4: Permission Denied Error
```bash
# Make sure you use 'sudo'
sudo docker compose up -d

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## 💾 DATA BACKUP

### Backup Database
```bash
sudo docker compose exec db pg_dump -U daraz_user -d daraz_db > backup.sql
```

### Restore Database
```bash
sudo docker compose exec -T db psql -U daraz_user -d daraz_db < backup.sql
```

---

## 🧹 CLEANUP

### Remove Unused Images
```bash
sudo docker image prune -a
```

### Remove Unused Containers
```bash
sudo docker container prune
```

### Remove All Volumes
```bash
sudo docker volume prune
```

### Clean Everything (Careful!)
```bash
sudo docker system prune -a -v
```

---

## 🎯 TYPICAL WORKFLOW

```bash
# 1. Start the project
sudo docker compose up -d

# 2. Check status
sudo docker compose ps

# 3. View logs
sudo docker compose logs -f

# 4. Make code changes in your editor

# 5. Rebuild after code changes
sudo docker compose up -d --build

# 6. When done, stop everything
sudo docker compose down
```

---

## ✨ PRO TIPS

1. **Alias for easier commands** (Add to `~/.bashrc`):
   ```bash
   alias dc='sudo docker compose'
   alias dcup='sudo docker compose up -d'
   alias dcdown='sudo docker compose down'
   alias dclogs='sudo docker compose logs -f'
   ```
   Then use: `dcup`, `dcdown`, `dclogs`

2. **Monitor in separate terminal**:
   - Terminal 1: `sudo docker compose logs -f`
   - Terminal 2: Make code changes and rebuild
   - Terminal 3: Test your API

3. **Development Workflow**:
   ```bash
   # Terminal 1: Watch logs
   sudo docker compose logs -f backend

   # Terminal 2: Edit code
   nano backend/controllers/productController.js

   # Terminal 3: Rebuild
   sudo docker compose up -d --build
   ```

---

Generated: March 20, 2026
