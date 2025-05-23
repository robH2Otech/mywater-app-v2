
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Available languages
export type Language = "en" | "sl";

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

// Translations for English and Slovenian
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
    "slovenian": "Slovenian",
    
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
    "welcome_to": "Welcome to",
    "app_subtitle": "Drink cleaner water, save money and stay informed.",
    "private_user": "Private User",
    "business_client": "Business Client",
    "home_water_purification": "Home Water Purification",
    "home_user_description": "For home users with X-WATER purification products",
    "business_water_management": "Business Water Management",
    "business_description": "For commercial clients managing multiple water purification units",
    "track_maintenance": "Track your purifier's maintenance schedule so you never miss a filter change",
    "refer_friends": "Earn free replacement cartridges by referring friends who care about clean water",
    "environmental_impact": "Measure your environmental impact and celebrate every sustainable milestone",
    "monitor_units": "Monitor and manage multiple water purification units",
    "advanced_analytics": "Advanced analytics and reporting tools",
    "technical_support": "Technical support and service management",
    "continue": "Continue",
  },
  sl: {
    // Dashboard
    "dashboard.title": "Nadzorna plošča",
    "dashboard.welcome": "Dobrodošli na nadzorni plošči!",
    "dashboard.welcome.user": "Živjo {name}, dobrodošli nazaj!",
    "dashboard.usage.title": "Poraba vode",
    "dashboard.alerts.title": "Nedavna opozorila",
    "dashboard.no.alerts": "Ni nedavnih opozoril",
    
    // Navigation
    "nav.dashboard": "Nadzorna plošča",
    "nav.water.units": "Vodne enote",
    "nav.filters": "Filtri",
    "nav.uvc": "UVC",
    "nav.alerts": "Opozorila",
    "nav.analytics": "Analitika",
    "nav.users": "Uporabniki",
    "nav.settings": "Nastavitve",
    "nav.client.requests": "Zahteve strank",
    
    // Units
    "units.title": "Vodne enote",
    "units.add": "Dodaj enoto",
    "units.edit": "Uredi enoto",
    "units.details": "Podrobnosti enote",
    "units.name": "Ime enote",
    "units.location": "Lokacija",
    "units.volume": "Skupni volumen (m³)",
    "units.status": "Status",
    "units.contact": "Kontakt za vzdrževanje",
    "units.email": "E-pošta",
    "units.phone": "Telefon",
    "units.next.maintenance": "Naslednje vzdrževanje",
    "units.last.maintenance": "Zadnje vzdrževanje",
    "units.setup.date": "Datum namestitve",
    "units.measurements": "Podatki o vodi za zadnjih 24 ur",
    "units.no.measurements": "Še ni zabeleženih meritev",
    "units.loading.measurements": "Nalaganje meritev...",
    
    // Filters
    "filters.title": "Filtri",
    "filters.add": "Dodaj filter",
    "filters.edit": "Uredi filter",
    "filters.details": "Podrobnosti filtra",
    
    // UVC
    "uvc.title": "UVC enote",
    "uvc.hours": "UVC ure",
    "uvc.installation.date": "Datum namestitve",
    
    // Alerts
    "alerts.title": "Opozorila",
    "alerts.create": "Ustvari opozorilo",
    "alerts.details": "Podrobnosti opozorila",
    "alerts.unit": "ID enote",
    "alerts.message": "Sporočilo",
    "alerts.status": "Status",
    "alerts.assign": "Dodeli",
    "alerts.comments": "Komentarji",
    
    // Analytics
    "analytics.title": "Analitika",
    "analytics.reports": "Poročila",
    "analytics.generate": "Ustvari poročilo",
    "analytics.select.unit": "Izberi enoto",
    "analytics.report.type": "Vrsta poročila",
    "analytics.generating": "Ustvarjanje...",
    
    // Users
    "users.title": "Uporabniki",
    "users.add": "Dodaj uporabnika",
    "users.name": "Ime",
    "users.email": "E-pošta",
    "users.role": "Vloga",
    "users.status": "Status",
    
    // Settings
    "settings.title": "Nastavitve",
    "settings.theme": "Tema",
    "settings.language": "Jezik",
    "settings.notifications": "Obvestila",
    "settings.data": "Upravljanje podatkov",
    "settings.about": "O aplikaciji",
    "settings.disclaimer": "Izjava o omejitvi odgovornosti",
    
    // General
    "status.active": "Aktivno",
    "status.warning": "Opozorilo",
    "status.urgent": "Nujna sprememba",
    "status.attention": "Pozor",
    "status.maintenance": "Vzdrževanje",
    "status.inactive": "Neaktivno",
    
    "button.save": "Shrani spremembe",
    "button.cancel": "Prekliči",
    "button.create": "Ustvari",
    "button.edit": "Uredi",
    "button.delete": "Izbriši",
    "button.back": "Nazaj",
    "button.sync": "Sinhroniziraj meritve",
    "button.syncing": "Sinhroniziranje...",
    "button.clear.cache": "Počisti predpomnilnik",
    "button.export.data": "Izvozi podatke",
    "button.download": "Prenesi PDF",
    
    "form.required": "Obvezno",
    "form.scroll": "Pomik",
    
    "toast.success": "Uspeh",
    "toast.error": "Napaka",
    "toast.update.success": "Uspešno posodobljeno",
    "toast.create.success": "Uspešno ustvarjeno",
    "toast.delete.success": "Uspešno izbrisano",
    "toast.cache.cleared": "Predpomnilnik aplikacije je bil uspešno izbrisan.",
    "toast.export.started": "Izvoz podatkov je začet.",
    
    "english": "Angleščina",
    "slovenian": "Slovenščina",
    
    "system": "Sistemska",
    "light": "Svetla",
    "dark": "Temna",

    // Chart related translations
    "chart.select.timerange": "Izberi časovni razpon",
    "chart.24hours": "Zadnjih 24 ur",
    "chart.7days": "Zadnjih 7 dni",
    "chart.30days": "Zadnjih 30 dni",
    "chart.6months": "Zadnjih 6 mesecev",
    "chart.loading": "Nalaganje podatkov...",
    "chart.no.data": "Ni podatkov",
    "chart.volume": "Volumen (m³)",
    "dashboard.loading": "Nalaganje podatkov...",
    "dashboard.total.units": "Skupne enote",
    "dashboard.filter.changes": "Potrebne menjave filtrov",
    "dashboard.active.alerts": "Aktivna opozorila",
    "dashboard.volume.today": "Skupni volumen danes",
    
    // Landing page
    "welcome_to": "Dobrodošli v",
    "app_subtitle": "Pijte čistejšo vodo, prihranite denar in bodite obveščeni.",
    "private_user": "Zasebni uporabnik",
    "business_client": "Poslovni uporabnik",
    "home_water_purification": "Domače čiščenje vode",
    "home_user_description": "Za domače uporabnike izdelkov X-WATER za čiščenje vode",
    "business_water_management": "Poslovno upravljanje vode",
    "business_description": "Za poslovne stranke, ki upravljajo več enot za čiščenje vode",
    "track_maintenance": "Spremljajte urnik vzdrževanja vašega čistilca, da ne boste nikoli zamudili menjave filtra",
    "refer_friends": "Zaslužite brezplačne nadomestne kartuše s priporočanjem prijateljev, ki jim je mar za čisto vodo",
    "environmental_impact": "Izmerite svoj okoljski vpliv in praznujte vsak trajnostni mejnik",
    "monitor_units": "Spremljajte in upravljajte več enot za čiščenje vode",
    "advanced_analytics": "Napredna orodja za analizo in poročanje",
    "technical_support": "Tehnična podpora in upravljanje storitev",
    "continue": "Nadaljuj",
  }
};

// Language context provider
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get initial language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem("language") as Language;
    return savedLang && (savedLang === "en" || savedLang === "sl") ? savedLang : "en";
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
