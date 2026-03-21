'use client'
import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ALCANCES_DEFAULT, INCLUYE_DEFAULT, EXCLUYE_DEFAULT, COND_DEFAULT, NOTA_SUP, LETTERS, LOGO_B64, MI, NAVY, RED, GOLD, fmtDate, fmtMXN } from '@/lib/constants'

/* âââ SCHEMAS âââââââââââââââââââââââââââââââââââââââââââââââ */
const SCHEMAS: Record<string, { title: string; sections: { label: string; fields: { key: string; label: string; type: string; placeholder?: string; rows?: number; items?: string[] }[] }[] }> = {
  cotizacion: { title: 'CotizaciÃ³n de Servicios', sections: [
    { label: 'Datos del Documento', fields: [
      { key: 'cot_num', label: 'NÂ° CotizaciÃ³n', type: 'text', placeholder: '028' },
      { key: 'fecha', label: 'Fecha', type: 'date' },
    ]},
    { label: 'Datos del Cliente', fields: [
      { key: 'cliente', label: 'Cliente', type: 'text', placeholder: 'FORZA STEEL' },
      { key: 'planta', label: 'Planta', type: 'text' },
      { key: 'direccion_cliente', label: 'DirecciÃ³n', type: 'text' },
      { key: 'atencion', label: 'AtenciÃ³n', type: 'text' },
      { key: 'contacto', label: 'Contacto / Tel', type: 'text' },
      { key: 'correo_cliente', label: 'Correo', type: 'text' },
      { key: 'referencia', label: 'Referencia', type: 'text', placeholder: 'Servicio.' },
    ]},
    { label: 'Servicio', fields: [
      { key: 'actividad', label: 'Actividad (tÃ­tulo)', type: 'textarea', rows: 2 },
      { key: 'descripcion_personal', label: 'DescripciÃ³n del personal', type: 'textarea', rows: 3 },
      { key: 'alcance_especifico', label: 'Alcance especÃ­fico adicional', type: 'textarea', rows: 2 },
    ]},
    { label: 'Precio', fields: [
      { key: 'monto_usd', label: 'Monto USD (sin IVA)', type: 'number' },
      { key: 'monto_mxn', label: 'Monto MXN (sin IVA)', type: 'number' },
      { key: 'descripcion_precio', label: 'DescripciÃ³n en tabla de precio', type: 'text' },
    ]},
    { label: 'Formas de Pago', fields: [
      { key: 'forma_pago', label: 'Forma de pago', type: 'textarea', rows: 2, placeholder: '50% anticipo.\n50% al finalizar.' },
      { key: 'tiempo_entrega', label: 'Tiempo de entrega', type: 'text' },
      { key: 'dias_anticipacion', label: 'DÃ­as anticipaciÃ³n OC', type: 'text', placeholder: '7' },
      { key: 'vigencia', label: 'Vigencia', type: 'text', placeholder: '15 dÃ­as' },
      { key: 'base_info', label: 'Base de informaciÃ³n', type: 'textarea', rows: 2 },
    ]},
  ]},
  bitacora: { title: 'BitÃ¡cora de Registro de Actividades Diarias', sections: [
    { label: 'InformaciÃ³n General', fields: [
      { key: 'proyecto', label: 'Proyecto / ET', type: 'text' },
      { key: 'supervisor', label: 'Supervisor', type: 'text' },
      { key: 'fecha', label: 'Fecha', type: 'date' },
      { key: 'area', label: 'Ãrea de Trabajo', type: 'text' },
      { key: 'hora_inicio', label: 'Hora Inicio', type: 'time' },
      { key: 'hora_fin', label: 'Hora Fin', type: 'time' },
      { key: 'num_personas', label: 'No. Personas', type: 'number' },
      { key: 'folio', label: 'Folio', type: 'text' },
    ]},
    { label: 'Permisos', fields: [
      { key: 'permiso_caliente', label: 'Trabajo en Caliente (folio)', type: 'text', placeholder: 'N/A' },
      { key: 'permiso_rojo', label: 'Trabajo Rojo (folio)', type: 'text', placeholder: 'N/A' },
      { key: 'permiso_alturas', label: 'Trabajo en Alturas (folio)', type: 'text', placeholder: 'N/A' },
    ]},
    { label: 'Actividades', fields: [
      { key: 'resumen', label: 'Resumen Ejecutivo', type: 'textarea', rows: 3 },
      { key: 'actividades_detalle', label: 'Actividades Detalladas', type: 'textarea', rows: 4 },
    ]},
    { label: 'Firmas', fields: [
      { key: 'supervisor_micsa', label: 'Supervisor Grupo MICSA', type: 'text' },
      { key: 'usuario_cliente', label: 'Nombre Usuario por Cliente', type: 'text' },
    ]},
  ]},
  contrato: { title: 'Contrato de PrestaciÃ³n de Servicios', sections: [
    { label: 'Datos del Contrato', fields: [
      { key: 'num_contrato', label: 'NÂ° de Contrato', type: 'text', placeholder: 'MICSA-CONT-001' },
      { key: 'fecha', label: 'Fecha del Contrato', type: 'date' },
      { key: 'lugar', label: 'Lugar de CelebraciÃ³n', type: 'text', placeholder: 'Monclova, Coahuila' },
      { key: 'vigencia_inicio', label: 'Vigencia Desde', type: 'date' },
      { key: 'vigencia_fin', label: 'Vigencia Hasta', type: 'date' },
    ]},
    { label: 'Datos del Cliente (Contratante)', fields: [
      { key: 'cliente', label: 'RazÃ³n Social del Cliente', type: 'text', placeholder: 'CARRIER TRANSICOLD' },
      { key: 'rfc_cliente', label: 'RFC del Cliente', type: 'text' },
      { key: 'representante_cliente', label: 'Representante Legal', type: 'text' },
      { key: 'domicilio_cliente', label: 'Domicilio Fiscal', type: 'text' },
      { key: 'contacto_cliente', label: 'Contacto / TelÃ©fono', type: 'text' },
      { key: 'correo_cliente', label: 'Correo ElectrÃ³nico', type: 'text' },
    ]},
    { label: 'Objeto del Contrato', fields: [
      { key: 'descripcion_servicio', label: 'DescripciÃ³n del Servicio', type: 'textarea', rows: 4, placeholder: 'Montaje e instalaciÃ³n de maquinaria industrial...' },
      { key: 'ubicacion_obra', label: 'UbicaciÃ³n de la Obra', type: 'text' },
      { key: 'alcance_trabajo', label: 'Alcance del Trabajo', type: 'textarea', rows: 3 },
    ]},
    { label: 'Condiciones EconÃ³micas', fields: [
      { key: 'monto_total', label: 'Monto Total (sin IVA)', type: 'number' },
      { key: 'moneda', label: 'Moneda', type: 'text', placeholder: 'MXN' },
      { key: 'forma_pago', label: 'Forma de Pago', type: 'textarea', rows: 2, placeholder: '50% anticipo, 50% al finalizar' },
      { key: 'penalizaciones', label: 'Penalizaciones por Retraso', type: 'textarea', rows: 2 },
      { key: 'comision_epp', label: 'ComisiÃ³n EPP (%)', type: 'text', placeholder: '20' },
    ]},
    { label: 'ClÃ¡usulas Adicionales', fields: [
      { key: 'clausula_confidencialidad', label: 'ClÃ¡usula de Confidencialidad', type: 'textarea', rows: 2 },
      { key: 'clausula_seguridad', label: 'ClÃ¡usula de Seguridad Industrial', type: 'textarea', rows: 2 },
      { key: 'clausula_cancelacion', label: 'ClÃ¡usula de CancelaciÃ³n', type: 'textarea', rows: 2 },
      { key: 'jurisdiccion', label: 'JurisdicciÃ³n Aplicable', type: 'text', placeholder: 'Monclova, Coahuila' },
    ]},
    { label: 'Firmas', fields: [
      { key: 'firma_contratante', label: 'Nombre del Contratante', type: 'text' },
      { key: 'firma_contratista', label: 'Nombre del Contratista (MICSA)', type: 'text' },
      { key: 'testigo_1', label: 'Testigo 1', type: 'text' },
      { key: 'testigo_2', label: 'Testigo 2', type: 'text' },
    ]},
  ]},
  orden_trabajo: { title: 'Orden de Trabajo', sections: [
    { label: 'Datos de la Orden', fields: [
      { key: 'num_orden', label: 'NÂ° de Orden', type: 'text', placeholder: 'OT-001' },
      { key: 'fecha', label: 'Fecha de EmisiÃ³n', type: 'date' },
      { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
      { key: 'fecha_fin', label: 'Fecha Estimada de Fin', type: 'date' },
      { key: 'prioridad', label: 'Prioridad', type: 'text', placeholder: 'Alta / Media / Baja' },
    ]},
    { label: 'Cliente y Proyecto', fields: [
      { key: 'cliente', label: 'Cliente', type: 'text' },
      { key: 'proyecto', label: 'Proyecto / Referencia', type: 'text' },
      { key: 'ubicacion', label: 'UbicaciÃ³n / Planta', type: 'text' },
      { key: 'solicitado_por', label: 'Solicitado por', type: 'text' },
      { key: 'contacto', label: 'Contacto / TelÃ©fono', type: 'text' },
    ]},
    { label: 'DescripciÃ³n del Trabajo', fields: [
      { key: 'tipo_trabajo', label: 'Tipo de Trabajo', type: 'text', placeholder: 'Montaje / Soldadura / Izaje / Mantenimiento' },
      { key: 'descripcion', label: 'DescripciÃ³n Detallada', type: 'textarea', rows: 4 },
      { key: 'materiales_requeridos', label: 'Materiales Requeridos', type: 'textarea', rows: 3 },
      { key: 'equipo_requerido', label: 'Equipo / Herramienta Requerida', type: 'textarea', rows: 2 },
    ]},
    { label: 'Personal Asignado', fields: [
      { key: 'supervisor', label: 'Supervisor Asignado', type: 'text' },
      { key: 'personal_asignado', label: 'Personal (nombres y puestos)', type: 'textarea', rows: 3 },
      { key: 'num_trabajadores', label: 'NÃºmero de Trabajadores', type: 'number' },
    ]},
    { label: 'Observaciones y Firmas', fields: [
      { key: 'observaciones', label: 'Observaciones', type: 'textarea', rows: 3 },
      { key: 'aprobado_por', label: 'Aprobado por', type: 'text' },
      { key: 'recibido_por', label: 'Recibido por (cliente)', type: 'text' },
    ]},
  ]},
  requisicion: { title: 'RequisiciÃ³n de Material', sections: [
    { label: 'Datos de la RequisiciÃ³n', fields: [
      { key: 'num_requisicion', label: 'NÂ° de RequisiciÃ³n', type: 'text', placeholder: 'REQ-001' },
      { key: 'fecha', label: 'Fecha de Solicitud', type: 'date' },
      { key: 'fecha_requerida', label: 'Fecha Requerida', type: 'date' },
      { key: 'urgencia', label: 'Urgencia', type: 'text', placeholder: 'Normal / Urgente / CrÃ­tica' },
    ]},
    { label: 'Proyecto y Solicitante', fields: [
      { key: 'proyecto', label: 'Proyecto / ET', type: 'text' },
      { key: 'cliente', label: 'Cliente', type: 'text' },
      { key: 'solicitado_por', label: 'Solicitado por', type: 'text' },
      { key: 'departamento', label: 'Departamento', type: 'text', placeholder: 'Operaciones' },
      { key: 'centro_costos', label: 'Centro de Costos', type: 'text' },
    ]},
    { label: 'Materiales Solicitados', fields: [
      { key: 'material_1', label: 'Material 1 (descripciÃ³n, cantidad, unidad)', type: 'text' },
      { key: 'material_2', label: 'Material 2', type: 'text' },
      { key: 'material_3', label: 'Material 3', type: 'text' },
      { key: 'material_4', label: 'Material 4', type: 'text' },
      { key: 'material_5', label: 'Material 5', type: 'text' },
      { key: 'materiales_adicionales', label: 'Materiales adicionales', type: 'textarea', rows: 3 },
    ]},
    { label: 'JustificaciÃ³n y AprobaciÃ³n', fields: [
      { key: 'justificacion', label: 'JustificaciÃ³n', type: 'textarea', rows: 3 },
      { key: 'proveedor_sugerido', label: 'Proveedor Sugerido', type: 'text' },
      { key: 'presupuesto_estimado', label: 'Presupuesto Estimado', type: 'number' },
      { key: 'aprobado_por', label: 'Aprobado por', type: 'text' },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea', rows: 2 },
    ]},
  ]},
  entrega_epp: { title: 'Registro de Entrega de EPP', sections: [
    { label: 'Datos del Registro', fields: [
      { key: 'num_entrega', label: 'NÂ° de Registro', type: 'text', placeholder: 'EPP-001' },
      { key: 'fecha', label: 'Fecha de Entrega', type: 'date' },
      { key: 'proyecto', label: 'Proyecto / ET', type: 'text' },
      { key: 'cliente', label: 'Cliente / Planta', type: 'text' },
    ]},
    { label: 'Datos del Trabajador', fields: [
      { key: 'nombre_trabajador', label: 'Nombre del Trabajador', type: 'text' },
      { key: 'puesto', label: 'Puesto', type: 'text' },
      { key: 'num_empleado', label: 'NÂ° de Empleado', type: 'text' },
      { key: 'area_trabajo', label: 'Ãrea de Trabajo', type: 'text' },
    ]},
    { label: 'Equipo Entregado', fields: [
      { key: 'casco', label: 'Casco de Seguridad', type: 'text', placeholder: 'SÃ­ / No â Talla / Color' },
      { key: 'lentes', label: 'Lentes de Seguridad', type: 'text', placeholder: 'SÃ­ / No â Tipo' },
      { key: 'guantes', label: 'Guantes', type: 'text', placeholder: 'SÃ­ / No â Tipo / Talla' },
      { key: 'botas', label: 'Botas de Seguridad', type: 'text', placeholder: 'SÃ­ / No â Talla' },
      { key: 'chaleco', label: 'Chaleco Reflejante', type: 'text', placeholder: 'SÃ­ / No â Talla' },
      { key: 'arnes', label: 'ArnÃ©s de Seguridad', type: 'text', placeholder: 'SÃ­ / No â NÂ° Serie' },
      { key: 'careta_soldadura', label: 'Careta de Soldadura', type: 'text', placeholder: 'SÃ­ / No â Tipo' },
      { key: 'tapones_auditivos', label: 'Tapones Auditivos', type: 'text', placeholder: 'SÃ­ / No' },
      { key: 'respirador', label: 'Respirador / Mascarilla', type: 'text', placeholder: 'SÃ­ / No â Tipo' },
      { key: 'epp_adicional', label: 'EPP Adicional', type: 'textarea', rows: 2 },
    ]},
    { label: 'Condiciones y Firmas', fields: [
      { key: 'condiciones', label: 'Condiciones de Entrega', type: 'textarea', rows: 2, placeholder: 'Equipo nuevo / ReposiciÃ³n / Cambio por deterioro' },
      { key: 'compromiso', label: 'Compromiso del Trabajador', type: 'textarea', rows: 2, placeholder: 'Me comprometo a usar el EPP durante toda la jornada laboral...' },
      { key: 'entregado_por', label: 'Entregado por', type: 'text' },
      { key: 'recibido_por', label: 'Firma del Trabajador', type: 'text' },
      { key: 'supervisor', label: 'Vo.Bo. Supervisor', type: 'text' },
    ]},
  ]},
  costos_adicionales: { title: 'Reporte de Costos Adicionales', sections: [
    { label: 'Datos del Reporte', fields: [
      { key: 'num_reporte', label: 'NÂ° de Reporte', type: 'text', placeholder: 'CA-001' },
      { key: 'fecha', label: 'Fecha', type: 'date' },
      { key: 'proyecto', label: 'Proyecto / ET', type: 'text' },
      { key: 'cliente', label: 'Cliente', type: 'text' },
      { key: 'orden_trabajo_ref', label: 'Orden de Trabajo Relacionada', type: 'text' },
    ]},
    { label: 'DescripciÃ³n del Costo Adicional', fields: [
      { key: 'motivo', label: 'Motivo del Costo Adicional', type: 'textarea', rows: 3, placeholder: 'Trabajos no contemplados en alcance original...' },
      { key: 'descripcion_trabajos', label: 'DescripciÃ³n de Trabajos Extra', type: 'textarea', rows: 4 },
      { key: 'fecha_inicio_extra', label: 'Fecha Inicio Trabajos Extra', type: 'date' },
      { key: 'fecha_fin_extra', label: 'Fecha Fin Trabajos Extra', type: 'date' },
    ]},
    { label: 'Desglose de Costos', fields: [
      { key: 'costo_mano_obra', label: 'Costo Mano de Obra', type: 'number' },
      { key: 'costo_materiales', label: 'Costo Materiales', type: 'number' },
      { key: 'costo_equipo', label: 'Costo Equipo / Herramienta', type: 'number' },
      { key: 'costo_transporte', label: 'Costo Transporte', type: 'number' },
      { key: 'costo_otros', label: 'Otros Costos', type: 'number' },
    ]},
    { label: 'AutorizaciÃ³n', fields: [
      { key: 'justificacion', label: 'JustificaciÃ³n Detallada', type: 'textarea', rows: 3 },
      { key: 'elaborado_por', label: 'Elaborado por', type: 'text' },
      { key: 'autorizado_por_micsa', label: 'Autorizado por (MICSA)', type: 'text' },
      { key: 'autorizado_por_cliente', label: 'Autorizado por (Cliente)', type: 'text' },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea', rows: 2 },
    ]},
  ]},
  checklist_izaje: { title: 'Checklist de Seguridad para Izaje', sections: [
    { label: 'Datos de la OperaciÃ³n', fields: [
      { key: 'num_checklist', label: 'NÂ° de Checklist', type: 'text', placeholder: 'CHK-IZ-001' },
      { key: 'fecha', label: 'Fecha', type: 'date' },
      { key: 'hora', label: 'Hora de InspecciÃ³n', type: 'time' },
      { key: 'proyecto', label: 'Proyecto / ET', type: 'text' },
      { key: 'cliente', label: 'Cliente / Planta', type: 'text' },
      { key: 'area_trabajo', label: 'Ãrea de Trabajo', type: 'text' },
    ]},
    { label: 'Datos del Equipo de Izaje', fields: [
      { key: 'tipo_grua', label: 'Tipo de GrÃºa / Equipo', type: 'text', placeholder: 'GrÃºa HidrÃ¡ulica / TelescÃ³pica / Puente GrÃºa' },
      { key: 'capacidad_grua', label: 'Capacidad de la GrÃºa (Ton)', type: 'text' },
      { key: 'marca_modelo', label: 'Marca y Modelo', type: 'text' },
      { key: 'num_serie_grua', label: 'NÂ° Serie del Equipo', type: 'text' },
      { key: 'operador', label: 'Nombre del Operador', type: 'text' },
      { key: 'licencia_operador', label: 'NÂ° Licencia del Operador', type: 'text' },
    ]},
    { label: 'InspecciÃ³n Pre-OperaciÃ³n', fields: [
      { key: 'cables_eslingas', label: 'Cables y Eslingas en buen estado', type: 'text', placeholder: 'SÃ­ / No / N/A â Observaciones' },
      { key: 'ganchos_seguros', label: 'Ganchos con seguro', type: 'text', placeholder: 'SÃ­ / No / N/A' },
      { key: 'estabilizadores', label: 'Estabilizadores desplegados', type: 'text', placeholder: 'SÃ­ / No / N/A' },
      { key: 'area_despejada', label: 'Ãrea de izaje despejada', type: 'text', placeholder: 'SÃ­ / No' },
      { key: 'seÃ±alizacion', label: 'SeÃ±alizaciÃ³n colocada', type: 'text', placeholder: 'SÃ­ / No' },
      { key: 'viento', label: 'Condiciones de viento aceptables', type: 'text', placeholder: 'SÃ­ / No â Velocidad' },
      { key: 'comunicacion', label: 'ComunicaciÃ³n radio/seÃ±ales OK', type: 'text', placeholder: 'SÃ­ / No' },
      { key: 'lineas_electricas', label: 'Distancia a lÃ­neas elÃ©ctricas OK', type: 'text', placeholder: 'SÃ­ / No â Distancia' },
    ]},
    { label: 'Datos de la Carga', fields: [
      { key: 'descripcion_carga', label: 'DescripciÃ³n de la Carga', type: 'text' },
      { key: 'peso_carga', label: 'Peso de la Carga (Ton)', type: 'text' },
      { key: 'dimensiones', label: 'Dimensiones de la Carga', type: 'text' },
      { key: 'centro_gravedad', label: 'Centro de Gravedad Identificado', type: 'text', placeholder: 'SÃ­ / No' },
      { key: 'puntos_izaje', label: 'Puntos de Izaje Identificados', type: 'text', placeholder: 'SÃ­ / No â Cantidad' },
    ]},
    { label: 'AutorizaciÃ³n y Firmas', fields: [
      { key: 'observaciones', label: 'Observaciones Generales', type: 'textarea', rows: 3 },
      { key: 'rigger', label: 'Rigger / Maniobrista', type: 'text' },
      { key: 'supervisor_izaje', label: 'Supervisor de Izaje', type: 'text' },
      { key: 'supervisor_seguridad', label: 'Supervisor de Seguridad', type: 'text' },
      { key: 'autoriza_cliente', label: 'Autoriza (Cliente)', type: 'text' },
    ]},
  ]},
  plan_izaje: { title: 'Plan de Izaje', sections: [
    { label: 'Datos del Plan', fields: [
      { key: 'num_plan', label: 'NÂ° de Plan de Izaje', type: 'text', placeholder: 'PI-001' },
      { key: 'fecha', label: 'Fecha de ElaboraciÃ³n', type: 'date' },
      { key: 'fecha_ejecucion', label: 'Fecha Programada de EjecuciÃ³n', type: 'date' },
      { key: 'proyecto', label: 'Proyecto / ET', type: 'text' },
      { key: 'cliente', label: 'Cliente', type: 'text' },
      { key: 'ubicacion', label: 'UbicaciÃ³n / Planta', type: 'text' },
    ]},
    { label: 'DescripciÃ³n de la Maniobra', fields: [
      { key: 'descripcion_maniobra', label: 'DescripciÃ³n General de la Maniobra', type: 'textarea', rows: 4 },
      { key: 'objetivo', label: 'Objetivo del Izaje', type: 'textarea', rows: 2 },
      { key: 'secuencia', label: 'Secuencia de Operaciones', type: 'textarea', rows: 4, placeholder: '1. Posicionar grÃºa\n2. Colocar eslingas\n3. Izar carga...' },
    ]},
    { label: 'Datos de la Carga', fields: [
      { key: 'descripcion_carga', label: 'DescripciÃ³n de la Carga', type: 'text' },
      { key: 'peso_carga', label: 'Peso de la Carga (Ton)', type: 'text' },
      { key: 'dimensiones_carga', label: 'Dimensiones (L x A x H)', type: 'text' },
      { key: 'centro_gravedad', label: 'Centro de Gravedad', type: 'text' },
      { key: 'altura_izaje', label: 'Altura de Izaje (m)', type: 'text' },
      { key: 'radio_operacion', label: 'Radio de OperaciÃ³n (m)', type: 'text' },
    ]},
    { label: 'Equipo y Accesorios', fields: [
      { key: 'tipo_grua', label: 'Tipo de GrÃºa', type: 'text' },
      { key: 'capacidad_grua', label: 'Capacidad Nominal (Ton)', type: 'text' },
      { key: 'capacidad_al_radio', label: 'Capacidad al Radio de Trabajo (Ton)', type: 'text' },
      { key: 'porcentaje_carga', label: '% de Capacidad Utilizada', type: 'text' },
      { key: 'eslingas', label: 'Eslingas (tipo, capacidad, cantidad)', type: 'textarea', rows: 2 },
      { key: 'grilletes', label: 'Grilletes (capacidad, cantidad)', type: 'text' },
      { key: 'accesorios_adicionales', label: 'Accesorios Adicionales', type: 'textarea', rows: 2 },
    ]},
    { label: 'Medidas de Seguridad', fields: [
      { key: 'area_restringida', label: 'Ãrea Restringida Definida', type: 'text', placeholder: 'SÃ­ / No â Radio de restricciÃ³n' },
      { key: 'comunicaciones', label: 'Sistema de ComunicaciÃ³n', type: 'text', placeholder: 'Radio / SeÃ±ales manuales' },
      { key: 'condiciones_climaticas', label: 'Condiciones ClimÃ¡ticas Permitidas', type: 'textarea', rows: 2 },
      { key: 'epp_requerido', label: 'EPP Requerido', type: 'textarea', rows: 2, placeholder: 'Casco, guantes, botas, chaleco...' },
      { key: 'plan_emergencia', label: 'Plan de Emergencia', type: 'textarea', rows: 2 },
      { key: 'riesgos_identificados', label: 'Riesgos Identificados', type: 'textarea', rows: 3 },
    ]},
    { label: 'Personal y AprobaciÃ³n', fields: [
      { key: 'operador_grua', label: 'Operador de GrÃºa', type: 'text' },
      { key: 'rigger', label: 'Rigger / Maniobrista', type: 'text' },
      { key: 'seÃ±alero', label: 'SeÃ±alero', type: 'text' },
      { key: 'supervisor', label: 'Supervisor del Izaje', type: 'text' },
      { key: 'elaborado_por', label: 'Elaborado por', type: 'text' },
      { key: 'aprobado_por', label: 'Aprobado por (MICSA)', type: 'text' },
      { key: 'aprobado_cliente', label: 'Aprobado por (Cliente)', type: 'text' },
    ]},
  ]},
  reporte_avance: { title: 'Reporte de Avance de Obra', sections: [
    { label: 'Datos del Reporte', fields: [
      { key: 'num_reporte', label: 'NÂ° de Reporte', type: 'text', placeholder: 'RA-001' },
      { key: 'fecha', label: 'Fecha del Reporte', type: 'date' },
      { key: 'periodo_inicio', label: 'PerÃ­odo Desde', type: 'date' },
      { key: 'periodo_fin', label: 'PerÃ­odo Hasta', type: 'date' },
      { key: 'num_reporte_consecutivo', label: 'Reporte NÂ° (consecutivo)', type: 'text', placeholder: '1 de 5' },
    ]},
    { label: 'Datos del Proyecto', fields: [
      { key: 'proyecto', label: 'Proyecto / ET', type: 'text' },
      { key: 'cliente', label: 'Cliente', type: 'text' },
      { key: 'ubicacion', label: 'UbicaciÃ³n / Planta', type: 'text' },
      { key: 'contrato_ref', label: 'NÂ° de Contrato', type: 'text' },
      { key: 'supervisor', label: 'Supervisor de Obra', type: 'text' },
    ]},
    { label: 'Avance General', fields: [
      { key: 'avance_programado', label: 'Avance Programado (%)', type: 'text' },
      { key: 'avance_real', label: 'Avance Real (%)', type: 'text' },
      { key: 'desviacion', label: 'DesviaciÃ³n (%)', type: 'text' },
      { key: 'resumen_avance', label: 'Resumen de Avance', type: 'textarea', rows: 4, placeholder: 'DescripciÃ³n general del avance en el perÃ­odo...' },
    ]},
    { label: 'Actividades del PerÃ­odo', fields: [
      { key: 'actividades_completadas', label: 'Actividades Completadas', type: 'textarea', rows: 4 },
      { key: 'actividades_en_proceso', label: 'Actividades en Proceso', type: 'textarea', rows: 3 },
      { key: 'actividades_pendientes', label: 'Actividades Pendientes', type: 'textarea', rows: 3 },
      { key: 'actividades_proxima_semana', label: 'Plan Siguiente PerÃ­odo', type: 'textarea', rows: 3 },
    ]},
    { label: 'Recursos y Personal', fields: [
      { key: 'personal_en_obra', label: 'Personal en Obra (cantidad)', type: 'number' },
      { key: 'detalle_personal', label: 'Detalle del Personal', type: 'textarea', rows: 2 },
      { key: 'equipo_en_obra', label: 'Equipo en Obra', type: 'textarea', rows: 2 },
      { key: 'horas_trabajadas', label: 'Horas Trabajadas en PerÃ­odo', type: 'number' },
    ]},
    { label: 'Problemas y Observaciones', fields: [
      { key: 'problemas', label: 'Problemas / ObstÃ¡culos', type: 'textarea', rows: 3 },
      { key: 'acciones_correctivas', label: 'Acciones Correctivas', type: 'textarea', rows: 2 },
      { key: 'incidentes_seguridad', label: 'Incidentes de Seguridad', type: 'textarea', rows: 2, placeholder: 'Sin incidentes / DescripciÃ³n...' },
      { key: 'observaciones', label: 'Observaciones Generales', type: 'textarea', rows: 3 },
    ]},
    { label: 'Firmas', fields: [
      { key: 'elaborado_por', label: 'Elaborado por', type: 'text' },
      { key: 'revisado_por', label: 'Revisado por (MICSA)', type: 'text' },
      { key: 'recibido_cliente', label: 'Recibido por (Cliente)', type: 'text' },
    ]},
  ]},
}

// Default schema for other doc types
function defaultSchema(tipo: string, title: string) {
  return { title, sections: [{ label: 'InformaciÃ³n General', fields: [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'cliente', label: 'Cliente', type: 'text' },
    { key: 'proyecto', label: 'Proyecto / Referencia', type: 'text' },
    { key: 'supervisor', label: 'Supervisor', type: 'text' },
    { key: 'descripcion', label: 'DescripciÃ³n', type: 'textarea', rows: 4 },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea', rows: 3 },
  ], }], }
}

