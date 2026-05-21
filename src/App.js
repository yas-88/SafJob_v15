import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const HAZARD_CATEGORIES = [
  { id: "fall", label: "Fall Protection", icon: "⬇️", osha: "29 CFR 1926.502" },
  {
    id: "electrical",
    label: "Electrical",
    icon: "⚡",
    osha: "29 CFR 1926.400",
  },
  { id: "ppe", label: "PPE", icon: "🦺", osha: "29 CFR 1926.95" },
  {
    id: "scaffolding",
    label: "Scaffolding",
    icon: "🏗️",
    osha: "29 CFR 1926.451",
  },
  { id: "struckby", label: "Struck-By", icon: "🚧", osha: "29 CFR 1926.600" },
  {
    id: "caught",
    label: "Caught-In/Between",
    icon: "⚙️",
    osha: "29 CFR 1926.350",
  },
  {
    id: "excavation",
    label: "Excavation/Trenching",
    icon: "🪨",
    osha: "29 CFR 1926.652",
  },
  { id: "fire", label: "Fire/Flammables", icon: "🔥", osha: "NFPA 241" },
  {
    id: "equipment",
    label: "Heavy Equipment",
    icon: "🚜",
    osha: "29 CFR 1926.601",
  },
  {
    id: "hazmat",
    label: "Hazardous Materials",
    icon: "☣️",
    osha: "29 CFR 1910.1200",
  },
  {
    id: "housekeeping",
    label: "Housekeeping/Debris",
    icon: "🧹",
    osha: "29 CFR 1926.25",
  },
  { id: "other", label: "Other", icon: "📋", osha: "General Duty" },
];

const SEVERITIES = [
  {
    id: "imminent",
    label: "Imminent Danger",
    color: "#dc2626",
    bg: "#fef2f2",
    desc: "Stop work immediately",
  },
  {
    id: "serious",
    label: "Serious",
    color: "#ea580c",
    bg: "#fff7ed",
    desc: "Correct within 24 hrs",
  },
  {
    id: "moderate",
    label: "Moderate",
    color: "#ca8a04",
    bg: "#fefce8",
    desc: "Correct within 1 week",
  },
  {
    id: "low",
    label: "Low",
    color: "#16a34a",
    bg: "#f0fdf4",
    desc: "Monitor & document",
  },
];

const INCIDENT_TYPES = [
  { id: "nearmiss", label: "Near Miss", color: "#ca8a04" },
  { id: "firstaid", label: "First Aid", color: "#ea580c" },
  { id: "recordable", label: "Recordable Injury", color: "#dc2626" },
  { id: "propertydam", label: "Property Damage", color: "#7c3aed" },
  { id: "environmental", label: "Environmental", color: "#0891b2" },
];

const INSPECTION_TEMPLATES = {
  general: {
    label: "General Construction",
    icon: "🏗️",
    sections: [
      {
        id: "site_access",
        label: "Site Access & Perimeter",
        items: [
          "Site entrance secured and marked",
          "Fencing/barriers in place",
          "Signage posted",
          "Emergency access routes clear",
        ],
      },
      {
        id: "ppe",
        label: "PPE Compliance",
        items: [
          "Hard hats worn by all",
          "Safety vests / hi-vis worn",
          "Safety glasses in use",
          "Proper footwear worn",
          "Gloves available and used",
          "Hearing protection available",
        ],
      },
      {
        id: "fall",
        label: "Fall Protection",
        items: [
          "Guardrails at open edges (4ft+)",
          "Floor openings covered",
          "Ladders secured at correct angle",
          "Scaffolding inspected and tagged",
          "PFAS in use where required",
        ],
      },
      {
        id: "electrical",
        label: "Electrical Safety",
        items: [
          "Temporary panels secured",
          "GFCI on all cords",
          "Cords free of damage",
          "LOTO procedures posted",
          "No unauthorized energized work",
        ],
      },
      {
        id: "tools",
        label: "Tools & Equipment",
        items: [
          "Power tools in good condition",
          "Guards in place on tools",
          "Equipment pre-use inspection done",
          "Operators certified",
          "Spotter used for blind movements",
        ],
      },
      {
        id: "fire",
        label: "Fire Prevention",
        items: [
          "Fire extinguishers accessible",
          "Flammables stored properly",
          "Hot work permit obtained if needed",
          "Assembly point posted",
        ],
      },
      {
        id: "housekeeping",
        label: "Housekeeping",
        items: [
          "Walkways clear of debris",
          "Waste containers in use",
          "Spill cleanup materials on hand",
          "No trip hazards in work areas",
        ],
      },
      {
        id: "emergency",
        label: "Emergency Preparedness",
        items: [
          "First aid kit stocked",
          "Emergency contacts posted",
          "Hospital route known",
          "Incident reporting procedure posted",
        ],
      },
    ],
  },
  civil: {
    label: "Civil / Heavy Highway",
    icon: "🌉",
    sections: [
      {
        id: "traffic",
        label: "Traffic Control",
        items: [
          "MUTCD-compliant signage posted",
          "Flaggers properly trained and visible",
          "Lane closure tapers correct",
          "Cones/barriers spaced per spec",
          "Work zone illumination adequate",
        ],
      },
      {
        id: "excavation",
        label: "Excavation & Trenching",
        items: [
          "Trenches 5ft+ properly shored or sloped",
          "Spoil piles 2ft+ from edge",
          "Daily competent person inspection logged",
          "Egress every 25ft (ladder/ramp)",
          "Atmospheric testing done if 4ft+",
          "Underground utilities located (811 ticket)",
        ],
      },
      {
        id: "heavy_equip",
        label: "Heavy Equipment",
        items: [
          "Pre-shift inspection completed",
          "Operators certified for equipment type",
          "Backup alarms functional",
          "Spotter used in tight quarters",
          "Swing radius barricaded",
        ],
      },
      {
        id: "concrete",
        label: "Concrete Operations",
        items: [
          "Forms inspected before pour",
          "Rebar caps installed",
          "Concrete pump lines secured",
          "Vibrator cords protected",
          "Skin/eye protection in use",
        ],
      },
      {
        id: "environmental",
        label: "Environmental Controls",
        items: [
          "SWPPP measures in place",
          "Silt fencing intact",
          "Dust control active",
          "Spill kits accessible",
          "Fuel storage compliant",
        ],
      },
      {
        id: "emergency",
        label: "Emergency Preparedness",
        items: [
          "First aid kit stocked",
          "Emergency contacts posted",
          "Hospital route known",
          "Site evacuation plan posted",
        ],
      },
    ],
  },
  residential: {
    label: "Residential",
    icon: "🏠",
    sections: [
      {
        id: "site",
        label: "Site Conditions",
        items: [
          "Driveway/access clear",
          "Material storage organized",
          "Debris removed daily",
          "Neighbor protection in place",
          "Site secure overnight",
        ],
      },
      {
        id: "ppe",
        label: "PPE Compliance",
        items: [
          "Hard hats worn",
          "Safety glasses in use",
          "Proper footwear worn",
          "Gloves used for material handling",
          "Dust masks for cutting/sanding",
        ],
      },
      {
        id: "fall",
        label: "Fall Protection",
        items: [
          "Roof anchors installed (6ft+)",
          "Harnesses worn on roof work",
          "Ladders extend 3ft past landing",
          "Window openings protected",
          "Stair temp guardrails in place",
        ],
      },
      {
        id: "framing",
        label: "Framing & Carpentry",
        items: [
          "Saw guards in place",
          "Nail gun safeties functional",
          "Cutting station organized",
          "Lumber stacked safely",
          "Compressor hoses protected",
        ],
      },
      {
        id: "electrical",
        label: "Electrical (Rough/Finish)",
        items: [
          "Panel locked when energized",
          "GFCI temp power in use",
          "Wire nuts properly capped",
          "No energized work without LOTO",
          "Junction boxes covered",
        ],
      },
      {
        id: "emergency",
        label: "Emergency Preparedness",
        items: [
          "First aid kit on site",
          "Emergency contacts posted",
          "Fire extinguisher accessible",
          "Cell coverage confirmed",
        ],
      },
    ],
  },
  industrial: {
    label: "Industrial / Plant",
    icon: "🏭",
    sections: [
      {
        id: "permits",
        label: "Permits & Authorizations",
        items: [
          "Hot work permit current",
          "Confined space permit (if applicable)",
          "Energized work permit (if applicable)",
          "Excavation permit (if applicable)",
          "All permits posted at work area",
        ],
      },
      {
        id: "loto",
        label: "Lockout/Tagout",
        items: [
          "Energy sources identified",
          "Locks/tags applied per procedure",
          "Try-out test verified zero energy",
          "Affected workers notified",
          "Group lockout box used (multi-worker)",
        ],
      },
      {
        id: "confined",
        label: "Confined Space",
        items: [
          "Atmospheric testing pre-entry",
          "Continuous monitoring active",
          "Attendant posted",
          "Rescue plan reviewed",
          "Communication with entrants confirmed",
        ],
      },
      {
        id: "hot_work",
        label: "Hot Work",
        items: [
          "Fire watch present",
          "Fire extinguisher within 35ft",
          "Combustibles 35ft clearance",
          "Welding screens in place",
          "Permit posted at location",
        ],
      },
      {
        id: "chemical",
        label: "Chemical Safety",
        items: [
          "SDS available and reviewed",
          "Containers labeled per HazCom",
          "Incompatible chemicals separated",
          "Eyewash/shower accessible (10s)",
          "PPE matches SDS requirements",
        ],
      },
      {
        id: "emergency",
        label: "Emergency Preparedness",
        items: [
          "First aid kit stocked",
          "Emergency contacts posted",
          "Evacuation routes clear",
          "Spill response plan known",
        ],
      },
    ],
  },
  demolition: {
    label: "Demolition",
    icon: "💥",
    sections: [
      {
        id: "pre_demo",
        label: "Pre-Demolition",
        items: [
          "Engineering survey completed",
          "Utilities disconnected and verified",
          "Asbestos/lead survey complete",
          "Structural assessment current",
          "Demo plan posted",
        ],
      },
      {
        id: "hazmat",
        label: "Hazardous Materials",
        items: [
          "Asbestos abatement complete",
          "Lead paint controls in place",
          "Mercury/PCB items removed",
          "Containment in place where required",
          "Air monitoring active if applicable",
        ],
      },
      {
        id: "controlled",
        label: "Controlled Demolition",
        items: [
          "Exclusion zone established",
          "Spotters posted",
          "Dust suppression active",
          "Equipment stable on solid ground",
          "No workers below active demo",
        ],
      },
      {
        id: "debris",
        label: "Debris Management",
        items: [
          "Chutes secured for high drops",
          "Loading area controlled",
          "Trucks tarped before leaving",
          "Recyclables separated",
          "No overloading of structures",
        ],
      },
      {
        id: "ppe",
        label: "PPE Compliance",
        items: [
          "Hard hats worn",
          "Eye protection in use",
          "Respirators (correct cartridge)",
          "Cut-resistant gloves",
          "Steel-toed boots",
        ],
      },
      {
        id: "emergency",
        label: "Emergency Preparedness",
        items: [
          "First aid kit stocked",
          "Emergency contacts posted",
          "Stop-work authority known",
          "Evacuation route clear",
        ],
      },
    ],
  },
};

