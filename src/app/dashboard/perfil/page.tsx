'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

const ROL_LABELS: Record<string, string> = {
  admin: '🔑 Administrador', gerente: '📊 Gerente Ops',
  supervisor: '👷 Supervisor', contabilidad: '🧾 Contabilidad', rh: '👥 RH',
}

export default function PerfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setNombre(data.nombre) }
    }
    load()
  }, [])

  async function save() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ nombre }).eq('id', profile.id)
    setMsg('✓ Guardado')
    setSaving(false)
    setTimeout(() => setMsg(''), 2000)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-lg font-bold text-slate-800 mb-6">Mi Perfil</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{nombre}</p>
            <p className="text-xs text-slate-500">{email}</p>
            <span className="text-xs text-blue-700 font-medium">{ROL_LABELS[profile?.rol || ''] || profile?.rol}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Correo</label>
          <input value={email} disabled className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400" />
        </div>

        {msg && <p className="text-green-600 text-sm font-medium">{msg}</p>}

        <button onClick={save} disabled={saving} className="w-full bg-blue-900 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>

        <button onClick={logout} className="w-full border border-red-200 text-red-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors">
          Cerrar sesión
        </button>
      </div>

      <p className="text-center text-slate-400 text-xs mt-6">MICSA Docs v1.0</p>
    </div>
  )
}
