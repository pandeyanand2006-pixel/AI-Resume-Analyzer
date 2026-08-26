import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import { Button } from "../../components/ui";
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <main>
        <section className="hero">
          <div className="hero-inner">

            <div className="hero-badge">
              <span className="hero-badge__icon">✨</span>
              <span>AI-POWERED CAREER PLATFORM</span>
            </div>

            <h1 className="hero-title">
              Build Your Career.
              <br />
              <span className="hero-title__gradient">Master Your Future.</span>
            </h1>

            <p className="hero-sub">
              Complete AI-powered career development platform. Build resumes, optimize for jobs, 
              plan your career roadmap, practice interviews, and track your progress—all in one place.
            </p>

            <div className="cta-row">
              <Link to="/register" className="home-link">
                <Button variant="primary" size="lg">
                  Get Started Free →
                </Button>
              </Link>

              <Link to="/dashboard" className="home-link">
                <Button variant="outline" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            </div>

          </div>
        </section>

        <section id="features" className="features-section" style={{scrollMarginTop:'80px'}}>
          <div className="features-header">
            <div className="features-header__badge">FEATURES</div>
            <h2>Complete Career Development Platform</h2>
            <p>Everything you need to accelerate your career growth</p>
          </div>

          <div className="features-grid">

            <Feature
              icon="📄"
              title="AI Resume Builder"
              description="Build professional resumes with AI-powered content generation. Get smart suggestions for summaries, project descriptions, and more."
              link="/resume-builder"
            />

            <Feature
              icon="🎯"
              title="Job Optimization"
              description="Optimize your resume for specific job postings. Get ATS scores, matched/missing skills, and keyword recommendations."
              link="/job-optimization"
            />

            <Feature
              icon="🗺️"
              title="Career Roadmap"
              description="Get personalized career development plans. Identify skill gaps, learning paths, projects, and certifications for your target role."
              link="/career-roadmap"
            />

            <Feature
              icon="💬"
              title="AI Interviewer"
              description="Practice interviews with AI across all industries. Get real-time feedback, performance scores, and improvement suggestions."
              link="/ai-interviewer"
            />

            <Feature
              icon="📊"
              title="Resume Analysis"
              description="Deep analysis of your resume structure, keywords, skills, and ATS compatibility with actionable improvement recommendations."
              link="/dashboard"
            />

            <Feature
              icon="🎓"
              title="Skill Gap Analysis"
              description="Compare your current skills with target role requirements. Understand what to learn and how to bridge the gap."
              link="/dashboard"
            />

            <Feature
              icon="💼"
              title="Job Matching"
              description="See how well your resume matches job descriptions. Discover compatibility scores and areas for improvement."
              link="/dashboard"
            />

            <Feature
              icon="🔄"
              title="Resume Comparison"
              description="Compare two versions of your resume side-by-side. Track changes, improvements, and see your progress over time."
              link="/resume-comparison"
            />

            <Feature
              icon="💬"
              title="AI Career Chat"
              description="Chat with your personal AI career coach. Get instant answers to career questions and personalized guidance."
              link="/career-assistant"
            />

            <Feature
              icon="📊"
              title="Progress Analytics"
              description="Track your career development progress. View interview history, roadmap completion, and skill growth metrics."
              link="/progress-analytics"
            />

            <Feature
              icon="🌟"
              title="Multi-Industry Support"
              description="Works for ALL professional fields: Tech, Finance, Healthcare, Marketing, Education, Engineering, and more."
              link="#"
            />

            <Feature
              icon="🔒"
              title="Secure & Private"
              description="Your data is protected with enterprise-grade security. Only you can access your resumes and career information."
              link="#"
            />

          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="how-it-works-section" style={{scrollMarginTop:'80px'}}>
          <div className="how-it-works-header">
            <div className="how-it-works-header__badge">HOW IT WORKS</div>
            <h2>Simple steps to accelerate your career</h2>
            <p>Get started in minutes, see results in days</p>
          </div>

          <div className="how-it-works-grid">
              <Step
                number="1"
                title="Build Your Resume"
                description="Use our AI-powered builder to create a professional resume"
              />
              <Step
                number="2"
                title="Optimize & Analyze"
                description="Get ATS scores and optimize for specific job postings"
              />
              <Step
                number="3"
                title="Plan Your Career"
                description="Generate personalized roadmaps and identify skill gaps"
              />
              <Step
                number="4"
                title="Practice & Improve"
                description="Practice interviews and track your progress"
              />
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-section__inner">
            <h2>Ready to Accelerate Your Career?</h2>
            <p>
              Join thousands of professionals using AI to build better resumes and advance their careers
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="home-link">
                <Button variant="primary" size="lg">
                  Get Started Free →
                </Button>
              </Link>
              <Link to="/login" className="home-link">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Feature Component */
function Feature({ icon, title, description, link }) {
  const content = (
    <div className="feature-card">
      {icon && <div className="feature-icon">{icon}</div>}
      
      <h3 className="feature-title">{title}</h3>

      <p className="feature-description">{description}</p>

      {link && link !== "#" && (
        <span className="feature-link">
          Learn more →
        </span>
      )}
    </div>
  );

  if (link && link !== "#") {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

/* Step Component */
function Step({ number, title, description }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <h3 className="step-title">{title}</h3>
      <p className="step-description">{description}</p>
    </div>
  );
}

export default Home;