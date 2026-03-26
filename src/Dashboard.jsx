import { useState, useEffect, useRef, useContext, createContext, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell, LineChart, Line
} from "recharts"
import {
  LayoutDashboard, TrendingUp, Building2, Layers, Target,
  Users, ShoppingBag, Gift, Gamepad2, Settings, ChevronLeft,
  ChevronRight, Play, Pause, X, Download, Shield, ShieldCheck,
  Eye, Database, ArrowUpRight, ArrowDownRight, Minus,
  MapPin, BarChart2, Zap, AlertCircle, CheckCircle2,
  Clock, UserCheck, Star, RefreshCw, Calendar, Maximize2, Minimize2,
  Sword, Share2, ShoppingCart, Brain, Navigation
} from "lucide-react"

// ─── Font injection handled via index.html ──────────────────

// ─── Context ─────────────────────────────────────────────────
const ReadyCtx = createContext(false)
const DateCtx  = createContext({ days: 90, scale: 1, chartDays: 30, start: "", end: "" })

// Helper — scale a demo number by the active date range
const ds = (base, scale) => Math.max(0, Math.round(base * scale))

// ─── Colors ──────────────────────────────────────────────────
const C = {
  bg: "#05080f",
  card: "#0c1220",
  alt: "#101929",
  surface: "#060d18",
  bd: "#162035",
  bda: "#1e3050",
  tx: "#e2eaf6",
  mt: "#5e7a9a",
  dm: "#7a96b4",
  ac: "#3d8bff",
  gn: "#00cc88",
  rd: "#ff3d5a",
  or: "#ffac2f",
  yl: "#f0d050",
  pr: "#9b72ff",
  cy: "#22d4ef",
  em: "#30e8a0",
  pk: "#ff6eb4",
  demo: "#ff8c00",
}

// ─── Hooks ───────────────────────────────────────────────────
function useCountUp(target, dur = 1000, delay = 0) {
  const [v, setV] = useState(0)
  const raf = useRef(null)
  const ready = useContext(ReadyCtx)
  useEffect(() => {
    if (!ready || target == null) return
    const t0 = performance.now() + delay
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur)  )
      const eased = 1 - Math.pow(1 - p, 3)
      setV(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setV(target)
    }
    raf.current = requestAnimationFrame(tick)
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [target, ready, dur, delay])
  return v
}

// ─── Formatters ──────────────────────────────────────────────
const fmt = (n) => {
  if (typeof n !== "number") return n ?? "—"
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1e5) return Math.round(n / 1e3) + "K"
  if (n >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
  return n.toLocaleString("es-MX")
}
const pct = (n) => (typeof n === "number" ? n.toFixed(1) + "%" : "—")
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

// ─── Demo data (labeled) ──────────────────────────────────────
const DEMO_BRANDS = [
  { id: "b1", name: "MVS Hub", slug: "mvs", activeExp: 3, totalExp: 12,
    users: 27450, redemptions: 58900, newUsers: 4200, returnRate: 34,
    partPerUser: 2.15, topReward: "points", markers: 18, daysAvg: 48, status: "active" },
  { id: "b2", name: "Sushi Itto", slug: "sushi-itto", activeExp: 1, totalExp: 4,
    users: 9870, redemptions: 21400, newUsers: 1850, returnRate: 28,
    partPerUser: 2.17, topReward: "coupons", markers: 12, daysAvg: 65, status: "active" },
  { id: "b3", name: "Nutrisa", slug: "nutrisa", activeExp: 2, totalExp: 5,
    users: 6120, redemptions: 13200, newUsers: 1100, returnRate: 22,
    partPerUser: 2.16, topReward: "drops", markers: 9, daysAvg: 72, status: "active" },
  { id: "b4", name: "T-Conecta", slug: "t-conecta", activeExp: 1, totalExp: 2,
    users: 3200, redemptions: 6800, newUsers: 650, returnRate: 19,
    partPerUser: 2.13, topReward: "raffles", markers: 6, daysAvg: 90, status: "active" },
]

const DEMO_EXPERIENCES = [
  { id: "e1", name: "MVS Radio Fan 2026", brand: "MVS Hub", brandId: "b1",
    status: "active", start: "2026-01-15", end: "2026-04-15", daysLeft: 22,
    missions: 6, users: 12450, completions: 26700, compRate: 67.2,
    points: 1200000, rewardType: "points", markers: 8,
    health: 82, ugc: 3200, referrals: 890, purchases: 0,
    missionBreakdown: [
      { name: "Código", type: "CODE", completions: 8900, users: 7200 },
      { name: "Trivia", type: "TRIVIA", completions: 6200, users: 5100 },
      { name: "Encuesta", type: "SURVEY", completions: 4800, users: 4400 },
      { name: "Videojuego", type: "GAME", completions: 3900, users: 3100 },
      { name: "Check-in", type: "CHECK-IN", completions: 1900, users: 1700, pending: 87, rejected: 42 },
      { name: "Referido", type: "REFERRAL", completions: 1000, users: 890 },
    ],
    dropoff: [12450, 10820, 8640, 6200, 4100, 2890],
    rewardConv: { claimed: 10900, total: 12450, pct: 87.6 },
    leaderboard: [
      { name: "Carlos M.", points: 4850, state: "CDMX" },
      { name: "Ana R.", points: 4320, state: "Jalisco" },
      { name: "Luis P.", points: 3980, state: "NL" },
    ],
    ambassadors: [{ name: "María G.", refs: 23 }, { name: "Roberto L.", refs: 19 }],
  },
  { id: "e2", name: "Sushi Itto Fan Club", brand: "Sushi Itto", brandId: "b2",
    status: "active", start: "2026-02-01", end: "2026-03-31", daysLeft: 7,
    missions: 4, users: 6800, completions: 14200, compRate: 72.4,
    points: 0, rewardType: "coupons", markers: 6,
    health: 71, ugc: 1200, referrals: 420, purchases: 3400,
    missionBreakdown: [
      { name: "Compra", type: "PURCHASE", completions: 4800, users: 3400, pending: 111, rejected: 89 },
      { name: "Código", type: "CODE", completions: 4200, users: 3800 },
      { name: "Encuesta", type: "SURVEY", completions: 3100, users: 2900 },
      { name: "Referido", type: "REFERRAL", completions: 2100, users: 1850 },
    ],
    dropoff: [6800, 5900, 4800, 3400],
    rewardConv: { claimed: 5600, total: 6800, pct: 82.4 },
    winners: null,
    ambassadors: [{ name: "Sofia R.", refs: 14 }, { name: "Diego M.", refs: 11 }],
  },
  { id: "e3", name: "Nutrisa Wellness 2026", brand: "Nutrisa", brandId: "b3",
    status: "active", start: "2026-01-10", end: "2026-05-10", daysLeft: 47,
    missions: 5, users: 4200, completions: 9100, compRate: 58.3,
    points: 380000, rewardType: "points", markers: 7,
    health: 61, ugc: 890, referrals: 280, purchases: 1200,
    missionBreakdown: [
      { name: "Código", type: "CODE", completions: 2900, users: 2400 },
      { name: "Trivia", type: "TRIVIA", completions: 2100, users: 1900 },
      { name: "Compra", type: "PURCHASE", completions: 1800, users: 1200, pending: 67, rejected: 98 },
      { name: "Encuesta", type: "SURVEY", completions: 1500, users: 1400 },
      { name: "Check-in", type: "CHECK-IN", completions: 800, users: 720, pending: 34, rejected: 21 },
    ],
    dropoff: [4200, 3600, 2800, 2100, 1500],
    rewardConv: { claimed: 3400, total: 4200, pct: 81.0 },
    ambassadors: [{ name: "Laura T.", refs: 9 }],
  },
  { id: "e4", name: "MVS Navidad Musical", brand: "MVS Hub", brandId: "b1",
    status: "completed", start: "2025-12-01", end: "2025-12-25", daysLeft: 0,
    missions: 4, users: 8100, completions: 17400, compRate: 64.8,
    points: 650000, rewardType: "points", markers: 10,
    health: 14, ugc: 2800, referrals: 620, purchases: 0,
    missionBreakdown: [
      { name: "Código", type: "CODE", completions: 6200, users: 5600 },
      { name: "Trivia", type: "TRIVIA", completions: 4800, users: 4300 },
      { name: "Videojuego", type: "GAME", completions: 3900, users: 3400 },
      { name: "Encuesta", type: "SURVEY", completions: 2500, users: 2300 },
    ],
    dropoff: [8100, 7200, 5800, 4200],
    rewardConv: { claimed: 7200, total: 8100, pct: 88.9 },
    leaderboard: [
      { name: "Jorge V.", points: 8900, state: "CDMX" },
      { name: "Diana C.", points: 7650, state: "Jalisco" },
      { name: "Roberto M.", points: 6320, state: "NL" },
    ],
    ambassadors: [{ name: "Carlos L.", refs: 19 }, { name: "María G.", refs: 15 }],
  },
  { id: "e5", name: "T-Conecta Megas", brand: "T-Conecta", brandId: "b4",
    status: "active", start: "2026-02-10", end: "2026-05-10", daysLeft: 47,
    missions: 3, users: 3200, completions: 6800, compRate: 78.4,
    points: 0, rewardType: "megas", markers: 4,
    health: 73, ugc: 0, referrals: 95, purchases: 2100,
    missionBreakdown: [
      { name: "Compra", type: "PURCHASE", completions: 2800, users: 2100, pending: 54, rejected: 38 },
      { name: "Código", type: "CODE", completions: 2500, users: 2200 },
      { name: "Referido", type: "REFERRAL", completions: 1500, users: 1200 },
    ],
    dropoff: [3200, 2800, 2100],
    rewardConv: { claimed: 2650, total: 3200, pct: 82.8 },
    ambassadors: [{ name: "Marco H.", refs: 12 }],
  },
]

// P&L PROYECTADO — from Master Plan (NOT from Supabase)
const PNL_MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
const PNL = {
  mvs:    [300,300,300,300,300,300,300,300,300,300,300,300],
  mundial:[  0,  0,  0,  0,202,202,202,  0,  0,  0,  0,  0],
  b2c:    [  0,  0,  0,  0,  0,  0, 80, 80,160,160,200,200],
  irradia:[  0,  0, 14, 14, 14, 32, 32, 32, 62, 62, 86, 86],
  opex:   [405,405,410,410,420,420,430,430,435,435,440,440],
}
const pnlRev = PNL_MONTHS.map((_,i) => PNL.mvs[i]+PNL.mundial[i]+PNL.b2c[i]+PNL.irradia[i])
const pnlRes = PNL_MONTHS.map((_,i) => pnlRev[i]-PNL.opex[i])

// Demographic data (REAL schema: auth.users.raw_user_meta_data)
const GEO_DATA = [
  { state: "CDMX", users: 14200, pct: 34 },
  { state: "Jalisco", users: 6250, pct: 15 },
  { state: "N. León", users: 5000, pct: 12 },
  { state: "Puebla", users: 3330, pct: 8 },
  { state: "Querétaro", users: 2500, pct: 6 },
  { state: "Otros", users: 10420, pct: 25 },
]
const AGE_DATA = [
  { range:"18-24", m:32, f:36, nd:5 },
  { range:"25-34", m:24, f:20, nd:4 },
  { range:"35-44", m:13, f:11, nd:3 },
  { range:"45-54", m:6, f:5, nd:1 },
  { range:"55+", m:2, f:3, nd:1 },
]
const MISSION_COMPLETION = [
  { name:"Código QR", type:"CODE", rate:91, count:26000, color:C.gn },
  { name:"Trivia", type:"TRIVIA", rate:78, count:18000, color:C.ac },
  { name:"Videojuego", type:"GAME", rate:74, count:9800, color:C.pr },
  { name:"Encuesta", type:"SURVEY", rate:70, count:14200, color:C.cy },
  { name:"Check-in", type:"CHECK-IN", rate:66, count:5400, color:C.yl },
  { name:"Compra", type:"PURCHASE", rate:52, count:8700, color:C.or },
  { name:"Referido", type:"REFERRAL", rate:38, count:4200, color:C.pk },
  { name:"Link/URL", type:"LINK", rate:44, count:2800, color:C.em },
]
const DAILY_30 = Array.from({ length: 30 }, (_, i) => ({
  d: String(i + 1),
  p: Math.round(700 + Math.sin(i * 0.4) * 200 + i * 15 + Math.random() * 80),
  r: Math.round(40 + Math.sin(i * 0.3) * 15 + Math.random() * 20),
}))
const SPARK_7 = [820, 950, 880, 1120, 1050, 1300, 1240]

// Survey inline results (REAL: mission_survey_questions + mission_survey_answers GROUP BY question, user_answer)
const SURVEY_RESULTS = [
  { question:"¿Cómo conociste esta marca?", brand:"Sushi Itto", responses:2900,
    options:[{label:"Redes sociales",pct:42},{label:"Amigo/referido",pct:28},{label:"En tienda",pct:18},{label:"Otro",pct:12}] },
  { question:"¿Qué tan probable es recomendar JALO?", brand:"MVS Hub", responses:4400, nps:true,
    promoters:54, passives:31, detractors:15, npsScore:39,
    options:[{label:"Promotor (9-10)",pct:54},{label:"Neutro (7-8)",pct:31},{label:"Detractor (0-6)",pct:15}] },
  { question:"¿Con qué frecuencia visita Nutrisa?", brand:"Nutrisa", responses:1400,
    options:[{label:"1+ por semana",pct:31},{label:"2-3 por mes",pct:28},{label:"1 por mes",pct:24},{label:"Menos de 1/mes",pct:17}] },
  { question:"¿Qué recompensa prefiere?", brand:"T-Conecta", responses:1200,
    options:[{label:"Megas móviles",pct:44},{label:"Puntos canjeables",pct:28},{label:"Descuentos",pct:18},{label:"Rifa",pct:10}] },
]

// Referral geo expansion (REAL: referrals JOIN auth.users ON user_id/referred_by → raw_user_meta_data->state)
const REFERRAL_GEO = [
  { state:"CDMX",       referrers:892, referidos:1876, coef:2.10, localPct:82 },
  { state:"Jalisco",    referrers:421, referidos:820,  coef:1.95, localPct:74 },
  { state:"Nuevo León", referrers:312, referidos:680,  coef:2.18, localPct:88 },
  { state:"Puebla",     referrers:187, referidos:341,  coef:1.82, localPct:71 },
  { state:"Edo. Méx.",  referrers:143, referidos:272,  coef:1.90, localPct:76 },
]

// Top check-in zones (REAL: mission_check_in_validations JOIN markers → address/latitude/longitude)
const CHECKIN_ZONES = [
  { zone:"Roma Norte, CDMX",  cp:"06600", checkins:1240, color:C.ac },
  { zone:"Polanco, CDMX",     cp:"11560", checkins:980,  color:C.gn },
  { zone:"Santa Fe, CDMX",    cp:"05109", checkins:720,  color:C.cy },
  { zone:"Guadalajara Centro", cp:"44100", checkins:580, color:C.pr },
  { zone:"Monterrey Centro",  cp:"64000", checkins:440,  color:C.em },
]

// Telecom channels (REAL: phone_benefit_transactions + push_subscriptions + business_admins.newsletter)
const TELECOM_CH = [
  { ch:"SMS",   sends:48320, conv:18540, convRate:38.4, costPerSend:0.32,  totalCost:15462, color:C.rd },
  { ch:"Push",  sends:112400,conv:21445, convRate:19.1, costPerSend:0.002, totalCost:225,   color:C.ac },
  { ch:"Email", sends:34560, conv:3048,  convRate:8.8,  costPerSend:0.004, totalCost:138,   color:C.pr },
]

// Mission preference by age (REAL: redemptions JOIN auth.users → birth_date + SPLIT_PART(coupon_code,':',1))
const MISSION_BY_AGE = [
  { age:"18-24", top:"Videojuego", topPct:38, second:"Código",   secondPct:24 },
  { age:"25-34", top:"Encuesta",   topPct:31, second:"Compra",   secondPct:26 },
  { age:"35-44", top:"Compra",     topPct:34, second:"Check-in", secondPct:22 },
  { age:"45-54", top:"Check-in",   topPct:41, second:"Encuesta", secondPct:19 },
]

// Client recurrence (REAL: brands JOIN experiences GROUP BY brand → MIN(starts_at)/MAX(ends_at)/COUNT)
const CLIENT_RECURRENCE = [
  { name:"MVS Hub",    exps:12, primera:"Mar 2024", ultima:"Abr 2026", avgDays:48, status:"active" },
  { name:"Sushi Itto", exps:4,  primera:"Ago 2024", ultima:"Mar 2026", avgDays:65, status:"active" },
  { name:"Nutrisa",    exps:5,  primera:"Nov 2024", ultima:"May 2026", avgDays:72, status:"active" },
  { name:"T-Conecta",  exps:2,  primera:"Feb 2026", ultima:"May 2026", avgDays:90, status:"new" },
]

// Validation queues (REAL: mission_check_in_validations, mission_registered_purchases, mission_provide_link)
const OPS_QUEUES = [
  { label: "Check-ins pendientes", value: 148, color: C.yl, urgent: 23, table: "mission_check_in_validations" },
  { label: "Compras pendientes", value: 266, color: C.or, urgent: 41, table: "mission_registered_purchases" },
  { label: "Links pendientes", value: 89, color: C.ac, urgent: 12, table: "mission_provide_link" },
  { label: "Contenido pendiente", value: 54, color: C.cy, urgent: 8, table: "mission_content_ratings" },
]

// ─── Roles ────────────────────────────────────────────────────
const ROLES = {
  super:  { label: "Super Admin", icon: ShieldCheck, color: C.rd, short: "S" },
  admin:  { label: "Admin Marca", icon: Shield,      color: C.yl, short: "A" },
  client: { label: "Cliente",     icon: Eye,         color: C.ac, short: "C" },
}

// ─── Arquetipos de usuario ────────────────────────────────────
// Calculable: redemptions GROUP BY user_id + SPLIT_PART(coupon_code,':',1)
// + mission_game_sessions.score percentile + referrals + experience count
const ARQUETIPOS = [
  {
    id:"explorador", label:"Explorador", emoji:"🗺️",
    desc:"Completa 3+ tipos distintos de misión",
    sql:"COUNT(DISTINCT SPLIT_PART(coupon_code,':',1)) >= 3 GROUP BY user_id",
    count:3840, pct:9.2, color:C.ac,
    traits:["Alta variedad", "Baja profundidad", "Curioso"],
    avgMissions:5.2, avgExps:2.1, retRate:71,
    topMission:"Trivia", topReward:"points",
  },
  {
    id:"competidor", label:"Competidor", emoji:"🏆",
    desc:"Top 10% de score en mission_game_sessions",
    sql:"mission_game_sessions score > PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY score)",
    count:1675, pct:4.0, color:C.yl,
    traits:["Alta intensidad", "Juegos repetidos", "Busca ranking"],
    avgMissions:8.7, avgExps:1.4, retRate:84,
    topMission:"Videojuego", topReward:"points",
  },
  {
    id:"social", label:"Social", emoji:"📣",
    desc:"≥3 referidos activos o ≥40% misiones REFERRAL:",
    sql:"referrals COUNT(referred_by_user_id) >= 3 OR redemptions REFERRAL: pct >= 0.4",
    count:2190, pct:5.2, color:C.em,
    traits:["Red amplia", "Embajador natural", "Multi-plataforma"],
    avgMissions:4.8, avgExps:2.8, retRate:78,
    topMission:"Referido", topReward:"raffles",
  },
  {
    id:"comprador", label:"Comprador", emoji:"🛒",
    desc:"≥2 PURCHASE: aprobados en distintas experiencias",
    sql:"mission_registered_purchases status=3 COUNT >= 2 ACROSS DISTINCT experience_id",
    count:2920, pct:7.0, color:C.gn,
    traits:["Alta intención", "Ticket comprobado", "Conversión real"],
    avgMissions:3.4, avgExps:1.8, retRate:65,
    topMission:"Compra", topReward:"coupons",
  },
  {
    id:"fiel", label:"Fiel a la Marca", emoji:"❤️",
    desc:"≥3 experiencias distintas de la misma marca",
    sql:"COUNT(DISTINCT experience_id) >= 3 WHERE brand_id = same GROUP BY user_id, brand_id",
    count:1980, pct:4.7, color:C.pk,
    traits:["Brand love alto", "Retorno garantizado", "NPS elevado"],
    avgMissions:6.1, avgExps:3.8, retRate:91,
    topMission:"Código", topReward:"points",
  },
  {
    id:"activo", label:"Activo Regular", emoji:"⚡",
    desc:"1-2 tipos de misión, actividad en últimos 30d",
    sql:"last_sign_in_at >= now()-30d AND COUNT(redemptions) BETWEEN 2 AND 9",
    count:12400, pct:29.7, color:C.cy,
    traits:["Base del ecosistema", "Predecible", "Convertible"],
    avgMissions:3.1, avgExps:1.3, retRate:48,
    topMission:"Código", topReward:"points",
  },
  {
    id:"dormant", label:"Dormido", emoji:"💤",
    desc:"Sin actividad 31-90 días (last_sign_in_at)",
    sql:"last_sign_in_at BETWEEN now()-90d AND now()-31d",
    count:8940, pct:21.4, color:C.or,
    traits:["Reactivable", "Churn medio", "Necesita push"],
    avgMissions:1.8, avgExps:1.1, retRate:18,
    topMission:"—", topReward:"—",
  },
  {
    id:"churn", label:"Churned", emoji:"👻",
    desc:"Sin actividad 90+ días (last_sign_in_at)",
    sql:"last_sign_in_at < now()-90d OR last_sign_in_at IS NULL",
    count:7785, pct:18.6, color:C.rd,
    traits:["Alta pérdida", "Recovery difícil", "Medir causa"],
    avgMissions:1.0, avgExps:1.0, retRate:6,
    topMission:"—", topReward:"—",
  },
]

// ─── Funnel completo ──────────────────────────────────────────
// auth.users.created_at → MIN(redemptions) → completions → claims → return → referrals
// El top-of-funnel (anuncio→micrositio) vive en PostHog/GA4, marcado EXTERNAL
const FUNNEL_FULL = [
  { step:"Impresión anuncio",    n:380000, src:"Meta/TikTok Pixel (brands.tracking_pixels)", external:true,
    note:"PostHog + GA4 — fuera de Supabase" },
  { step:"Visita micrositio",    n:89400, src:"page_view event (PostHog/GA4)", external:true,
    note:"experience.view.detail event" },
  { step:"Inicia registro",      n:52100, src:"auth.start.login (method, hasReferralCode)", external:true,
    note:"auth.view.login_page → auth.start.login" },
  { step:"Completa registro",    n:41700, src:"auth.users COUNT(*)",
    note:"Dato duro en Supabase" },
  { step:"Perfil completo",      n:28600, src:"raw_user_meta_data name+gender+state+CP+birth_date",
    note:"metadata_stats CTE" },
  { step:"Primera participación",n:22400, src:"MIN(redemptions.created_at) por user_id",
    note:"Activación real medida" },
  { step:"Completa experiencia", n:14800, src:"COUNT(DISTINCT coupon_code) >= all missions ORDER_INDEX",
    note:"experience_missions.order_index" },
  { step:"Reclama recompensa",   n:12100, src:"tickets/drops/raffles/coupons claimed=true",
    note:"Canje confirmado" },
  { step:"Segunda experiencia",  n:8340, src:"COUNT(DISTINCT experience_id) >= 2 per user",
    note:"Retención cross-campaign" },
  { step:"Embajador activo",     n:2190, src:"referrals.referred_by_user_id DISTINCT + COUNT >= 3",
    note:"K-Factor contribution" },
]

// Tiempos medianos entre pasos (REAL: timestamp diff)
const FUNNEL_TIMES = [
  { from:"Registro", to:"1ra participación", median:"0.8d", pct90:"3.2d" },
  { from:"1ra participación", to:"Exp. completa", median:"4.1d", pct90:"11.2d" },
  { from:"Exp. completa", to:"Canje", median:"0.3d", pct90:"2.1d" },
  { from:"Canje", to:"2da experiencia", median:"12.4d", pct90:"38d" },
  { from:"Participante", to:"1er referido", median:"4.8d", pct90:"14d" },
]

// ─── Mapa físico de check-ins ────────────────────────────────
// REAL: mission_check_in_validations (status=3) JOIN markers (latitude, longitude, address)
// Coordenadas reales de marcadores usados en experiencias JALO
const CHECKIN_HEATPOINTS = [
  // CDMX cluster
  { lat:19.4326, lng:-99.1332, intensity:1.0, zone:"Centro CDMX",  checkins:1240, brand:"MVS Hub" },
  { lat:19.4278, lng:-99.1676, intensity:0.92, zone:"Roma Norte",  checkins:980, brand:"Sushi Itto" },
  { lat:19.4349, lng:-99.2019, intensity:0.87, zone:"Polanco",     checkins:840, brand:"MVS Hub" },
  { lat:19.3989, lng:-99.1727, intensity:0.74, zone:"Del Valle",   checkins:620, brand:"Nutrisa" },
  { lat:19.4160, lng:-99.1765, intensity:0.68, zone:"Condesa",     checkins:560, brand:"Sushi Itto" },
  { lat:19.3524, lng:-99.2037, intensity:0.55, zone:"Pedregal",    checkins:420, brand:"Nutrisa" },
  { lat:19.5093, lng:-99.1268, intensity:0.48, zone:"Satélite",    checkins:380, brand:"T-Conecta" },
  { lat:19.4897, lng:-99.0562, intensity:0.44, zone:"Ecatepec",    checkins:340, brand:"T-Conecta" },
  { lat:19.3731, lng:-99.0035, intensity:0.39, zone:"Iztapalapa",  checkins:290, brand:"MVS Hub" },
  { lat:19.4623, lng:-99.1541, intensity:0.35, zone:"Tepeyac",     checkins:240, brand:"Nutrisa" },
  // GDL cluster
  { lat:20.6597, lng:-103.3496, intensity:0.82, zone:"GDL Centro", checkins:780, brand:"Sushi Itto" },
  { lat:20.6789, lng:-103.3823, intensity:0.71, zone:"Zapopan",    checkins:620, brand:"Nutrisa" },
  { lat:20.6293, lng:-103.4103, intensity:0.58, zone:"Tlaquepaque",checkins:450, brand:"MVS Hub" },
  // MTY cluster
  { lat:25.6866, lng:-100.3161, intensity:0.76, zone:"MTY Centro", checkins:690, brand:"T-Conecta" },
  { lat:25.6516, lng:-100.3657, intensity:0.65, zone:"San Pedro",  checkins:540, brand:"Sushi Itto" },
  { lat:25.7085, lng:-100.3115, intensity:0.52, zone:"Apodaca",    checkins:390, brand:"T-Conecta" },
  // Puebla
  { lat:19.0414, lng:-98.2063, intensity:0.47, zone:"Puebla Centro",checkins:310, brand:"Nutrisa" },
  // Queretaro
  { lat:20.5888, lng:-100.3899, intensity:0.42, zone:"Querétaro",  checkins:260, brand:"MVS Hub" },
]

// Concentración por zona agrupada
const CHECKIN_ZONES_RANKED = [
  { rank:1, zone:"Roma Norte, CDMX",     cp:"06600", checkins:1240, brands:2, topBrand:"Sushi Itto", weekdayPeak:"Sáb", hourPeak:"13h" },
  { rank:2, zone:"Polanco, CDMX",        cp:"11560", checkins:980,  brands:2, topBrand:"MVS Hub",    weekdayPeak:"Vie", hourPeak:"14h" },
  { rank:3, zone:"GDL Centro",           cp:"44100", checkins:840,  brands:1, topBrand:"Sushi Itto", weekdayPeak:"Dom", hourPeak:"12h" },
  { rank:4, zone:"MTY Centro",           cp:"64000", checkins:780,  brands:2, topBrand:"T-Conecta",  weekdayPeak:"Mié", hourPeak:"19h" },
  { rank:5, zone:"Condesa, CDMX",        cp:"06100", checkins:720,  brands:1, topBrand:"Sushi Itto", weekdayPeak:"Sáb", hourPeak:"13h" },
  { rank:6, zone:"San Pedro, MTY",       cp:"66220", checkins:620,  brands:1, topBrand:"Sushi Itto", weekdayPeak:"Sáb", hourPeak:"14h" },
  { rank:7, zone:"Zapopan, GDL",         cp:"45040", checkins:610,  brands:1, topBrand:"Nutrisa",    weekdayPeak:"Sáb", hourPeak:"11h" },
  { rank:8, zone:"Del Valle, CDMX",      cp:"03100", checkins:560,  brands:1, topBrand:"Nutrisa",    weekdayPeak:"Dom", hourPeak:"12h" },
]

// Heatmap hora × día de check-ins (REAL: EXTRACT(dow, hour FROM created_at))
const CHECKIN_HOUR_DAY = Array.from({length:24}, (_,h)=>
  Array.from({length:7}, (_,d)=>{
    const isWeekend = d >= 5
    const isMorning = h >= 10 && h <= 14
    const isEvening = h >= 17 && h <= 21
    const base = isMorning ? 0.75 : isEvening ? 0.88 : h >= 7 ? 0.42 : 0.06
    return Math.min(1, Math.max(0, base*(isWeekend?1.35:1) + (Math.random()*0.08-0.04)))
  })
)

// ─── Datos de Usuarios ────────────────────────────────────────
// REAL: redemptions + points + referrals + mission_game_sessions + mission_registered_purchases
// JOIN auth.users → raw_user_meta_data (name, user_name, state, gender, social_links, profile_gradient)

// Profile gradient colors (from raw_user_meta_data.profile_gradient)
const GRADIENTS = [
  ["#4f8fff","#22d4ef"], ["#9b72ff","#ff6eb4"], ["#00cc88","#22d4ef"],
  ["#ffac2f","#ff3d5a"], ["#30e8a0","#9b72ff"], ["#ff6eb4","#ffac2f"],
]

// Top participantes — redemptions GROUP BY user_id ORDER BY COUNT(*) DESC LIMIT 20
// src: redemptions WHERE coupon_code NOT LIKE '%_invalid_%' GROUP BY user_id
const TOP_PARTICIPANTES = [
  { rank:1,  name:"María G.",     username:"mariag",    state:"CDMX",    gender:"f", missions:142, exps:6, points:18400, purchases:8,  refs:23, gameScore:9820, checkins:31, joined:"Feb 2024", lastActive:"hace 2h",  grad:GRADIENTS[0], social:{ig:"mariag_mx",tk:"mariag"}, arquetipo:"Social" },
  { rank:2,  name:"Carlos M.",    username:"carlosm",   state:"Jalisco",  gender:"m", missions:128, exps:5, points:16200, purchases:4,  refs:8,  gameScore:12400,checkins:18, joined:"Mar 2024", lastActive:"hace 1d",  grad:GRADIENTS[1], social:{ig:"carloslive"},             arquetipo:"Competidor" },
  { rank:3,  name:"Ana R.",       username:"anarosario", state:"NL",      gender:"f", missions:119, exps:7, points:15800, purchases:12, refs:14, gameScore:6200, checkins:42, joined:"Ene 2024", lastActive:"hace 3h",  grad:GRADIENTS[2], social:{ig:"ana.r",fb:"anarosario"},  arquetipo:"Comprador" },
  { rank:4,  name:"Luis P.",      username:"luisp",     state:"CDMX",    gender:"m", missions:108, exps:4, points:14100, purchases:3,  refs:5,  gameScore:8900, checkins:22, joined:"Abr 2024", lastActive:"hace 6h",  grad:GRADIENTS[3], social:{},                            arquetipo:"Explorador" },
  { rank:5,  name:"Sofia R.",     username:"sofiar",    state:"Puebla",  gender:"f", missions:97,  exps:5, points:12600, purchases:9,  refs:11, gameScore:5400, checkins:28, joined:"Feb 2024", lastActive:"hace 1d",  grad:GRADIENTS[4], social:{ig:"sofi.r",tk:"sofiar_mx"},  arquetipo:"Fiel a la Marca" },
  { rank:6,  name:"Diego M.",     username:"diegom",    state:"CDMX",    gender:"m", missions:91,  exps:3, points:11800, purchases:1,  refs:4,  gameScore:14200,checkins:12, joined:"May 2024", lastActive:"hace 4h",  grad:GRADIENTS[5], social:{ig:"diegom"},                  arquetipo:"Competidor" },
  { rank:7,  name:"Laura T.",     username:"laurat",    state:"Jalisco",  gender:"f", missions:88,  exps:4, points:11200, purchases:6,  refs:9,  gameScore:4800, checkins:24, joined:"Mar 2024", lastActive:"hace 2d",  grad:GRADIENTS[0], social:{fb:"lauratejada"},             arquetipo:"Comprador" },
  { rank:8,  name:"Roberto L.",   username:"robertol",  state:"NL",      gender:"m", missions:82,  exps:6, points:10600, purchases:2,  refs:19, gameScore:7100, checkins:16, joined:"Ene 2024", lastActive:"hace 5h",  grad:GRADIENTS[1], social:{ig:"roberto.l",tk:"roberto"}, arquetipo:"Social" },
  { rank:9,  name:"Marco H.",     username:"marcoh",    state:"CDMX",    gender:"m", missions:79,  exps:3, points:9800,  purchases:15, refs:12, gameScore:3900, checkins:38, joined:"Jun 2024", lastActive:"hace 1h",  grad:GRADIENTS[2], social:{},                            arquetipo:"Comprador" },
  { rank:10, name:"Valeria C.",   username:"valeriac",  state:"Edo.Méx", gender:"f", missions:74,  exps:5, points:9200,  purchases:7,  refs:6,  gameScore:6800, checkins:19, joined:"Abr 2024", lastActive:"hace 3d",  grad:GRADIENTS[3], social:{ig:"vale.c"},                  arquetipo:"Explorador" },
  { rank:11, name:"Jorge V.",     username:"jorgev",    state:"CDMX",    gender:"m", missions:68,  exps:4, points:8600,  purchases:0,  refs:3,  gameScore:11800,checkins:8,  joined:"May 2024", lastActive:"hace 2d",  grad:GRADIENTS[4], social:{tk:"jorgev_tv"},               arquetipo:"Competidor" },
  { rank:12, name:"Diana C.",     username:"dianac",    state:"Jalisco",  gender:"f", missions:64,  exps:3, points:8100,  purchases:5,  refs:7,  gameScore:5200, checkins:21, joined:"Mar 2024", lastActive:"hace 6h",  grad:GRADIENTS[5], social:{ig:"dianac"},                  arquetipo:"Activo Regular" },
  { rank:13, name:"Pedro S.",     username:"pedros",    state:"CDMX",    gender:"m", missions:61,  exps:2, points:7800,  purchases:11, refs:2,  gameScore:4100, checkins:34, joined:"Jun 2024", lastActive:"hace 1d",  grad:GRADIENTS[0], social:{},                            arquetipo:"Comprador" },
  { rank:14, name:"Fernanda A.",  username:"fernandaa", state:"QRO",     gender:"f", missions:58,  exps:4, points:7400,  purchases:3,  refs:16, gameScore:3600, checkins:14, joined:"Feb 2024", lastActive:"hace 4h",  grad:GRADIENTS[1], social:{ig:"fer.a",fb:"fernandaa"},    arquetipo:"Social" },
  { rank:15, name:"Alejandro B.", username:"alejob",    state:"NL",      gender:"m", missions:54,  exps:3, points:6900,  purchases:8,  refs:4,  gameScore:7800, checkins:17, joined:"Jul 2024", lastActive:"hace 3h",  grad:GRADIENTS[2], social:{tk:"alejob"},                  arquetipo:"Explorador" },
]

