import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { TipoDoc, EstadoDoc } from '@/types'

const VALID_TIPOS: TipoDoc[] = [
  'cotizacion', 'bitacora', 'costos_adicionales', 'checklist_izaje',
  'orden_trabajo', 'contrato', 'requisicion', 'entrega_epp',
  'plan_izaje', 'reporte_avance',
]

export async function POST(request: NextRequest) {
  // Validar API key
  const apiKey = request.headers.get('x-micsa-api-key')
  if (!apiKey || apiKey !== process.env.MICSA_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      tipo,
      cliente_nombre,
      cliente_id,
      datos = {},
      estado = 'borrador',
      created_by,
      source_ref,
    } = body as {
      tipo: TipoDoc
      cliente_nombre?: string
      cliente_id?: string
      datos?: Record<string, unknown>
      estado?: EstadoDoc
      created_by?: string
      source_ref?: string
    }

    // Validar tipo
    if (!tipo || !VALID_TIPOS.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Válidos: ${VALID_TIPOS.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Generar folio automático
    const { data: folio, error: folioError } = await supabase.rpc('get_next_folio', {
      p_tipo: tipo,
    })

    if (folioError) {
      return NextResponse.json(
        { error: 'Error generando folio', detail: folioError.message },
        { status: 500 }
      )
    }

    // Si se pasa source_ref, guardarlo en datos para trazabilidad
    const datosConRef = source_ref ? { ...datos, _source_ref: source_ref } : datos

    // Insertar documento
    const { data: doc, error: insertError } = await supabase
      .from('documentos')
      .insert({
        tipo,
        folio,
        cliente_nombre: cliente_nombre || null,
        cliente_id: cliente_id || null,
        datos: datosConRef,
        estado,
        created_by: created_by || '00000000-0000-0000-0000-000000000000',
      })
      .select('id, folio, tipo, estado, created_at')
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Error creando documento', detail: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Request inválido', detail: String(err) },
      { status: 400 }
    )
  }
}
