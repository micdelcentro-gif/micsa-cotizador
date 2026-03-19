-- ============================================================
--  MICSA DOCS — Sistema de Foliado Automático
--  Ejecutar en: Supabase Dashboard > SQL Editor > New query
--  (después de haber corrido schema.sql)
-- ============================================================

-- Prefijos por tipo de documento
-- COT = Cotización        BIT = Bitácora
-- CA  = Costos Adicionales  IZA = Checklist Izaje
-- OT  = Orden de Trabajo  CON = Contrato
-- REQ = Requisición       EPP = Entrega EPP
-- PLI = Plan de Izaje     REP = Reporte Avance

-- Tabla de contadores (un contador por tipo + año)
create table if not exists public.contadores_folio (
  tipo    text not null,
  anio    int  not null,
  ultimo  int  not null default 0,
  primary key (tipo, anio)
);

-- RLS: solo lectura pública autenticada, escritura solo vía función
alter table public.contadores_folio enable row level security;
create policy "contadores_select" on public.contadores_folio
  for select using (auth.uid() is not null);

-- ============================================================
--  Función principal: obtiene y reserva el siguiente folio
--  Uso desde la app: supabase.rpc('get_next_folio', { p_tipo: 'cotizacion' })
--  Devuelve: 'COT-2026-0001'
-- ============================================================
create or replace function public.get_next_folio(p_tipo text)
returns text
language plpgsql
security definer
as $$
declare
  v_prefix  text;
  v_anio    int;
  v_num     int;
  v_folio   text;
begin
  -- Prefijo según tipo
  v_prefix := case p_tipo
    when 'cotizacion'         then 'COT'
    when 'bitacora'           then 'BIT'
    when 'costos_adicionales' then 'CA'
    when 'checklist_izaje'    then 'IZA'
    when 'orden_trabajo'      then 'OT'
    when 'contrato'           then 'CON'
    when 'requisicion'        then 'REQ'
    when 'entrega_epp'        then 'EPP'
    when 'plan_izaje'         then 'PLI'
    when 'reporte_avance'     then 'REP'
    else upper(left(p_tipo, 3))
  end;

  v_anio := extract(year from now())::int;

  -- Insertar si no existe, luego incrementar atómicamente
  insert into public.contadores_folio (tipo, anio, ultimo)
  values (p_tipo, v_anio, 0)
  on conflict (tipo, anio) do nothing;

  update public.contadores_folio
  set ultimo = ultimo + 1
  where tipo = p_tipo and anio = v_anio
  returning ultimo into v_num;

  v_folio := v_prefix || '-' || v_anio::text || '-' || lpad(v_num::text, 4, '0');
  return v_folio;
end;
$$;

-- Permisos para llamar la función desde el cliente
grant execute on function public.get_next_folio(text) to authenticated;

-- ============================================================
--  Vista de consecutivos actuales (para admin)
-- ============================================================
create or replace view public.vista_folios as
  select
    tipo,
    anio,
    ultimo as total_emitidos,
    case tipo
      when 'cotizacion'         then 'COT'
      when 'bitacora'           then 'BIT'
      when 'costos_adicionales' then 'CA'
      when 'checklist_izaje'    then 'IZA'
      when 'orden_trabajo'      then 'OT'
      when 'contrato'           then 'CON'
      when 'requisicion'        then 'REQ'
      when 'entrega_epp'        then 'EPP'
      when 'plan_izaje'         then 'PLI'
      when 'reporte_avance'     then 'REP'
      else upper(left(tipo, 3))
    end || '-' || anio::text || '-' || lpad(ultimo::text, 4, '0') as ultimo_folio
  from public.contadores_folio
  order by anio desc, tipo;
