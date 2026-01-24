import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, BatteryFull, BatteryMedium, 
  Zap, Plus, X, CheckCircle2, Flame, Loader2, Trash2, Pencil, Save, Calendar, Archive,
  Clock, LogOut, LayoutGrid, Mail, ArrowLeft, XCircle, Check, ChevronDown, ChevronUp,
  Layout, FolderKanban, CalendarDays, Menu, Globe, ChevronLeft, ChevronRight 
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

// --- I18N CONFIGURATION ---
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
          createProject: "Create New Project",
          weekStart: "Week Start" 
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
          createProject: "Crear Proyecto",
          weekStart: "Inicio de semana"
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
          createProject: "Créer un projet",
          weekStart: "Début de semaine"
         
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
          createProject: "إنشاء مشروع جديد",
           weekStart: "بداية الأسبوع"
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

// --- MAIN LAYOUT (RESPONSIVE + FIXED NAVIGATION + RTL SIDEBAR) ---
function MainLayout({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => { refreshTasks(); }, [user.uid]);

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
    setIsSidebarOpen(false); 
  };

  const handleBack = () => {
    setSelectedProject(null);
    setActiveTab("projects"); 
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className={cn(
          "fixed inset-y-0 start-0 z-40 w-64 bg-white border-e border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl md:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full rtl:md:translate-x-0"
      )}>
        <div>
          <div className="p-6 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">FM</div>
                <span className="font-black text-slate-800 text-lg">Focus Mate</span>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          
          <nav className="px-3 space-y-1 mt-2">
            <SidebarItem icon={Layout} label={t('dashboard')} active={activeTab === "dashboard" && !selectedProject} onClick={() => { setActiveTab("dashboard"); setSelectedProject(null); setIsSidebarOpen(false); }} />
            <SidebarItem icon={FolderKanban} label={t('projects')} active={activeTab === "projects"} onClick={() => { setActiveTab("projects"); setSelectedProject(null); setIsSidebarOpen(false); }} />
            <SidebarItem icon={CalendarDays} label={t('agenda')} active={activeTab === "agenda"} onClick={() => { setActiveTab("agenda"); setSelectedProject(null); setIsSidebarOpen(false); }} />
          </nav>

          <div className="px-6 mt-8">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Globe size={12}/> Language</div>
            <div className="relative group">
              <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} className="w-full appearance-none bg-slate-100 border border-transparent hover:border-slate-200 text-slate-700 font-bold text-sm rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer">
                <option value="en">English (EN)</option>
                <option value="fr">Français (FR)</option>
                <option value="es">Español (ES)</option>
                <option value="ar">العربية (AR)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-600 transition-colors"><ChevronDown size={16} /></div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">{user.email[0].toUpperCase()}</div>
             <div className="overflow-hidden"><p className="text-xs text-slate-500 font-medium">{t('welcome')}</p><p className="text-xs font-bold text-slate-900 truncate w-32">{user.email}</p></div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-2 py-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><LogOut size={18} /><span className="font-bold text-sm">{t('logout')}</span></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
         <div className="md:hidden p-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <span className="font-black text-slate-800 text-lg">Focus Mate</span>
         </div>
         <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
            <div className="max-w-4xl mx-auto">
                {activeTab === "dashboard" && (
                    <DashboardView 
                        user={user} 
                        tasks={tasks} 
                        refreshTasks={refreshTasks} 
                        filterProject={selectedProject} 
                        setFilterProject={setSelectedProject} 
                        onBack={handleBack} 
                    />
                )}
                {activeTab === "projects" && (
                    <ProjectsListView tasks={tasks} onSelectProject={goToProject} />
                )}
                {activeTab === "agenda" && (
                    <AgendaView user={user} />
                )}
            </div>
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

