import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <main>
        <section className="hero hero--purple">
          <div className="hero-inner">

            <div className="hero-badge">AI-POWERED CAREER PLATFORM</div>

            <h1 className="hero-title">Analyze your resume.
              <br />
              Match with better jobs.</h1>

            <p className="hero-sub">
              Upload your resume, understand your strengths and skill gaps, analyze ATS compatibility, and get personalized career recommendations powered by AI.
            </p>

            <div className="cta-row" style={{justifyContent:'center'}}>
              <Link to="/dashboard" className="btn btn-primary interactive">Analyze My Resume</Link>

              <a href="#features" className="btn btn-ghost interactive">Explore Features</a>
            </div>

          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">

            <Feature
              title="Resume Analysis"
              description="Extract important resume information and identify strengths, weaknesses and key skills."
            />

            <Feature
              title="ATS Score"
              description="Evaluate your resume using transparent ATS-style scoring based on structure and relevant keywords."
            />

            <Feature
              title="Job Matching"
              description="Compare your resume against a job description and discover matched and missing skills."
            />

          </div>
        </section>
      </main>
    </div>
  );
}

/* Feature Component */
function Feature({ title, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      
      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>

    </div>
  );
}

export default Home;