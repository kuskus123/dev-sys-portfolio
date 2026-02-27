import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import AdminDashboard from "./AdminDashboard";

// ─── CONSTANTS & STATIC TEXTS (2 ภาษา) ──────────────────────────────────────
const NAV_LINKS = [
  { id: "home", en: "Home", th: "หน้าแรก" },
  { id: "skills", en: "Skills", th: "ทักษะ" },
  { id: "projects", en: "Projects", th: "ผลงาน" },
  { id: "about", en: "About", th: "เกี่ยวกับตัวผม" },
  { id: "contact", en: "Contact", th: "ติดต่อ" }
];

const LINES = [
  { prompt: "C:\\>", text: ' git commit -m "Transforming ideas into functional code"', color: "#00ff88" },
  { prompt: "C:\\>", text: " whoami", color: "#00cfff" },
  { prompt: "", text: "  → Full-Stack Developer · UI/UX Designer · Cybersecurity Student", color: "#aaaaaa" },
  { prompt: "C:\\>", text: " ready --hire", color: "#00ff88" },
];

// ─── TYPING ANIMATION ─────────────────────────────────────────────────────────
function TypingTerminal({ isDark }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentLine >= LINES.length) { setDone(true); return; }
    const line = LINES[currentLine];
    const fullText = line.prompt + line.text;
    if (currentChar < fullText.length) {
      const t = setTimeout(() => setCurrentChar(c => c + 1), currentChar === 0 ? 400 : 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayedLines(prev => [...prev, { ...line, full: fullText }]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar]);

  const currentFull = currentLine < LINES.length ? LINES[currentLine].prompt + LINES[currentLine].text : "";
  const typing = currentFull.slice(0, currentChar);

  return (
    <div className="font-mono text-sm sm:text-base leading-relaxed select-none">
      {displayedLines.map((l, i) => (
        <div key={i} className="mb-1">
          <span style={{ color: "#555" }}>{l.prompt}</span>
          <span style={{ color: l.color }}>{l.text}</span>
        </div>
      ))}
      {!done && currentLine < LINES.length && (
        <div className="mb-1">
          <span className="typing-line" style={{ color: LINES[currentLine].color }}>{typing}</span>
          <span className="animate-pulse" style={{ color: "#00ff88" }}>▌</span>
        </div>
      )}
      {done && <span className="animate-pulse" style={{ color: "#00ff88" }}>▌</span>}
    </div>
  );
}

