# 🚀 ResumeAI - Production Deployment Guide

Complete guide to deploy your ResumeAI platform to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
4. [Backend Deployment](#backend-deployment)
   - [Heroku](#option-1-heroku)
   - [AWS EC2](#option-2-aws-ec2)
   - [DigitalOcean](#option-3-digitalocean)
5. [Frontend Deployment](#frontend-deployment)
   - [Vercel](#option-1-vercel-recommended)
   - [Netlify](#option-2-netlify)
6. [Domain & SSL](#domain--ssl)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database connection tested
- [ ] Groq API key obtained
- [ ] JWT secret generated (strong, random)
- [ ] CORS configured for production URLs
- [ ] File upload limits set appropriately
- [ ] Rate limiting configured
- [ ] Security headers enabled (Helmet.js)
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Git repository clean and pushed

---

## 🔧 Environment Setup

### Required Services

1. **Groq API Key** (Free)
   - Visit: https://groq.com
   - Sign up and get API key
   - Free tier: 30 requests/minute

2. **MongoDB Atlas** (Free)
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create free cluster (512MB)
   - Get connection string

3. **Backend Hosting** (Choose one)
   - Heroku (free tier available)
   - AWS EC2 (pay as you go)
   - DigitalOcean ($5/month)

4. **Frontend Hosting** (Choose one)
   - Vercel (free for hobby projects)
   - Netlify (free tier available)

---

## 💾 Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click **"Build a Database"**
4. Select **"FREE"** shared cluster (M0)
5. Choose cloud provider and region (closest to your users)
6. Click **"Create Cluster"**

### Step 2: Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or restrict to your server IP for security
4. Click **"Confirm"**

### Step 3: Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username and strong password
5. Set role to **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your credentials
5. Add database name: `/resume-analyzer` before the `?`
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/resume-analyzer?retryWrites=true&w=majority
   ```

---

## 🖥️ Backend Deployment

### Option 1: Heroku

#### Prerequisites
- Heroku account (https://heroku.com)
- Heroku CLI installed

#### Step 1: Prepare Backend

```bash
cd backend

# Create Procfile
echo "web: node server.js" > Procfile

# Ensure package.json has start script
# "scripts": {
#   "start": "node server.js"
# }
```

#### Step 2: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create resumeai-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
heroku config:set JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
heroku config:set GROQ_API_KEY="your-groq-api-key"
heroku config:set FRONTEND_URL="https://your-frontend-domain.vercel.app"
heroku config:set PORT=5000

# Deploy
git init
git add .
git commit -m "Deploy to Heroku"
heroku git:remote -a resumeai-backend
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail
```

#### Step 3: Configure Custom Domain (Optional)

```bash
heroku domains:add api.yourdomain.com
# Follow instructions to add DNS CNAME record
```

---

### Option 2: AWS EC2

#### Step 1: Launch EC2 Instance

1. Login to AWS Console
2. Go to EC2 Dashboard
3. Click **"Launch Instance"**
4. Choose **Ubuntu Server 22.04 LTS**
5. Select **t2.micro** (free tier eligible)
6. Configure security group:
   - SSH (port 22) - Your IP only
   - HTTP (port 80) - Anywhere
   - HTTPS (port 443) - Anywhere
   - Custom TCP (port 5000) - Anywhere (or specific IPs)
7. Create/select key pair
8. Launch instance

#### Step 2: Connect and Setup

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install nginx -y
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd AI-Resume-Analyzer/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add all environment variables
# PORT=5000
# MONGODB_URI=...
# JWT_SECRET=...
# GROQ_API_KEY=...
# FRONTEND_URL=...

# Create uploads directory
mkdir -p uploads

# Start with PM2
pm2 start server.js --name resumeai-backend
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs resumeai-backend
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/resumeai

# Add this configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/resumeai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

### Option 3: DigitalOcean

Similar to AWS EC2, but with simpler interface:

1. Create Droplet (Ubuntu 22.04)
2. Choose $5/month plan
3. Add SSH key
4. Follow same setup as AWS EC2 (Steps 2-5)

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

#### Prerequisites
- Vercel account (https://vercel.com)
- Vercel CLI installed (optional)

#### Method A: Git Integration (Easiest)

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **"Add New Project"**
4. Import your Git repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables:
   - `VITE_API_URL` = `https://your-backend-url.herokuapp.com/api`
7. Click **"Deploy"**

#### Method B: Vercel CLI

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set root to ./frontend
# - Build: npm run build
# - Output: dist

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.herokuapp.com/api

# Deploy to production
vercel --prod
```

#### Custom Domain

1. Go to project settings in Vercel
2. Click **"Domains"**
3. Add your domain
4. Update DNS records as instructed

---

### Option 2: Netlify

#### Method A: Git Integration

1. Push code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect to Git provider
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Add environment variables:
   - `VITE_API_URL` = `https://your-backend-url.herokuapp.com/api`
7. Click **"Deploy site"**

#### Method B: Netlify CLI

```bash
cd frontend

# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod

# Set environment variable
netlify env:set VITE_API_URL "https://your-backend-url.herokuapp.com/api"
```

---

## 🌍 Domain & SSL

### Purchase Domain

1. Buy domain from:
   - Namecheap
   - GoDaddy
   - Google Domains
   - Cloudflare

### Configure DNS

#### For Backend (api.yourdomain.com)

**Heroku:**
- Add CNAME record: `api` → `your-app.herokuapp.com`

**AWS/DigitalOcean:**
- Add A record: `api` → `your-server-ip`

#### For Frontend

**Vercel/Netlify:**
- Follow their DNS instructions
- Usually CNAME or A record
- SSL automatically provisioned

---

## 📊 Monitoring & Maintenance

### Backend Monitoring

#### Heroku
```bash
# View logs
heroku logs --tail -a resumeai-backend

# Check dyno status
heroku ps -a resumeai-backend

# Restart
heroku restart -a resumeai-backend
```

#### AWS/DigitalOcean
```bash
# SSH into server
ssh -i key.pem ubuntu@server-ip

# Check PM2 status
pm2 status
pm2 logs resumeai-backend

# Restart
pm2 restart resumeai-backend

# Monitor resources
pm2 monit
```

### Database Monitoring

1. MongoDB Atlas Dashboard
2. Check:
   - Storage usage
   - Connection count
   - Query performance
3. Set up alerts for:
   - High CPU usage
   - Storage limits
   - Connection limits

### Application Monitoring

Consider adding:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **New Relic** - Performance monitoring
- **UptimeRobot** - Uptime monitoring (free)

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "resumeai-backend"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./frontend
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**
```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

#### 2. MongoDB Connection Failed

**Problem:** Can't connect to MongoDB Atlas

**Solutions:**
- Check IP whitelist in Atlas (allow 0.0.0.0/0)
- Verify connection string format
- Ensure password doesn't have special characters (URL encode if needed)
- Check network access settings

#### 3. File Upload Errors

**Problem:** Resume uploads failing

**Solutions:**
- Check `uploads` directory exists and has write permissions
- Verify `MAX_FILE_SIZE` in environment
- For Heroku: Use cloud storage (AWS S3, Cloudinary) instead of filesystem

#### 4. Environment Variables Not Loading

**Problem:** Process.env variables undefined

**Solutions:**
- Heroku: `heroku config:set VAR_NAME=value`
- Vercel: Set in project settings → Environment Variables
- Netlify: Set in site settings → Environment variables
- EC2: Check `.env` file exists and has correct values

#### 5. Build Failures

**Problem:** Deployment build fails

**Solutions:**
- Check Node.js version compatibility
- Run `npm install` locally and test build
- Check for missing dependencies
- Review build logs for specific errors

---

## 📝 Post-Deployment Checklist

- [ ] Backend URL accessible
- [ ] Frontend URL accessible
- [ ] User registration works
- [ ] User login works
- [ ] Resume upload works
- [ ] Resume builder works
- [ ] Job optimization works
- [ ] Career roadmap generates
- [ ] AI interviewer works
- [ ] All API endpoints responding
- [ ] Database connections stable
- [ ] File uploads working
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Documentation updated with production URLs

---

## 🎉 Success!

Your ResumeAI platform is now live in production!

### Next Steps

1. Test all features thoroughly
2. Invite beta users
3. Collect feedback
4. Monitor performance
5. Plan feature updates

---

## 📞 Support Resources

- **Heroku Docs**: https://devcenter.heroku.com
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **AWS EC2 Docs**: https://docs.aws.amazon.com/ec2
- **Nginx Docs**: https://nginx.org/en/docs

---

**🚀 Happy Deploying!**

*Last Updated: August 23, 2026*
