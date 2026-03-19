import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-micsa-api-key')
  if (!apiKey || apiKey !== process.env.MICSA_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const folio = searchParams.get('folio')

  if (!id && !folio) {
    return NextResponse.json(
      { error: 'Se requiere parámetro id o folio' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  let query = supabase
    .from('documentos')
    .select('*, fotos(*)')

  if (id) {
    query = query.eq('id', id)
  } else if (folio) {
    query = query.eq('folio', folio)
  }

  const { data, error } = await query.single()

  if (error) {
    return NextResponse.json(
      { error: 'Documento no encontrado', detail: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    )
  }

  return NextResponse.json(data)
}
