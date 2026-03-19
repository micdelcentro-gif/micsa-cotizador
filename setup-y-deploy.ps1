# =============================================================
#  MICSA DOCS — Setup completo + push a GitHub
#  Ejecutar: clic derecho → "Ejecutar con PowerShell"
#  O en terminal: .\setup-y-deploy.ps1
# =============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MICSA DOCS — Setup automatico" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Renombrar carpetas dinamicas de Next.js
Write-Host "► Renombrando carpetas de rutas dinamicas..." -ForegroundColor Yellow

$nuevoTipo = "src\app\dashboard\nuevo\__tipo__"
$nuevoTipoDest = "src\app\dashboard\nuevo\[tipo]"
$docId = "src\app\dashboard\doc\__id__"
$docIdDest = "src\app\dashboard\doc\[id]"

if (Test-Path $nuevoTipo) {
    Rename-Item -Path $nuevoTipo -NewName "[tipo]"
    Write-Host "  ✓ nuevo/__tipo__ → nuevo/[tipo]" -ForegroundColor Green
} elseif (Test-Path $nuevoTipoDest) {
    Write-Host "  ✓ nuevo/[tipo] ya existe" -ForegroundColor Green
} else {
    Write-Host "  ! No se encontro la carpeta nuevo/__tipo__" -ForegroundColor Red
}

if (Test-Path $docId) {
    Rename-Item -Path $docId -NewName "[id]"
    Write-Host "  ✓ doc/__id__ → doc/[id]" -ForegroundColor Green
} elseif (Test-Path $docIdDest) {
    Write-Host "  ✓ doc/[id] ya existe" -ForegroundColor Green
} else {
    Write-Host "  ! No se encontro la carpeta doc/__id__" -ForegroundColor Red
}

Write-Host ""

# 2. Crear .env.local
Write-Host "► Creando .env.local..." -ForegroundColor Yellow

$envPath = ".env.local"
if (Test-Path $envPath) {
    Write-Host "  ! .env.local ya existe, no se sobreescribira" -ForegroundColor DarkYellow
    Write-Host "  Verifica que tenga estos valores:" -ForegroundColor DarkYellow
    Write-Host "    NEXT_PUBLIC_SUPABASE_URL=https://cwfuuuriegqddmntpmqe.supabase.co" -ForegroundColor Gray
    Write-Host "    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ..." -ForegroundColor Gray
} else {
    # PEGA TU ANON KEY EN LA LINEA DE ABAJO (reemplaza TU_ANON_KEY_AQUI)
    $anonKey = "TU_ANON_KEY_AQUI"
    
    $envContent = @"
NEXT_PUBLIC_SUPABASE_URL=https://cwfuuuriegqddmntpmqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
"@
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Write-Host "  ✓ .env.local creado" -ForegroundColor Green
    
    if ($anonKey -eq "TU_ANON_KEY_AQUI") {
        Write-Host ""
        Write-Host "  ⚠️  IMPORTANTE: Edita .env.local y reemplaza TU_ANON_KEY_AQUI" -ForegroundColor Red
        Write-Host "     con tu anon key de Supabase (empieza con eyJ...)" -ForegroundColor Red
    }
}

Write-Host ""

# 3. npm install
Write-Host "► Instalando dependencias (npm install)..." -ForegroundColor Yellow
npm install
Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# 4. Git setup y push
Write-Host "► Configurando Git y subiendo a GitHub..." -ForegroundColor Yellow

# Verifica si ya hay un repo git
if (Test-Path ".git") {
    Write-Host "  ✓ Repositorio git ya existe" -ForegroundColor Green
} else {
    git init
    git remote add origin https://github.com/micdelcentro-gif/micsa-docs-app.git
    Write-Host "  ✓ Repositorio git inicializado" -ForegroundColor Green
}

# Verifica si el remote ya apunta al repo correcto
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl -ne "https://github.com/micdelcentro-gif/micsa-docs-app.git") {
    git remote set-url origin https://github.com/micdelcentro-gif/micsa-docs-app.git
}

# Crear .gitignore si no existe
if (-not (Test-Path ".gitignore")) {
    @"
node_modules/
.next/
.env.local
.env
*.log
.DS_Store
"@ | Set-Content -Path ".gitignore" -Encoding UTF8
    Write-Host "  ✓ .gitignore creado" -ForegroundColor Green
}

# Commit y push
git add .
git commit -m "feat: MICSA Docs completo - 10 tipos documento, foliado, fotos, Supabase"
git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ CODIGO SUBIDO A GITHUB" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repo: https://github.com/micdelcentro-gif/micsa-docs-app" -ForegroundColor Cyan
Write-Host ""
Write-Host "SIGUIENTE PASO — Vercel:" -ForegroundColor Yellow
Write-Host "  1. Ve a https://vercel.com/micdelcentro-gif/micsa-docs-app/settings/environment-variables" -ForegroundColor White
Write-Host "  2. Agrega estas 2 variables de entorno:" -ForegroundColor White
Write-Host "     NEXT_PUBLIC_SUPABASE_URL = https://cwfuuuriegqddmntpmqe.supabase.co" -ForegroundColor Gray
Write-Host "     NEXT_PUBLIC_SUPABASE_ANON_KEY = (tu key de Supabase)" -ForegroundColor Gray
Write-Host "  3. Ve a Deployments y haz clic en 'Redeploy'" -ForegroundColor White
Write-Host ""
Write-Host "SUPABASE — Correr los SQLs:" -ForegroundColor Yellow
Write-Host "  1. Ve a https://supabase.com/dashboard/project/cwfuuuriegqddmntpmqe/sql" -ForegroundColor White
Write-Host "  2. Corre supabase\schema.sql" -ForegroundColor White
Write-Host "  3. Corre supabase\folios.sql" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para cerrar"