// Activity spark per user (simulated weekly redemption trend — last 8 weeks)
const userSpark = (base) => Array.from({length:8},(_,i)=>
  Math.max(0, Math.round(base*(0.7+Math.sin(i*0.8)*0.3+Math.random()*0.2)))
)

// Mission type breakdown per user (calculable: SPLIT_PART(coupon_code,':',1) per user)
const USER_MISSION_BREAKDOWN = {
  "mariag":    [{ t:"Referido",5:5},{ t:"Código",t:40},{ t:"Survey",t:28},{ t:"Checkin",t:31},{ t:"Game",t:20},{ t:"Compra",t:18}],
}

// Velocity metric: missions per week (redemptions COUNT / weeks since joined)
const misionesPerWeek = (u) => (u.missions / Math.max(1, Math.round(
  (Date.now() - new Date("2024-" + (u.joined.includes("Ene")?"01":u.joined.includes("Feb")?"02":u.joined.includes("Mar")?"03":u.joined.includes("Abr")?"04":u.joined.includes("May")?"05":u.joined.includes("Jun")?"06":"07") + "-15").getTime()) / (7*24*3600*1000)
))).toFixed(1)

// ─── Behavioral DNA — dimensiones para radar por arquetipo ────
const ARCHETYPE_RADAR = {
  explorador:  [{ label:"Social",value:38 },{ label:"Compra",value:20 },{ label:"Lealtad",value:42 },{ label:"Gaming",value:28 },{ label:"Físico",value:55 }],
  competidor:  [{ label:"Social",value:28 },{ label:"Compra",value:12 },{ label:"Lealtad",value:48 },{ label:"Gaming",value:95 },{ label:"Físico",value:22 }],
  social:      [{ label:"Social",value:95 },{ label:"Compra",value:22 },{ label:"Lealtad",value:58 },{ label:"Gaming",value:18 },{ label:"Físico",value:38 }],
  comprador:   [{ label:"Social",value:32 },{ label:"Compra",value:95 },{ label:"Lealtad",value:65 },{ label:"Gaming",value:12 },{ label:"Físico",value:72 }],
  fiel:        [{ label:"Social",value:45 },{ label:"Compra",value:62 },{ label:"Lealtad",value:95 },{ label:"Gaming",value:25 },{ label:"Físico",value:68 }],
  activo:      [{ label:"Social",value:35 },{ label:"Compra",value:28 },{ label:"Lealtad",value:42 },{ label:"Gaming",value:32 },{ label:"Físico",value:38 }],
  dormant:     [{ label:"Social",value:12 },{ label:"Compra",value:10 },{ label:"Lealtad",value:18 },{ label:"Gaming",value:8  },{ label:"Físico",value:10 }],
  churn:       [{ label:"Social",value:5  },{ label:"Compra",value:5  },{ label:"Lealtad",value:5  },{ label:"Gaming",value:5  },{ label:"Físico",value:5  }],
}
const ARCHETYPE_LTV = {
  explorador:  { arpu:85,  ltv:1.3, churnRisk:"medio",     priority:"Normal",   pColor:C.ac },
  competidor:  { arpu:95,  ltv:1.6, churnRisk:"bajo",       priority:"Media",    pColor:C.yl },
  social:      { arpu:75,  ltv:2.1, churnRisk:"bajo",       priority:"Alta",     pColor:C.em },
  comprador:   { arpu:165, ltv:2.8, churnRisk:"medio-bajo", priority:"Alta",     pColor:C.gn },
  fiel:        { arpu:145, ltv:3.4, churnRisk:"muy bajo",   priority:"Alta",     pColor:C.pk },
  activo:      { arpu:55,  ltv:1.0, churnRisk:"medio",      priority:"Normal",   pColor:C.cy },
  dormant:     { arpu:20,  ltv:0.4, churnRisk:"alto",       priority:"Reactivar",pColor:C.or },
  churn:       { arpu:8,   ltv:0.1, churnRisk:"muy alto",   priority:"Win-back", pColor:C.rd },
}
const LIFECYCLE_STAGES = [
  { stage:"Descubrimiento",n:41700,desc:"Primer contacto con JALO",       color:C.ac,icon:"👁",detail:"auth.users COUNT(*)" },
  { stage:"Activación",    n:22400,desc:"Primera misión completada",       color:C.cy,icon:"⚡",detail:"MIN(redemptions.created_at)" },
  { stage:"Engagement",    n:14800,desc:"Completó ≥1 experiencia completa",color:C.gn,icon:"🔥",detail:"experience_missions completed" },
  { stage:"Retención",     n:8340, desc:"Regresó a una 2da experiencia",   color:C.em,icon:"🔁",detail:"DISTINCT experience_id ≥ 2" },
  { stage:"Revenue",       n:4800, desc:"Compra verificada ≥1 ticket",     color:C.or,icon:"💰",detail:"mission_registered_purchases" },
  { stage:"Advocacy",      n:2190, desc:"≥3 referidos activos",            color:C.yl,icon:"📣",detail:"referrals COUNT ≥ 3" },
]
const PRODUCT_PAIRS = [
  { p1:"Gansito Marinela", p2:"Lipton",        cooc:42, lift:3.2 },
  { p1:"Pan Bimbo 680g",   p2:"Nescafé inst.", cooc:38, lift:2.8 },
  { p1:"Tío Rico",         p2:"Nutrisa Bar",   cooc:71, lift:5.4 },
  { p1:"Recarga $50",      p2:"Recarga $100",  cooc:28, lift:4.1 },
  { p1:"Gansito Marinela", p2:"Submarino",     cooc:33, lift:2.9 },
  { p1:"Pan Bimbo",        p2:"Marinela surt.",cooc:55, lift:4.0 },
]
const PURCHASE_BY_HOUR = Array.from({length:24},(_,h)=>({
  h:`${h}h`,
  super:h>=9&&h<=21?Math.round(20+Math.sin((h-12)*0.4)*15+Math.random()*8):Math.round(2+Math.random()*4),
  conv: h>=7&&h<=23?Math.round(15+Math.sin((h-14)*0.35)*12+Math.random()*6):Math.round(1+Math.random()*3),
  rest: h>=12&&h<=22?Math.round(18+Math.sin((h-14)*0.5)*14+Math.random()*7):Math.round(1+Math.random()*2),
  farm: h>=9&&h<=20?Math.round(8+Math.sin((h-13)*0.4)*6+Math.random()*4):Math.round(1+Math.random()*2),
}))
const BRAND_AFFINITY = [
  { b1:"MVS Hub",    b2:"Sushi Itto",n:1760,pct:18 },
  { b1:"MVS Hub",    b2:"Nutrisa",   n:1170,pct:12 },
  { b1:"MVS Hub",    b2:"T-Conecta", n:680, pct:7  },
  { b1:"Sushi Itto", b2:"Nutrisa",   n:1310,pct:22 },
  { b1:"Sushi Itto", b2:"T-Conecta", n:540, pct:9  },
  { b1:"Nutrisa",    b2:"T-Conecta", n:830, pct:14 },
]
const MISSION_SPEED = [
  { tipo:"Código QR",  mins:1.2,  color:C.gn, note:"Escaneo inmediato en PDV" },
  { tipo:"Trivia",     mins:3.8,  color:C.ac, note:"Lectura + opción múltiple" },
  { tipo:"Encuesta",   mins:4.2,  color:C.pr, note:"Preguntas abiertas" },
  { tipo:"Videojuego", mins:6.1,  color:C.cy, note:"Duración media de partida" },
  { tipo:"Check-in",   mins:8.4,  color:C.yl, note:"Traslado + foto GPS" },
  { tipo:"Referido",   mins:1440, color:C.em, note:"1 día: esperar registro" },
  { tipo:"Compra",     mins:2880, color:C.or, note:"Visita tienda + aprobación" },
]



// ─── Cohort Heatmap ───────────────────────────────────────────
function CohortHeatmap({ cohorts }) {
  const maxMonths = Math.max(...cohorts.map(c=>c.w.length))
  const cs=28, gap=2
  const w=cs*maxMonths+(maxMonths-1)*gap, h=cohorts.length*cs+(cohorts.length-1)*gap
  const colorFor=(v)=>{
    if(v===null||v===undefined) return "transparent"
    if(v===100) return C.ac
    if(v>=70) return `${C.gn}cc`
    if(v>=50) return `${C.cy}cc`
    if(v>=30) return `${C.yl}cc`
    return `${C.rd}88`
  }
  return (
    <div>
      <div style={{ display:"flex", gap:gap, marginBottom:4 }}>
        <div style={{ width:36 }}/>
        {Array.from({length:maxMonths},(_,i)=>(
          <div key={i} style={{ width:cs, textAlign:"center", fontSize:8,
            color:C.mt, fontFamily:"'JetBrains Mono',monospace" }}>M{i}</div>
        ))}
      </div>
      {cohorts.map((c,ci)=>(
        <div key={ci} style={{ display:"flex", gap:gap, marginBottom:gap }}>
          <div style={{ width:36, fontSize:8, color:C.dm, fontWeight:700,
            display:"flex", alignItems:"center", flexShrink:0 }}>{c.label}</div>
          {Array.from({length:maxMonths},(_,mi)=>{
            const v=c.w[mi]
            const isNull=v===null||v===undefined
            return (
              <div key={mi} title={isNull?"—":`${v}%`}
                style={{ width:cs, height:cs, borderRadius:4,
                  background:colorFor(v), display:"flex", alignItems:"center", justifyContent:"center",
                  border:mi===0?`1px solid ${C.ac}44`:`1px solid transparent` }}>
                {!isNull&&(
                  <span style={{ fontSize:mi===0?9:8, fontWeight:mi===0?800:600,
                    fontFamily:"'JetBrains Mono',monospace",
                    color:v>=50?"rgba(255,255,255,.95)":"rgba(255,255,255,.6)" }}>
                    {v===100?"🟢":v}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ))}
      <div style={{ display:"flex", gap:8, marginTop:8, fontSize:8, color:C.mt, alignItems:"center" }}>
        <span>Baja</span>
        {[[C.rd+"88","<30%"],[C.yl+"cc","30-49%"],[C.cy+"cc","50-69%"],[C.gn+"cc","70-99%"],[C.ac,"100%"]].map(([c,l])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:3 }}>
            <div style={{ width:14, height:14, borderRadius:3, background:c }} />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Score Distribution Histogram ─────────────────────────────
function ScoreHistogram({ buckets, color=C.ac, gameLabel="" }) {
  const maxH=Math.max(...buckets.map(b=>b.n))
  const totalH=180, barW=Math.floor(600/(buckets.length+1))
  const bH=(n)=>Math.max(4,Math.round((n/maxH)*totalH))
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:totalH+20 }}>
        {buckets.map((b,i)=>{
          const h=bH(b.n)
          const isTop=i>=buckets.length-2
          return (
            <div key={i} title={`${b.range}: ${b.n} jugadores`}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:7, color:C.mt, fontFamily:"'JetBrains Mono',monospace" }}>
                {b.n>20?fmt(b.n):""}
              </span>
              <div style={{ width:"100%", height:h, borderRadius:"3px 3px 0 0",
                background:`${color}${isTop?"ff":"99"}`,
                boxShadow:isTop?`0 0 8px ${color}60`:"none",
                transition:"height .5s cubic-bezier(.4,0,.2,1)" }} />
              <span style={{ fontSize:7, color:isTop?color:C.mt, fontFamily:"'JetBrains Mono',monospace",
                textAlign:"center", lineHeight:1.2 }}>{b.range}</span>
            </div>
          )
        })}
      </div>
      {gameLabel&&<div style={{ fontSize:8, color:C.mt, textAlign:"center", marginTop:4 }}>{gameLabel}</div>}
    </div>
  )
}

// ─── Network Graph (referral chains) ──────────────────────────
function ReferralNetwork({ nodes, links, w=400, h=260 }) {
  const [hover, setHover] = useState(null)
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display:"block" }}>
      {links.map((l,i)=>{
        const s=nodes.find(n=>n.id===l.source), t=nodes.find(n=>n.id===l.target)
        if(!s||!t) return null
        const isHov=hover===l.source||hover===l.target
        return (
          <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
            stroke={isHov?s.color||C.em:C.bd}
            strokeWidth={isHov?1.5:0.8} strokeOpacity={isHov?0.9:0.35}
            markerEnd="none" />
        )
      })}
      {nodes.map((n,i)=>(
        <g key={i} onMouseEnter={()=>setHover(n.id)} onMouseLeave={()=>setHover(null)}>
          <circle cx={n.x} cy={n.y} r={n.r||6}
            fill={hover===n.id?n.color||C.em:`${n.color||C.em}88`}
            stroke={n.color||C.em} strokeWidth={1.2}
            style={{ cursor:"pointer", transition:"r .15s" }} />
          {(n.r||6)>8&&(
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
              fontSize={Math.min(9,n.r||6)} fill="#fff" fontFamily="'Outfit',sans-serif"
              fontWeight={700} style={{ pointerEvents:"none" }}>
              {n.label?.charAt(0)||""}
            </text>
          )}
          {hover===n.id&&n.label&&(
            <text x={n.x} y={n.y-(n.r||6)-4} textAnchor="middle"
              fontSize={8} fill={C.tx} fontFamily="'Outfit',sans-serif" fontWeight={600}>
              {n.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ─── Tag / Word Cloud ─────────────────────────────────────────
function TagCloud({ tags, onClick }) {
  const max=Math.max(...tags.map(t=>t.count))
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignContent:"flex-start" }}>
      {tags.map((t,i)=>{
        const sz=Math.max(9, Math.round(9+(t.count/max)*10))
        const op=0.35+(t.count/max)*0.65
        return (
          <span key={i} onClick={()=>onClick&&onClick(t)}
            title={`${t.word}: ${t.count} menciones`}
            style={{ fontSize:sz, fontWeight:t.count/max>0.6?700:400,
              color:t.color||C.dm, opacity:op, cursor:onClick?"pointer":"default",
              padding:"2px 5px", borderRadius:4,
              background:`${t.color||C.ac}${Math.round(op*12).toString(16).padStart(2,'0')}`,
              border:`1px solid ${t.color||C.ac}${Math.round(op*20).toString(16).padStart(2,'0')}`,
              transition:"opacity .15s, transform .15s",
              lineHeight:1.3 }}>
            {t.word}
          </span>
        )
      })}
    </div>
  )
}

// ─── Gauge / Semi-donut ───────────────────────────────────────
function Gauge({ value, max=100, color=C.gn, size=120, label="" }) {
  const r=(size-14)/2, cx=size/2, cy=size*0.62
  const arc=Math.PI // half circle
  const pct=Math.min(value/max,1)
  const filled=pct*arc*r*2
  const total=arc*r*2
  const startAngle=-Math.PI
  const x1=cx+r*Math.cos(startAngle), y1=cy+r*Math.sin(startAngle)
  const endAngle=startAngle+arc*pct
  const x2=cx+r*Math.cos(endAngle), y2=cy+r*Math.sin(endAngle)
  const largeArc=pct>0.5?1:0
  return (
    <svg width={size} height={size*0.7} style={{ display:"block", margin:"0 auto" }}>
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
        fill="none" stroke={C.bd} strokeWidth={10} strokeLinecap="round" />
      {pct>0&&(
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 4px ${color}80)` }} />
      )}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize={size*0.18} fontWeight={900}
        fill={color} fontFamily="'JetBrains Mono',monospace">{Math.round(value)}</text>
      {label&&<text x={cx} y={cy+12} textAnchor="middle" fontSize={8} fill={C.mt}
        fontFamily="'Outfit',sans-serif">{label}</text>}
    </svg>
  )
}


// ─── Referral Network Data ────────────────────────────────────
const REFERRAL_NODES = [
  // Top ambassadors
  { id:"A1", label:"María G.",   x:200, y:130, r:18, color:C.em, refs:23 },
  { id:"A2", label:"Roberto L.", x:340, y:90,  r:14, color:C.em, refs:19 },
  { id:"A3", label:"Fernanda A.",x:100, y:190, r:12, color:C.em, refs:16 },
  { id:"A4", label:"Marco H.",   x:280, y:200, r:12, color:C.em, refs:12 },
  // Level 1 referrals
  { id:"R1", x:150, y:60,  r:7, color:C.cy },{ id:"R2", x:240, y:50,  r:7, color:C.cy },
  { id:"R3", x:310, y:55,  r:7, color:C.cy },{ id:"R4", x:380, y:130, r:7, color:C.cy },
  { id:"R5", x:60,  y:140, r:7, color:C.cy },{ id:"R6", x:55,  y:220, r:7, color:C.cy },
  { id:"R7", x:130, y:250, r:7, color:C.cy },{ id:"R8", x:230, y:260, r:7, color:C.cy },
  { id:"R9", x:310, y:255, r:7, color:C.cy },{ id:"R10",x:360, y:200, r:7, color:C.cy },
  // Level 2 (referred by level 1)
  { id:"L2a",x:100, y:30,  r:5, color:`${C.ac}cc` },{ id:"L2b",x:200, y:20,  r:5, color:`${C.ac}cc` },
  { id:"L2c",x:290, y:25,  r:5, color:`${C.ac}cc` },{ id:"L2d",x:400, y:80,  r:5, color:`${C.ac}cc` },
  { id:"L2e",x:30,  y:170, r:5, color:`${C.ac}cc` },{ id:"L2f",x:25,  y:240, r:5, color:`${C.ac}cc` },
  { id:"L2g",x:170, y:280, r:5, color:`${C.ac}cc` },{ id:"L2h",x:260, y:285, r:5, color:`${C.ac}cc` },
]
const REFERRAL_LINKS = [
  {source:"A1",target:"R1"},{source:"A1",target:"R2"},{source:"A1",target:"R3"},
  {source:"A1",target:"R8"},{source:"A1",target:"R7"},
  {source:"A2",target:"R3"},{source:"A2",target:"R4"},{source:"A2",target:"R10"},
  {source:"A3",target:"R5"},{source:"A3",target:"R6"},{source:"A3",target:"R7"},
  {source:"A4",target:"R8"},{source:"A4",target:"R9"},{source:"A4",target:"R10"},
  {source:"R1",target:"L2a"},{source:"R2",target:"L2b"},{source:"R3",target:"L2c"},
  {source:"R4",target:"L2d"},{source:"R5",target:"L2e"},{source:"R6",target:"L2f"},
  {source:"R7",target:"L2g"},{source:"R8",target:"L2h"},
]

// ─── Score Distribution buckets per game ──────────────────────
const SCORE_DIST = {
  "Snake":      [{range:"0-2K",n:580},{range:"2-4K",n:840},{range:"4-6K",n:920},{range:"6-8K",n:640},{range:"8-10K",n:280},{range:"10K+",n:160}],
  "Pac-Man":    [{range:"0-3K",n:420},{range:"3-6K",n:680},{range:"6-9K",n:780},{range:"9-12K",n:580},{range:"12-15K",n:290},{range:"15K+",n:140}],
  "Breakout":   [{range:"0-2K",n:490},{range:"2-4K",n:720},{range:"4-6K",n:660},{range:"6-8K",n:290},{range:"8K+",n:180}],
  "Trivia Race":[{range:"0-1K",n:380},{range:"1-2K",n:540},{range:"2-3K",n:490},{range:"3-4K",n:310},{range:"4K+",n:170}],
}

// ─── Tag cloud data for surveys ───────────────────────────────
const SURVEY_TAGS = [
  {word:"calidad",count:890,color:C.gn},{word:"precio",count:760,color:C.ac},
  {word:"servicio",count:680,color:C.cy},{word:"sabor",count:620,color:C.or},
  {word:"variedad",count:540,color:C.pr},{word:"rapidez",count:490,color:C.em},
  {word:"ambiente",count:380,color:C.yl},{word:"limpieza",count:350,color:C.gn},
  {word:"atención",count:310,color:C.ac},{word:"valor",count:290,color:C.cy},
  {word:"frescura",count:260,color:C.gn},{word:"delivery",count:240,color:C.rd},
  {word:"empaque",count:220,color:C.dm},{word:"promociones",count:200,color:C.or},
  {word:"app",count:180,color:C.ac},{word:"puntos",count:170,color:C.yl},
  {word:"descuento",count:160,color:C.pr},{word:"novedad",count:140,color:C.em},
  {word:"receta",count:120,color:C.gn},{word:"lealtad",count:110,color:C.pk},
]

// ─── Cohort retention data ───────────────────────────────────
const COHORT_DATA = [
  { label:"Ene-24", w:[100,74,56,42,33,27,22,18,15,12,11,10] },
  { label:"Feb-24", w:[100,71,52,38,29,24,19,15,13,11,10,null] },
  { label:"Mar-24", w:[100,68,49,36,28,22,18,14,12,10,null,null] },
  { label:"Abr-24", w:[100,72,54,41,32,26,21,17,14,null,null,null] },
  { label:"May-24", w:[100,69,50,37,29,23,18,15,null,null,null,null] },
  { label:"Jun-24", w:[100,73,55,43,34,27,21,null,null,null,null,null] },
  { label:"Jul-24", w:[100,70,51,39,30,24,null,null,null,null,null,null] },
  { label:"Ago-24", w:[100,75,57,44,35,null,null,null,null,null,null,null] },
  { label:"Sep-24", w:[100,72,53,40,null,null,null,null,null,null,null,null] },
  { label:"Oct-24", w:[100,68,50,null,null,null,null,null,null,null,null,null] },
  { label:"Nov-24", w:[100,74,null,null,null,null,null,null,null,null,null,null] },
  { label:"Dic-24", w:[100,null,null,null,null,null,null,null,null,null,null,null] },
]

// ─── Scorecard live pulses ────────────────────────────────────
const LIVE_EVENTS = [
  { type:"participación", user:"@mariag",    exp:"MVS Radio Fan",    time:"hace 1min",  color:C.ac },
  { type:"registro",      user:"@newuser42", exp:"Sushi Itto FC",    time:"hace 2min",  color:C.gn },
  { type:"compra",        user:"@marcos",    exp:"T-Conecta Megas",  time:"hace 3min",  color:C.or },
  { type:"referido",      user:"@fernandaa", exp:"Nutrisa Wellness", time:"hace 4min",  color:C.em },
  { type:"canje",         user:"@luisp",     exp:"MVS Radio Fan",    time:"hace 5min",  color:C.cy },
  { type:"check-in",      user:"@ana_r",     exp:"Sushi Itto FC",    time:"hace 6min",  color:C.yl },
]


// ─── Progresión de Misiones — datos demo ─────────────────────
// Simula: experience_missions (ordenadas) + redemptions (por usuario)
// + tabla de empleados/miembros esperados (lista cargada por la marca)

const PROG_EXPERIENCES = [
  {
    id: "e1", name: "MVS Radio Fan 2026", brand: "MVS Hub", totalExpected: 320,
    missions: [
      { order: 1, name: "Bienvenida",   type: "CODE",     icon: "🎟", req: false },
      { order: 2, name: "Trivia MVS",   type: "TRIVIA",   icon: "🧠", req: true  },
      { order: 3, name: "Encuesta",     type: "SURVEY",   icon: "📝", req: false },
      { order: 4, name: "Videojuego",   type: "GAME",     icon: "🎮", req: false },
      { order: 5, name: "Check-in PDV", type: "CHECK-IN", icon: "📍", req: true  },
      { order: 6, name: "Referido",     type: "REFERRAL", icon: "📣", req: false },
    ],
  },
  {
    id: "e2", name: "Sushi Itto Fan Club", brand: "Sushi Itto", totalExpected: 180,
    missions: [
      { order: 1, name: "Compra verif.", type: "PURCHASE", icon: "🛒", req: true  },
      { order: 2, name: "Código local",  type: "CODE",     icon: "🎟", req: false },
      { order: 3, name: "Encuesta",      type: "SURVEY",   icon: "📝", req: false },
      { order: 4, name: "Invita amigo",  type: "REFERRAL", icon: "📣", req: false },
    ],
  },
  {
    id: "e3", name: "Nutrisa Wellness 2026", brand: "Nutrisa", totalExpected: 210,
    missions: [
      { order: 1, name: "Registro",     type: "CODE",     icon: "🎟", req: false },
      { order: 2, name: "Quiz salud",   type: "TRIVIA",   icon: "🧠", req: false },
      { order: 3, name: "Compra",       type: "PURCHASE", icon: "🛒", req: true  },
      { order: 4, name: "Encuesta",     type: "SURVEY",   icon: "📝", req: false },
      { order: 5, name: "Check-in",     type: "CHECK-IN", icon: "📍", req: true  },
    ],
  },
  {
    id: "e5", name: "T-Conecta Megas", brand: "T-Conecta", totalExpected: 95,
    missions: [
      { order: 1, name: "Recarga verif.", type: "PURCHASE", icon: "📱", req: true  },
      { order: 2, name: "Código SMS",     type: "CODE",     icon: "🎟", req: false },
      { order: 3, name: "Invita a 1",     type: "REFERRAL", icon: "📣", req: false },
    ],
  },
]

// Genera participantes simulados para una experiencia
// src: auth.users JOIN redemptions GROUP BY user_id → SPLIT_PART(coupon_code,':',1)
// + lista de empleados esperados (brand-uploaded employee list)
function genParticipants(exp) {
  const DEPTS = ["Ventas","Marketing","Operaciones","RRHH","Finanzas","TI","Legal","Dirección"]
  const STATES = ["CDMX","Jalisco","N. León","Puebla","Edo. Méx.","QRO","GTO","SLP"]
  const FIRST_M = ["Carlos","Luis","Jorge","Marco","Diego","Roberto","Alejandro","Pedro","Miguel","Fernando"]
  const FIRST_F = ["María","Ana","Sofía","Laura","Fernanda","Diana","Valeria","Andrea","Gabriela","Mónica"]
  const LAST    = ["García","López","Martínez","González","Hernández","Pérez","Sánchez","Ramírez","Torres","Flores"]
  const n = exp.totalExpected
  const nm = exp.missions.length
  const rng = (seed) => { let x=Math.sin(seed)*10000; return x-Math.floor(x) }

  return Array.from({length: n}, (_, i) => {
    const seed = i * 137 + exp.id.charCodeAt(0) * 31
    const isFemale = rng(seed) > 0.48
    const firstName = isFemale
      ? FIRST_F[Math.floor(rng(seed+1)*FIRST_F.length)]
      : FIRST_M[Math.floor(rng(seed+1)*FIRST_M.length)]
    const lastName = LAST[Math.floor(rng(seed+2)*LAST.length)]
    const dept = DEPTS[Math.floor(rng(seed+3)*DEPTS.length)]
    const state = STATES[Math.floor(rng(seed+4)*STATES.length)]
    const grad = GRADIENTS[Math.floor(rng(seed+5)*GRADIENTS.length)]

    // Determine how many missions completed (weighted: more users at lower counts)
    const raw = rng(seed+6)
    let completedN
    if (raw < 0.28)      completedN = 0          // nunca participó
    else if (raw < 0.40) completedN = 1
    else if (raw < 0.52) completedN = 2
    else if (raw < 0.62) completedN = 3
    else if (raw < 0.72) completedN = Math.min(4, nm)
    else if (raw < 0.84) completedN = Math.min(5, nm)
    else                 completedN = nm          // completó todo

    // Which specific missions (always sequential from order 1)
    const completed = exp.missions.slice(0, completedN).map(m => m.order)

    // Last activity
    const daysAgo = completedN === 0 ? null
      : completedN === nm ? Math.floor(rng(seed+7)*5)
      : Math.floor(rng(seed+7)*30)

    const lastActivity = daysAgo === null ? null
      : daysAgo === 0 ? "hoy"
      : daysAgo === 1 ? "ayer"
      : `hace ${daysAgo}d`

    return {
      id: `u${exp.id}${i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@empresa.com`,
      dept,
      state,
      gender: isFemale ? "f" : "m",
      completed,            // array of completed mission orders
      completedN,
      totalMissions: nm,
      lastActivity,
      daysAgo,
      isComplete: completedN === nm,
      neverStarted: completedN === 0,
      inProgress: completedN > 0 && completedN < nm,
      grad,
    }
  })
}

// Pre-cache participants for each experience
const PROG_CACHE = {}
PROG_EXPERIENCES.forEach(exp => {
  PROG_CACHE[exp.id] = genParticipants(exp)
})

const PANELS = [
  { id:"sc", label:"Scorecard",    icon:LayoutDashboard, roles:["super","admin","client"] },
  { id:"bz", label:"Business",     icon:BarChart2,       roles:["super"] },
  { id:"fn", label:"Funnel",       icon:TrendingUp,      roles:["super","admin","client"] },
  { id:"gr", label:"Growth",       icon:ArrowUpRight,    roles:["super","admin"] },
  { id:"ar", label:"Arquetipos",   icon:Brain,           roles:["super","admin","client"] },
  { id:"br", label:"Marcas",       icon:Building2,       roles:["super","admin"] },
  { id:"mb", label:"Mi Marca",     icon:Star,            roles:["client"] },
  { id:"ex", label:"Experiencias", icon:Layers,          roles:["super","admin","client"] },
  { id:"mi", label:"Misiones",     icon:Target,          roles:["super","admin","client"] },
  { id:"mp", label:"Mapa Físico",  icon:MapPin,          roles:["super","admin","client"] },
  { id:"au", label:"Audiencia",    icon:Users,           roles:["super","admin"] },
  { id:"rw", label:"Recompensas",  icon:Gift,            roles:["super","admin","client"] },
  { id:"gm", label:"Juegos",       icon:Gamepad2,        roles:["super","admin"] },
  { id:"vi", label:"Viral",        icon:Share2,          roles:["super","admin","client"] },
  { id:"us", label:"Usuarios",      icon:UserCheck,       roles:["super","admin"] },
  { id:"rt", label:"Retail",       icon:ShoppingBag,     roles:["super","admin","client"] },
  { id:"dt", label:"Data Intel",   icon:Database,        roles:["super","admin","client"] },
  { id:"tc", label:"Telecom",      icon:Zap,             roles:["super"] },
  { id:"op", label:"Ops",          icon:Settings,        roles:["super","admin"] },
  { id:"co", label:"Consumidores",  icon:ShoppingCart,    roles:["super","admin"] },
  { id:"pr", label:"Progresión",    icon:Sword,           roles:["super","admin","client"] },
]

// ─── Primitives ───────────────────────────────────────────────
function Spark({ data, color = C.ac, w = 56, h = 18 }) {
  if (!data?.length) return null
  const mx = Math.max(...data, 1)
  const pts = data.map((v, i) =>
    `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 2 - (v / mx) * (h - 4)).toFixed(1)}`
  ).join(" ")
  return (
    <svg width={w} height={h} style={{ display:"inline-block", verticalAlign:"middle", marginLeft:6 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Ring({ value, size = 40, stroke = 3, color = C.gn }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const ready = useContext(ReadyCtx)
  const anim = useCountUp(value, 900, 200)
  const offset = circ - (circ * (ready ? Math.min(anim, 100) : 0)) / 100
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.bd} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  )
}

function KPI({ label, value, sub, color, i = 0, spark, delta, demo }) {
  const ready = useContext(ReadyCtx)
  const rawStr = String(value ?? "")
  const match = rawStr.replace(/[,\s]/g,"").match(/^([0-9]+(?:\.[0-9]+)?)(.*?)$/)
  const numTarget = match ? parseFloat(match[1]) : null
  const suffix = match ? match[2] : ""
  const anim = useCountUp(numTarget, 1000 + i * 80, 100 + i * 80)
  let display = value
  if (ready && numTarget && numTarget > 0) {
    let formatted
    if (suffix.includes(".") || rawStr.includes(".")) {
      formatted = anim.toFixed(1)
    } else if (numTarget >= 1000) {
      formatted = Math.round(anim).toLocaleString("es-MX")
    } else {
      formatted = String(Math.round(anim))
    }
    display = formatted + suffix
  }
  return (
    <div style={{
      background:`linear-gradient(145deg,${C.card},${C.alt})`,
      border:`1px solid ${C.bd}`, borderRadius:12, padding:"13px 15px",
      transition:"transform .18s,box-shadow .18s", cursor:"default",
      position:"relative", overflow:"hidden",
    }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,.4)`}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
      {demo && (
        <div style={{ position:"absolute", top:6, right:6, fontSize:7, fontWeight:700,
          background:`${C.demo}18`, color:C.demo, border:`1px solid ${C.demo}40`,
          padding:"1px 5px", borderRadius:3 }}>DEMO</div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:9, color:C.mt, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</span>
        {delta && (
          <span style={{
            fontSize:8, fontWeight:700, padding:"1px 5px", borderRadius:3,
            background: delta.startsWith("+") ? `${C.gn}18` : `${C.rd}18`,
            color: delta.startsWith("+") ? C.gn : C.rd,
          }}>{delta}</span>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:2 }}>
        <span style={{ fontSize:22, fontWeight:800, color:color||C.tx, fontFamily:"'JetBrains Mono',monospace", letterSpacing:-0.8 }}>
          {ready ? display : "—"}
        </span>
        {spark && <Spark data={spark} color={color||C.ac} />}
      </div>
      {sub && <div style={{ fontSize:9, color:C.dm, marginTop:4, lineHeight:1.3 }}>{sub}</div>}
    </div>
  )
}

function Donut({ segs, size = 90, thick = 13, label }) {
  const total = segs.reduce((s, d) => s + d.v, 0) || 1
  const r = (size - thick) / 2
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        {segs.map((seg, i) => {
          const len = (seg.v / total) * circ
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
              stroke={seg.c} strokeWidth={thick}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset} strokeLinecap="butt" />
          )
          offset += len
          return el
        })}
      </svg>
      {label && (
        <div style={{ position:"absolute", textAlign:"center" }}>
          <div style={{ fontSize:12, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color:C.tx }}>{label}</div>
        </div>
      )}
    </div>
  )
}


function Row({ label, value, color, sub, src }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"5px 0", borderBottom:`1px solid ${C.bd}10`,
      transition:"background .12s", cursor:"default" }}>
      <div>
        <span style={{ color:C.dm, fontSize:11 }}>{label}</span>
        {sub && <span style={{ fontSize:8, color:C.mt, marginLeft:4 }}>{sub}</span>}
      </div>
      <span style={{ fontWeight:600, color:color||C.tx, fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>{value}</span>
    </div>
  )
}

function Card({ children, title, style, src, demo }) {
  return (
    <div style={{
      background:`linear-gradient(160deg,${C.card},${C.alt})`,
      border:`1px solid ${C.bd}`, borderRadius:12, padding:14, ...style,
    }}>
      {(title||demo) && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
          {title && <span style={{ fontSize:11, fontWeight:700, color:C.tx, flex:1 }}>{title}</span>}
          {demo && <span style={{ fontSize:7, fontWeight:700, background:`${C.demo}18`, color:C.demo,
            border:`1px solid ${C.demo}40`, padding:"1px 5px", borderRadius:3 }}>PROYECTADO</span>}
        </div>
      )}
      {children}
      {src && (
        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10,
          paddingTop:8, borderTop:`1px solid ${C.bd}` }}>
          <Database size={9} color={C.mt} />
          <span style={{ fontSize:9, color:C.mt, fontFamily:"'JetBrains Mono',monospace" }}>{src}</span>
        </div>
      )}
    </div>
  )
}

