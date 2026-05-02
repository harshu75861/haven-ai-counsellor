import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Mic,
  PenLine,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound
} from "lucide-react";
import { api } from "./lib/api";
import "./styles.css";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  education: "",
  location: "",
  interests: "",
  skills: "",
  goals: "",
  targetCountry: "Canada",
  budget: "",
  experience: ""
};

function App() {
  const [profile, setProfile] = useState(emptyProfile);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to Haven. Share your education, interests, skills, and ambitions, and I will build a clear career plan with study, job, resume, and interview guidance."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [resumeRole, setResumeRole] = useState("AI Product Manager");
  const [resume, setResume] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    api.admin().then(setAdmin).catch(() => {});
  }, []);

  const completion = useMemo(() => {
    const keys = ["name", "email", "phone", "education", "interests", "skills", "goals"];
    return Math.round((keys.filter((key) => profile[key]?.trim()).length / keys.length) * 100);
  }, [profile]);

  async function submitOnboarding(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = normalizeProfile(profile);
      const created = await api.createProfile(payload);
      setUser(created.user);
      setInsights(created.insights);
      setMessages((current) => [
        ...current,
        { role: "user", content: `I am ${payload.name}. ${payload.goals}` },
        { role: "assistant", content: created.insights.summary }
      ]);
      setActiveTab("dashboard");
      api.admin().then(setAdmin).catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input.trim() };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await api.chat({
        userId: user?.id,
        profile: normalizeProfile(profile),
        messages: [...messages, userMessage]
      });
      setMessages((current) => [...current, response.message]);
      if (response.insights) setInsights(response.insights);
    } finally {
      setLoading(false);
    }
  }

  async function buildResume() {
    setLoading(true);
    try {
      setResume(await api.resume({ userId: user?.id, profile: normalizeProfile(profile), role: resumeRole }));
    } finally {
      setLoading(false);
    }
  }

  async function reviewAnswer() {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      setFeedback(await api.interview({ userId: user?.id, profile: normalizeProfile(profile), answer }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-ivory">
      <div className="ambient" />
      <Header />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-10 pt-4 lg:grid-cols-[390px_1fr]">
        <aside className="panel sticky top-4 h-fit p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-champagne">Client Intake</p>
              <h1 className="mt-2 font-display text-3xl text-white">Haven AI Counsellor</h1>
            </div>
            <div className="progress-ring" style={{ "--value": `${completion}%` }}>
              <span>{completion}%</span>
            </div>
          </div>
          <OnboardingForm
            profile={profile}
            setProfile={setProfile}
            onSubmit={submitOnboarding}
            loading={loading}
          />
        </aside>

        <section className="space-y-5">
          <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "dashboard" && <Dashboard insights={insights} admin={admin} />}
          {activeTab === "chat" && (
            <Chat messages={messages} input={input} setInput={setInput} sendMessage={sendMessage} loading={loading} />
          )}
          {activeTab === "jobs" && <Jobs insights={insights} />}
          {activeTab === "resume" && (
            <ResumeBuilder
              resumeRole={resumeRole}
              setResumeRole={setResumeRole}
              buildResume={buildResume}
              resume={resume}
              loading={loading}
            />
          )}
          {activeTab === "interview" && (
            <InterviewPrep answer={answer} setAnswer={setAnswer} reviewAnswer={reviewAnswer} feedback={feedback} loading={loading} />
          )}
          {activeTab === "admin" && <Admin admin={admin} />}
        </section>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="brand-mark"><Sparkles size={18} /></div>
        <div>
          <p className="text-sm font-semibold text-white">Haven Consultancy Suite</p>
          <p className="text-xs text-smoke">AI guidance, lead capture, and counsellor operations</p>
        </div>
      </div>
      <a className="gold-button hidden sm:flex" href="https://wa.me/" target="_blank" rel="noreferrer">
        <Phone size={16} />
        WhatsApp Ready
      </a>
    </header>
  );
}

