# 🚀 ResumeAI - Complete AI-Powered Career Development Platform

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

> **Complete AI-powered career development platform supporting ALL professional industries. Build resumes, optimize for jobs, plan career roadmaps, practice interviews, and track progress - all in one place.**

---

## 🌟 Key Features

### ✅ **Phase 1: AI Resume Builder** (100% Complete)
- 📄 **Smart Resume Creation** - Multi-step form with professional templates
- 🤖 **AI Content Generation** - Generate professional summaries and project descriptions
- 🎓 **Multiple Education Entries** - Support for 10th, 12th, B.Tech, Master's, PhD, etc.
- 💼 **Complete Career Information** - Skills, experience, projects, certifications, achievements
- 📋 **Live Preview & PDF Export** - See your resume in real-time and export as PDF
- 💾 **Save & Edit** - Save your resumes and edit them anytime

### ✅ **Phase 2: Job-Specific Resume Optimization** (100% Complete)
- 🎯 **ATS Score Analysis** - Get precise ATS compatibility score (0-100)
- ✨ **Matched Skills Detection** - See which skills align with the job
- 🔍 **Missing Skills Identification** - Discover skills you need to add
- 📌 **Keyword Recommendations** - Get ATS-friendly keywords
- 💡 **AI-Optimized Summary** - Generate job-specific resume summaries
- 📊 **Improvement Suggestions** - Actionable tips to improve your resume

### ✅ **Phase 3: AI Career Roadmap** (100% Complete)
- 🗺️ **Personalized Roadmap Generation** - AI-generated career development plans
- 🌍 **Multi-Industry Support** - Works for ALL professions (Tech, Finance, Healthcare, Marketing, etc.)
- 📈 **Skill Gap Analysis** - Identify missing skills with importance levels
- 📚 **Learning Stages** - Step-by-step learning path with resources
- 🛠️ **Project Recommendations** - Real-world projects to build your portfolio
- 🏆 **Certification Suggestions** - Relevant certifications with priorities
- 💬 **Interview Preparation** - Topics and questions for interview prep
- 📅 **Timeline Visualization** - Visual timeline of your career journey

### ✅ **Phase 4: AI Interviewer** (100% Complete)
- 🎭 **Multiple Interview Types**:
  - HR Interview
  - Technical Interview
  - Behavioral Interview
  - Role-specific Interview
  - Mixed Interview
- 🎚️ **Difficulty Levels** - Easy, Medium, Hard
- 🔢 **Configurable Questions** - Choose 1-20 questions per session
- ⚡ **Real-time Evaluation** - Instant AI feedback on each answer
- 📊 **Detailed Performance Report**:
  - Overall score (0-100)
  - Performance breakdown (5 categories)
  - Strengths and weaknesses
  - Recommended study topics
  - Improvement suggestions
- 🌐 **Universal Industry Support** - Questions for any professional field

### ✅ **Phase 5: Career Dashboard** (Backend 100%)
- 📊 **Comprehensive Metrics Dashboard**
- 📈 **Progress Tracking** - Resume score, roadmap progress, interview performance
- 📋 **Recent Activity Feed** - Track all your career development activities
- 🎯 **Personalized Recommendations** - AI-driven career action items
- 🎨 **Clean Modern UI** - Beautiful, responsive design

### ✅ **Phase 9: Progress Analytics** (100% Complete)
- 📊 **Visual Progress Tracking** - Charts and graphs of your career growth
- 📈 **Historical Performance** - Track improvements over time
- 🎯 **Goal Monitoring** - See how close you are to your career goals
- 💼 **Interview History** - Review all past interview performances
- 🗺️ **Roadmap Progress** - Monitor completion of career roadmaps

### ✅ **Phase 10: Notification System** (Backend 100%)
- 🔔 **Smart Notifications**
- 📬 **Multiple Types** - Resume updates, roadmap milestones, interview reminders, skill recommendations
- ⚡ **Priority Levels** - Low, medium, high priority notifications
- ✅ **Read/Unread Tracking** - Keep track of what you've seen
- 🔢 **Unread Count** - Always know what needs attention

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Groq API (llama-3.3-70b-versatile)
- **File Processing**: Multer, PDF-Parse
- **Security**: Helmet, Express Rate Limit, CORS, bcrypt
- **Validation**: Express Validator

