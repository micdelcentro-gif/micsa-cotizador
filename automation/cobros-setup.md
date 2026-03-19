# Modulo A: Seguimiento de Cobros Automatico

## Scenario ID: 4859022
**Carpeta**: MICSA Automatizacion (ID: 314223)
**Frecuencia**: Cada 24 horas
**Estado**: Inactivo (requiere configuracion de Google Sheet)

---

## Flujo del Scenario

```
[Schedule Trigger] --> [Google Sheets: Search Rows] --> [Gmail: Send Email] --> [Google Sheets: Update Row]
     (diario)          (filtrar Estatus=Pendiente)     (HTML personalizado)     (marcar Enviado)
```

## Paso 1: Crear Google Sheet

Crear un spreadsheet llamado **"MICSA - Control de Cobros"** con una hoja llamada **"Cobros"**.

### Columnas requeridas (fila 1 = headers):

| Columna | Header | Tipo | Ejemplo |
|---------|--------|------|---------|
| A | Cliente Nombre | Texto | Pemex Refinacion |
| B | Planta | Texto | Refineria Madero |
| C | Servicio | Texto | Montaje de torre de destilacion |
| D | Numero Factura | Texto | FAC-2026-0145 |
| E | Monto | Numero | 385000.00 |
| F | Fecha Limite | Fecha | 2026-03-20 |
| G | Correo Cliente | Email | compras@pemex.com |
| H | Telefono | Texto | (833) 215-4000 |
| I | Estatus | Texto | Pendiente |
| J | Dias Vencido | Numero | 5 |
| K | Notas | Texto | Segunda factura del proyecto |

### Valores validos para Estatus (columna I):
- `Pendiente` - Factura emitida, pago no recibido
- `Enviado` - Recordatorio enviado por email
- `Pagado` - Pago confirmado
- `Vencido` - Mas de 30 dias sin pago
- `En disputa` - Cliente cuestiona el monto

## Paso 2: Configurar Spreadsheet ID en Make.com

1. Abrir el spreadsheet en Google Sheets
2. Copiar el ID de la URL: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`
3. En Make.com, abrir Scenario 4859022
4. Editar modulo "Search Rows" -> pegar spreadsheet ID
5. Editar modulo "Update Row" -> pegar spreadsheet ID

## Paso 3: Crear Conexion Gmail

1. En Make.com -> Connections -> Create a connection
2. Seleccionar **Google (Gmail)** como tipo
3. Autorizar con `micdelcentro@gmail.com`
4. Agregar modulo "Gmail: Send an Email" entre Search Rows y Update Row

### Configuracion del modulo Gmail:

```
To:        {{1.G}}  (correo del cliente)
Subject:   Grupo MICSA - Recordatorio de Pago | Factura {{1.D}}
Body Type: Raw HTML
Content:   [usar email-template.html con variables dinamicas]
```

## Paso 4: Activar Scenario

1. Verificar que todos los modulos tienen conexiones validas
2. Ejecutar una vez en modo "Run once" para probar
3. Cambiar estado a "Active" (ON)

## Data Structure: MICSA - Registro de Cobros (ID: 340938)

```json
{
  "cliente_nombre": "text (requerido)",
  "planta": "text",
  "servicio": "text (requerido)",
  "numero_factura": "text",
  "monto": "number (requerido)",
  "fecha_limite": "date (requerido)",
  "correo_cliente": "text (requerido)",
  "telefono": "text",
  "estatus": "text (requerido)",
  "dias_vencido": "number",
  "notas": "text"
}
```

## Logica Anti-Duplicados

El scenario solo busca filas donde `Estatus = "Pendiente"`.
Despues de enviar el correo, actualiza automaticamente la fila a `Estatus = "Enviado"`.
Esto garantiza que no se envien correos repetidos al mismo cliente.
