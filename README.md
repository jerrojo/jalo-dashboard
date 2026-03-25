# JALO Reports Dashboard

Dashboard de análisis y reportes para la plataforma JALO.  
Stack: React 18 + Vite + Recharts + Lucide React.

---

## Requisitos

- **Node.js** v18 o superior  
- **npm** v9 o superior

---

## Instalación y arranque

```bash
# 1. Entrar a la carpeta
cd jalo-dashboard

# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo (abre http://localhost:3000)
npm run dev
```

## Build para producción

```bash
npm run build
# Los archivos estáticos quedan en /dist
# Para previsualizar el build:
npm run preview
```

---

## Estructura del proyecto

```
jalo-dashboard/
├── index.html          ← Entry point HTML (fonts, meta)
├── vite.config.js      ← Config de Vite
├── package.json
└── src/
    ├── main.jsx        ← Monta React en #root
    └── Dashboard.jsx   ← Todo el dashboard (5,400+ líneas)
```

---

## Paneles disponibles (20)

| ID | Panel | Roles |
|----|-------|-------|
| SC | Scorecard | Todos |
| BZ | Business P&L | Super Admin |
| FN | Funnel completo | Todos |
| GR | Growth & Cohortes | SA + Admin |
| AR | Arquetipos conductuales | Todos |
| BR | Marcas | SA + Admin |
| MB | Mi Marca | Cliente |
| EX | Experiencias | Todos |
| MI | Misiones | Todos |
| MP | Mapa Físico | Todos |
| AU | Audiencia demográfica | SA + Admin |
| RW | Recompensas | Todos |
| GM | Juegos | SA + Admin |
| VI | Viral / K-Factor | Todos |
| US | Usuarios (Leaderboards) | SA + Admin |
| RT | Retail & Compras | Todos |
| DT | Data Intel (Encuestas) | Todos |
| TC | Telecom | Super Admin |
| OP | Ops & Validaciones | SA + Admin |
| CO | Consumidores (LTV) | SA + Admin |
| PR | Progresión de Misiones | Todos |

---

## Notas

- Los datos son **demo** generados en memoria.  
  Para conectar a Supabase: reemplazar los datos constantes en `Dashboard.jsx`  
  por llamadas a `supabase.from(...).select(...)` dentro de `useEffect`.
- El dashboard es completamente **client-side** — no necesita backend para correr.
- Todos los SQL de referencia están en `JALO_Panel_Queries.sql`.