### Frontend
- **Framework**: React 18.2 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS (utility-first)
- **API Client**: Axios
- **State Management**: React Context API
- **PDF Export**: jsPDF
- **Icons**: Lucide React

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv
- **Testing**: Jest, Supertest
- **CI/CD**: GitHub Actions

---

## 📁 Project Structure

```
AI-Resume-Analyzer/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── resumeController.js      # Resume analysis
│   │   ├── resumeBuilderController.js  # Resume creation
│   │   ├── jobOptimizationController.js  # Job optimization
│   │   ├── careerRoadmapController.js    # Career planning
│   │   ├── interviewController.js   # AI interviews
│   │   ├── careerDashboardController.js  # Dashboard data
│   │   └── notificationController.js     # Notifications
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT authentication
│   │   └── uploadMiddleware.js      # File uploads
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Resume.js                # Resume analysis schema
│   │   ├── GeneratedResume.js       # Built resume schema
│   │   ├── Job.js                   # Job listings schema
│   │   ├── CareerRoadmap.js         # Roadmap schema
│   │   ├── InterviewSession.js      # Interview schema
│   │   └── Notification.js          # Notification schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── resumeBuilderRoutes.js
│   │   ├── jobOptimizationRoutes.js
│   │   ├── careerRoadmapRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── jobMatchingRoutes.js
│   │   ├── skillGapRoutes.js
│   │   ├── careerDashboardRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   ├── groqService.js           # AI integration
│   │   ├── resumeParser.js          # PDF parsing
│   │   ├── careerRoadmapService.js  # Roadmap AI
│   │   └── interviewService.js      # Interview AI
│   ├── uploads/                     # Uploaded files
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Env template
│   ├── package.json
│   └── server.js                    # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Header.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   │   └── Home.jsx         # Landing page
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Dashboard.css
│   │   │   ├── ResumeBuilder/
│   │   │   │   ├── ResumeBuilder.jsx
│   │   │   │   └── ResumeBuilder.css
│   │   │   ├── ResumePreview/
│   │   │   │   └── ResumePreview.jsx
│   │   │   ├── JobOptimization/
│   │   │   │   ├── JobOptimization.jsx
│   │   │   │   └── JobOptimization.css
│   │   │   ├── CareerRoadmap/
│   │   │   │   ├── CareerRoadmap.jsx
│   │   │   │   └── CareerRoadmap.css
│   │   │   ├── AIInterviewer/
│   │   │   │   ├── AIInterviewer.jsx
│   │   │   │   └── AIInterviewer.css
│   │   │   └── ProgressAnalytics/
│   │   │       └── ProgressAnalytics.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios config
│   │   ├── App.jsx                  # Routes
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── security-audit-summary.md
│   └── mongodb-security.md
│
├── .gitignore
├── README.md                        # This file
├── DEPLOYMENT_GUIDE.md              # Deployment instructions
├── PROJECT_STATUS.md                # Detailed status
└── FINAL_COMPLETION_REPORT.md       # Completion summary
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Groq API key (free at https://groq.com)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AI-Resume-Analyzer
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your credentials:
# - MONGODB_URI or MONGO_URI
# - GROQ_API_KEY
# - JWT_SECRET
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
```

5. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

