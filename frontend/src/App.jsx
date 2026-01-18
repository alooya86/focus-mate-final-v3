
import { useState, useEffect } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, BatteryCharging, BatteryFull, BatteryMedium, 
  Inbox, Zap, Plus, X, CheckCircle2, Flame, Loader2, Trash2, Pencil, Save, Calendar, Archive,
  Clock, LogOut, LayoutGrid, Mail
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- LOGIN HANDLERS ---
  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (err) { setAuthError(err.message); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loadingAuth) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          
          <div className="text-center mb-8">
            <div className="inline-block bg-indigo-50 p-4 rounded-2xl mb-4">
              <LayoutGrid className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2"><span className="text-indigo-500">ADHD </span>Focus Mate</h1>
            <p className="text-slate-500">Sign in to sync your tasks.</p>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or use email</span></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{authError}</div>}
            
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  return <Dashboard user={user} onLogout={handleLogout} />;
}

// --- DASHBOARD COMPONENT ---
function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [focusMode, setFocusMode] = useState({ isOpen: false, mode: "ready" });
  
  const [formData, setFormData] = useState({
    content: "", project: "", energy: "medium", isUrgent: false, 
    dueDate: "", step: "" 
  });

  // Fetch Data using Firebase UID
  useEffect(() => {
    refreshTasks();
  }, [user.uid]);

  const refreshTasks = () => {
    axios.get(`${API_URL}/tasks`, { headers: { "x-user-id": user.uid } })
      .then((res) => { setTasks(res.data); setIsLoading(false); })
      .catch((err) => console.error(err));
  };

  const handleAdd = (e, asSomeday = false) => {
    if (e) e.preventDefault();
    if (!formData.content.trim()) return;

    const payload = { 
      ...formData, 
      isSomeday: asSomeday,
      step: formData.step ? parseInt(formData.step) : null
    };

    axios.post(`${API_URL}/tasks`, payload, { headers: { "x-user-id": user.uid } })
      .then(() => {
        refreshTasks();
        setFormData({ ...formData, content: "", isUrgent: false, dueDate: "", step: "" });
      });
  };

  const handleDelete = (taskId) => {
    if(!confirm("Delete this task?")) return;
    axios.delete(`${API_URL}/tasks/${taskId}`, { headers: { "x-user-id": user.uid } })
      .then(refreshTasks);
  };

  const handleEdit = (updatedTask) => {
    axios.put(`${API_URL}/tasks/${updatedTask.id}`, updatedTask, { headers: { "x-user-id": user.uid } })
      .then(refreshTasks);
  };

  const handleComplete = (task) => {
    axios.put(`${API_URL}/tasks/${task.id}`, { ...task, isCompleted: true }, { headers: { "x-user-id": user.uid } })
      .then(refreshTasks);
  };

  const pendingTasks = tasks
    .filter((t) => !t.isCompleted && !t.isSomeday)
    .sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.project === b.project && a.project) return (a.step || 999) - (b.step || 999);
      return 0;
    });

  const somedayTasks = tasks.filter((t) => !t.isCompleted && t.isSomeday);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 pb-48">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 mt-4">
        <div className="text-left">
          <h1 className="text-2xl font-black text-slate-900">
  <span className="text-indigo-500">ADHD</span> Focus Mate
  <span className="text-indigo-500">.</span>