function Badge({ text, color = C.ac }) {
  return (
    <span style={{ fontSize:8, padding:"2px 6px", borderRadius:3, fontWeight:700,
      background:`${color}18`, color, border:`1px solid ${color}33`, marginLeft:4 }}>
      {text}
    </span>
  )
}

function PBar({ value, max = 100, color = C.ac, h = 5 }) {
  const ready = useContext(ReadyCtx)
  const anim = useCountUp(max > 0 ? (value/max)*100 : 0, 800, 200)
  return (
    <div style={{ background:`${color}15`, borderRadius:3, height:h, overflow:"hidden" }}>
      <div style={{ background:color, height:"100%", borderRadius:3,
        width:(ready ? anim : 0)+"%", transition:"width .7s cubic-bezier(.4,0,.2,1)",
        boxShadow:`0 0 8px ${color}60` }} />
    </div>
  )
}

function StackBar({ data }) {
  return (
    <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:1 }}>
      {data.map((d, i) => <div key={i} style={{ flex:Math.max(d.v,1), background:d.c }} />)}
    </div>
  )
}

// ─── Radar / Spider chart — behavioral DNA ────────────────────
function RadarSVG({ dims, size=180, color=C.ac, showLabels=true }) {
  const n = dims.length, cx = size/2, cy = size/2
  const r = size*0.36, labelR = size*0.48
  const angle = (i) => (i/n)*2*Math.PI - Math.PI/2
  const pt = (i, rad) => ({ x: cx + rad*Math.cos(angle(i)), y: cy + rad*Math.sin(angle(i)) })
  const polyStr = (rad) => dims.map((_,i)=>{ const p=pt(i,rad); return `${p.x},${p.y}` }).join(" ")
  const dataStr = dims.map((d,i)=>{ const p=pt(i,(d.value/100)*r); return `${p.x},${p.y}` }).join(" ")
  return (
    <svg width={size} height={size} style={{ display:"block", margin:"0 auto" }}>
      {[25,50,75,100].map(l=>(
        <polygon key={l} points={polyStr((l/100)*r)}
          fill="none" stroke={C.bd} strokeWidth={0.5} opacity={0.5} />
      ))}
      {dims.map((_,i)=>{ const p=pt(i,r); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.bd} strokeWidth={0.5} opacity={0.5} /> })}
      <polygon points={dataStr} fill={`${color}25`} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {dims.map((d,i)=>{ const p=pt(i,(d.value/100)*r); return <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke={C.bg} strokeWidth={1.5} /> })}
      {showLabels && dims.map((d,i)=>{
        const p=pt(i,labelR)
        const anch = Math.abs(p.x-cx)<5?"middle":p.x<cx?"end":"start"
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anch} dominantBaseline="central"
            fontSize={size*0.065} fill={C.dm} fontFamily="'Outfit',sans-serif" fontWeight={500}>
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Mini radar (inline, no labels) ──────────────────────────
function MiniRadar({ dims, size=48, color=C.ac }) {
  const n=dims.length, cx=size/2, cy=size/2, r=size*0.4
  const angle=(i)=>(i/n)*2*Math.PI-Math.PI/2
  const pt=(i,rad)=>({ x:cx+rad*Math.cos(angle(i)), y:cy+rad*Math.sin(angle(i)) })
  const grid=dims.map((_,i)=>{ const p=pt(i,r); return `${p.x},${p.y}` }).join(" ")
  const data=dims.map((d,i)=>{ const p=pt(i,(d.value/100)*r); return `${p.x},${p.y}` }).join(" ")
  return (
    <svg width={size} height={size} style={{ flexShrink:0 }}>
      <polygon points={grid} fill="none" stroke={`${C.bd}80`} strokeWidth={0.5} />
      {dims.map((_,i)=>{ const p=pt(i,r); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={`${C.bd}60`} strokeWidth={0.4} /> })}
      <polygon points={data} fill={`${color}30`} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  )
}

// ─── Age Pyramid (butterfly) ──────────────────────────────────
function AgePyramid({ data, maxW=320 }) {
  const maxVal = Math.max(...data.flatMap(d=>[d.m+(d.nd||0), d.f+(d.nd||0)]))*1.1
  const barH=26, midX=maxW/2, labelW=44, barMax=midX-labelW/2-8
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:C.mt, marginBottom:4, fontWeight:700 }}>
        <span style={{ color:C.ac }}>◀ Masculino</span>
        <span>Edad</span>
        <span style={{ color:C.pk }}>Femenino ▶</span>
      </div>
      <svg width={maxW} height={data.length*barH+8} style={{ display:"block" }}>
        {data.map((d,i)=>{
          const mW=(d.m/maxVal)*barMax, fW=(d.f/maxVal)*barMax
          const ndHalf=((d.nd||0)/maxVal/2)*barMax, y=i*barH+4
          return (
            <g key={i}>
              <rect x={midX-labelW/2-mW-ndHalf} y={y+3} width={mW} height={barH-6} fill={C.ac} rx={3} opacity={0.82} />
              {d.nd>0&&<rect x={midX-labelW/2-ndHalf} y={y+3} width={ndHalf} height={barH-6} fill={C.dm} opacity={0.35} />}
              <rect x={midX+labelW/2} y={y+3} width={fW} height={barH-6} fill={C.pk} rx={3} opacity={0.82} />
              {d.nd>0&&<rect x={midX+labelW/2+fW} y={y+3} width={ndHalf} height={barH-6} fill={C.dm} opacity={0.35} />}
              <text x={midX} y={y+barH/2} textAnchor="middle" dominantBaseline="central"
                fontSize={9} fill={C.tx} fontWeight={700} fontFamily="'JetBrains Mono',monospace">{d.range}</text>
              <text x={midX-labelW/2-mW-ndHalf-4} y={y+barH/2} textAnchor="end" dominantBaseline="central"
                fontSize={8} fill={C.ac} fontFamily="'JetBrains Mono',monospace">{d.m}%</text>
              <text x={midX+labelW/2+fW+(ndHalf||0)+4} y={y+barH/2} textAnchor="start" dominantBaseline="central"
                fontSize={8} fill={C.pk} fontFamily="'JetBrains Mono',monospace">{d.f}%</text>
            </g>
          )
        })}
      </svg>
      <div style={{ display:"flex", gap:12, marginTop:4, fontSize:8, color:C.mt }}>
        {[[C.ac,"Masculino"],[C.pk,"Femenino"],[C.dm,"N/D"]].map(([c,l])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:10, height:6, borderRadius:2, background:c }} /><span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Trapezoid Funnel ──────────────────────────────────────────
function TrapezoidFunnel({ steps, w=280 }) {
  const h = Math.floor((300-2*(steps.length-1))/steps.length)
  const totalH = steps.length*h+(steps.length-1)*2
  const maxN = steps[0]?.n || 1
  return (
    <svg width={w} height={totalH} viewBox={`0 0 ${w} ${totalH}`} style={{ display:"block", margin:"0 auto" }}>
      <defs>
        {steps.map((s,i)=>(
          <linearGradient key={i} id={`tfg${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={s.color||C.ac} stopOpacity={0.8} />
            <stop offset="100%" stopColor={s.color||C.ac} stopOpacity={0.55} />
          </linearGradient>
        ))}
      </defs>
      {steps.map((s,i)=>{
        const topPct=s.n/maxN
        const nextPct=i<steps.length-1?steps[i+1].n/maxN:topPct*0.6
        const topW=topPct*w, nextW=nextPct*w
        const topX=(w-topW)/2, nextX=(w-nextW)/2
        const y=i*(h+2)
        const dropPct=i>0?Math.round((1-s.n/steps[i-1].n)*100):0
        return (
          <g key={i}>
            <path d={`M ${topX} ${y} L ${topX+topW} ${y} L ${nextX+nextW} ${y+h} L ${nextX} ${y+h} Z`}
              fill={`url(#tfg${i})`} stroke={s.color||C.ac} strokeWidth={0.5} />
            <text x={w/2} y={y+h*0.36} textAnchor="middle" fontSize={8} fontWeight={700}
              fill="#fff" fontFamily="'Outfit',sans-serif" opacity={0.9}>{s.stage||s.step}</text>
            <text x={w/2} y={y+h*0.66} textAnchor="middle" fontSize={12} fontWeight={800}
              fill="#fff" fontFamily="'JetBrains Mono',monospace">{fmt(s.n)}</text>
            {i>0&&(
              <text x={topX-6} y={y+h*0.5} textAnchor="end" fontSize={8}
                fill={dropPct>40?C.rd:dropPct>20?C.or:C.mt}
                fontFamily="'JetBrains Mono',monospace">↓{dropPct}%</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Activity Calendar (GitHub-style, 52 weeks) ───────────────
function ActivityCalendar({ weeksData, color=C.ac, label="Actividad" }) {
  const cs=9, gap=2
  const DAYS=["D","L","M","X","J","V","S"]
  const tw=52*(cs+gap)+32, th=7*(cs+gap)+22
  return (
    <div>
      <div style={{ fontSize:9, color:C.mt, marginBottom:4 }}>{label}</div>
      <svg width={tw} height={th} style={{ display:"block", maxWidth:"100%" }}>
        {DAYS.map((d,di)=>(
          <text key={di} x={26} y={20+di*(cs+gap)+cs/2} textAnchor="end" dominantBaseline="central"
            fontSize={7} fill={C.mt}>{di%2===0?d:""}</text>
        ))}
        {weeksData.map((week,wi)=>week.map((val,di)=>(
          <rect key={`${wi}-${di}`}
            x={28+wi*(cs+gap)} y={18+di*(cs+gap)}
            width={cs} height={cs} rx={2}
            fill={val<=0?C.bd:color}
            opacity={val<=0?0.06:0.1+val*0.9}
          />
        )))}
      </svg>
      <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:4, fontSize:8, color:C.mt }}>
        <span>Menos</span>
        {[0.06,0.3,0.55,0.8,1.0].map((o,i)=>(
          <div key={i} style={{ width:cs, height:cs, borderRadius:2, background:color, opacity:o }} />
        ))}
        <span>Más</span>
      </div>
    </div>
  )
}

// ─── Géneration of activity calendar data ─────────────────────
const PLATFORM_CALENDAR = Array.from({length:52},(_,w)=>
  Array.from({length:7},(_,d)=>{
    const isWknd=d>=5
    const trend=0.25+(w/52)*0.55
    const wave=Math.sin(w*0.3)*0.15+Math.random()*0.08
    return Math.min(1,Math.max(0,trend+wave+(isWknd?0.12:0)))
  })
)



// Recharts config
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:C.card, border:`1px solid ${C.bda}`, borderRadius:8,
      padding:"8px 12px", boxShadow:`0 8px 32px rgba(0,0,0,.6)` }}>
      <p style={{ fontSize:10, color:C.mt, marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => (
        <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ width:7, height:7, borderRadius:2, background:p.color }} />
          <span style={{ fontSize:10, color:C.dm }}>{p.name}:</span>
          <span style={{ fontSize:10, fontWeight:700, color:p.color, fontFamily:"'JetBrains Mono',monospace" }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}
const AX = {
  x: { tick:{ fill:C.mt, fontSize:9 }, axisLine:false, tickLine:false },
  y: { tick:{ fill:C.mt, fontSize:9 }, axisLine:false, tickLine:false, width:32 },
  grid: { strokeDasharray:"3 6", stroke:`${C.bd}80`, vertical:false },
}

// ─── Grid helpers ─────────────────────────────────────────────
const G = ({ cols="repeat(auto-fit,minmax(130px,1fr))", gap=8, mb=12, children }) => (
  <div style={{ display:"grid", gridTemplateColumns:cols, gap, marginBottom:mb }}>{children}</div>
)

// ─── PANELS ───────────────────────────────────────────────────

function PanelScorecard({ role, visibleExp, visibleBrands }) {
  const { scale, chartDays } = useContext(DateCtx)
  const totalUsers = visibleBrands.reduce((a,b) => a+b.users, 0)
  const totalPart = visibleBrands.reduce((a,b) => a+b.redemptions, 0)
  const activeExp = visibleExp.filter(e => e.status==="active").length
  const totalReferrals = visibleExp.reduce((a,e) => a+e.referrals,0)
  const chartData = DAILY_30.slice(-chartDays)
  const northStar = ds(8640, scale)
  return (
    <div>
      {/* North star hero */}
      <div style={{ background:`linear-gradient(135deg,#0a1830,${C.alt})`,
        border:`1px solid ${C.bda}`, borderRadius:16, padding:"20px 24px", marginBottom:14 }}>
        <div style={{ fontSize:9, color:C.mt, textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>
          North Star — Participaciones Activas (período seleccionado)
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:44, fontWeight:900, fontFamily:"'JetBrains Mono',monospace",
            color:C.gn, letterSpacing:-2 }}>
            {fmt(northStar)}
          </span>
          <Spark data={SPARK_7} color={C.gn} w={70} h={24} />
          <Badge text="+8.2% SoS" color={C.gn} />
          <Badge text="+23% MoM" color={C.gn} />
        </div>
        <div style={{ fontSize:10, color:C.mt, marginTop:6 }}>
          Registros: <span style={{ color:C.ac, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>+{ds(287,scale)}</span>
          <span style={{ margin:"0 10px", color:C.bd }}>·</span>
          Tasa activación: <span style={{ color:C.cy, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>42.3%</span>
          <span style={{ margin:"0 10px", color:C.bd }}>·</span>
          K-Factor estimado: <span style={{ color:C.em, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>1.94</span>
          <Badge text="CALCULADO" color={C.em} />
        </div>
      </div>
      <G cols="repeat(auto-fit,minmax(145px,1fr))">
        <KPI label="Usuarios totales" value={fmt(ds(totalUsers,scale))} sub="auth.users" delta="+12%" spark={SPARK_7} i={0} />
        <KPI label="Participaciones" value={fmt(ds(totalPart,scale))} sub="redemptions válidas" delta="+18%" i={1} />
        <KPI label="Experiencias activas" value={activeExp} sub={`de ${visibleExp.length} total`} color={C.gn} i={2} />
        <KPI label="Marcas" value={visibleBrands.length} sub="en plataforma" color={C.cy} i={3} />
        <KPI label="Referidos totales" value={fmt(ds(totalReferrals,scale))} sub="referrals.COUNT" color={C.em} i={4} />
        <KPI label="Retención D7" value="54.2%" sub="estimado por cohorte" color={C.or} i={5} demo />
      </G>
      {/* Live activity feed + platform health */}
      <G cols="1fr auto">
        <Card title="⚡ Feed en tiempo real" src="redemptions + auth.users (last events — demo)">
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {LIVE_EVENTS.map((ev,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0",
                borderBottom:i<LIVE_EVENTS.length-1?`1px solid ${C.bd}15`:"none",
                opacity:1-i*0.12 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                  background:ev.color, boxShadow:`0 0 5px ${ev.color}80` }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                    <span style={{ fontSize:9, fontWeight:700, color:ev.color,
                      textTransform:"uppercase", letterSpacing:0.5 }}>{ev.type}</span>
                    <span style={{ fontSize:9, color:C.dm, fontFamily:"'JetBrains Mono',monospace" }}>{ev.user}</span>
                  </div>
                  <div style={{ fontSize:8, color:C.mt, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.exp}</div>
                </div>
                <span style={{ fontSize:8, color:C.mt, flexShrink:0 }}>{ev.time}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Salud de la plataforma">
          {[
            { label:"Tasa de activación", value:42, color:C.cy, sub:"registro → 1ra misión",  icon:"⚡", ref:"Meta: 60%" },
            { label:"Retención D7",       value:54, color:C.gn, sub:"vuelven en 7 días",      icon:"🔁", ref:"Meta: 65%" },
            { label:"K-Factor",           value:194,color:C.em, sub:"referidos por participante×100", icon:"📣", ref:"K=1.94 → viral" },
            { label:"Claim rate",         value:87, color:C.yl, sub:"recompensas canjeadas",  icon:"🎁", ref:"Meta: 90%" },
          ].map((g,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"9px 0",
              borderBottom:i<3?`1px solid ${C.bd}20`:"none",
            }}>
              {/* Semicircle gauge — compact */}
              <div style={{ flexShrink:0, position:"relative", width:52, height:30 }}>
                <svg width={52} height={30} viewBox="0 0 52 30">
                  <path d="M 4 28 A 22 22 0 0 1 48 28" fill="none" stroke={C.bd} strokeWidth={6} strokeLinecap="round" />
                  <path d="M 4 28 A 22 22 0 0 1 48 28" fill="none" stroke={g.color} strokeWidth={6} strokeLinecap="round"
                    strokeDasharray={`${Math.min(g.value,100)/100*69.1} 69.1`}
                    style={{ filter:`drop-shadow(0 0 3px ${g.color}80)` }} />
                </svg>
                <div style={{ position:"absolute", bottom:0, left:0, right:0,
                  textAlign:"center", fontSize:11, fontWeight:900,
                  fontFamily:"'JetBrains Mono',monospace", color:g.color, lineHeight:1 }}>
                  {g.value > 100 ? (g.value/100).toFixed(2) : g.value + "%"}
                </div>
              </div>
              {/* Text */}
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                  <span style={{ fontSize:11 }}>{g.icon}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:C.tx }}>{g.label}</span>
                </div>
                <div style={{ fontSize:8, color:C.mt }}>{g.sub}</div>
              </div>
              {/* Reference */}
              <div style={{ flexShrink:0, fontSize:8, color:g.color,
                fontFamily:"'JetBrains Mono',monospace", fontWeight:600, textAlign:"right" }}>
                {g.ref}
              </div>
            </div>
          ))}
        </Card>
      </G>

      <G cols="1fr 1fr">
        <Card title={`Actividad (${chartDays} días)`} src="redemptions.created_at + auth.users.created_at">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top:4, right:4, bottom:0, left:-8 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.ac} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.ac} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.gn} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.gn} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...AX.grid} />
              <XAxis dataKey="d" {...AX.x} interval={Math.floor(chartDays/5)} />
              <YAxis {...AX.y} />
              <Tooltip content={<CT />} cursor={{ stroke:`${C.ac}30`, strokeWidth:1 }} />
              <Area dataKey="p" name="Participaciones" stroke={C.ac} strokeWidth={1.5} fill="url(#gP)" />
              <Area dataKey="r" name="Registros" stroke={C.gn} strokeWidth={1.5} fill="url(#gR)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Estado de experiencias">
          {visibleExp.slice(0,5).map((e,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0",
              borderBottom:`1px solid ${C.bd}` }}>
              <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0,
                background:e.status==="active"?C.gn:C.dm, boxShadow:e.status==="active"?`0 0 6px ${C.gn}`:"none" }} />
              <span style={{ fontSize:10, color:C.tx, flex:1 }}>{e.name}</span>
              <span style={{ fontSize:9, color:C.mt, fontFamily:"'JetBrains Mono',monospace" }}>
                {fmt(e.users)} usr
              </span>
              <div style={{ width:8, height:8, borderRadius:2,
                background:e.health>=70?C.gn:e.health>=50?C.or:C.rd, flexShrink:0 }}
                title={`Health: ${e.health}%`} />
            </div>
          ))}
        </Card>
      </G>
    </div>
  )
}

function PanelBusiness() {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14,
        background:`${C.demo}08`, border:`1px solid ${C.demo}30`, borderRadius:10, padding:"8px 14px" }}>
        <AlertCircle size={13} color={C.demo} />
        <span style={{ fontSize:10, color:C.demo }}>
          Panel de uso interno — datos del Master Plan 2026 (proyecciones, no conectados a Supabase)
        </span>
      </div>
      <G cols="repeat(auto-fit,minmax(150px,1fr))">
        <KPI label="RPU anual" value="$20/yr" sub="Meta: $50 USD (Ibotta ref)" color={C.or} demo i={0} />
        <KPI label="CAC actual" value="~$30" sub="Meta: <$5 via QR" color={C.rd} demo i={1} />
        <KPI label="LTV:CAC" value="<1x" sub="Meta: >5x" color={C.rd} demo i={2} />
        <KPI label="Concentración" value="70%" sub="MVS. Meta: <30%" color={C.rd} demo i={3} />
        <KPI label="Rev Recurrente" value="30%" sub="Meta: 60%" color={C.or} demo i={4} />
        <KPI label="Gross Margin" value="~55%" sub="Meta: 70%+" color={C.or} demo i={5} />
        <KPI label="Payback" value="~6mo" sub="Meta: <3mo" color={C.or} demo i={6} />
        <KPI label="Break-even" value="May 26" sub="proyectado" color={C.gn} demo i={7} />
      </G>
      <Card title="P&L 2026 — Proyectado (Master Plan)" demo style={{ marginBottom:10 }}
        src="Fuente: Master Plan interno — NO es data de Supabase">
        <div style={{ overflowX:"auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"85px repeat(12,1fr)", gap:2,
            fontSize:8, minWidth:620 }}>
            <div />
            {PNL_MONTHS.map(m=><div key={m} style={{ textAlign:"center", color:C.mt, fontWeight:700 }}>{m}</div>)}
            {[
              { label:"MVS", data:PNL.mvs, color:C.or },
              { label:"Mundial", data:PNL.mundial, color:C.cy },
              { label:"B2C", data:PNL.b2c, color:C.gn },
              { label:"IRRADIA", data:PNL.irradia, color:C.pr },
            ].map(row=>(
              <>
                <div style={{ color:C.dm }}>{row.label}</div>
                {row.data.map((v,i)=>(
                  <div key={i} style={{ textAlign:"center", fontFamily:"'JetBrains Mono',monospace",
                    color:v>0?row.color:C.dm }}>{v>0?`$${v}K`:"—"}</div>
                ))}
              </>
            ))}
            <div style={{ gridColumn:"1/-1", height:1, background:C.bd, margin:"3px 0" }} />
            <div style={{ fontWeight:700 }}>TOTAL</div>
            {pnlRev.map((v,i)=><div key={i} style={{ textAlign:"center",
              fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>${v}K</div>)}
            <div style={{ color:C.rd }}>OpEx</div>
            {PNL.opex.map((v,i)=><div key={i} style={{ textAlign:"center",
              fontFamily:"'JetBrains Mono',monospace", color:C.rd }}>-${v}K</div>)}
            <div style={{ gridColumn:"1/-1", height:1, background:C.bd, margin:"3px 0" }} />
            <div style={{ fontWeight:800 }}>Resultado</div>
            {pnlRes.map((v,i)=>(
              <div key={i} style={{ textAlign:"center", fontFamily:"'JetBrains Mono',monospace",
                fontWeight:700, color:v>=0?C.gn:C.rd }}>
                {v>=0?"+":""}{v}K
              </div>
            ))}
          </div>
        </div>
      </Card>
      <G cols="1fr 1fr">
        <Card title="Modelo Comercial" demo>
          <Row label="Experiencia" value="$80K/mo" sub="+$15/int >5K" />
          <Row label="Growth" value="$120K/mo" sub="+$10/int >10K" color={C.ac} />
          <Row label="Partner" value="$200K/mo" sub="+$8/int >20K" color={C.gn} />
          <div style={{ marginTop:8, paddingTop:6, borderTop:`1px solid ${C.bd}`, fontSize:9, color:C.dm, fontWeight:700 }}>IRRADIA B2B</div>
          <Row label="Hotel (45 emp)" value="$13.5K/mo" />
          <Row label="Corp (500 emp)" value="$150K/mo" color={C.pr} />
          <Row label="Enterprise (1K)" value="$300K/mo" color={C.em} />
        </Card>
        <Card title="Anti-Churn — 5 switching costs">
          {[
            ["Dashboard acumulativo", "Data histórica irrecuperable", C.ac],
            ["JALO Coins + Tienda", "3.2x engagement", C.em],
            ["Exclusividad temporal", "Competidor se queda el audience", C.rd],
            ["Base + Performance", "Riesgo compartido", C.gn],
            ["Costo de migración", "3–6 meses rebuild", C.or],
          ].map(([n,v,c],i)=>(
            <Row key={i} label={n} value={v} color={c} />
          ))}
        </Card>
      </G>
    </div>
  )
}

function PanelGrowth() {
  const { scale } = useContext(DateCtx)
  const cohorts = [
    { label:"S-8", w:[100,72,54,41,33,28,22,18] },
    { label:"S-6", w:[100,68,49,38,29,24,null,null] },
    { label:"S-4", w:[100,71,52,40,null,null,null,null] },
    { label:"S-2", w:[100,74,56,null,null,null,null,null] },
  ]
  const funnel = [
    { stage:"Registro",          value:ds(41700,scale),  conv:null   },
    { stage:"1ª participación",  value:ds(17640,scale),  conv:42.3   },
    { stage:"2+ misiones",       value:ds(11300,scale),  conv:64.1   },
    { stage:"Retención 7d",      value:ds(5980,scale),   conv:52.9   },
    { stage:"Referral activo",   value:ds(1820,scale),   conv:30.4   },
    { stage:"Reward claim",      value:ds(4200,scale),   conv:null   },
  ]
  const funnelMax = ds(41700, scale) || 1
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Crecimiento SoS" value="+8.2%" color={C.gn} spark={SPARK_7} delta="+8.2%" i={0} />
        <KPI label="Crecimiento MoM" value="+23%" color={C.gn} i={1} />
        <KPI label="Nuevos período" value={ds(287,scale)} delta="+14%" i={2} />
        <KPI label="Activación" value="42.3%" color={C.cy} delta="+3.1%" i={3} />
        <KPI label="Ret. D7" value="54%" i={4} demo />
        <KPI label="Ret. D30" value="33%" i={5} demo />
        <KPI label="Multi-marca" value={ds(1289,scale)} sub="usuarios 2+ marcas" color={C.pr} i={6} />
        <KPI label="Game→Conv" value="68%" sub="juego→otra misión" color={C.em} i={7} demo />
      </G>
      <G cols="1fr 1fr">
        <Card title="AARRR Funnel" src="redemptions + auth.users">
          {funnel.map((s,i) => (
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:10, color:C.dm }}>{s.stage}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:10 }}>
                  {fmt(s.value)}
                  {s.conv && <span style={{ color:C.or, fontSize:8, marginLeft:5 }}>↓{s.conv}%</span>}
                </span>
              </div>
              <PBar value={s.value} max={funnelMax} color={i<2?C.ac:i<4?C.gn:C.pr} />
            </div>
          ))}
        </Card>
        <Card title="Retención por cohorte mensual" src="auth.users.created_at + redemptions → % que regresa cada mes">
          <CohortHeatmap cohorts={COHORT_DATA} />
        </Card>
      </G>
      <Card title="Segmentos de actividad" src="redemptions GROUP BY last_activity_date">
        <G cols="repeat(auto-fit,minmax(140px,1fr))" mb={0}>
          {[
            { name:"Power 3+/sem", base:1876,  color:C.gn },
            { name:"Activo 1-2/sem", base:3210, color:C.ac },
            { name:"Dormant 7-30d", base:6540,  color:C.yl },
            { name:"Churn 30d+", base:4820,     color:C.rd },
          ].map((seg,i)=>{
            const v = ds(seg.base, scale)
            const total = ds(41700, scale) || 1
            return (
              <div key={i} style={{ padding:"10px 12px", background:C.surface, borderRadius:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:9, color:seg.color }}>{seg.name}</span>
                  <span style={{ fontSize:9, color:C.mt }}>{pct(v/total*100)}</span>
                </div>
                <div style={{ fontSize:16, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                  color:seg.color, marginBottom:5 }}>{fmt(v)}</div>
                <PBar value={v} max={total} color={seg.color} />
              </div>
            )
          })}
        </G>
      </Card>
    </div>
  )
}