// --- DASHBOARD VIEW (With FIXED GRADIENT FOOTER & STRICT SORTING) ---
function DashboardView({ user, tasks, refreshTasks, filterProject, setFilterProject, onBack }) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ 
    content: "", project: "", energy: "medium", isUrgent: false, 
    dueDate: "", step: "", addToAgenda: false 
  });
  const [focusMode, setFocusMode] = useState({ isOpen: false, mode: "ready" });

  const handleAdd = async (e, asSomeday = false) => {
    if (e) e.preventDefault();
    if (!formData.content.trim()) return;
    const finalProject = filterProject || formData.project;
    
    const taskPayload = { ...formData, project: finalProject, isSomeday: asSomeday, step: formData.step ? parseInt(formData.step) : null, subtasks: [] };
    await axios.post(`${API_URL}/tasks`, taskPayload, { headers: { "x-user-id": user.uid } });

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
    if (filterProject) {
      // STRICT SORTING: Numerical Step inside projects
      return pool.filter(t => t.project === filterProject).sort((a, b) => (Number(a.step) || 999) - (Number(b.step) || 999));
    }
    return pool.sort((a, b) => {
        if (a.dueDate && !b.dueDate) return -1; 
        if (!a.dueDate && b.dueDate) return 1;
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        if (a.project === b.project) return (Number(a.step) || 999) - (Number(b.step) || 999);
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
             <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-4 text-sm"><ArrowLeft size={16} /> Back</button>
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
                    <input className="w-full p-4 pr-12 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder={t('whatToDo')} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} autoFocus />
                    {formData.content && <ClearButton onClick={() => setFormData({...formData, content: ""})} />}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-[2]">
                        <input className="w-full p-4 pr-12 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder={t('projName')} value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} />
                        {formData.project && <ClearButton onClick={() => setFormData({...formData, project: ""})} />}
                    </div>
                    <div className="relative flex-1">
                        <input type="number" min="1" className="w-full p-4 pr-12 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder={t('step')} value={formData.step} onChange={(e) => setFormData({...formData, step: e.target.value})} />
                        {formData.step && <ClearButton onClick={() => setFormData({...formData, step: ""})} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('targetDate')}</label>
                        <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-white h-[60px] relative">
                            <Calendar className="text-slate-400 ml-2" />
                            <input type="date" className="w-full outline-none text-slate-600 font-medium bg-transparent uppercase" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                            {formData.dueDate && (
                                <button type="button" onClick={() => setFormData({...formData, dueDate: ""})} className="absolute right-2 p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full text-slate-300 transition-colors"><X size={18} /></button>
                            )}
                        </div>
                         {formData.dueDate && (
                             <div className="mt-2 flex items-center gap-2 px-1 animate-in fade-in slide-in-from-top-1">
                                <input type="checkbox" id="agendaToggle" checked={formData.addToAgenda} onChange={e => setFormData({...formData, addToAgenda: e.target.checked})} className="accent-indigo-600 w-4 h-4" />
                                <label htmlFor="agendaToggle" className="text-xs font-bold text-indigo-600 cursor-pointer">{t('addToAgenda')}</label>
                             </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('priority')}</label>
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white h-[60px]">
                            <div className="flex items-center gap-3">
                                <Zap className={cn("w-5 h-5 ml-2", formData.isUrgent ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                                <span className="font-bold text-slate-700">{t('urgent')}</span>
                            </div>
                            <button type="button" onClick={() => setFormData({...formData, isUrgent: !formData.isUrgent})} className={cn("w-12 h-7 rounded-full transition-colors relative", formData.isUrgent ? "bg-slate-900" : "bg-slate-200")}>
                                <div className={cn("w-5 h-5 bg-white rounded-full absolute top-1 transition-transform", formData.isUrgent ? "left-6" : "left-1")} />
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">{t('energy')}</label>
                    <div className="flex gap-2">
                    {[{ id: "low", label: t('low'), icon: Battery, activeClass: "bg-emerald-100 border-emerald-400 text-emerald-800 ring-2 ring-emerald-200" }, { id: "medium", label: t('med'), icon: BatteryMedium, activeClass: "bg-amber-100 border-amber-400 text-amber-800 ring-2 ring-amber-200" }, { id: "high", label: t('high'), icon: BatteryFull, activeClass: "bg-rose-100 border-rose-400 text-rose-800 ring-2 ring-rose-200" }].map((opt) => (
                        <button key={opt.id} type="button" onClick={() => setFormData({...formData, energy: opt.id})} className={cn("flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all", formData.energy === opt.id ? opt.activeClass : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50")}>
                        <opt.icon size={20} />
                        <span className="text-[10px] font-bold tracking-wider">{opt.label}</span>
                        </button>
                    ))}
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-slate-800 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"><Plus size={20} /> {t('addBucket')}</button>
                    <button type="button" onClick={(e) => handleAdd(e, true)} className="w-full bg-slate-100 text-slate-500 font-bold text-lg py-3 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center justify-center gap-2"><Archive size={20} /> {t('moveSomeday')}</button>
                </div>
            </form>
       </div>
       )}

       {filterProject && (
           <form onSubmit={(e) => handleAdd(e, false)} className="mb-6 flex gap-2">
            <input className="flex-1 p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder={`Add step to ${filterProject}...`} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} autoFocus />
            <input type="number" min="1" className="w-20 p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="#" value={formData.step} onChange={e => setFormData({...formData, step: e.target.value})} />
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

        {/* SPACER DIV FOR FOOTER */}
        <div className="h-48 w-full"></div>

        {/* FIXED FOOTER WITH GRADIENT & RTL SUPPORT */}
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pointer-events-none transition-all duration-300",
            i18n.language === 'ar' ? "md:right-64 md:left-0" : "md:left-64 md:right-0"
        )}>
            <div className="max-w-3xl mx-auto flex gap-4 pointer-events-auto">
                <button onClick={() => setFocusMode({ isOpen: true, mode: "tired" })} className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-4 rounded-2xl flex flex-col items-center gap-1 transition-transform hover:-translate-y-1 shadow-lg shadow-emerald-900/10">
                    <div className="flex items-center gap-2 font-bold text-lg"><Battery className="w-5 h-5" /> {t('imTired')}</div>
                    <span className="text-xs opacity-75 font-medium">Low Energy Mode</span>
                </button>
                <button onClick={() => setFocusMode({ isOpen: true, mode: "ready" })} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl flex flex-col items-center gap-1 transition-transform hover:-translate-y-1 shadow-xl shadow-slate-900/20">
                    <div className="flex items-center gap-2 font-bold text-lg"><Zap className="w-5 h-5" /> {t('imReady')}</div>
                    <span className="text-xs text-slate-400 font-medium">Normal / High Energy</span>
                </button>
            </div>
        </div>
        
        <FocusOverlay 
            isOpen={focusMode.isOpen} 
            onClose={() => setFocusMode({...focusMode, isOpen: false})} 
            tasks={filterProject ? tasks.filter(t => t.project === filterProject) : tasks} 
            mode={focusMode.mode} 
            onComplete={(t) => handleUpdate({...t, isCompleted: true})} 
        />
    </div>
  );
}

// --- PROJECTS VIEW (RTL Button Fix) ---
function ProjectsListView({ tasks, onSelectProject }) {
    const { t, i18n } = useTranslation();
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
        const name = prompt(t('projName') + ":");
        if (name && name.trim()) {
            onSelectProject(name.trim());
        }
    };

    const isArabic = i18n.language === 'ar';

    return (
        <div className="pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {projects.length === 0 && <div className="text-center py-10 text-slate-400">No projects yet.</div>}
            
            {/* RTL FIXED BUTTON */}
            <button onClick={handleCreate} className={cn("fixed bottom-8 w-16 h-16 bg-indigo-600 rounded-full text-white shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all z-50", isArabic ? "left-8" : "right-8")}>
                <Plus size={32} strokeWidth={3} />
            </button>
        </div>
    )
}

// --- AGENDA VIEW (Time Format + Editing + Sections) ---
// --- AGENDA VIEW (Calendar Style: Grouped & Minimalist) ---
// --- AGENDA VIEW (Navigable Calendar + Big Actions) ---
// --- AGENDA VIEW (Scrollable Timeline + Auto-Scroll to Today) ---
// --- AGENDA VIEW (Fixed Header via Sticky + Auto-Scroll) ---
// --- AGENDA VIEW (Solid Opaque Header + Clean Scroll) ---
function AgendaView({ user }) {
    const { t, i18n } = useTranslation();
    const [items, setItems] = useState([]);
    
    // REFS
    const todaySectionRef = useRef(null);
    
    // CONFIG
    const [weekStartDay, setWeekStartDay] = useState("Sun"); 
    
    // STATE
    const [currentStartDate, setCurrentStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [newItemContent, setNewItemContent] = useState("");
    const [newItemTime, setNewItemTime] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ content: "", time: "" });

    useEffect(() => {
        axios.get(`${API_URL}/agenda`, { headers: { "x-user-id": user.uid } }).then(res => setItems(res.data));
    }, [user.uid]);

    // Auto-scroll to Today
    useEffect(() => {
        if (todaySectionRef.current) {
            setTimeout(() => {
                todaySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 500);
        }
    }, [items]);

    useEffect(() => {
        setCurrentStartDate(prev => getAlignedWeekStart(prev, weekStartDay));
    }, [weekStartDay]);

    // --- HELPERS ---
    const getAlignedWeekStart = (date, startDay) => {
        const d = new Date(date);
        const currentDay = d.getDay(); 
        const target = startDay === 'Sun' ? 0 : (startDay === 'Mon' ? 1 : 6);
        let diff = currentDay - target;
        if (diff < 0) diff += 7; 
        d.setDate(d.getDate() - diff);
        return d;
    };

    const changeWeek = (days) => {
        const newDate = new Date(currentStartDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentStartDate(newDate);
    };

    const getWeekDays = () => {
        const days = [];
        const start = getAlignedWeekStart(currentStartDate, weekStartDay);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push({
                full: d.toISOString().split('T')[0],
                day: d.getDate(),
                name: d.toLocaleDateString(i18n.language, { weekday: 'narrow' })
            });
        }
        return days;
    };

    // --- ACTIONS ---
    const handleAdd = (e) => {
        e.preventDefault();
        if(!newItemContent) return;
        const payload = { content: newItemContent, time_slot: newItemTime, date: selectedDate, isCompleted: false };
        axios.post(`${API_URL}/agenda`, payload, { headers: { "x-user-id": user.uid } }).then(res => { 
            setItems([...items, res.data]); 
            setNewItemContent(""); 
            setNewItemTime(""); 
        });
    };

    const toggleItem = (item) => {
        const updated = { ...item, isCompleted: !item.isCompleted };
        axios.put(`${API_URL}/agenda/${item.id}`, updated, { headers: { "x-user-id": user.uid } });
        setItems(items.map(i => i.id === item.id ? updated : i));
    };

    const deleteItem = (id) => {
        if(confirm("Delete this item?")) {
            axios.delete(`${API_URL}/agenda/${id}`, { headers: { "x-user-id": user.uid } });
            setItems(items.filter(i => i.id !== id));
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditForm({ content: item.content, time: item.time_slot });
    };

    const saveEdit = (id) => {
        const item = items.find(i => i.id === id);
        const updated = { ...item, content: editForm.content, time_slot: editForm.time };
        axios.put(`${API_URL}/agenda/${id}`, updated, { headers: { "x-user-id": user.uid } });
        setItems(items.map(i => i.id === id ? updated : i));
        setEditingId(null);
    };

    // --- FORMATTERS ---
    const getGroupLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dStr = date.toISOString().split('T')[0];
        const tStr = today.toISOString().split('T')[0];
        const tomStr = tomorrow.toISOString().split('T')[0];

        if (dStr === tStr) return t('today');
        if (dStr === tomStr) return i18n.language === 'ar' ? "غداً" : (i18n.language === 'es' ? "Mañana" : (i18n.language === 'fr' ? "Demain" : "Tomorrow")); 
        
        return date.toLocaleDateString(i18n.language, { weekday: 'long' }); 
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        if (!timeStr.includes(":")) return timeStr;
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        if (isNaN(h)) return timeStr;
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${suffix}`;
    };

    const sortedItems = [...items].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time_slot || "").localeCompare(b.time_slot || "");
    });

    const groupedItems = sortedItems.reduce((groups, item) => {
        const date = item.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
        return groups;
    }, {});

    const todayStr = new Date().toISOString().split('T')[0];

   const dayLabels = {
    Sat: { en: "Sat", ar: "سبت", fr: "Sam", es: "Sáb" },
    Sun: { en: "Sun", ar: "أحد", fr: "Dim", es: "Dom" },
    Mon: { en: "Mon", ar: "إثنين", fr: "Lun", es: "Lun" }
};

    return (
        <div className="pb-10 relative ">
            {/* 1. STICKY HEADER (Solid Background, Z-Index 30) */}
            {/* 'bg-slate-50' ensures opacity so items don't show behind it */}
          <div className="sticky top-[-30px] z-30 bg-slate-50 pt-7 mb-6 border-b border-slate-200 shadow-sm -mx-4 px-4 -mt-4 md:-mx-6 md:px-6 md:-mt-6 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    
                    <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
                        <button onClick={() => changeWeek(-7)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-colors">{i18n.language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest min-w-[100px] text-center">
                            {getAlignedWeekStart(currentStartDate, weekStartDay).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => changeWeek(7)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-colors">{i18n.language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}</button>
                    </div>

                    {/* Removed 'self-end' so it aligns naturally with the start of the container in mobile view */}
                   <div className="flex items-center gap-1 text-[13px] font-bold bg-white border border-slate-200 p-1 rounded-lg">
                        <span className="text-slate-400 px-2 uppercase tracking-wide hidden sm:inline">{t('weekStart')}:</span>
                        {['Sat', 'Sun', 'Mon'].map(d => (
                            <button 
                                key={d} 
                                onClick={() => setWeekStartDay(d)}
                                className={cn(
                                    "px-2 py-1 rounded-md transition-all",
                                    weekStartDay === d ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {dayLabels[d][i18n.language] || dayLabels[d].en}
                            </button>
                        ))}
                    </div>
                </div>

               {/* Added flex-wrap and dir="ltr" if you want to FORCE Sun->Sat visual order even in Arabic, 
    OR keep it standard to let it flip. 
    Usually, calendars should strictly follow LTR visual order (Sun ... Sat) or RTL (Sat ... Sun). 
    The safest fix for alignment is this: */}
<div className="flex justify-center gap-2 md:gap-7 mb-4 flex-wrap md:flex-nowrap" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    {getWeekDays().map((day) => {
                        const isSelected = day.full === selectedDate;
                        const isToday = day.full === todayStr;
                        return (
                            <button 
                                key={day.full} 
                                onClick={() => setSelectedDate(day.full)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-20 h-14 rounded-2xl text-Lg font-bold transition-all relative overflow-hidden",
                                    isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-100"
                                )}
                            >
                                {isToday && !isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                                <span className={cn("opacity-60 mb-1 uppercase text-[15px]", isSelected && "opacity-100")}>{day.name}</span>
                                <span className="text-sm">{day.day}</span>
                            </button>
                        )
                    })}
                </div>
                
                <form onSubmit={handleAdd} className="flex gap-2 animate-in fade-in">
    <div className="relative flex-1">
        <input 
            className={cn(
                "w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm",
                i18n.language === 'ar' ? "pr-10 pl-3" : "pl-10 pr-3"
            )} 
            placeholder={`+ ${t('agenda')} (${selectedDate})...`} 
            value={newItemContent} 
            onChange={e => setNewItemContent(e.target.value)} 
        />
        <div className={cn(
            "absolute top-1/2 -translate-y-1/2 text-slate-300",
            i18n.language === 'ar' ? "right-3" : "left-3"
        )}>
            <Check size={16} className="border-2 border-slate-300 rounded-full p-0.5 w-4 h-4" />
        </div>
    </div>
    <input type="time" className="w-20 p-3 bg-white border border-slate-200 rounded-xl font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm text-xs" value={newItemTime} onChange={e => setNewItemTime(e.target.value)} />
    <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95">
        <Plus size={20} />
    </button>
</form>
            </div>

            {/* 2. SCROLLABLE TIMELINE */}

              <div className="space-y-8 pt-[440px] pb-10">
                {Object.keys(groupedItems).length === 0 && (
                    <div className="text-center py-10 opacity-40">
                        <div className="text-4xl mb-2">☕️</div>
                        <p className="font-bold">No plans yet.</p>
                    </div>
                )}

                {Object.keys(groupedItems).map(dateKey => {
                    const isTodayGroup = dateKey === todayStr;
                    return (
                        <div 
                            key={dateKey} 
                            ref={isTodayGroup ? todaySectionRef : null}
                            className={cn(
                                "animate-in slide-in-from-bottom-2", 
                                isTodayGroup ? "scroll-mt-48" : "opacity-80 hover:opacity-100 transition-opacity" 
                            )}
                        >
                            <h3 className={cn(
                                "text-lg font-black mb-3 px-2 capitalize flex items-center gap-3",
                                isTodayGroup ? "text-indigo-600" : "text-slate-700"
                            )}>
                                {isTodayGroup && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-300"/>}
                                <span>{getGroupLabel(dateKey)}</span>
                                <span className="text-sm font-bold text-slate-400 mt-0.5">{dateKey}</span>
                            </h3>

                            <div className="space-y-2">
                                {groupedItems[dateKey].map(item => (
                                    <AgendaItem 
                                        key={item.id} 
                                        item={item} 
                                        editingId={editingId} setEditingId={setEditingId}
                                        editForm={editForm} setEditForm={setEditForm} 
                                        saveEdit={saveEdit} 
                                        toggleItem={toggleItem} 
                                        deleteItem={deleteItem} 
                                        formatTime={formatTime} 
                                        todayStr={todayStr}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
// --- AGENDA ITEM (Bigger & Closer Actions) ---
const AgendaItem = ({ item, editingId, setEditingId, editForm, setEditForm, saveEdit, toggleItem, deleteItem, formatTime }) => {
    
    if (editingId === item.id) {
        return (
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-indigo-100 shadow-sm ring-2 ring-indigo-50">
                <input 
                    className="flex-1 font-bold text-slate-700 p-2 bg-transparent outline-none" 
                    value={editForm.content} 
                    onChange={e => setEditForm({...editForm, content: e.target.value})}
                    autoFocus
                />
                <input 
                    type="time"
                    className="w-20 text-xs font-bold p-2 bg-slate-50 rounded outline-none"
                    value={editForm.time}
                    onChange={e => setEditForm({...editForm, time: e.target.value})}
                />
                <button onClick={() => saveEdit(item.id)} className="p-2 bg-indigo-600 text-white rounded-lg"><Check size={18}/></button>
            </div>
        );
    }

    return (
        <div className="group flex items-start gap-4 p-2 rounded-xl hover:bg-white/60 transition-colors">
            {/* 1. Circular Checkbox */}
            <button 
                onClick={() => toggleItem(item)} 
                className={cn(
                    "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    item.isCompleted 
                        ? "bg-slate-400 border-slate-400 text-white" 
                        : "border-slate-300 text-transparent hover:border-indigo-500"
                )}
            >
                <Check size={12} strokeWidth={3} />
            </button>

            {/* 2. Content & Time */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setEditingId(item.id); setEditForm({ content: item.content, time: item.time_slot }); }}>
                <div className={cn(
                    "text-base font-bold text-slate-700 leading-tight break-words",
                    item.isCompleted && "line-through text-slate-400"
                )}>
                    {item.content}
                </div>
                {item.time_slot && (
                    <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                        {formatTime(item.time_slot)}
                    </div>
                )}
            </div>

            {/* 3. BIGGER & CLOSER ACTIONS (Always visible, right next to text) */}
            <div className="flex gap-1 self-start">
                <button 
                    onClick={() => { setEditingId(item.id); setEditForm({ content: item.content, time: item.time_slot }); }} 
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    <Pencil size={18} />
                </button>
                <button 
                    onClick={() => deleteItem(item.id)} 
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
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
         <div className="flex flex-wrap gap-2">
           {['low', 'medium', 'high'].map(lvl => (
             <button key={lvl} onClick={() => setEditData({...editData, energy: lvl})} className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase border", editData.energy === lvl ? getPillStyle(lvl) + " border-transparent" : "bg-white border-slate-200 text-slate-400")}>{lvl}</button>
           ))}
           <button onClick={() => setEditData({...editData, isUrgent: !editData.isUrgent})} className={cn("px-3 py-1 rounded-full text-xs font-bold border", editData.isUrgent ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-400")}>Urgent</button>
           <button onClick={() => setEditData({...editData, isSomeday: !editData.isSomeday})} className={cn("px-3 py-1 rounded-full text-xs font-bold border", editData.isSomeday ? "bg-indigo-500 text-white border-indigo-500" : "bg-white text-slate-400")}>Someday</button>
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
                <input 
                    className="bg-transparent text-sm placeholder:text-slate-400 focus:outline-none w-full"
                    placeholder="Add a subtask..." 
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                />
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

// --- FOCUS OVERLAY (Fix: Respects Sorting Logic & Steps) ---
function FocusOverlay({ isOpen, onClose, tasks, mode, onComplete }) {
  const [activeTask, setActiveTask] = useState(null);
  
  useEffect(() => { if (isOpen) selectTask(); }, [isOpen]);
  
  const selectTask = () => {
    // 1. Start with the tasks passed down (Already filtered by Project if inside one)
    let pool = tasks.filter(t => !t.isCompleted && !t.isSomeday);

    // 2. Filter by Energy Mode
    if(mode === "tired") pool = pool.filter(t => t.energy === "low");
    else pool = pool.filter(t => ["medium", "high"].includes(t.energy));

    if(pool.length === 0) { setActiveTask(null); return; }

    // 3. APPLY SORTING (Crucial Fix: Use Strict Step Logic)
    pool.sort((a, b) => {
        // A. Due Dates (Overdue items first)
        if (a.dueDate && !b.dueDate) return -1; 
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);

        // B. Urgency
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;

        // C. Project Grouping (If mixed list)
        if (a.project && b.project && a.project !== b.project) return a.project.localeCompare(b.project);

        // D. STEPS (Strict Number Sorting: 1 before 2, 2 before 10)
        return (Number(a.step) || 999) - (Number(b.step) || 999);
    });

    // 4. Select the FIRST task (The actual "Next Action")
    setActiveTask(pool[0]);
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
             <h2 className="text-3xl font-black text-slate-800">You're free!</h2>
             <p className="text-slate-500">No tasks match this energy level.</p>
           </div>
        ) : (
          <motion.div initial={{scale:0.95}} animate={{scale:1}} className="space-y-6">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Next Step</div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight">{activeTask.content}</h1>
            {activeTask.project && <div className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">{activeTask.project} {activeTask.step ? `(Step ${activeTask.step})` : ""}</div>}
            
            <div className="pt-8">
              <button onClick={handleDone} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-200"><CheckCircle2 size={32} /> Mark Done</button>
              <button onClick={onClose} className="mt-6 text-slate-400 font-bold hover:text-slate-600">Skip / Do Later</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}