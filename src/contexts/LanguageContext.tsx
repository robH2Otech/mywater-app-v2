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
    
    // Greetings
    "greeting.good.morning": "Good morning",
    "greeting.good.afternoon": "Good afternoon", 
    "greeting.good.evening": "Good evening",
    "greeting.welcome.back": "Welcome to your dashboard",
    
    // Dashboard specific
    "dashboard.data.loaded": "Data loaded",
    "dashboard.units": "units",
    "dashboard.alerts": "alerts", 
    "dashboard.filters": "filters",
    "dashboard.superadmin.access": "Superadmin Access",
    "dashboard.company": "Company",
    "dashboard.refresh": "Refresh",
    "dashboard.debug": "Debug",
    "dashboard.debug.panel": "Debug Panel",
    "dashboard.auth.error": "Authentication Error",
    "dashboard.data.loading.error": "Data Loading Error",
    "dashboard.failed.to.load": "Failed to load data",
    "dashboard.retry": "Retry",
    "dashboard.refresh.data": "Refresh Data",
    "dashboard.loading": "Loading dashboard data...",
    "dashboard.loading.data": "Loading data...",
    "dashboard.total.units": "Total Units",
    "dashboard.filter.changes": "Filter Changes Required",
    "dashboard.active.alerts": "Active Alerts",
    "dashboard.volume.today": "Total Volume Today",
    
    // Stats
    "stats.total.units": "Total Units",
    "stats.filter.changes": "Filter Changes Required", 
    "stats.active.alerts": "Active Alerts",
    "stats.volume.today": "Total Volume Today",
    
    // Chart
    "chart.water.usage": "Water Usage",
    "chart.no.units": "No units",
    "chart.data.points": "data points",
    "chart.select.timerange": "Select time range",
    "chart.24hours": "Last 24 hours",
    "chart.7days": "Last 7 days",
    "chart.30days": "Last 30 days",
    "chart.6months": "Last 6 months",
    "chart.loading": "Loading chart data...",
    "chart.no.data": "No data available",
    "chart.volume": "Volume (m³)",
    
    // Recent Alerts
    "alerts.recent.title": "Recent Alerts (Last 7 Days)",
    "alerts.error.loading": "Error loading recent alerts",
    "alerts.no.active": "No active alerts in the last 7 days",
    "alerts.click.view.all": "Click to view all alerts →",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.water.units": "Water Units",
    "nav.locations": "Units Location",
    "nav.filters": "Filters",
    "nav.uvc": "UVC",
    "nav.alerts": "Alerts",
    "nav.analytics": "Analytics",
    "nav.predictive.maintenance": "Predictive Maintenance",
    "nav.users": "Users",
    "nav.client.requests": "Client Requests",
    "nav.impact": "Impact",
    "nav.settings": "Settings",
    "nav.logout": "Log Out",
    "nav.search": "Search...",
    
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
    
    // Business UVC Dashboard
    "business.uvc.title": "Business UVC System Performance",
    "business.uvc.subtitle": "Professional water purification metrics and efficiency tracking",
    "business.uvc.water.processed": "m³ Processed",
    "business.uvc.system.uptime": "System Uptime",
    "business.uvc.cost.savings": "Cost Savings",
    "business.uvc.efficiency": "Efficiency",
    "business.uvc.energy.saved": "Energy Saved",
    "business.uvc.water.waste.prevented": "Water Waste Prevented",
    "business.uvc.maintenance.efficiency": "Maintenance Efficiency",
    "business.uvc.operational.hours": "operating hours",
    "business.uvc.cost.equivalent": "equivalent",
    "business.uvc.operational.efficiency": "Operational efficiency",
    "business.uvc.excellent.performance": "Excellent performance",
    "business.uvc.good.performance": "Good performance",
    "business.uvc.average.performance": "Average performance",
    "business.uvc.needs.attention": "Needs attention",
    "business.uvc.optimal.efficiency": "Optimal efficiency",
    "business.uvc.good.efficiency": "Good efficiency",  
    "business.uvc.fair.efficiency": "Fair efficiency",
    "business.uvc.maintenance.required": "Maintenance required",
    "business.uvc.system.efficiency.trend": "System Efficiency Trend",
    "business.uvc.water.flow.rate": "Water Flow Rate (m³)",
    "business.uvc.energy.savings": "Energy Savings (kWh)",
    "business.uvc.system.performance.overview": "System Performance Overview",
    "business.uvc.maintenance.schedule": "Maintenance Schedule",
    "business.uvc.urgent.actions": "Urgent Actions",
    "business.uvc.due.soon": "Due Soon",
    "business.uvc.overall.efficiency": "Overall Efficiency",
    "business.uvc.requires.immediate.attention": "Requires immediate attention",
    "business.uvc.schedule.maintenance": "Schedule maintenance",
    "business.uvc.system.performance": "System performance",
    "business.uvc.multi.location.performance": "Multi-Location Performance",
    "business.uvc.compare.performance": "Compare performance across different facilities",
    "business.uvc.water.processing.by.location": "Water Processing by Location",
    "business.uvc.cost.savings.by.location": "Cost Savings by Location",
    "business.uvc.location.details": "Location Details",
    "business.uvc.esg.compliance.reports": "ESG & Compliance Reports",
    "business.uvc.generate.reports": "Generate comprehensive reports for stakeholders and compliance",
    "business.uvc.esg.impact.summary": "ESG Impact Summary",
    "business.uvc.operational.performance": "Operational Performance",
    "business.uvc.compliance.certification": "Compliance & Certification",
    "business.uvc.stakeholder.impact": "Stakeholder Impact",
    "business.uvc.report.summary.metrics": "Report Summary Metrics",
  },
  sl: {
    // Dashboard
    "dashboard.title": "Nadzorna plošča",
    "dashboard.welcome": "Dobrodošli na nadzorni plošči!",
    "dashboard.welcome.user": "Živjo {name}, dobrodošli nazaj!",
    "dashboard.usage.title": "Poraba vode",
    "dashboard.alerts.title": "Nedavna opozorila",
    "dashboard.no.alerts": "Ni nedavnih opozoril",
    
    // Greetings
    "greeting.good.morning": "Dobro jutro",
    "greeting.good.afternoon": "Dober dan",
    "greeting.good.evening": "Dober večer", 
    "greeting.welcome.back": "Dobrodošli na svoji nadzorni plošči",
    
    // Dashboard specific
    "dashboard.data.loaded": "Podatki naloženi",
    "dashboard.units": "enote",
    "dashboard.alerts": "opozorila",
    "dashboard.filters": "filtri", 
    "dashboard.superadmin.access": "Superadmin dostop",
    "dashboard.company": "Podjetje",
    "dashboard.refresh": "Osveži",
    "dashboard.debug": "Razhroščevanje",
    "dashboard.debug.panel": "Plošča za razhroščevanje",
    "dashboard.auth.error": "Napaka pri avtentikaciji",
    "dashboard.data.loading.error": "Napaka pri nalaganju podatkov",
    "dashboard.failed.to.load": "Nalaganje podatkov neuspešno",
    "dashboard.retry": "Poskusi znova",
    "dashboard.refresh.data": "Osveži podatke",
    "dashboard.loading": "Nalaganje podatkov nadzorne plošče...",
    "dashboard.loading.data": "Nalaganje podatkov...",
    "dashboard.total.units": "Skupne enote",
    "dashboard.filter.changes": "Potrebne menjave filtrov",
    "dashboard.active.alerts": "Aktivna opozorila",
    "dashboard.volume.today": "Skupni volumen danes",
    
    // Stats
    "stats.total.units": "Skupaj enot",
    "stats.filter.changes": "Potrebne menjave filtrov",
    "stats.active.alerts": "Aktivna opozorila", 
    "stats.volume.today": "Skupni volumen danes",
    
    // Chart
    "chart.water.usage": "Poraba vode",
    "chart.no.units": "Ni enot",
    "chart.data.points": "podatkovne točke",
    "chart.select.timerange": "Izberi časovni razpon",
    "chart.24hours": "Zadnjih 24 ur",
    "chart.7days": "Zadnjih 7 dni",
    "chart.30days": "Zadnjih 30 dni",
    "chart.6months": "Zadnjih 6 mesecev",
    "chart.loading": "Nalaganje podatkov...",
    "chart.no.data": "Ni podatkov",
    "chart.volume": "Volumen (m³)",
    
    // Recent Alerts
    "alerts.recent.title": "Nedavna opozorila (zadnjih 7 dni)",
    "alerts.error.loading": "Napaka pri nalaganju nedavnih opozoril",
    "alerts.no.active": "Ni aktivnih opozoril v zadnjih 7 dneh",
    "alerts.click.view.all": "Kliknite za ogled vseh opozoril →",
    
    // Navigation
    "nav.dashboard": "Nadzorna plošča",
    "nav.water.units": "Vodne enote",
    "nav.locations": "Lokacije enot",
    "nav.filters": "Filtri",
    "nav.uvc": "UVC",
    "nav.alerts": "Opozorila",
    "nav.analytics": "Analitika",
    "nav.predictive.maintenance": "Napovedovalno vzdrževanje",
    "nav.users": "Uporabniki",
    "nav.client.requests": "Zahteve strank",
    "nav.impact": "Vpliv",
    "nav.settings": "Nastavitve",
    "nav.logout": "Odjava",
    "nav.search": "Iskanje...",
    
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
    
    // Business UVC Dashboard  
    "business.uvc.title": "Poslovna učinkovitost UVC sistema",
    "business.uvc.subtitle": "Profesionalne metrike čiščenja vode in sledenje učinkovitosti",
    "business.uvc.water.processed": "m³ predelano",
    "business.uvc.system.uptime": "Delovanje sistema",
    "business.uvc.cost.savings": "Prihranki stroškov",
    "business.uvc.efficiency": "Učinkovitost",
    "business.uvc.energy.saved": "Prihranjena energija",
    "business.uvc.water.waste.prevented": "Preprečena izguba vode",
    "business.uvc.maintenance.efficiency": "Učinkovitost vzdrževanja",
    "business.uvc.operational.hours": "obratovalne ure",
    "business.uvc.cost.equivalent": "ekvivalent",
    "business.uvc.operational.efficiency": "Operativna učinkovitost",
    "business.uvc.excellent.performance": "Odlična učinkovitost",
    "business.uvc.good.performance": "Dobra učinkovitost",
    "business.uvc.average.performance": "Povprečna učinkovitost",
    "business.uvc.needs.attention": "Potrebna pozornost",
    "business.uvc.optimal.efficiency": "Optimalna učinkovitost",
    "business.uvc.good.efficiency": "Dobra učinkovitost",
    "business.uvc.fair.efficiency": "Zadovoljiva učinkovitost",
    "business.uvc.maintenance.required": "Potrebno vzdrževanje",
    "business.uvc.system.efficiency.trend": "Trend učinkovitosti sistema",
    "business.uvc.water.flow.rate": "Pretok vode (m³)",
    "business.uvc.energy.savings": "Prihranki energije (kWh)",
    "business.uvc.system.performance.overview": "Pregled delovanja sistema",
    "business.uvc.maintenance.schedule": "Urnik vzdrževanja",
    "business.uvc.urgent.actions": "Nujni ukrepi",
    "business.uvc.due.soon": "Kmalu potrebno",
    "business.uvc.overall.efficiency": "Splošna učinkovitost",
    "business.uvc.requires.immediate.attention": "Potrebna takojšnja pozornost",
    "business.uvc.schedule.maintenance": "Načrtovano vzdrževanje",
    "business.uvc.system.performance": "Delovanje sistema",
    "business.uvc.multi.location.performance": "Učinkovitost več lokacij",
    "business.uvc.compare.performance": "Primerjaj učinkovitost različnih objektov",
    "business.uvc.water.processing.by.location": "Obdelava vode po lokacijah",
    "business.uvc.cost.savings.by.location": "Prihranki stroškov po lokacijah", 
    "business.uvc.location.details": "Podrobnosti lokacije",
    "business.uvc.esg.compliance.reports": "ESG in skladnostna poročila",
    "business.uvc.generate.reports": "Ustvari celovita poročila za deležnike in skladnost",
    "business.uvc.esg.impact.summary": "Povzetek ESG vpliva",
    "business.uvc.operational.performance": "Operativna učinkovitost",
    "business.uvc.compliance.certification": "Skladnost in certifikacija",
    "business.uvc.stakeholder.impact": "Vpliv na deležnike",
    "business.uvc.report.summary.metrics": "Povzetek metrik poročila",
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
