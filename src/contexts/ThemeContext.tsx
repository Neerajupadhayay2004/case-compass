import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type Language = "en" | "hi" | "es";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    cases: "Cases",
    documents: "Documents",
    knowledge: "Knowledge Base",
    chat: "AI Chat",
    history: "History",
    settings: "Settings",
    search: "Search",
    upload: "Upload",
    create: "Create",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    noResults: "No results found",
    welcome: "Welcome back",
    activeCases: "Active Cases",
    totalDocuments: "Total Documents",
    aiQueries: "AI Queries",
    teamOnline: "Team Online",
    recentActivity: "Recent Activity",
    notifications: "Notifications",
    profile: "Profile",
    appearance: "Appearance",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
    english: "English",
    hindi: "Hindi",
    spanish: "Spanish",
    searchDocuments: "Search documents...",
    semanticSearch: "AI Semantic Search",
    searchResults: "Search Results",
    relevance: "Relevance",
    caseDetails: "Case Details",
    claimAmount: "Claim Amount",
    policyNumber: "Policy Number",
    dateOfIncident: "Date of Incident",
    status: "Status",
    priority: "Priority",
    description: "Description",
    timeline: "Timeline",
    collaborators: "Collaborators",
    relatedDocuments: "Related Documents",
    askAI: "Ask AI",
    intelligentAssistant: "Intelligent Case Assistant",
    aiConnected: "AI Connected",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    cases: "मामले",
    documents: "दस्तावेज़",
    knowledge: "ज्ञान आधार",
    chat: "AI चैट",
    history: "इतिहास",
    settings: "सेटिंग्स",
    search: "खोजें",
    upload: "अपलोड",
    create: "बनाएं",
    delete: "हटाएं",
    edit: "संपादित करें",
    view: "देखें",
    save: "सहेजें",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है...",
    noResults: "कोई परिणाम नहीं मिला",
    welcome: "वापसी पर स्वागत है",
    activeCases: "सक्रिय मामले",
    totalDocuments: "कुल दस्तावेज़",
    aiQueries: "AI प्रश्न",
    teamOnline: "टीम ऑनलाइन",
    recentActivity: "हाल की गतिविधि",
    notifications: "सूचनाएं",
    profile: "प्रोफ़ाइल",
    appearance: "दिखावट",
    language: "भाषा",
    theme: "थीम",
    dark: "डार्क",
    light: "लाइट",
    system: "सिस्टम",
    english: "अंग्रेज़ी",
    hindi: "हिंदी",
    spanish: "स्पेनिश",
    searchDocuments: "दस्तावेज़ खोजें...",
    semanticSearch: "AI सिमेंटिक खोज",
    searchResults: "खोज परिणाम",
    relevance: "प्रासंगिकता",
    caseDetails: "मामले का विवरण",
    claimAmount: "दावा राशि",
    policyNumber: "पॉलिसी नंबर",
    dateOfIncident: "घटना की तारीख",
    status: "स्थिति",
    priority: "प्राथमिकता",
    description: "विवरण",
    timeline: "समय रेखा",
    collaborators: "सहयोगी",
    relatedDocuments: "संबंधित दस्तावेज़",
    askAI: "AI से पूछें",
    intelligentAssistant: "बुद्धिमान केस सहायक",
    aiConnected: "AI कनेक्टेड",
  },
  es: {
    dashboard: "Panel",
    cases: "Casos",
    documents: "Documentos",
    knowledge: "Base de Conocimiento",
    chat: "Chat IA",
    history: "Historial",
    settings: "Configuración",
    search: "Buscar",
    upload: "Subir",
    create: "Crear",
    delete: "Eliminar",
    edit: "Editar",
    view: "Ver",
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando...",
    noResults: "No se encontraron resultados",
    welcome: "Bienvenido de nuevo",
    activeCases: "Casos Activos",
    totalDocuments: "Total Documentos",
    aiQueries: "Consultas IA",
    teamOnline: "Equipo en Línea",
    recentActivity: "Actividad Reciente",
    notifications: "Notificaciones",
    profile: "Perfil",
    appearance: "Apariencia",
    language: "Idioma",
    theme: "Tema",
    dark: "Oscuro",
    light: "Claro",
    system: "Sistema",
    english: "Inglés",
    hindi: "Hindi",
    spanish: "Español",
    searchDocuments: "Buscar documentos...",
    semanticSearch: "Búsqueda Semántica IA",
    searchResults: "Resultados de Búsqueda",
    relevance: "Relevancia",
    caseDetails: "Detalles del Caso",
    claimAmount: "Monto del Reclamo",
    policyNumber: "Número de Póliza",
    dateOfIncident: "Fecha del Incidente",
    status: "Estado",
    priority: "Prioridad",
    description: "Descripción",
    timeline: "Línea de Tiempo",
    collaborators: "Colaboradores",
    relatedDocuments: "Documentos Relacionados",
    askAI: "Preguntar IA",
    intelligentAssistant: "Asistente Inteligente de Casos",
    aiConnected: "IA Conectada",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "dark";
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language") as Language;
    return stored || "en";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
