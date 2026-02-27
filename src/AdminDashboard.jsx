/**
 * AdminDashboard.jsx
 * ──────────────────────────────────────────────────────────────────
 * Cyber / Command-Center Admin Panel (Projects, Skills, Profile)
 * ──────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// ── CONFIG ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://kaojspvcfbtyrgfsmyeh.supabase.co";
const SUPABASE_ANON_KEY ="sb_publishable_H67NVXLxsxyFVdE4oCuM3g_SVsDbyl9";

const STATUS_OPTIONS = ["DEPLOYED", "ACADEMIC", "IN PROGRESS"];

const INITIAL_PROJECT_FORM = {
  project_id: "", title: "", title_th: "", category: "", category_th: "",
  accent: "#00ff88", description: "", description_th: "", stack: "",
  status: "DEPLOYED", image_url: "", live_url: "",
};

const INITIAL_SKILL_FORM = {
  icon: "⬡", title: "", title_th: "", accent: "#00ff88",
  description: "", description_th: "", tags: "", sort_order: 0,
};

const INITIAL_PROFILE_FORM = {
  bio_en: "", bio_th: "", tags: "", image_url: "",
};

function getSupabase(url, key) {
  return createClient(url || SUPABASE_URL, key || SUPABASE_ANON_KEY);
}

function NoiseOverlay() {
  return <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.022]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />
}
function GridBg() {
  return <div className="pointer-events-none absolute inset-0 z-0" style={{ backgroundImage: "linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
}
function LogLine({ log }) {
  const colorMap = { ok: "#00ff88", err: "#ff4444", info: "#00cfff", warn: "#ffaa00" };
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="font-mono text-xs leading-relaxed" style={{ color: colorMap[log.type] || "#888" }}>
      <span style={{ color: "#333" }}>[{log.time}]</span> <span style={{ color: "#555" }}>&gt;</span> {log.msg}
    </motion.div>
  );
}
function TermInput({ label, name, value, onChange, type = "text", placeholder, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-xs tracking-[0.2em] uppercase" style={{ color: focused ? "#00ff88" : "#444" }}>{label}</label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded transition-all duration-300" style={{ background: focused ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${focused ? "rgba(0,255,136,0.5)" : "rgba(255,255,255,0.07)"}`, boxShadow: focused ? "0 0 12px rgba(0,255,136,0.08)" : "none" }}>
        <span className="font-mono text-xs shrink-0" style={{ color: focused ? "#00ff88" : "#333" }}>&gt;_</span>
        {children || <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="flex-1 bg-transparent font-mono text-sm text-white placeholder-gray-700 outline-none" autoComplete="off" />}
      </div>
    </div>
  );
}
function TerminateModal({ target, table, onConfirm, onCancel, loading }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="rounded-xl p-8 max-w-sm w-full" style={{ background: "#080808", border: "1px solid rgba(255,68,68,0.4)", boxShadow: "0 0 40px rgba(255,68,68,0.08)" }}>
        <div className="font-mono text-xs text-red-500 tracking-widest mb-3">⚠ TERMINATE PROCESS</div>
        <p className="font-mono text-white font-bold text-lg mb-1">{target?.title}</p>
        <p className="font-mono text-xs text-gray-500 mb-6">TABLE: {table} · This action is <span className="text-red-400">irreversible</span>.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 font-mono text-sm rounded transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>ABORT</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 font-mono text-sm font-bold rounded transition-all" style={{ background: loading ? "rgba(255,68,68,0.1)" : "rgba(255,68,68,0.2)", border: "1px solid rgba(255,68,68,0.5)", color: "#ff4444", opacity: loading ? 0.7 : 1 }}>{loading ? "TERMINATING..." : "CONFIRM TERMINATE"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDashboard({ url, anonKey }) {
  const supabase = useRef(getSupabase(url, anonKey)).current;

  const [activeTab, setActiveTab] = useState("projects");
  const [form, setForm] = useState(INITIAL_PROJECT_FORM);
  const [imageFile, setImageFile] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profile, setProfile] = useState(null);
  
  const [fetchLoading, setFetchLoading] = useState(true);
  const [insertLoading, setInsertLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [editMode, setEditMode] = useState(null);

  const pushLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [{ msg, type, time, id: Date.now() }, ...prev].slice(0, 12));
  };

  const fetchData = async () => {
    setFetchLoading(true);
    pushLog("Fetching data from database...", "info");
    
    const { data: projData } = await supabase.from("projects").select("*").order("id", { ascending: false });
    const { data: skillData } = await supabase.from("skills").select("*").order("sort_order", { ascending: true });
    const { data: profData } = await supabase.from("profile").select("*").eq("id", 1).single();
    
    setProjects(projData || []);
    setSkills(skillData || []);
    setProfile(profData || null);

    pushLog(`Data sync complete.`, "ok");
    setFetchLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setImageFile(null);
    setEditMode(null);

    if (tab === "projects") setForm(INITIAL_PROJECT_FORM);
    else if (tab === "skills") setForm(INITIAL_SKILL_FORM);
    else if (tab === "profile") {
      if (profile) {
        setForm({
          bio_en: profile.bio_en || "",
          bio_th: profile.bio_th || "",
          tags: Array.isArray(profile.tags) ? profile.tags.join(", ") : (profile.tags || ""),
          image_url: profile.image_url || "", 
        });
        setEditMode(1);
      } else {
        setForm(INITIAL_PROFILE_FORM);
        setEditMode(1);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    if (activeTab === "profile") {
      handleTabSwitch("profile");
    } else {
      setForm(activeTab === "projects" ? INITIAL_PROJECT_FORM : INITIAL_SKILL_FORM);
      setEditMode(null);
      setImageFile(null);
    }
  };

  const loadForEdit = (item) => {
    if (activeTab === "projects") {
      setForm({
        project_id: item.project_id || "", title: item.title || "", title_th: item.title_th || "",
        category: item.category || "", category_th: item.category_th || "", accent: item.accent || "#00ff88",
        description: item.description || "", description_th: item.description_th || "",
        stack: Array.isArray(item.stack) ? item.stack.join(", ") : (item.stack || ""),
        status: item.status || "DEPLOYED", image_url: item.image_url || "", live_url: item.live_url || ""
      });
    } else if (activeTab === "skills") {
      setForm({
        icon: item.icon || "⬡", title: item.title || "", title_th: item.title_th || "",
        accent: item.accent || "#00ff88", description: item.description || "", description_th: item.description_th || "",
        tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""), sort_order: item.sort_order || 0
      });
    }
    setEditMode(item.id);
    pushLog(`Loaded [${item.title}] into editor.`, "warn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInsertLoading(true);
    let payload = {};

    if (activeTab === "projects") {
      if (!form.title.trim()) { pushLog("Title is required.", "err"); setInsertLoading(false); return; }
      let finalImageUrl = form.image_url;
      if (imageFile) {
        pushLog("Uploading image...", "info");
        const fileExt = imageFile.name.split('.').pop();
        // 🟢 FIX BUG: ล็อกชื่อไฟล์ไว้ก่อนเลย
        const fileName = `proj_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, imageFile);
        if (!uploadError) {
          const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
          finalImageUrl = data.publicUrl;
        }
      }
      payload = {
        project_id: form.project_id.trim(), title: form.title.trim(), title_th: form.title_th.trim(),
        category: form.category.trim(), category_th: form.category_th.trim(), accent: form.accent,
        description: form.description.trim(), description_th: form.description_th.trim(),
        stack: form.stack.split(",").map(s => s.trim()).filter(Boolean),
        status: form.status, image_url: finalImageUrl, live_url: form.live_url.trim(),
      };
    } else if (activeTab === "skills") {
      if (!form.title.trim()) { pushLog("Title is required.", "err"); setInsertLoading(false); return; }
      payload = {
        icon: form.icon.trim(), title: form.title.trim(), title_th: form.title_th.trim(),
        accent: form.accent, description: form.description.trim(), description_th: form.description_th.trim(),
        tags: form.tags.split(",").map(s => s.trim()).filter(Boolean), sort_order: parseInt(form.sort_order) || 0,
      };
    } else if (activeTab === "profile") {
      let finalImageUrl = form.image_url;
      if (imageFile) {
        pushLog("Uploading profile image...", "info");
        const fileExt = imageFile.name.split('.').pop();
        // 🟢 FIX BUG: ล็อกชื่อไฟล์ไว้ในตัวแปรก่อน ไม่ให้มิลลิวินาทีคลาดเคลื่อน
        const fileName = `profile_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, imageFile);
        
        if (!uploadError) {
          const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
          finalImageUrl = data.publicUrl;
        } else {
          pushLog(`UPLOAD ERROR: ${uploadError.message}`, "err");
        }
      }

      payload = {
        id: 1,
        bio_en: form.bio_en.trim(),
        bio_th: form.bio_th.trim(),
        tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
        image_url: finalImageUrl,
      };
    }

    const table = activeTab;
    
    if (activeTab === "profile" || editMode) {
      // 🟢 FIX BUG: ถ้าเป็นการ Edit (ที่ไม่ได้แก้ Profile) ให้แนบ ID เดิมกลับไปด้วย
      if (editMode && activeTab !== "profile") {
        payload.id = editMode;
      }
      
      const { error } = await supabase.from(table).upsert([payload]);
      if (error) pushLog(`UPDATE ERROR: ${error.message}`, "err");
      else { 
        pushLog(`Record updated successfully.`, "ok"); 
        resetForm(); // เพิ่มคำสั่งล้างฟอร์มหลังอัปเดตเสร็จ
        fetchData(); 
      }
    } else {
      const { error } = await supabase.from(table).insert([payload]);
      if (error) pushLog(`INSERT ERROR: ${error.message}`, "err");
      else { pushLog(`Record committed.`, "ok"); resetForm(); fetchData(); }
    }
    setInsertLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error } = await supabase.from(activeTab).delete().eq("id", deleteTarget.id);
    if (!error) { pushLog(`Record removed.`, "ok"); fetchData(); }
    setDeleteLoading(false); setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen relative" style={{ background: "#040404", fontFamily: "'JetBrains Mono', 'Courier New', monospace", color: "#ffffff" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #040404; }
        ::-webkit-scrollbar-thumb { background: #00ff8830; border-radius: 2px; }
        input[type="color"] { -webkit-appearance: none; border: none; cursor: pointer; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }
      `}</style>
      <NoiseOverlay /><GridBg />

      <div className="relative z-20 max-w-screen-xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pb-6 border-b border-green-400/10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs tracking-[0.3em] text-gray-600">SYSTEM</span>
                <div className="h-px w-8 bg-green-400/30" />
                <span className="font-mono text-xs tracking-[0.3em] text-green-400">ADMIN PANEL v5.2</span>
              </div>
              <h1 className="font-mono font-extrabold text-2xl sm:text-3xl text-white">⬡ SYS<span className="text-green-400">_CMD</span></h1>
            </div>
            <button onClick={fetchData} className="font-mono text-xs px-3 py-1.5 rounded border border-white/10 text-gray-400 hover:text-white hover:border-green-400/60 transition-all">↺ SYNC DB</button>
          </div>

          <div className="flex gap-4 border-b border-gray-800/50 pb-px">
            {["projects", "skills", "profile"].map((t) => (
              <button key={t} onClick={() => handleTabSwitch(t)} className={`font-mono text-sm px-6 py-2 transition-all uppercase ${activeTab === t ? "text-green-400 border-b-2 border-green-400" : "text-gray-500 hover:text-gray-300"}`}>
                [ {t === "profile" ? "ABOUT ME" : t} ]
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[460px_1fr] gap-6 items-start">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl overflow-hidden sticky top-4 bg-[#060606]/95 border border-white/10 backdrop-blur-md" style={{ borderColor: editMode ? "rgba(255,170,0,0.3)" : "rgba(0,255,136,0.12)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5" style={{ borderColor: editMode ? "rgba(255,170,0,0.15)" : "rgba(0,255,136,0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: editMode ? "#ffaa00" : "#00ff88" }} />
                <span className="font-mono text-xs tracking-widest uppercase" style={{ color: editMode ? "#ffaa00" : "#00ff88" }}>{activeTab === "profile" ? `// UPDATE PROFILE DATA` : editMode ? `// EDIT ${activeTab}` : `// INSERT ${activeTab}`}</span>
              </div>
              {(editMode && activeTab !== "profile") && <button onClick={resetForm} className="font-mono text-xs text-gray-600 hover:text-gray-400">✕ CANCEL</button>}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* === PROFILE FORM FIELDS === */}
              {activeTab === "profile" && (
                <>
                  <div className="space-y-1.5 mb-2">
                    <label className="block font-mono text-xs tracking-[0.2em] uppercase text-gray-600">Profile Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-mono text-xs text-green-400 cursor-pointer" />
                    {form.image_url && !imageFile && <p className="font-mono text-xs text-green-500 mt-1">✓ Image loaded.</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs tracking-[0.2em] uppercase text-blue-400">Bio [EN]</label>
                    <textarea name="bio_en" value={form.bio_en} onChange={handleChange} rows={5} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-mono text-sm text-white outline-none focus:border-blue-400/50 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs tracking-[0.2em] uppercase text-orange-400">Bio [TH]</label>
                    <textarea name="bio_th" value={form.bio_th} onChange={handleChange} rows={5} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-sans text-sm text-white outline-none focus:border-orange-400/50 resize-none" />
                  </div>
                  <TermInput label="Personality Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange} placeholder="Problem Solver, Tech Enthusiast" />
                </>
              )}

              {/* === PROJECTS & SKILLS FORM FIELDS === */}
              {activeTab !== "profile" && (
                <>
                  {activeTab === "projects" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <TermInput label="Project ID" name="project_id" value={form.project_id} onChange={handleChange} placeholder="proj-01" />
                        <TermInput label="Status" name="status">
                          <select name="status" value={form.status} onChange={handleChange} className="flex-1 bg-transparent font-mono text-sm text-white outline-none cursor-pointer" style={{ color: form.status === "DEPLOYED" ? "#00ff88" : form.status === "ACADEMIC" ? "#00cfff" : "#ffaa00" }}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
                          </select>
                        </TermInput>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <TermInput label="Title (EN)" name="title" value={form.title} onChange={handleChange} />
                        <TermInput label="Title (TH)" name="title_th" value={form.title_th} onChange={handleChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <TermInput label="Category (EN)" name="category" value={form.category} onChange={handleChange} />
                        <TermInput label="Category (TH)" name="category_th" value={form.category_th} onChange={handleChange} />
                      </div>
                    </>
                  )}

                  {activeTab === "skills" && (
                    <>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-1"><TermInput label="Icon" name="icon" value={form.icon} onChange={handleChange} /></div>
                        <div className="col-span-3"><TermInput label="Sort Order" type="number" name="sort_order" value={form.sort_order} onChange={handleChange} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <TermInput label="Title (EN)" name="title" value={form.title} onChange={handleChange} />
                        <TermInput label="Title (TH)" name="title_th" value={form.title_th} onChange={handleChange} />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5 mt-2">
                    <label className="block font-mono text-xs tracking-[0.2em] uppercase text-gray-600">Accent Color</label>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-300" style={{ background: `${form.accent}08`, border: `1px solid ${form.accent}40` }}>
                      <span className="font-mono text-xs shrink-0" style={{ color: form.accent }}>&gt;_</span>
                      <input type="color" name="accent" value={form.accent} onChange={handleChange} className="w-7 h-7 rounded cursor-pointer shrink-0 bg-transparent" />
                      <input type="text" name="accent" value={form.accent} onChange={handleChange} className="flex-1 bg-transparent font-mono text-sm outline-none" style={{ color: form.accent }} maxLength={7} />
                    </div>
                  </div>

                  <div className="space-y-3 mt-2">
                    <div className="space-y-1.5">
                      <label className="block font-mono text-xs tracking-[0.2em] uppercase text-blue-400">Description [EN]</label>
                      <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-mono text-sm text-white outline-none focus:border-blue-400/50 resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-mono text-xs tracking-[0.2em] uppercase text-orange-400">Description [TH]</label>
                      <textarea name="description_th" value={form.description_th} onChange={handleChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-sans text-sm text-white outline-none focus:border-orange-400/50 resize-none" />
                    </div>
                  </div>

                  {activeTab === "projects" && (
                    <>
                      <div className="space-y-1.5 mt-2">
                        <label className="block font-mono text-xs tracking-[0.2em] uppercase text-gray-600">Image Upload</label>
                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 font-mono text-xs text-green-400 cursor-pointer" />
                      </div>
                      <TermInput label="Live URL" name="live_url" value={form.live_url} onChange={handleChange} />
                      <TermInput label="Tech Stack" name="stack" value={form.stack} onChange={handleChange} />
                    </>
                  )}
                  {activeTab === "skills" && <TermInput label="Skill Tags" name="tags" value={form.tags} onChange={handleChange} />}
                </>
              )}

              <motion.button type="submit" disabled={insertLoading} whileHover={{ scale: insertLoading ? 1 : 1.01 }} whileTap={{ scale: insertLoading ? 1 : 0.98 }} className="w-full py-3.5 font-mono font-bold text-sm tracking-[0.2em] rounded-lg mt-4 uppercase" style={{ background: editMode ? "rgba(255,170,0,0.12)" : "rgba(0,255,136,0.1)", border: editMode ? "1px solid rgba(255,170,0,0.5)" : "1px solid rgba(0,255,136,0.5)", color: editMode ? "#ffaa00" : "#00ff88", opacity: insertLoading ? 0.7 : 1 }}>
                {insertLoading ? "PROCESSING..." : activeTab === "profile" ? "⟶ SAVE PROFILE" : editMode ? `⟶ UPDATE` : `⟶ INSERT`}
              </motion.button>
            </form>
          </motion.div>

          <div className="space-y-5 overflow-hidden">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl bg-[#060606]/95 border border-white/10 backdrop-blur-md overflow-hidden min-h-[300px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-mono text-xs tracking-widest uppercase text-cyan-400">// RECORDS: {activeTab}</span>
                </div>
              </div>

              {fetchLoading ? (
                <div className="p-8 text-center"><span className="font-mono text-xs text-gray-600">FETCHING...</span></div>
              ) : activeTab === "profile" ? (
                <div className="p-6 space-y-4">
                  {profile?.image_url && (
                     <div className="p-4 rounded border border-white/10 bg-white/5 flex items-center gap-4">
                       <img src={profile.image_url} alt="Profile" className="w-16 h-16 rounded object-cover" />
                       <div>
                         <span className="text-green-400 text-xs font-mono uppercase tracking-widest block">Avatar Loaded</span>
                         <span className="text-xs text-gray-500 block truncate max-w-xs mt-1">{profile.image_url}</span>
                       </div>
                     </div>
                  )}
                  <div className="p-4 rounded border border-white/10 bg-white/5">
                    <span className="text-blue-400 text-xs font-mono uppercase tracking-widest block mb-2">Current EN Bio:</span>
                    <p className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{profile?.bio_en}</p>
                  </div>
                  <div className="p-4 rounded border border-white/10 bg-white/5">
                    <span className="text-orange-400 text-xs font-mono uppercase tracking-widest block mb-2">Current TH Bio:</span>
                    <p className="font-sans text-sm text-gray-300 whitespace-pre-wrap">{profile?.bio_th}</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="sticky top-0 bg-[#060606] z-10 border-b border-white/5">
                      <tr>
                        {(activeTab === "projects" ? ["ID", "TITLE", "STATUS", "ACTIONS"] : ["ORDER", "ICON", "TITLE", "ACTIONS"]).map((h) => <th key={h} className="px-4 py-3 text-left font-mono text-xs text-gray-500 tracking-widest">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === "projects" ? projects : skills).map((item) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                          {activeTab === "projects" ? (
                            <>
                              <td className="px-4 py-3 font-mono text-xs text-gray-400">{item.project_id}</td>
                              <td className="px-4 py-3 text-sm"><div className="font-bold text-white">{item.title}</div></td>
                              <td className="px-4 py-3"><span className="font-mono text-xs px-2 py-0.5 rounded-full border border-green-500/40 text-green-400">{item.status}</span></td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 font-mono text-xs text-gray-400">{item.sort_order}</td>
                              <td className="px-4 py-3 text-xl" style={{ color: item.accent }}>{item.icon}</td>
                              <td className="px-4 py-3 text-sm"><div className="font-bold text-white">{item.title}</div></td>
                            </>
                          )}
                          <td className="px-4 py-3">
                            <button onClick={() => loadForEdit(item)} className="mr-2 font-mono text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-500">EDIT</button>
                            <button onClick={() => setDeleteTarget(item)} className="font-mono text-xs px-2 py-1 rounded bg-red-500/10 text-red-500">DEL</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#040404]/98 border border-white/5 backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="font-mono text-xs text-gray-600">// LOG</span></div>
              </div>
              <div className="p-4 space-y-1.5 min-h-[120px] max-h-40 overflow-y-auto">
                {logs.length === 0 ? <p className="font-mono text-xs text-gray-800">C:\&gt; Awaiting... <span className="animate-pulse">▌</span></p> : logs.map((log) => <LogLine key={log.id} log={log} />)}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && <TerminateModal target={deleteTarget} table={activeTab} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
      </AnimatePresence>
    </div>
  );
}