function OnboardingForm({ profile, setProfile, onSubmit, loading }) {
  const fields = [
    ["name", "Full name", "Aarav Mehta"],
    ["email", "Email", "aarav@example.com"],
    ["phone", "Phone", "+91 98765 43210"],
    ["education", "Education", "B.Com final year, finance minor"],
    ["location", "Current location", "Mumbai, India"],
    ["interests", "Interests", "finance, analytics, consulting, technology"],
    ["skills", "Skills", "Excel, communication, basic Python, research"],
    ["goals", "Career goals", "Study abroad and move into strategy or product roles"],
    ["budget", "Study budget", "INR 25-35 lakh"],
    ["experience", "Experience", "Internship at a fintech startup"]
  ];

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      {fields.map(([key, label, placeholder]) => (
        <label className="block" key={key}>
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-smoke">{label}</span>
          <input
            className="field"
            value={profile[key]}
            placeholder={placeholder}
            onChange={(event) => setProfile((current) => ({ ...current, [key]: event.target.value }))}
          />
        </label>
      ))}
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-smoke">Target country</span>
        <select
          className="field"
          value={profile.targetCountry}
          onChange={(event) => setProfile((current) => ({ ...current, targetCountry: event.target.value }))}
        >
          {["Canada", "United Kingdom", "Australia", "Germany", "United States", "Singapore"].map((country) => (
            <option key={country}>{country}</option>
          ))}
        </select>
      </label>
      <button className="gold-button w-full justify-center" disabled={loading}>
        <ShieldCheck size={17} />
        {loading ? "Preparing plan..." : "Generate Counselling Plan"}
      </button>
    </form>
  );
}

function Nav({ activeTab, setActiveTab }) {
  const tabs = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["chat", MessageSquareText, "AI Chat"],
    ["jobs", BriefcaseBusiness, "Jobs"],
    ["resume", PenLine, "Resume"],
    ["interview", Mic, "Interview"],
    ["admin", UsersRound, "Admin"]
  ];
  return (
    <nav className="panel flex gap-2 overflow-x-auto p-2">
      {tabs.map(([id, Icon, label]) => (
        <button className={`tab ${activeTab === id ? "active" : ""}`} key={id} onClick={() => setActiveTab(id)}>
          <Icon size={16} />
          {label}
        </button>
      ))}
    </nav>
  );
}

