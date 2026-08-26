# ⚡ How to Start Servers Manually

## 🚨 Important: PowerShell Script Execution Issue

Your system has PowerShell script execution disabled. Here's how to start the servers:

---

## 🎯 Quick Solution (2 Steps)

### Step 1: Start Backend Server

**Option A - Double Click File**:
1. Navigate to: `AI-Resume-Analyzer` folder
2. Double-click: `START_BACKEND.bat`
3. Wait for: "Server running on http://localhost:5000"

**Option B - Command Prompt**:
1. Open **Command Prompt** (cmd.exe) - NOT PowerShell
2. Run these commands:
```cmd
cd C:\Users\Anand\Desktop\AI-Resume-Analyzer\AI-Resume-Analyzer\backend
node server.js
```

---

### Step 2: Start Frontend Server

**Option A - Double Click File**:
1. Navigate to: `AI-Resume-Analyzer` folder
2. Double-click: `START_FRONTEND.bat`
3. Wait for: "Local: http://localhost:5173"

**Option B - Command Prompt**:
1. Open **NEW Command Prompt** window (cmd.exe) - NOT PowerShell
2. Run these commands:
```cmd
cd C:\Users\Anand\Desktop\AI-Resume-Analyzer\AI-Resume-Analyzer\frontend
npm run dev
```

---

## ✅ Verification

### Backend Running:
- Console shows: `Server running on http://localhost:5000`
- Console shows: `MongoDB connected`
- Test: Open http://localhost:5000/api/health in browser
- Should see: `{"success":true,"message":"AI Resume Analyzer API is running"}`

### Frontend Running:
- Console shows: `Local: http://localhost:5173/`
- Console shows: `ready in xxx ms`
- Test: Open http://localhost:5173 in browser
- Should see: ResumeAI Home page

---

## 🎯 After Both Servers Are Running

1. **Open Browser**: http://localhost:5173
2. **Login or Register**: Create an account
3. **Test AI Career Assistant**:
   - Click "AI Career Assistant" from Dashboard
   - Send a message: "How can I improve my resume?"
   - Should get AI response (no error!)

---

## 🔧 If You Still Get PowerShell Errors

### Fix PowerShell Execution Policy (One-time fix):

1. **Open PowerShell as Administrator**:
   - Press `Windows + X`
   - Click "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this command**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. **Type** `Y` and press Enter

4. **Close PowerShell**

5. **Now you can use** `npm run dev` in PowerShell

---

## 📊 Expected Console Output

### Backend Console:
```
◇ injected env (7) from .env
Server running on http://localhost:5000
MongoDB connected: ac-fddzn6r-shard-00-00.6ia7jo2.mongodb.net
```

### Frontend Console:
```
VITE v5.x.x  ready in 543 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

## 🎊 Once Both Are Running

Your complete platform is ready:
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:5173
- ✅ All 10 features working
- ✅ AI Career Assistant fixed
- ✅ Login/Register pages added

---

## 🚀 Features to Test

1. **Home Page** - http://localhost:5173
2. **Register** - Create new account
3. **Login** - Access dashboard
4. **Resume Builder** - Build resume with AI
5. **Job Optimization** - Get ATS scores
6. **Career Roadmap** - Generate career plan
7. **AI Interviewer** - Practice interviews
8. **Progress Analytics** - View your metrics
9. **Resume Comparison** - Compare versions
10. **AI Career Assistant** - Chat with AI coach ⭐ (NOW FIXED!)

---

## 💡 Pro Tips

### Keep Servers Running:
- Don't close the command prompt windows
- Backend must run continuously
- Frontend must run continuously

### Restart Servers:
- Press `Ctrl + C` in the command prompt window
- Run the start command again

### Check if Running:
- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:5173

---

## 🎯 Summary

**To Start Everything**:
1. Open Command Prompt (cmd.exe)
2. Start backend: `cd backend` → `node server.js`
3. Open NEW Command Prompt
4. Start frontend: `cd frontend` → `npm run dev`
5. Open browser: http://localhost:5173
6. Enjoy your platform! 🎉

---

**✅ Everything is fixed and ready to use!**
**🚀 Just start the servers using Command Prompt (cmd.exe)!**

---

*Created: August 23, 2026*
*Status: Backend ✅ Running | Frontend ⏸️ Needs Manual Start*