// ─── HELPERS ────────────────────────────────────────────────────────────
function NoiseOverlay({ isDark }) {
  return (
    <div className={`pointer-events-none fixed inset-0 z-50 opacity-[0.025] ${!isDark ? 'mix-blend-multiply' : ''}`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px" }} />
  );
}

function GridBg({ isDark }) {
  if (isDark) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0" style={{ backgroundImage: `linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
    );
  }
  return (
    <div className="pointer-events-none fixed inset-0 z-0" style={{
      backgroundImage: `radial-gradient(circle, rgba(0,160,80,0.18) 1px, transparent 1px)`,
      backgroundSize: "28px 28px",
    }} />
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ label, accent = "#00ff88", isDark }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="font-mono text-xs tracking-[0.3em] uppercase font-bold" style={{ color: accent }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${accent}${isDark ? '40' : '60'}, transparent)` }} />
    </div>
  );
}

// ─── SKILL CARD ───────────────────────────────────────────────────────────────
function SkillCard({ skill, index, lang, isDark }) {
  const [hovered, setHovered] = useState(false);
  
  // Logic สลับภาษา
  const title = lang === "TH" && skill.title_th ? skill.title_th : skill.title;
  const description = lang === "TH" && skill.description_th ? skill.description_th : (skill.description || skill.desc);

  return (
    <Reveal delay={index * 0.12}>
      <motion.div 
        onHoverStart={() => setHovered(true)} 
        onHoverEnd={() => setHovered(false)} 
        animate={{ borderColor: hovered ? skill.accent : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,160,80,0.12)") }} 
        transition={{ duration: 0.3 }} 
        className={`relative overflow-hidden rounded-xl p-6 h-full flex flex-col transition-all ${isDark ? 'backdrop-blur-md' : 'light-card'}`}
        style={{ 
          background: isDark ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.72)", 
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,160,80,0.12)"}`,
          boxShadow: isDark ? "none" : (hovered ? "0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,160,80,0.08)" : "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)"),
          backdropFilter: !isDark ? "blur(16px)" : undefined,
          WebkitBackdropFilter: !isDark ? "blur(16px)" : undefined,
        }}
      >
        <div className={`absolute top-0 right-0 ${isDark ? 'w-16 h-16' : 'w-20 h-20'} opacity-20`} style={{ background: `radial-gradient(circle at top right, ${skill.accent}, transparent 70%)` }} />
        <motion.div animate={{ color: hovered ? skill.accent : (isDark ? "#ffffff" : "#2a2a2a") }} className="text-3xl mb-4 font-mono">{skill.icon}</motion.div>
        
        <h3 className={`font-bold text-lg mb-3 leading-tight ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed mb-6 flex-1 ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {skill.tags && skill.tags.map((t) => (
            <span key={t} className="font-mono text-xs px-2.5 py-1.5 rounded font-bold shadow-sm" 
              style={{ 
                background: isDark ? `${skill.accent}15` : skill.accent, // 🟢 ธีมขาวใช้สี Accent ทึบ, ธีมดำใช้สีโปร่งแสง
                color: isDark ? skill.accent : "#ffffff", // 🟢 ธีมขาวตัวหนังสือขาว, ธีมดำตัวหนังสือสี Accent
                border: isDark ? `1px solid ${skill.accent}30` : "none" // 🟢 ธีมขาวเอาขอบออก
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index, lang, isDark }) {
  const [hovered, setHovered] = useState(false);
  const CardWrapper = project.live_url ? motion.a : motion.div;

  // Logic สลับภาษา
  const title = lang === "TH" && project.title_th ? project.title_th : project.title;
  const category = lang === "TH" && project.category_th ? project.category_th : project.category;
  const description = lang === "TH" && project.description_th ? project.description_th : (project.description || project.desc);

  return (
    <Reveal delay={index * 0.15}>
      <CardWrapper href={project.live_url || "#"} target={project.live_url ? "_blank" : "_self"} rel="noreferrer" onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className="group relative overflow-hidden rounded-xl block flex flex-col h-full transition-all" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,160,80,0.12)"}`, textDecoration: "none", cursor: project.live_url ? "pointer" : "default", background: isDark ? "rgba(8,8,8,0.95)" : "rgba(255,255,255,0.75)", backdropFilter: !isDark ? "blur(16px)" : undefined, WebkitBackdropFilter: !isDark ? "blur(16px)" : undefined, boxShadow: isDark ? "none" : (hovered ? "0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,160,80,0.08)" : "0 4px 20px rgba(0,0,0,0.06)") }}>
        
        <div className="relative h-52 overflow-hidden shrink-0" style={{ background: isDark ? "#050505" : "#e8f5ee" }}>
          {project.image_url ? (
            <img src={project.image_url} alt={title} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isDark ? 'opacity-60 group-hover:opacity-100' : 'opacity-90 group-hover:opacity-100'}`} />
          ) : (
            <div className={`absolute inset-0`} style={{ backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(0,255,136,0.06)' : 'rgba(0,160,80,0.15)'} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
          )}
          <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isDark ? 'opacity-40 group-hover:opacity-10' : 'opacity-20 group-hover:opacity-40'}`} style={{ background: isDark ? `radial-gradient(ellipse at center, ${project.accent}40, transparent 70%)` : `linear-gradient(to top, ${project.accent}40, transparent)` }} />
          
          <div className={`absolute bottom-4 left-4 font-mono text-5xl font-bold ${isDark ? 'opacity-30' : 'opacity-10'}`} style={{ color: project.accent }}>
            {project.project_id}
          </div>
          <div className="absolute top-4 right-4">
            <span className="font-mono text-xs px-3 py-1 rounded-full font-bold shadow-sm" style={{ background: isDark ? `${project.accent}20` : "rgba(255,255,255,0.9)", color: project.accent, border: `1px solid ${project.accent}60`, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
              ● {project.status}
            </span>
          </div>
          <AnimatePresence>
            {hovered && project.live_url && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ background: isDark ? "rgba(0,0,0,0.6)" : "rgba(240,248,244,0.75)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
                <div className="font-mono text-sm font-bold tracking-widest px-6 py-3 rounded border shadow-sm" style={{ color: project.accent, borderColor: `${project.accent}80`, background: isDark ? `${project.accent}20` : "rgba(255,255,255,0.9)" }}>
                  [ {lang === "TH" ? "คลิกเพื่อดูของจริง ↗" : "INITIATE CONNECTION ↗"} ]
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`p-6 relative z-20 flex-1 flex flex-col ${isDark ? '' : 'border-t border-green-100/60'}`}>
          <p className="font-mono text-xs mb-2 uppercase tracking-wider font-bold" style={{ color: project.accent }}>{category}</p>
          <h3 className={`font-bold text-lg mb-3 leading-snug ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm leading-relaxed mb-6 flex-1 ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {project.stack && project.stack.map((s) => (
            <span key={s} className="font-mono text-xs font-bold px-3 py-1.5 rounded shadow-sm" 
              style={{ 
                background: isDark ? "rgba(255,255,255,0.03)" : project.accent, // 🟢 ธีมขาวใช้สี Accent ทึบ
                color: isDark ? "#aaa" : "#ffffff", // 🟢 ธีมขาวตัวหนังสือขาว
                border: isDark ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` : "none" // 🟢 ธีมขาวเอาขอบออก
              }}
            >
              {s}
            </span>
          ))}
          </div>
        </div>
      </CardWrapper>
    </Reveal>
  );
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
function ContactForm({ lang, isDark }) {
  const [focused, setFocused] = useState(null);
  const inputStyle = (name) => ({
    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.85)",
    border: `1px solid ${focused === name ? (isDark ? "#00ff88" : "#00aa55") : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,160,80,0.18)")}`,
    color: isDark ? "#ffffff" : "#1a1a1a", outline: "none", transition: "all 0.3s",
    boxShadow: focused === name ? (isDark ? "0 0 0 3px rgba(0,255,136,0.1)" : "0 0 0 3px rgba(0,180,90,0.12), 0 2px 8px rgba(0,0,0,0.06)") : (isDark ? "none" : "0 2px 6px rgba(0,0,0,0.04)"),
    backdropFilter: !isDark ? "blur(8px)" : undefined,
  });

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid sm:grid-cols-2 gap-4">
        {["name", "email"].map((f) => (
          <div key={f}>
            <label className={`block font-mono text-xs mb-1.5 tracking-wider uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {f === "name" ? (lang === "TH" ? "ชื่อ" : "Name") : (lang === "TH" ? "อีเมล" : "Email")}
            </label>
            <input
              type={f === "email" ? "email" : "text"}
              placeholder={f === "name" ? "John Doe" : "john@example.com"}
              className={`w-full px-4 py-3 rounded-lg font-mono text-sm ${isDark ? 'placeholder-gray-700' : 'placeholder-gray-400'}`}
              style={inputStyle(f)}
              onFocus={() => setFocused(f)}
              onBlur={() => setFocused(null)}
            />
          </div>
        ))}
      </div>
      <div>
        <label className={`block font-mono text-xs mb-1.5 tracking-wider uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {lang === "TH" ? "หัวข้อ" : "Subject"}
        </label>
        <input type="text" placeholder={lang === "TH" ? "เรื่องที่ต้องการติดต่อ..." : "Project inquiry..."} className={`w-full px-4 py-3 rounded-lg font-mono text-sm ${isDark ? 'placeholder-gray-700' : 'placeholder-gray-400'}`} style={inputStyle("subject")} onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)} />
      </div>
      <div>
        <label className={`block font-mono text-xs mb-1.5 tracking-wider uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {lang === "TH" ? "ข้อความ" : "Message"}
        </label>
        <textarea rows={5} placeholder={lang === "TH" ? "เล่ารายละเอียดงานของคุณให้ฉันฟัง..." : "Tell me about your project..."} className={`w-full px-4 py-3 rounded-lg font-mono text-sm resize-none ${isDark ? 'placeholder-gray-700' : 'placeholder-gray-400'}`} style={inputStyle("msg")} onFocus={() => setFocused("msg")} onBlur={() => setFocused(null)} />
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 rounded-lg font-mono font-bold text-sm tracking-widest uppercase" style={{ background: isDark ? "linear-gradient(135deg, #00ff8820, #00ff8808)" : "linear-gradient(135deg, #00cc66, #009944)", border: `1px solid ${isDark ? '#00ff8860' : 'transparent'}`, color: isDark ? "#00ff88" : "#ffffff", boxShadow: !isDark ? "0 4px 16px rgba(0,180,90,0.3)" : "none" }}>
        ⟶ {lang === "TH" ? "ส่งข้อความ" : "Send Transmission"}
      </motion.button>
    </form>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ lang, setLang, theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const isDark = theme === "dark";
  
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navBg = scrolled ? (isDark ? "rgba(4,4,4,0.92)" : "rgba(240,242,240,0.88)") : "transparent";

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
      style={{ background: navBg, backdropFilter: scrolled ? "blur(24px)" : "none", WebkitBackdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? `1px solid ${isDark ? "rgba(0,255,136,0.08)" : "rgba(0,160,80,0.12)"}` : "none", transition: "all 0.4s", boxShadow: (scrolled && !isDark) ? "0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(0,160,80,0.08)" : "none" }}
    >
      {/* 🟢 ฝั่งซ้าย: Logo */}
      <a href="#home" className={`font-mono font-bold flex items-center gap-2 relative z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <span style={{ color: "#00cc66" }}>⬡</span>
        <span>KUS<span style={{ color: isDark ? "#00ff88" : "#00aa55" }}>.DEV</span></span>
      </a>
      
      {/* 🟢 ตรงกลาง: Menu Links */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
        {NAV_LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} className={`font-mono text-xs tracking-widest transition-colors uppercase font-bold ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            style={!isDark ? { '--tw-text-opacity': 1 } : {}}>
            {lang === "TH" ? l.th : l.en}
          </a>
        ))}
      </div>

      {/* 🟢 ฝั่งขวา: Buttons */}
      <div className="flex items-center gap-3 relative z-10">
        
        {/* Toggle ธีม */}
        <button onClick={toggleTheme} className="p-2 rounded-lg transition-all" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,160,80,0.2)"}`, color: isDark ? "#fff" : "#555", boxShadow: !isDark ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
          {isDark ? "🌞" : "🌙"}
        </button>

        <button
          onClick={() => setLang(lang === "EN" ? "TH" : "EN")}
          className="font-mono text-xs px-2.5 py-1.5 rounded transition-all flex items-center gap-2 font-bold"
          style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,160,80,0.2)"}`, color: "#777", boxShadow: !isDark ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}
        >
          <span style={{ color: lang === "EN" ? (isDark ? "#00ff88" : "#00aa55") : "#999" }}>EN</span>
          <span style={{ color: isDark ? "#ddd" : "#ccc" }}>|</span>
          <span style={{ color: lang === "TH" ? (isDark ? "#00ff88" : "#00aa55") : "#999" }}>TH</span>
        </button>

        <a href="/admin" className="hidden md:block font-mono text-xs px-4 py-2 rounded transition-all font-bold" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: "#777", boxShadow: !isDark ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
          {lang === "TH" ? "⚙️ จัดการระบบ" : "⚙️ Admin Panel"}
        </a>
      </div>
    </motion.nav>
  );
}

// ─── MAIN PORTFOLIO ───────────────────────────────────────────────────────────
function Portfolio() {
  const [dbProjects, setDbProjects] = useState([]);
  const [dbSkills, setDbSkills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [lang, setLang] = useState("EN");
  const [theme, setTheme] = useState("dark"); // ค่าเริ่มต้นเป็น Dark Mode
  
  const isDark = theme === "dark";

  useEffect(() => {
    async function fetchData() {
      const { data: projData } = await supabase.from('projects').select('*').order('id', { ascending: false });
      if (projData) setDbProjects(projData);

      const { data: skillData } = await supabase.from('skills').select('*').order('sort_order', { ascending: true });
      if (skillData) setDbSkills(skillData);

      const { data: profData } = await supabase.from('profile').select('*').eq('id', 1).single();
      if (profData) setProfile(profData);
    }
    fetchData();
  }, []);

  return (
    <div style={{ background: isDark ? "#040404" : "#f0f2f0", color: isDark ? "#ffffff" : "#1a1a1a", fontFamily: "'Courier New', monospace", minHeight: "100vh", transition: "background 0.5s, color 0.5s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playpen+Sans+Thai:wght@100..800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${isDark ? "#040404" : "#e8ebe8"}; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? "#00ff8840" : "#00cc6680"}; border-radius: 3px; }
        body { font-family: 'JetBrains Mono', 'Courier New', monospace !important; }
        .font-sans { font-family: 'Playpen Sans Thai', cursive, sans-serif !important; }
        
        .hero-glow { background: radial-gradient(ellipse 80% 50% at 50% 0%, ${isDark ? 'rgba(0,255,136,0.06)' : 'rgba(0,200,100,0.07)'}, transparent); }
        .cyber-btn { transition: all 0.3s; box-shadow: ${isDark ? 'none' : '0 2px 12px rgba(0,180,80,0.25)'}; }
        .cyber-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,200,100,0.35); }
        .cyber-btn-blue { box-shadow: ${isDark ? 'none' : '0 2px 12px rgba(0,180,220,0.2)'}; }
        .cyber-btn-blue:hover { box-shadow: 0 8px 24px rgba(0,180,220,0.35); }
        .light-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .light-card:hover { background: rgba(255,255,255,0.92); }
      `}</style>

      <NoiseOverlay isDark={isDark} />
      <GridBg isDark={isDark} />
      
      <Navbar lang={lang} setLang={setLang} theme={theme} toggleTheme={() => setTheme(isDark ? "light" : "dark")} />

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden hero-glow">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, rgba(0,200,100,${isDark ? '0.04' : '0.12'}), transparent 70%)` }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, rgba(0,180,220,${isDark ? '0.04' : '0.1'}), transparent 70%)` }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mb-10 rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? "rgba(0,255,136,0.15)" : "rgba(0,0,0,0.18)"}`, boxShadow: !isDark ? "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#1a1a1a] border-black/80">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="font-mono text-xs text-gray-500 ml-2 tracking-wider">portfolio.sh — bash</span>
            </div>
            <div className={`p-5 ${isDark ? 'bg-[rgba(6,6,6,0.9)] backdrop-blur-md' : 'bg-[#111111]'}`}>
              <TypingTerminal isDark={isDark} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 2.8 }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-xs tracking-[0.35em] uppercase font-bold" style={{ color: isDark ? "#00ff88" : "#00aa55" }}>
                // {lang === "TH" ? "พร้อมรับงานฟรีแลนซ์" : "Available for hire"}
              </span>
              <div style={{ width: 40, height: 2, background: isDark ? "rgba(0,255,136,0.4)" : "#00cc66" }} />
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: isDark ? "#00ff88" : "#00cc66" }} />
            </div>

            <h1 className={`font-extrabold leading-[1.1] mb-6 ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}>
              {lang === "TH" ? "นักพัฒนาเว็บ Full-Stack" : "Full-Stack Dev"}<br />
              <span style={{ color: isDark ? "#00ff88" : "#00aa55" }}>+</span> <span className={isDark ? "text-white/50" : "text-gray-400"}>{lang === "TH" ? "นักออกแบบ UI/UX" : "UI/UX Designer"}</span><br />
              <span className={`text-sm font-bold tracking-widest uppercase font-mono mt-4 inline-block px-4 py-1.5 rounded`} style={{ color: isDark ? "#00cfff" : "#0099bb", border: `1px solid ${isDark ? "#00cfff40" : "#00bcd440"}`, background: isDark ? "transparent" : "rgba(0,188,212,0.06)", fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)" }}>
                ⬔ {lang === "TH" ? "พื้นฐานไซเบอร์ซีเคียวริตี้ · นักศึกษาไอที · รุ่นปี 2026" : "Cybersecurity foundation · IT Student · Class of 2026"}
              </span>
            </h1>

            <p className={`text-base leading-relaxed mb-8 max-w-xl font-medium ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {lang === "TH" 
                ? "สร้างสรรค์ระบบเว็บที่ใช้งานได้จริงและสวยงาม — ตั้งแต่ React Front-end ไปจนถึง Back-end ที่เชื่อมต่อกับ Google Sheets พร้อมออกแบบหน้าตาเว็บที่น่าใช้งาน ภายใต้พื้นฐานระบบที่ปลอดภัย" 
                : "Building functional, beautiful web systems — from React frontends to Google Sheets-powered backends. Designing interfaces that feel alive. Securing systems that stay safe."}
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} href="#projects" className={`cyber-btn font-bold text-sm px-7 py-3.5 rounded-lg ${lang === "TH" ? "font-sans" : "font-mono"}`} style={{ background: isDark ? "linear-gradient(135deg, #00ff8825, #00ff8808)" : "#00cc66", border: `1px solid ${isDark ? '#00ff8870' : '#009944'}`, color: isDark ? "#00ff88" : "#ffffff" }}>
                ⟶ {lang === "TH" ? "ดูผลงานทั้งหมด" : "View Projects"}
              </motion.a>
              <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} href="#contact" className={`cyber-btn cyber-btn-blue font-bold text-sm px-7 py-3.5 rounded-lg ${lang === "TH" ? "font-sans" : "font-mono"}`} style={{ background: isDark ? "linear-gradient(135deg, #00cfff20, #00cfff08)" : "rgba(255,255,255,0.85)", border: `2px solid ${isDark ? '#00cfff60' : '#00aacc'}`, color: isDark ? "#00cfff" : "#0099bb", backdropFilter: !isDark ? "blur(8px)" : "none" }}>
                ↓ {lang === "TH" ? "ติดต่อฉัน" : "Contact Me"}
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className={`font-mono text-xs tracking-widest font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{lang === "TH" ? "เลื่อนลง" : "SCROLL"}</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: isDark ? "#00ff8850" : "#00cc66" }}>↓</motion.div>
        </motion.div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionLabel label={lang === "TH" ? "// ทักษะและบริการ" : "// Skills & Services"} isDark={isDark} />
            <h2 className={`font-extrabold text-4xl mb-4 ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lang === "TH" ? "สิ่งที่ผม" : "What I"} <span style={{ color: "#00ff88" }}>{lang === "TH" ? "สร้าง" : "Build"}</span> {lang === "TH" ? "& ออกแบบ" : "& Design"}
            </h2>
            <p className={`text-sm mb-14 max-w-lg font-medium ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {lang === "TH" ? "ครอบคลุมหลากหลายทักษะ — ตั้งแต่การเขียนโค้ด, การออกแบบ, และความปลอดภัยทางไซเบอร์" : "A multidisciplinary stack — spanning code, design, and security."}
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {dbSkills.map((s, i) => <SkillCard key={s.id || s.title} skill={s} index={i} lang={lang} isDark={isDark} />)}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="py-28 px-6 relative" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}` }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionLabel label={lang === "TH" ? "// ผลงานเด่น" : "// Featured Projects"} accent="#00cfff" isDark={isDark} />
            <h2 className={`font-extrabold text-4xl mb-4 ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lang === "TH" ? "ผลงาน" : "Selected"} <span style={{ color: "#00cfff" }}>{lang === "TH" ? "ที่ผ่านมา" : "Work"}</span>
            </h2>
            <p className={`text-sm mb-14 max-w-lg font-medium ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {lang === "TH" ? "โปรเจกต์จริง. ปัญหาจริง. ระบบที่ใช้งานได้จริง." : "Real projects. Real problems. Real solutions."}
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {dbProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} lang={lang} isDark={isDark} />)}
          </div>
        </div>
      </section>

      {/* ── ABOUT ME ── */}
      <section id="about" className="py-28 px-6 relative" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}` }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionLabel label={lang === "TH" ? "// ข้อมูลส่วนตัว" : "// About Me"} accent="#ff6b35" isDark={isDark} />
            <h2 className={`font-extrabold text-4xl mb-4 ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lang === "TH" ? "เกี่ยวกับ" : "About"} <span style={{ color: "#ff6b35" }}>{lang === "TH" ? "ตัวผม" : "Me"}</span>
            </h2>
            <p className={`text-sm mb-14 max-w-lg font-medium ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {lang === "TH" ? "ตัวตน, ความหลงใหล, และสิ่งที่ขับเคลื่อนผมในการทำงาน" : "Who I am, what I do, and what drives me."}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="grid md:grid-cols-5 gap-8 items-center">
              
              {/* รูปโปรไฟล์ / กราฟิกเท่ๆ (ซ้าย) */}
              <div className="md:col-span-2 relative">
                <div className={`aspect-square rounded-xl overflow-hidden relative`} style={{ background: isDark ? "rgba(255,107,53,0.05)" : "rgba(255,240,230,0.9)", border: `1px solid ${isDark ? "rgba(255,107,53,0.2)" : "rgba(255,107,53,0.15)"}`, boxShadow: !isDark ? "0 8px 32px rgba(255,107,53,0.1)" : "none" }}>
                  
                  {profile?.image_url ? (
                    <img 
                      src={profile.image_url} 
                      alt="My Profile" 
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 z-10" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-8xl" style={{ color: isDark ? "rgba(255,107,53,0.2)" : "rgba(255,107,53,0.3)" }}>⬔</div>
                  )}
                  
                  {/* เส้น Scanline ตกแต่ง */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,107,53,0.05)'} 2px, ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,107,53,0.05)'} 4px)` }} />
                </div>
              </div>

              {/* ข้อความอธิบายตัวเอง (ขวา) */}
              <div className="md:col-span-3 space-y-6">
                <div className={`p-8 rounded-xl relative overflow-hidden`} style={{ background: isDark ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.78)", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(255,107,53,0.1)"}`, backdropFilter: !isDark ? "blur(16px)" : "blur(12px)", WebkitBackdropFilter: !isDark ? "blur(16px)" : "blur(12px)", boxShadow: !isDark ? "0 4px 24px rgba(0,0,0,0.06)" : "none" }}>
                  
                  {/* ไอคอนมุมขวา */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: `radial-gradient(circle at top right, #ff6b35, transparent 70%)` }} />
                  
                  <div className={`leading-relaxed whitespace-pre-wrap font-medium ${lang === "TH" ? "font-sans text-base" : "font-mono text-sm"} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {lang === "TH" ? profile?.bio_th : profile?.bio_en}
                  </div>

                  {/* ป้าย Tags ด้านล่าง */}
                  <div className="flex flex-wrap gap-2 mt-8">
                    {(profile?.tags || []).map((tag) => (
                      <span key={tag} className="font-mono text-xs px-3 py-1.5 rounded font-bold" style={{ background: isDark ? "rgba(255,107,53,0.1)" : "rgba(255,107,53,0.08)", color: "#ff6b35", border: "1px solid rgba(255,107,53,0.25)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-28 px-6 relative" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}` }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <SectionLabel label={lang === "TH" ? "// ติดต่อ" : "// Contact"} isDark={isDark} />
            <h2 className={`font-extrabold text-4xl mb-4 ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lang === "TH" ? "เริ่มต้น" : "Open a"} <span style={{ color: "#00ff88" }}>{lang === "TH" ? "โปรเจกต์ใหม่" : "Connection"}</span>
            </h2>
            <p className={`text-sm mb-14 max-w-lg font-medium ${lang === "TH" ? "font-sans" : "font-mono"} ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {lang === "TH" ? "มีไอเดียหรือโปรเจกต์ในใจ? มาสร้างมันให้เกิดขึ้นจริงด้วยกันครับ" : "Have a project in mind? Let's build something together."}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Reveal delay={0.1}>
              <ContactForm lang={lang} isDark={isDark} />
            </Reveal>

            <Reveal delay={0.2}>
              <div className="space-y-6">
                {[
                  { 
                    label: "LINE ID", 
                    val: "kuskusza", 
                    link: "https://line.me/ti/p/u4CUMTMJdg", 
                    accent: "#00c300" 
                  },
                  { 
                    label: "PHONE", 
                    val: "086-345-9786", 
                    link: "tel:0863459786", 
                    accent: "#00cfff" 
                  },
                  { 
                    label: "INSTAGRAM", 
                    val: "kuskusz6", 
                    link: "https://www.instagram.com/kuskusz6/?hl=en", 
                    accent: "#E1306C" 
                  },
                  { 
                    label: "EMAIL", 
                    val: "kuskusza@email.com", 
                    link: "mailto:kuskusza@email.com", 
                    accent: "#ffaa00" 
                  },
                ].map((item) => (
                  <div key={item.label} className={`p-5 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : ''}`} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.8)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,160,80,0.1)"}`, backdropFilter: !isDark ? "blur(12px)" : undefined, WebkitBackdropFilter: !isDark ? "blur(12px)" : undefined, boxShadow: !isDark ? "0 2px 12px rgba(0,0,0,0.05)" : "none" }}>
                    <p className="font-mono text-xs uppercase tracking-widest mb-1 font-bold" style={{ color: isDark ? "#666" : "#999" }}>{item.label}</p>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noreferrer" className={`font-bold text-lg hover:underline ${lang === "TH" ? "font-sans" : "font-mono"}`} style={{ color: item.accent }}>
                        {item.val} ↗
                      </a>
                    ) : (
                      <p className={`font-bold text-lg ${lang === "TH" ? "font-sans" : "font-mono"}`} style={{ color: item.accent }}>{item.val}</p>
                    )}
                  </div>
                ))}

                <div className={`p-5 rounded-xl font-mono text-sm`} style={{ background: isDark ? "rgba(0,255,136,0.03)" : "rgba(255,255,255,0.8)", border: `1px solid ${isDark ? "rgba(0,255,136,0.15)" : "rgba(0,160,80,0.2)"}`, backdropFilter: !isDark ? "blur(12px)" : undefined, boxShadow: !isDark ? "0 2px 12px rgba(0,0,0,0.05)" : "none" }}>
                  <p style={{ color: isDark ? "#555" : "#888" }}>C:\&gt; <span style={{ color: isDark ? "#00ff88" : "#00aa55", fontWeight: "bold" }}>ping --new-opportunity</span></p>
                  <p style={{ color: isDark ? "#555" : "#888" }} className="mt-1">C:\&gt; <span style={{ color: isDark ? "#aaa" : "#666" }}>Awaiting response...</span> <span className="animate-pulse" style={{ color: isDark ? "#00ff88" : "#00aa55" }}>▌</span></p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,160,80,0.1)"}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-xs font-medium">
            <span style={{ color: isDark ? "#555" : "#aaa" }}>C:\&gt; </span><span style={{ color: isDark ? "#00ff88" : "#00aa55", fontWeight: "bold" }}>exit</span><span style={{ color: isDark ? "#555" : "#aaa" }}> — Built with React · Tailwind · Framer Motion</span>
          </div>
          <p className="font-mono text-xs font-medium" style={{ color: isDark ? "#777" : "#aaa" }}>© {new Date().getFullYear()} · DEV.SYS · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

// ─── SIMPLE ROUTER ────────────────────────────────────────────────────────────
export default function App() {
  const path = window.location.pathname;
  if (path === "/admin") {
    return <AdminDashboard />;
  }
  return <Portfolio />;
}