6. **Open in Browser**
```
http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database (use either one)
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
# OR
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/resume-analyzer

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# AI Service
GROQ_API_KEY=your-groq-api-key-here

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Resume Endpoints
- `POST /resumes/upload` - Upload and analyze resume
- `GET /resumes` - Get all user resumes
- `GET /resumes/latest` - Get latest resume
- `GET /resumes/:id` - Get specific resume
- `DELETE /resumes/:id` - Delete resume

### Resume Builder Endpoints
- `POST /resume-builder` - Create new resume
- `GET /resume-builder` - Get all built resumes
- `GET /resume-builder/:id` - Get specific resume
- `PUT /resume-builder/:id` - Update resume
- `DELETE /resume-builder/:id` - Delete resume
- `POST /resume-builder/generate-summary` - Generate AI summary
- `POST /resume-builder/enhance-project` - Enhance project description

### Job Optimization Endpoints
- `POST /job-optimization/analyze` - Analyze resume for specific job
- `POST /job-optimization/generate-summary` - Generate optimized summary

### Career Roadmap Endpoints
- `POST /career-roadmap` - Generate career roadmap
- `GET /career-roadmap` - Get all roadmaps
- `GET /career-roadmap/:id` - Get specific roadmap
- `PUT /career-roadmap/:id` - Update roadmap
- `DELETE /career-roadmap/:id` - Delete roadmap

### Interview Endpoints
- `POST /interviews` - Create interview session
- `GET /interviews` - Get all interviews
- `GET /interviews/:id` - Get specific interview
- `POST /interviews/:id/start` - Start interview
- `POST /interviews/:id/answer` - Submit answer
- `POST /interviews/:id/complete` - Complete interview
- `DELETE /interviews/:id` - Delete interview

### Career Dashboard Endpoints
- `GET /career-dashboard` - Get comprehensive dashboard data

### Notification Endpoints
- `POST /notifications` - Create notification
- `GET /notifications` - Get all notifications
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

---

## 🎯 Usage Guide

### 1. Create Your Resume
1. Navigate to **Resume Builder**
2. Fill in your information:
   - Personal details
   - Target role and industry
   - Education (multiple entries supported)
   - Work experience
   - Skills, projects, certifications
   - Achievements
3. Use **AI Generate** buttons for:
   - Professional summary
   - Project descriptions
4. Preview and export as PDF

### 2. Optimize for Jobs
1. Go to **Job Optimization**
2. Paste a job description
3. Get instant analysis:
   - ATS score
   - Matched skills
   - Missing skills
   - Keywords to add
   - AI-optimized summary

### 3. Plan Your Career
1. Visit **Career Roadmap**
2. Enter your target role and industry
3. Add current skills
4. Get comprehensive roadmap:
   - Skill gaps to fill
   - Learning stages with resources
   - Project recommendations
   - Certifications to pursue
   - Interview preparation topics
   - Timeline visualization

### 4. Practice Interviews
1. Navigate to **AI Interviewer**
2. Configure your interview:
   - Target role
   - Interview type (HR, Technical, Behavioral, etc.)
   - Difficulty level
   - Number of questions
3. Answer questions and get:
   - Real-time feedback
   - Scores and suggestions
   - Overall performance report

### 5. Track Progress
1. Check **Progress Analytics**
2. View your metrics:
   - Resume score trends
   - Roadmap completion
   - Interview performance history
   - Skill development progress

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes and API endpoints
- ✅ CORS configuration
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation and sanitization
- ✅ Helmet.js security headers
- ✅ File upload restrictions
- ✅ MongoDB injection prevention
- ✅ XSS protection

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Frontend tests (if configured)
cd frontend
npm test
```

---

## 📈 Performance

- Fast resume analysis (< 2 seconds)
- AI response time (2-5 seconds)
- Real-time interview feedback
- Optimized database queries
- Lazy loading for large datasets
- Responsive UI with loading states

---

## 🌍 Multi-Industry Support

Works perfectly for ALL professional fields:
- 💻 Technology & Software
- 💰 Finance & Banking
- 🏥 Healthcare & Medical
- 📊 Marketing & Sales
- 🎓 Education & Training
- ⚙️ Engineering & Manufacturing
- 🎨 Design & Creative
- 📱 Digital Media
- 🏗️ Construction & Architecture
- And many more...

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Groq AI** - For powerful AI capabilities
- **MongoDB** - For flexible database
- **React** - For beautiful UI
- **Tailwind CSS** - For rapid styling

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review `DEPLOYMENT_GUIDE.md` for deployment help

---

## 🎉 What's Next?

Optional future enhancements:
- Resume version comparison
- AI career chat assistant
- Job search integration with external APIs
- LinkedIn profile integration
- Cover letter generator
- Multiple resume templates
- Team collaboration features
- Mobile app

---

**Built with ❤️ for career success worldwide! 🌍**

---

## Quick Links

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Project Status](./PROJECT_STATUS.md)
- [Completion Report](./FINAL_COMPLETION_REPORT.md)
- [Security Documentation](./backend/docs/)

---

*Last Updated: August 23, 2026*
