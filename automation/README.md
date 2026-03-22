# MICSA - Sistema de Automatizacion Integral

Sistema de automatizacion para Montajes e Izajes del Centro S.A. (Grupo MICSA)
basado en Make.com, Google Sheets, Gmail y modelos de IA.

---

## Arquitectura

```
Google Sheets (Base de Datos)
        |
   Make.com (Orquestador)
   /        |         \
Gmail    WhatsApp    Kommo CRM
(Cobros)  (Ventas)   (Pipeline)
        |
   OpenAI GPT-4o mini
   (Personalizacion IA)
```

## Recursos Creados en Make.com

| Recurso | ID | Estado |
|---------|-----|--------|
| Organizacion | 6333720 | Activo |
| Team | 873966 | Activo |
| Carpeta "MICSA Automatizacion" | 314223 | Activo |
| Data Structure "Registro de Cobros" | 340938 | Activo |
| Scenario "Seguimiento Cobros" | 4859022 | Inactivo (requiere config) |
| Conexion Google (Sheets) | 4713987 | Activo |

## Plan Make.com: Free

- **Scenarios**: 2 max (1 usado por Airtable legacy, 1 nuevo cobros)
- **Operaciones**: 1,000/mes
- **Intervalo minimo**: 15 minutos
- **Data Stores**: 1 max, 1MB

## Modulos del Sistema

### A. Seguimiento de Cobros (ACTIVO)
Ver: [cobros-setup.md](./cobros-setup.md)

### B. Envio Masivo de Correos (104+)
Ver: [envio-masivo.md](./envio-masivo.md)

### C. Agente de Ventas WhatsApp 24/7
Ver: [agente-ventas.md](./agente-ventas.md)

### D. Clasificador Inteligente de Gmail
Ver: [clasificador-gmail.md](./clasificador-gmail.md)

### E. Template HTML de Email
Ver: [email-template.html](./email-template.html)

## Conexiones Requeridas

| App | Tipo Conexion | Estado |
|-----|---------------|--------|
| Google Sheets | `google` | Conectado (ID: 4713987) |
| Gmail | `google-email` | **PENDIENTE** - crear en Make.com UI |
| WhatsApp Business | `whatsapp-business` | **PENDIENTE** - requiere Meta Business |
| OpenAI | `openai` | **PENDIENTE** - requiere API key |
| Kommo CRM | `kommo` | **PENDIENTE** - requiere cuenta |

## Cuenta Gmail Vinculada

- **Email**: micdelcentro@gmail.com
- **Labels existentes**: SAT, Catalogo de conceptos, CRITICO
- **Labels por crear**: Presupuestos, Facturacion, Reclamos, Soporte Tecnico