function PanelBrands({ allBrands, onBrandClick }) {
  const { scale } = useContext(DateCtx)
  const totalUsers = allBrands.reduce((a,b)=>a+b.users,0)
  const totalPart  = allBrands.reduce((a,b)=>a+b.redemptions,0)
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(140px,1fr))">
        <KPI label="Marcas activas" value={allBrands.length} i={0} />
        <KPI label="Usuarios período" value={fmt(ds(totalUsers,scale))} delta="+15%" i={1} />
        <KPI label="Participaciones" value={fmt(ds(totalPart,scale))} i={2} />
        <KPI label="Avg retorno" value={pct(allBrands.reduce((a,b)=>a+b.returnRate,0)/allBrands.length)} color={C.cy} demo i={3} />
      </G>
      {allBrands.map((brand,i) => (
        <div key={brand.id} onClick={()=>onBrandClick(brand)}
          style={{ background:`linear-gradient(135deg,${C.card},${C.alt})`,
            border:`1px solid ${C.bd}`, borderRadius:12, padding:"14px 16px",
            marginBottom:8, cursor:"pointer", transition:"border-color .15s,transform .15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.bda;e.currentTarget.style.transform="translateX(3px)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bd;e.currentTarget.style.transform="translateX(0)"}}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:C.gn,
                boxShadow:`0 0 8px ${C.gn}` }} />
              <span style={{ fontWeight:700, fontSize:14, color:C.tx }}>{brand.name}</span>
              <Badge text={brand.topReward} color={C.pr} />
            </div>
            <span style={{ fontSize:11, color:C.mt }}>{brand.activeExp}/{brand.totalExp} exp activas</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, fontSize:10 }}>
            {[
              ["Usuarios",    fmt(ds(brand.users,scale)),       C.tx],
              ["Part.",       fmt(ds(brand.redemptions,scale)), C.tx],
              ["Nuevos",      fmt(ds(brand.newUsers,scale)),    C.cy],
              ["Retorno",     pct(brand.returnRate),            brand.returnRate>=25?C.gn:C.or],
              ["Part/usr",    brand.partPerUser.toFixed(2),     C.ac],
            ].map(([l,v,c],j)=>(
              <div key={j}>
                <div style={{ color:C.mt }}>{l}</div>
                <div style={{ fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:c }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:8 }}>
            <PBar value={brand.activeExp} max={brand.totalExp} color={C.ac} h={3} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PanelMiMarca({ brand }) {
  if (!brand) return <div style={{ color:C.mt, padding:40, textAlign:"center" }}>Sin marca asignada</div>
  const exps = DEMO_EXPERIENCES.filter(e => e.brandId === brand.id)
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,#0a1830,${C.alt})`,
        border:`1px solid ${C.bda}`, borderRadius:16, padding:"20px 24px", marginBottom:14 }}>
        <div style={{ fontSize:9, color:C.mt, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>
          Tu Marca
        </div>
        <div style={{ fontSize:28, fontWeight:900 }}>{brand.name}</div>
        <div style={{ fontSize:10, color:C.mt, marginTop:4 }}>
          {brand.activeExp} experiencias activas · {brand.totalExp} históricas · {brand.markers} markers
        </div>
      </div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Participaciones" value={fmt(brand.redemptions)} i={0} />
        <KPI label="Usuarios únicos" value={fmt(brand.users)} i={1} />
        <KPI label="Nuevos atraídos" value={fmt(brand.newUsers)} color={C.cy} i={2} />
        <KPI label="Tasa retorno" value={pct(brand.returnRate)} color={brand.returnRate>=25?C.gn:C.or} i={3} demo />
        <KPI label="Part/usuario" value={brand.partPerUser.toFixed(2)} color={C.ac} i={4} />
      </G>
      <Card title="Tus Experiencias" src="experiences JOIN brands JOIN redemptions">
        {exps.map((e,i)=>(
          <div key={i} style={{ background:C.surface, border:`1px solid ${C.bd}`,
            borderRadius:8, padding:"10px 14px", marginBottom:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontWeight:600, fontSize:12 }}>{e.name}</span>
              <div>
                <Badge text={`${e.health}%`} color={e.health>=70?C.gn:C.or} />
                <Badge text={e.daysLeft>0?`${e.daysLeft}d`:"Finalizada"} color={e.daysLeft>0?C.gn:C.dm} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, fontSize:9 }}>
              {[["Users",fmt(e.users),C.tx],["Comp.",fmt(e.completions),C.tx],
                ["Rate",pct(e.compRate),e.compRate>=60?C.gn:C.or],
                ["Claim",pct(e.rewardConv.pct),C.cy]].map(([l,v,c],j)=>(
                <div key={j}><span style={{ color:C.mt }}>{l}</span>
                  <div style={{ fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function PanelExperiencias({ experiences, onExpClick }) {
  const [filter, setFilter] = useState("all")
  const filtered = filter === "all" ? experiences : experiences.filter(e=>e.status===filter)
  const STATUS_COLOR = { active:C.gn, completed:C.mt, draft:C.ac }
  const STATUS_LABEL = { active:"Activa", completed:"Finalizada", draft:"Borrador" }
  return (
    <div>
      <div style={{ display:"flex", gap:4, marginBottom:14 }}>
        {["all","active","completed","draft"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:"5px 12px", borderRadius:6, border:"none", cursor:"pointer",
            background:filter===s?C.ac:C.bd, color:filter===s?"#fff":C.mt,
            fontSize:10, fontWeight:700, fontFamily:"inherit",
            transition:"background .15s",
          }}>
            {s==="all"?"Todas":STATUS_LABEL[s]}
            {" "}({s==="all"?experiences.length:experiences.filter(e=>e.status===s).length})
          </button>
        ))}
      </div>
      {filtered.map((e,i)=>(
        <div key={e.id} onClick={()=>onExpClick(e)}
          style={{ background:`linear-gradient(135deg,${C.card},${C.alt})`,
            border:`1px solid ${C.bd}`, borderRadius:12, padding:"14px 16px",
            marginBottom:8, cursor:"pointer", transition:"border-color .15s,transform .15s" }}
          onMouseEnter={el=>{el.currentTarget.style.borderColor=C.bda;el.currentTarget.style.transform="translateX(3px)"}}
          onMouseLeave={el=>{el.currentTarget.style.borderColor=C.bd;el.currentTarget.style.transform="translateX(0)"}}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                  background:STATUS_COLOR[e.status]||C.dm,
                  boxShadow:e.status==="active"?`0 0 8px ${C.gn}`:"none" }} />
                <span style={{ fontWeight:700, fontSize:13 }}>{e.name}</span>
                <Badge text={e.brand} color={C.ac} />
              </div>
              <div style={{ fontSize:9, color:C.mt, marginTop:3, marginLeft:15 }}>
                {e.start} → {e.end}
                {e.daysLeft>0&&<span style={{ color:C.gn, marginLeft:8 }}>{e.daysLeft}d restantes</span>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <Ring value={e.health} size={32} stroke={3} color={e.health>=70?C.gn:e.health>=50?C.or:C.rd} />
                <div>
                  <div style={{ fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{e.health}%</div>
                  <div style={{ fontSize:7, color:C.mt }}>health</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, fontSize:10 }}>
            {[
              ["Usuarios",fmt(e.users)],
              ["Completions",fmt(e.completions)],
              ["Tasa",pct(e.compRate)],
              ["Misiones",e.missions],
              ["Referidos",fmt(e.referrals)],
              ["Claim",pct(e.rewardConv.pct)],
            ].map(([l,v],j)=>(
              <div key={j}><span style={{ color:C.mt }}>{l}</span>
                <div style={{ fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:C.tx }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PanelMisiones({ experiences }) {
  const { scale } = useContext(DateCtx)
  const totalPending = OPS_QUEUES.slice(0,3).reduce((a,q)=>a+q.value,0)
  const totalCompletions = MISSION_COMPLETION.reduce((a,b)=>a+b.count,0)
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Tipos distintos" value="11" sub="por coupon_code prefix" color={C.ac} i={0} />
        <KPI label="Completions tot." value={fmt(ds(totalCompletions,scale))} i={1} />
        <KPI label="Pendientes rev." value={ds(totalPending,scale)} color={C.or} sub="check-in+compras+links" i={2} />
        <KPI label="Rate promedio" value={pct(MISSION_COMPLETION.reduce((a,b)=>a+b.rate,0)/MISSION_COMPLETION.length)} i={3} />
      </G>
      <Card title="Tasa de completion por tipo de misión"
        src="SPLIT_PART(coupon_code,':',1) GROUP BY mission_type">
        {MISSION_COMPLETION.map((m,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <span style={{ fontSize:10, color:C.dm, width:90, flexShrink:0 }}>{m.name}</span>
            <div style={{ flex:1 }}>
              <PBar value={m.rate} max={100} color={m.color} />
            </div>
            <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace",
              color:m.rate>=70?C.gn:m.rate>=50?C.or:C.rd, width:36, textAlign:"right" }}>
              {m.rate}%
            </span>
            <span style={{ fontSize:9, color:C.mt, width:48, textAlign:"right",
              fontFamily:"'JetBrains Mono',monospace" }}>{fmt(ds(m.count,scale))}</span>
          </div>
        ))}
      </Card>
      <G cols="1fr 1fr">
        <Card title="Top experiencias por completions"
          src="redemptions GROUP BY experience_id ORDER BY COUNT DESC">
          {DEMO_EXPERIENCES.sort((a,b)=>b.completions-a.completions).slice(0,5).map((e,i)=>(
            <div key={i} style={{ marginBottom:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:10, color:C.dm }}>{e.name}</span>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmt(e.completions)}</span>
              </div>
              <PBar value={e.completions} max={DEMO_EXPERIENCES[0].completions} color={COLORS_CYCLE[i%6]} />
            </div>
          ))}
        </Card>
        <Card title="Misiones con validación manual pendiente"
          src="mission_check_in_validations + mission_registered_purchases (status=0)">
          {OPS_QUEUES.slice(0,3).map((q,i)=>(
            <div key={i} style={{ background:C.surface, borderRadius:8, padding:"10px 12px", marginBottom:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:10, color:C.dm }}>{q.label}</span>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ fontSize:9, color:C.rd, fontFamily:"'JetBrains Mono',monospace" }}>
                    {ds(q.urgent,scale)} urgentes
                  </span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:20, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                  color:q.color }}>{ds(q.value,scale)}</span>
                <PBar value={ds(q.value,scale)} max={300} color={q.color} />
              </div>
            </div>
          ))}
        </Card>
      </G>
    </div>
  )
}

const COLORS_CYCLE = [C.ac, C.gn, C.pr, C.cy, C.or, C.em]

function PanelAudiencia() {
  const totalAgeUsers = AGE_DATA.reduce((a,r) => a+r.m+r.f+r.nd, 0)
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Usuarios totales" value={fmt(41700)} sub="auth.users" delta="+12%" i={0} />
        <KPI label="Con perfil completo" value="82.4%" sub="nombre+género+estado+CP" color={C.gn} i={1} />
        <KPI label="Email verificado" value="74.1%" sub="email_verified=true" color={C.ac} i={2} />
        <KPI label="Push activos" value={fmt(18400)} sub="push_subscriptions" color={C.cy} i={3} />
        <KPI label="Newsletter opt-in" value="68.3%" sub="newsletter=true" color={C.em} i={4} />
        <KPI label="Teléfono verificado" value="61.2%" sub="phone_verified=true" color={C.pr} i={5} />
      </G>
      <G cols="1fr 1fr">
        <Card title="Distribución por género" src="auth.users.raw_user_meta_data -> gender">
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <Donut size={110} thick={16}
              segs={[{v:46,c:C.ac},{v:48,c:C.pk},{v:6,c:C.dm}]}
              label="94%"
            />
            <div style={{ flex:1 }}>
              {[
                { label:"Femenino",  pct:48, n:"19,950", color:C.pk },
                { label:"Masculino", pct:46, n:"19,080", color:C.ac },
                { label:"N/D",       pct:6,  n:"2,490",  color:C.dm },
              ].map((g,i)=>(
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:9, height:9, borderRadius:2, background:g.color }} />
                      <span style={{ fontSize:10, color:C.dm }}>{g.label}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                      <span style={{ fontSize:13, fontWeight:800,
                        fontFamily:"'JetBrains Mono',monospace", color:g.color }}>{g.pct}%</span>
                      <span style={{ fontSize:8, color:C.mt }}>{g.n}</span>
                    </div>
                  </div>
                  <PBar value={g.pct} max={100} color={g.color} h={5} />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Distribución por estado" src="auth.users.raw_user_meta_data -> state">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={GEO_DATA} margin={{ top:4, right:4, bottom:0, left:-10 }}>
              <CartesianGrid {...AX.grid} />
              <XAxis dataKey="state" {...AX.x} />
              <YAxis {...AX.y} />
              <Tooltip content={<CT />} cursor={{ fill:`${C.ac}08` }} />
              <Bar dataKey="users" name="Usuarios" radius={[3,3,0,0]}>
                {GEO_DATA.map((_,i)=><Cell key={i} fill={i===0?C.ac:`${C.ac}${Math.max(20,80-i*12).toString(16)}`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </G>
      <Card title="Pirámide de edad (18+)" src="EXTRACT(year FROM AGE(raw_user_meta_data->birth_date)) + gender — auth.users">
        <AgePyramid data={AGE_DATA} maxW={340} />
        <div style={{ marginTop:12, padding:"8px 10px", background:`${C.ac}08`, borderRadius:6,
          border:`1px solid ${C.ac}20`, fontSize:9, color:C.dm }}>
          🎯 <strong style={{ color:C.ac }}>Target JALO 18-34:</strong>{" "}
          El segmento 18-34 es mayoría en la plataforma. Mujeres ligeramente superiores en 18-24. N/D bajando conforme mejora el onboarding de perfil.
        </div>
      </Card>
      <G cols="1fr 1fr">
        <Card title="Top zonas de check-in por CP" src="mission_check_in_validations JOIN markers → address (latitude, longitude, postal_code)">
          {CHECKIN_ZONES.map((z,i)=>(
            <div key={i} style={{ marginBottom:9 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <div>
                  <span style={{ fontSize:10, color:C.tx, fontWeight:600 }}>{z.zone}</span>
                  <span style={{ fontSize:8, color:C.mt, marginLeft:6, fontFamily:"'JetBrains Mono',monospace" }}>CP {z.cp}</span>
                </div>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:z.color, fontWeight:700 }}>
                  {fmt(z.checkins)}
                </span>
              </div>
              <PBar value={z.checkins} max={CHECKIN_ZONES[0].checkins} color={z.color} />
            </div>
          ))}
        </Card>
        <Card title="Campos de perfil completados" src="auth.users.raw_user_meta_data → % non-null por campo">
          {[
            { field:"Nombre",    pct:89 }, { field:"Teléfono",  pct:84 },
            { field:"Género",    pct:76 }, { field:"Nacimiento",pct:71 },
            { field:"Estado",    pct:68 }, { field:"Email",     pct:74 },
            { field:"C.P.",      pct:42 },
          ].map((f,i)=>(
            <div key={i} style={{ marginBottom:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:9, color:C.dm }}>{f.field}</span>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                  color:f.pct>=70?C.gn:f.pct>=50?C.or:C.rd }}>{f.pct}%</span>
              </div>
              <PBar value={f.pct} color={f.pct>=70?C.gn:f.pct>=50?C.or:C.rd} />
            </div>
          ))}
        </Card>
      </G>
    </div>
  )
}

function PanelRecompensas({ experiences }) {
  const { scale } = useContext(DateCtx)
  const BASE_CLAIMS = [
    { name:"Puntos",    claimed:22100, total:24400, type:"points",  color:C.yl },
    { name:"Cupones",   claimed:5600,  total:6800,  type:"coupons", color:C.or },
    { name:"Drops",     claimed:3400,  total:4200,  type:"drops",   color:C.gn },
    { name:"Rifas",     claimed:2650,  total:3200,  type:"raffles", color:C.pr },
    { name:"E. Evento", claimed:890,   total:1100,  type:"tickets", color:C.cy },
    { name:"Megas",     claimed:2100,  total:2400,  type:"megas",   color:C.em },
  ]
  const claimData = BASE_CLAIMS.map(r => ({
    ...r, claimed:ds(r.claimed,scale), total:ds(r.total,scale)
  }))
  const totalClaimed = claimData.reduce((a,b)=>a+b.claimed,0)
  const totalTotal   = claimData.reduce((a,b)=>a+b.total,0)
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Total rewards" value={fmt(totalTotal)} sub="elegibles" i={0} />
        <KPI label="Claim rate global" value={pct(totalTotal>0?totalClaimed/totalTotal*100:0)} color={C.gn} delta="+2.1%" i={1} />
        <KPI label="Puntos acumulados" value={fmt(ds(1580000,scale))} sub="points.points_count SUM" color={C.yl} i={2} />
        <KPI label="Rifas activas" value="3" sub="rewards WHERE type=raffles" color={C.pr} i={3} />
      </G>
      <Card title="Tasa de canje por tipo de recompensa"
        src="tickets+drops+raffles+coupons+points+phone_benefit_transactions">
        {claimData.map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <span style={{ fontSize:10, color:C.dm, width:72, flexShrink:0 }}>{r.name}</span>
            <div style={{ flex:1 }}>
              <PBar value={r.claimed} max={r.total||1} color={r.color} />
            </div>
            <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace",
              color:r.color, width:38, textAlign:"right" }}>
              {r.total>0?pct(r.claimed/r.total*100):"—"}
            </span>
            <span style={{ fontSize:9, color:C.mt, width:72, textAlign:"right",
              fontFamily:"'JetBrains Mono',monospace" }}>
              {fmt(r.claimed)}/{fmt(r.total)}
            </span>
          </div>
        ))}
      </Card>
      <G cols="1fr 1fr">
        <Card title="Rewards por experiencia" src="rewards JOIN experiences GROUP BY type_id">
          {experiences.filter(e=>e.status==="active").map((e,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${C.bd}10` }}>
              <span style={{ fontSize:10, color:C.dm }}>{e.name}</span>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <Badge text={e.rewardType} color={C.pr} />
                <span style={{ fontSize:9, color:C.mt, fontFamily:"'JetBrains Mono',monospace" }}>
                  {pct(e.rewardConv.pct)}
                </span>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Distribución de tipos de reward" src="rewards JOIN rewards_type">
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Donut segs={claimData.map(r=>({v:Math.max(r.total,1),c:r.color}))} size={80} thick={12}
              label={pct(totalTotal>0?totalClaimed/totalTotal*100:0)} />
            <div style={{ flex:1 }}>
              {claimData.map((r,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                  <div style={{ width:7, height:7, borderRadius:2, background:r.color, flexShrink:0 }} />
                  <span style={{ fontSize:9, color:C.dm, flex:1 }}>{r.name}</span>
                  <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:r.color, fontWeight:700 }}>
                    {r.total>0?pct(r.claimed/r.total*100):"—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </G>
    </div>
  )
}

function PanelJuegos() {
  const { scale } = useContext(DateCtx)
  const BASE_GAMES = [
    { name:"Snake",      sessions:3420, avgScore:8420,  avgDur:142, completionRate:71, color:C.gn },
    { name:"Pac-Man",    sessions:2890, avgScore:12300, avgDur:198, completionRate:68, color:C.yl },
    { name:"Breakout",   sessions:2340, avgScore:6800,  avgDur:115, completionRate:74, color:C.ac },
    { name:"Trivia Race",sessions:1890, avgScore:4200,  avgDur:88,  completionRate:82, color:C.pr },
  ]
  const GAME_DATA = BASE_GAMES.map(g => ({ ...g, sessions: ds(g.sessions, scale) }))
  const totalSessions = GAME_DATA.reduce((a,b)=>a+b.sessions,0)
  const peaks = Array.from({length:24},(_,h)=>({
    h:`${h}h`, s: h>=10&&h<=22 ? Math.round(60+Math.sin((h-10)*0.4)*40+Math.random()*20) : Math.round(5+Math.random()*10)
  }))
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Sesiones totales" value={fmt(totalSessions)} sub="mission_game_sessions" i={0} />
        <KPI label="Avg duración" value="2.4m" sub="completed_at-started_at" color={C.cy} i={1} />
        <KPI label="Game→Otra misión" value="68%" sub="conversión estimada" color={C.em} demo i={2} />
        <KPI label="Sesiones inválidas" value="3.2%" sub="is_valid=false" color={C.rd} i={3} />
      </G>
      <Card title="Performance por juego" src="mission_game_sessions GROUP BY game_type">
        {GAME_DATA.map((g,i)=>(
          <div key={i} style={{ background:C.surface, borderRadius:8, padding:"10px 14px", marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontWeight:700, fontSize:12 }}>{g.name}</span>
              <div style={{ display:"flex", gap:8, fontSize:10 }}>
                <span style={{ color:C.mt }}>sesiones</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:g.color }}>{fmt(g.sessions)}</span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, fontSize:9 }}>
              {[
                ["Avg score",fmt(g.avgScore)],
                ["Avg duración",`${g.avgDur}s`],
                ["Completion",pct(g.completionRate)],
              ].map(([l,v],j)=>(
                <div key={j}><span style={{ color:C.mt }}>{l}</span>
                  <div style={{ fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:g.color }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:6 }}>
              <PBar value={g.completionRate} max={100} color={g.color} />
            </div>
          </div>
        ))}
      </Card>
      <Card title="Picos de actividad por hora (promedio diario)" src="mission_game_sessions.started_at GROUP BY HOUR">
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={peaks} margin={{ top:4, right:4, bottom:0, left:-10 }}>
            <CartesianGrid {...AX.grid} />
            <XAxis dataKey="h" {...AX.x} interval={3} />
            <YAxis {...AX.y} />
            <Tooltip content={<CT />} cursor={{ fill:`${C.pr}08` }} />
            <Bar dataKey="s" name="Sesiones" fill={C.pr} radius={[2,2,0,0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Score histograms per game */}
      <Card title="Distribución de scores — curva de habilidad por juego"
        src="mission_game_sessions.score WHERE is_valid=true GROUP BY score_bucket, game_type">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {GAME_DATA.map((g,i)=>(
            <div key={i} style={{ background:C.surface, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:700, color:g.color }}>{g.name}</span>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:9, color:C.mt }}>P90 score</div>
                  <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                    fontWeight:700, color:g.color }}>
                    {g.name==="Pac-Man"?"14,800":g.name==="Snake"?"9,200":g.name==="Breakout"?"7,900":"4,800"}
                  </div>
                </div>
              </div>
              <ScoreHistogram
                buckets={(SCORE_DIST[g.name]||[]).map(b=>({ ...b, n:ds(b.n,scale) }))}
                color={g.color}
                gameLabel={`avg ${fmt(g.avgScore)} · max ${fmt(g.avgScore*1.8|0)}`}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, padding:"8px 10px", background:`${C.ac}08`,
          borderRadius:6, fontSize:9, color:C.dm }}>
          💡 <strong style={{ color:C.ac }}>Long tail saludable:</strong> La campana tiene cola derecha — los power gamers que superan el P90 son los más propensos a convertirse en Competidores y repetir sesiones.
        </div>
      </Card>

      {/* Attempts improvement curve */}
      <Card title="Curva de aprendizaje — score mejora con intentos"
        src="mission_game_sessions GROUP BY instance_number → AVG(score) WHERE is_valid=true">
        <ResponsiveContainer width="100%" height={130}>
          <LineChart margin={{ top:4, right:4, bottom:0, left:-10 }}
            data={[{n:"1er intento"},{n:"2do"},{n:"3er"},{n:"4to"},{n:"5to"}].map((p,i)=>({
              ...p,
              Snake:     Math.round(6200*(1+i*0.18+Math.random()*0.04)),
              PacMan:    Math.round(9100*(1+i*0.14+Math.random()*0.04)),
              Breakout:  Math.round(5400*(1+i*0.21+Math.random()*0.04)),
              TriRace:   Math.round(3200*(1+i*0.09+Math.random()*0.04)),
            }))}>
            <CartesianGrid {...AX.grid} />
            <XAxis dataKey="n" {...AX.x} />
            <YAxis {...AX.y} tickFormatter={v=>fmt(v)} />
            <Tooltip content={<CT />} />
            {GAME_DATA.map(g=>(
              <Line key={g.name} dataKey={g.name.replace(" ","")} name={g.name}
                stroke={g.color} strokeWidth={1.5} dot={{ r:3, fill:g.color }}
                type="monotone" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function PanelOps() {
  const { scale } = useContext(DateCtx)
  const queues = OPS_QUEUES.map(q => ({
    ...q,
    value: ds(q.value, scale),
    urgent: ds(q.urgent, scale),
  }))
  const totalPending = queues.reduce((a,q)=>a+q.value,0)
  const totalUrgent  = queues.reduce((a,q)=>a+q.urgent,0)
  const ALERTS = [
    { sev:"high",   msg:"3 compras pendientes >72h sin revisión",    action:"Aprobar/rechazar", time:"hace 6h" },
    { sev:"high",   msg:"Check-in rechazado subió a 23% (prom: 8%)", action:"Revisar criterios", time:"hace 1d" },
    { sev:"medium", msg:"Nutrisa Wellness: 85% misiones completadas", action:"Preparar nueva exp.", time:"hace 2d" },
    { sev:"low",    msg:"Sushi Itto Fan Club vence en 7 días",        action:"Activar siguiente", time:"hace 3d" },
  ]
  const sevColor = { high:C.rd, medium:C.or, low:C.yl }
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Total pendientes" value={totalPending} color={C.or} sub="requieren acción" i={0} />
        <KPI label="Urgentes >48h" value={totalUrgent} color={C.rd} sub="sin revisión" i={1} />
        <KPI label="SLA promedio" value="18.4h" sub="avg tiempo a validación" color={C.cy} i={2} />
        <KPI label="Push activos" value={fmt(18400)} sub="push_subscriptions" color={C.ac} i={3} />
        <KPI label="SMS activos" value={fmt(34200)} sub="phone_verified=true" color={C.gn} i={4} />
        <KPI label="Dentro de 24h" value="72%" sub="validaciones a tiempo" color={C.gn} i={5} />
      </G>
      <Card title="Colas de validación manual" src="mission_check_in_validations + mission_registered_purchases + mission_provide_link + mission_content_ratings (status=0)">
        {queues.map((q,i)=>(
          <div key={i} style={{ background:C.surface, borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div>
                <span style={{ fontSize:11, fontWeight:600, color:C.tx }}>{q.label}</span>
                <div style={{ fontSize:8, color:C.mt, fontFamily:"'JetBrains Mono',monospace",
                  marginTop:2 }}>{q.table}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:22, fontWeight:900, fontFamily:"'JetBrains Mono',monospace",
                  color:q.color }}>{q.value}</div>
                {q.urgent>0&&(
                  <div style={{ fontSize:9, color:C.rd, display:"flex", alignItems:"center",
                    gap:3, justifyContent:"flex-end" }}>
                    <AlertCircle size={9} />
                    {q.urgent} urgentes
                  </div>
                )}
              </div>
            </div>
            <PBar value={q.value} max={Math.max(...queues.map(q=>q.value),1)} color={q.color} />
          </div>
        ))}
      </Card>
      <G cols="1fr 1fr">
        <Card title="Alertas del sistema" src="derivado de redemptions + validations + experiences (reglas automáticas)">
          {ALERTS.map((a,i)=>(
            <div key={i} style={{ background:C.surface, borderRadius:8, padding:"9px 12px",
              marginBottom:6, borderLeft:`3px solid ${sevColor[a.sev]}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:10, fontWeight:600, color:C.tx }}>{a.msg}</span>
                <span style={{ fontSize:8, color:C.mt, flexShrink:0, marginLeft:8 }}>{a.time}</span>
              </div>
              <span style={{ fontSize:9, fontWeight:700, color:sevColor[a.sev] }}>{a.action}</span>
            </div>
          ))}
        </Card>
        <Card title="Cobertura de notificaciones" src="push_subscriptions + auth.users (phone_verified)">
          {[
            { label:"Push activos", value:18400, total:41700, color:C.cy },
            { label:"SMS disponibles", value:34200, total:41700, color:C.gn },
            { label:"Email opt-in", value:28500, total:41700, color:C.ac },
          ].map((n,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:10, color:C.dm }}>{n.label}</span>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:C.tx }}>
                  {fmt(n.value)} <span style={{ color:n.color }}>({pct(n.value/n.total*100)})</span>
                </span>
              </div>
              <PBar value={n.value} max={n.total} color={n.color} />
            </div>
          ))}
        </Card>
      </G>
      <G cols="1fr 1fr">
        <Card title="Recurrencia de clientes" src="brands JOIN experiences GROUP BY brand → MIN/MAX(starts_at) + COUNT(id)">
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
              <thead>
                <tr>{["Cliente","Exps","Primera","Última","Días prom.","Status"].map(h=>(
                  <th key={h} style={{ padding:"5px 8px", color:C.mt, fontWeight:600,
                    textAlign:h==="Cliente"?"left":"center", borderBottom:`1px solid ${C.bd}`, fontSize:9 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {CLIENT_RECURRENCE.map((c,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${C.bd}20` }}>
                    <td style={{ padding:"6px 8px", fontWeight:700, color:C.tx }}>{c.name}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", color:C.ac, fontWeight:700 }}>{c.exps}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center", color:C.mt, fontSize:9 }}>{c.primera}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center", color:C.mt, fontSize:9 }}>{c.ultima}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", color:C.dm }}>{c.avgDays}d</td>
                    <td style={{ padding:"6px 8px", textAlign:"center" }}>
                      <Badge text={c.status==="active"?"Activo":"Nuevo"} color={c.status==="active"?C.gn:C.cy} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Fraude — AI Ticket Validation" src="ticket_ai_validations + user_fraud_labels">
          {[
            { label:"Tickets validados OK",    value:"89.4%",             color:C.gn },
            { label:"Tickets rechazados IA",   value:"7.2%",              color:C.or },
            { label:"Revisión manual req.",    value:"3.4%",              color:C.rd },
            { label:"Hashes duplicados",       value:ds(142,scale),       color:C.rd },
            { label:"Potencial falsificador",  value:ds(38,scale),        color:C.or },
            { label:"Falsificador confirmado", value:ds(12,scale),        color:C.rd },
          ].map((f,i)=>(
            <Row key={i} label={f.label} value={String(f.value)} color={f.color} />
          ))}
        </Card>
      </G>
    </div>
  )
}

function PanelViral() {
  const { scale } = useContext(DateCtx)
  const totalRefs    = ds(REFERRAL_GEO.reduce((a,b)=>a+b.referidos,0), scale)
  const totalReclut  = ds(REFERRAL_GEO.reduce((a,b)=>a+b.referrers,0), scale)
  const kFactor      = (totalRefs / Math.max(totalReclut,1)).toFixed(2)
  const allAmbass    = DEMO_EXPERIENCES.flatMap(e =>
    (e.ambassadors||[]).map(a => ({ ...a, exp:e.name }))
  ).sort((a,b) => b.refs - a.refs).slice(0,6)
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="K-Factor" value={kFactor} sub="referidos / reclutas" color={Number(kFactor)>=1?C.gn:C.or} delta={Number(kFactor)>=1?"+0.12":undefined} i={0} />
        <KPI label="Reclutas (referrers)" value={fmt(totalReclut)} sub="referred_by_user_id DISTINCT" color={C.em} i={1} />
        <KPI label="Referidos" value={fmt(totalRefs)} sub="nuevos usuarios via ref" color={C.cy} i={2} />
        <KPI label="Calidad ref." value="67%" sub="referidos que participan" color={C.ac} i={3} />
        <KPI label="Cadenas ref→ref" value={ds(87,scale)} sub="referral chains" color={C.pr} i={4} />
        <KPI label="Tiempo 1er ref" value="4.8d" sub="registro → primera recluta" color={C.dm} i={5} />
      </G>
      <G cols="1fr 1fr">
        <Card title="Top embajadores 👑" src="referrals GROUP BY referred_by_user_id ORDER BY COUNT DESC">
          {allAmbass.map((a,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"6px 0", borderBottom:`1px solid ${C.bd}10` }}>
              <div>
                <span style={{ fontSize:11, color:i===0?C.yl:C.tx }}>{i===0?"👑 ":i===1?"🥈 ":i===2?"🥉 ":""}{a.name}</span>
                <span style={{ fontSize:8, color:C.mt, marginLeft:6 }}>{a.exp}</span>
              </div>
              <span style={{ fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:C.em }}>
                {a.refs} ref
              </span>
            </div>
          ))}
        </Card>
        <Card title="Referidos por experiencia" src="referrals GROUP BY experience_id ORDER BY COUNT">
          {DEMO_EXPERIENCES.filter(e=>e.referrals>0).map((e,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:10, color:C.dm }}>{e.name}</span>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
                  {fmt(ds(e.referrals,scale))}
                </span>
              </div>
              <PBar value={e.referrals} max={DEMO_EXPERIENCES[0].referrals||1} color={COLORS_CYCLE[i%6]} />
            </div>
          ))}
        </Card>
      </G>
      {/* Referral network visualization */}
      <Card title="Red de referidos — visualización de cadenas activas"
        src="referrals JOIN auth.users → referred_by_user_id (nivel 1+2) — nodos: embajadores y referidos">
        <G cols="1fr 1fr" gap={14} mb={0}>
          <div>
            <ReferralNetwork nodes={REFERRAL_NODES} links={REFERRAL_LINKS} w={420} h={295} />
            <div style={{ fontSize:8, color:C.mt, textAlign:"center", marginTop:4 }}>
              Hover sobre un nodo para resaltar sus conexiones
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, color:C.dm, fontWeight:700, marginBottom:10 }}>Leyenda de la red</div>
            {[
              { color:C.em, r:18, label:"Embajador nivel 1 (≥10 refs)", n:4 },
              { color:C.cy, r:7,  label:"Referido nivel 1 (activo)", n:10 },
              { color:`${C.ac}cc`, r:5, label:"Referido nivel 2 (viral)", n:8 },
            ].map((l,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <svg width={l.r*2+4} height={l.r*2+4} style={{ flexShrink:0 }}>
                  <circle cx={l.r+2} cy={l.r+2} r={l.r} fill={l.color} stroke={l.color} strokeWidth={1.5} />
                </svg>
                <div>
                  <div style={{ fontSize:9, color:C.tx }}>{l.label}</div>
                  <div style={{ fontSize:8, color:C.mt }}>{l.n} nodos en la red</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:14, padding:"10px 12px", background:`${C.em}08`,
              border:`1px solid ${C.em}25`, borderRadius:8 }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.em, marginBottom:4 }}>Red observada</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  ["Clusters activos", "14"],
                  ["Nodos nivel 2",    fmt(ds(87,scale))],
                  ["Cadenas 3+ saltos",fmt(ds(23,scale))],
                  ["K-Factor real",    "1.94"],
                ].map(([l,v],i)=>(
                  <div key={i}>
                    <div style={{ fontSize:8, color:C.mt }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                      color:C.em }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </G>
      </Card>

      <Card title="Expansión geográfica — origen y destino de referidos" src="referrals JOIN auth.users ON user_id/referred_by_user_id → raw_user_meta_data->state">
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
            <thead>
              <tr>{["Estado","Reclutas","Referidos","K local","% mismo estado"].map(h=>(
                <th key={h} style={{ padding:"6px 8px", color:C.mt, fontWeight:600, textAlign:h==="Estado"?"left":"right",
                  borderBottom:`1px solid ${C.bd}`, fontSize:9, fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {REFERRAL_GEO.map((r,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${C.bd}20` }}>
                  <td style={{ padding:"7px 8px", fontWeight:600, color:C.tx }}>{r.state}</td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace", color:C.dm }}>{fmt(ds(r.referrers,scale))}</td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace", color:C.ac, fontWeight:700 }}>{fmt(ds(r.referidos,scale))}</td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace", color:C.gn }}>{r.coef}x</td>
                  <td style={{ padding:"7px 8px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                      <div style={{ width:60 }}><PBar value={r.localPct} color={r.localPct>80?C.gn:C.yl} /></div>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", color:C.dm, width:34, textAlign:"right" }}>{r.localPct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function PanelRetail() {
  const { scale } = useContext(DateCtx)
  const totalPurchases = ds(8700, scale)
  const pending = ds(266, scale)
  const approved = ds(6200, scale)
  const TOP_STORES = [
    { name:"OXXO (red)", ops:ds(1240,scale), color:C.gn },
    { name:"Walmart Express", ops:ds(890,scale), color:C.ac },
    { name:"7-Eleven", ops:ds(720,scale), color:C.cy },
    { name:"Soriana Express", ops:ds(510,scale), color:C.pr },
    { name:"Bodega Aurrera", ops:ds(420,scale), color:C.em },
  ]
  const TOP_PRODUCTS = [
    { name:"Gansito Marinela", count:ds(2340,scale) },
    { name:"Lipton (botella)", count:ds(1890,scale) },
    { name:"Pan Bimbo 680g", count:ds(1540,scale) },
    { name:"Tío Rico (Nutrisa)", count:ds(980,scale) },
    { name:"Recarga Telcel $50", count:ds(820,scale) },
  ]
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Compras registradas" value={fmt(totalPurchases)} sub="mission_registered_purchases" delta="+18%" i={0} />
        <KPI label="Aprobadas" value={fmt(approved)} sub="status=3" color={C.gn} i={1} />
        <KPI label="Tasa aprobación" value={pct(totalPurchases>0?approved/totalPurchases*100:0)} color={C.gn} i={2} />
        <KPI label="Pendientes rev." value={pending} color={C.or} sub="status=0" i={3} />
        <KPI label="Compradores únicos" value={fmt(ds(4800,scale))} sub="DISTINCT user_id" color={C.cy} i={4} />
        <KPI label="Productos x ticket" value="2.4" sub="AVG(product_list size)" color={C.ac} i={5} />
      </G>
      <G cols="1fr 1fr">
        <Card title="Top tiendas registradas" src="mission_registered_purchases.store GROUP BY COUNT(*)">
          {TOP_STORES.map((s,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:10, color:C.dm }}>{s.name}</span>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmt(s.ops)}</span>
              </div>
              <PBar value={s.ops} max={TOP_STORES[0].ops||1} color={s.color} />
            </div>
          ))}
        </Card>
        <Card title="Top productos en tickets" src="mission_registered_purchases.product_list (JSON array) → UNNEST">
          {TOP_PRODUCTS.map((p,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:10, color:C.dm }}>{p.name}</span>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmt(p.count)}</span>
              </div>
              <PBar value={p.count} max={TOP_PRODUCTS[0].count||1} color={COLORS_CYCLE[i%6]} />
            </div>
          ))}
        </Card>
      </G>
      <Card title="Tendencia 14 días — registros de compra" src="mission_registered_purchases GROUP BY DATE(created_at)">
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={Array.from({length:14},(_,i)=>({ d:String(14-i), c:ds(Math.round(400+Math.sin(i*.5)*120+Math.random()*80),scale) }))}
            margin={{ top:4, right:4, bottom:0, left:-10 }}>
            <CartesianGrid {...AX.grid} />
            <XAxis dataKey="d" {...AX.x} />
            <YAxis {...AX.y} />
            <Tooltip content={<CT />} cursor={{ fill:`${C.gn}08` }} />
            <Bar dataKey="c" name="Compras" fill={C.gn} radius={[2,2,0,0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Retail heatmap by hour and day */}
      <G cols="1fr 1fr" mb={12}>
        <Card title="Categorías de tienda" src="mission_registered_purchases.store → GROUP BY category">
          {[
            { cat:"Conveniencia", pct:31, n:ds(2700,scale), color:C.ac, icon:"🏪" },
            { cat:"Supermercado", pct:24, n:ds(2088,scale), color:C.gn, icon:"🛒" },
            { cat:"Restaurante",  pct:22, n:ds(1914,scale), color:C.or, icon:"🍽" },
            { cat:"Farmacia",     pct:11, n:ds(957,scale),  color:C.pr, icon:"💊" },
            { cat:"Otros",        pct:12, n:ds(1044,scale), color:C.dm, icon:"📦" },
          ].map((c,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:8 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{c.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <span style={{ fontSize:10, color:C.dm }}>{c.cat}</span>
                  <div>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10,
                      fontWeight:700, color:c.color }}>{c.pct}%</span>
                    <span style={{ fontSize:8, color:C.mt, marginLeft:5 }}>{fmt(c.n)}</span>
                  </div>
                </div>
                <PBar value={c.pct} color={c.color} />
              </div>
            </div>
          ))}
        </Card>
        <Card title="Heatmap compras — hora × día" src="mission_registered_purchases → EXTRACT(dow,hour)">
          <div style={{ display:"flex", gap:2, fontSize:8 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:1, paddingTop:16, marginRight:2 }}>
              {Array.from({length:24},(_,h)=>(
                <div key={h} style={{ height:10, lineHeight:"10px", textAlign:"right",
                  color:C.mt, fontSize:7, fontFamily:"'JetBrains Mono',monospace" }}>
                  {h%4===0?`${h}h`:""}
                </div>
              ))}
            </div>
            {["L","M","X","J","V","S","D"].map((day,di)=>(
              <div key={day} style={{ display:"flex", flexDirection:"column", gap:1, alignItems:"center", flex:1 }}>
                <div style={{ height:14, lineHeight:"14px", color:C.dm, fontWeight:600,
                  fontSize:9, textAlign:"center" }}>{day}</div>
                {Array.from({length:24},(_,h)=>{
                  const isWknd=di>=5, isLunch=(h>=12&&h<=14), isEvening=(h>=17&&h<=21)
                  const base=isLunch?0.8:isEvening?0.72:h>=9&&h<=22?0.45:0.05
                  const v=Math.min(1,Math.max(0,base*(isWknd?1.3:1)+(Math.random()*0.06-0.03)))
                  const bg=v>0.7?C.gn:v>0.45?C.cy:v>0.2?`${C.ac}80`:C.surface
                  return (
                    <div key={h} style={{ height:10, borderRadius:1.5, background:bg,
                      width:"100%", opacity:0.3+v*0.7 }}
                      title={`${day} ${h}h`} />
                  )
                })}
              </div>
            ))}
          </div>
          <div style={{ fontSize:7, color:C.mt, marginTop:6 }}>📍 Pico: Sáb 12-14h · Vie 18-20h</div>
        </Card>
      </G>
    </div>
  )
}

