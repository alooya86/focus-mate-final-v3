import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, BatteryFull, BatteryMedium, 
  Zap, Plus, X, CheckCircle2, Flame, Loader2, Trash2, Pencil, Save, Calendar, Archive,
  Clock, LogOut, LayoutGrid, Mail, ArrowLeft, XCircle, Check, ChevronDown, ChevronUp,
  Layout, FolderKanban, CalendarDays, Globe
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "firebase/auth";

// --- I18N IMPORTS ---
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// --- CONFIGURATION ---
const API_URL = "https://focus-mate-final-v3.onrender.com"; 
const cn = (...inputs) => twMerge(clsx(inputs));

// --- I18N CONFIGURATION (4 LANGUAGES) ---
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          dashboard: "Dashboard",
          projects: "Projects",
          agenda: "Agenda",
          brainDump: "Brain Dump",
          whatToDo: "What needs to be done?",
          projName: "Project Name (Optional)",
          step: "Step #",
          targetDate: "Target Date",
          priority: "Priority Level",
          urgent: "Urgent?",
          energy: "Energy Required",
          addBucket: "Add to Bucket",
          moveSomeday: "Move to Someday",
          addToAgenda: "Add to Agenda also?",
          today: "Today",
          upcoming: "Upcoming / Past",
          logout: "Logout",
          welcome: "Hello",
          low: "LOW", med: "MED", high: "HIGH",
          imTired: "I'm Tired",
          imReady: "I'm Ready",
          createProject: "Create New Project"
        }
      },
      es: {
        translation: {
          dashboard: "Tablero",
          projects: "Proyectos",
          agenda: "Agenda",
          brainDump: "Vaciado Mental",
          whatToDo: "¿Qué necesitas hacer?",
          projName: "Nombre del Proyecto (Opcional)",
          step: "Paso #",
          targetDate: "Fecha Objetivo",
          priority: "Nivel de Prioridad",
          urgent: "¿Urgente?",
          energy: "Energía Requerida",
          addBucket: "Añadir a la Cubeta",
          moveSomeday: "Mover a Algún Día",
          addToAgenda: "¿Añadir a la Agenda?",
          today: "Hoy",
          upcoming: "Próximos / Pasados",
          logout: "Cerrar Sesión",
          welcome: "Hola",
          low: "BAJA", med: "MEDIA", high: "ALTA",
          imTired: "Estoy Cansado",
          imReady: "Estoy Listo",
          createProject: "Crear Proyecto"
        }
      },
      fr: {
        translation: {
          dashboard: "Tableau de bord",
          projects: "Projets",
          agenda: "Agenda",
          brainDump: "Vidage de tête",
          whatToDo: "Que faut-il faire ?",
          projName: "Nom du projet (Optionnel)",
          step: "Étape #",
          targetDate: "Date cible",
          priority: "Niveau de priorité",
          urgent: "Urgent ?",
          energy: "Énergie requise",
          addBucket: "Ajouter au panier",
          moveSomeday: "Déplacer à un jour",
          addToAgenda: "Ajouter à l'agenda ?",
          today: "Aujourd'hui",
          upcoming: "À venir / Passé",
          logout: "Déconnexion",
          welcome: "Bonjour",
          low: "FAIBLE", med: "MOY", high: "HAUTE",
          imTired: "Je suis fatigué",
          imReady: "Je suis prêt",
          createProject: "Créer un projet"
        }
      },
      ar: {
        translation: {
          dashboard: "لوحة القيادة",
          projects: "المشاريع",
          agenda: "جدول الأعمال",
          brainDump: "تفريغ الذهن",
          whatToDo: "ما الذي يجب القيام به؟",
          projName: "اسم المشروع (اختياري)",
          step: "خطوة #",
          targetDate: "تاريخ الهدف",
          priority: "مستوى الأولوية",
          urgent: "عاجل؟",
          energy: "الطاقة المطلوبة",
          addBucket: "إضافة إلى القائمة",
          moveSomeday: "نقل إلى يوم ما",
          addToAgenda: "إضافة إلى الجدول؟",
          today: "اليوم",
          upcoming: "القادمة / السابقة",
          logout: "تسجيل خروج",
          welcome: "مرحباً",
          low: "منخفضة", med: "متوسطة", high: "عالية",
          imTired: "أنا متعب",
          imReady: "أنا مستعد",
          createProject: "إنشاء مشروع جديد"
        }
      }
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

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
          <div className="space-y-3 mb-6">
            <button onClick={(e) => handleAuth(e, 'google')} className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
          </div>
          <div className="relative mb-6">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
             <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or use email</span></div>
          </div>
          <form onSubmit={(e) => handleAuth(e, 'email')} className="space-y-4">
            {authError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{authError}</div>}
            <div className="space-y-3">
              <input type="email" placeholder="Email address" className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
               {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">{isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}</button>
          </div>
        </div>
      </div>
    );
  }

  return <MainLayout user={user} onLogout={() => signOut(auth)} />;
}

