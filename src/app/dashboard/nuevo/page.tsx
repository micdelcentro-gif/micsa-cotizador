'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TIPOS = [
  { id: 'cotizacion',         icon: '💼', label: 'Cotización Formal',     color: '#c8a84b' },
  { id: 'bitacora',           icon: '📋', label: 'Bitácora Diaria',       color: '#1a3a6b' },
  { id: 'costos_adicionales', icon: '➕', label: 'Costos Adicionales',    color: '#2d6a4f' },
  { id: 'checklist_izaje',    icon: '🔗', label: 'Checklist de Izaje',    color: '#d42b2b' },
  { id: 'orden_trabajo',      icon: '🔧', label: 'Orden de Trabajo',      color: '#6b46c1' },
  { id: 'contrato',           icon: '📜', label: 'Contrato de Servicios', color: '#0a1628' },
  { id: 'requisicion',        icon: '📦', label: 'Requisición Material',  color: '#c05621' },
  { id: 'entrega_epp',        icon: '🪖', label: 'Entrega de EPP',        color: '#2b6cb0' },
  { id: 'plan_izaje',         icon: '🏗️', label: 'Plan de Izaje',        color: '#276749' },
  { id: 'reporte_avance',     icon: '📊', label: 'Reporte de Avance',     color: '#553c9a' },
]

export default function NuevoPage() {
  const router = useRouter()

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 text-xl">←</button>
        <h2 className="text-lg font-bold text-slate-800">Nuevo Documento</h2>
      </div>

      <p className="text-sm text-slate-500 mb-4">Selecciona el tipo de documento:</p>

      <div className="grid grid-cols-2 gap-3">
        {TIPOS.map(tipo => (
          <Link
            key={tipo.id}
            href={`/dashboard/nuevo/${tipo.id}`}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-blue-300 active:scale-95 transition-all flex flex-col items-center text-center gap-2"
          >
            <span className="text-3xl">{tipo.icon}</span>
            <span className="text-xs font-semibold text-slate-700 leading-tight">{tipo.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