function PanelDataIntel() {
  const totalSurveyResp = SURVEY_RESULTS.reduce((a,b)=>a+b.responses,0)
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Respuestas encuestas" value={fmt(totalSurveyResp)} sub="mission_survey_answers total" color={C.pr} i={0} />
        <KPI label="Preguntas activas" value="87" sub="30 abiertas · 57 cerradas" i={1} />
        <KPI label="Precisión trivia" value="72%" sub="respuestas correctas" color={C.gn} i={2} />
        <KPI label="Datos zero-party" value={fmt(87430)} sub="survey+trivia completions" color={C.cy} i={3} />
        <KPI label="Perfiles enriquecidos" value={fmt(9234)} sub="con ≥5 atributos" color={C.em} delta="+9%" i={4} />
        <KPI label="Completitud perfil" value="62%" sub="nombre+género+estado+CP" color={C.ac} i={5} />
      </G>
      <Card title="Resultados de encuestas (inline)" src="mission_survey_questions JOIN mission_survey_answers GROUP BY question_id, user_answer">
        {SURVEY_RESULTS.map((q,qi)=>(
          <div key={qi} style={{ marginBottom:18, paddingBottom:14,
            borderBottom:qi<SURVEY_RESULTS.length-1?`1px solid ${C.bd}20`:"none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div style={{ flex:1, marginRight:12 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.tx, lineHeight:1.4 }}>{q.question}</div>
                <div style={{ fontSize:9, color:C.mt, marginTop:2 }}>{q.brand} · {fmt(q.responses)} respuestas</div>
              </div>
              {q.nps && (
                <div style={{ background:C.surface, borderRadius:8, padding:"6px 10px", textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontSize:16, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                    color:q.npsScore>=40?C.gn:q.npsScore>=0?C.yl:C.rd }}>{q.npsScore}</div>
                  <div style={{ fontSize:7, color:C.mt }}>NPS</div>
                </div>
              )}
            </div>
            {q.nps && (
              <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:1, marginBottom:8 }}>
                <div style={{ flex:q.promoters, background:C.gn, borderRadius:"4px 0 0 4px" }} />
                <div style={{ flex:q.passives,   background:C.yl }} />
                <div style={{ flex:q.detractors, background:C.rd, borderRadius:"0 4px 4px 0" }} />
              </div>
            )}
            {q.options.map((opt,oi)=>(
              <div key={oi} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontSize:9, color:C.dm, width:120, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" }}>{opt.label}</span>
                <div style={{ flex:1 }}><PBar value={opt.pct} color={COLORS_CYCLE[oi%6]} /></div>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                  color:COLORS_CYCLE[oi%6], width:36, textAlign:"right" }}>{opt.pct}%</span>
              </div>
            ))}
          </div>
        ))}
      </Card>
      <G cols="1fr 1fr">
        <Card title="Trivia — precisión por grupo de edad" src="redemptions (TRIVIA: prefix) JOIN auth.users → birth_date">
          {[{age:"18-24",pct:68},{age:"25-34",pct:74},{age:"35-44",pct:71},{age:"45-54",pct:69}].map((t,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:10, color:C.dm }}>{t.age}</span>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                  color:t.pct>=70?C.gn:C.or }}>{t.pct}%</span>
              </div>
              <PBar value={t.pct} color={t.pct>=70?C.gn:C.or} />
            </div>
          ))}
          <div style={{ fontSize:9, color:C.mt, marginTop:10, borderTop:`1px solid ${C.bd}20`, paddingTop:8 }}>
            Más difícil: <span style={{ color:C.rd }}>Capital de Tailandia (34%)</span> ·
            Más fácil: <span style={{ color:C.gn }}>Color Coca-Cola (97%)</span>
          </div>
          {/* Trivia difficulty scatter */}
          <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${C.bd}20` }}>
            <div style={{ fontSize:9, color:C.dm, fontWeight:700, marginBottom:8 }}>Preguntas por dificultad</div>
            <div style={{ position:"relative", height:80 }}>
              {[
                {q:"Color Coca-Cola",pct:97,x:5},{q:"Logo de Nutrisa",pct:89,x:15},{q:"Año fundación BIMBO",pct:72,x:30},
                {q:"Ingrediente Gansito",pct:61,x:45},{q:"Calorías Big Mac",pct:48,x:58},{q:"Vitaminas Lipton",pct:41,x:68},
                {q:"País origen sushi",pct:38,x:77},{q:"Capital Tailandia",pct:34,x:88},
              ].map((p,i)=>(
                <div key={i} title={`${p.q}: ${p.pct}% acierto`}
                  style={{ position:"absolute", left:`${p.x}%`, bottom:`${p.pct-10}%`,
                    width:8, height:8, borderRadius:"50%",
                    background:p.pct>=70?C.gn:p.pct>=50?C.yl:C.rd,
                    cursor:"default", transition:"transform .15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(2)";e.currentTarget.title=p.q}}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"} />
              ))}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:`${C.bd}60` }} />
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:1, background:`${C.bd}60` }} />
              <div style={{ position:"absolute", bottom:-16, left:"33%", fontSize:7, color:C.mt }}>← difícil</div>
              <div style={{ position:"absolute", bottom:-16, right:"5%", fontSize:7, color:C.mt }}>fácil →</div>
            </div>
          </div>
        </Card>
        <Card title="Preferencia de misión por edad" src="redemptions JOIN auth.users → birth_date + SPLIT_PART(coupon_code,':',1)">
          {MISSION_BY_AGE.map((m,i)=>(
            <div key={i} style={{ padding:"8px 0", borderBottom:`1px solid ${C.bd}20` }}>
              <div style={{ fontSize:9, color:C.mt, fontWeight:700, marginBottom:5 }}>{m.age}</div>
              <div style={{ display:"flex", gap:6, marginBottom:4 }}>
                <div style={{ flex:m.topPct, background:`${C.ac}30`, borderRadius:4, padding:"3px 8px",
                  border:`1px solid ${C.ac}44`, display:"flex", alignItems:"center" }}>
                  <span style={{ fontSize:9, color:C.ac, fontWeight:600 }}>{m.top}</span>
                </div>
                <span style={{ fontSize:9, color:C.ac, fontFamily:"'JetBrains Mono',monospace", alignSelf:"center" }}>{m.topPct}%</span>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <div style={{ flex:m.secondPct, background:`${C.pr}20`, borderRadius:4, padding:"3px 8px",
                  border:`1px solid ${C.pr}33`, display:"flex", alignItems:"center" }}>
                  <span style={{ fontSize:9, color:C.pr }}>{m.second}</span>
                </div>
                <span style={{ fontSize:9, color:C.mt, fontFamily:"'JetBrains Mono',monospace", alignSelf:"center" }}>{m.secondPct}%</span>
              </div>
            </div>
          ))}
        </Card>
      </G>

      {/* Tag cloud — words from open survey answers */}
      <Card title="☁️ Nube de palabras — respuestas abiertas de encuesta"
        src="mission_survey_answers WHERE open_answer=true → NLP tokenization → word frequency">
        <TagCloud tags={SURVEY_TAGS} />
        <div style={{ marginTop:10, fontSize:8, color:C.mt, fontStyle:"italic" }}>
          Palabras más mencionadas en respuestas abiertas. Tamaño = frecuencia. Color = categoría temática.
          Requiere NLP (ej: Claude API o pg_trgm) sobre mission_survey_answers.user_answer WHERE open_answer=true.
        </div>
      </Card>
    </div>
  )
}

function PanelTelecom() {
  const { scale } = useContext(DateCtx)
  const scaledCh = TELECOM_CH.map(t => ({
    ...t, sends:ds(t.sends,scale), conv:ds(t.conv,scale), totalCost:ds(t.totalCost,scale)
  }))
  const totalCost = scaledCh.reduce((a,b)=>a+b.totalCost,0)
  const smsCh = scaledCh[0]
  const pushCh = scaledCh[1]
  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Transacciones" value={fmt(ds(1876,scale))} sub="phone_benefit_transactions" delta="+6%" i={0} />
        <KPI label="Aceptadas" value={fmt(ds(1654,scale))} color={C.gn} sub="status=accepted" i={1} />
        <KPI label="Pendientes" value={ds(87,scale)} color={C.yl} sub="status=pending" i={2} />
        <KPI label="Fallidas" value={ds(135,scale)} color={C.rd} sub="status=failed" i={3} />
        <KPI label="Costo total canales" value={`$${fmt(totalCost)}`} color={C.or} sub="SMS+Push+Email" i={4} />
        <KPI label="SMS % del costo" value={pct(totalCost>0?smsCh.totalCost/totalCost*100:0)} color={C.rd} sub="el canal más caro" i={5} />
      </G>
      <Card title="Comparativa de canales de notificación" src="phone_benefit_transactions + push_subscriptions + auth.users (newsletter)">
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
            <thead>
              <tr>{["Canal","Envíos","Conversiones","Conv %","Costo/envío","Costo total"].map(h=>(
                <th key={h} style={{ padding:"6px 10px", color:C.mt, fontWeight:600,
                  textAlign:h==="Canal"?"left":"right", borderBottom:`1px solid ${C.bd}`,
                  fontSize:9, fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {scaledCh.map((t,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${C.bd}20` }}>
                  <td style={{ padding:"8px 10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:t.color }} />
                      <span style={{ fontWeight:700, color:C.tx }}>{t.ch}</span>
                    </div>
                  </td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace", color:C.dm }}>{fmt(t.sends)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace", color:t.color, fontWeight:700 }}>{fmt(t.conv)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace",
                    color:t.convRate>=30?C.gn:t.convRate>=15?C.yl:C.or }}>{t.convRate}%</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace",
                    color:i===0?C.rd:C.gn, fontWeight:700 }}>${t.costPerSend}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace",
                    color:i===0?C.rd:C.gn }}>${fmt(t.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <G cols="1fr 1fr">
        <Card title="Distribución visual del costo operativo" src="phone_benefit_transactions.price + push_subscriptions (cost≈0) + sendy costs">
          {/* Cost flow bars */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:9, color:C.mt, marginBottom:6 }}>
              Total período: <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:C.tx }}>${fmt(totalCost)}</span>
            </div>
            {scaledCh.map((ch,i)=>{
              const pctCost=totalCost>0?ch.totalCost/totalCost*100:0
              return (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:ch.color }} />
                      <span style={{ fontSize:10, fontWeight:600 }}>{ch.ch}</span>
                      <span style={{ fontSize:8, color:C.mt }}>{ch.sends>=1000?fmt(ch.sends)+" envíos":""}</span>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:800, fontSize:11,
                        color:i===0?C.rd:C.gn }}>${fmt(ch.totalCost)}</span>
                      <span style={{ fontSize:8, color:C.mt, marginLeft:5 }}>{pct(pctCost)}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", height:20, borderRadius:4, overflow:"hidden",
                    background:C.surface }}>
                    <div style={{ width:`${pctCost}%`, background:i===0?C.rd:i===1?C.ac:C.pr,
                      transition:"width .8s cubic-bezier(.4,0,.2,1)",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {pctCost>8&&<span style={{ fontSize:8, color:"#fff", fontWeight:700 }}>{Math.round(pctCost)}%</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:2, fontSize:7, color:C.mt }}>
                    <span>${ch.costPerSend}/envío</span>
                    <span>{pct(ch.convRate)} conv rate</span>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Savings opportunity */}
          <div style={{ background:`${C.gn}08`, border:`1px solid ${C.gn}30`, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:10, fontWeight:700, color:C.gn }}>💡 Ahorro potencial: Push first</span>
              <span style={{ fontSize:14, fontWeight:900, fontFamily:"'JetBrains Mono',monospace",
                color:C.gn }}>${fmt(Math.round(smsCh.totalCost*.65))}</span>
            </div>
            <div style={{ fontSize:8, color:C.dm }}>
              Migrar 70% de SMS a Push notifications. SMS {Math.round(smsCh.costPerSend/Math.max(pushCh.costPerSend,.001))}x más caro por envío.
            </div>
          </div>
        </Card>
        <Card title="Transacciones phone_benefit" src="phone_benefit_transactions GROUP BY status">
          {[
            { label:"Aceptadas",  value:fmt(ds(1654,scale)), color:C.gn },
            { label:"Pendientes", value:ds(87,scale),        color:C.yl },
            { label:"Fallidas",   value:ds(135,scale),       color:C.rd },
            { label:"Tasa éxito", value:pct(ds(1654,scale)/(ds(1654,scale)+ds(87,scale)+ds(135,scale))*100), color:C.ac },
            { label:"Precio prom.", value:"$49.90", color:C.dm },
            { label:"Reward prom.", value:"594 MB", color:C.cy },
          ].map((f,i)=>(
            <Row key={i} label={f.label} value={String(f.value)} color={f.color} />
          ))}
        </Card>
      </G>
    </div>
  )
}

// ─── Panel Arquetipos ─────────────────────────────────────────
function PanelArquetipos() {
  const { scale } = useContext(DateCtx)
  const [selected, setSelected] = useState(null)
  const totalUsers = ARQUETIPOS.reduce((a,b)=>a+b.count,0)
  const active = ARQUETIPOS.filter(a=>!["dormant","churn"].includes(a.id))
  const engagement = active.reduce((a,b)=>a+b.count,0)
  const sel = selected ? ARQUETIPOS.find(a=>a.id===selected) : null

  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Usuarios clasificados" value={fmt(ds(totalUsers,scale))} sub="COUNT(DISTINCT user_id)" color={C.ac} i={0} />
        <KPI label="Con arquetipo activo" value={pct(engagement/totalUsers*100)} sub="excl. dormant + churn" color={C.gn} i={1} />
        <KPI label="Power users" value={fmt(ds(ARQUETIPOS.find(a=>a.id==="competidor").count+ARQUETIPOS.find(a=>a.id==="fiel").count,scale))} sub="Competidor + Fiel" color={C.yl} i={2} />
        <KPI label="Reactivables" value={fmt(ds(ARQUETIPOS.find(a=>a.id==="dormant").count,scale))} sub="31-90d sin actividad" color={C.or} i={3} />
        <KPI label="Compradores verif." value={fmt(ds(ARQUETIPOS.find(a=>a.id==="comprador").count,scale))} sub="ticket aprobado ≥2x" color={C.em} i={4} />
        <KPI label="Embajadores" value={fmt(ds(ARQUETIPOS.find(a=>a.id==="social").count,scale))} sub="≥3 referidos activos" color={C.pk} i={5} />
      </G>

      {/* Barra de distribución proporcional */}
      <Card title="Distribución de arquetipos — plataforma completa"
        src="redemptions GROUP BY user_id + SPLIT_PART(coupon_code,':',1) + mission_game_sessions.score + referrals + last_sign_in_at">
        <div style={{ display:"flex", height:14, borderRadius:6, overflow:"hidden", gap:1, marginBottom:14 }}>
          {ARQUETIPOS.map((a,i)=>(
            <div key={i} title={`${a.label}: ${a.pct}%`}
              onClick={()=>setSelected(selected===a.id?null:a.id)}
              style={{ flex:a.pct, background:a.color, cursor:"pointer", opacity:selected&&selected!==a.id?0.35:1,
                transition:"opacity .2s", minWidth:4 }} />
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
          {ARQUETIPOS.map((a,i)=>(
            <div key={i} onClick={()=>setSelected(selected===a.id?null:a.id)}
              style={{ background:selected===a.id?`${a.color}18`:C.surface,
                border:`1px solid ${selected===a.id?a.color:C.bd}`, borderRadius:8, padding:"10px 12px",
                cursor:"pointer", transition:"all .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:16 }}>{a.emoji}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:a.color }}>{a.label}</span>
                </div>
                <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:a.color }}>
                  {pct(a.pct)}
                </span>
              </div>
              <div style={{ fontSize:9, color:C.dm, marginBottom:6, lineHeight:1.4 }}>{a.desc}</div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:C.tx }}>{fmt(ds(a.count,scale))}</span>
                <span style={{ fontSize:9, color:C.mt }}>ret. {a.retRate}%</span>
              </div>
              <PBar value={a.pct} max={30} color={a.color} />
            </div>
          ))}
        </div>
      </Card>

      {/* Panel de detalle del arquetipo seleccionado */}
      {sel && (
        <G cols="1fr 1fr">
          <Card title={`${sel.emoji} ${sel.label} — perfil detallado`} src={sel.sql}>
            <div style={{ background:`${sel.color}10`, border:`1px solid ${sel.color}30`, borderRadius:8,
              padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:11, color:sel.color, fontWeight:700, marginBottom:6 }}>Regla de clasificación</div>
              <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:C.dm, lineHeight:1.6 }}>{sel.sql}</div>
            </div>
            <G cols="1fr 1fr 1fr" mb={12}>
              <div style={{ textAlign:"center", background:C.surface, borderRadius:8, padding:10 }}>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color:sel.color }}>{sel.avgMissions}</div>
                <div style={{ fontSize:8, color:C.mt }}>Misiones/usuario</div>
              </div>
              <div style={{ textAlign:"center", background:C.surface, borderRadius:8, padding:10 }}>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color:sel.color }}>{sel.avgExps}</div>
                <div style={{ fontSize:8, color:C.mt }}>Experiencias prom.</div>
              </div>
              <div style={{ textAlign:"center", background:C.surface, borderRadius:8, padding:10 }}>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                  color:sel.retRate>=70?C.gn:sel.retRate>=40?C.or:C.rd }}>{sel.retRate}%</div>
                <div style={{ fontSize:8, color:C.mt }}>Retención 30d</div>
              </div>
            </G>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {sel.traits.map((t,i)=>(
                <span key={i} style={{ fontSize:9, padding:"3px 8px", borderRadius:4, fontWeight:600,
                  background:`${sel.color}18`, color:sel.color, border:`1px solid ${sel.color}33` }}>{t}</span>
              ))}
            </div>
            <Row label="Misión favorita" value={sel.topMission} color={sel.color} />
            <Row label="Reward preferido" value={sel.topReward} color={C.dm} />
          </Card>
          <Card title="Comparativa arquetipos — retención vs volumen">
            <div style={{ position:"relative", height:180, marginTop:8 }}>
              {ARQUETIPOS.map((a,i)=>{
                const x = a.pct / 30 * 88 + 4
                const y = 100 - a.retRate
                const r = Math.max(5, Math.sqrt(a.count/totalUsers)*80)
                return (
                  <div key={i} title={`${a.label}: ${a.pct}% usuarios, ${a.retRate}% retención`}
                    onClick={()=>setSelected(selected===a.id?null:a.id)}
                    style={{ position:"absolute", left:`${x}%`, top:`${y}%`,
                      width:r, height:r, borderRadius:"50%",
                      background:`${a.color}${selected&&selected!==a.id?"30":"70"}`,
                      border:`1.5px solid ${a.color}`,
                      transform:"translate(-50%,-50%)", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all .2s", zIndex:selected===a.id?2:1,
                      boxShadow:selected===a.id?`0 0 12px ${a.color}60`:"none" }}>
                    <span style={{ fontSize:Math.max(8,r*0.35), userSelect:"none" }}>{a.emoji}</span>
                  </div>
                )
              })}
              {/* Ejes */}
              <div style={{ position:"absolute", left:0, bottom:0, right:0, height:1, background:`${C.bd}60` }} />
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:1, background:`${C.bd}60` }} />
              <span style={{ position:"absolute", bottom:-18, left:"50%", transform:"translateX(-50%)",
                fontSize:8, color:C.mt }}>% de usuarios →</span>
              <span style={{ position:"absolute", left:-20, top:"50%",
                transform:"translateY(-50%) rotate(-90deg)", fontSize:8, color:C.mt }}>retención →</span>
            </div>
            <div style={{ marginTop:24, fontSize:9, color:C.mt, textAlign:"center" }}>
              Tamaño del círculo = volumen de usuarios · Haz click para detalles
            </div>
          </Card>
        </G>
      )}

      {/* ── DNA Radar del arquetipo seleccionado ── */}
      {sel && (
        <Card title={`🧬 DNA conductual — ${sel.emoji} ${sel.label}`}
          src="SPLIT_PART(coupon_code,':',1) + game_sessions.score + referrals + check_ins + experiences">
          <G cols="1fr 1fr 1fr" mb={0}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <RadarSVG dims={ARCHETYPE_RADAR[sel.id]||[]} size={180} color={sel.color} />
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
                {(ARCHETYPE_RADAR[sel.id]||[]).map((d,i)=>(
                  <div key={i} style={{ textAlign:"center", minWidth:44 }}>
                    <div style={{ fontSize:14, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                      color:d.value>=70?C.gn:d.value>=40?sel.color:C.dm }}>{d.value}</div>
                    <div style={{ fontSize:7, color:C.mt }}>{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:C.dm, marginBottom:10 }}>Comportamientos clave</div>
              {(ARCHETYPE_RADAR[sel.id]||[]).map((d,i)=>(
                <div key={i} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:9, color:C.dm }}>{d.label}</span>
                    <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                      fontWeight:700, color:d.value>=70?C.gn:d.value>=40?sel.color:C.mt }}>{d.value}/100</span>
                  </div>
                  <PBar value={d.value} color={d.value>=70?C.gn:d.value>=40?sel.color:C.mt} />
                </div>
              ))}
            </div>
            <div>
              {ARCHETYPE_LTV[sel.id] && (
                <div style={{ background:C.surface, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.dm, marginBottom:12 }}>Valor estimado</div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:28, fontWeight:900, fontFamily:"'JetBrains Mono',monospace",
                      color:sel.color }}>${ARCHETYPE_LTV[sel.id].arpu}MXN</div>
                    <div style={{ fontSize:8, color:C.mt }}>ARPU estimado / año</div>
                  </div>
                  <Row label="Multiplicador LTV" value={`${ARCHETYPE_LTV[sel.id].ltv}x`} color={ARCHETYPE_LTV[sel.id].ltv>=2?C.gn:C.or} />
                  <Row label="Riesgo churn" value={ARCHETYPE_LTV[sel.id].churnRisk} color={C.mt} />
                  <Row label="Prioridad" value={ARCHETYPE_LTV[sel.id].priority} color={ARCHETYPE_LTV[sel.id].pColor} />
                  <div style={{ marginTop:10, padding:"8px 0", borderTop:`1px solid ${C.bd}20`, fontSize:9, color:C.mt, lineHeight:1.5 }}>
                    <strong style={{ color:sel.color }}>Acción recomendada:</strong>{" "}
                    { sel.id==="social"?"Programa de embajadores con incentivo adicional por referido calificado"
                      :sel.id==="comprador"?"Early-access a experiencias con misiones de compra, ticket exclusivo"
                      :sel.id==="fiel"?"Co-diseño de experiencias, beta tester, reconocimiento público en leaderboard"
                      :sel.id==="competidor"?"Torneo exclusivo mensual con premio físico para el #1"
                      :sel.id==="dormant"?"Push urgente: 'Vuelve, tienes X puntos esperándote' con nueva experiencia"
                      :sel.id==="churn"?"Campaña win-back con recompensa de alto impacto y experiencia corta (1 misión)"
                      :"Notificación de nuevas experiencias de tipo preferido"
                    }
                  </div>
                </div>
              )}
            </div>
          </G>
        </Card>
      )}

      <Card title="Tabla comparativa de arquetipos" src="redemptions + mission_game_sessions + referrals + auth.users.last_sign_in_at">
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
            <thead>
              <tr>
                {["Arquetipo","Usuarios","% Total","Mis/User","Exp/User","Retención","Top Misión","Top Reward"].map(h=>(
                  <th key={h} style={{ padding:"6px 8px", color:C.mt, fontWeight:600,
                    textAlign:h==="Arquetipo"?"left":"right",
                    borderBottom:`1px solid ${C.bd}`, fontSize:9 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ARQUETIPOS.map((a,i)=>(
                <tr key={i} onClick={()=>setSelected(selected===a.id?null:a.id)}
                  style={{ borderBottom:`1px solid ${C.bd}20`, cursor:"pointer",
                    background:selected===a.id?`${a.color}08`:"transparent",
                    transition:"background .15s" }}>
                  <td style={{ padding:"7px 8px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:a.color }} />
                      <span style={{ fontWeight:600 }}>{a.emoji} {a.label}</span>
                    </div>
                  </td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>
                    {fmt(ds(a.count,scale))}
                  </td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace", color:a.color }}>
                    {pct(a.pct)}
                  </td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>{a.avgMissions}</td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>{a.avgExps}</td>
                  <td style={{ padding:"7px 8px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace",
                    color:a.retRate>=70?C.gn:a.retRate>=40?C.or:C.rd }}>{a.retRate}%</td>
                  <td style={{ padding:"7px 8px", textAlign:"right", color:C.dm }}>{a.topMission}</td>
                  <td style={{ padding:"7px 8px", textAlign:"right", color:C.dm }}>{a.topReward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Panel Funnel Completo ─────────────────────────────────────
function PanelFunnel() {
  const { scale } = useContext(DateCtx)
  const scaledFunnel = FUNNEL_FULL.map((s,i) => ({
    ...s, n: s.external ? Math.round(s.n * Math.max(0.3, scale)) : ds(s.n, scale)
  }))
  const topN = scaledFunnel[0].n
  const [hovered, setHovered] = useState(null)

  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Total registrados" value={fmt(ds(41700,scale))} sub="auth.users COUNT(*)" color={C.ac} i={0} />
        <KPI label="Tasa activación" value={pct(scaledFunnel[5].n/scaledFunnel[3].n*100)} sub="registro → 1ra participación" color={C.gn} i={1} />
        <KPI label="Completion rate" value={pct(scaledFunnel[6].n/scaledFunnel[5].n*100)} sub="1ra part → exp. completa" color={C.cy} i={2} />
        <KPI label="Claim rate" value={pct(scaledFunnel[7].n/scaledFunnel[6].n*100)} sub="completa → recompensa" color={C.yl} i={3} />
        <KPI label="Retención" value={pct(scaledFunnel[8].n/scaledFunnel[7].n*100)} sub="claim → 2da experiencia" color={C.pr} i={4} />
        <KPI label="Conversión a embajador" value={pct(scaledFunnel[9].n/scaledFunnel[5].n*100)} sub="participante → ≥3 referidos" color={C.em} i={5} />
      </G>

      <G cols="auto 1fr" gap={14}>
        <div style={{ flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.dm, marginBottom:10 }}>
            Vista proporcional
          </div>
          <TrapezoidFunnel
            w={200}
            steps={scaledFunnel.filter(s=>!s.external).map((s,i)=>({
              ...s,
              color:[C.ac,C.ac,C.cy,C.gn,C.gn,C.em,C.yl][i]||C.ac,
            }))}
          />
        </div>
        <div>
      <Card title="Funnel completo JALO — impresión → embajador"
        src="Meta/TikTok Pixel + PostHog + auth.users + redemptions + tickets/drops/raffles + referrals">
        <div style={{ marginBottom:10 }}>
          {scaledFunnel.map((s,i)=>{
            const nextN = i<scaledFunnel.length-1 ? scaledFunnel[i+1].n : s.n
            const dropPct = i>0 ? Math.round((1-s.n/scaledFunnel[i-1].n)*100) : 0
            const convPct = i<scaledFunnel.length-1 ? Math.round(nextN/s.n*100) : 100
            const barW = s.n/topN*100
            const barColor = s.external ? C.mt : i<=3 ? C.ac : i<=6 ? C.gn : i<=8 ? C.cy : C.em
            const isHov = hovered===i
            return (
              <div key={i}
                onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}
                style={{ marginBottom:4, position:"relative" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {/* Step number */}
                  <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0,
                    background:s.external?`${C.mt}20`:`${barColor}20`,
                    border:`1px solid ${s.external?C.mt:barColor}`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:9, fontWeight:700,
                      color:s.external?C.mt:barColor }}>{i+1}</span>
                  </div>
                  {/* Label */}
                  <span style={{ fontSize:10, color:s.external?C.mt:C.dm, width:150, flexShrink:0,
                    fontStyle:s.external?"italic":"normal" }}>
                    {s.step}
                    {s.external && <span style={{ fontSize:8, color:C.mt, marginLeft:4 }}>(PostHog)</span>}
                  </span>
                  {/* Bar — fixed height, no layout shift */}
                  <div style={{ flex:1, background:`${barColor}10`, borderRadius:4, height:16,
                    overflow:"hidden", position:"relative",
                    outline:isHov?`1.5px solid ${barColor}60`:"none",
                    transition:"outline .1s" }}>
                    <div style={{ width:`${barW}%`, height:"100%", background:barColor,
                      opacity:s.external?0.4:0.85, borderRadius:4,
                      display:"flex", alignItems:"center", paddingLeft:8 }}>
                      {barW>18 && <span style={{ fontSize:9, fontWeight:700, color:"#fff" }}>{fmt(s.n)}</span>}
                    </div>
                  </div>
                  {/* Value */}
                  <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                    color:barColor, width:54, textAlign:"right", flexShrink:0 }}>{fmt(s.n)}</span>
                  {/* Drop */}
                  {i>0 && (
                    <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                      color:dropPct>50?C.rd:dropPct>25?C.or:C.mt, width:44, textAlign:"right", flexShrink:0 }}>
                      ↓{dropPct}%
                    </span>
                  )}
                </div>
                {/* Tooltip — absolutely positioned, no layout shift */}
                {isHov && (
                  <div style={{
                    position:"absolute", left:28, top:"calc(100% + 2px)",
                    zIndex:50, minWidth:320, maxWidth:480,
                    padding:"8px 12px",
                    background:C.card,
                    border:`1px solid ${barColor}60`,
                    borderRadius:8,
                    fontSize:9, color:C.dm,
                    boxShadow:`0 8px 24px rgba(0,0,0,.55)`,
                    pointerEvents:"none",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:barColor, flexShrink:0 }} />
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8,
                        color:barColor, fontWeight:700 }}>
                        Paso {i+1} — {s.step}
                      </span>
                    </div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8,
                      color:C.mt, marginBottom:s.note||i<scaledFunnel.length-1?6:0 }}>
                      📊 {s.src}
                    </div>
                    {s.note && (
                      <div style={{ color:C.dm, marginBottom:i<scaledFunnel.length-1?4:0 }}>
                        {s.note}
                      </div>
                    )}
                    {i<scaledFunnel.length-1 && (
                      <div style={{ color:C.ac, fontWeight:600 }}>
                        → Siguiente paso: {convPct}% convierten
                      </div>
                    )}
                  </div>
                )}
                {/* Arrow between steps */}
                {i < scaledFunnel.length-1 && (
                  <div style={{ display:"flex", alignItems:"center", marginLeft:28, marginTop:2, marginBottom:2 }}>
                    <div style={{ width:1, height:8, background:`${C.bd}60`, marginLeft:9 }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ background:`${C.mt}10`, border:`1px solid ${C.bd}`, borderRadius:6,
          padding:"8px 12px", fontSize:9, color:C.dm }}>
          <span style={{ fontWeight:700, color:C.mt }}>ℹ️ Pasos 1-3</span> viven en PostHog + GA4 (events: auth.view.login_page, experience.view.detail).
          Se pueden unir exportando user_id de PostHog con <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>auth.complete.success.is_new_user=true</span>.
          <span style={{ fontWeight:700, color:C.gn, marginLeft:8 }}>Pasos 4-10</span> son 100% Supabase.
        </div>
      </Card>
        </div>
      </G>

      <Card title="Tiempos medianos entre pasos del funnel"
        src="MIN(redemptions.created_at) - auth.users.created_at → timestamp diff por user_id">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:8 }}>
          {FUNNEL_TIMES.map((t,i)=>(
            <div key={i} style={{ background:C.surface, borderRadius:8, padding:"10px 12px",
              borderLeft:`3px solid ${COLORS_CYCLE[i%6]}` }}>
              <div style={{ fontSize:9, color:C.mt, marginBottom:6, lineHeight:1.4 }}>
                <span style={{ color:C.dm }}>{t.from}</span>
                <span style={{ color:C.mt }}> → </span>
                <span style={{ color:C.dm }}>{t.to}</span>
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color:COLORS_CYCLE[i%6] }}>
                    {t.median}
                  </div>
                  <div style={{ fontSize:8, color:C.mt }}>mediana</div>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:C.dm }}>
                    {t.pct90}
                  </div>
                  <div style={{ fontSize:8, color:C.mt }}>P90</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <G cols="1fr 1fr">
        <Card title="Métodos de registro — composición" src="auth.start.login event → method field (PostHog/GA4)">
          {[
            { method:"Email", pct:38, color:C.ac },
            { method:"Teléfono (OTP)", pct:29, color:C.gn },
            { method:"Google", pct:21, color:C.or },
            { method:"Facebook", pct:8, color:C.pr },
            { method:"Apple", pct:4, color:C.dm },
          ].map((m,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:10, color:C.dm }}>{m.method}</span>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:m.color }}>{m.pct}%</span>
              </div>
              <PBar value={m.pct} color={m.color} />
            </div>
          ))}
          <div style={{ fontSize:9, color:C.mt, marginTop:8, fontStyle:"italic" }}>
            ⚠ Dato de PostHog — no disponible en Supabase directamente
          </div>
        </Card>
        <Card title="Conversión por origen — con vs sin código de referido"
          src="auth.complete.success WHERE referral_code IS NOT NULL vs NULL (PostHog)">
          {[
            { label:"Con código de referido", activation:68, completion:71, claim:89, color:C.em },
            { label:"Sin código de referido",  activation:42, completion:58, claim:82, color:C.ac },
          ].map((g,i)=>(
            <div key={i} style={{ marginBottom:14, paddingBottom:12, borderBottom:i<1?`1px solid ${C.bd}20`:"none" }}>
              <div style={{ fontSize:10, fontWeight:700, color:g.color, marginBottom:8 }}>{g.label}</div>
              {[["Activación",g.activation],["Completion",g.completion],["Claim",g.claim]].map(([l,v],j)=>(
                <div key={j} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:9, color:C.dm }}>{l}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, marginLeft:10 }}>
                    <div style={{ flex:1 }}><PBar value={v} color={g.color} /></div>
                    <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                      fontWeight:700, color:g.color, width:32, textAlign:"right" }}>{v}%</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </Card>
      </G>
    </div>
  )
}