</h1>
          <p className="text-slate-500 text-sm">Hello, {user.email}</p>
        </div>
        <button onClick={onLogout} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
          <LogOut size={20} />
        </button>
      </div>

      {/* BRAIN DUMP */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-2.5 rounded-xl"><Flame className="text-indigo-600 w-6 h-6" /></div>
          <h2 className="text-2xl font-bold text-slate-900">Brain Dump</h2>
        </div>

        <form onSubmit={(e) => handleAdd(e, false)} className="space-y-6">
          <input className="w-full p-4 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder="What's weighing on your mind?" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} autoFocus />

          <div className="flex flex-col md:flex-row gap-4">
             <input className="flex-[2] p-4 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder="Project Name (Optional)" value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} />
             <input type="number" min="1" className="flex-1 p-4 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder="Step #" value={formData.step} onChange={(e) => setFormData({...formData, step: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Due Date</label>
              <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-white h-[60px]">
                <Calendar className="text-slate-400 ml-2" />
                <input type="date" className="w-full outline-none text-slate-600 font-medium bg-transparent uppercase" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Priority Level</label>
               <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white h-[60px]">
                 <div className="flex items-center gap-3">
                   <Zap className={cn("w-5 h-5 ml-2", formData.isUrgent ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                   <span className="font-bold text-slate-700">Urgent?</span>
                 </div>
                 <button type="button" onClick={() => setFormData({...formData, isUrgent: !formData.isUrgent})} className={cn("w-12 h-7 rounded-full transition-colors relative", formData.isUrgent ? "bg-slate-900" : "bg-slate-200")}>
                   <div className={cn("w-5 h-5 bg-white rounded-full absolute top-1 transition-transform", formData.isUrgent ? "left-6" : "left-1")} />
                 </button>
               </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Energy Required</label>
            <div className="flex gap-2">
              {[
                { id: "low", label: "LOW", icon: Battery, activeClass: "bg-emerald-100 border-emerald-400 text-emerald-800 ring-2 ring-emerald-200" },
                { id: "medium", label: "MED", icon: BatteryMedium, activeClass: "bg-amber-100 border-amber-400 text-amber-800 ring-2 ring-amber-200" },
                { id: "high", label: "HIGH", icon: BatteryFull, activeClass: "bg-rose-100 border-rose-400 text-rose-800 ring-2 ring-rose-200" }
              ].map((opt) => (
                <button key={opt.id} type="button" onClick={() => setFormData({...formData, energy: opt.id})} className={cn("flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all", formData.energy === opt.id ? opt.activeClass : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50")}>
                  <opt.icon size={20} />
                  <span className="text-[10px] font-bold tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button type="submit" className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-slate-800 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"><Plus size={20} /> Add to Bucket</button>
            <button type="button" onClick={(e) => handleAdd(e, true)} className="w-full bg-slate-100 text-slate-500 font-bold text-lg py-3 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center justify-center gap-2"><Archive size={20} /> Move to Someday</button>
          </div>
        </form>
      </div>

      {/* LIST HEADER */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="bg-indigo-100 p-2 rounded-lg"><Inbox className="w-5 h-5 text-indigo-600" /></div>
        <h2 className="text-2xl font-bold text-slate-900">Your Bucket</h2>
        <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">{pendingTasks.length}</span>
      </div>

      {/* TASK LIST */}
      <div className="space-y-4">
        <AnimatePresence>
          {pendingTasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={() => handleDelete(task.id)} onEdit={handleEdit} />
          ))}
        </AnimatePresence>
        
        {pendingTasks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
             <div className="text-4xl mb-2">🎉</div>
             <p className="text-slate-400 font-medium">All caught up!</p>
          </div>
        )}
      </div>

      {/* SOMEDAY SECTION */}
      {somedayTasks.length > 0 && (
        <div className="mt-12 pt-12 border-t border-slate-200 opacity-60 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-3 mb-6 px-2">
             <div className="bg-slate-100 p-2 rounded-lg"><Archive className="w-5 h-5 text-slate-500" /></div>
             <h2 className="text-2xl font-bold text-slate-700">Someday / Maybe</h2>
           </div>
           <div className="space-y-4">
             {somedayTasks.map((task) => (
               <TaskCard key={task.id} task={task} onDelete={() => handleDelete(task.id)} onEdit={handleEdit} />
             ))}
           </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pt-12">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button onClick={() => setFocusMode({ isOpen: true, mode: "tired" })} className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-4 rounded-2xl flex flex-col items-center gap-1 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-2 font-bold text-lg"><Battery className="w-5 h-5" /> I'm Tired</div>
            <span className="text-xs opacity-75 font-medium">Low Energy Mode</span>
          </button>
          <button onClick={() => setFocusMode({ isOpen: true, mode: "ready" })} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl flex flex-col items-center gap-1 transition-transform hover:-translate-y-1 shadow-xl shadow-slate-900/20">
             <div className="flex items-center gap-2 font-bold text-lg"><Zap className="w-5 h-5" /> I'm Ready</div>
            <span className="text-xs text-slate-400 font-medium">Normal / High Energy</span>
          </button>
        </div>
      </div>

      <FocusOverlay isOpen={focusMode.isOpen} onClose={() => setFocusMode({...focusMode, isOpen: false})} tasks={tasks} mode={focusMode.mode} onComplete={handleComplete} />
    </div>
  );
}

// --- SUB COMPONENTS ---

function TaskCard({ task, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(task);

  const handleSave = () => { onEdit(editData); setIsEditing(false); };
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

  if (isEditing) {
     return (
       <div className="bg-white p-5 rounded-2xl border-2 border-indigo-500 shadow-md space-y-4">
         <input className="w-full text-lg font-bold border-b border-slate-200 focus:outline-none pb-2" value={editData.content} onChange={e => setEditData({...editData, content: e.target.value})} autoFocus />
         <div className="flex gap-4">
           <div className="flex-1">
             <label className="text-xs font-bold text-slate-400 uppercase">Due Date</label>
             <input type="date" className="w-full p-2 border rounded" value={editData.dueDate || ""} onChange={e => setEditData({...editData, dueDate: e.target.value})} />
           </div>
           <div className="w-24">
             <label className="text-xs font-bold text-slate-400 uppercase">Step</label>
             <input type="number" min="1" className="w-full p-2 border rounded" placeholder="#" value={editData.step || ""} onChange={e => setEditData({...editData, step: parseInt(e.target.value)})} />
           </div>
         </div>
         <div className="flex flex-wrap gap-2">
           {['low', 'medium', 'high'].map(lvl => (
             <button key={lvl} onClick={() => setEditData({...editData, energy: lvl})} className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase border", editData.energy === lvl ? getPillStyle(lvl) + " border-transparent" : "bg-white border-slate-200 text-slate-400")}>{lvl}</button>
           ))}
           <button onClick={() => setEditData({...editData, isUrgent: !editData.isUrgent})} className={cn("px-3 py-1 rounded-full text-xs font-bold border", editData.isUrgent ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-400")}>Urgent</button>
           <button onClick={() => setEditData({...editData, isSomeday: !editData.isSomeday})} className={cn("px-3 py-1 rounded-full text-xs font-bold border", editData.isSomeday ? "bg-indigo-500 text-white border-indigo-500" : "bg-white text-slate-400")}>Someday</button>
         </div>
         <div className="flex justify-end gap-2">
           <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-400 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
           <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-2"><Save size={16}/> Save</button>
         </div>
       </div>
     )
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date().setHours(0,0,0,0);
  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <motion.div layout initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 group hover:border-indigo-200 transition-all">
      <div className={cn("mt-1 p-2 rounded-full", task.isUrgent ? "bg-rose-50" : "bg-slate-50")}>
        {task.isUrgent ? <Zap className="w-5 h-5 text-rose-500 fill-rose-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 break-words">{task.content}</h3>
        <div className="flex flex-wrap gap-2">
           <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", getPillStyle(task.energy))}>
             {getIcon(task.energy)} {task.energy} Energy
           </div>
           {task.project && (
             <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
               {task.project} {task.step ? `(Step ${task.step})` : ""}
             </div>
           )}
           {task.dueDate && (
             <div className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border", isOverdue ? "bg-red-50 text-red-600 border-red-200" : isToday ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-500 border-slate-200")}>
               <Clock size={12} /> {task.dueDate}
             </div>
           )}
        </div>
      </div>
      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={20} /></button>
        <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={20} /></button>
      </div>
    </motion.div>
  );
}

function FocusOverlay({ isOpen, onClose, tasks, mode, onComplete }) {
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => { if (isOpen) selectTask(); }, [isOpen]);

  const selectTask = () => {
    let pool = tasks.filter(t => !t.isCompleted && !t.isSomeday);
    
    // Sequence Logic
    const projectMinSteps = {};
    pool.forEach(t => {
      if (t.project && t.step) {
        if (!projectMinSteps[t.project] || t.step < projectMinSteps[t.project]) {
          projectMinSteps[t.project] = t.step;
        }
      }
    });

    pool = pool.filter(t => {
      if (t.project && t.step) return t.step <= projectMinSteps[t.project];
      return true;
    });

    pool = mode === "tired" 
      ? pool.filter(t => t.energy === "low") 
      : pool.filter(t => ["medium", "high"].includes(t.energy));

    if (pool.length === 0) { setActiveTask(null); return; }
    
    const urgent = pool.filter(t => t.isUrgent || (t.dueDate && new Date(t.dueDate) < new Date()));
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
           <div className="py-10">
             <div className="text-6xl mb-4">😌</div>
             <h2 className="text-3xl font-black text-slate-800 mb-2">You're free!</h2>
             <p className="text-slate-500">No actionable tasks match this energy level.</p>
           </div>
        ) : (
          <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="space-y-6">
            <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold tracking-widest text-slate-500 uppercase">
                 {activeTask.project ? `${activeTask.project} ${activeTask.step ? `(Step ${activeTask.step})` : ""}` : "Single Task"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">{activeTask.content}</h1>
            <div className="flex justify-center gap-2">
               {activeTask.isUrgent && <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full font-bold text-sm">🔥 Urgent</span>}
               <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-sm uppercase">{activeTask.energy} Energy</span>
            </div>
            {activeTask.dueDate && <div className="text-slate-500 font-bold uppercase text-xs">Target: {activeTask.dueDate}</div>}
            <div className="pt-8">
              <button onClick={handleDone} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-2xl font-bold shadow-xl shadow-emerald-500/30 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"><CheckCircle2 size={32} /> Mark Done</button>
              <button onClick={onClose} className="mt-4 text-slate-400 hover:text-slate-600 font-bold text-sm">Skip for now</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}