'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const NAV = [
  { href: '/dashboard',        icon: '📋', label: 'Documentos' },
  { href: '/dashboard/nuevo',  icon: '➕', label: 'Nuevo'      },
  { href: '/dashboard/perfil', icon: '👤', label: 'Perfil'     },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between no-print sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:'1.3rem',letterSpacing:'0.05em'}}>
            GRUPO MICSA
          </span>
          <span className="text-blue-300 text-xs hidden sm:inline">· Documentos</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded"
        >
          Salir →
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex no-print bottom-nav z-40">
        {NAV.map(item => {
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                active ? 'text-blue-800' : 'text-slate-400'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