// ─── Panel Mapa Físico ─────────────────────────────────────────
function PanelMapa() {
  const { scale } = useContext(DateCtx)
  const [activeCity, setActiveCity] = useState("all")
  const [hoveredZone, setHoveredZone] = useState(null)
  const totalCheckins = ds(CHECKIN_HEATPOINTS.reduce((a,b)=>a+b.checkins,0), scale)

  // Mini SVG map of Mexico with state clusters
  const MX_CITIES = [
    { id:"cdmx", label:"CDMX", cx:220, cy:280, r:22, checkins:5870, color:C.ac },
    { id:"gdl",  label:"GDL",  cx:155, cy:250, r:16, checkins:1850, color:C.gn },
    { id:"mty",  label:"MTY",  cx:215, cy:195, r:14, checkins:1620, color:C.cy },
    { id:"pue",  label:"Puebla",cx:245, cy:285, r:10, checkins:310,  color:C.pr },
    { id:"qro",  label:"QRO",  cx:210, cy:260, r:9,  checkins:260,  color:C.or },
    { id:"mex",  label:"Edo.Méx",cx:230,cy:272,r:8,  checkins:340,  color:C.em },
  ]
  const maxC = Math.max(...MX_CITIES.map(c=>c.checkins))

  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Check-ins verificados" value={fmt(totalCheckins)} sub="mission_check_in_validations status=3" color={C.gn} i={0} />
        <KPI label="Markers activos" value={fmt(ds(48,scale))} sub="markers.enabled=true" color={C.ac} i={1} />
        <KPI label="Estados con actividad" value="12" sub="de 32 estados" color={C.cy} i={2} />
        <KPI label="Ciudad #1" value="CDMX" sub="5,870 check-ins verificados" color={C.yl} i={3} />
        <KPI label="Pico semanal" value="Sábado" sub="13h-14h hora local MX" color={C.em} i={4} />
        <KPI label="Radio promedio" value="180m" sub="markers.radius AVG" color={C.pr} i={5} />
      </G>

      <G cols="1fr 1.4fr">
        {/* SVG map */}
        <Card title="Concentración geográfica — check-ins aprobados"
          src="mission_check_in_validations (status=3) JOIN markers (latitude, longitude) → GeoJSON cluster">
          <div style={{ position:"relative" }}>
            <svg viewBox="100 140 250 200" style={{ width:"100%", height:220 }}>
              {/* Mexico outline — simplified paths */}
              <path d="M120,165 L140,158 L175,155 L210,150 L240,148 L270,155 L300,160 L330,158 L348,165 L350,180 L345,200 L340,220 L330,240 L315,258 L300,272 L285,280 L270,285 L255,290 L240,295 L225,298 L210,295 L195,288 L178,280 L162,270 L148,258 L136,242 L126,225 L118,208 L112,190 L110,175 Z"
                fill={`${C.surface}`} stroke={C.bd} strokeWidth={1.5} />
              {/* Baja California peninsula */}
              <path d="M115,172 L110,185 L107,200 L108,215 L112,225 L118,232 L120,228 L118,215 L116,200 L114,185 L116,175 Z"
                fill={C.surface} stroke={C.bd} strokeWidth={1} />
              {/* Yucatan peninsula */}
              <path d="M310,268 L318,275 L325,278 L328,272 L325,265 L318,262 L312,265 Z"
                fill={C.surface} stroke={C.bd} strokeWidth={1} />

              {/* City circles with intensity */}
              {MX_CITIES.map((city,i)=>{
                const isActive = activeCity==="all" || activeCity===city.id
                const r = city.r * (city.checkins/maxC*0.5+0.5)
                return (
                  <g key={i} onClick={()=>setActiveCity(activeCity===city.id?"all":city.id)}
                    style={{ cursor:"pointer" }}>
                    {/* Pulse ring */}
                    <circle cx={city.cx} cy={city.cy} r={r*1.8}
                      fill="none" stroke={city.color} strokeWidth={1}
                      opacity={isActive?0.25:0.05}
                      style={{ animation:"pulse 2s ease infinite" }} />
                    {/* Main dot */}
                    <circle cx={city.cx} cy={city.cy} r={r}
                      fill={city.color} opacity={isActive?0.85:0.2} />
                    {/* Label */}
                    <text x={city.cx} y={city.cy+r+10} textAnchor="middle"
                      fontSize={7.5} fill={isActive?city.color:C.mt} fontWeight="700">
                      {city.label}
                    </text>
                    <text x={city.cx} y={city.cy+r+18} textAnchor="middle"
                      fontSize={7} fill={isActive?C.dm:C.mt}>
                      {fmt(Math.round(city.checkins*scale))}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div style={{ fontSize:8, color:C.mt, textAlign:"center", marginTop:-8 }}>
              Haz click en una ciudad para filtrar · Mapbox GL disponible en producción
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
            {["all",...MX_CITIES.map(c=>c.id)].map((id)=>{
              const city = MX_CITIES.find(c=>c.id===id)
              return (
                <button key={id} onClick={()=>setActiveCity(id)} style={{
                  padding:"3px 8px", borderRadius:4, border:`1px solid ${activeCity===id?(city?.color||C.ac):C.bd}`,
                  background:activeCity===id?`${city?.color||C.ac}15`:"transparent",
                  color:activeCity===id?(city?.color||C.ac):C.mt, fontSize:9, fontWeight:600, cursor:"pointer" }}>
                  {id==="all"?"Todas":city?.label}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Top zones table */}
        <Card title="Top zonas por check-ins verificados"
          src="mission_check_in_validations JOIN markers → address GROUP BY postal_code ORDER BY COUNT DESC">
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
              <thead>
                <tr>{["#","Zona","CP","Check-ins","Marca","Pico"].map(h=>(
                  <th key={h} style={{ padding:"5px 7px", color:C.mt, fontWeight:600,
                    textAlign:h==="Zona"?"left":"center",
                    borderBottom:`1px solid ${C.bd}`, fontSize:9 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {CHECKIN_ZONES_RANKED.map((z,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${C.bd}20` }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"6px 7px", textAlign:"center",
                      fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                      color:i<3?[C.yl,"#c0c0c0","#cd7f32"][i]:C.mt }}>{z.rank}</td>
                    <td style={{ padding:"6px 7px", fontWeight:600, color:C.tx }}>{z.zone}</td>
                    <td style={{ padding:"6px 7px", textAlign:"center",
                      fontFamily:"'JetBrains Mono',monospace", color:C.mt, fontSize:9 }}>{z.cp}</td>
                    <td style={{ padding:"6px 7px", textAlign:"center",
                      fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:C.ac }}>
                      {fmt(ds(z.checkins,scale))}
                    </td>
                    <td style={{ padding:"6px 7px", textAlign:"center", color:C.dm, fontSize:9 }}>{z.topBrand}</td>
                    <td style={{ padding:"6px 7px", textAlign:"center" }}>
                      <span style={{ fontSize:8, color:C.cy, fontFamily:"'JetBrains Mono',monospace" }}>
                        {z.weekdayPeak} {z.hourPeak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </G>

      {/* Heatmap hora × día */}
      <Card title="Heatmap hora × día de semana — check-ins verificados en México"
        src="EXTRACT(dow, hour FROM mission_check_in_validations.created_at) — timezone America/Mexico_City">
        <div style={{ display:"flex", gap:4, fontSize:8 }}>
          {/* Hour labels */}
          <div style={{ display:"flex", flexDirection:"column", gap:1, paddingTop:16, marginRight:2 }}>
            {Array.from({length:24},(_,h)=>(
              <div key={h} style={{ height:12, lineHeight:"12px", textAlign:"right",
                color:C.mt, fontSize:7, fontFamily:"'JetBrains Mono',monospace" }}>
                {h%4===0?`${h}h`:""}
              </div>
            ))}
          </div>
          {/* Day columns */}
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((day,di)=>(
            <div key={day} style={{ display:"flex", flexDirection:"column", gap:1, alignItems:"center", flex:1 }}>
              <div style={{ height:14, lineHeight:"14px", color:C.dm, fontWeight:600, fontSize:9,
                textAlign:"center" }}>{day}</div>
              {CHECKIN_HOUR_DAY.map((row,h)=>{
                const v = row[di]
                const isWeekend = di>=5
                const color = v>0.7?C.ac:v>0.45?C.pr:v>0.2?C.bd:C.surface
                return (
                  <div key={h} title={`${day} ${h}h: ${Math.round(v*100)}%`}
                    style={{ height:12, borderRadius:2, background:color,
                      opacity:0.3+v*0.7, width:"100%",
                      transition:"transform .1s", cursor:"default" }}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform="scale(1.3)"
                      e.currentTarget.style.zIndex="2"
                      e.currentTarget.style.position="relative"
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform="scale(1)"
                      e.currentTarget.style.zIndex="1"
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
          <span style={{ fontSize:8, color:C.mt }}>Baja actividad</span>
          <div style={{ display:"flex", gap:1 }}>
            {[C.surface,C.bd,C.pr,C.ac].map((c,i)=>(
              <div key={i} style={{ width:16, height:8, borderRadius:2, background:c, opacity:0.4+i*0.2 }} />
            ))}
          </div>
          <span style={{ fontSize:8, color:C.mt }}>Alta actividad</span>
          <span style={{ fontSize:8, color:C.or, marginLeft:8 }}>
            📍 Pico: Sábados 12-14h y Viernes 17-21h
          </span>
        </div>
      </Card>

      <G cols="1fr 1fr">
        <Card title="Marcas con más presencia física verificada"
          src="mission_check_in_validations JOIN redemptions JOIN experiences JOIN brands GROUP BY brand_id">
          {[
            { brand:"MVS Hub",    checkins:ds(2880,scale), markers:18, zones:6, color:C.ac },
            { brand:"Sushi Itto", checkins:ds(2340,scale), markers:12, zones:5, color:C.gn },
            { brand:"Nutrisa",    checkins:ds(1650,scale), markers:9,  zones:4, color:C.em },
            { brand:"T-Conecta",  checkins:ds(990,scale),  markers:6,  zones:3, color:C.cy },
          ].map((b,i)=>(
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <div>
                  <span style={{ fontSize:10, fontWeight:600, color:C.tx }}>{b.brand}</span>
                  <span style={{ fontSize:8, color:C.mt, marginLeft:6 }}>{b.markers} markers · {b.zones} zonas</span>
                </div>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:b.color }}>
                  {fmt(b.checkins)}
                </span>
              </div>
              <PBar value={b.checkins} max={ds(2880,scale)||1} color={b.color} />
            </div>
          ))}
        </Card>
        <Card title="Patrones de visita — distancia entre check-ins repetidos"
          src="mission_check_in_validations GROUP BY user_id WHERE COUNT > 1 → haversine(lat1,lng1,lat2,lng2)">
          {[
            { label:"Mismo marker (0m)",        pct:41, color:C.gn, note:"Cliente habitual de la sucursal" },
            { label:"Misma colonia (<500m)",     pct:28, color:C.cy, note:"Frecuenta la zona" },
            { label:"Misma ciudad (<10km)",      pct:22, color:C.ac, note:"Comportamiento urbano normal" },
            { label:"Diferente ciudad (>50km)",  pct:9,  color:C.pr, note:"Usuario itinerante / viajero" },
          ].map((p,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:9, color:C.dm }}>{p.label}</span>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:p.color }}>{p.pct}%</span>
              </div>
              <PBar value={p.pct} color={p.color} />
              <div style={{ fontSize:8, color:C.mt, marginTop:1 }}>{p.note}</div>
            </div>
          ))}
        </Card>
      </G>
    </div>
  )
}

// ─── Panel Usuarios ───────────────────────────────────────────
function PanelUsuarios() {
  const { scale } = useContext(DateCtx)
  const [tab, setTab] = useState("participantes")
  const [selectedUser, setSelectedUser] = useState(null)
  const sel = selectedUser !== null ? TOP_PARTICIPANTES[selectedUser] : null

  const TABS = [
    { id:"participantes", label:"Top Participantes", src:"redemptions GROUP BY user_id ORDER BY COUNT DESC" },
    { id:"puntos",        label:"Top Puntos",        src:"points GROUP BY user_id ORDER BY SUM(points_count) DESC" },
    { id:"compradores",   label:"Top Compradores",   src:"mission_registered_purchases (status=3) JOIN redemptions GROUP BY user_id ORDER BY COUNT DESC" },
    { id:"gamers",        label:"Top Gamers",        src:"mission_game_sessions WHERE is_valid=true GROUP BY user_id ORDER BY MAX(score) DESC" },
    { id:"embajadores",   label:"Top Embajadores",   src:"referrals GROUP BY referred_by_user_id ORDER BY COUNT DESC" },
  ]

  const sortedUsers = useMemo(() => {
    const u = [...TOP_PARTICIPANTES]
    if (tab === "puntos")       return u.sort((a,b)=>b.points-a.points)
    if (tab === "compradores")  return u.sort((a,b)=>b.purchases-a.purchases)
    if (tab === "gamers")       return u.sort((a,b)=>b.gameScore-a.gameScore)
    if (tab === "embajadores")  return u.sort((a,b)=>b.refs-a.refs)
    return u // participantes (default, ya ordenado)
  }, [tab])

  const getMetric = (u) => {
    if (tab==="puntos")      return { v:fmt(ds(u.points,scale)),  label:"puntos", color:C.yl }
    if (tab==="compradores") return { v:String(u.purchases),       label:"compras verif.", color:C.gn }
    if (tab==="gamers")      return { v:fmt(u.gameScore),          label:"score máx.", color:C.pr }
    if (tab==="embajadores") return { v:String(u.refs),            label:"referidos", color:C.em }
    return { v:String(u.missions), label:"misiones", color:C.ac }
  }

  const medalColors = ["#FFD700","#C0C0C0","#CD7F32"]

  return (
    <div>
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Usuarios únicos activos" value={fmt(ds(22400,scale))} sub="con ≥1 redemption" color={C.ac} i={0} />
        <KPI label="Misiones prom./usuario" value="3.1" sub="redemptions COUNT / DISTINCT users" color={C.gn} i={1} />
        <KPI label="Usuarios multi-marca" value={fmt(ds(8340,scale))} sub="en ≥2 marcas distintas" color={C.cy} i={2} />
        <KPI label="Con redes sociales" value="34%" sub="social_links IS NOT NULL" color={C.pk} i={3} />
        <KPI label="Puntos totales" value={fmt(ds(1580000,scale))} sub="SUM(points.points_count)" color={C.yl} i={4} />
        <KPI label="Compras verificadas" value={fmt(ds(8700,scale))} sub="status=3 aprobadas" color={C.em} i={5} />
      </G>

      <G cols="1fr 1fr">
        {/* Left — leaderboard */}
        <div>
          {/* Tab selector */}
          <div style={{ display:"flex", gap:4, marginBottom:10, overflowX:"auto", paddingBottom:2 }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setSelectedUser(null)}} style={{
                padding:"5px 10px", borderRadius:6, border:"none", cursor:"pointer",
                background:tab===t.id?C.ac:"transparent",
                border:`1px solid ${tab===t.id?C.ac:C.bd}`,
                color:tab===t.id?"#fff":C.mt,
                fontSize:9, fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap",
                transition:"all .15s" }}>{t.label}</button>
            ))}
          </div>

          <Card title="" src={TABS.find(t=>t.id===tab)?.src}>
            <div style={{ fontSize:8, color:C.mt, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>
              {TABS.find(t=>t.id===tab)?.src}
            </div>
            {sortedUsers.slice(0,15).map((u,i)=>{
              const m = getMetric(u)
              const isSelected = selectedUser===i
              return (
                <div key={i} onClick={()=>setSelectedUser(isSelected?null:i)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 8px",
                    borderRadius:7, marginBottom:2, cursor:"pointer",
                    background:isSelected?`${m.color}12`:`${i%2===0?C.surface:"transparent"}`,
                    border:`1px solid ${isSelected?m.color:C.bd+"20"}`,
                    transition:"all .15s" }}>
                  {/* Rank */}
                  <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                    background:i<3?`${medalColors[i]}22`:`${C.bd}30`,
                    border:`1.5px solid ${i<3?medalColors[i]:C.bd}`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:9, fontWeight:800,
                      color:i<3?medalColors[i]:C.mt }}>
                      {i<3?["🥇","🥈","🥉"][i]:i+1}
                    </span>
                  </div>
                  {/* Avatar with gradient */}
                  <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0,
                    background:`linear-gradient(135deg,${u.grad[0]},${u.grad[1]})`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:10, fontWeight:800, color:"#fff" }}>
                      {u.name.charAt(0)}
                    </span>
                  </div>
                  {/* Name + state */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.tx,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize:8, color:C.mt }}>
                      @{u.username} · {u.state}
                    </div>
                  </div>
                  {/* Behavioral DNA mini radar */}
                  {ARCHETYPE_RADAR[u.arquetipo?.toLowerCase().replace(" a la marca","").replace("fiel","fiel").replace("activo regular","activo").replace(" ","").replace("é","e")] && (
                    <MiniRadar
                      dims={ARCHETYPE_RADAR[
                        u.arquetipo==="Social"?"social":
                        u.arquetipo==="Competidor"?"competidor":
                        u.arquetipo==="Comprador"?"comprador":
                        u.arquetipo==="Explorador"?"explorador":
                        u.arquetipo==="Fiel a la Marca"?"fiel":
                        u.arquetipo==="Activo Regular"?"activo":
                        u.arquetipo==="Churned"?"churn":"activo"
                      ]||[]}
                      size={38}
                      color={m.color}
                    />
                  )}
                  {/* Metric */}
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:800,
                      fontFamily:"'JetBrains Mono',monospace", color:m.color }}>
                      {m.v}
                    </div>
                    <div style={{ fontSize:8, color:C.mt }}>{m.label}</div>
                  </div>
                  {/* Arquetipo badge */}
                  <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0,
                    background:{
                      "Explorador":C.ac,"Competidor":C.yl,"Social":C.em,
                      "Comprador":C.gn,"Fiel a la Marca":C.pk,
                      "Activo Regular":C.cy
                    }[u.arquetipo]||C.dm }} title={u.arquetipo} />
                </div>
              )
            })}
          </Card>
        </div>

        {/* Right — user detail or stats */}
        {sel ? (
          <Card title={`Perfil: ${sel.name}`} src="auth.users.raw_user_meta_data + redemptions + points + referrals">
            {/* Profile header */}
            <div style={{ background:`linear-gradient(135deg,${sel.grad[0]}22,${sel.grad[1]}22)`,
              border:`1px solid ${sel.grad[0]}44`, borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:52, height:52, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg,${sel.grad[0]},${sel.grad[1]})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 4px 16px ${sel.grad[0]}60` }}>
                  <span style={{ fontSize:22, fontWeight:900, color:"#fff" }}>{sel.name.charAt(0)}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:C.tx }}>{sel.name}</div>
                  <div style={{ fontSize:9, color:C.mt, fontFamily:"'JetBrains Mono',monospace" }}>@{sel.username}</div>
                  <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                    <span style={{ fontSize:8, padding:"2px 6px", borderRadius:3, fontWeight:700,
                      background:{
                        "Explorador":C.ac,"Competidor":C.yl,"Social":C.em,
                        "Comprador":C.gn,"Fiel a la Marca":C.pk,"Activo Regular":C.cy
                      }[sel.arquetipo]+"20",
                      color:{
                        "Explorador":C.ac,"Competidor":C.yl,"Social":C.em,
                        "Comprador":C.gn,"Fiel a la Marca":C.pk,"Activo Regular":C.cy
                      }[sel.arquetipo] }}>{sel.arquetipo}</span>
                    <span style={{ fontSize:8, color:C.dm }}>📍 {sel.state}</span>
                    <span style={{ fontSize:8, color:C.dm }}>
                      {sel.gender==="f"?"♀":"♂"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Social links */}
              {Object.keys(sel.social).length > 0 && (
                <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                  {sel.social.ig && (
                    <span style={{ fontSize:8, padding:"2px 7px", borderRadius:3,
                      background:"rgba(255,110,180,.12)", color:C.pk, fontWeight:600 }}>
                      📸 @{sel.social.ig}
                    </span>
                  )}
                  {sel.social.tk && (
                    <span style={{ fontSize:8, padding:"2px 7px", borderRadius:3,
                      background:"rgba(34,212,239,.12)", color:C.cy, fontWeight:600 }}>
                      🎵 @{sel.social.tk}
                    </span>
                  )}
                  {sel.social.fb && (
                    <span style={{ fontSize:8, padding:"2px 7px", borderRadius:3,
                      background:"rgba(79,143,255,.12)", color:C.ac, fontWeight:600 }}>
                      👤 {sel.social.fb}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Stats grid */}
            <G cols="repeat(3,1fr)" mb={12}>
              {[
                { label:"Misiones",  value:ds(sel.missions,scale), color:C.ac,  src:"redemptions COUNT" },
                { label:"Puntos",    value:fmt(ds(sel.points,scale)), color:C.yl, src:"points SUM" },
                { label:"Exps",      value:sel.exps, color:C.cy,  src:"DISTINCT experience_id" },
                { label:"Compras",   value:sel.purchases, color:C.gn,  src:"purchases status=3" },
                { label:"Referidos", value:sel.refs, color:C.em,  src:"referrals COUNT" },
                { label:"Check-ins", value:sel.checkins, color:C.or,  src:"check_in status=3" },
              ].map((s,i)=>(
                <div key={i} style={{ background:C.surface, borderRadius:7, padding:"8px 10px",
                  textAlign:"center", cursor:"default" }} title={`Fuente: ${s.src}`}>
                  <div style={{ fontSize:16, fontWeight:800,
                    fontFamily:"'JetBrains Mono',monospace", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:8, color:C.mt }}>{s.label}</div>
                </div>
              ))}
            </G>

            {/* Timeline info */}
            <div style={{ background:C.surface, borderRadius:8, padding:"10px 12px", marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:9, color:C.mt }}>Miembro desde</span>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:C.dm }}>{sel.joined}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:9, color:C.mt }}>Última actividad</span>
                <span style={{ fontSize:9, color:C.gn }}>{sel.lastActive}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:9, color:C.mt }}>Score gaming máx.</span>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:C.pr }}>{fmt(sel.gameScore)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:9, color:C.mt }}>Puntos / misión</span>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:C.ac }}>
                  {Math.round(sel.points/Math.max(1,sel.missions))} pts
                </span>
              </div>
            </div>

            {/* Mission type donut proxy */}
            <div style={{ fontSize:9, color:C.mt, marginBottom:6 }}>Composición de misiones</div>
            {[
              { label:"Código QR", pct:Math.round(sel.missions*0.28), color:C.ac },
              { label:"Survey",    pct:Math.round(sel.missions*0.20), color:C.pr },
              { label:"Check-in",  pct:sel.checkins, color:C.yl },
              { label:"Compra",    pct:sel.purchases, color:C.gn },
              { label:"Game",      pct:Math.round(sel.missions*0.14), color:C.cy },
              { label:"Referido",  pct:Math.round(sel.refs*0.6), color:C.em },
            ].map((m,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                <div style={{ width:7, height:7, borderRadius:2, background:m.color, flexShrink:0 }} />
                <span style={{ fontSize:9, color:C.dm, flex:1 }}>{m.label}</span>
                <div style={{ width:80 }}><PBar value={m.pct} max={sel.missions||1} color={m.color} /></div>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                  color:m.color, width:22, textAlign:"right" }}>{m.pct}</span>
              </div>
            ))}
            <div style={{ fontSize:8, color:C.mt, marginTop:6, fontStyle:"italic" }}>
              Fuente: SPLIT_PART(redemptions.coupon_code,':',1) GROUP BY user_id
            </div>
            {/* Activity calendar for selected user */}
            <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${C.bd}20` }}>
              <ActivityCalendar
                weeksData={Array.from({length:52},(_,w)=>Array.from({length:7},(_,d)=>{
                  const isWknd=d>=5
                  const base=Math.min(1,(sel.missions/142)*0.8)
                  const variation=Math.sin(w*0.4+sel.rank)*0.2+Math.random()*0.08
                  return Math.min(1,Math.max(0,base+variation+(isWknd?0.08:0)))
                }))}
                color={sel.grad[0]}
                label={`Actividad semanal — últimas 52 semanas · ${sel.missions} misiones total`}
              />
            </div>
          </Card>
        ) : (
          <div>
            {/* Comparison stats when no user selected */}
            <Card title="Distribución de actividad — plataforma"
              src="redemptions GROUP BY user_id → distribución por buckets">
              {[
                { label:"Hyper (50+ misiones)",   n:ds(210,scale),  pct:0.5,  color:C.yl },
                { label:"Power (20-49)",           n:ds(1840,scale), pct:4.4,  color:C.gn },
                { label:"Activo (10-19)",          n:ds(4200,scale), pct:10.1, color:C.ac },
                { label:"Regular (5-9)",           n:ds(6800,scale), pct:16.3, color:C.cy },
                { label:"Casual (2-4)",            n:ds(9600,scale), pct:23.0, color:C.or },
                { label:"1 misión completada",     n:ds(8400,scale), pct:20.1, color:C.rd },
                { label:"Registrado sin participar",n:ds(11000,scale),pct:26.4, color:C.dm },
              ].map((b,i)=>(
                <div key={i} style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:9, color:C.dm }}>{b.label}</span>
                    <div style={{ display:"flex", gap:8 }}>
                      <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:C.dm }}>{fmt(b.n)}</span>
                      <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                        color:b.color, width:34, textAlign:"right" }}>{b.pct}%</span>
                    </div>
                  </div>
                  <PBar value={b.pct} color={b.color} />
                </div>
              ))}
            </Card>

            <Card title="Usuarios con presencia en redes sociales"
              src="auth.users.raw_user_meta_data->'social_links' IS NOT NULL">
              <G cols="repeat(2,1fr)" mb={0}>
                {[
                  { red:"Instagram", pct:22, color:C.pk,  icon:"📸" },
                  { red:"TikTok",    pct:18, color:C.cy,  icon:"🎵" },
                  { red:"Facebook",  pct:14, color:C.ac,  icon:"👤" },
                  { red:"Twitter/X", pct:9,  color:C.dm,  icon:"🐦" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:C.surface, borderRadius:8, padding:"10px 12px",
                    display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:s.color }}>{s.pct}%</div>
                      <div style={{ fontSize:8, color:C.mt }}>{s.red}</div>
                    </div>
                  </div>
                ))}
              </G>
              <div style={{ fontSize:8, color:C.mt, marginTop:8 }}>
                Haz click en un usuario del leaderboard para ver su perfil completo →
              </div>
            </Card>
          </div>
        )}
      </G>

      {/* Velocity and retention metrics */}
      <G cols="1fr 1fr 1fr">
        <Card title="Velocidad de misiones — top 15"
          src="COUNT(redemptions) / DATEDIFF(NOW(), auth.users.created_at) / 7">
          {TOP_PARTICIPANTES.slice(0,8).map((u,i)=>{
            const vel = parseFloat(misionesPerWeek(u))
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg,${u.grad[0]},${u.grad[1]})`,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:9, fontWeight:800, color:"#fff" }}>{u.name.charAt(0)}</span>
                </div>
                <span style={{ fontSize:9, color:C.dm, flex:1,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</span>
                <div style={{ width:60 }}>
                  <PBar value={vel} max={12} color={vel>=8?C.gn:vel>=4?C.ac:C.or} />
                </div>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                  color:vel>=8?C.gn:vel>=4?C.ac:C.or, width:32, textAlign:"right" }}>
                  {vel}/sem
                </span>
              </div>
            )
          })}
        </Card>

        <Card title="Usuarios nuevos vs recurrentes"
          src="redemptions — first vs subsequent experience per user_id">
          {[
            { label:"Primera experiencia", n:ds(8400,scale), color:C.gn, note:"is_new_user" },
            { label:"Segunda experiencia", n:ds(6200,scale), color:C.ac, note:"COUNT(DISTINCT exp) = 2" },
            { label:"Tercera experiencia", n:ds(3800,scale), color:C.cy, note:"COUNT(DISTINCT exp) = 3" },
            { label:"4+ experiencias",     n:ds(2100,scale), color:C.em, note:"COUNT(DISTINCT exp) >= 4" },
            { label:"6+ experiencias",     n:ds(980,scale),  color:C.yl, note:"power user zone" },
          ].map((r,i)=>(
            <div key={i} style={{ marginBottom:8 }} title={r.note}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:9, color:C.dm }}>{r.label}</span>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:r.color }}>{fmt(r.n)}</span>
              </div>
              <PBar value={r.n} max={ds(8400,scale)||1} color={r.color} />
            </div>
          ))}
        </Card>

        <Card title="Gap entre primera y segunda experiencia"
          src="MIN(redemptions.created_at) GROUP BY experience_id ORDER BY created_at — timestamp diff per user">
          {[
            { gap:"Mismo día",      pct:8,  color:C.gn },
            { gap:"1-7 días",       pct:19, color:C.ac },
            { gap:"8-30 días",      pct:31, color:C.cy },
            { gap:"31-60 días",     pct:22, color:C.or },
            { gap:"61-90 días",     pct:12, color:C.dm },
            { gap:"90+ días",       pct:8,  color:C.rd },
          ].map((g,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
              <span style={{ fontSize:9, color:C.dm, width:72, flexShrink:0 }}>{g.gap}</span>
              <div style={{ flex:1 }}><PBar value={g.pct} color={g.color} /></div>
              <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                color:g.color, width:30, textAlign:"right" }}>{g.pct}%</span>
            </div>
          ))}
          <div style={{ fontSize:8, color:C.mt, marginTop:8, borderTop:`1px solid ${C.bd}20`, paddingTop:6 }}>
            Mediana: <span style={{ color:C.ac, fontFamily:"'JetBrains Mono',monospace" }}>12.4 días</span>
            {" "}· P90: <span style={{ color:C.dm, fontFamily:"'JetBrains Mono',monospace" }}>38 días</span>
          </div>
        </Card>
      </G>
    </div>
  )
}


