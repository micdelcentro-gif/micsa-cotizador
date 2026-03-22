# Modulo D: Clasificador Inteligente de Gmail

## Arquitectura

```
[Gmail: Watch Emails] -- correo nuevo en INBOX
         |
[AI Text Classifier: GPT-4o mini] -- analiza asunto + cuerpo
         |
   [Router por categoria]
   /     |      |       \
[Presup] [Fact] [Reclam] [Soporte]
   |     |      |       |
[Gmail: Add Label] -- aplica etiqueta correspondiente
         |
[Telegram: Send Summary] -- resumen al equipo operativo
```

## Labels de Gmail a Crear

Crear estas etiquetas en Gmail (micdelcentro@gmail.com):

| Label | Color | Descripcion |
|-------|-------|-------------|
| Presupuestos | Verde | Solicitudes de cotizacion, RFQ, licitaciones |
| Facturacion | Azul | Facturas, pagos, complementos, CFDI |
| Reclamos | Rojo | Quejas, inconformidades, penalizaciones |
| Soporte Tecnico | Amarillo | Dudas tecnicas, manuales, especificaciones |

## Prompt del Clasificador

```
Analiza el siguiente correo electronico y clasifícalo en UNA de estas
categorias:

1. PRESUPUESTOS - Si contiene: solicitud de cotizacion, licitacion,
   request for quote, presupuesto, precio, tarifa, catalogo
2. FACTURACION - Si contiene: factura, pago, CFDI, complemento de pago,
   estado de cuenta, transferencia, deposito
3. RECLAMOS - Si contiene: queja, inconformidad, penalizacion, demora,
   incumplimiento, reclamo, problema, error
4. SOPORTE_TECNICO - Si contiene: especificacion, manual, plano, dibujo,
   capacidad de carga, certificado, norma

Responde UNICAMENTE con el nombre de la categoria (ej: "FACTURACION").
Si no encaja en ninguna, responde "SIN_CLASIFICAR".

Asunto: {{email.subject}}
De: {{email.from}}
Cuerpo: {{email.body}}
```

## Resumen para Telegram

Despues de clasificar, enviar al canal de Telegram del equipo:

```
📧 Nuevo correo clasificado:
📁 Categoria: {{clasificacion}}
👤 De: {{email.from}}
📝 Asunto: {{email.subject}}
⏰ Recibido: {{email.date}}
```

## Implementacion en Make.com

### Opcion A: Con plan Free (sin IA)
- Usar filtros basados en palabras clave del asunto
- Router con condiciones:
  - Si asunto contiene "cotizacion|precio|presupuesto" -> Presupuestos
  - Si asunto contiene "factura|pago|CFDI" -> Facturacion
  - Si asunto contiene "queja|reclamo|problema" -> Reclamos
  - Default -> Soporte Tecnico

### Opcion B: Con OpenAI (requiere conexion)
- Usar modulo OpenAI: Create Completion
- Pasar prompt de clasificacion
- Usar Router basado en la respuesta del modelo

## Nota sobre Scenario Slots

Este modulo requiere un scenario slot adicional.
- Plan Free: 2 scenarios max (ambos ocupados actualmente)
- Para activar: upgrade a Core o eliminar scenario legacy de Airtable
