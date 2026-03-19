'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import type { Documento, TipoDoc } from '@/types'

const TIPO_LABELS: Record<TipoDoc | string, { label: string; icon: string; color: string }> = {
  cotizacion:         { label: 'Cotización',         icon: '💼', color: 'bg-amber-100 text-amber-800' },
  bitacora:           { label: 'Bitácora Diaria',    icon: '📋', color: 'bg-blue-100 text-blue-800'  },
  costos_adicionales: { label: 'Costos Adicionales', icon: '➕', color: 'bg-green-100 text-green-800' },
  checklist_izaje:    { label: 'Checklist Izaje',    icon: '🔗', color: 'bg-red-100 text-red-800'    },
  orden_trabajo:      { label: 'Orden de Trabajo',   icon: '🔧', color: 'bg-purple-100 text-purple-800' },
  contrato:           { label: 'Contrato',           icon: '📜', color: 'bg-slate-100 text-slate-800' },
  requisicion:        { label: 'Requisición',        icon: '📦', color: 'bg-orange-100 text-orange-800' },
  entrega_epp:        { label: 'Entrega EPP',        icon: '🪖', color: 'bg-sky-100 text-sky-800'    },
  plan_izaje:         { label: 'Plan de Izaje',      icon: '🏗️', color: 'bg-teal-100 text-teal-800' },
  reporte_avance:     { label: 'Reporte Avance',     icon: '📊', color: 'bg-violet-100 text-violet-800' },
}

const ESTADO_COLORS: Record<string, string> = {
  borrador:  'bg-yellow-100 text-yellow-700',
  enviado:   'bg-blue-100 text-blue-700',
  aprobado:  'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    setLoading(true)
    const { data } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setDocs(data || [])
    setLoading(false)
  }

  const filtered = docs.filter(d => {
    const matchSearch = !search ||
      d.cliente_nombre?.toLowerCase().includes(search.toLowerCase()) ||
      d.folio?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !filterTipo || d.tipo === filterTipo
    return matchSearch && matchTipo
  })

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Mis Documentos</h2>
        <Link href="/dashboard/nuevo"
          className="bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
          + Nuevo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <input
          type="search"
          placeholder="Buscar cliente, folio…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          className="border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="">Todos</option>
          {Object.entries(TIPO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-2">📄</div>
          <p className="font-medium">Sin documentos</p>
          <p className="text-sm mt-1">
            <Link href="/dashboard/nuevo" className="text-blue-600 underline">Crea tu primer documento</Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(doc => {
            const meta = TIPO_LABELS[doc.tipo] || { label: doc.tipo, icon: '📄', color: 'bg-slate-100 text-slate-700' }
            return (
              <Link key={doc.id} href={`/dashboard/doc/${doc.id}`}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 transition-all active:scale-95">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_COLORS[doc.estado] || ''}`}>
                          {doc.estado}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 truncate">
                        {doc.cliente_nombre || 'Sin cliente'}
                      </p>
                      {doc.folio && (
                        <p className="text-xs text-slate-500">{doc.folio}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">{fmtDate(doc.created_at)}</p>
                      <p className="text-blue-600 text-sm mt-1">Ver →</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