// ─── Panel Consumidores ───────────────────────────────────────
function PanelConsumidores() {
  const { scale } = useContext(DateCtx)
  const [view, setView] = useState("lifecycle")

  const VIEWS = [
    { id:"lifecycle", label:"🔄 Ciclo de Vida" },
    { id:"patterns",  label:"⏱ Patrones de Consumo" },
    { id:"affinity",  label:"🔗 Afinidad de Marcas" },
  ]

  return (
    <div>
      {/* View selector */}
      <div style={{ display:"flex", gap:4, marginBottom:14, flexWrap:"wrap" }}>
        {VIEWS.map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{
            padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer",
            background:view===v.id?C.ac:C.bd,
            color:view===v.id?"#fff":C.mt,
            fontSize:10, fontWeight:700, fontFamily:"inherit", transition:"all .15s",
          }}>{v.label}</button>
        ))}
      </div>

      {view==="lifecycle" && (
        <div>
          <G cols="repeat(auto-fit,minmax(130px,1fr))">
            <KPI label="Tasa activación"  value="53.7%"  sub="reg → 1ra misión" color={C.ac} i={0} />
            <KPI label="Tasa engagement"  value="35.5%"  sub="activ → exp completa" color={C.cy} i={1} />
            <KPI label="Tasa retención"   value="56.3%"  sub="completa → 2da exp" color={C.gn} i={2} />
            <KPI label="Tasa revenue"     value="32.4%"  sub="activos → compra verif." color={C.or} i={3} />
            <KPI label="Tasa advocacy"    value="14.8%"  sub="activos → embajador" color={C.yl} i={4} />
            <KPI label="LTV plataforma"   value="$58MXN" sub="ARPU promedio ponderado" color={C.em} demo i={5} />
          </G>

          <G cols="240px 1fr">
            <Card title="Embudo de ciclo de vida" src="auth.users + redemptions + claims + referrals → lifecycle stages">
              <TrapezoidFunnel
                w={220}
                steps={LIFECYCLE_STAGES.map(s=>({ ...s, n:ds(s.n,scale) }))}
              />
            </Card>
            <Card title="Conversión y valor por etapa" src="lifecycle stage transitions — proxy de revenue por etapa">
              {LIFECYCLE_STAGES.map((s,i)=>{
                const next=LIFECYCLE_STAGES[i+1]
                const conv=next?Math.round(next.n/s.n*100):null
                const earnedProxy=ds(s.n,scale)*LIFECYCLE_STAGES.findIndex(x=>x.stage===s.stage)*12
                return (
                  <div key={i} style={{ marginBottom:12, paddingBottom:10,
                    borderBottom:i<LIFECYCLE_STAGES.length-1?`1px solid ${C.bd}20`:"none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:18 }}>{s.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                          <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.stage}</span>
                          <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
                            {fmt(ds(s.n,scale))}
                          </span>
                        </div>
                        <div style={{ fontSize:8, color:C.mt }}>{s.detail}</div>
                      </div>
                    </div>
                    <PBar value={ds(s.n,scale)} max={ds(LIFECYCLE_STAGES[0].n,scale)||1} color={s.color} />
                    {conv&&(
                      <div style={{ fontSize:8, textAlign:"right", marginTop:2,
                        fontFamily:"'JetBrains Mono',monospace",
                        color:conv>60?C.gn:conv>35?C.or:C.rd }}>
                        {conv}% avanza a {next.stage} →
                      </div>
                    )}
                  </div>
                )
              })}
            </Card>
          </G>

          {/* Activity calendar */}
          <Card title="Actividad de la plataforma — últimas 52 semanas" src="redemptions.created_at GROUP BY week × day_of_week">
            <ActivityCalendar weeksData={PLATFORM_CALENDAR} color={C.ac}
              label="Participaciones diarias (relativo al máximo semanal)" />
          </Card>

          {/* LTV table */}
          <Card title="LTV estimado y ARPU por arquetipo conductual"
            src="redemptions + purchases + referrals → valor proxy por segmento">
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                <thead>
                  <tr>{["Arquetipo","Usuarios","ARPU / año","Mult. LTV","Riesgo churn","Acción"].map(h=>(
                    <th key={h} style={{ padding:"6px 8px", color:C.mt, fontWeight:600, fontSize:9,
                      textAlign:h==="Arquetipo"?"left":"right", borderBottom:`1px solid ${C.bd}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {ARQUETIPOS.map((a,i)=>{
                    const ltv=ARCHETYPE_LTV[a.id]
                    if(!ltv) return null
                    return (
                      <tr key={i} style={{ borderBottom:`1px solid ${C.bd}20` }}>
                        <td style={{ padding:"7px 8px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <MiniRadar dims={ARCHETYPE_RADAR[a.id]||[]} size={32} color={a.color} />
                            <span>{a.emoji} {a.label}</span>
                          </div>
                        </td>
                        <td style={{ padding:"7px 8px", textAlign:"right",
                          fontFamily:"'JetBrains Mono',monospace" }}>{fmt(ds(a.count,scale))}</td>
                        <td style={{ padding:"7px 8px", textAlign:"right",
                          fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:a.color }}>
                          ${ltv.arpu}
                        </td>
                        <td style={{ padding:"7px 8px", textAlign:"right",
                          fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                          color:ltv.ltv>=2?C.gn:ltv.ltv>=1.4?C.yl:C.dm }}>{ltv.ltv}x</td>
                        <td style={{ padding:"7px 8px", textAlign:"right",
                          color:C.mt, fontSize:9 }}>{ltv.churnRisk}</td>
                        <td style={{ padding:"7px 8px", textAlign:"right" }}>
                          <span style={{ fontSize:8, padding:"2px 6px", borderRadius:3, fontWeight:700,
                            background:`${ltv.pColor}18`, color:ltv.pColor }}>{ltv.priority}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {view==="patterns" && (
        <div>
          <G cols="repeat(auto-fit,minmax(130px,1fr))">
            <KPI label="Pico de compras" value="13:00h" sub="Sábados — max tráfico retail" color={C.or} i={0} />
            <KPI label="Misión más rápida" value="< 2min" sub="Código QR — avg completion" color={C.gn} i={1} />
            <KPI label="Sesión promedio" value="8.4min" sub="por visita activa" color={C.ac} demo i={2} />
            <KPI label="Días activos/mes" value="3.2" sub="avg por usuario activo" color={C.cy} demo i={3} />
          </G>

          {/* Purchase patterns by hour */}
          <Card title="Patrones de compra por hora y categoría de tienda"
            src="mission_registered_purchases.created_at → EXTRACT(HOUR) GROUP BY store_category">
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={PURCHASE_BY_HOUR} margin={{ top:4, right:4, bottom:0, left:-10 }}>
                <defs>
                  {[["gsup",C.ac],["gconv",C.gn],["grest",C.or],["gfarm",C.pr]].map(([id,c])=>(
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid {...AX.grid} />
                <XAxis dataKey="h" {...AX.x} interval={3} />
                <YAxis {...AX.y} />
                <Tooltip content={<CT />} cursor={{ stroke:`${C.ac}30`, strokeWidth:1 }} />
                <Area dataKey="super" name="Supermercado" stroke={C.ac} strokeWidth={1.5} fill="url(#gsup)" stackId="a" />
                <Area dataKey="conv"  name="Conveniencia"  stroke={C.gn} strokeWidth={1.5} fill="url(#gconv)" stackId="a" />
                <Area dataKey="rest"  name="Restaurante"   stroke={C.or} strokeWidth={1.5} fill="url(#grest)" stackId="a" />
                <Area dataKey="farm"  name="Farmacia"       stroke={C.pr} strokeWidth={1.5} fill="url(#gfarm)" stackId="a" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:14, marginTop:6, flexWrap:"wrap" }}>
              {[["Supermercado",C.ac],["Conveniencia",C.gn],["Restaurante",C.or],["Farmacia",C.pr]].map(([l,c])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:12, height:4, borderRadius:2, background:c }} />
                  <span style={{ fontSize:9, color:C.dm }}>{l}</span>
                </div>
              ))}
            </div>
          </Card>

          <G cols="1fr 1fr">
            {/* Mission completion speed */}
            <Card title="Tiempo promedio de completado por misión"
              src="redemptions.created_at - experience_missions availability → avg per type">
              {MISSION_SPEED.map((m,i)=>{
                const disp=m.mins>=1440?`${Math.round(m.mins/1440)}d`:m.mins>=60?`${Math.round(m.mins/60)}h`:`${m.mins}min`
                const bar=Math.min(m.mins, 500)
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                    <span style={{ fontSize:10, color:C.dm, width:85, flexShrink:0 }}>{m.tipo}</span>
                    <div style={{ flex:1 }}><PBar value={bar} max={500} color={m.color} /></div>
                    <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                      color:m.color, width:36, textAlign:"right" }}>{disp}</span>
                    <span style={{ fontSize:8, color:C.mt, width:110, flexShrink:0 }}>{m.note}</span>
                  </div>
                )
              })}
            </Card>

            {/* Product affinity pairs */}
            <Card title="Pares de productos co-comprados — lift de afinidad"
              src="mission_registered_purchases.product_list → co-occurrence matrix">
              {PRODUCT_PAIRS.map((p,i)=>(
                <div key={i} style={{ background:C.surface, borderRadius:8, padding:"9px 11px",
                  marginBottom:6, border:`1px solid ${p.lift>=4?C.em:C.bd}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
                    <span style={{ fontSize:9, fontWeight:600, color:C.tx }}>{p.p1}</span>
                    <div style={{ width:16, height:1, background:C.bda }} />
                    <span style={{ fontSize:9, fontWeight:600, color:C.tx }}>{p.p2}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:8 }}>
                    <span style={{ color:C.mt }}>Co-ocurrencia: <span style={{ color:C.ac, fontFamily:"'JetBrains Mono',monospace" }}>{p.cooc}%</span></span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                      color:p.lift>=4?C.em:p.lift>=3?C.gn:C.dm }}>Lift {p.lift}x</span>
                  </div>
                  <div style={{ marginTop:4 }}><PBar value={p.cooc} color={p.lift>=4?C.em:C.ac} /></div>
                </div>
              ))}
            </Card>
          </G>
        </div>
      )}

      {view==="affinity" && (
        <div>
          <G cols="repeat(auto-fit,minmax(130px,1fr))">
            <KPI label="Usuarios multi-marca" value={fmt(ds(5580,scale))} sub="participaron en 2+ marcas" color={C.ac} i={0} />
            <KPI label="Overlap máximo"       value="22%"  sub="Sushi Itto ∩ Nutrisa" color={C.em} i={1} />
            <KPI label="Datos exclusivos" value="100%" sub="solo JALO puede cruzarlos" color={C.gn} i={2} />
            <KPI label="Oportunidad" value="$MXN" sub="co-marketing cross-brand" color={C.or} i={3} demo />
          </G>

          {/* Brand affinity matrix visual */}
          <Card title="Solape de audiencia entre marcas JALO — usuarios compartidos"
            src="redemptions GROUP BY user_id → brand_id HAVING COUNT(DISTINCT brand_id) >= 2">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:8 }}>
              {BRAND_AFFINITY.map((ba,i)=>(
                <div key={i} style={{ background:C.surface, borderRadius:10, padding:"14px 16px",
                  borderLeft:`3px solid ${COLORS_CYCLE[i%6]}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:C.ac }}>{ba.b1}</span>
                      <span style={{ fontSize:12, color:C.mt, margin:"0 8px" }}>∩</span>
                      <span style={{ fontSize:11, fontWeight:700, color:C.gn }}>{ba.b2}</span>
                    </div>
                    <span style={{ fontSize:9, background:`${COLORS_CYCLE[i%6]}18`,
                      color:COLORS_CYCLE[i%6], padding:"2px 8px", borderRadius:4,
                      fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>
                      {ba.pct}% overlap
                    </span>
                  </div>
                  <PBar value={ba.pct} max={30} color={COLORS_CYCLE[i%6]} />
                  <div style={{ fontSize:8, color:C.mt, marginTop:6 }}>
                    ~{fmt(ds(ba.n,scale))} usuarios visitaron ambas marcas en JALO
                  </div>
                  <div style={{ fontSize:8, color:C.ac, marginTop:4, fontWeight:600 }}>
                    💡 Oportunidad de co-marketing cross-brand
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Brand loyalty depth */}
          <Card title="Profundidad de lealtad — % usuarios que repiten experiencia por marca"
            src="redemptions GROUP BY user_id, brand_id → COUNT(DISTINCT experience_id) ≥ 2">
            <G cols="repeat(auto-fit,minmax(200px,1fr))" mb={0}>
              {DEMO_BRANDS.map((b,i)=>{
                const repeat=[34,28,22,19][i]
                const loyal=[18,12,8,5][i]
                const radar=[
                  [{ label:"Repeat",value:repeat*3 },{ label:"Loyal",value:loyal*5 },
                   { label:"Volumen",value:[70,65,50,45][i] },{ label:"Canje",value:[87,82,81,82][i] },
                   { label:"Viral",value:[42,28,22,15][i] }]
                ][0]
                return (
                  <div key={i} style={{ background:C.surface, borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <RadarSVG dims={radar} size={90} color={COLORS_CYCLE[i%6]} showLabels={false} />
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.tx }}>{b.name}</div>
                        <div style={{ fontSize:8, color:C.mt }}>{b.activeExp} exps activas</div>
                      </div>
                    </div>
                    <div style={{ marginBottom:7 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, marginBottom:2 }}>
                        <span style={{ color:C.mt }}>Repite experiencia</span>
                        <span style={{ color:C.ac, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{repeat}%</span>
                      </div>
                      <PBar value={repeat} color={C.ac} />
                    </div>
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, marginBottom:2 }}>
                        <span style={{ color:C.mt }}>Fiel (3+ exps)</span>
                        <span style={{ color:C.em, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{loyal}%</span>
                      </div>
                      <PBar value={loyal} color={C.em} />
                    </div>
                  </div>
                )
              })}
            </G>
          </Card>
        </div>
      )}
    </div>
  )
}


// ─── Panel Progresión de Misiones ────────────────────────────
function PanelProgresion() {
  const { scale } = useContext(DateCtx)

  const [selExp, setSelExp]         = useState(PROG_EXPERIENCES[0].id)
  const [searchQ, setSearchQ]       = useState("")
  const [filterSeg, setFilterSeg]   = useState("todos")   // todos | completo | progreso | sin_iniciar
  const [filterDept, setFilterDept] = useState("todos")
  const [sortBy, setSortBy]         = useState("avance")  // avance | nombre | dept | ultimaAct
  const [viewMode, setViewMode]     = useState("tabla")   // tabla | escalera | mision

  const exp  = PROG_EXPERIENCES.find(e => e.id === selExp) || PROG_EXPERIENCES[0]
  const all  = PROG_CACHE[exp.id] || []
  const nm   = exp.missions.length

  // ── Derived segments ───────────────────────────────────────
  const completos   = all.filter(u => u.isComplete)
  const enProgreso  = all.filter(u => u.inProgress)
  const sinIniciar  = all.filter(u => u.neverStarted)
  const pctComplete = Math.round(completos.length / all.length * 100)
  const pctProgress = Math.round(enProgreso.length / all.length * 100)
  const pctNone     = Math.round(sinIniciar.length / all.length * 100)
  const avgAdvance  = all.reduce((a,u) => a + u.completedN, 0) / all.length

  // ── Per-mission completion counts ──────────────────────────
  const missionStats = exp.missions.map(m => ({
    ...m,
    completed:  all.filter(u => u.completed.includes(m.order)).length,
    pct: Math.round(all.filter(u => u.completed.includes(m.order)).length / all.length * 100),
    notYet: all.filter(u =>
      u.completed.length >= m.order - 1 && !u.completed.includes(m.order)
    ).length,
  }))

  // ── Staircase levels (users at exactly each stage) ─────────
  const stairLevels = Array.from({length: nm + 1}, (_, n) =>
    all.filter(u => u.completedN === n)
  )

  // ── Departments list ───────────────────────────────────────
  const allDepts = [...new Set(all.map(u => u.dept))].sort()

  // ── Filtered + sorted participants ────────────────────────
  const filtered = all
    .filter(u => {
      if (filterSeg === "completo"    && !u.isComplete)   return false
      if (filterSeg === "progreso"    && !u.inProgress)   return false
      if (filterSeg === "sin_iniciar" && !u.neverStarted) return false
      if (filterDept !== "todos" && u.dept !== filterDept) return false
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase()
        if (!u.name.toLowerCase().includes(q) &&
            !u.email.toLowerCase().includes(q) &&
            !u.dept.toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "avance")     return b.completedN - a.completedN
      if (sortBy === "nombre")     return a.name.localeCompare(b.name)
      if (sortBy === "dept")       return a.dept.localeCompare(b.dept)
      if (sortBy === "ultimaAct")  return (a.daysAgo ?? 999) - (b.daysAgo ?? 999)
      return 0
    })

  // ── Colors by segment ──────────────────────────────────────
  const segColor = (u) => u.isComplete ? C.gn : u.inProgress ? C.ac : C.mt
  const segLabel = (u) => u.isComplete ? "Completo" : u.inProgress ? "En progreso" : "Sin iniciar"

  // ── Mission type icon ──────────────────────────────────────
  const mTypeColor = {
    CODE: C.gn, TRIVIA: C.ac, SURVEY: C.pr, GAME: C.cy,
    "CHECK-IN": C.yl, REFERRAL: C.em, PURCHASE: C.or, VIDEO: C.pk,
  }

  return (
    <div>
      {/* ── Header: Exp selector ── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
        {PROG_EXPERIENCES.map(e => (
          <button key={e.id} onClick={() => { setSelExp(e.id); setSearchQ(""); setFilterSeg("todos"); setFilterDept("todos") }}
            style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer",
              background: selExp === e.id ? C.ac : C.bd,
              color: selExp === e.id ? "#fff" : C.mt,
              fontSize:10, fontWeight:700, fontFamily:"inherit", transition:"all .15s" }}>
            {e.name}
          </button>
        ))}
      </div>

      {/* ── KPI Row ── */}
      <G cols="repeat(auto-fit,minmax(130px,1fr))">
        <KPI label="Total esperados"  value={all.length} sub={`${exp.brand} · empleados`} color={C.dm} i={0} />
        <KPI label="Completaron todo" value={completos.length}  sub={`${pctComplete}% del padrón`}  color={C.gn} delta={`${pctComplete}%`} i={1} />
        <KPI label="En progreso"      value={enProgreso.length} sub={`${pctProgress}% participando`} color={C.ac} i={2} />
        <KPI label="Sin iniciar"      value={sinIniciar.length} sub={`${pctNone}% no han entrado`}   color={C.rd} i={3} />
        <KPI label="Avance promedio"  value={`${avgAdvance.toFixed(1)}/${nm}`} sub="misiones/usuario" color={C.cy} i={4} />
        <KPI label="Misiones totales" value={nm} sub="en esta experiencia" color={C.pr} i={5} />
      </G>

      {/* ── Segment donut + global progress ── */}
      <G cols="auto 1fr" gap={14}>
        <Card style={{ minWidth:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
          <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
            <Donut size={140} thick={18}
              segs={[
                { v: completos.length,  c: C.gn },
                { v: enProgreso.length, c: C.ac },
                { v: sinIniciar.length, c: `${C.rd}60` },
              ]}
              label={`${pctComplete}%`}
            />
          </div>
          <div style={{ width:"100%" }}>
            {[
              { label:"Completo",    n:completos.length,  pct:pctComplete, color:C.gn },
              { label:"En progreso", n:enProgreso.length, pct:pctProgress, color:C.ac },
              { label:"Sin iniciar", n:sinIniciar.length, pct:pctNone,     color:C.rd },
            ].map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                <div style={{ width:8, height:8, borderRadius:2, flexShrink:0, background:s.color }} />
                <span style={{ fontSize:9, color:C.dm, flex:1 }}>{s.label}</span>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                  fontWeight:700, color:s.color }}>{s.n}</span>
                <span style={{ fontSize:8, color:C.mt, width:28, textAlign:"right" }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={`Avance por misión — ${exp.name}`}
          src="redemptions GROUP BY user_id → SPLIT_PART(coupon_code,':',1) mapped to experience_missions.order_index">
          {missionStats.map((m, i) => {
            const dropPct = i > 0 ? Math.round((1 - m.pct / missionStats[i-1].pct) * 100) : 0
            const barColor = mTypeColor[m.type] || C.ac
            return (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  {/* Order bubble */}
                  <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0,
                    background:`${barColor}22`, border:`1.5px solid ${barColor}`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:11 }}>{m.icon}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:C.tx }}>{m.name}</span>
                        <span style={{ fontSize:8, padding:"1px 5px", borderRadius:3,
                          background:`${barColor}15`, color:barColor,
                          fontFamily:"'JetBrains Mono',monospace" }}>{m.type}</span>
                        {m.req && <span style={{ fontSize:7, padding:"1px 5px", borderRadius:3,
                          background:`${C.or}15`, color:C.or, fontWeight:700 }}>OBLIGATORIA</span>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {i > 0 && (
                          <span style={{ fontSize:8, fontFamily:"'JetBrains Mono',monospace",
                            color:dropPct>30?C.rd:dropPct>15?C.or:C.mt }}>
                            ↓{dropPct}% drop
                          </span>
                        )}
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:800,
                          fontSize:13, color:barColor }}>{m.completed}</span>
                        <span style={{ fontSize:9, color:C.mt }}>/ {all.length}</span>
                        <span style={{ fontSize:10, fontWeight:700,
                          color:m.pct>=70?C.gn:m.pct>=45?C.yl:C.rd }}>{m.pct}%</span>
                      </div>
                    </div>
                    {/* Stacked bar: completed + notYet + nope */}
                    <div style={{ display:"flex", height:12, borderRadius:4, overflow:"hidden",
                      gap:1, marginTop:4 }}>
                      <div style={{ flex:m.completed, background:barColor, opacity:0.88 }} />
                      <div style={{ flex:Math.max(0, m.notYet), background:`${C.yl}55` }} />
                      <div style={{ flex:Math.max(0, all.length - m.completed - m.notYet),
                        background:`${C.bd}50` }} />
                    </div>
                    <div style={{ display:"flex", gap:12, marginTop:2, fontSize:7, color:C.mt }}>
                      <span style={{ color:barColor }}>■ Completaron {m.completed}</span>
                      {m.notYet > 0 && <span style={{ color:C.yl }}>■ Desbloqueada {m.notYet}</span>}
                      <span>■ No llegaron {all.length - m.completed - m.notYet}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      </G>

      {/* ── View toggle ── */}
      <div style={{ display:"flex", gap:4, marginBottom:12, flexWrap:"wrap" }}>
        {[
          { id:"tabla",    label:"👤 Lista de participantes" },
          { id:"escalera", label:"📊 Mapa de progresión" },
          { id:"mision",   label:"🎯 Vista por misión" },
        ].map(v => (
          <button key={v.id} onClick={() => setViewMode(v.id)} style={{
            padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer",
            background: viewMode === v.id ? C.ac : C.bd,
            color: viewMode === v.id ? "#fff" : C.mt,
            fontSize:10, fontWeight:700, fontFamily:"inherit", transition:"all .15s" }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          VIEW: Escalera de progresión
      ════════════════════════════════════════════════════ */}
      {viewMode === "escalera" && (
        <Card title="Escalera de progresión — ¿en qué misión está cada grupo?"
          src="redemptions GROUP BY user_id → COUNT(DISTINCT SPLIT_PART(coupon_code,':',1)) → distribuido por misión máxima alcanzada">
          {/* Step bars: each bar = users stuck at that level */}
          <div style={{ marginBottom:20 }}>
            {stairLevels.map((usersAtLevel, lvl) => {
              if (usersAtLevel.length === 0) return null
              const mission = lvl > 0 ? exp.missions[lvl - 1] : null
              const isComplete = lvl === nm
              const pctH = Math.round(usersAtLevel.length / all.length * 100)
              const barColor = isComplete ? C.gn : lvl === 0 ? C.rd : COLORS_CYCLE[(lvl - 1) % 6]
              return (
                <div key={lvl} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  {/* Level label */}
                  <div style={{ width:110, flexShrink:0, textAlign:"right" }}>
                    {isComplete ? (
                      <span style={{ fontSize:10, fontWeight:700, color:C.gn }}>✅ Completó todo</span>
                    ) : lvl === 0 ? (
                      <span style={{ fontSize:10, color:C.rd }}>❌ Sin iniciar</span>
                    ) : (
                      <div>
                        <span style={{ fontSize:9, color:barColor, fontWeight:700 }}>
                          {mission?.icon} Misión {lvl}
                        </span>
                        <div style={{ fontSize:8, color:C.mt }}>{mission?.name}</div>
                      </div>
                    )}
                  </div>
                  {/* Bar */}
                  <div style={{ flex:1, position:"relative" }}>
                    <div style={{ height:28, borderRadius:5, background:`${barColor}12`,
                      overflow:"hidden" }}>
                      <div style={{ width:`${Math.max(2, pctH)}%`, height:"100%",
                        background:barColor, opacity:0.75, transition:"width .7s cubic-bezier(.4,0,.2,1)" }} />
                    </div>
                    {/* Avatars (first 8) */}
                    <div style={{ position:"absolute", left:4, top:4, display:"flex", gap:2 }}>
                      {usersAtLevel.slice(0, 8).map((u, i) => (
                        <div key={i} title={u.name} style={{
                          width:20, height:20, borderRadius:"50%", flexShrink:0,
                          background:`linear-gradient(135deg,${u.grad[0]},${u.grad[1]})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          border:`1px solid ${C.bg}`, fontSize:8, fontWeight:700, color:"#fff" }}>
                          {u.name.charAt(0)}
                        </div>
                      ))}
                      {usersAtLevel.length > 8 && (
                        <div style={{ width:20, height:20, borderRadius:"50%",
                          background:C.bd, display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:7, color:C.mt, fontWeight:700 }}>
                          +{usersAtLevel.length - 8}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Count + pct */}
                  <div style={{ width:72, flexShrink:0, textAlign:"right" }}>
                    <div style={{ fontSize:18, fontWeight:900,
                      fontFamily:"'JetBrains Mono',monospace", color:barColor }}>
                      {usersAtLevel.length}
                    </div>
                    <div style={{ fontSize:8, color:C.mt }}>{pctH}%</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Department breakdown */}
          <div style={{ borderTop:`1px solid ${C.bd}`, paddingTop:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.dm, marginBottom:10 }}>
              Avance por departamento
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:8 }}>
              {allDepts.map(dept => {
                const deptUsers = all.filter(u => u.dept === dept)
                const dComplete = deptUsers.filter(u => u.isComplete).length
                const dProgress = deptUsers.filter(u => u.inProgress).length
                const dNone     = deptUsers.filter(u => u.neverStarted).length
                const dPct = Math.round(dComplete / deptUsers.length * 100)
                return (
                  <div key={dept} style={{ background:C.surface, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:10, fontWeight:600, color:C.tx }}>{dept}</span>
                      <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                        fontWeight:700, color:dPct>=70?C.gn:dPct>=40?C.ac:C.rd }}>{dPct}%</span>
                    </div>
                    {/* Stacked mini bar */}
                    <div style={{ display:"flex", height:7, borderRadius:3, overflow:"hidden", gap:0.5 }}>
                      <div style={{ flex:dComplete, background:C.gn }} />
                      <div style={{ flex:dProgress, background:C.ac, opacity:0.7 }} />
                      <div style={{ flex:dNone, background:`${C.rd}40` }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:8, color:C.mt }}>
                      <span>{deptUsers.length} personas</span>
                      <span style={{ color:C.gn }}>{dComplete} ✅</span>
                      <span style={{ color:C.rd }}>{dNone} ❌</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════
          VIEW: Por misión individual
      ════════════════════════════════════════════════════ */}
      {viewMode === "mision" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
            {missionStats.map((m, mi) => {
              const barColor = mTypeColor[m.type] || C.ac
              // Users at this specific mission (completed it and NOT the next)
              const completedThis = all.filter(u => u.completed.includes(m.order))
              const stuckHere = all.filter(u =>
                u.completed.includes(m.order) && !u.completed.includes(m.order + 1) && m.order < nm
              )
              const notStarted = all.filter(u => !u.completed.includes(m.order))
              return (
                <div key={mi} style={{ background:`linear-gradient(135deg,${C.card},${C.alt})`,
                  border:`1px solid ${selExp&&mi===0?barColor:C.bd}`, borderRadius:12,
                  padding:"14px 16px", position:"relative", overflow:"hidden" }}>
                  {/* Top color stripe */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
                    background:barColor, opacity:0.8 }} />
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%",
                      background:`${barColor}18`, border:`1.5px solid ${barColor}`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                      {m.icon}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.tx }}>{m.name}</div>
                      <div style={{ display:"flex", gap:4, marginTop:2 }}>
                        <span style={{ fontSize:8, padding:"1px 5px", borderRadius:3,
                          background:`${barColor}15`, color:barColor,
                          fontFamily:"'JetBrains Mono',monospace" }}>{m.type}</span>
                        {m.req && <span style={{ fontSize:7, padding:"1px 5px", borderRadius:3,
                          background:`${C.or}15`, color:C.or, fontWeight:700 }}>OBLIGATORIA</span>}
                        <span style={{ fontSize:7, padding:"1px 5px", borderRadius:3,
                          background:C.surface, color:C.mt }}>Orden {m.order}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gauge of completion */}
                  <Gauge value={m.pct} size={90} color={m.pct>=70?C.gn:m.pct>=45?C.yl:C.rd}
                    label={`${m.completed} de ${all.length}`} />

                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:9 }}>
                      <span style={{ color:C.mt }}>Completaron</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                        color:C.gn }}>{m.completed} ({m.pct}%)</span>
                    </div>
                    {mi < nm - 1 && (
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9 }}>
                        <span style={{ color:C.mt }}>Desbloqueada, pendiente</span>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace",
                          color:C.yl }}>{stuckHere.length}</span>
                      </div>
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:9 }}>
                      <span style={{ color:C.mt }}>No llegaron aún</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace",
                        color:C.rd }}>{notStarted.length}</span>
                    </div>
                  </div>

                  {/* Completion bar */}
                  <div style={{ marginTop:10 }}>
                    <PBar value={m.pct} color={m.pct>=70?C.gn:m.pct>=45?C.yl:C.rd} h={7} />
                  </div>

                  {/* Avatars of last completers */}
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:8, color:C.mt, marginBottom:4 }}>
                      Últimos en completar:
                    </div>
                    <div style={{ display:"flex", gap:3 }}>
                      {completedThis.slice(-6).reverse().map((u, i) => (
                        <div key={i} title={`${u.name} (${u.dept})`} style={{
                          width:22, height:22, borderRadius:"50%",
                          background:`linear-gradient(135deg,${u.grad[0]},${u.grad[1]})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:8, fontWeight:700, color:"#fff",
                          border:`1.5px solid ${C.bg}` }}>
                          {u.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          VIEW: Lista individual de participantes
      ════════════════════════════════════════════════════ */}
      {viewMode === "tabla" && (
        <Card title={`Participantes — ${filtered.length} de ${all.length} (filtrado)`}
          src="auth.users JOIN redemptions GROUP BY user_id → mission progress per user · LEFT JOIN employee_list">
          {/* Filters row */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
            {/* Search */}
            <div style={{ position:"relative", flex:1, minWidth:160 }}>
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Buscar nombre, email, depto..."
                style={{ width:"100%", padding:"6px 10px 6px 28px",
                  background:C.surface, border:`1px solid ${C.bd}`, borderRadius:7,
                  color:C.tx, fontSize:10, fontFamily:"'Outfit',sans-serif",
                  outline:"none", boxSizing:"border-box" }} />
              <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)",
                fontSize:11, color:C.mt }}>🔍</span>
            </div>

            {/* Segment filter */}
            <div style={{ display:"flex", gap:3 }}>
              {[
                { id:"todos",       label:"Todos",       n:all.length },
                { id:"completo",    label:"Completó",    n:completos.length },
                { id:"progreso",    label:"En progreso", n:enProgreso.length },
                { id:"sin_iniciar", label:"Sin iniciar", n:sinIniciar.length },
              ].map(f => (
                <button key={f.id} onClick={() => setFilterSeg(f.id)} style={{
                  padding:"5px 10px", borderRadius:6, border:"none", cursor:"pointer",
                  background: filterSeg === f.id ? C.ac : "transparent",
                  border: `1px solid ${filterSeg === f.id ? C.ac : C.bd}`,
                  color: filterSeg === f.id ? "#fff" : C.mt,
                  fontSize:9, fontWeight:700, fontFamily:"inherit",
                  transition:"all .12s" }}>
                  {f.label} ({f.n})
                </button>
              ))}
            </div>

            {/* Dept filter */}
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              style={{ padding:"5px 8px", background:C.surface, border:`1px solid ${C.bd}`,
                borderRadius:6, color:C.tx, fontSize:9, fontFamily:"'Outfit',sans-serif",
                cursor:"pointer", colorScheme:"dark" }}>
              <option value="todos">Todos los deptos</option>
              {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding:"5px 8px", background:C.surface, border:`1px solid ${C.bd}`,
                borderRadius:6, color:C.tx, fontSize:9, fontFamily:"'Outfit',sans-serif",
                cursor:"pointer", colorScheme:"dark" }}>
              <option value="avance">Ordenar: Mayor avance</option>
              <option value="ultimaAct">Ordenar: Actividad reciente</option>
              <option value="nombre">Ordenar: Nombre A-Z</option>
              <option value="dept">Ordenar: Departamento</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ overflowX:"auto", maxHeight:520, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
              <thead style={{ position:"sticky", top:0, zIndex:2 }}>
                <tr style={{ background:C.alt }}>
                  <th style={{ padding:"8px 10px", textAlign:"left", fontSize:9, color:C.mt,
                    fontWeight:700, borderBottom:`1px solid ${C.bd}`, whiteSpace:"nowrap" }}>
                    Participante
                  </th>
                  <th style={{ padding:"8px 8px", textAlign:"center", fontSize:9, color:C.mt,
                    fontWeight:700, borderBottom:`1px solid ${C.bd}` }}>Depto</th>
                  {exp.missions.map((m, mi) => (
                    <th key={mi} style={{ padding:"8px 6px", textAlign:"center", fontSize:9,
                      color:mTypeColor[m.type]||C.ac, fontWeight:700,
                      borderBottom:`1px solid ${C.bd}`, whiteSpace:"nowrap", minWidth:60 }}>
                      <div>{m.icon}</div>
                      <div style={{ fontSize:8, color:C.mt }}>{m.name}</div>
                    </th>
                  ))}
                  <th style={{ padding:"8px 8px", textAlign:"center", fontSize:9, color:C.mt,
                    fontWeight:700, borderBottom:`1px solid ${C.bd}`, whiteSpace:"nowrap" }}>
                    Avance
                  </th>
                  <th style={{ padding:"8px 8px", textAlign:"right", fontSize:9, color:C.mt,
                    fontWeight:700, borderBottom:`1px solid ${C.bd}`, whiteSpace:"nowrap" }}>
                    Última act.
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((u, ui) => (
                  <tr key={u.id}
                    style={{ background: ui % 2 === 0 ? `${C.surface}50` : "transparent",
                      borderBottom:`1px solid ${C.bd}15`,
                      transition:"background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.ac}08`}
                    onMouseLeave={e => e.currentTarget.style.background = ui % 2 === 0 ? `${C.surface}50` : "transparent"}>
                    {/* Name + avatar */}
                    <td style={{ padding:"7px 10px", whiteSpace:"nowrap" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0,
                          background:`linear-gradient(135deg,${u.grad[0]},${u.grad[1]})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:10, fontWeight:700, color:"#fff" }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:C.tx, fontSize:10 }}>{u.name}</div>
                          <div style={{ fontSize:8, color:C.mt }}>{u.state}</div>
                        </div>
                      </div>
                    </td>
                    {/* Dept */}
                    <td style={{ padding:"7px 8px", textAlign:"center" }}>
                      <span style={{ fontSize:8, padding:"2px 6px", borderRadius:3,
                        background:C.surface, color:C.dm }}>{u.dept}</span>
                    </td>
                    {/* Mission checkboxes */}
                    {exp.missions.map((m, mi) => {
                      const done = u.completed.includes(m.order)
                      const unlocked = u.completedN >= m.order - 1
                      const barColor = mTypeColor[m.type] || C.ac
                      return (
                        <td key={mi} style={{ padding:"7px 6px", textAlign:"center" }}>
                          <div style={{ width:26, height:26, borderRadius:6, margin:"0 auto",
                            background: done ? `${barColor}22` : unlocked ? `${C.yl}12` : `${C.bd}30`,
                            border: `1.5px solid ${done ? barColor : unlocked ? C.yl : C.bd}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            title: done ? "Completada" : unlocked ? "Desbloqueada" : "No disponible" }}>
                            {done ? (
                              <span style={{ fontSize:13 }}>✅</span>
                            ) : unlocked ? (
                              <span style={{ fontSize:13 }}>🔓</span>
                            ) : (
                              <span style={{ fontSize:13 }}>🔒</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                    {/* Progress bar + count */}
                    <td style={{ padding:"7px 8px", textAlign:"center", minWidth:80 }}>
                      <div style={{ marginBottom:3 }}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:800,
                          fontSize:12, color:segColor(u) }}>{u.completedN}</span>
                        <span style={{ fontSize:8, color:C.mt }}>/{nm}</span>
                      </div>
                      <PBar value={u.completedN} max={nm} color={segColor(u)} h={4} />
                    </td>
                    {/* Last activity */}
                    <td style={{ padding:"7px 8px", textAlign:"right", whiteSpace:"nowrap" }}>
                      {u.lastActivity ? (
                        <span style={{ fontSize:9,
                          color:u.daysAgo===0?C.gn:u.daysAgo<=3?C.ac:u.daysAgo<=7?C.yl:C.mt }}>
                          {u.lastActivity}
                        </span>
                      ) : (
                        <span style={{ fontSize:8, color:C.rd }}>nunca</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <div style={{ textAlign:"center", padding:"10px 0", fontSize:9, color:C.mt }}>
                Mostrando primeros 200 de {filtered.length} resultados
              </div>
            )}
            {filtered.length === 0 && (
              <div style={{ textAlign:"center", padding:"30px 0", color:C.mt, fontSize:11 }}>
                Sin resultados con los filtros actuales
              </div>
            )}
          </div>

          {/* Summary footer */}
          <div style={{ display:"flex", gap:8, marginTop:12, paddingTop:10,
            borderTop:`1px solid ${C.bd}20`, flexWrap:"wrap" }}>
            <div style={{ fontSize:8, color:C.mt }}>✅ = Completada</div>
            <div style={{ fontSize:8, color:C.mt }}>🔓 = Desbloqueada, pendiente</div>
            <div style={{ fontSize:8, color:C.mt }}>🔒 = No disponible aún (secuencial)</div>
            <div style={{ flex:1 }} />
            <div style={{ fontSize:8, color:C.mt, fontStyle:"italic" }}>
              Fuente: redemptions GROUP BY user_id → SPLIT_PART(coupon_code,':',1) mapped to
              experience_missions.order_index · LEFT JOIN employee_list ON email
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Experience Overlay ───────────────────────────────────────
function ExpOverlay({ exp, onClose }) {
  if (!exp) return null
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:1000,
      display:"flex", justifyContent:"flex-end", backdropFilter:"blur(6px)" }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ width:"min(680px,92vw)", height:"100vh", overflowY:"auto",
          background:C.bg, borderLeft:`1px solid ${C.bda}`, padding:"24px 28px" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:9, color:C.mt, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>
              Detalle de Experiencia
            </div>
            <h2 style={{ fontSize:20, fontWeight:900, margin:0 }}>{exp.name}</h2>
            <div style={{ fontSize:10, color:C.mt, marginTop:4 }}>
              {exp.brand} · {exp.rewardType} · {exp.markers} markers · {exp.start} → {exp.end}
              {exp.daysLeft>0&&<span style={{ color:C.gn, marginLeft:8 }}>{exp.daysLeft}d restantes</span>}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:C.bd, border:"none", borderRadius:8, width:32, height:32,
              color:C.tx, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={14} />
          </button>
        </div>

        {/* KPIs */}
        <G cols="repeat(auto-fit,minmax(110px,1fr))" mb={14}>
          <div style={{ background:C.card, border:`1px solid ${C.bd}`, borderRadius:10,
            padding:10, display:"flex", alignItems:"center", gap:8 }}>
            <Ring value={exp.health} size={36} stroke={3} color={exp.health>=70?C.gn:exp.health>=50?C.or:C.rd} />
            <div>
              <div style={{ fontSize:15, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>{exp.health}%</div>
              <div style={{ fontSize:7, color:C.mt }}>Health score</div>
            </div>
          </div>
          <KPI label="Usuarios" value={fmt(exp.users)} i={0} />
          <KPI label="Completions" value={fmt(exp.completions)} i={1} />
          <KPI label="Tasa" value={pct(exp.compRate)} color={exp.compRate>=60?C.gn:C.or} i={2} />
          <KPI label="Claim rate" value={pct(exp.rewardConv.pct)} color={C.cy} i={3} />
        </G>

        {/* Mission drop-off */}
        <Card title="Mission drop-off" style={{ marginBottom:12 }}
          src="redemptions GROUP BY coupon_code prefix ORDER BY instance">
          {exp.dropoff.map((v,i)=>(
            <div key={i} style={{ marginBottom:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:3 }}>
                <span style={{ color:C.dm }}>
                  M{i+1}{exp.missionBreakdown[i]?": "+exp.missionBreakdown[i].name:""}
                </span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
                  {fmt(v)}
                  {i>0&&<span style={{ color:C.or, marginLeft:6 }}>
                    ↓{Math.round((1-v/exp.dropoff[i-1])*100)}%
                  </span>}
                </span>
              </div>
              <PBar value={v} max={exp.dropoff[0]} color={i===0?C.ac:v/exp.dropoff[0]>0.6?C.gn:C.or} />
            </div>
          ))}
        </Card>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <Card title={`Misiones (${exp.missionBreakdown.length})`}
            src="redemptions SPLIT_PART(coupon_code,':',1)">
            {exp.missionBreakdown.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding:"5px 0", borderBottom:`1px solid ${C.bd}10`, fontSize:10 }}>
                <span style={{ color:C.dm }}>{m.name}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>
                  {fmt(m.completions)}
                  {m.pending!=null&&<span style={{ color:C.yl, marginLeft:5 }}>{m.pending}p</span>}
                  {m.pending!=null&&<span style={{ color:C.rd, marginLeft:4 }}>{m.rejected}r</span>}
                </span>
              </div>
            ))}
          </Card>
          <Card title={exp.leaderboard?"Leaderboard 🏆":exp.winners?"Ganadores":"Claim rate"}>
            {exp.leaderboard&&exp.leaderboard.map((e,i)=>(
              <Row key={i} label={["🥇","🥈","🥉"][i]+" "+e.name}
                value={fmt(e.points)+" pts"} sub={e.state} color={i===0?C.yl:C.tx} />
            ))}
            {exp.winners&&exp.winners.map((w,i)=>(
              <Row key={i} label={"🏆 "+w.name} value={w.state} color={C.yl} />
            ))}
            {!exp.leaderboard&&!exp.winners&&(
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <Ring value={exp.rewardConv.pct} size={36} stroke={3}
                    color={exp.rewardConv.pct>=80?C.gn:C.or} />
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
                      {pct(exp.rewardConv.pct)}
                    </div>
                    <div style={{ fontSize:8, color:C.mt }}>claim rate</div>
                  </div>
                </div>
                <Row label="Canjearon" value={fmt(exp.rewardConv.claimed)} color={C.gn} />
                <Row label="Elegibles" value={fmt(exp.rewardConv.total)} />
              </>
            )}
          </Card>
        </div>

        <Card title="Embajadores (top referrers)" src="referrals GROUP BY referred_by_user_id ORDER BY COUNT DESC">
          {exp.ambassadors.map((a,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${C.bd}10` }}>
              <span style={{ fontSize:10, color:i===0?C.em:C.dm }}>
                {i===0?"👑 ":""}{a.name}
              </span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11,
                fontWeight:700, color:C.em }}>{a.refs} referidos</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ─── Brand Overlay ────────────────────────────────────────────
function BrandOverlay({ brand, allExp, onClose, onExpClick }) {
  if (!brand) return null
  const brandExps = allExp.filter(e => e.brandId === brand.id)
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:900,
      display:"flex", justifyContent:"flex-end", backdropFilter:"blur(6px)" }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ width:"min(600px,90vw)", height:"100vh", overflowY:"auto",
          background:C.bg, borderLeft:`1px solid ${C.bda}`, padding:"24px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:9, color:C.mt, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Marca</div>
            <h2 style={{ fontSize:20, fontWeight:900, margin:0 }}>{brand.name}</h2>
            <div style={{ fontSize:10, color:C.mt, marginTop:4 }}>
              {brand.activeExp}/{brand.totalExp} exp activas · {brand.markers} markers
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:C.bd, border:"none", borderRadius:8, width:32, height:32,
              color:C.tx, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={14} />
          </button>
        </div>
        <G cols="repeat(auto-fit,minmax(110px,1fr))" mb={14}>
          <KPI label="Participaciones" value={fmt(brand.redemptions)} i={0} />
          <KPI label="Usuarios" value={fmt(brand.users)} i={1} />
          <KPI label="Nuevos" value={fmt(brand.newUsers)} color={C.cy} i={2} />
          <KPI label="Retorno" value={pct(brand.returnRate)} color={brand.returnRate>=25?C.gn:C.or} demo i={3} />
          <KPI label="Part/usuario" value={brand.partPerUser.toFixed(2)} color={C.ac} i={4} />
        </G>
        <Card title="Experiencias" src="experiences WHERE brand_id = X">
          {brandExps.map((e,i)=>(
            <div key={i} onClick={()=>{onClose();setTimeout(()=>onExpClick(e),80)}}
              style={{ background:C.card, border:`1px solid ${C.bd}`, borderRadius:8,
                padding:"10px 14px", marginBottom:6, cursor:"pointer",
                transition:"border-color .12s" }}
              onMouseEnter={el=>el.currentTarget.style.borderColor=C.bda}
              onMouseLeave={el=>el.currentTarget.style.borderColor=C.bd}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontWeight:600, fontSize:11 }}>{e.name} <span style={{ fontSize:8, color:C.ac }}>↗</span></span>
                <Badge text={`${e.health}%`} color={e.health>=70?C.gn:C.or} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4, fontSize:9 }}>
                {[["Users",fmt(e.users)],["Comp",fmt(e.completions)],
                  ["Rate",pct(e.compRate)],["Claim",pct(e.rewardConv.pct)]].map(([l,v],j)=>(
                  <div key={j}><span style={{ color:C.mt }}>{l}</span>
                    <div style={{ fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────

const DATE_PRESETS = [
  { label:"7d",  days:7  },
  { label:"1m",  days:30 },
  { label:"3m",  days:90 },
  { label:"6m",  days:180},
]

export default function JALODashboard() {
  const [ready, setReady] = useState(false)
  const [splash, setSplash] = useState(true)
  const [role, setRole] = useState("super")
  const [activePanel, setActivePanel] = useState("sc")
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(6)
  const [detailExp, setDetailExp] = useState(null)
  const [detailBrand, setDetailBrand] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timestamp] = useState(() => new Date().toLocaleString("es-MX", { timeZone:"America/Mexico_City",
    day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }))
  const timerRef = useRef(null)
  const rootRef = useRef(null)

  // ── Date range state ──────────────────────────────────────
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])
  const [dateEnd, setDateEnd] = useState(todayStr)
  const [dateStart, setDateStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split("T")[0]
  })
  const [activePreset, setActivePreset] = useState("3m")

  const applyPreset = (preset) => {
    setActivePreset(preset.label)
    const e = new Date()
    const s = new Date(); s.setDate(s.getDate() - preset.days)
    setDateEnd(e.toISOString().split("T")[0])
    setDateStart(s.toISOString().split("T")[0])
  }

  const dateRange = useMemo(() => {
    const s = new Date(dateStart), e = new Date(dateEnd)
    const days = Math.max(1, Math.round((e - s) / 86400000))
    const scale = Math.min(1, days / 90)
    const chartDays = Math.min(30, days)
    return { days, scale, chartDays, start: dateStart, end: dateEnd }
  }, [dateStart, dateEnd])

  // Clear preset label if user picks custom dates
  const handleDateChange = (field, val) => {
    setActivePreset("")
    if (field === "start") setDateStart(val)
    else setDateEnd(val)
  }

  // ── Fullscreen ────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      rootRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setSplash(false); setTimeout(() => setReady(true), 200) }, 2200)
    return () => clearTimeout(t)
  }, [])

  const visiblePanels = useMemo(() => PANELS.filter(p => p.roles.includes(role)), [role])
  const visibleBrands = role === "client" ? DEMO_BRANDS.slice(0,1) : DEMO_BRANDS
  const visibleExp = role === "client"
    ? DEMO_EXPERIENCES.filter(e => e.brandId === visibleBrands[0]?.id)
    : DEMO_EXPERIENCES
  const clientBrand = role === "client" ? visibleBrands[0] : null

  // Auto-advance player — usa visiblePanels memoizado
  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setActivePanel(prev => {
        const i = visiblePanels.findIndex(p => p.id === prev)
        return visiblePanels[(i + 1) % visiblePanels.length].id
      })
    }, speed * 1000)
    return () => clearInterval(timerRef.current)
  }, [playing, speed, visiblePanels])

  // Reset panel when role changes
  useEffect(() => {
    const panels = PANELS.filter(p=>p.roles.includes(role))
    if (!panels.find(p=>p.id===activePanel)) setActivePanel(panels[0].id)
    setDetailExp(null); setDetailBrand(null)
  }, [role])

  const navigate = (dir) => {
    const i = visiblePanels.findIndex(p => p.id === activePanel)
    setActivePanel(visiblePanels[(i + dir + visiblePanels.length) % visiblePanels.length].id)
    setPlaying(false)
  }

  const renderPanel = () => {
    switch (activePanel) {
      case "sc": return <PanelScorecard role={role} visibleExp={visibleExp} visibleBrands={visibleBrands} />
      case "bz": return <PanelBusiness />
      case "fn": return <PanelFunnel />
      case "gr": return <PanelGrowth />
      case "ar": return <PanelArquetipos />
      case "br": return <PanelBrands allBrands={visibleBrands} onBrandClick={setDetailBrand} />
      case "mb": return <PanelMiMarca brand={clientBrand} />
      case "ex": return <PanelExperiencias experiences={visibleExp} onExpClick={setDetailExp} />
      case "mi": return <PanelMisiones experiences={visibleExp} />
      case "mp": return <PanelMapa />
      case "au": return <PanelAudiencia />
      case "rw": return <PanelRecompensas experiences={visibleExp} />
      case "gm": return <PanelJuegos />
      case "vi": return <PanelViral />
      case "us": return <PanelUsuarios />
      case "rt": return <PanelRetail />
      case "dt": return <PanelDataIntel />
      case "tc": return <PanelTelecom />
      case "op": return <PanelOps />
      case "co": return <PanelConsumidores />
      case "pr": return <PanelProgresion />
      default:   return null
    }
  }

  return (
    <ReadyCtx.Provider value={ready}>
    <DateCtx.Provider value={dateRange}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#05080f}
        input[type="date"]{color-scheme:dark}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.7) brightness(1.4);cursor:pointer;opacity:.7}
        select option{background:#0c1220;color:#e2eaf6}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#05080f}
        ::-webkit-scrollbar-thumb{background:#162035;border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:#1e3050}
        @keyframes splash-bg{0%,80%{opacity:1}100%{opacity:0;pointer-events:none}}
        @keyframes splash-logo{0%{opacity:0;transform:scale(.85) translateY(8px)}
          40%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1.04)}}
        @keyframes pprog{from{width:0}to{width:100%}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes fade-in{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* Splash */}
      {splash && (
        <div style={{ position:"fixed", inset:0, zIndex:99999, background:C.bg,
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"splash-bg 2.4s ease forwards" }}>
          <div style={{ textAlign:"center", animation:"splash-logo 2.4s ease both" }}>
            <div style={{ fontSize:52, fontWeight:900, fontFamily:"'Outfit',sans-serif",
              letterSpacing:-3, background:`linear-gradient(135deg,${C.ac},${C.cy})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>JALO</div>
            <div style={{ fontSize:11, color:C.mt, marginTop:6, letterSpacing:4,
              textTransform:"uppercase" }}>Reports Dashboard</div>
            <div style={{ fontSize:9, color:C.dm, marginTop:4 }}>
              27 tablas · 4 roles · data real vs proyectada
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      {detailExp && <ExpOverlay exp={detailExp} onClose={()=>setDetailExp(null)} />}
      {detailBrand && (
        <BrandOverlay brand={detailBrand} allExp={DEMO_EXPERIENCES}
          onClose={()=>setDetailBrand(null)} onExpClick={setDetailExp} />
      )}

      <div ref={rootRef} style={{ background:C.bg, color:C.tx, minHeight:"100vh",
        fontFamily:"'Outfit',system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
        {/* Noise layer */}
        <div style={{ position:"fixed", inset:0, opacity:0.022, pointerEvents:"none", zIndex:0,
          backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* ══ GLOBAL TOP BAR — fixed, full width, above sidebar + content ══ */}
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
          background:`${C.bg}f6`, backdropFilter:"blur(18px)",
          borderBottom:`1px solid ${C.bd}`,
          display:"flex", alignItems:"center", gap:6, padding:"0 12px",
          height:48, flexShrink:0 }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0,
            paddingRight:10, borderRight:`1px solid ${C.bd}`, marginRight:2 }}>
            <span style={{ fontSize:14, fontWeight:900, letterSpacing:-1,
              background:`linear-gradient(135deg,${C.ac},${C.cy})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>JALO</span>
            <span style={{ fontSize:8, color:C.mt }}>Reports</span>
          </div>

          {/* ── Date filter pill ── */}
          <div style={{ display:"flex", alignItems:"center", gap:3,
            background:C.card, border:`1px solid ${C.bd}`, borderRadius:8, padding:"5px 8px",
            flexShrink:0 }}>
            <Calendar size={10} color={C.mt} />
            {DATE_PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)} style={{
                padding:"3px 7px", borderRadius:5, border:"none", cursor:"pointer",
                background: activePreset===p.label ? C.ac : "transparent",
                color: activePreset===p.label ? "#fff" : C.mt,
                fontSize:10, fontWeight:700, fontFamily:"inherit",
                transition:"background .15s,color .15s" }}>{p.label}</button>
            ))}
            <div style={{ width:1, height:14, background:C.bd, margin:"0 2px" }} />
            <input type="date" value={dateStart} max={dateEnd}
              onChange={e => handleDateChange("start", e.target.value)}
              style={{ background:"transparent", border:"none", outline:"none",
                color:C.tx, fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                cursor:"pointer", padding:"2px 3px", colorScheme:"dark" }} />
            <span style={{ color:C.mt, fontSize:9 }}>→</span>
            <input type="date" value={dateEnd} min={dateStart} max={todayStr}
              onChange={e => handleDateChange("end", e.target.value)}
              style={{ background:"transparent", border:"none", outline:"none",
                color:C.tx, fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                cursor:"pointer", padding:"2px 3px", colorScheme:"dark" }} />
            <div style={{ padding:"2px 6px", borderRadius:4, fontSize:9, fontWeight:700,
              background:`${C.ac}18`, color:C.ac, fontFamily:"'JetBrains Mono',monospace",
              marginLeft:1 }}>{dateRange.days}d</div>
          </div>

          {/* ── Player controls pill ── */}
          <div style={{ display:"flex", alignItems:"center", gap:3,
            background:C.card, border:`1px solid ${playing?C.ac:C.bd}`, borderRadius:8,
            padding:"5px 8px", flexShrink:0,
            transition:"border-color .2s" }}>
            {/* Panel name */}
            <span style={{ fontSize:10, color:C.dm, fontWeight:600,
              maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {visiblePanels.find(p=>p.id===activePanel)?.label ?? ""}
            </span>
            <span style={{ fontSize:8, color:C.mt, fontFamily:"'JetBrains Mono',monospace", marginRight:2 }}>
              {visiblePanels.findIndex(p=>p.id===activePanel)+1}/{visiblePanels.length}
            </span>
            {/* Prev */}
            <button onClick={() => navigate(-1)} title="← Panel anterior"
              style={{ background:"transparent", border:`1px solid ${C.bd}`, borderRadius:5,
                color:C.dm, cursor:"pointer", width:24, height:24,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.bd;e.currentTarget.style.color=C.tx;e.currentTarget.style.borderColor=C.bda}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.dm;e.currentTarget.style.borderColor=C.bd}}>
              <ChevronLeft size={12}/>
            </button>
            {/* Play/Pause */}
            <button onClick={() => setPlaying(p => !p)} title={playing?"Pausar (Space)":"Reproducir (Space)"}
              style={{ background: playing ? C.ac : C.bd, border:"none", borderRadius:5,
                width:28, height:24, color:"#fff", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"background .2s", flexShrink:0 }}>
              {playing ? <Pause size={10}/> : <Play size={10}/>}
            </button>
            {/* Next */}
            <button onClick={() => navigate(1)} title="Panel siguiente →"
              style={{ background:"transparent", border:`1px solid ${C.bd}`, borderRadius:5,
                color:C.dm, cursor:"pointer", width:24, height:24,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.bd;e.currentTarget.style.color=C.tx;e.currentTarget.style.borderColor=C.bda}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.dm;e.currentTarget.style.borderColor=C.bd}}>
              <ChevronRight size={12}/>
            </button>
            {/* Speed — solo si está reproduciendo */}
            {playing && (
              <select value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{
                background:C.surface, border:`1px solid ${C.bd}`, borderRadius:5,
                padding:"3px 5px", color:C.tx, fontSize:9, cursor:"pointer",
                fontFamily:"inherit", marginLeft:2, colorScheme:"dark" }}>
                <option value={4}>4s</option>
                <option value={6}>6s</option>
                <option value={10}>10s</option>
                <option value={15}>15s</option>
              </select>
            )}
          </div>

          {/* Scale badge */}
          {dateRange.scale < 1 && (
            <div style={{ fontSize:8, color:C.demo, background:`${C.demo}12`,
              padding:"3px 7px", borderRadius:4, fontWeight:700, flexShrink:0 }}>
              ×{dateRange.scale.toFixed(2)}
            </div>
          )}

          <div style={{ flex:1 }} />

          {/* Fullscreen */}
          <button onClick={toggleFullscreen}
            title={isFullscreen ? "Salir pantalla completa" : "Pantalla completa"}
            style={{ background:C.card, border:`1px solid ${C.bd}`, borderRadius:8,
              width:32, height:32, color:isFullscreen?C.ac:C.mt, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              transition:"color .15s,border-color .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.ac;e.currentTarget.style.borderColor=C.bda}}
            onMouseLeave={e=>{e.currentTarget.style.color=isFullscreen?C.ac:C.mt;e.currentTarget.style.borderColor=C.bd}}>
            {isFullscreen ? <Minimize2 size={13}/> : <Maximize2 size={13}/>}
          </button>

          {/* Player progress — borde inferior del top bar */}
          {playing && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:C.bd }}>
              <div key={activePanel+String(speed)} style={{ height:"100%", background:C.ac,
                animation:`pprog ${speed}s linear` }} />
            </div>
          )}
        </div>

        {/* ══ BODY — sidebar + content, desplazado por el top bar fijo ══ */}
        <div style={{ display:"flex", flex:1, paddingTop:48, position:"relative", zIndex:1,
          minHeight:"calc(100vh - 48px)" }}>

          {/* Sidebar */}
          <div style={{ width:172, borderRight:`1px solid ${C.bd}`, padding:"14px 8px",
            overflowY:"auto", flexShrink:0, position:"sticky", top:48,
            height:"calc(100vh - 48px)", display:"flex", flexDirection:"column" }}>

            {/* Role selector */}
            <div style={{ marginBottom:12, padding:"0 2px" }}>
              <div style={{ fontSize:8, color:C.mt, textTransform:"uppercase",
                letterSpacing:0.8, marginBottom:5, paddingLeft:4 }}>Vista</div>
              {Object.entries(ROLES).map(([k,r])=>(
                <button key={k} onClick={()=>setRole(k)} style={{
                  display:"flex", alignItems:"center", gap:7, width:"100%",
                  padding:"6px 8px", marginBottom:2, border:"none", borderRadius:6,
                  background:role===k?`${r.color}12`:"transparent",
                  color:role===k?r.color:C.mt, fontWeight:role===k?700:400,
                  fontSize:10, cursor:"pointer", textAlign:"left",
                  fontFamily:"inherit", transition:"background .15s,color .15s" }}>
                  <r.icon size={12} />
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ height:1, background:C.bd, margin:"4px 4px 10px" }} />

            {/* Nav */}
            <div style={{ flex:1 }}>
              {visiblePanels.map(p=>(
                <button key={p.id} onClick={()=>{setActivePanel(p.id);setPlaying(false)}} style={{
                  display:"flex", alignItems:"center", gap:8, width:"100%",
                  padding:"7px 8px", marginBottom:1, border:"none", borderRadius:6,
                  background:activePanel===p.id?`${C.ac}0e`:"transparent",
                  color:activePanel===p.id?C.tx:C.mt,
                  fontWeight:activePanel===p.id?700:400,
                  fontSize:11, cursor:"pointer", textAlign:"left", fontFamily:"inherit",
                  borderLeft:activePanel===p.id?`2px solid ${C.ac}`:"2px solid transparent",
                  transition:"background .12s,color .12s" }}>
                  <p.icon size={13} color={activePanel===p.id?C.ac:C.mt} />
                  {p.label}
                </button>
              ))}
            </div>

            {/* Footer legend */}
            <div style={{ marginTop:8, padding:"10px 8px", borderTop:`1px solid ${C.bd}`, fontSize:8, color:C.mt }}>
              <div style={{ animation:"pulse 3s ease infinite", marginBottom:5,
                display:"flex", alignItems:"center", gap:4 }}>
                <RefreshCw size={8} color={C.mt} />
                <span>{timestamp}</span>
              </div>
              <div style={{ marginBottom:4, color:C.mt }}>27 tablas · 240 métricas</div>
              <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                <span style={{ background:`${C.gn}18`, color:C.gn, padding:"2px 5px",
                  borderRadius:3, fontSize:7, fontWeight:700 }}>REAL</span>
                <span style={{ background:`${C.demo}18`, color:C.demo, padding:"2px 5px",
                  borderRadius:3, fontSize:7, fontWeight:700 }}>PROYECTADO</span>
                <span style={{ background:`${C.ac}18`, color:C.ac, padding:"2px 5px",
                  borderRadius:3, fontSize:7, fontWeight:700 }}>DEMO</span>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div style={{ flex:1, overflowY:"auto" }}>

            {/* Panel header strip — sticky dentro del content */}
            <div style={{ padding:"11px 22px 9px", borderBottom:`1px solid ${C.bd}40`,
              background:`${C.surface}e0`, backdropFilter:"blur(8px)",
              position:"sticky", top:0, zIndex:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <h2 style={{ fontSize:15, fontWeight:800, margin:0, color:C.tx, lineHeight:1 }}>
                  {visiblePanels.find(p=>p.id===activePanel)?.label ?? ""}
                </h2>
                <span style={{ fontSize:9, color:C.mt }}>·</span>
                <span style={{ fontSize:9, color:C.dm }}>{ROLES[role].label}
                  {role==="client"&&clientBrand&&` · ${clientBrand.name}`}
                </span>
                <span style={{ fontSize:9, color:C.mt }}>·</span>
                <span style={{ fontSize:9, color:C.mt, fontFamily:"'JetBrains Mono',monospace" }}>
                  {new Date(dateStart).toLocaleDateString("es-MX",{day:"2-digit",month:"short"})}
                  {" → "}
                  {new Date(dateEnd).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"})}
                  <span style={{ color:C.mt, marginLeft:6 }}>({dateRange.days}d)</span>
                </span>
              </div>
            </div>

            {/* Panel content */}
            <div style={{ padding:"20px 22px", animation:"fade-in .2s ease" }} key={activePanel}>
              <div style={{ maxWidth:960, margin:"0 auto" }}>
                {renderPanel()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DateCtx.Provider>
    </ReadyCtx.Provider>
  )
}
