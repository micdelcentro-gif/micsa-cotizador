'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { LOGO_B64, MI, NAVY, RED, ALCANCES_DEFAULT, INCLUYE_DEFAULT, EXCLUYE_DEFAULT, COND_DEFAULT, NOTA_SUP, LETTERS, fmtDate, fmtMXN } from '@/lib/constants'
import type { Documento } from '@/types'

const ESTADO_COLORS: Record<string, string> = {
  borrador:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  enviado:   'bg-blue-100 text-blue-700 border-blue-200',
  aprobado:  'bg-green-100 text-green-700 border-green-200',
  cancelado: 'bg-red-100 text-red-700 border-red-200',
}

const ESTADOS = ['borrador', 'enviado', 'aprobado', 'cancelado']

const TIPO_LABELS: Record<string, string> = {
  cotizacion: 'Cotización Formal', bitacora: 'Bitácora Diaria',
  costos_adicionales: 'Costos Adicionales', checklist_izaje: 'Checklist de Izaje',
  orden_trabajo: 'Orden de Trabajo', contrato: 'Contrato de Servicios',
  requisicion: 'Requisición de Material', entrega_epp: 'Entrega de EPP',
  plan_izaje: 'Plan de Izaje', reporte_avance: 'Reporte de Avance',
}

