export type Rol = 'admin' | 'gerente' | 'supervisor' | 'contabilidad' | 'rh'
export type EstadoDoc = 'borrador' | 'enviado' | 'aprobado' | 'cancelado'
export type TipoDoc =
  | 'cotizacion' | 'bitacora' | 'costos_adicionales' | 'checklist_izaje'
  | 'orden_trabajo' | 'contrato' | 'requisicion' | 'entrega_epp'
  | 'plan_izaje' | 'reporte_avance'

export interface Profile {
  id: string
  nombre: string
  rol: Rol
  activo: boolean
  created_at: string
}

export interface Cliente {
  id: string
  nombre: string
  planta?: string
  direccion?: string
  contacto?: string
  correo?: string
  telefono?: string
}

export interface Documento {
  id: string
  tipo: TipoDoc
  folio?: string
  cliente_nombre?: string
  cliente_id?: string
  datos: Record<string, unknown>
  estado: EstadoDoc
  created_by: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Foto {
  id: string
  documento_id: string
  storage_path: string
  public_url?: string
  nombre?: string
  orden: number
}