const TIPO_TITLES: Record<string, string> = {
  cotizacion: 'CotizaciÃ³n Formal',
  bitacora: 'BitÃ¡cora Diaria',
  costos_adicionales: 'Costos Adicionales',
  checklist_izaje: 'Checklist de Izaje',
  orden_trabajo: 'Orden de Trabajo',
  contrato: 'Contrato de Servicios',
  requisicion: 'RequisiciÃ³n de Material',
  entrega_epp: 'Entrega de EPP',
  plan_izaje: 'Plan de Izaje',
  reporte_avance: 'Reporte de Avance',
}

/* âââ PHOTO UPLOADER âââââââââââââââââââââââââââââââââââââââ */
function PhotoUploader({ documentoId, fotos, onFotosChange }: {
  documentoId?: string
  fotos: { url: string; path: string; name: string }[]
  onFotosChange: (f: { url: string; path: string; name: string }[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    if (!files.length) return
    setUploading(true)
    const newFotos = [...fotos]
    for (const file of Array.from(files)) {
      const path = `${documentoId || 'temp'}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('fotos-documentos').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('fotos-documentos').getPublicUrl(path)
        newFotos.push({ url: data.publicUrl, path, name: file.name })
      }
    }
    onFotosChange(newFotos)
    setUploading(false)
  }

  async function removePhoto(idx: number) {
    const foto = fotos[idx]
    await supabase.storage.from('fotos-documentos').remove([foto.path])
    onFotosChange(fotos.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
      >
        {uploading ? (
          <p className="text-slate-500 text-sm">Subiendoâ¦</p>
        ) : (
          <>
            <div className="text-3xl mb-2">ð·</div>
            <p className="text-sm text-slate-500">Toca para agregar fotos</p>
            <p className="text-xs text-slate-400 mt-1">CÃ¡mara o galerÃ­a</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment"
        className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {fotos.map((f, i) => (
            <div key={i} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="w-full h-full object-cover rounded-lg" />
              <button onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >Ã</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* âââ MAIN PAGE ââââââââââââââââââââââââââââââââââââââââââââ */
export default function NuevoTipoPage() {
  const params = useParams()
  const tipo = (params as { tipo: string }).tipo
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<Record<string, string>>({})
  const [fotos, setFotos] = useState<{ url: string; path: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const title = TIPO_TITLES[tipo] || tipo
  const schema = SCHEMAS[tipo] || defaultSchema(tipo, title)

  function set(key: string, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
  }

  const [folio, setFolio] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Generar folio automÃ¡tico solo en el primer guardado
    let docFolio = folio
    if (!savedId && !docFolio) {
      const { data: folioData } = await supabase.rpc('get_next_folio', { p_tipo: tipo })
      docFolio = folioData as string
      setFolio(docFolio)
    }

    const docData = {
      tipo,
      folio: docFolio,
      cliente_nombre: data.cliente || data.proyecto || null,
      datos: { ...data, fotos: fotos.map(f => f.url) },
      estado: 'borrador',
      created_by: user?.id,
    }

    if (savedId) {
      const { folio: _f, ...updateData } = docData
      await supabase.from('documentos').update(updateData).eq('id', savedId)
    } else {
      const { data: doc } = await supabase.from('documentos').insert(docData).select().single()
      if (doc) setSavedId(doc.id)
    }
    setSaving(false)
  }

  function handlePrint() {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;900&display=swap" rel="stylesheet">
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'IBM Plex Sans',sans-serif;background:white}
        @media print{@page{margin:0;size:A4}}
      </style>
    </head><body>${html}</body></html>`)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 800)
  }

  return (
    <div className="max-w-lg mx-auto pb-4">
      {/* Header */}
      <div className="sticky top-14 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 z-10 no-print">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 text-xl">â</button>
        <h2 className="text-base font-bold text-slate-800 flex-1 truncate">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(!showPreview)}
            className="text-xs border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            {showPreview ? 'Editar' : 'Vista previa'}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="text-xs bg-blue-900 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? 'Guardandoâ¦' : 'Guardar'}
          </button>
        </div>
      </div>

      {savedId && (
        <div className="mx-4 mt-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm flex items-center justify-between no-print">
          <span>â Guardado â <strong>{folio}</strong></span>
          <button onClick={handlePrint} className="text-green-800 font-semibold underline text-xs">Imprimir PDF</button>
        </div>
      )}

      {showPreview ? (
        /* PREVIEW */
        <div className="p-4">
          <button onClick={handlePrint}
            className="w-full mb-4 bg-slate-800 text-white py-3 rounded-xl font-semibold text-sm no-print"
          >
            ð¨ï¸ Imprimir / Guardar PDF
          </button>
          <div ref={printRef}>
            <DocumentPreview tipo={tipo} data={data} fotos={fotos} folio={folio} />
          </div>
        </div>
      ) : (
        /* FORM */
        <div className="p-4 space-y-6">
          {schema.sections.map((section, si) => (
            <div key={si} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">{section.label}</h3>
              </div>
              <div className="p-4 space-y-3">
                {section.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={data[field.key] || ''}
                        onChange={e => set(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={data[field.key] || ''}
                        onChange={e => set(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Auto-calc totals for costos_adicionales */}
          {tipo === 'costos_adicionales' && (() => {
            const subtotal =
              parseFloat(data.costo_mano_obra || '0') +
              parseFloat(data.costo_materiales || '0') +
              parseFloat(data.costo_equipo || '0') +
              parseFloat(data.costo_transporte || '0') +
              parseFloat(data.costo_otros || '0')
            const iva = Math.round(subtotal * 0.16 * 100) / 100
            const total = Math.round((subtotal + iva) * 100) / 100
            return (
              <div className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-blue-900 border-b border-blue-800">
                  <h3 className="text-sm font-semibold text-white">💰 Totales (calculado automático)</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm py-1 border-b border-blue-100">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-800">{fmtMXN(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b border-blue-100">
                    <span className="text-slate-600">IVA (16%):</span>
                    <span className="font-semibold text-slate-800">{fmtMXN(iva)}</span>
                  </div>
                  <div className="flex justify-between text-base py-2">
                    <span className="font-bold text-slate-900">TOTAL:</span>
                    <span className="font-bold text-blue-900 text-lg">{fmtMXN(total)}</span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Photos section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">ð· Evidencia FotogrÃ¡fica</h3>
            </div>
            <div className="p-4">
              <PhotoUploader documentoId={savedId || undefined} fotos={fotos} onFotosChange={setFotos} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
          >
            {saving ? 'Guardandoâ¦' : 'ð¾ Guardar Documento'}
          </button>
        </div>
      )}
    </div>
  )
}

/* âââ DOCUMENT PREVIEW ââââââââââââââââââââââââââââââââââââ */
function DocumentPreview({ tipo, data, fotos, folio }: {
  tipo: string
  data: Record<string, string>
  fotos: { url: string }[]
  folio?: string | null
}) {
  const tdL: React.CSSProperties = { padding: '5px 8px', fontWeight: 700, color: '#444', whiteSpace: 'nowrap', width: '100px', fontSize: '10px' }
  const tdV: React.CSSProperties = { padding: '5px 8px', color: '#111', fontSize: '10px', borderLeft: '1px solid #e5e7eb' }

  const Header = () => (
    <div style={{ borderBottom: `2px solid ${NAVY}`, paddingBottom: 10, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_B64} alt="Grupo MICSA" style={{ height: 64, width: 'auto', objectFit: 'contain' }} />
      <div style={{ textAlign: 'right', fontSize: 9, lineHeight: 1.8, color: '#444' }}>
        {data.fecha && <div style={{ fontWeight: 700, fontSize: 10, color: NAVY }}>Monclova Coahuila a {fmtDate(data.fecha)}</div>}
        <div>RFC: {MI.rfc}</div>
        {data.cot_num && <div style={{ fontWeight: 800, color: RED, fontSize: 10 }}>COTIZACIÃN. {data.cot_num}</div>}
      </div>
    </div>
  )

  const BHeader = ({ title }: { title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${NAVY}`, paddingBottom: 10, marginBottom: 12 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_B64} alt="Grupo MICSA" style={{ height: 60, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
      <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Barlow Condensed',sans-serif" }}>{title}</div>
        {folio && <div style={{ fontSize: 10, color: RED, fontWeight: 700, marginTop: 2 }}>{folio}</div>}
      </div>
      <div style={{ textAlign: 'right', fontSize: 8, color: '#666', lineHeight: 1.6, flexShrink: 0 }}>
        <div>REPSE: {MI.repse}</div>
        <div>{MI.tel1} | {MI.tel2}</div>
        <div>{MI.email}</div>
      </div>
    </div>
  )

  const Footer = ({ email }: { email?: string }) => (
    <div style={{ background: NAVY, color: 'white', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 8, marginTop: 'auto', flexWrap: 'wrap', gap: 4 }}>
      <span>{MI.dir}</span>
      <span>Cel- {MI.tel1} | Cel- {MI.tel2}</span>
      <span>{email || MI.email} | {MI.web} | {MI.emailJ}</span>
    </div>
  )

  const Watermark = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_B64} alt="" aria-hidden style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      width: '55%', opacity: 0.05, pointerEvents: 'none', zIndex: 0, userSelect: 'none'
    }} />
  )

  if (tipo === 'cotizacion') {
    const alcances = ALCANCES_DEFAULT
    const incluye = INCLUYE_DEFAULT
    const excluye = EXCLUYE_DEFAULT
    const monto = data.monto_usd
      ? `$${parseFloat(data.monto_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD MAS IVA`
      : data.monto_mxn
      ? fmtMXN(parseFloat(data.monto_mxn)) + ' MAS IVA'
      : 'â'

    return (
      <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#111', background: 'white', display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
        <Watermark />
        <div style={{ padding: '16px 20px', flex: 1 }}>
          <Header />
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 11 }}>
            <tbody>
              <tr><td style={tdL}>Cliente:</td><td style={tdV}>{data.cliente || '___'}</td><td style={tdL}>Referencia: {data.referencia || 'Servicio.'}</td></tr>
              <tr><td style={tdL}>DirecciÃ³n</td><td style={tdV}>{data.direccion_cliente || '___'}</td><td style={tdV}>Planta: {data.planta || '___'}</td></tr>
              <tr><td style={tdL}>AtenciÃ³n.</td><td style={tdV}>{data.atencion || '___'}</td><td style={tdV} rowSpan={3}><em>{data.actividad || '___'}</em></td></tr>
              <tr><td style={tdL}>Contacto</td><td style={tdV}>{data.contacto || ''}</td></tr>
              <tr><td style={tdL}>Correo.</td><td style={tdV}>{data.correo_cliente || ''}</td></tr>
            </tbody>
          </table>

          <p style={{ margin: '0 0 12px', lineHeight: 1.8, textAlign: 'justify' }}>
            Estimado cliente:<br /><br />
            {`En respuesta a su amable solicitud, le presentamos nuestro presupuesto por los servicios de ${data.actividad || '[actividad]'} en planta ${data.planta || '[planta]'} ${data.direccion_cliente || ''}.`}
          </p>

          {data.descripcion_personal && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>DESCRIPCIÃN.</div>
              <p style={{ margin: 0, lineHeight: 1.7, textAlign: 'justify' }}>{data.descripcion_personal}</p>
            </div>
          )}

          <div style={{ fontWeight: 800, textAlign: 'center', marginBottom: 8, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em' }}>I. ALCANCES GENERALES</div>
          <div style={{ marginBottom: 14 }}>
            {alcances.map((a: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, lineHeight: 1.6, textAlign: 'justify' }}>
                <span style={{ fontWeight: 700, flexShrink: 0 }}>{LETTERS[i]}.</span><span>{a}</span>
              </div>
            ))}
            {data.alcance_especifico && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 5, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, flexShrink: 0 }}>{LETTERS[alcances.length]}.</span>
                <span>{data.alcance_especifico}</span>
              </div>
            )}
          </div>

          <div style={{ fontWeight: 800, textAlign: 'center', marginBottom: 8, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em' }}>SIENDO NUESTRO PRECIO EL SIGUIENTE</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
              <tr style={{ background: NAVY, color: 'white' }}>
                <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11 }}>DESCRIPCIÃN</th>
                <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: 11, width: 130 }}>LÃNEA-ESTACIÃN</th>
                <th style={{ padding: '7px 12px', textAlign: 'right', fontSize: 11, width: 190 }}>COSTO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px 12px', fontStyle: 'italic', fontWeight: 600 }}>{data.descripcion_precio || data.actividad || '___'}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px 12px', textAlign: 'center' }}>PLANTA.</td>
                <td style={{ border: '1px solid #ccc', padding: '8px 12px', textAlign: 'right', fontWeight: 800 }}>{monto}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontWeight: 800, marginBottom: 5 }}>LA PRESENTE COTIZACIÃN INCLUYE:</div>
          <div style={{ marginBottom: 12, paddingLeft: 8 }}>{incluye.map((it: string, i: number) => <div key={i} style={{ lineHeight: 1.8 }}>{it}</div>)}</div>

          <div style={{ fontWeight: 800, marginBottom: 5 }}>EXCLUSIÃN:</div>
          <div style={{ marginBottom: 14, paddingLeft: 8 }}>{excluye.map((ex: string, i: number) => <div key={i} style={{ lineHeight: 1.8 }}>{i + 1}.- {ex}</div>)}</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>NOTA.</div>
            {NOTA_SUP.split('\n\n').map((p: string, i: number) => (
              <p key={i} style={{ margin: '0 0 8px', lineHeight: 1.7, textAlign: 'justify', fontSize: 10, fontWeight: p.startsWith('MICSA EXPRESAMENTE') ? 700 : 400 }}>{p}</p>
            ))}
          </div>

          <div style={{ marginBottom: 14, fontSize: 10, lineHeight: 1.7 }}>
            {COND_DEFAULT.map((c: string, i: number) => (
              <div key={i} style={{ marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ flexShrink: 0, fontWeight: 700 }}>{i + 1}.-</span><span>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 800, marginBottom: 8 }}>FORMAS DE PAGO:</div>
          <div style={{ marginBottom: 16, fontSize: 11, lineHeight: 1.8 }}>
            <div><strong>1.</strong> La presente cotizaciÃ³n estÃ¡ basada en la informaciÃ³n proporcionada por <strong>{data.cliente || 'el cliente'}</strong>, {data.base_info || 'obtenida en el recorrido realizado con su supervisiÃ³n'}.</div>
            <div style={{ marginTop: 6 }}><strong>2.</strong> Forma de pago: {data.forma_pago || '50% anticipo. 50% al finalizar.'}</div>
            <div><strong>3.</strong> Tiempo de entrega: {data.tiempo_entrega || 'A convenir.'}</div>
            <div><strong>4.</strong> Se solicitan {data.dias_anticipacion || '7'} dÃ­as de anticipaciÃ³n a partir de la OC.</div>
            <div><strong>5.</strong> Vigencia: {data.vigencia || '15 dÃ­as'}.</div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div>Atentamente.</div><br />
            <div style={{ fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>TU SOCIO ESTRATÃGICO EN INSTALACIÃN DE MAQUINARIA</div>
          </div>
        </div>
        <Footer email={MI.emailCot} />
      </div>
    )
  }

  // Special preview for costos_adicionales
  if (tipo === 'costos_adicionales') {
    const subtotal =
      parseFloat(data.costo_mano_obra || '0') +
      parseFloat(data.costo_materiales || '0') +
      parseFloat(data.costo_equipo || '0') +
      parseFloat(data.costo_transporte || '0') +
      parseFloat(data.costo_otros || '0')
    const iva = Math.round(subtotal * 0.16 * 100) / 100
    const total = Math.round((subtotal + iva) * 100) / 100
    return (
      <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#111', background: 'white', display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
        <Watermark />
        <div style={{ padding: '16px 20px', flex: 1 }}>
          <BHeader title="Reporte de Costos Adicionales" />
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
            <tbody>
              {data.num_reporte && <tr><td style={tdL}>N° Reporte:</td><td style={tdV}>{data.num_reporte}</td></tr>}
              {data.fecha && <tr><td style={tdL}>Fecha:</td><td style={tdV}>{fmtDate(data.fecha)}</td></tr>}
              {data.proyecto && <tr><td style={tdL}>Proyecto:</td><td style={tdV}>{data.proyecto}</td></tr>}
              {data.cliente && <tr><td style={tdL}>Cliente:</td><td style={tdV}>{data.cliente}</td></tr>}
              {data.orden_trabajo_ref && <tr><td style={tdL}>OT Relacionada:</td><td style={tdV}>{data.orden_trabajo_ref}</td></tr>}
            </tbody>
          </table>
          {data.motivo && <div style={{ marginBottom: 10 }}><div style={{ fontWeight: 800, marginBottom: 4 }}>MOTIVO:</div><p style={{ margin: 0, lineHeight: 1.7 }}>{data.motivo}</p></div>}
          {data.descripcion_trabajos && <div style={{ marginBottom: 10 }}><div style={{ fontWeight: 800, marginBottom: 4 }}>TRABAJOS EXTRA:</div><p style={{ margin: 0, lineHeight: 1.7 }}>{data.descripcion_trabajos}</p></div>}
          <div style={{ fontWeight: 800, textAlign: 'center', marginBottom: 8, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.06em' }}>DESGLOSE DE COSTOS</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
            <thead>
              <tr style={{ background: NAVY, color: 'white' }}>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10 }}>CONCEPTO</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', fontSize: 10, width: 140 }}>MONTO</th>
              </tr>
            </thead>
            <tbody>
              {parseFloat(data.costo_mano_obra||'0') > 0 && <tr><td style={{ border: '1px solid #ccc', padding: '6px 10px', fontSize: 10 }}>Mano de Obra</td><td style={{ border: '1px solid #ccc', padding: '6px 10px', textAlign: 'right', fontSize: 10 }}>{fmtMXN(parseFloat(data.costo_mano_obra||'0'))}</td></tr>}
              {parseFloat(data.costo_materiales||'0') > 0 && <tr><td style={{ border: '1px solid #ccc', padding: '6px 10px', fontSize: 10 }}>Materiales</td><td style={{ border: '1px solid #ccc', padding: '6px 10px', textAlign: 'right', fontSize: 10 }}>{fmtMXN(parseFloat(data.costo_materiales||'0'))}</td></tr>}
              {parseFloat(data.costo_equipo||'0') > 0 && <tr><td style={{ border: '1px solid #ccc', padding: '6px 10px', fontSize: 10 }}>Equipo / Herramienta</td><td style={{ border: '1px solid #ccc', padding: '6px 10px', textAlign: 'right', fontSize: 10 }}>{fmtMXN(parseFloat(data.costo_equipo||'0'))}</td></tr>}
              {parseFloat(data.costo_transporte||'0') > 0 && <tr><td style={{ border: '1px solid #ccc', padding: '6px 10px', fontSize: 10 }}>Transporte</td><td style={{ border: '1px solid #ccc', padding: '6px 10px', textAlign: 'right', fontSize: 10 }}>{fmtMXN(parseFloat(data.costo_transporte||'0'))}</td></tr>}
              {parseFloat(data.costo_otros||'0') > 0 && <tr><td style={{ border: '1px solid #ccc', padding: '6px 10px', fontSize: 10 }}>Otros</td><td style={{ border: '1px solid #ccc', padding: '6px 10px', textAlign: 'right', fontSize: 10 }}>{fmtMXN(parseFloat(data.costo_otros||'0'))}</td></tr>}
              <tr style={{ background: '#f8f9fa' }}><td style={{ border: '1px solid #ccc', padding: '6px 10px', fontWeight: 700, fontSize: 10 }}>Subtotal</td><td style={{ border: '1px solid #ccc', padding: '6px 10px', textAlign: 'right', fontWeight: 700, fontSize: 10 }}>{fmtMXN(subtotal)}</td></tr>
              <tr><td style={{ border: '1px solid #ccc', padding: '6px 10px', fontSize: 10 }}>IVA (16%)</td><td style={{ border: '1px solid #ccc', padding: '6px 10px', textAlign: 'right', fontSize: 10 }}>{fmtMXN(iva)}</td></tr>
              <tr style={{ background: NAVY, color: 'white' }}><td style={{ padding: '8px 10px', fontWeight: 800, fontSize: 11 }}>TOTAL</td><td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, fontSize: 11 }}>{fmtMXN(total)}</td></tr>
            </tbody>
          </table>
          {data.justificacion && <div style={{ marginBottom: 10 }}><div style={{ fontWeight: 800, marginBottom: 4 }}>JUSTIFICACIÓN:</div><p style={{ margin: 0, lineHeight: 1.7, fontSize: 10 }}>{data.justificacion}</p></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24 }}>
            {['elaborado_por','autorizado_por_micsa','autorizado_por_cliente'].map(k => (
              <div key={k} style={{ textAlign: 'center', borderTop: '1px solid #333', paddingTop: 6, fontSize: 9 }}>
                <div style={{ fontWeight: 700 }}>{data[k] || '_______________'}</div>
                <div style={{ color: '#666' }}>{k.replace(/_/g,' ').toUpperCase()}</div>
              </div>
            ))}
          </div>
          {fotos.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', fontSize: 11 }}>Evidencia Fotográfica</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {fotos.map((f, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={f.url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 4 }} />
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    )
  }

  // Generic preview for other doc types
  const docTitle = TIPO_TITLES[tipo] || tipo

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#111', background: 'white', display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
      <Watermark />
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <BHeader title={docTitle} />

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
          <tbody>
            {Object.entries(data).map(([k, v]) => v ? (
              <tr key={k}>
                <td style={tdL}>{k.replace(/_/g, ' ')}:</td>
                <td style={tdV}>{v}</td>
              </tr>
            ) : null)}
          </tbody>
        </table>

        {fotos.length > 0 && (
          <div>
            <div style={{ fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', fontSize: 11 }}>Evidencia FotogrÃ¡fica</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {fotos.map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={f.url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 4 }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
                  }