export default function DocPage() {
  const params = useParams()
  const id = (params as { id: string }).id
  const router = useRouter()
  const supabase = createClient()
  const printRef = useRef<HTMLDivElement>(null)

  const [doc, setDoc] = useState<Documento | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingEstado, setUpdatingEstado] = useState(false)

  useEffect(() => {
    loadDoc()
  }, [id])

  async function loadDoc() {
    const { data } = await supabase.from('documentos').select('*').eq('id', id).single()
    setDoc(data)
    setLoading(false)
  }

  async function updateEstado(estado: string) {
    setUpdatingEstado(true)
    await supabase.from('documentos').update({ estado }).eq('id', id)
    setDoc(prev => prev ? { ...prev, estado: estado as Documento['estado'] } : prev)
    setUpdatingEstado(false)
  }

  async function deleteDoc() {
    if (!confirm('¿Eliminar este documento?')) return
    await supabase.from('documentos').delete().eq('id', id)
    router.push('/dashboard')
  }

  function handlePrint() {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${doc?.tipo || 'Documento'} MICSA</title>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;900&display=swap" rel="stylesheet">
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'IBM Plex Sans',sans-serif;background:white}@media print{@page{margin:0;size:A4}}</style>
    </head><body>${html}</body></html>`)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 800)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando…</div>
  if (!doc) return <div className="flex items-center justify-center h-64 text-slate-400">Documento no encontrado</div>

  const d = doc.datos as Record<string, string>
  const fotos: string[] = Array.isArray(d.fotos) ? d.fotos as unknown as string[] : []

  return (
    <div className="max-w-lg mx-auto pb-4">
      {/* Header bar */}
      <div className="sticky top-14 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 z-10 no-print">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 text-xl">←</button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{TIPO_LABELS[doc.tipo] || doc.tipo}</p>
          <p className="text-xs text-slate-500 truncate">{doc.cliente_nombre}</p>
        </div>
        <button onClick={handlePrint} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg">
          🖨️ PDF
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Meta info */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">Estado</span>
            <select
              value={doc.estado}
              onChange={e => updateEstado(e.target.value)}
              disabled={updatingEstado}
              className={`text-xs font-semibold px-2 py-1 rounded-full border ${ESTADO_COLORS[doc.estado]} focus:outline-none`}
            >
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-400">Folio: </span><span className="font-semibold">{doc.folio || '—'}</span></div>
            <div><span className="text-slate-400">Creado: </span><span className="font-semibold">{new Date(doc.created_at).toLocaleDateString('es-MX')}</span></div>
            <div><span className="text-slate-400">Cliente: </span><span className="font-semibold">{doc.cliente_nombre || '—'}</span></div>
            <div><span className="text-slate-400">Actualizado: </span><span className="font-semibold">{new Date(doc.updated_at).toLocaleDateString('es-MX')}</span></div>
          </div>
        </div>

        {/* Print preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Vista del documento</span>
            <button onClick={handlePrint} className="text-xs text-blue-600 font-semibold">Imprimir →</button>
          </div>
          <div className="overflow-x-auto">
            <div ref={printRef} style={{ minWidth: 500 }}>
              <DocPreviewContent tipo={doc.tipo} d={d} fotos={fotos} folio={doc.folio} />
            </div>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={deleteDoc}
          className="w-full border border-red-200 text-red-600 text-sm py-2.5 rounded-xl hover:bg-red-50 transition-colors"
        >
          🗑️ Eliminar documento
        </button>
      </div>
    </div>
  )
}

/* ─── PREVIEW CONTENT (shared with nuevo) ───────────────── */
function DocPreviewContent({ tipo, d, fotos, folio }: { tipo: string; d: Record<string, string>; fotos: string[]; folio?: string | null }) {
  const tdL: React.CSSProperties = { padding: '5px 8px', fontWeight: 700, color: '#444', whiteSpace: 'nowrap', width: 100, fontSize: 10 }
  const tdV: React.CSSProperties = { padding: '5px 8px', color: '#111', fontSize: 10, borderLeft: '1px solid #e5e7eb' }

  const Header = () => (
    <div style={{ borderBottom: `2px solid ${NAVY}`, paddingBottom: 10, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_B64} alt="Grupo MICSA" style={{ height: 64, objectFit: 'contain' }} />
      <div style={{ textAlign: 'right', fontSize: 9, lineHeight: 1.8, color: '#444' }}>
        {d.fecha && <div style={{ fontWeight: 700, fontSize: 10, color: NAVY }}>Monclova Coahuila a {fmtDate(d.fecha)}</div>}
        <div>RFC: {MI.rfc}</div>
        {(folio || d.cot_num) && <div style={{ fontWeight: 800, color: RED, fontSize: 10 }}>{folio || `COT-${d.cot_num}`}</div>}
      </div>
    </div>
  )

  const Footer = ({ email }: { email?: string }) => (
    <div style={{ background: NAVY, color: 'white', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 8, flexWrap: 'wrap', gap: 4 }}>
      <span>{MI.dir}</span>
      <span>Cel- {MI.tel1} | Cel- {MI.tel2}</span>
      <span>{email || MI.email} | {MI.web} | {MI.emailJ}</span>
    </div>
  )

  const Wm = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_B64} alt="" aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '55%', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }} />
  )

  if (tipo === 'cotizacion') {
    const monto = d.monto_usd
      ? `$${parseFloat(d.monto_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD MAS IVA`
      : d.monto_mxn ? fmtMXN(parseFloat(d.monto_mxn)) + ' MAS IVA' : '—'
    return (
      <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#111', background: 'white', position: 'relative', minHeight: '100%' }}>
        <Wm />
        <div style={{ padding: '16px 20px' }}>
          <Header />
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 11 }}>
            <tbody>
              <tr><td style={tdL}>Cliente:</td><td style={tdV}>{d.cliente || '___'}</td><td style={tdL}>Referencia: {d.referencia || 'Servicio.'}</td></tr>
              <tr><td style={tdL}>Dirección</td><td style={tdV}>{d.direccion_cliente || '___'}</td><td style={tdV}>Planta: {d.planta || '___'}</td></tr>
              <tr><td style={tdL}>Atención.</td><td style={tdV}>{d.atencion || '___'}</td></tr>
            </tbody>
          </table>
          <p style={{ margin: '0 0 12px', lineHeight: 1.8 }}>
            Estimado cliente:<br /><br />
            {`En respuesta a su amable solicitud, le presentamos nuestro presupuesto por los servicios de ${d.actividad || '[actividad]'}.`}
          </p>
          <div style={{ fontWeight: 800, textAlign: 'center', margin: '8px 0', textTransform: 'uppercase', fontSize: 12 }}>SIENDO NUESTRO PRECIO EL SIGUIENTE</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead><tr style={{ background: NAVY, color: 'white' }}>
              <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11 }}>DESCRIPCIÓN</th>
              <th style={{ padding: '7px 12px', textAlign: 'right', fontSize: 11, width: 190 }}>COSTO</th>
            </tr></thead>
            <tbody><tr>
              <td style={{ border: '1px solid #ccc', padding: '8px 12px', fontStyle: 'italic', fontWeight: 600 }}>{d.descripcion_precio || d.actividad || '___'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px 12px', textAlign: 'right', fontWeight: 800 }}>{monto}</td>
            </tr></tbody>
          </table>
          <div style={{ fontWeight: 800, marginBottom: 5 }}>LA PRESENTE COTIZACIÓN INCLUYE:</div>
          <div style={{ marginBottom: 12, paddingLeft: 8 }}>{INCLUYE_DEFAULT.map((it, i) => <div key={i} style={{ lineHeight: 1.8 }}>{it}</div>)}</div>
          <div style={{ fontWeight: 800, marginBottom: 5 }}>EXCLUSIÓN:</div>
          <div style={{ marginBottom: 14, paddingLeft: 8 }}>{EXCLUYE_DEFAULT.map((ex, i) => <div key={i} style={{ lineHeight: 1.8 }}>{i+1}.- {ex}</div>)}</div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>FORMAS DE PAGO:</div>
          <div style={{ marginBottom: 16, fontSize: 11, lineHeight: 1.8 }}>
            <div><strong>2.</strong> Forma de pago: {d.forma_pago || '50% anticipo. 50% al finalizar.'}</div>
            <div><strong>3.</strong> Tiempo de entrega: {d.tiempo_entrega || 'A convenir.'}</div>
            <div><strong>4.</strong> Se solicitan {d.dias_anticipacion || '7'} días de anticipación.</div>
            <div><strong>5.</strong> Vigencia: {d.vigencia || '15 días'}.</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div>Atentamente.</div><br />
            <div style={{ fontWeight: 800, textTransform: 'uppercase' }}>TU SOCIO ESTRATÉGICO EN INSTALACIÓN DE MAQUINARIA</div>
          </div>
        </div>
        <Footer email={MI.emailCot} />
      </div>
    )
  }

  // Generic
  const title = ({ bitacora: 'Bitácora de Actividades Diarias', costos_adicionales: 'Costos Adicionales', checklist_izaje: 'Checklist de Izaje', orden_trabajo: 'Orden de Trabajo', contrato: 'Contrato de Servicios', requisicion: 'Requisición de Material', entrega_epp: 'Entrega de EPP', plan_izaje: 'Plan de Izaje', reporte_avance: 'Reporte de Avance' } as Record<string, string>)[tipo] || tipo

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#111', background: 'white', position: 'relative', minHeight: '100%' }}>
      <Wm />
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${NAVY}`, paddingBottom: 10, marginBottom: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_B64} alt="Grupo MICSA" style={{ height: 60, objectFit: 'contain' }} />
          <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
            {folio && <div style={{ fontSize: 10, color: RED, fontWeight: 700, marginTop: 2 }}>{folio}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: 8, color: '#666', lineHeight: 1.6 }}>
            <div>REPSE: {MI.repse}</div><div>{MI.tel1}</div><div>{MI.email}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
          <tbody>
            {Object.entries(d).filter(([k, v]) => k !== 'fotos' && v).map(([k, v]) => (
              <tr key={k}>
                <td style={tdL}>{k.replace(/_/g, ' ')}:</td>
                <td style={tdV}>{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {fotos.length > 0 && (
          <div>
            <div style={{ fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', fontSize: 11 }}>Evidencia Fotográfica</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {fotos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 4 }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ background: NAVY, color: 'white', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 8, flexWrap: 'wrap', gap: 4 }}>
        <span>{MI.dir}</span><span>Cel- {MI.tel1} | Cel- {MI.tel2}</span><span>{MI.email} | {MI.web}</span>
      </div>
    </div>
  )
}