const LANGUAGES = { en: "English", es: "Español", pt: "Português" };
const TRANSLATIONS = {
  en: {
    log: "Log",
    observations: "Observe",
    inspect: "Inspect",
    incidents: "Incidents",
    talk: "Talk",
    analytics: "Analytics",
    submitObs: "Submit Observation",
    site: "Site",
    location: "Location / Area",
    hazardCat: "Hazard Category",
    severity: "Severity Level",
    description: "Description",
    assignTo: "Assign To",
    photo: "Photo",
    attachPhoto: "Attach Photo",
    changePhoto: "Change Photo",
    noObs: "No observations for this site yet.",
    export: "Export",
    addSite: "+ Site",
    signOff: "+ Add Sign-off",
    generateTalk: "✦ Generate Toolbox Talk",
    getAI: "✦ Get AI Corrective Action",
    viewAI: "✓ View OSHA Corrective Action",
    generating: "Generating…",
    submitted: "✓ Observation submitted!",
    incidentReported: "✓ Incident reported!",
    reportIncident: "Report an Incident",
    submitIncident: "Submit Incident Report",
    pass: "✓ Pass",
    fail: "✗ Fail",
    na: "N/A",
    open: "Open",
    inProgress: "In Progress",
    resolved: "Resolved",
    roster: "Worker Roster",
    manage: "Manage",
    workerSignoffs: "Worker Sign-offs",
    all: "All",
    filterBy: "Filter",
  },
  es: {
    log: "Registrar",
    observations: "Observar",
    inspect: "Inspección",
    incidents: "Incidentes",
    talk: "Charla",
    analytics: "Análisis",
    submitObs: "Enviar Observación",
    site: "Obra",
    location: "Ubicación / Área",
    hazardCat: "Categoría de Peligro",
    severity: "Nivel de Gravedad",
    description: "Descripción",
    assignTo: "Asignar A",
    photo: "Foto",
    attachPhoto: "Adjuntar Foto",
    changePhoto: "Cambiar Foto",
    noObs: "Sin observaciones para esta obra.",
    export: "Exportar",
    addSite: "+ Obra",
    signOff: "+ Agregar Firma",
    generateTalk: "✦ Generar Charla",
    getAI: "✦ Acción Correctiva IA",
    viewAI: "✓ Ver Acción OSHA",
    generating: "Generando…",
    submitted: "✓ ¡Observación enviada!",
    incidentReported: "✓ ¡Incidente reportado!",
    reportIncident: "Reportar Incidente",
    submitIncident: "Enviar Reporte",
    pass: "✓ Cumple",
    fail: "✗ No Cumple",
    na: "N/A",
    open: "Abierto",
    inProgress: "En Proceso",
    resolved: "Resuelto",
    roster: "Lista de Trabajadores",
    manage: "Gestionar",
    workerSignoffs: "Firmas de Trabajadores",
    all: "Todos",
    filterBy: "Filtrar",
  },
  pt: {
    log: "Registrar",
    observations: "Observar",
    inspect: "Inspeção",
    incidents: "Incidentes",
    talk: "Palestra",
    analytics: "Análise",
    submitObs: "Enviar Observação",
    site: "Obra",
    location: "Local / Área",
    hazardCat: "Categoria de Perigo",
    severity: "Nível de Gravidade",
    description: "Descrição",
    assignTo: "Atribuir A",
    photo: "Foto",
    attachPhoto: "Anexar Foto",
    changePhoto: "Mudar Foto",
    noObs: "Sem observações para esta obra.",
    export: "Exportar",
    addSite: "+ Obra",
    signOff: "+ Adicionar Assinatura",
    generateTalk: "✦ Gerar Palestra",
    getAI: "✦ Ação Corretiva IA",
    viewAI: "✓ Ver Ação OSHA",
    generating: "Gerando…",
    submitted: "✓ Observação enviada!",
    incidentReported: "✓ Incidente reportado!",
    reportIncident: "Reportar Incidente",
    submitIncident: "Enviar Relatório",
    pass: "✓ Aprovado",
    fail: "✗ Reprovado",
    na: "N/A",
    open: "Aberto",
    inProgress: "Em Andamento",
    resolved: "Resolvido",
    roster: "Lista de Trabalhadores",
    manage: "Gerenciar",
    workerSignoffs: "Assinaturas de Trabalhadores",
    all: "Todos",
    filterBy: "Filtrar",
  },
};

const STATUS_COLORS = {
  open: "#dc2626",
  "in-progress": "#ca8a04",
  resolved: "#16a34a",
};
const STATUS_BG = {
  open: "#fef2f2",
  "in-progress": "#fefce8",
  resolved: "#f0fdf4",
};

const sCol = (id) => SEVERITIES.find((s) => s.id === id)?.color || "#888";
const sBg = (id) => SEVERITIES.find((s) => s.id === id)?.bg || "#f5f5f5";
const sLabel = (id) => SEVERITIES.find((s) => s.id === id)?.label || id;
const cLabel = (id) => HAZARD_CATEGORIES.find((c) => c.id === id)?.label || id;
const cIcon = (id) => HAZARD_CATEGORIES.find((c) => c.id === id)?.icon || "📋";
const cOsha = (id) => HAZARD_CATEGORIES.find((c) => c.id === id)?.osha || "";

// ─────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────

const SK = {
  obs: "sj_obs_v6",
  sites: "sj_sites_v1",
  insp: "sj_insp_v2",
  signoffs: "sj_signoffs_v1",
  roster: "sj_roster_v1",
  incidents: "sj_incidents_v1",
  lang: "sj_lang_v1",
  signatures: "sj_sigs_v1",
  siteTemplates: "sj_template_map_v1",
  customTemplates: "sj_custom_templates_v1",
};
function load(k, fb) {
  try {
    return JSON.parse(localStorage.getItem(k)) || fb;
  } catch {
    return fb;
  }
}
function saveLS(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

function defaultObs() {
  return [
    {
      id: 1,
      site: "Downtown Tower – Phase 2",
      location: "Level 3 – East Wing",
      category: "fall",
      severity: "serious",
      description: "Missing guardrail on open floor edge, approx 12ft drop.",
      assignee: "J. Torres",
      status: "open",
      date: "2026-05-05",
      gps: null,
      aiSuggestion: null,
      photo: null,
    },
    {
      id: 2,
      site: "Downtown Tower – Phase 2",
      location: "Ground Floor – Panel Room",
      category: "electrical",
      severity: "imminent",
      description: "Energized panel left open, no LOTO in place.",
      assignee: "M. Chen",
      status: "in-progress",
      date: "2026-05-05",
      gps: null,
      aiSuggestion: null,
      photo: null,
    },
    {
      id: 3,
      site: "Riverside Bridge Retrofit",
      location: "Site Entrance",
      category: "ppe",
      severity: "low",
      description: "Worker observed without hard hat in designated zone.",
      assignee: "A. Reyes",
      status: "resolved",
      date: "2026-05-04",
      gps: null,
      aiSuggestion: null,
      photo: null,
    },
  ];
}

// ─────────────────────────────────────────────
// AI HELPER  (requires VITE_ANTHROPIC_KEY or similar env injection)
// ─────────────────────────────────────────────

async function callClaude(prompt) {
  const key = window.__ANTHROPIC_KEY__ || "";
  if (!key)
    return "⚠️ API key not configured. Set VITE_ANTHROPIC_KEY to enable AI features.";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const d = await res.json();
  return d.content?.map((b) => b.text || "").join("") || "Unable to generate.";
}

// ─────────────────────────────────────────────
// GPS HELPER
// ─────────────────────────────────────────────

function getGPS() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: +p.coords.latitude.toFixed(6),
          lon: +p.coords.longitude.toFixed(6),
          accuracy: Math.round(p.coords.accuracy),
        }),
      () => resolve(null),
      { timeout: 6000, maximumAge: 0 }
    );
  });
}

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────

