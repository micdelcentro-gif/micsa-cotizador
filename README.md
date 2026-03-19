# MICSA Docs — Setup Guide

App completa: Next.js + Supabase + Vercel
Login, roles, historial de documentos, fotos desde celular, impresión a PDF.

---

## PASO 1 — Supabase (base de datos + auth + fotos)

1. Ir a https://supabase.com → **New project**
2. Nombre: `micsa-docs` | Región: US East o más cercana
3. Guarda la contraseña del proyecto

### Crear tablas
4. Ir a **SQL Editor** → **New query**
5. Copiar y pegar todo el contenido de `supabase/schema.sql`
6. Click **Run**

### Crear bucket de fotos
7. Ir a **Storage** → **New bucket**
8. Nombre: `fotos-documentos` | ✅ Public bucket → **Save**
9. Ir a **Storage → Policies** → agregar estas 3 policies para el bucket `fotos-documentos`:
   - SELECT: `(bucket_id = 'fotos-documentos')`
   - INSERT: `(bucket_id = 'fotos-documentos' AND auth.uid() IS NOT NULL)`
   - DELETE: `(bucket_id = 'fotos-documentos' AND auth.uid() IS NOT NULL)`

### Obtener keys
10. Ir a **Project Settings → API**
11. Copiar:
    - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
    - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Crear usuarios
12. Ir a **Authentication → Users → Add user**
13. Crear un usuario por persona (email + contraseña)
14. Después ir a **Table Editor → profiles** y actualizar el `nombre` y `rol` de cada usuario
    - Roles disponibles: `admin`, `gerente`, `supervisor`, `contabilidad`, `rh`

---

## PASO 2 — Setup local

```bash
# Renombrar las carpetas con nombre dinámico (Next.js usa [brackets])
# En Windows PowerShell:
cd src/app/dashboard/nuevo
Rename-Item __tipo__ "[tipo]"
cd ../doc
Rename-Item __id__ "[id]"

# Instalar dependencias
npm install

# Crear .env.local con tus keys de Supabase
copy .env.local.example .env.local
# Editar .env.local con tus valores reales

# Correr en desarrollo
npm run dev
```

Abre http://localhost:3002

---

## PASO 3 — Deploy en Vercel

1. Subir el proyecto a GitHub (repo nuevo o existente)
2. Ir a https://vercel.com → **New Project** → importar el repo
3. En **Environment Variables** agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
4. Click **Deploy**

¡Listo! La app estará en `https://micsa-docs.vercel.app` (o el nombre que elijas)

---

## Estructura del proyecto

```
micsa-docs/
├── supabase/schema.sql          ← SQL para crear las tablas
├── middleware.ts                 ← Protección de rutas
├── src/
│   ├── lib/
│   │   ├── supabase-browser.ts  ← Cliente para componentes
│   │   ├── supabase-server.ts   ← Cliente para server components
│   │   └── constants.ts         ← Logo, colores, textos legales MICSA
│   ├── types/index.ts           ← TypeScript types
│   └── app/
│       ├── login/               ← Pantalla de login
│       └── dashboard/
│           ├── page.tsx         ← Lista de documentos
│           ├── layout.tsx       ← Nav + header
│           ├── nuevo/[tipo]/    ← Crear nuevo documento
│           ├── doc/[id]/        ← Ver / imprimir documento
│           └── perfil/          ← Perfil del usuario
```

## Tipos de documento disponibles

| Tipo | Descripción |
|------|-------------|
| `cotizacion` | Cotización Formal (formato COT-028 completo) |
| `bitacora` | Bitácora de Actividades Diarias |
| `costos_adicionales` | Alcance de Servicios Adicionales |
| `checklist_izaje` | Checklist de Izaje |
| `orden_trabajo` | Orden de Trabajo |
| `contrato` | Contrato de Servicios |
| `requisicion` | Requisición de Material |
| `entrega_epp` | Entrega de EPP |
| `plan_izaje` | Plan de Izaje |
| `reporte_avance` | Reporte de Avance |

## Funcionalidades

- ✅ Login seguro con Supabase Auth
- ✅ Roles: admin, gerente, supervisor, contabilidad, rh
- ✅ Guardar documentos en la nube
- ✅ Historial con búsqueda y filtros
- ✅ Fotos desde cámara del celular → Supabase Storage
- ✅ Generar PDF / imprimir desde cualquier dispositivo
- ✅ Logo real de Grupo MICSA en header y marca de agua
- ✅ Diseño mobile-first
- ✅ Funciona 100% en navegador (sin instalar nada)