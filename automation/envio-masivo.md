# Modulo B: Envio Masivo de Correos (104+)

## Arquitectura del Flujo

```
[Schedule/Manual Trigger]
         |
[Google Sheets: Get Rows] -- obtiene lista de contactos
         |
[Loop Over Items] -- itera fila por fila
         |
[OpenAI: GPT-4o mini] -- personaliza mensaje por contacto (opcional)
         |
[Gmail: Send Email] -- envia con plantilla HTML
         |
[Wait: 1-5 seg] -- delay anti-spam entre envios
         |
[Google Sheets: Update Row] -- marca como "Enviado"
```

## Configuracion de Google Sheets

### Hoja: "Contactos Masivos"

| Columna | Header | Tipo |
|---------|--------|------|
| A | Nombre | Texto |
| B | Empresa | Texto |
| C | Correo | Email |
| D | Servicio Interes | Texto |
| E | Estatus Envio | Texto (Pendiente/Enviado) |
| F | Fecha Envio | Fecha |

## Estrategia Anti-Spam (CRITICO)

### 1. Nodo Wait entre envios
- Insertar delay aleatorio de **1-5 segundos** entre cada correo
- Simula comportamiento humano
- Evita que Gmail marque como spam masivo

### 2. Personalizacion obligatoria
- NUNCA enviar texto plano identico a todos
- Usar plantillas HTML con variables dinamicas:
  - `{{nombre}}` del destinatario
  - `{{empresa}}` del cliente
  - `{{servicio}}` especifico

### 3. Limites de envio Gmail
- Gmail personal: **500 correos/dia**
- Google Workspace: **2,000 correos/dia**
- Recomendacion: No superar **100 correos por ejecucion**
- Para 104 correos: dividir en 2 lotes de 52

### 4. Marca blanca
- Desactivar "Append n8n/Make Attribution" en todos los nodos
- No incluir footer de herramienta de automatizacion

### 5. Configuracion de remitente
- Usar nombre de empresa: "Grupo MICSA" como display name
- Reply-to: micdelcentro@gmail.com
- Agregar firma HTML profesional

## Prompt para Personalizacion con IA

```
Eres un redactor profesional de correos comerciales para Grupo MICSA,
empresa de montajes industriales e izajes en San Luis Potosi.

Tu tarea: redactar un correo breve (3-4 parrafos) para {{nombre}} de
{{empresa}} sobre nuestros servicios de {{servicio}}.

Reglas:
- Tono profesional pero cercano
- Mencionar beneficios especificos del servicio
- No inventar datos tecnicos
- Incluir llamada a accion clara
- Maximo 150 palabras
```

## Consideraciones Plan Free Make.com

Con 1,000 operaciones/mes en plan Free:
- Cada envio = ~4 operaciones (read + AI + send + update)
- Maximo ~250 correos/mes con el plan actual
- Para 104 correos mensuales: viable en plan Free
- Para volumenes mayores: requiere upgrade a Core ($10.59/mes, 10,000 ops)