const BRAND = "#1a3a2a";
const BRAND_LIGHT = "#e8f5ee";
const ACCENT = "#F58220";

const C = {
  wrap: {
    fontFamily: "system-ui,-apple-system,sans-serif",
    maxWidth: 430,
    margin: "0 auto",
    paddingBottom: 100,
    background: "#f5f6f8",
    minHeight: "100vh",
  },
  hdr: { background: BRAND, color: "#fff", padding: "14px 16px 12px" },
  logo: { fontSize: 20, fontWeight: 800, letterSpacing: -0.5 },
  nav: {
    display: "flex",
    background: "#fff",
    borderBottom: "1.5px solid #e5e7eb",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  nb: (a) => ({
    flex: "1 0 auto",
    padding: "11px 6px 9px",
    border: "none",
    background: "none",
    fontSize: 11,
    fontWeight: a ? 700 : 400,
    color: a ? BRAND : "#6b7280",
    borderBottom: a ? `2.5px solid ${BRAND}` : "2.5px solid transparent",
    cursor: "pointer",
    whiteSpace: "nowrap",
    minWidth: 56,
  }),
  body: { padding: "14px 14px 0" },
  card: {
    background: "#fff",
    border: "1px solid #e9eaec",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  lbl: {
    fontSize: 12,
    fontWeight: 600,
    color: "#4b5563",
    marginBottom: 5,
    display: "block",
    letterSpacing: 0.1,
  },
  inp: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
    color: "#111",
    outline: "none",
  },
  catBtn: (a) => ({
    padding: "9px 4px 7px",
    border: `1.5px solid ${a ? BRAND : "#e5e7eb"}`,
    borderRadius: 10,
    background: a ? BRAND_LIGHT : "#fafafa",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  }),
  sevBtn: (sv, a) => ({
    padding: "10px 10px",
    border: `1.5px solid ${a ? sv.color : "#e5e7eb"}`,
    borderRadius: 10,
    background: a ? sv.bg : "#fafafa",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  }),
  btn: (bg = BRAND, c = "#fff") => ({
    width: "100%",
    padding: "13px",
    background: bg,
    color: c,
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  }),
  btnSm: (bg = BRAND, c = "#fff") => ({
    padding: "8px 14px",
    background: bg,
    color: c,
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }),
  badge: (sv) => ({
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    background: sBg(sv),
    color: sCol(sv),
    letterSpacing: 0.2,
  }),
  stBadge: (st) => ({
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    background: STATUS_BG[st],
    color: STATUS_COLORS[st],
    cursor: "pointer",
    letterSpacing: 0.2,
  }),
  statCard: (c) => ({
    background: "#fff",
    borderRadius: 12,
    padding: "12px 8px",
    textAlign: "center",
    border: `1.5px solid ${c}20`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }),
  aiBtn: {
    marginTop: 10,
    width: "100%",
    padding: "10px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    color: "#15803d",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  tag: (c) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 600,
    background: `${c}15`,
    color: c,
  }),
  iconBtn: (bg: string, c) => ({
    flex: 1,
    padding: "8px 6px",
    background: bg,
    border: `1px solid ${c}40`,
    borderRadius: 10,
    color: c,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  }),
};

// ─────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────

