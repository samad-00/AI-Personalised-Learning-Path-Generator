import { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

function Typewriter({ texts, speed = 45, deleteSpeed = 20, pauseTime = 2500 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[index];
    let timer;
    if (!isDeleting && displayedText === currentFullText) {
      timer = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
    } else {
      const step = isDeleting ? deleteSpeed : speed;
      timer = setTimeout(() => {
        setDisplayedText(
          currentFullText.substring(0, displayedText.length + (isDeleting ? -1 : 1))
        );
      }, step);
    }
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, index, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{displayedText}</span>
      <span style={{
        display: 'inline-block',
        width: 3,
        height: '1.2em',
        backgroundColor: 'var(--accent-pink)',
        marginLeft: 4,
        animation: 'cursorBlink 1s infinite'
      }} />
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

function ParagraphTypewriter({ text, speed = 50 }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.substring(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {displayedText.length < text.length && (
        <span style={{
          display: 'inline-block',
          width: 3,
          height: '1.1em',
          backgroundColor: 'var(--accent-teal)',
          marginLeft: 4,
          verticalAlign: 'middle',
          animation: 'cursorBlink 0.8s infinite'
        }} />
      )}
    </span>
  );
}

function ScrollPathCard({ cardClass, pathData, steps, travelerIcon = "🚀" }) {
  const cardRef = useRef(null);
  const pathRef = useRef(null);
  const progressRef = useRef(0);     // mutable — avoids stale closure
  const doneRef = useRef(false); // true once step 3 reached

  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [travelerPos, setTravelerPos] = useState({ x: 0, y: 0 });

  // Measure SVG path length once mounted
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      if (len > 0) {
        setPathLength(len);
        const p = pathRef.current.getPointAtLength(0);
        setTravelerPos({ x: p.x, y: p.y });
      }
    }
  }, [pathData]);

  // Sync traveller position whenever progress or length changes
  useEffect(() => {
    if (pathRef.current && pathLength > 0) {
      const p = pathRef.current.getPointAtLength(scrollProgress * pathLength);
      setTravelerPos({ x: p.x, y: p.y });
    }
  }, [scrollProgress, pathLength]);

  // Wheel / touch intercept — bidirectional
  useEffect(() => {
    const SPEED = 0.0010; // wheel delta → progress units

    const onWheel = (e) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centred = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      if (!centred) return;

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // Scrolling down: lock until animation reaches 1
      if (scrollingDown && !doneRef.current) {
        e.preventDefault();
        const next = Math.min(1, progressRef.current + e.deltaY * SPEED);
        progressRef.current = next;
        setScrollProgress(next);
        if (next >= 1) doneRef.current = true;
        return;
      }

      // Scrolling up: if animation is in progress (> 0), re-lock and reverse
      if (scrollingUp && progressRef.current > 0) {
        e.preventDefault();
        doneRef.current = false; // re-engage forward lock for next downward scroll
        const next = Math.max(0, progressRef.current + e.deltaY * SPEED);
        progressRef.current = next;
        setScrollProgress(next);
        return;
      }

      // Otherwise let normal scroll happen (up from 0, or down after done)
    };

    // Touch support — bidirectional
    let lastY = 0;
    const onTouchStart = (e) => { lastY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centred = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      if (!centred) return;

      const dy = lastY - e.touches[0].clientY; // positive = swipe up = scroll down
      lastY = e.touches[0].clientY;

      if (dy > 0 && !doneRef.current) {
        e.preventDefault();
        const next = Math.min(1, progressRef.current + dy * SPEED * 5);
        progressRef.current = next;
        setScrollProgress(next);
        if (next >= 1) doneRef.current = true;
      } else if (dy < 0 && progressRef.current > 0) {
        e.preventDefault();
        doneRef.current = false;
        const next = Math.max(0, progressRef.current + dy * SPEED * 5);
        progressRef.current = next;
        setScrollProgress(next);
      }
    };

    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div ref={cardRef} className={`bento-card ${cardClass}`}
      style={{
        position: 'relative', height: 460, overflow: 'hidden',
        borderColor: 'rgba(255,255,255,0.25)', borderWidth: '2px'
      }}>

      {/* SVG Path */}
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100"
        style={{ position: 'absolute', top: 0, left: 0 }}>
        <path d={pathData} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeDasharray="4 4" />
        <path d={`${pathData} L100,100 L0,100 Z`} fill="rgba(255,255,255,0.05)" />
        <path
          ref={pathRef}
          d={pathData} fill="none" stroke="#ffffff" strokeWidth="4"
          strokeDasharray={pathLength || 1000}
          strokeDashoffset={(pathLength || 1000) * (1 - scrollProgress)}
          style={{ transition: 'stroke-dashoffset 0.06s ease-out' }}
        />
      </svg>

      {/* Traveller */}
      <div style={{
        position: 'absolute',
        left: `${travelerPos.x}%`, top: `${travelerPos.y}%`,
        transform: 'translate(-50%, -50%) scale(1.15)',
        width: 50, height: 50, borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, boxShadow: '0 4px 15px rgba(0,0,0,0.35)', zIndex: 5,
        transition: 'left 0.06s ease-out, top 0.06s ease-out',
      }}>
        {travelerIcon}
      </div>

      {/* "Scroll to continue" hint */}
      {scrollProgress < 1 && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 5, zIndex: 6,
          animation: 'hintBounce 1.8s infinite ease-in-out',
          pointerEvents: 'none',
        }}>
          <style>{`@keyframes hintBounce { 0%,100%{transform:translateX(-50%) translateY(0);opacity:.7} 50%{transform:translateX(-50%) translateY(5px);opacity:1} }`}</style>
          ↓ Scroll to reveal steps
        </div>
      )}

      {/* Step Checkpoints */}
      {steps.map((s, idx) => {
        const isReached = travelerPos.x >= (s.x - 1.5);
        return (
          <div key={idx} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            transform: isReached ? 'translate(-50%,-50%) scale(1.05)' : 'translate(-50%,-40%) scale(0.85)',
            width: 220, textAlign: 'center', zIndex: 4,
            transition: 'all 0.25s cubic-bezier(0.2,0.9,0.3,1)',
          }}>
            <div style={{
              width: isReached ? 26 : 14, height: isReached ? 26 : 14,
              borderRadius: '50%',
              background: isReached ? '#ffffff' : 'rgba(255,255,255,0.25)',
              margin: '0 auto 0.75rem',
              boxShadow: isReached ? '0 0 0 6px rgba(255,255,255,0.25)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.34,1.5,0.6,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#000', fontSize: 13, fontWeight: 900,
            }}>{isReached ? '✓' : ''}</div>
            <div style={{
              opacity: isReached ? 1 : 0, visibility: isReached ? 'visible' : 'hidden',
              filter: isReached ? 'blur(0)' : 'blur(8px)',
              transform: isReached ? 'translateY(0)' : 'translateY(15px)',
              transition: 'all 0.25s cubic-bezier(0.2,0.9,0.3,1)',
            }}>
              <div style={{ background: '#fff', color: '#111', padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800, display: 'inline-block', marginBottom: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>{s.step}</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 0.35rem', color: '#fff' }}>{s.title}</h3>
              <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.45, margin: 0, fontWeight: 500 }}>{s.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function ScrollRiseUp({ children, distance = 80, scaleShape = false, delay = 0 }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const winHeight = window.innerHeight || document.documentElement.clientHeight;

      // Complete the rising animation when element reaches 68% of window height (lower mid-screen)
      // This ensures elements at the very bottom of the page comfortably reach 100% completion!
      const start = winHeight * 1.05;
      const end = winHeight * 0.68;

      let p = (start - rect.top) / (start - end);

      // If user is scrolled to the absolute bottom of the webpage, ensure all visible elements reach 100% completion
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 40);
      if (isAtBottom && rect.top < winHeight) {
        p = 1;
      }

      p = Math.max(0, Math.min(1, p));
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sine easing for natural fluid motion in both scroll directions
  const easeProgress = Math.sin((progress * Math.PI) / 2);
  const translateY = (1 - easeProgress) * distance;
  const scale = scaleShape ? (0.86 + 0.14 * easeProgress) : 1;
  // Quickly scale opacity up to 1 so text never looks faded or washed out while rising
  const opacity = Math.min(1, Math.max(0, progress * 3.5));

  return (
    <div
      ref={ref}
      style={{
        opacity: opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transition: 'transform 0.12s ease-out, opacity 0.12s ease-out',
        willChange: 'transform, opacity',
        width: '100%',
        height: '100%',
        transformOrigin: 'center center'
      }}
    >
      {children}
    </div>
  );
}
export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      <AnimatedBackground />

      <style>{`
        @keyframes smoothRiseUp {
          0% { opacity: 0; transform: translateY(60px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .land-rise-1 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
        .land-rise-2 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both; }
        .land-rise-3 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.40s both; }
        .land-rise-4 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.58s both; }
        .land-rise-5 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.76s both; }
        .land-rise-6 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.94s both; }
        @keyframes bounceDown { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
      `}</style>

      {/* Navigation */}
      <nav className="land-rise-1" style={{ padding: '2rem 3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 15px rgba(226, 85, 131, 0.25)' }}>
            📖
          </div>
          <span style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>LearnPath</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6rem 4rem', position: 'relative', zIndex: 10, maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        <div style={{ maxWidth: 750 }}>
          <h1 className="land-rise-2" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.05, letterSpacing: '-2px' }}>
            Your Platform <span style={{ opacity: 0.5, fontWeight: 500 }}>for</span><br />
            Unlimited Learning
          </h1>

          <div className="land-rise-3" style={{ fontSize: 'clamp(1.2rem, 2.3vw, 1.45rem)', marginBottom: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', minHeight: '42px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>✨ Featuring:</span>
            <Typewriter
              texts={[
                "AI-Powered Personalized Learning Roadmaps",
                "Live Interactive AI Mock Interviews & Feedback",
                "Smart Resume ATS Audit & CV Optimizer",
                "Gamified Career Tracking & Weekly Mastery"
              ]}
              speed={45}
              deleteSpeed={20}
              pauseTime={2500}
            />
          </div>

          <p className="land-rise-4" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.65, minHeight: '7em' }}>
            <ParagraphTypewriter
              text="Create personalized learning roadmaps powered by AI. Track your progress, earn badges, and master new skills with interactive weekly plans. Practice realistic technical and behavioral job interviews with instant expert evaluation, and optimize your resume line-by-line to beat ATS scanners and secure your dream career."
              speed={50}
            />
          </p>

          <div className="bento-card land-rise-5" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderRadius: 100, marginBottom: '3rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-teal)' }}></span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Current activity</span>
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border-color)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-pink)' }}>AI Skill Path, Interview Preparation & CV Analyzer</span>
            </div>
          </div>

          <div className="land-rise-6" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100 }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100 }}>
                  Start Learning Free
                </Link>
                <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100, border: '2px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Log in to account
                </Link>
              </>
            )}
          </div>
        </div>


        {/* Scroll Down Icon */}
        <div className="land-rise-6" style={{ marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', animation: 'bounceDown 2s infinite ease-in-out' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll Down</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>


        {/* How It Works Section */}
        <div style={{ marginTop: '8rem' }}>
          <ScrollRiseUp distance={60}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 1rem' }}>How it Works</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                Your journey from setting a goal to mastering a skill.
              </p>
            </div>
          </ScrollRiseUp>

          <ScrollRiseUp distance={110} scaleShape={true}>
            <ScrollPathCard
              cardClass="card-pink"
              travelerIcon="🚀"
              pathData="M0,80 Q15,20 30,50 T70,50 T100,20"
              steps={[
                { x: 15, y: 42.5, step: "Step 1", title: "Tell us your goal", desc: "Enter your topic and time commitment." },
                { x: 50, y: 65, step: "Step 2", title: "AI creates path", desc: "Get a personalized curriculum." },
                { x: 85, y: 27.5, step: "Step 3", title: "Learn & level up", desc: "Complete lessons and earn XP." }
              ]}
            />
          </ScrollRiseUp>
        </div>

        {/* AI Interview Preparation Road Section */}
        <div style={{ marginTop: '7rem' }}>
          <ScrollRiseUp distance={60}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="pill-tag" style={{ background: 'var(--accent-teal)', color: 'white', border: 'none', marginBottom: '1rem', display: 'inline-block', fontWeight: 800 }}>
                🎤 AI INTERVIEW PREPARATION
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 1rem' }}>Master Your Next Interview</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 650, margin: '0 auto 1.5rem' }}>
                Practice realistic, role-specific questions with AI and receive expert evaluations before stepping into the real room.
              </p>
              <div>
                <Link to={user ? "/interview-prep" : "/register"} className="btn-primary" style={{ background: 'var(--accent-teal)', color: 'white', textDecoration: 'none', padding: '12px 32px', fontSize: 16, borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                  <span>Try Interview Preparation</span> <span>→</span>
                </Link>
              </div>
            </div>
          </ScrollRiseUp>

          <ScrollRiseUp distance={110} scaleShape={true}>
            <ScrollPathCard
              cardClass="card-teal"
              travelerIcon="🎤"
              pathData="M0,30 Q20,80 50,50 T80,40 T100,70"
              steps={[
                { x: 18, y: 60, step: "Step 1", title: "Choose Your Role", desc: "Select your job title, target company type, and desired difficulty." },
                { x: 50, y: 38, step: "Step 2", title: "Answer Live Questions", desc: "Tackle behavioral, technical, and situation-based interview scenarios." },
                { x: 82, y: 55, step: "Step 3", title: "Get AI Scoring", desc: "Receive personalized feedback, scorecards, and model answers." }
              ]}
            />
          </ScrollRiseUp>
        </div>

        {/* AI CV Analyzer & Optimizer Road Section */}
        <div style={{ marginTop: '7rem' }}>
          <ScrollRiseUp distance={60}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="pill-tag" style={{ background: 'var(--accent-orange)', color: 'white', border: 'none', marginBottom: '1rem', display: 'inline-block', fontWeight: 800 }}>
                📄 AI CV ANALYZER & OPTIMIZER
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 1rem' }}>Land Your Dream Job Faster</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 650, margin: '0 auto 1.5rem' }}>
                Optimize your resume for ATS screening and tailor every bullet point to match your target job description perfectly.
              </p>
              <div>
                <Link to={user ? "/cv-analyzer" : "/register"} className="btn-primary" style={{ background: 'var(--accent-orange)', color: 'white', textDecoration: 'none', padding: '12px 32px', fontSize: 16, borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                  <span>Analyze My CV</span> <span>→</span>
                </Link>
              </div>
            </div>
          </ScrollRiseUp>

          <ScrollRiseUp distance={110} scaleShape={true}>
            <ScrollPathCard
              cardClass="card-orange"
              travelerIcon="✨"
              pathData="M0,65 Q25,15 50,60 T85,25 T100,50"
              steps={[
                { x: 16, y: 40, step: "Step 1", title: "Paste Your CV", desc: "Upload or paste your resume alongside your target job description." },
                { x: 50, y: 65, step: "Step 2", title: "Instant AI Audit", desc: "Get comprehensive ATS compatibility, keyword, and impact scores." },
                { x: 84, y: 32, step: "Step 3", title: "Optimize & Apply", desc: "Receive tailored bullet point rewrites to double your interview callbacks." }
              ]}
            />
          </ScrollRiseUp>
        </div>

        {/* Call to Action Banner */}
        <ScrollRiseUp distance={140} scaleShape={true}>
          <div className="bento-card card-teal" style={{ marginTop: '8rem', padding: '4rem', textAlign: 'center', borderRadius: 40 }}>
            <ScrollRiseUp distance={45}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, margin: '0 0 1.5rem', color: 'white' }}>Ready to start learning?</h2>
            </ScrollRiseUp>
            <ScrollRiseUp distance={35}>
              <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 2.5rem', color: 'white' }}>
                Join thousands of learners who are mastering new skills faster with personalized AI roadmaps.
              </p>
            </ScrollRiseUp>
            <ScrollRiseUp distance={25}>
              {user ? (
                <Link to="/dashboard" className="btn-primary" style={{ background: 'white', color: 'var(--accent-teal)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100, display: 'inline-block', fontWeight: 800 }}>
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register" className="btn-primary" style={{ background: 'white', color: 'var(--accent-teal)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100, display: 'inline-block', fontWeight: 800 }}>
                  Create your free account
                </Link>
              )}
            </ScrollRiseUp>
          </div>
        </ScrollRiseUp>

      </main>

      {/* Professional 3-Part Column-Wise Rectangular Bento Cards Footer */}
      <footer style={{
        width: '100%',
        marginTop: '5rem',
        position: 'relative',
        zIndex: 2,
        padding: '2rem 0 4rem',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Widened Column-wise Grid: 3 Separated Parts without Unnecessary Spaces */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.4rem',
            marginBottom: '4rem',
            alignItems: 'stretch'
          }}>

            {/* Part 1: Brand & Star on GitHub (Wide Horizontal Rectangle Shape) */}
            <ScrollRiseUp distance={50} scaleShape={true}>
              <div className="bento-card card-pink" style={{
                padding: '1.6rem 2.2rem',
                borderRadius: 32,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: 'none',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                color: 'white',
                boxSizing: 'border-box'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.7rem' }}>🧠</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                      AI Learning Path
                    </span>
                  </div>
                  <p style={{ color: 'white', opacity: 0.92, lineHeight: 1.45, margin: 0, fontSize: '0.94rem', fontWeight: 500 }}>
                    AI-crafted skill curricula, interactive roleplay interview simulation, and instant ATS CV optimization.
                  </p>
                </div>

                <div style={{ marginTop: '1.2rem', background: 'rgba(255, 255, 255, 0.16)', padding: '0.9rem 1.2rem', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontSize: '0.84rem', color: 'white', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#FFE169', fontSize: '1.1rem' }}>★</span>
                    <span>Found this useful? Support us:</span>
                  </div>
                  <a
                    href="https://github.com/samad-00/AI-Personalised-Learning-Path-Generator"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '100px',
                      background: 'white',
                      color: 'var(--accent-pink)',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span>⭐ Star on GitHub</span>
                  </a>
                </div>
              </div>
            </ScrollRiseUp>

            {/* Part 2: Collaboration & Project Dev (Wide Horizontal Rectangle Shape) */}
            <ScrollRiseUp distance={50} scaleShape={true}>
              <div className="bento-card card-teal" style={{
                padding: '1.6rem 2.2rem',
                borderRadius: 32,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: 'none',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                color: 'white',
                boxSizing: 'border-box'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>🤝</span> <span>Collaboration & Dev</span>
                  </h3>
                  <p style={{ color: 'white', opacity: 0.92, lineHeight: 1.45, margin: 0, fontSize: '0.94rem', fontWeight: 500 }}>
                    Open for collaborating on new AI features, educational research tools, enterprise integrations, or custom dev.
                  </p>
                </div>

                <div style={{ marginTop: '1.2rem', background: 'rgba(255, 255, 255, 0.16)', padding: '0.9rem 1.2rem', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontSize: '0.84rem', color: 'white', opacity: 0.95, marginBottom: '8px', fontWeight: 600, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚡ Response time: within 24–48 hours</span>
                  </div>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=edsam324@gmail.com&su=Project%20Collaboration%20Inquiry"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      gap: '8px',
                      color: 'var(--accent-teal)',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      padding: '10px',
                      borderRadius: 100,
                      background: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span>🚀 Connect via Gmail →</span>
                  </a>
                </div>
              </div>
            </ScrollRiseUp>

            {/* Part 3: Explore Platform (Wide Horizontal Rectangle Shape) */}
            <ScrollRiseUp distance={50} scaleShape={true}>
              <div className="bento-card card-orange" style={{
                padding: '1.6rem 2.2rem',
                borderRadius: 32,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: 'none',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                color: 'white',
                boxSizing: 'border-box'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>⚡</span> <span>Explore Platform</span>
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.95, fontSize: '0.92rem', fontWeight: 600, margin: 0, lineHeight: 1.45 }}>
                    <span>✨</span> <span>AI tailored learning roadmaps updated daily to match industry demands.</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.2rem', background: 'rgba(255, 255, 255, 0.16)', padding: '0.9rem 1.2rem', borderRadius: 20, backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Quick Navigation
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.86rem', fontWeight: 800 }}>
                    <Link to={user ? "/dashboard" : "/register"} style={{ color: 'white', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.16)', padding: '9px 4px', borderRadius: 12, display: 'block', textAlign: 'center', transition: 'background 0.2s ease', whiteSpace: 'nowrap' }}>
                      AI Paths
                    </Link>
                    <Link to={user ? "/interview-prep" : "/register"} style={{ color: 'white', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.16)', padding: '9px 4px', borderRadius: 12, display: 'block', textAlign: 'center', transition: 'background 0.2s ease', whiteSpace: 'nowrap' }}>
                      Interview
                    </Link>
                    <Link to={user ? "/cv-analyzer" : "/register"} style={{ color: 'white', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.16)', padding: '9px 4px', borderRadius: 12, display: 'block', textAlign: 'center', transition: 'background 0.2s ease', whiteSpace: 'nowrap' }}>
                      CV Analyzer
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollRiseUp>

          </div>

          {/* Bottom Copyright Bar with Simple Static Heart (No Beating Effect) */}
          <ScrollRiseUp distance={20}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              padding: '0 1rem'
            }}>
              <div>
                © {new Date().getFullYear()} AI Learning Path Generator. Open Source Educational Platform.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <span>Made with</span>
                <span style={{ color: '#e25555', fontSize: '1.2rem', display: 'inline-block' }}>❤️</span>
                <span>for lifelong learners & developers</span>
              </div>
            </div>
          </ScrollRiseUp>
        </div>
      </footer>
    </div>
  );
}