function Dashboard({ insights, admin }) {
  const data = insights ?? fallbackInsights();
  return (
    <div className="space-y-5">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Private AI Counselling Desk</p>
          <h2>Convert a first enquiry into a complete career roadmap.</h2>
          <p>{data.summary}</p>
        </div>
        <div className="stats-grid">
          <Stat label="Career fit" value={`${data.fitScore}%`} />
          <Stat label="Open leads" value={admin?.leadCount ?? 0} />
          <Stat label="Roadmap steps" value={data.roadmap.length} />
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Recommended Careers" icon={Target}>
          <div className="space-y-3">
            {data.careers.map((career) => (
              <div className="item" key={career.title}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3>{career.title}</h3>
                    <p>{career.reason}</p>
                  </div>
                  <span className="pill">{career.demand}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-smoke">
                  <span>Salary: {career.salary}</span>
                  <span>Growth: {career.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Skill Gap Analyzer" icon={ClipboardList}>
          <div className="space-y-3">
            {data.skillGap.missing.map((skill) => (
              <div className="skill-row" key={skill}>
                <span>{skill}</span>
                <div className="bar"><span style={{ width: `${55 + Math.random() * 30}%` }} /></div>
              </div>
            ))}
            <div className="course-box">
              <h3>Course Recommendations</h3>
              {data.skillGap.courses.map((course) => (
                <p key={course.name}><CheckCircle2 size={14} /> {course.name} <span>{course.type}</span></p>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Study Abroad Guidance" icon={GraduationCap}>
          <div className="space-y-3">
            {data.studyAbroad.map((country) => (
              <div className="item" key={country.country}>
                <h3>{country.country}</h3>
                <p>{country.programs.join(" | ")}</p>
                <p className="mt-2 text-champagne">{country.nextStep}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Action Roadmap" icon={ArrowRight}>
          <div className="timeline">
            {data.roadmap.map((step, index) => (
              <div className="timeline-row" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Chat({ messages, input, setInput, sendMessage, loading }) {
  return (
    <section className="panel flex min-h-[650px] flex-col p-4">
      <div className="chat-window">
        {messages.map((message, index) => (
          <div className={`bubble ${message.role}`} key={`${message.role}-${index}`}>
            <div className="bubble-icon">{message.role === "assistant" ? <Sparkles size={15} /> : <UserRound size={15} />}</div>
            <p>{message.content}</p>
          </div>
        ))}
        {loading && <div className="bubble assistant"><div className="bubble-icon"><Sparkles size={15} /></div><p>Thinking through the next best counselling move...</p></div>}
      </div>
      <div className="composer">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          placeholder="Ask about careers, universities, jobs, resumes, or interviews"
        />
        <button className="icon-button" onClick={sendMessage} disabled={loading}><Send size={18} /></button>
      </div>
    </section>
  );
}

function Jobs({ insights }) {
  const jobs = (insights ?? fallbackInsights()).jobs;
  return (
    <Card title="Matched Job Roles" icon={BriefcaseBusiness}>
      <div className="grid gap-3 md:grid-cols-2">
        {jobs.map((job) => (
          <div className="item" key={job.title}>
            <div className="flex items-start justify-between">
              <h3>{job.title}</h3>
              <span className="pill">{job.match}%</span>
            </div>
            <p>{job.description}</p>
            <p className="mt-3 text-xs text-smoke">Skills: {job.requiredSkills.join(", ")}</p>
            <button className="subtle-button mt-4">Apply Now <ChevronRight size={15} /></button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResumeBuilder({ resumeRole, setResumeRole, buildResume, resume, loading }) {
  return (
    <Card title="ATS Resume Builder" icon={PenLine}>
      <div className="flex flex-col gap-3 md:flex-row">
        <input className="field" value={resumeRole} onChange={(event) => setResumeRole(event.target.value)} />
        <button className="gold-button justify-center" onClick={buildResume} disabled={loading}>Generate Resume</button>
      </div>
      {resume && (
        <div className="resume-paper">
          <h2>{resume.name}</h2>
          <p>{resume.headline}</p>
          <h3>Summary</h3>
          <p>{resume.summary}</p>
          <h3>Skills</h3>
          <p>{resume.skills.join(" | ")}</p>
          <h3>Experience</h3>
          {resume.experience.map((line) => <p key={line}>- {line}</p>)}
          <h3>Target Role Keywords</h3>
          <p>{resume.keywords.join(", ")}</p>
        </div>
      )}
    </Card>
  );
}

function InterviewPrep({ answer, setAnswer, reviewAnswer, feedback, loading }) {
  const questions = [
    "Tell me about a time you learned a new skill quickly.",
    "Why are you interested in this career path?",
    "How would you handle a difficult stakeholder or client?"
  ];
  return (
    <Card title="Interview Preparation" icon={Mic}>
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3">
          {questions.map((question) => <div className="item" key={question}><h3>{question}</h3></div>)}
        </div>
        <div>
          <textarea
            className="field min-h-44"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write a practice answer and receive AI feedback"
          />
          <button className="gold-button mt-3 justify-center" onClick={reviewAnswer} disabled={loading}>Review Answer</button>
          {feedback && (
            <div className="course-box mt-4">
              <h3>Feedback</h3>
              <p>{feedback.feedback}</p>
              <p className="mt-2 text-champagne">Confidence tip: {feedback.confidenceTip}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function Admin({ admin }) {
  return (
    <Card title="Admin Panel" icon={UsersRound}>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Users" value={admin?.userCount ?? 0} />
        <Stat label="Leads" value={admin?.leadCount ?? 0} />
        <Stat label="Avg Fit Score" value={`${admin?.averageFitScore ?? 0}%`} />
      </div>
      <div className="mt-5 space-y-3">
        {(admin?.recentUsers ?? []).map((lead) => (
          <div className="item" key={lead.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3>{lead.name}</h3>
              <span className="text-xs text-smoke">{lead.email} | {lead.phone}</span>
            </div>
            <p>{lead.goals}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="mini-icon"><Icon size={17} /></div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function normalizeProfile(profile) {
  return {
    ...profile,
    skills: splitList(profile.skills),
    interests: splitList(profile.interests)
  };
}

function splitList(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fallbackInsights() {
  return {
    summary: "Complete the intake form to generate a personalized counselling plan with career, study, job, resume, and interview guidance.",
    fitScore: 72,
    careers: [
      { title: "AI Product Manager", reason: "Strong overlap with technology, communication, and strategy interests.", salary: "$90k-$145k", demand: "High", growth: "Fast" },
      { title: "Business Analyst", reason: "Matches analytical skills and consulting-facing goals.", salary: "$65k-$105k", demand: "High", growth: "Steady" },
      { title: "Data Analyst", reason: "Builds on Excel, research, and early technical skills.", salary: "$60k-$100k", demand: "High", growth: "Fast" }
    ],
    skillGap: {
      missing: ["SQL", "Portfolio projects", "Case interview practice"],
      courses: [
        { name: "Google Data Analytics Certificate", type: "Paid" },
        { name: "freeCodeCamp SQL", type: "Free" }
      ]
    },
    studyAbroad: [
      { country: "Canada", programs: ["Business Analytics", "Management"], nextStep: "Shortlist public universities and prepare SOP." },
      { country: "United Kingdom", programs: ["MSc Management", "Digital Business"], nextStep: "Check IELTS waiver and rolling deadlines." }
    ],
    roadmap: ["Finalize target roles", "Close top 3 skill gaps", "Build resume and portfolio", "Apply to programs and jobs"],
    jobs: [
      { title: "Junior Business Analyst", match: 84, description: "Client-facing analysis and documentation role.", requiredSkills: ["Excel", "SQL", "Communication"] }
    ]
  };
}

createRoot(document.getElementById("root")).render(<App />);
