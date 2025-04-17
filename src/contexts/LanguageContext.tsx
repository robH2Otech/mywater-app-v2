import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Available languages
export type Language = "en" | "fr";

// Define params type for translation function
type TranslationParams = Record<string, string>;

// Language context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: TranslationParams) => string;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

// Translation object type
type Translations = Record<string, Record<string, string>>;

// Translations for English and French
const translations: Translations = {
  en: {
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome to the dashboard!",
    "dashboard.welcome.user": "Hey {name}, welcome back!",
    "dashboard.usage.title": "Water Usage",
    "dashboard.alerts.title": "Recent Alerts",
    "dashboard.no.alerts": "No recent alerts",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.water.units": "Water Units",
    "nav.filters": "Filters",
    "nav.uvc": "UVC",
    "nav.alerts": "Alerts",
    "nav.analytics": "Analytics",
    "nav.users": "Users",
    "nav.settings": "Settings",
    "nav.client.requests": "Client Requests",
    
    // Units
    "units.title": "Water Units",
    "units.add": "Add Unit",
    "units.edit": "Edit Unit",
    "units.details": "Unit Details",
    "units.name": "Unit Name",
    "units.location": "Location",
    "units.volume": "Total Volume (m³)",
    "units.status": "Status",
    "units.contact": "Maintenance Contact",
    "units.email": "Email",
    "units.phone": "Phone",
    "units.next.maintenance": "Next Maintenance",
    "units.last.maintenance": "Last Maintenance",
    "units.setup.date": "Setup Date",
    "units.measurements": "Last 24 hours Water Data",
    "units.no.measurements": "No measurements recorded yet",
    "units.loading.measurements": "Loading measurements...",
    
    // Filters
    "filters.title": "Filters",
    "filters.add": "Add Filter",
    "filters.edit": "Edit Filter",
    "filters.details": "Filter Details",
    
    // UVC
    "uvc.title": "UVC Units",
    "uvc.hours": "UVC Hours",
    "uvc.installation.date": "Installation Date",
    
    // Alerts
    "alerts.title": "Alerts",
    "alerts.create": "Create Alert",
    "alerts.details": "Alert Details",
    "alerts.unit": "Unit ID",
    "alerts.message": "Message",
    "alerts.status": "Status",
    "alerts.assign": "Assign To",
    "alerts.comments": "Comments",
    
    // Analytics
    "analytics.title": "Analytics",
    "analytics.reports": "Reports",
    "analytics.generate": "Generate Report",
    "analytics.select.unit": "Select Unit",
    "analytics.report.type": "Report Type",
    "analytics.generating": "Generating...",
    
    // Users
    "users.title": "Users",
    "users.add": "Add User",
    "users.name": "Name",
    "users.email": "Email",
    "users.role": "Role",
    "users.status": "Status",
    
    // Settings
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.data": "Data Management",
    "settings.about": "About",
    "settings.disclaimer": "Disclaimer",
    
    // General
    "status.active": "Active",
    "status.warning": "Warning",
    "status.urgent": "Urgent Change",
    "status.attention": "Attention",
    "status.maintenance": "Maintenance",
    "status.inactive": "Inactive",
    
    "button.save": "Save Changes",
    "button.cancel": "Cancel",
    "button.create": "Create",
    "button.edit": "Edit",
    "button.delete": "Delete",
    "button.back": "Back",
    "button.sync": "Sync Measurements",
    "button.syncing": "Syncing...",
    "button.clear.cache": "Clear Cache",
    "button.export.data": "Export Data",
    "button.download": "Download PDF",
    
    "form.required": "Required",
    "form.scroll": "Scroll",
    
    "toast.success": "Success",
    "toast.error": "Error",
    "toast.update.success": "Updated successfully",
    "toast.create.success": "Created successfully",
    "toast.delete.success": "Deleted successfully",
    "toast.cache.cleared": "Application cache has been successfully cleared.",
    "toast.export.started": "Your data export has been initiated.",
    
    "english": "English",
    "french": "French",
    
    "system": "System",
    "light": "Light",
    "dark": "Dark",

    // Chart related translations
    "chart.select.timerange": "Select time range",
    "chart.24hours": "Last 24 hours",
    "chart.7days": "Last 7 days",
    "chart.30days": "Last 30 days",
    "chart.6months": "Last 6 months",
    "chart.loading": "Loading chart data...",
    "chart.no.data": "No data available",
    "chart.volume": "Volume (m³)",
    "dashboard.loading": "Loading dashboard data...",
    "dashboard.total.units": "Total Units",
    "dashboard.filter.changes": "Filter Changes Required",
    "dashboard.active.alerts": "Active Alerts",
    "dashboard.volume.today": "Total Volume Today",
    
    // Landing page
    "private_user": "Private User",
    "business_client": "Business Client",
    "home_water_purification": "Home Water Purification",
    "home_user_description": "For home users with MYWATER purification products",
    "business_water_management": "Business Water Management",
    "business_description": "For commercial clients managing multiple water purification units",
    "track_maintenance": "Track your purifier's maintenance schedule so you never miss a filter change",
    "refer_friends": "Earn free replacement cartridges by referring friends who care about clean water",
    "environmental_impact": "Measure your environmental impact and celebrate every sustainable milestone",
    "monitor_units": "Monitor and manage multiple water purification units",
    "advanced_analytics": "Advanced analytics and reporting tools",
    "technical_support": "Technical support and service management",
    "continue": "Continue",
    "join_cta": "🚀 Join MYWATER now - make clean water smarter and greener!",
  },
  fr: {
    // Dashboard
    "dashboard.title": "Tableau de bord",
    "dashboard.welcome": "Bienvenue sur le tableau de bord !",
    "dashboard.welcome.user": "Bonjour {name}, bon retour !",
    "dashboard.usage.title": "Consommation d'eau",
    "dashboard.alerts.title": "Alertes récentes",
    "dashboard.no.alerts": "Aucune alerte récente",
    
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.water.units": "Unités d'eau",
    "nav.filters": "Filtres",
    "nav.uvc": "UVC",
    "nav.alerts": "Alertes",
    "nav.analytics": "Analytique",
    "nav.users": "Utilisateurs",
    "nav.settings": "Paramètres",
    "nav.client.requests": "Demandes clients",
    
    // Units
    "units.title": "Unités d'eau",
    "units.add": "Ajouter une unité",
    "units.edit": "Modifier l'unité",
    "units.details": "Détails de l'unité",
    "units.name": "Nom de l'unité",
    "units.location": "Emplacement",
    "units.volume": "Volume total (m³)",
    "units.status": "Statut",
    "units.contact": "Contact de maintenance",
    "units.email": "Email",
    "units.phone": "Téléphone",
    "units.next.maintenance": "Prochaine maintenance",
    "units.last.maintenance": "Dernière maintenance",
    "units.setup.date": "Date d'installation",
    "units.measurements": "Données d'eau des dernières 24 heures",
    "units.no.measurements": "Aucune mesure enregistrée",
    "units.loading.measurements": "Chargement des mesures...",
    
    // Filters
    "filters.title": "Filtres",
    "filters.add": "Ajouter un filtre",
    "filters.edit": "Modifier le filtre",
    "filters.details": "Détails du filtre",
    
    // UVC
    "uvc.title": "Unités UVC",
    "uvc.hours": "Heures UVC",
    "uvc.installation.date": "Date d'installation",
    
    // Alerts
    "alerts.title": "Alertes",
    "alerts.create": "Créer une alerte",
    "alerts.details": "Détails de l'alerte",
    "alerts.unit": "ID de l'unité",
    "alerts.message": "Message",
    "alerts.status": "Statut",
    "alerts.assign": "Assigner à",
    "alerts.comments": "Commentaires",
    
    // Analytics
    "analytics.title": "Analytique",
    "analytics.reports": "Rapports",
    "analytics.generate": "Générer un rapport",
    "analytics.select.unit": "Sélectionner une unité",
    "analytics.report.type": "Type de rapport",
    "analytics.generating": "Génération en cours...",
    
    // Users
    "users.title": "Utilisateurs",
    "users.add": "Ajouter un utilisateur",
    "users.name": "Nom",
    "users.email": "Email",
    "users.role": "Rôle",
    "users.status": "Statut",
    
    // Settings
    "settings.title": "Paramètres",
    "settings.theme": "Thème",
    "settings.language": "Langue",
    "settings.notifications": "Notifications",
    "settings.data": "Gestion des données",
    "settings.about": "À propos",
    "settings.disclaimer": "Avertissement",
    
    // General
    "status.active": "Actif",
    "status.warning": "Avertissement",
    "status.urgent": "Changement urgent",
    "status.attention": "Attention",
    "status.maintenance": "Maintenance",
    "status.inactive": "Inactif",
    
    "button.save": "Enregistrer les modifications",
    "button.cancel": "Annuler",
    "button.create": "Créer",
    "button.edit": "Modifier",
    "button.delete": "Supprimer",
    "button.back": "Retour",
    "button.sync": "Synchroniser les mesures",
    "button.syncing": "Synchronisation...",
    "button.clear.cache": "Vider le cache",
    "button.export.data": "Exporter les données",
    "button.download": "Télécharger PDF",
    
    "form.required": "Obligatoire",
    "form.scroll": "Défiler",
    
    "toast.success": "Succès",
    "toast.error": "Erreur",
    "toast.update.success": "Mis à jour avec succès",
    "toast.create.success": "Créé avec succès",
    "toast.delete.success": "Supprimé avec succès",
    "toast.cache.cleared": "Le cache de l'application a été vidé avec succès.",
    "toast.export.started": "L'exportation de vos données a été initiée.",
    
    "english": "Anglais",
    "french": "Français",
    
    "system": "Système",
    "light": "Clair",
    "dark": "Sombre",
    
    // Chart related translations
    "chart.select.timerange": "Sélectionner la période",
    "chart.24hours": "Dernières 24 heures",
    "chart.7days": "7 derniers jours",
    "chart.30days": "30 derniers jours",
    "chart.6months": "6 derniers mois",
    "chart.loading": "Chargement des données...",
    "chart.no.data": "Aucune donnée disponible",
    "chart.volume": "Volume (m³)",
    "dashboard.loading": "Chargement des données du tableau de bord...",
    "dashboard.total.units": "Unités totales",
    "dashboard.filter.changes": "Changements de filtre requis",
    "dashboard.active.alerts": "Alertes actives",
    "dashboard.volume.today": "Volume total aujourd'hui",
    
    // Landing page
    "private_user": "Utilisateur Privé",
    "business_client": "Client Professionnel",
    "home_water_purification": "Purification d'Eau Domestique",
    "home_user_description": "Pour les utilisateurs particuliers avec des produits de purification MYWATER",
    "business_water_management": "Gestion de l'Eau Professionnelle",
    "business_description": "Pour les clients commerciaux gérant plusieurs unités de purification d'eau",
    "track_maintenance": "Suivez le calendrier d'entretien de votre purificateur pour ne jamais manquer un changement de filtre",
    "refer_friends": "Gagnez des cartouches de remplacement gratuites en parrainant des amis qui se soucient de l'eau propre",
    "environmental_impact": "Mesurez votre impact environnemental et célébrez chaque étape durable",
    "monitor_units": "Surveillez et gérez plusieurs unités de purification d'eau",
    "advanced_analytics": "Outils d'analyse et de rapports avancés",
    "technical_support": "Support technique et gestion des services",
    "continue": "Continuer",
    "join_cta": "🚀 Rejoignez MYWATER maintenant - rendez l'eau propre plus intelligente et plus écologique !",
  }
};

// Language context provider
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get initial language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem("language") as Language;
    return savedLang && (savedLang === "en" || savedLang === "fr") ? savedLang : "en";
  });

  // Update localStorage when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Translation function
  const t = (key: string, params?: TranslationParams) => {
    let text = translations[language][key] || translations["en"][key] || key;
    
    // Replace params in translation string
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