// --- MAIN LAYOUT (SIDEBAR + CONTENT) ---
function MainLayout({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [selectedProject, setSelectedProject] = useState(null);
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => { refreshTasks(); }, [user.uid]);

  // AUTOMATIC RTL HANDLING FOR ARABIC
  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-all z-20 shadow-xl md:shadow-none">
        <div>
          <div className="p-6 flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">FM</div>
             <span className="font-black text-slate-800 text-lg">Focus Mate</span>
          </div>
          
          <nav className="px-3 space-y-1 mt-2">
            <SidebarItem icon={Layout} label={t('dashboard')} active={activeTab === "dashboard" && !selectedProject} onClick={() => { setActiveTab("dashboard"); setSelectedProject(null); }} />
            <SidebarItem icon={FolderKanban} label={t('projects')} active={activeTab === "projects"} onClick={() => { setActiveTab("projects"); setSelectedProject(null); }} />
            <SidebarItem icon={CalendarDays} label={t('agenda')} active={activeTab === "agenda"} onClick={() => { setActiveTab("agenda"); setSelectedProject(null); }} />
          </nav>

          {/* LANGUAGE SWITCHER (DROPDOWN) */}
          <div className="px-6 mt-8">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Globe size={12}/> Language
            </div>
            <div className="relative group">
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="w-full appearance-none bg-slate-100 border border-transparent hover:border-slate-200 text-slate-700 font-bold text-sm rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="fr">Français (FR)</option>
                <option value="es">Español (ES)</option>
                <option value="ar">العربية (AR)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">
                {user.email[0].toUpperCase()}
             </div>
             <div className="overflow-hidden">
                <p className="text-xs text-slate-500 font-medium">{t('welcome')}</p>
                <p className="text-xs font-bold text-slate-900 truncate w-32">{user.email}</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-2 py-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
            <LogOut size={18} />
            <span className="font-bold text-sm">{t('logout')}</span>
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto relative bg-slate-50">
         <div className="max-w-4xl mx-auto p-6 pb-32">
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
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm relative group",
                active ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
            )}
        >
            <Icon size={20} className={cn("transition-colors", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
            <span>{label}</span>
            {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-l-full" />}
        </button>
    )
}

function DashboardView({ user, tasks, refreshTasks, filterProject, setFilterProject }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ 
    content: "", project: "", energy: "medium", isUrgent: false, 
    dueDate: "", step: "", addToAgenda: false 
  });
  const [focusMode, setFocusMode] = useState({ isOpen: false, mode: "ready" });

  const handleAdd = async (e, asSomeday = false) => {
    if (e) e.preventDefault();
    if (!formData.content.trim()) return;
    const finalProject = filterProject || formData.project;
    
    // Create Task
    const taskPayload = { ...formData, project: finalProject, isSomeday: asSomeday, step: formData.step ? parseInt(formData.step) : null, subtasks: [] };
    await axios.post(`${API_URL}/tasks`, taskPayload, { headers: { "x-user-id": user.uid } });

    // Add to Agenda?
    if (formData.addToAgenda && formData.dueDate) {
         const agendaPayload = { content: formData.content, time_slot: "", date: formData.dueDate, isCompleted: false };
         await axios.post(`${API_URL}/agenda`, agendaPayload, { headers: { "x-user-id": user.uid } });
         confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
    }

    refreshTasks();
    setFormData({ ...formData, content: "", isUrgent: false, dueDate: "", step: "", addToAgenda: false, project: filterProject ? "" : formData.project });
  };

  const handleDelete = (id) => { if(confirm("Delete task?")) axios.delete(`${API_URL}/tasks/${id}`, { headers: { "x-user-id": user.uid } }).then(refreshTasks); };
  const handleUpdate = (task) => { axios.put(`${API_URL}/tasks/${task.id}`, task, { headers: { "x-user-id": user.uid } }).then(refreshTasks); };
  
  const ClearButton = ({ onClick }) => (
    <button type="button" onClick={onClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors z-10 p-1"><XCircle size={20} /></button>
  );

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
             <button onClick={() => setFilterProject(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-4 text-sm"><ArrowLeft size={16} /> Back</button>
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
       <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-50 p-2 rounded-xl"><Flame className="text-indigo-600 w-5 h-5" /></div>
                <h2 className="text-xl font-bold text-slate-900">{t('brainDump')}</h2>
            </div>
            
            <form onSubmit={(e) => handleAdd(e, false)} className="space-y-6">
                <div className="relative">
                    <input 
                        className="w-full p-4 pr-12 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                        placeholder={t('whatToDo')} 
                        value={formData.content} 
                        onChange={(e) => setFormData({...formData, content: e.target.value})} 
                        autoFocus 
                    />
                    {formData.content && <ClearButton onClick={() => setFormData({...formData, content: ""})} />}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-[2]">
                        <input 
                            className="w-full p-4 pr-12 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                            placeholder={t('projName')} 
                            value={formData.project} 
                            onChange={(e) => setFormData({...formData, project: e.target.value})} 
                        />
                        {formData.project && <ClearButton onClick={() => setFormData({...formData, project: ""})} />}
                    </div>
                    <div className="relative flex-1">
                        <input 
                            type="number" min="1" 
                            className="w-full p-4 pr-12 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus: