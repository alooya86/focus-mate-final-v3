import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, BatteryFull, BatteryMedium, 
  Inbox, Zap, Plus, X, CheckCircle2, Flame, Loader2, Trash2, Pencil, Save, Calendar, Archive,
  Clock, LogOut, LayoutGrid, Mail, ArrowLeft, XCircle, ListTodo, Check, ChevronDown, ChevronUp,
  Layout, FolderKanban, CalendarDays
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "firebase/auth";

// --- CONFIGURATION ---
const API_URL = "https://focus-mate-final-v3.onrender.com"; 
const cn = (...inputs) => twMerge(clsx(inputs));

const firebaseConfig = {
  apiKey: "AIzaSyDuPEPhMgblorhwHjPMV47TTJWWxOefPdU",
  authDomain: "focus-mate-cb99f.firebaseapp.com",
  projectId: "focus-mate-cb99f",
  storageBucket: "focus-mate-cb99f.firebasestorage.app",
  messagingSenderId: "174603807809",
  appId: "1:174603807809:web:52b7ba205b56e277b5eac0"
};
// ------------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e, method) => {
    if (e) e.preventDefault();
    setAuthError("");
    try {
      if (method === 'google') await signInWithPopup(auth, googleProvider);
      else if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err) { setAuthError(err.message.replace("Firebase: ", "")); }
  };

  if (loadingAuth) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-block bg-indigo-50 p-4 rounded-2xl mb-4"><LayoutGrid className="w-10 h-10 text-indigo-600" /></div>
            <h1 className="text-3xl font-black text-slate-900 mb-2"><span className="text-indigo-500">ADHD </span>Focus Mate</h1>
            <p className="text-slate-500">Sign in to organize your brain.</p>
          </div>
          <button onClick={(e) => handleAuth(e, 'google')} className="w-full bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-2 mb-6">
            <Mail className="w-4 h-4" /> Continue with Google
          </button>
          <form onSubmit={(e) => handleAuth(e, 'email')} className="space-y-4">
            {authError && <div className="text-red-500 text-sm">{authError}</div>}
            <input type="email" placeholder="Email" className="w-full p-4 border rounded-xl" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="w-full p-4 border rounded-xl" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700">
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-slate-400 font-bold hover:text-slate-600">
             {isSignUp ? "Login instead" : "Create account"}
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} onLogout={() => signOut(auth)} />;
}

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => { refreshTasks(); }, [user.uid]);

  const refreshTasks = () => {
    axios.get(`${API_URL}/tasks`, { headers: { "x-user-id": user.uid } })
      .then((res) => { setTasks(res.data); })
      .catch((err) => console.error(err));
  };

  const goToProject = (projectName) => {
    setSelectedProject(projectName);
    setActiveTab("dashboard");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 pb-48">
      {/* HEADER (Restored Original) */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900"><span className="text-indigo-500">ADHD</span> Focus Mate<span className="text-indigo-500">.</span></h1>
          <p className="text-slate-500 text-sm">Hello, {user.email}</p>
        </div>
        <button onClick={onLogout} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
          <LogOut size={20} />
        </button>
      </div>

      {/* --- NEW: NAVIGATION TABS --- */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
        <TabButton active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setSelectedProject(null); }} icon={Layout} label="Dashboard" />
        <TabButton active={activeTab === "projects"} onClick={() => setActiveTab("projects")} icon={FolderKanban} label="Projects" />
        <TabButton active={activeTab === "agenda"} onClick={() => setActiveTab("agenda")} icon={CalendarDays} label="Agenda" />
      </div>

      {/* --- CONTENT AREA --- */}
      {activeTab === "dashboard" && (
         <DashboardView 
             user={user} 
             tasks={tasks} 
             refreshTasks={refreshTasks} 
             filterProject={selectedProject} 
             setFilterProject={setSelectedProject}
         />
      )}
      {activeTab === "projects" && (
         <ProjectsListView 
             tasks={tasks} 
             onSelectProject={goToProject}
         />
      )}
      {activeTab === "agenda" && (
         <AgendaView user={user} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all",
                active ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
        >
            <Icon size={16} /> {label}
        </button>
    )
}

// --- VIEW 1: DASHBOARD ---
function DashboardView({ user, tasks, refreshTasks, filterProject, setFilterProject }) {
  const [formData, setFormData] = useState({ content: "", project: "", energy: "medium", isUrgent: false, dueDate: "", step: "" });
  const [focusMode, setFocusMode] = useState({ isOpen: false, mode: "ready" });

  const handleAdd = (e, asSomeday = false) => {
    if (e) e.preventDefault();
    if (!formData.content.trim()) return;
    const finalProject = filterProject || formData.project;
    const payload = { ...formData, project: finalProject, isSomeday: asSomeday, step: formData.step ? parseInt(formData.step) : null, subtasks: [] };
    
    axios.post(`${API_URL}/tasks`, payload, { headers: { "x-user-id": user.uid } })
      .then(() => {
        refreshTasks();
        setFormData({ ...formData, content: "", isUrgent: false, dueDate: "", step: "", project: filterProject ? "" : formData.project });
      });
  };

  const handleDelete = (id) => { if(confirm("Delete task?")) axios.delete(`${API_URL}/tasks/${id}`, { headers: { "x-user-id": user.uid } }).then(refreshTasks); };
  const handleUpdate = (task) => { axios.put(`${API_URL}/tasks/${task.id}`, task, { headers: { "x-user-id": user.uid } }).then(refreshTasks); };

  const visibleTasks = useMemo(() => {
    let pool = tasks.filter((t) => !t.isCompleted && !t.isSomeday);
    if (filterProject) return pool.filter(t => t.project === filterProject).sort((a, b) => (a.step || 999) - (b.step || 999));
    return pool.sort((a, b) => {
        if (a.dueDate && !b.dueDate) return -1; 
        if (!a.dueDate && b.dueDate) return 1;
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        if (a.project === b.project) return (a.step || 999) - (b.step || 999);
        return 0;
    });
  }, [tasks, filterProject]);
  
  const somedayTasks = tasks.filter((t) => !t.isCompleted && t.isSomeday);

  const projectStats = useMemo(() => {
    if (!filterProject) return null;
    const projectTasks = tasks.filter(t => t.project === filterProject);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.isCompleted).length;
    return { total, completed, progress: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [tasks, filterProject]);

  return (
    <div>
       {filterProject && (
         <div className="mb-6 animate-in slide-in-from-right-4">
             <button onClick={() => setFilterProject(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-4 text-sm"><ArrowLeft size={16} /> Back to Dashboard</button>
             <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <h1 className="text-3xl font-black mb-4">{filterProject}</h1>
                <div className="bg-black/20 h-3 rounded-full overflow-hidden mb-2">
                    <div className="bg-white h-full transition-all duration-1000" style={{ width: `${projectStats.progress}%` }} />
                </div>
                <div className="text-indigo-100 text-sm font-bold">{projectStats.progress}% Complete</div>
             </div>
         </div>
       )}

       {!filterProject && (
       <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-50 p-2 rounded-xl"><Flame className="text-indigo-600 w-5 h-5" /></div>
                <h2 className="text-xl font-bold text-slate-900">Brain Dump</h2>
            </div>
            <form onSubmit={(e) => handleAdd(e, false)}>
                <input 
                    className="w-full text-lg font-medium outline-none placeholder:text-slate-300 mb-4" 
                    placeholder="What needs to be done?"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                />
                <div className="flex gap-2">
                    <input className="bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold w-1/3" placeholder="Project Name" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} />
                    <input type="date" className="bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold uppercase text-slate-500" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                    <button type="submit" className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"><Plus size={18}/></button>
                    <button type="button" onClick={(e) => handleAdd(e, true)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg font-bold"><Archive size={18}/></button>
                </div>
            </form>
       </div>
       )}

       {filterProject && (
           <form onSubmit={(e) => handleAdd(e, false)} className="mb-6 flex gap-2">
            <input className="flex-1 p-4 border border-slate-200 rounded-xl outline-none" placeholder={`Add step to ${filterProject}...`} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} autoFocus />
            <input type="number" min="1" className="w-20 p-4 border border-slate-200 rounded-xl outline-none" placeholder="#" value={formData.step} onChange={e => setFormData({...formData, step: e.target.value})} />
            <button type="submit" className="bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700"><Plus /></button>
          </form>
       )}

       <div className="space-y-4">
          <AnimatePresence>
            {visibleTasks.map(task => (
                <TaskCard key={task.id} task={task} onDelete={() => handleDelete(task.id)} onUpdate={handleUpdate} onProjectClick={(p) => setFilterProject(p)} />
            ))}
          </AnimatePresence>
          {visibleTasks.length === 0 && <div className="text-center py-10 text-slate-400 font-bold">No active tasks</div>}
       </div>

       {!filterProject && somedayTasks.length > 0 && (
          <div className="mt-12 opacity-60">
             <h3 className="font-bold text-slate-400 mb-4 uppercase text-xs tracking-widest">Someday</h3>
             <div className="space-y-4">
                {somedayTasks.map(task => (
                    <TaskCard key={task.id} task={task} onDelete={() => handleDelete(task.id)} onUpdate={handleUpdate} onProjectClick={(p) => setFilterProject(p)} />
                ))}
             </div>
          </div>
       )}

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pointer-events-none">
            <div className="max-w-3xl mx-auto flex gap-4 pointer-events-auto">
            <button onClick={() => setFocusMode({ isOpen: true, mode: "tired" })} className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-4 rounded-2xl flex flex-col items-center gap-1 transition-transform hover:-translate-y-1 shadow-lg shadow-emerald-900/10">
                <div className="flex items-center gap-2 font-bold text-lg"><Battery className="w-5 h-5" /> I'm Tired</div>
                <span className="text-xs opacity-75 font-medium">Low Energy Mode</span>
            </button>
            <button onClick={() => setFocusMode({ isOpen: true, mode: "ready" })} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl flex flex-col items-center gap-1 transition-transform hover:-translate-y-1 shadow-xl shadow-slate-900/20">
                <div className="flex items-center gap-2 font-bold text-lg"><Zap className="w-5 h-5" /> I'm Ready</div>
                <span className="text-xs text-slate-400 font-medium">Normal / High Energy</span>
            </button>
            </div>
        </div>
        
        <FocusOverlay isOpen={focusMode.isOpen} onClose={() => setFocusMode({...focusMode, isOpen: false})} tasks={tasks} mode={focusMode.mode} onComplete={(t) => handleUpdate({...t, isCompleted: true})} />
    </div>
  );
}

// --- VIEW 2: PROJECTS GALLERY ---
function ProjectsListView({ tasks, onSelectProject }) {
    const projects = useMemo(() => {
        const map = {};
        tasks.forEach(t => {
            if (!t.project) return;
            if (!map[t.project]) map[t.project] = { name: t.project, total: 0, completed: 0 };
            map[t.project].total++;
            if (t.isCompleted) map[t.project].completed++;
        });
        return Object.values(map);
    }, [tasks]);

    const handleCreate = () => {
        const name = prompt("Enter new project name:");
        if (name && name.trim()) {
            // Switch to project view immediately for this new name
            onSelectProject(name.trim());
        }
    };

    return (
        <div className="pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NEW PROJECT BUTTON */}
                <button 
                    onClick={handleCreate}
                    className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all group min-h-[160px]"
                >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Create New Project</span>
                </button>

                {/* EXISTING PROJECTS */}
                {projects.map(p => {
                    const progress = Math.round((p.completed / p.total) * 100);
                    return (
                        <button key={p.name} onClick={() => onSelectProject(p.name)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group min-h-[160px] flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-indigo-600 truncate">{p.name}</h3>
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                    <span>{progress}% Done</span>
                                    <span>{p.completed}/{p.total} Tasks</span>
                                </div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// --- VIEW 3: AGENDA (UPDATED WITH DATE) ---
function AgendaView({ user }) {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ time: "", content: "", date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        axios.get(`${API_URL}/agenda`, { headers: { "x-user-id": user.uid } }).then(res => setItems(res.data));
    }, [user.uid]);

    const handleAdd = (e) => {
        e.preventDefault();
        if(!newItem.content) return;
        const payload = { content: newItem.content, time_slot: newItem.time, date: newItem.date, isCompleted: false };
        axios.post(`${API_URL}/agenda`, payload, { headers: { "x-user-id": user.uid } }).then(res => { setItems([...items, res.data]); setNewItem({ ...newItem, content: "", time: "" }); });
    };

    const toggleItem = (item) => {
        const updated = { ...item, isCompleted: !item.isCompleted };
        axios.put(`${API_URL}/agenda/${item.id}`, updated, { headers: { "x-user-id": user.uid } });
        setItems(items.map(i => i.id === item.id ? updated : i));
    };

    const deleteItem = (id) => {
        axios.delete(`${API_URL}/agenda/${id}`, { headers: { "x-user-id": user.uid } });
        setItems(items.filter(i => i.id !== id));
    };

    // Simple Sort: Date then Time
    const sortedItems = [...items].sort((a, b) => {
        if (a.date !== b.date) return (a.date || "").localeCompare(b.date || "");
        return (a.time_slot || "").localeCompare(b.time_slot || "");
    });

    return (
        <div className="pb-32">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2">
                    <input type="date" className="p-3 bg-slate-50 rounded-lg font-bold text-sm text-slate-500" value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} />
                    <input className="w-full md:w-24 p-3 bg-slate-50 rounded-lg font-bold text-sm" placeholder="9:00" value={newItem.time} onChange={e => setNewItem({...newItem, time: e.target.value})} />
                    <input className="flex-1 p-3 bg-slate-50 rounded-lg font-bold text-sm" placeholder="Meeting / Focus Block" value={newItem.content} onChange={e => setNewItem({...newItem, content: e.target.value})} />
                    <button type="submit" className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"><Plus size={20}/></button>
                </form>
            </div>
            <div className="space-y-3">
                {sortedItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 group">
                        <div className="text-right">
                             <div className="text-xs font-bold text-slate-400">{item.date}</div>
                             <div className="text-sm font-bold text-slate-600">{item.time_slot}</div>
                        </div>
                        <div className={cn("flex-1 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm", item.isCompleted && "opacity-50")}>
                            <button onClick={() => toggleItem(item)} className={cn("w-5 h-5 border-2 rounded-full flex items-center justify-center", item.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300")}>
                                {item.isCompleted && <Check size={12} />}
                            </button>
                            <span className={cn("font-bold text-slate-700", item.isCompleted && "line-through")}>{item.content}</span>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TaskCard({ task, onDelete, onUpdate, onProjectClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(task);
  const [newSubtask, setNewSubtask] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(false);

  const handleSave = () => { onUpdate(editData); setIsEditing(false); };
  
  const addSubtask = (e) => {
    e.preventDefault();
    if(!newSubtask.trim()) return;
    const newItem = { id: crypto.randomUUID(), content: newSubtask, isCompleted: false };
    const updated = { ...task, subtasks: [...(task.subtasks || []), newItem] };
    onUpdate(updated);
    setNewSubtask("");
    setShowSubtasks(true);
  };

  const toggleSubtask = (subId) => {
    const updatedSub = task.subtasks.map(s => s.id === subId ? {...s, isCompleted: !s.isCompleted} : s);
    onUpdate({ ...task, subtasks: updatedSub });
  };

  const deleteSubtask = (subId) => {
    const updatedSub = task.subtasks.filter(s => s.id !== subId);
    onUpdate({ ...task, subtasks: updatedSub });
  };

  const getPillStyle = (energy) => {
    if (energy === 'high') return "bg-rose-100 text-rose-700";
    if (energy === 'medium') return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };
  const getIcon = (energy) => {
     if (energy === 'high') return <BatteryFull size={14} />;
     if (energy === 'medium') return <BatteryMedium size={14} />;
     return <Battery size={14} />;
  };
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date().setHours(0,0,0,0);
  const subtasks = task.subtasks || [];
  const completedSub = subtasks.filter(s => s.isCompleted).length;

  if (isEditing) {
     return (
       <div className="bg-white p-5 rounded-2xl border-2 border-indigo-500 shadow-md space-y-4">
         <div className="relative">
            <input className="w-full text-lg font-bold border-b border-slate-200 focus:outline-none pb-2 pr-8" value={editData.content} onChange={e => setEditData({...editData, content: e.target.value})} autoFocus />
            <button onClick={() => setIsEditing(false)} className="absolute right-0 top-0 text-slate-300 hover:text-rose-500"><XCircle size={18} /></button>
         </div>
         <div className="flex gap-4">
           <input type="date" className="w-full p-2 border rounded" value={editData.dueDate || ""} onChange={e => setEditData({...editData, dueDate: e.target.value})} />
           <input type="number" min="1" className="w-24 p-2 border rounded" placeholder="#" value={editData.step || ""} onChange={e => setEditData({...editData, step: parseInt(e.target.value)})} />
         </div>
         <div className="flex justify-end gap-2">
           <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-2"><Save size={16}/> Save</button>
         </div>
       </div>
     )
  }

  return (
    <motion.div layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
      <div className="flex items-start gap-4">
        <button 
            onClick={() => { confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } }); onUpdate({...task, isCompleted: true}); }}
            className="mt-1 w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent hover:text-emerald-500 flex items-center justify-center transition-all flex-shrink-0 group/check"
        >
            <Check size={14} strokeWidth={3} className="scale-0 group-hover/check:scale-100 transition-transform" />
        </button>

        <div className="flex-1 min-w-0">
            <h3 className={cn("font-bold text-slate-800 text-lg leading-tight mb-2 break-words", task.isSomeday && "text-slate-500")}>{task.content}</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
                {task.isUrgent && <div className="p-1 bg-rose-50 rounded-full"><Zap className="w-3 h-3 text-rose-500 fill-rose-500" /></div>}
                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", getPillStyle(task.energy))}>
                    {getIcon(task.energy)} {task.energy}
                </div>
                {task.project && (
                    <button onClick={() => onProjectClick(task.project)} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer">
                        {task.project} {task.step ? `(#${task.step})` : ""}
                    </button>
                )}
                {task.dueDate && (
                    <div className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border", isOverdue ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-500 border-slate-200")}>
                        <Clock size={12} /> {task.dueDate}
                    </div>
                )}
            </div>

            {subtasks.length > 0 && (
                <div className="flex items-center gap-2 mt-3 cursor-pointer" onClick={() => setShowSubtasks(!showSubtasks)}>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(completedSub / subtasks.length) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{completedSub}/{subtasks.length}</span>
                    {showSubtasks ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                </div>
            )}
            
            <AnimatePresence>
                {showSubtasks && (
                    <motion.div initial={{height: 0, opacity:0}} animate={{height: "auto", opacity:1}} exit={{height: 0, opacity:0}} className="overflow-hidden">
                        <div className="pt-3 space-y-2">
                            {subtasks.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2 group/sub">
                                    <button onClick={() => toggleSubtask(sub.id)} className={cn("w-4 h-4 border rounded flex items-center justify-center transition-colors", sub.isCompleted ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-300 bg-white")}>
                                        {sub.isCompleted && <Check size={10} />}
                                    </button>
                                    <span className={cn("text-sm flex-1", sub.isCompleted ? "text-slate-400 line-through" : "text-slate-700")}>{sub.content}</span>
                                    <button onClick={() => deleteSubtask(sub.id)} className="opacity-0 group-hover/sub:opacity-100 text-slate-300 hover:text-rose-500"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={addSubtask} className="mt-3 flex items-center gap-2 opacity-50 focus-within:opacity-100 transition-opacity">
                <Plus size={14} className="text-slate-400" />
                <input className="bg-transparent text-sm placeholder:text-slate-400 focus:outline-none w-full" placeholder="Add a subtask..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} />
            </form>
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={18} /></button>
            <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
        </div>
      </div>
    </motion.div>
  );
}

function FocusOverlay({ isOpen, onClose, tasks, mode, onComplete }) {
  const [activeTask, setActiveTask] = useState(null);
  useEffect(() => { if (isOpen) selectTask(); }, [isOpen]);
  const selectTask = () => {
    let pool = tasks.filter(t => !t.isCompleted && !t.isSomeday);
    if(mode === "tired") pool = pool.filter(t => t.energy === "low");
    else pool = pool.filter(t => ["medium", "high"].includes(t.energy));
    if(pool.length === 0) { setActiveTask(null); return; }
    const urgent = pool.filter(t => t.isUrgent);
    setActiveTask(urgent.length > 0 ? urgent[Math.floor(Math.random() * urgent.length)] : pool[Math.floor(Math.random() * pool.length)]);
  };
  const handleDone = () => {
    if(!activeTask) return;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    onComplete(activeTask);
    setTimeout(onClose, 1500);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center relative">
        <button onClick={onClose} className="absolute -top-12 right-0 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X /></button>
        {!activeTask ? (
           <div className="py-10"><div className="text-6xl mb-4">😌</div><h2 className="text-3xl font-black text-slate-800">You're free!</h2><p className="text-slate-500">No tasks match this energy.</p></div>
        ) : (
          <motion.div initial={{scale:0.95}} animate={{scale:1}} className="space-y-6">
            <h1 className="text-4xl font-black text-slate-900 leading-tight">{activeTask.content}</h1>
            <div className="pt-8">
              <button onClick={handleDone} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-2xl font-bold flex items-center justify-center gap-3"><CheckCircle2 size={32} /> Mark Done</button>
              <button onClick={onClose} className="mt-4 text-slate-400 font-bold">Skip</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}