import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { EstadoDoc } from '@/types'

const VALID_ESTADOS: EstadoDoc[] = ['borrador', 'enviado', 'aprobado', 'cancelado']

export async function PATCH(request: NextRequest) {
  const apiKey = request.headers.get('x-micsa-api-key')
  if (!apiKey || apiKey !== process.env.MICSA_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { documento_id, estado } = body as {
      documento_id: string
      estado: EstadoDoc
    }

    if (!documento_id) {
      return NextResponse.json({ error: 'documento_id requerido' }, { status: 400 })
    }

    if (!estado || !VALID_ESTADOS.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Válidos: ${VALID_ESTADOS.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('documentos')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', documento_id)
      .select('id, folio, estado, updated_at')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error actualizando documento', detail: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Request inválido', detail: String(err) },
      { status: 400 }
    )
  }
}