const VIEWS = [
  "log",
  "observations",
  "inspect",
  "incidents",
  "talk",
  "analytics",
];
const VIEW_ICONS = ["📝", "👁️", "✅", "🚨", "🗣️", "📊"];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function SafJob() {
  const [view, setView] = useState("log");
  const [lang, setLang] = useState(() => load(SK.lang, "en"));
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [observations, setObservations] = useState(() =>
    load(SK.obs, defaultObs())
  );
  const [sites, setSites] = useState(() =>
    load(SK.sites, [
      "Downtown Tower – Phase 2",
      "Riverside Bridge Retrofit",
      "Harbor Logistics Center",
    ])
  );
  const [activeSite, setActiveSite] = useState(
    () => load(SK.sites, ["Downtown Tower – Phase 2"])[0]
  );
  const [inspections, setInspections] = useState(() => load(SK.insp, {}));
  const [signoffs, setSignoffs] = useState(() => load(SK.signoffs, {}));
  const [signatures, setSignatures] = useState(() => load(SK.signatures, {}));
  const [roster, setRoster] = useState(() =>
    load(SK.roster, ["J. Torres", "M. Chen", "A. Reyes", "D. Kim", "S. Patel"])
  );
  const [incidents, setIncidents] = useState(() => load(SK.incidents, []));
  const [siteTemplates, setSiteTemplates] = useState(() =>
    load(SK.siteTemplates, {})
  );
  const [customTemplates, setCustomTemplates] = useState(() =>
    load(SK.customTemplates, {})
  );

  const [form, setForm] = useState({
    site: load(SK.sites, ["Downtown Tower – Phase 2"])[0],
    location: "",
    category: "",
    severity: "",
    description: "",
    assignee: "",
    photo: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");
  const [aiLoading, setAiLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [obsFilter, setObsFilter] = useState("all");
  const [newSite, setNewSite] = useState("");
  const [showAddSite, setShowAddSite] = useState(false);
  const [talkLoading, setTalkLoading] = useState(false);
  const [talkContent, setTalkContent] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [signoffModal, setSignoffModal] = useState(false);
  const [signoffName, setSignoffName] = useState("");
  const [newRosterName, setNewRosterName] = useState("");
  const [showRoster, setShowRoster] = useState(false);
  const [showTemplateMgr, setShowTemplateMgr] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [annotatingObs, setAnnotatingObs] = useState(null);
  const [incidentForm, setIncidentForm] = useState({
    type: "",
    date: new Date().toISOString().slice(0, 10),
    time: "",
    location: "",
    description: "",
    injured: "",
    bodyPart: "",
    treatment: "",
    witnesses: "",
    reportedBy: "",
  });
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);
  const [qrObs, setQrObs] = useState(null);
  const [sigModal, setSigModal] = useState(null);
  const [overduePing, setOverduePing] = useState([]);

  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const drawing = useRef(false);
  const sigDrawing = useRef(false);
  const lastPos = useRef(null);
  const sigLastPos = useRef(null);

  // Persist
  useEffect(() => {
    saveLS(SK.obs, observations);
  }, [observations]);
  useEffect(() => {
    saveLS(SK.sites, sites);
  }, [sites]);
  useEffect(() => {
    saveLS(SK.insp, inspections);
  }, [inspections]);
  useEffect(() => {
    saveLS(SK.signoffs, signoffs);
  }, [signoffs]);
  useEffect(() => {
    saveLS(SK.roster, roster);
  }, [roster]);
  useEffect(() => {
    saveLS(SK.incidents, incidents);
  }, [incidents]);
  useEffect(() => {
    saveLS(SK.lang, lang);
  }, [lang]);
  useEffect(() => {
    saveLS(SK.signatures, signatures);
  }, [signatures]);
  useEffect(() => {
    saveLS(SK.siteTemplates, siteTemplates);
  }, [siteTemplates]);
  useEffect(() => {
    saveLS(SK.customTemplates, customTemplates);
  }, [customTemplates]);

  // Overdue alerts
  useEffect(() => {
    const now = new Date();
    const overdue = [];
    observations.forEach((o) => {
      if (o.status === "resolved") return;
      const days =
        (now.getTime() - new Date(o.date).getTime()) / (1000 * 60 * 60 * 24);
      const limit =
        o.severity === "imminent"
          ? 0
          : o.severity === "serious"
          ? 1
          : o.severity === "moderate"
          ? 7
          : 30;
      if (days > limit) overdue.push(o);
    });
    setOverduePing(overdue);
  }, [observations]);

  // Derived
  const ff = (k, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const siteObs = observations.filter((o) => o.site === activeSite);
  const counts = { open: 0, "in-progress": 0, resolved: 0 };
  siteObs.forEach((o) => counts[o.status]++);
  const todayKey = () =>
    `${activeSite}__${new Date().toISOString().slice(0, 10)}`;
  const todayInspection = inspections[todayKey()] || {};
  const todaySignoffs = signoffs[todayKey()] || [];
  const todaySigs = signatures[todayKey()] || {};
  const siteIncidents = incidents.filter((i) => i.site === activeSite);
  const allTemplates = { ...INSPECTION_TEMPLATES, ...customTemplates };
  const activeTemplateId = siteTemplates[activeSite] || "general";
  const INSPECTION_SECTIONS =
    allTemplates[activeTemplateId]?.sections ||
    INSPECTION_TEMPLATES.general.sections;

  const siteOverdue = overduePing.filter((o) => o.site === activeSite);

  // Filtered observations
  const filteredObs =
    obsFilter === "all"
      ? siteObs
      : siteObs.filter((o) => o.status === obsFilter);

  // ── Inspection helpers
  function setSiteTemplate(siteKey, tmplId) {
    setSiteTemplates((p) => ({ ...p, [siteKey]: tmplId }));
  }
  function setInspItem(sec, item, val) {
    const k = todayKey();
    setInspections((p) => {
      const c = p[k] || {};
      const s = c[sec] || {};
      return { ...p, [k]: { ...c, [sec]: { ...s, [item]: val } } };
    });
  }
  function getInspItem(sec, item) {
    return todayInspection[sec]?.[item];
  }
  function inspScore() {
    let total = 0,
      pass = 0,
      fail = 0;
    INSPECTION_SECTIONS.forEach((sec) =>
      sec.items.forEach((item) => {
        total++;
        const v = getInspItem(sec.id, item);
        if (v === "pass") pass++;
        if (v === "fail") fail++;
      })
    );
    return { total, pass, fail };
  }

  // ── Photo
  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => ff("photo", ev.target?.result);
    r.readAsDataURL(file);
  }

  // ── Submit observation with GPS
  async function submitObservation() {
    if (!form.location || !form.category || !form.severity || !form.description)
      return;
    setSubmitting(true);
    setGpsStatus("📍 Capturing location…");
    const gps = await getGPS();
    setGpsStatus(
      gps
        ? `📍 ${gps.lat}, ${gps.lon} (±${gps.accuracy}m)`
        : "📍 Location unavailable"
    );
    const timestamp = new Date().toISOString();
    setObservations((p) => [
      {
        id: Date.now(),
        ...form,
        status: "open",
        date: timestamp.slice(0, 10),
        timestamp,
        gps,
      },
      ...p,
    ]);
    setForm((p) => ({
      ...p,
      location: "",
      category: "",
      severity: "",
      description: "",
      assignee: "",
      photo: null,
    }));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setGpsStatus("");
      setView("observations");
    }, 1400);
  }

  // ── AI corrective action
  async function getAI(obs) {
    setAiLoading(obs.id);
    const cat = HAZARD_CATEGORIES.find((c) => c.id === obs.category);
    const sev = SEVERITIES.find((s) => s.id === obs.severity);
    const langNote = lang !== "en" ? ` Respond in ${LANGUAGES[lang]}.` : "";
    const prompt = `Construction safety expert. Observation:\n- Category: ${cat?.label} (${cat?.osha})\n- Severity: ${sev?.label}\n- Location: ${obs.location}\n- Description: ${obs.description}\nProvide corrective action (3-4 bullets) referencing OSHA/NIOSH/ANSI.${langNote} Field-ready. Start directly with bullets.`;
    try {
      const t = await callClaude(prompt);
      setObservations((p) =>
        p.map((o) => (o.id === obs.id ? { ...o, aiSuggestion: t } : o))
      );
    } catch {
      setObservations((p) =>
        p.map((o) =>
          o.id === obs.id
            ? { ...o, aiSuggestion: "Error fetching corrective action." }
            : o
        )
      );
    }
    setAiLoading(null);
  }

  function cycleStatus(id) {
    const order = ["open", "in-progress", "resolved"];
    setObservations((p) =>
      p.map((o) =>
        o.id !== id
          ? o
          : {
              ...o,
              status: order[(order.indexOf(o.status) + 1) % order.length],
            }
      )
    );
  }

  function addSite() {
    if (!newSite.trim()) return;
    const u = [...sites, newSite.trim()];
    setSites(u);
    setActiveSite(newSite.trim());
    setForm((p) => ({ ...p, site: newSite.trim() }));
    setNewSite("");
    setShowAddSite(false);
  }

  // ── Toolbox talk
  async function generateTalk() {
    setTalkLoading(true);
    setTalkContent("");
    const openObs = siteObs.filter((o) => o.status !== "resolved");
    const lines = openObs
      .map(
        (o) =>
          `- ${cLabel(o.category)} (${sLabel(o.severity)}): ${o.description}`
      )
      .join("\n");
    const sc = inspScore();
    const langNote = lang !== "en" ? ` Write in ${LANGUAGES[lang]}.` : "";
    const prompt = `Construction safety manager. Toolbox talk for "${activeSite}".\nOpen hazards:\n${
      lines || "None."
    }\nInspection: ${sc.pass}/${sc.total} passed, ${
      sc.fail
    } failed.${langNote}\nFormat: Title, 2-sentence intro, 3-4 discussion points, closing commitment. Under 300 words. Plain language.`;
    try {
      setTalkContent(await callClaude(prompt));
    } catch {
      setTalkContent("Error generating talk.");
    }
    setTalkLoading(false);
  }

  // ── Sign-off
  function addSignoff(name) {
    if (!name.trim()) return;
    const k = todayKey();
    setSignoffs((p) => ({
      ...p,
      [k]: [
        ...(p[k] || []),
        {
          name: name.trim(),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date().toLocaleDateString(),
        },
      ],
    }));
    setSignoffName("");
    setSignoffModal(false);
  }

  // ── Signature canvas
  function openSigModal(name) {
    setSigModal(name);
    setTimeout(() => {
      const c = sigCanvasRef.current;
      if (!c) return;
      c.width = c.offsetWidth || 300;
      c.height = 130;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      if (todaySigs[name]) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = todaySigs[name];
      }
    }, 80);
  }
  function getSigPos(e, c) {
    const r = c.getBoundingClientRect(),
      src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }
  function sigDown(e) {
    e.preventDefault();
    sigDrawing.current = true;
    sigLastPos.current = getSigPos(e, sigCanvasRef.current);
  }
  function sigMove(e) {
    e.preventDefault();
    if (!sigDrawing.current) return;
    const c = sigCanvasRef.current,
      ctx = c.getContext("2d"),
      pos = getSigPos(e, c);
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sigLastPos.current.x, sigLastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    sigLastPos.current = pos;
  }
  function sigUp(e) {
    e.preventDefault();
    sigDrawing.current = false;
  }
  function saveSig(name) {
    const c = sigCanvasRef.current;
    if (!c) return;
    setSignatures((p) => ({
      ...p,
      [todayKey()]: { ...todaySigs, [name]: c.toDataURL() },
    }));
    setSigModal(null);
  }
  function clearSig() {
    const c = sigCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  // ── Annotation canvas
  function startAnnotating(obs) {
    setAnnotatingObs({ ...obs });
    setTimeout(() => {
      const c = canvasRef.current;
      if (!c || !obs.photo) return;
      c.width = c.offsetWidth || 340;
      c.height = 220;
      const ctx = c.getContext("2d");
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = obs.photo;
    }, 100);
  }
  function getCP(e, c) {
    const r = c.getBoundingClientRect(),
      src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }
  function aDown(e) {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getCP(e, canvasRef.current);
  }
  function aMove(e) {
    e.preventDefault();
    if (!drawing.current) return;
    const c = canvasRef.current,
      ctx = c.getContext("2d"),
      pos = getCP(e, c);
    ctx.strokeStyle = "#ff3b30";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }
  function aUp(e) {
    e.preventDefault();
    drawing.current = false;
  }
  function saveAnnotations() {
    const c = canvasRef.current;
    if (!c) return;
    const merged = c.toDataURL("image/jpeg", 0.85);
    setObservations((p) =>
      p.map((o) => (o.id === annotatingObs.id ? { ...o, photo: merged } : o))
    );
    setAnnotatingObs(null);
  }

  // ── QR
  function generateQR(obs) {
    const t = encodeURIComponent(
      `SafJob Obs #${obs.id}\nSite: ${obs.site}\nLocation: ${
        obs.location
      }\nCategory: ${cLabel(obs.category)}\nSeverity: ${sLabel(
        obs.severity
      )}\nDate: ${obs.date}\nStatus: ${obs.status}`
    );
    setQrObs({
      ...obs,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${t}`,
    });
  }

  // ── Incident
  function submitIncident() {
    if (
      !incidentForm.type ||
      !incidentForm.location ||
      !incidentForm.description
    )
      return;
    setIncidents((p) => [
      { id: Date.now(), site: activeSite, ...incidentForm },
      ...p,
    ]);
    setIncidentForm({
      type: "",
      date: new Date().toISOString().slice(0, 10),
      time: "",
      location: "",
      description: "",
      injured: "",
      bodyPart: "",
      treatment: "",
      witnesses: "",
      reportedBy: "",
    });
    setIncidentSubmitted(true);
    setTimeout(() => setIncidentSubmitted(false), 2000);
  }

  // ── Export (text report)
  function exportReport() {
    const sc = inspScore();
    const lines = [
      `SAFJOB – SAFETY OBSERVATION REPORT`,
      `Site: ${activeSite}`,
      `Inspection Template: ${allTemplates[activeTemplateId]?.label}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Language: ${LANGUAGES[lang]}`,
      `\n═══ SUMMARY ═══`,
      `Observations – Open: ${counts.open}  In Progress: ${counts["in-progress"]}  Resolved: ${counts.resolved}`,
      `Overdue: ${siteOverdue.length}`,
      `Inspection: ${sc.pass}/${sc.total} passed, ${sc.fail} failed`,
      `Sign-offs: ${todaySignoffs.length}`,
      `\n═══ OBSERVATIONS ═══`,
    ];
    siteObs.forEach((o, i) => {
      lines.push(
        `\n#${i + 1} [${sLabel(o.severity).toUpperCase()}] ${cLabel(
          o.category
        )}`
      );
      lines.push(
        `Date: ${o.date}  Status: ${o.status}  Assigned: ${
          o.assignee || "Unassigned"
        }`
      );
      lines.push(`Location: ${o.location}`);
      if (o.gps)
        lines.push(`GPS: ${o.gps.lat}, ${o.gps.lon} (±${o.gps.accuracy}m)`);
      lines.push(`Description: ${o.description}`);
      lines.push(`OSHA Ref: ${cOsha(o.category)}`);
      if (o.aiSuggestion) lines.push(`Corrective Action:\n${o.aiSuggestion}`);
    });
    lines.push(`\n═══ DAILY INSPECTION ═══`);
    INSPECTION_SECTIONS.forEach((sec) => {
      lines.push(`\n${sec.label}:`);
      sec.items.forEach((item) => {
        const v = getInspItem(sec.id, item);
        lines.push(
          `  [${v === "pass" ? "✓" : v === "fail" ? "✗" : " "}] ${item}`
        );
      });
    });
    if (siteIncidents.length) {
      lines.push(`\n═══ INCIDENTS ═══`);
      siteIncidents.forEach((inc, i) => {
        lines.push(
          `\n#${i + 1} ${inc.type.toUpperCase()} – ${inc.date} ${inc.time}`
        );
        lines.push(`Location: ${inc.location}`);
        lines.push(`Description: ${inc.description}`);
        if (inc.injured)
          lines.push(
            `Injured: ${inc.injured}, ${inc.bodyPart}, ${inc.treatment}`
          );
        if (inc.witnesses) lines.push(`Witnesses: ${inc.witnesses}`);
        lines.push(`Reported By: ${inc.reportedBy}`);
      });
    }
    if (todaySignoffs.length) {
      lines.push(`\n═══ WORKER SIGN-OFFS ═══`);
      todaySignoffs.forEach((s) =>
        lines.push(
          `  ✓ ${s.name} – ${s.time}${
            todaySigs[s.name] ? " [Signature captured]" : ""
          }`
        )
      );
    }
    if (talkContent) lines.push(`\n═══ TOOLBOX TALK ═══\n${talkContent}`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SafJob_${activeSite.replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    a.click();
    setExportMsg("✓ Report downloaded");
    setTimeout(() => setExportMsg(""), 2500);
  }

  // ── Analytics
  function analyticsData() {
    const byCat = {},
      bySev = {},
      last7 = [];
    observations.forEach((o) => {
      byCat[o.category] = (byCat[o.category] || 0) + 1;
      bySev[o.severity] = (bySev[o.severity] || 0) + 1;
    });
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const ds = d.toISOString().slice(0, 10);
      const n = observations.filter((o) => o.date === ds).length;
      last7.push({
        label: d.toLocaleDateString([], { weekday: "short" }),
        count: n,
      });
    }
    const complianceHistory = Object.entries(inspections)
      .filter(([k]) => k.startsWith(activeSite))
      .slice(-7)
      .map(([k, v]) => {
        const date = k.split("__")[1];
        let pass = 0,
          total = 0;
        INSPECTION_SECTIONS.forEach((sec) =>
          sec.items.forEach((item) => {
            total++;
            if (v[sec.id]?.[item] === "pass") pass++;
          })
        );
        return {
          date: date?.slice(5) || "",
          score: total > 0 ? Math.round((pass / total) * 100) : 0,
        };
      });
    return { byCat, bySev, last7, complianceHistory };
  }

  // ─────────────────────────────────────────────
  // MODAL SCREENS
  // ─────────────────────────────────────────────

  // Template editor
  if (editingTemplate) {
    const updateSection = (idx, key, val) =>
      setEditingTemplate((p) => {
        const s = [...p.sections];
        s[idx] = { ...s[idx], [key]: val };
        return { ...p, sections: s };
      });
    const updateItem = (si, ii, val) =>
      setEditingTemplate((p) => {
        const s = [...p.sections];
        const items = [...s[si].items];
        items[ii] = val;
        s[si] = { ...s[si], items };
        return { ...p, sections: s };
      });
    const addItem = (si) =>
      setEditingTemplate((p) => {
        const s = [...p.sections];
        s[si] = { ...s[si], items: [...s[si].items, "New item"] };
        return { ...p, sections: s };
      });
    const removeItem = (si, ii) =>
      setEditingTemplate((p) => {
        const s = [...p.sections];
        s[si] = { ...s[si], items: s[si].items.filter((_, i) => i !== ii) };
        return { ...p, sections: s };
      });
    const addSection = () =>
      setEditingTemplate((p) => ({
        ...p,
        sections: [
          ...p.sections,
          {
            id: "sec_" + Date.now(),
            label: "New Section",
            items: ["New item"],
          },
        ],
      }));
    const removeSection = (idx) => {
      if (!window.confirm("Remove this section?")) return;
      setEditingTemplate((p) => ({
        ...p,
        sections: p.sections.filter((_, i) => i !== idx),
      }));
    };
    const saveTemplate = () => {
      if (!editingTemplate.label.trim()) {
        alert("Template needs a name");
        return;
      }
      const id = editingTemplate.id || "custom_" + Date.now();
      const { isNew, ...rest } = editingTemplate;
      setCustomTemplates((p) => ({ ...p, [id]: rest }));
      setEditingTemplate(null);
    };
    return (
      <div style={C.wrap}>
        <div
          style={{
            ...C.hdr,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={C.logo}>🦺 Template Editor</span>
          <button
            onClick={() => setEditingTemplate(null)}
            style={C.btnSm("rgba(255,255,255,0.2)", "#fff")}
          >
            Cancel
          </button>
        </div>
        <div style={{ padding: 14 }}>
          <div style={C.card}>
            <label style={C.lbl}>Template Name</label>
            <input
              style={{ ...C.inp, marginBottom: 10 }}
              placeholder="e.g. Solar Roof Install"
              value={editingTemplate.label}
              onChange={(e) =>
                setEditingTemplate((p) => ({ ...p, label: e.target.value }))
              }
            />
            <label style={C.lbl}>Icon (emoji)</label>
            <input
              style={C.inp}
              placeholder="📝"
              value={editingTemplate.icon || ""}
              onChange={(e) =>
                setEditingTemplate((p) => ({ ...p, icon: e.target.value }))
              }
            />
          </div>
          {editingTemplate.sections.map((sec, si) => (
            <div key={si} style={C.card}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  style={{ ...C.inp, flex: 1, fontWeight: 700 }}
                  placeholder="Section name"
                  value={sec.label}
                  onChange={(e) => updateSection(si, "label", e.target.value)}
                />
                <button
                  onClick={() => removeSection(si)}
                  style={{
                    padding: "8px 12px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  ×
                </button>
              </div>
              {sec.items.map((item, ii) => (
                <div
                  key={ii}
                  style={{ display: "flex", gap: 6, marginBottom: 7 }}
                >
                  <input
                    style={{ ...C.inp, flex: 1, fontSize: 13 }}
                    value={item}
                    onChange={(e) => updateItem(si, ii, e.target.value)}
                  />
                  <button
                    onClick={() => removeItem(si, ii)}
                    style={{
                      padding: "6px 12px",
                      background: "#f3f4f6",
                      color: "#6b7280",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(si)}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#f0fdf4",
                  color: "#15803d",
                  border: "1px dashed #86efac",
                  borderRadius: 10,
                  fontSize: 13,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                + Add Item
              </button>
            </div>
          ))}
          <button
            onClick={addSection}
            style={{
              ...C.btn("#f0f9ff", "#0369a1"),
              border: "1px dashed #bae6fd",
              marginBottom: 10,
            }}
          >
            + Add Section
          </button>
          <button onClick={saveTemplate} style={C.btn()}>
            💾 Save Template
          </button>
        </div>
      </div>
    );
  }

  // Annotation modal
  if (annotatingObs)
    return (
      <div style={C.wrap}>
        <div
          style={{
            ...C.hdr,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={C.logo}>✏️ Annotate Photo</span>
          <button
            onClick={() => setAnnotatingObs(null)}
            style={C.btnSm("rgba(255,255,255,0.2)", "#fff")}
          >
            Cancel
          </button>
        </div>
        <div style={{ padding: 14 }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
            Draw to mark hazard areas. Use finger or mouse.
          </p>
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              background: "#000",
              marginBottom: 12,
            }}
          >
            {annotatingObs.photo ? (
              <canvas
                ref={canvasRef}
                style={{
                  display: "block",
                  width: "100%",
                  touchAction: "none",
                  cursor: "crosshair",
                }}
                onMouseDown={aDown}
                onMouseMove={aMove}
                onMouseUp={aUp}
                onTouchStart={aDown}
                onTouchMove={aMove}
                onTouchEnd={aUp}
              />
            ) : (
              <div
                style={{
                  padding: 48,
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                No photo attached to this observation.
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={saveAnnotations}
              style={{ ...C.btn(), flex: 1, marginTop: 0 }}
            >
              Save
            </button>
            <button
              onClick={() => {
                const c = canvasRef.current;
                if (!c) return;
                const ctx = c.getContext("2d");
                const img = new Image();
                img.onload = () => {
                  ctx.clearRect(0, 0, c.width, c.height);
                  ctx.drawImage(img, 0, 0, c.width, c.height);
                };
                img.src = annotatingObs.photo;
              }}
              style={{
                flex: 1,
                padding: "13px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 0,
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );

  // QR modal
  if (qrObs)
    return (
      <div style={C.wrap}>
        <div
          style={{
            ...C.hdr,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={C.logo}>⬛ QR Code</span>
          <button
            onClick={() => setQrObs(null)}
            style={C.btnSm("rgba(255,255,255,0.2)", "#fff")}
          >
            Back
          </button>
        </div>
        <div style={{ padding: 20, textAlign: "center" }}>
          <div style={C.card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              {cIcon(qrObs.category)} {cLabel(qrObs.category)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
              📍 {qrObs.location} · {qrObs.date}
            </div>
            <img
              src={qrObs.qrUrl}
              alt="QR"
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
                border: "1px solid #e5e7eb",
              }}
            />
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 10 }}>
              Scan to view observation details
            </div>
          </div>
          <button onClick={() => setQrObs(null)} style={C.btn()}>
            Back to Observations
          </button>
        </div>
      </div>
    );

  // Signature modal
  if (sigModal)
    return (
      <div style={C.wrap}>
        <div
          style={{
            ...C.hdr,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={C.logo}>✍️ Signature</span>
          <button
            onClick={() => setSigModal(null)}
            style={C.btnSm("rgba(255,255,255,0.2)", "#fff")}
          >
            Cancel
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={C.card}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              Sign here, {sigModal}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              I acknowledge today's inspection and toolbox talk.
            </div>
            <div
              style={{
                border: "1.5px solid #d1d5db",
                borderRadius: 12,
                background: "#fff",
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <canvas
                ref={sigCanvasRef}
                style={{
                  display: "block",
                  width: "100%",
                  height: 130,
                  touchAction: "none",
                  cursor: "crosshair",
                }}
                onMouseDown={sigDown}
                onMouseMove={sigMove}
                onMouseUp={sigUp}
                onTouchStart={sigDown}
                onTouchMove={sigMove}
                onTouchEnd={sigUp}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  addSignoff(sigModal);
                  saveSig(sigModal);
                }}
                style={{ ...C.btn(), flex: 1, marginTop: 0 }}
              >
                Confirm & Sign
              </button>
              <button
                onClick={clearSig}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  cursor: "pointer",
                  marginTop: 0,
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const ad = analyticsData();

  // ─────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────

  return (
    <div style={C.wrap}>
      {/* ── HEADER */}
      <div style={C.hdr}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={C.logo}>🦺 SafJob</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                fontSize: 12,
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 8,
                padding: "5px 8px",
                cursor: "pointer",
              }}
            >
              {Object.entries(LANGUAGES).map(([k, v]) => (
                <option key={k} value={k} style={{ color: "#111" }}>
                  {v}
                </option>
              ))}
            </select>
            <button
              onClick={exportReport}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {T.export}
            </button>
          </div>
        </div>

        {/* Site tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {sites.map((site) => (
            <button
              key={site}
              onClick={() => {
                setActiveSite(site);
                setForm((p) => ({ ...p, site }));
              }}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: activeSite === site ? 700 : 400,
                background:
                  activeSite === site ? "#fff" : "rgba(255,255,255,0.15)",
                color: activeSite === site ? BRAND : "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {site}
            </button>
          ))}
          <button
            onClick={() => setShowAddSite((p) => !p)}
            style={{
              padding: "5px 10px",
              borderRadius: 20,
              fontSize: 12,
              background: "transparent",
              color: "#fff",
              border: "1px dashed rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            {T.addSite}
          </button>
        </div>

        {showAddSite && (
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSite()}
              placeholder="New site name"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 10,
                border: "none",
                fontSize: 13,
              }}
            />
            <button
              onClick={addSite}
              style={{
                padding: "8px 14px",
                background: "#fff",
                color: BRAND,
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>
        )}

        {/* Overdue alert */}
        {siteOverdue.length > 0 && (
          <div
            style={{
              marginTop: 10,
              background: "#dc2626",
              borderRadius: 10,
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🔔 {siteOverdue.length} overdue corrective action
            {siteOverdue.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {exportMsg && (
        <div
          style={{
            background: "#f0fdf4",
            color: "#15803d",
            textAlign: "center",
            padding: "8px",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {exportMsg}
        </div>
      )}

      {/* ── NAV */}
      <div style={C.nav}>
        {VIEWS.map((id, i) => (
          <button
            key={id}
            style={C.nb(view === id)}
            onClick={() => setView(id)}
          >
            <div style={{ fontSize: 16, marginBottom: 1 }}>{VIEW_ICONS[i]}</div>
            <div>{T[id] || id}</div>
          </button>
        ))}
      </div>

      <div style={C.body}>
        {/* ════════════════════════════════
            LOG
        ════════════════════════════════ */}
        {view === "log" && (
          <div>
            {submitted && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #16a34a",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 14,
                  color: "#15803d",
                  fontWeight: 700,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                {T.submitted}
                {gpsStatus && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      marginTop: 3,
                      opacity: 0.8,
                    }}
                  >
                    {gpsStatus}
                  </div>
                )}
              </div>
            )}
            <div style={C.card}>
              <label style={C.lbl}>{T.site}</label>
              <select
                style={{ ...C.inp, marginBottom: 12 }}
                value={form.site}
                onChange={(e) => ff("site", e.target.value)}
              >
                {sites.map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>

              <label style={C.lbl}>{T.location}</label>
              <input
                style={{ ...C.inp, marginBottom: 12 }}
                placeholder="e.g. Level 2 – North Stairwell"
                value={form.location}
                onChange={(e) => ff("location", e.target.value)}
              />

              <label style={C.lbl}>{T.hazardCat}</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {HAZARD_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    style={C.catBtn(form.category === c.id)}
                    onClick={() => ff("category", c.id)}
                  >
                    <div style={{ fontSize: 18 }}>{c.icon}</div>
                    <div
                      style={{
                        fontSize: 9.5,
                        marginTop: 3,
                        color: form.category === c.id ? BRAND : "#6b7280",
                        lineHeight: 1.3,
                        fontWeight: form.category === c.id ? 700 : 400,
                      }}
                    >
                      {c.label}
                    </div>
                  </button>
                ))}
              </div>

              <label style={C.lbl}>{T.severity}</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {SEVERITIES.map((sv) => (
                  <button
                    key={sv.id}
                    style={C.sevBtn(sv, form.severity === sv.id)}
                    onClick={() => ff("severity", sv.id)}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: form.severity === sv.id ? sv.color : "#374151",
                      }}
                    >
                      {sv.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: form.severity === sv.id ? sv.color : "#9ca3af",
                        marginTop: 2,
                      }}
                    >
                      {sv.desc}
                    </div>
                  </button>
                ))}
              </div>

              <label style={C.lbl}>{T.description}</label>
              <textarea
                style={{
                  ...C.inp,
                  minHeight: 72,
                  resize: "vertical",
                  marginBottom: 12,
                }}
                placeholder="Describe the hazard in detail…"
                value={form.description}
                onChange={(e) => ff("description", e.target.value)}
              />

              <label style={C.lbl}>{T.assignTo}</label>
              <select
                style={{ ...C.inp, marginBottom: 12 }}
                value={form.assignee}
                onChange={(e) => ff("assignee", e.target.value)}
              >
                <option value="">— Select worker —</option>
                {roster.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>

              <label style={C.lbl}>{T.photo}</label>
              <div style={{ marginBottom: 14 }}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileRef}
                  style={{ display: "none" }}
                  onChange={handlePhoto}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    padding: "9px 16px",
                    border: "1.5px dashed #d1d5db",
                    borderRadius: 10,
                    background: "#fafafa",
                    color: "#374151",
                    fontSize: 13,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  📷 {form.photo ? T.changePhoto : T.attachPhoto}
                </button>
                {form.photo && (
                  <img
                    src={form.photo}
                    alt="obs"
                    style={{
                      display: "block",
                      marginTop: 10,
                      width: "100%",
                      borderRadius: 10,
                      maxHeight: 160,
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              {gpsStatus && !submitted && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {gpsStatus}
                </div>
              )}

              <button
                style={{ ...C.btn(), opacity: submitting ? 0.7 : 1 }}
                onClick={submitObservation}
                disabled={submitting}
              >
                {submitting ? "📍 Locating & submitting…" : T.submitObs}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            OBSERVATIONS
        ════════════════════════════════ */}
        {view === "observations" && (
          <div>
            {/* Summary stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {[
                ["open", "#dc2626", T.open],
                ["in-progress", "#ca8a04", T.inProgress],
                ["resolved", "#16a34a", T.resolved],
              ].map(([k, c, l]) => (
                <div key={k} style={C.statCard(c)}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: c }}>
                    {counts[k]}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>

            {/* Overdue banner */}
            {siteOverdue.length > 0 && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 14,
                  fontSize: 13,
                }}
              >
                <div
                  style={{ fontWeight: 700, color: "#dc2626", marginBottom: 6 }}
                >
                  🔔 Overdue Corrective Actions
                </div>
                {siteOverdue.map((o) => (
                  <div
                    key={o.id}
                    style={{ color: "#374151", marginBottom: 3, fontSize: 12 }}
                  >
                    • {cLabel(o.category)} @ {o.location}{" "}
                    <span style={{ color: sCol(o.severity), fontWeight: 600 }}>
                      ({sLabel(o.severity)})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Filter bar */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {["all", "open", "in-progress", "resolved"].map((f) => (
                <button
                  key={f}
                  onClick={() => setObsFilter(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: obsFilter === f ? 700 : 400,
                    border: `1.5px solid ${
                      obsFilter === f ? BRAND : "#e5e7eb"
                    }`,
                    background: obsFilter === f ? BRAND_LIGHT : "#fff",
                    color: obsFilter === f ? BRAND : "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  {f === "all"
                    ? T.all
                    : f === "open"
                    ? T.open
                    : f === "in-progress"
                    ? T.inProgress
                    : T.resolved}
                  {f !== "all" && (
                    <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.7 }}>
                      {counts[f]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredObs.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  padding: "40px 0",
                  fontSize: 14,
                }}
              >
                {T.noObs}
              </div>
            )}

            {filteredObs.map((obs) => (
              <div
                key={obs.id}
                style={{
                  ...C.card,
                  borderLeft: `4px solid ${sCol(obs.severity)}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#111",
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    {cIcon(obs.category)} {cLabel(obs.category)}
                  </div>
                  <span style={C.badge(obs.severity)}>
                    {sLabel(obs.severity)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 5,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span>📍 {obs.location}</span>
                  <span>📅 {obs.date}</span>
                  {obs.gps && (
                    <span title={`GPS: ${obs.gps.lat}, ${obs.gps.lon}`}>
                      🛰 ±{obs.gps.accuracy}m
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {obs.description}
                </div>
                {obs.photo && (
                  <img
                    src={obs.photo}
                    alt="site"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      maxHeight: 140,
                      objectFit: "cover",
                      marginBottom: 8,
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  {obs.assignee ? (
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      👤 {obs.assignee}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    style={C.stBadge(obs.status)}
                    onClick={() => cycleStatus(obs.id)}
                  >
                    {obs.status === "open"
                      ? T.open
                      : obs.status === "in-progress"
                      ? T.inProgress
                      : T.resolved}{" "}
                    ↻
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button
                    style={C.iconBtn("#f0f9ff", "#0369a1")}
                    onClick={() => startAnnotating(obs)}
                  >
                    ✏️ Annotate
                  </button>
                  <button
                    style={C.iconBtn("#faf5ff", "#7c3aed")}
                    onClick={() => generateQR(obs)}
                  >
                    ⬛ QR Code
                  </button>
                </div>
                <button
                  style={C.aiBtn}
                  onClick={() => {
                    setExpandedId(obs.id);
                    if (!obs.aiSuggestion) getAI(obs);
                  }}
                  disabled={aiLoading === obs.id}
                >
                  {aiLoading === obs.id
                    ? T.generating
                    : obs.aiSuggestion
                    ? T.viewAI
                    : T.getAI}
                </button>
                {obs.aiSuggestion && expandedId === obs.id && (
                  <div
                    style={{
                      marginTop: 10,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 13,
                      color: "#1e293b",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {obs.aiSuggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════
            INSPECT
        ════════════════════════════════ */}
        {view === "inspect" && (
          <div>
            {/* Template selector */}
            <div style={C.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: BRAND }}>
                  📋 Inspection Template
                </div>
                <button
                  onClick={() => setShowTemplateMgr((p) => !p)}
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {showTemplateMgr ? "Done" : T.manage}
                </button>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
                Active for <strong>{activeSite}</strong>:{" "}
                {allTemplates[activeTemplateId]?.icon}{" "}
                {allTemplates[activeTemplateId]?.label}
              </div>
              <select
                style={C.inp}
                value={activeTemplateId}
                onChange={(e) => setSiteTemplate(activeSite, e.target.value)}
              >
                <optgroup label="Built-in Templates">
                  {Object.entries(INSPECTION_TEMPLATES).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </optgroup>
                {Object.keys(customTemplates).length > 0 && (
                  <optgroup label="Custom Templates">
                    {Object.entries(customTemplates).map(([id, t]) => (
                      <option key={id} value={id}>
                        {t.icon || "📝"} {t.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {showTemplateMgr && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 10,
                    }}
                  >
                    Custom Templates
                  </div>
                  {Object.keys(customTemplates).length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 10,
                      }}
                    >
                      No custom templates yet.
                    </div>
                  )}
                  {Object.entries(customTemplates).map(([id, t]) => (
                    <div
                      key={id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #f3f4f6",
                        fontSize: 13,
                      }}
                    >
                      <span>
                        {t.icon || "📝"} {t.label}{" "}
                        <span style={{ color: "#9ca3af" }}>
                          (
                          {t.sections.reduce(
                            (s: number, sec) => s + sec.items.length,
                            0
                          )}{" "}
                          items)
                        </span>
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setEditingTemplate({ id, ...t })}
                          style={C.btnSm("#f0f9ff", "#0369a1")}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this template?"))
                              setCustomTemplates((p) => {
                                const c = { ...p };
                                delete c[id];
                                return c;
                              });
                          }}
                          style={C.btnSm("#fef2f2", "#dc2626")}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setEditingTemplate({
                        id: "",
                        label: "",
                        icon: "📝",
                        sections: [
                          {
                            id: "sec_" + Date.now(),
                            label: "New Section",
                            items: ["New item"],
                          },
                        ],
                        isNew: true,
                      })
                    }
                    style={{ ...C.btn(), marginTop: 12 }}
                  >
                    + Create Custom Template
                  </button>
                </div>
              )}
            </div>

            {/* Score summary */}
            {(() => {
              const sc = inspScore();
              return (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  {[
                    ["Pass", sc.pass, "#16a34a"],
                    ["Fail", sc.fail, "#dc2626"],
                    ["Total", sc.total, "#374151"],
                  ].map(([l, n, c]) => (
                    <div key={l} style={C.statCard(c)}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: c }}>
                        {n}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#6b7280",
                          marginTop: 2,
                          fontWeight: 500,
                        }}
                      >
                        {l}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Checklist */}
            {INSPECTION_SECTIONS.map((sec) => (
              <div key={sec.id} style={C.card}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: BRAND,
                    marginBottom: 12,
                  }}
                >
                  {sec.label}
                </div>
                {sec.items.map((item) => {
                  const v = getInspItem(sec.id, item);
                  return (
                    <div key={item} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#374151",
                          marginBottom: 5,
                          lineHeight: 1.4,
                        }}
                      >
                        {item}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          ["pass", T.pass, "#16a34a", "#f0fdf4"],
                          ["fail", T.fail, "#dc2626", "#fef2f2"],
                          ["na", T.na, "#6b7280", "#f9fafb"],
                        ].map(([val, lbl, col, bg]) => (
                          <button
                            key={val}
                            onClick={() => setInspItem(sec.id, item, val)}
                            style={{
                              flex: 1,
                              padding: "8px 4px",
                              border: `1.5px solid ${
                                v === val ? col : "#e5e7eb"
                              }`,
                              borderRadius: 9,
                              background: v === val ? bg : "#fafafa",
                              color: v === val ? col : "#9ca3af",
                              fontSize: 12,
                              fontWeight: v === val ? 700 : 400,
                              cursor: "pointer",
                            }}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Roster */}
            <div style={C.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: BRAND }}>
                  {T.roster}
                </div>
                <button
                  onClick={() => setShowRoster((p) => !p)}
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {T.manage}
                </button>
              </div>
              {showRoster && (
                <div style={{ marginBottom: 10 }}>
                  {roster.map((r: string, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #f3f4f6",
                        fontSize: 14,
                      }}
                    >
                      <span>👷 {r}</span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${r} from roster?`))
                            setRoster((p) => p.filter((_, j) => j !== i));
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: 18,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                      value={newRosterName}
                      onChange={(e) => setNewRosterName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        newRosterName.trim() &&
                        (setRoster((p) => [...p, newRosterName.trim()]),
                        setNewRosterName(""))
                      }
                      placeholder="Add worker name"
                      style={{ ...C.inp, flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        if (newRosterName.trim()) {
                          setRoster((p) => [...p, newRosterName.trim()]);
                          setNewRosterName("");
                        }
                      }}
                      style={{ ...C.btnSm(), whiteSpace: "nowrap" }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              {!showRoster && roster.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {roster.map((r) => (
                    <span
                      key={r}
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        background: "#f3f4f6",
                        borderRadius: 20,
                        color: "#374151",
                      }}
                    >
                      👷 {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sign-offs */}
            <div style={C.card}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: BRAND,
                  marginBottom: 4,
                }}
              >
                {T.workerSignoffs}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                Workers acknowledge today's inspection and toolbox talk.
              </div>
              {todaySignoffs.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: BRAND }}>
                      ✓ {s.name}
                    </span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      {s.time}
                    </span>
                  </div>
                  {todaySigs[s.name] && (
                    <img
                      src={todaySigs[s.name]}
                      alt="sig"
                      style={{
                        marginTop: 6,
                        maxHeight: 44,
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                      }}
                    />
                  )}
                </div>
              ))}
              {signoffModal ? (
                <div style={{ marginTop: 12 }}>
                  <label style={C.lbl}>Select worker</label>
                  <select
                    style={{ ...C.inp, marginBottom: 10 }}
                    value={signoffName}
                    onChange={(e) => setSignoffName(e.target.value)}
                  >
                    <option value="">— Select —</option>
                    {roster
                      .filter((r) => !todaySignoffs.find((s) => s.name === r))
                      .map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                  </select>
                  <input
                    value={signoffName}
                    onChange={(e) => setSignoffName(e.target.value)}
                    placeholder="Or type name manually"
                    style={{ ...C.inp, marginBottom: 12 }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => {
                        if (signoffName.trim()) openSigModal(signoffName);
                      }}
                      style={{
                        flex: 1,
                        padding: "11px",
                        background: BRAND,
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      ✍️ Sign Digitally
                    </button>
                    <button
                      onClick={() => addSignoff(signoffName)}
                      style={{
                        flex: 1,
                        padding: "11px",
                        background: "#f0fdf4",
                        color: "#15803d",
                        border: "1px solid #bbf7d0",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Name Only
                    </button>
                  </div>
                  <button
                    onClick={() => setSignoffModal(false)}
                    style={{ ...C.btn("#f3f4f6", "#374151"), marginTop: 10 }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSignoffModal(true)}
                  style={{ ...C.btn(), marginTop: 12 }}
                >
                  {T.signOff}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            INCIDENTS
        ════════════════════════════════ */}
        {view === "incidents" && (
          <div>
            {incidentSubmitted && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #16a34a",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 14,
                  color: "#15803d",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {T.incidentReported}
              </div>
            )}
            <div style={C.card}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: BRAND,
                  marginBottom: 12,
                }}
              >
                {T.reportIncident}
              </div>
              <label style={C.lbl}>Incident Type</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {INCIDENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setIncidentForm((p) => ({ ...p, type: t.id }))
                    }
                    style={{
                      padding: "10px 8px",
                      border: `1.5px solid ${
                        incidentForm.type === t.id ? t.color : "#e5e7eb"
                      }`,
                      borderRadius: 10,
                      background:
                        incidentForm.type === t.id ? `${t.color}10` : "#fafafa",
                      color: incidentForm.type === t.id ? t.color : "#374151",
                      fontSize: 13,
                      fontWeight: incidentForm.type === t.id ? 700 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={C.lbl}>Date</label>
                  <input
                    type="date"
                    style={C.inp}
                    value={incidentForm.date}
                    onChange={(e) =>
                      setIncidentForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label style={C.lbl}>Time</label>
                  <input
                    type="time"
                    style={C.inp}
                    value={incidentForm.time}
                    onChange={(e) =>
                      setIncidentForm((p) => ({ ...p, time: e.target.value }))
                    }
                  />
                </div>
              </div>
              <label style={C.lbl}>Location</label>
              <input
                style={{ ...C.inp, marginBottom: 12 }}
                placeholder="Where did it occur?"
                value={incidentForm.location}
                onChange={(e) =>
                  setIncidentForm((p) => ({ ...p, location: e.target.value }))
                }
              />
              <label style={C.lbl}>Description</label>
              <textarea
                style={{
                  ...C.inp,
                  minHeight: 72,
                  resize: "vertical",
                  marginBottom: 12,
                }}
                placeholder="What happened?"
                value={incidentForm.description}
                onChange={(e) =>
                  setIncidentForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
              {(incidentForm.type === "firstaid" ||
                incidentForm.type === "recordable") && (
                <>
                  <label style={C.lbl}>Injured Person</label>
                  <input
                    style={{ ...C.inp, marginBottom: 12 }}
                    placeholder="Full name"
                    value={incidentForm.injured}
                    onChange={(e) =>
                      setIncidentForm((p) => ({
                        ...p,
                        injured: e.target.value,
                      }))
                    }
                  />
                  <label style={C.lbl}>Body Part Affected</label>
                  <input
                    style={{ ...C.inp, marginBottom: 12 }}
                    placeholder="e.g. Right hand"
                    value={incidentForm.bodyPart}
                    onChange={(e) =>
                      setIncidentForm((p) => ({
                        ...p,
                        bodyPart: e.target.value,
                      }))
                    }
                  />
                  <label style={C.lbl}>Treatment Given</label>
                  <input
                    style={{ ...C.inp, marginBottom: 12 }}
                    placeholder="e.g. First aid on site"
                    value={incidentForm.treatment}
                    onChange={(e) =>
                      setIncidentForm((p) => ({
                        ...p,
                        treatment: e.target.value,
                      }))
                    }
                  />
                </>
              )}
              <label style={C.lbl}>Witnesses</label>
              <input
                style={{ ...C.inp, marginBottom: 12 }}
                placeholder="Names of witnesses"
                value={incidentForm.witnesses}
                onChange={(e) =>
                  setIncidentForm((p) => ({ ...p, witnesses: e.target.value }))
                }
              />
              <label style={C.lbl}>Reported By</label>
              <select
                style={{ ...C.inp, marginBottom: 14 }}
                value={incidentForm.reportedBy}
                onChange={(e) =>
                  setIncidentForm((p) => ({ ...p, reportedBy: e.target.value }))
                }
              >
                <option value="">— Select —</option>
                {roster.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button style={C.btn()} onClick={submitIncident}>
                {T.submitIncident}
              </button>
            </div>

            {siteIncidents.map((inc) => {
              const t = INCIDENT_TYPES.find((t) => t.id === inc.type);
              return (
                <div
                  key={inc.id}
                  style={{
                    ...C.card,
                    borderLeft: `4px solid ${t?.color || "#888"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{ fontWeight: 700, fontSize: 14, color: t?.color }}
                    >
                      {t?.label || inc.type}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {inc.date} {inc.time}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 5 }}
                  >
                    📍 {inc.location}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#374151",
                      marginBottom: 5,
                      lineHeight: 1.5,
                    }}
                  >
                    {inc.description}
                  </div>
                  {inc.injured && (
                    <div style={{ fontSize: 12, marginBottom: 3 }}>
                      🤕 {inc.injured} · {inc.bodyPart} · {inc.treatment}
                    </div>
                  )}
                  {inc.witnesses && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 3,
                      }}
                    >
                      👁 {inc.witnesses}
                    </div>
                  )}
                  {inc.reportedBy && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      📋 Reported by {inc.reportedBy}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════
            TALK
        ════════════════════════════════ */}
        {view === "talk" && (
          <div>
            <div style={C.card}>
              <div
                style={{
                  fontSize: 14,
                  color: "#374151",
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                AI-generated toolbox talk for <strong>{activeSite}</strong> —{" "}
                {siteObs.filter((o) => o.status !== "resolved").length} open
                hazard
                {siteObs.filter((o) => o.status !== "resolved").length !== 1
                  ? "s"
                  : ""}
                , language: {LANGUAGES[lang]}.
              </div>
              <button
                style={{ ...C.btn(), opacity: talkLoading ? 0.7 : 1 }}
                onClick={generateTalk}
                disabled={talkLoading}
              >
                {talkLoading ? T.generating : T.generateTalk}
              </button>
            </div>
            {talkContent && (
              <div
                style={{
                  ...C.card,
                  fontSize: 13,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  color: "#1e293b",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#6b7280",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                  }}
                >
                  Toolbox Talk · {activeSite}
                </div>
                {talkContent}
                {todaySignoffs.length > 0 && (
                  <div
                    style={{
                      marginTop: 14,
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        marginBottom: 8,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      Acknowledged by
                    </div>
                    {todaySignoffs.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 13,
                          padding: "4px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: BRAND, fontWeight: 700 }}>
                          ✓ {s.name}
                        </span>
                        {todaySigs[s.name] && <span>✍️</span>}
                        <span style={{ color: "#9ca3af", fontSize: 11 }}>
                          {s.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={exportReport}
                  style={{ ...C.btn(), marginTop: 14 }}
                >
                  {T.export} Full Report
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            ANALYTICS
        ════════════════════════════════ */}
        {view === "analytics" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {[
                ["Total Obs", observations.length, "#374151"],
                ["Open", counts.open, "#dc2626"],
                ["Incidents", incidents.length, "#7c3aed"],
                ["Overdue", overduePing.length, "#ea580c"],
              ].map(([l, n, c]) => (
                <div key={l} style={C.statCard(c)}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: c }}>
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      marginTop: 3,
                      fontWeight: 500,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>

            <div style={C.card}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: BRAND,
                  marginBottom: 12,
                }}
              >
                Observations – Last 7 Days
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 5,
                  height: 90,
                }}
              >
                {ad.last7.map((d, i) => {
                  const max = Math.max(...ad.last7.map((x) => x.count), 1);
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#374151",
                          fontWeight: 700,
                        }}
                      >
                        {d.count || ""}
                      </div>
                      <div
                        style={{
                          width: "100%",
                          background: d.count > 0 ? BRAND : "#e5e7eb",
                          borderRadius: "5px 5px 0 0",
                          height: `${Math.max((d.count / max) * 68, 3)}px`,
                          transition: "height 0.3s",
                        }}
                      ></div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>
                        {d.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={C.card}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: BRAND,
                  marginBottom: 12,
                }}
              >
                Hazards by Category
              </div>
              {HAZARD_CATEGORIES.filter((c) => ad.byCat[c.id])
                .sort((a, b) => (ad.byCat[b.id] || 0) - (ad.byCat[a.id] || 0))
                .map((c) => {
                  const n = ad.byCat[c.id] || 0;
                  const max = Math.max(...Object.values(ad.byCat), 1);
                  return (
                    <div key={c.id} style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        <span>
                          {c.icon} {c.label}
                        </span>
                        <span style={{ fontWeight: 700 }}>{n}</span>
                      </div>
                      <div
                        style={{
                          background: "#f3f4f6",
                          borderRadius: 5,
                          height: 8,
                        }}
                      >
                        <div
                          style={{
                            background: BRAND,
                            height: 8,
                            borderRadius: 5,
                            width: `${(n / max) * 100}%`,
                            transition: "width 0.3s",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={C.card}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: BRAND,
                  marginBottom: 12,
                }}
              >
                Observations by Severity
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {SEVERITIES.map((sv) => {
                  const n = ad.bySev[sv.id] || 0;
                  return (
                    <div
                      key={sv.id}
                      style={{
                        background: sv.bg,
                        border: `1px solid ${sv.color}30`,
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: sv.color,
                        }}
                      >
                        {n}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: sv.color,
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        {sv.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {ad.complianceHistory.length > 0 && (
              <div style={C.card}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: BRAND,
                    marginBottom: 12,
                  }}
                >
                  Inspection Compliance – {activeSite}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 5,
                    height: 90,
                  }}
                >
                  {ad.complianceHistory.map((d: any, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#374151",
                          fontWeight: 700,
                        }}
                      >
                        {d.score}%
                      </div>
                      <div
                        style={{
                          width: "100%",
                          background:
                            d.score >= 80
                              ? "#16a34a"
                              : d.score >= 50
                              ? "#ca8a04"
                              : "#dc2626",
                          borderRadius: "5px 5px 0 0",
                          height: `${Math.max((d.score / 100) * 68, 3)}px`,
                          transition: "height 0.3s",
                        }}
                      ></div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>
                        {d.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incidents.length > 0 && (
              <div style={C.card}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: BRAND,
                    marginBottom: 12,
                  }}
                >
                  Incidents by Type
                </div>
                {INCIDENT_TYPES.filter((t) =>
                  incidents.find((i) => i.type === t.id)
                ).map((t) => {
                  const n = incidents.filter((i) => i.type === t.id).length;
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #f3f4f6",
                        fontSize: 14,
                      }}
                    >
                      <span style={{ color: t.color, fontWeight: 600 }}>
                        {t.label}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
