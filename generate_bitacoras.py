import json
from datetime import datetime, timedelta

start = datetime(2026, 1, 26)
today = datetime(2026, 3, 19)

def workdays(start, end):
    days = []
    d = start
    while d <= end:
        if d.weekday() != 6:
            days.append(d)
        d += timedelta(days=1)
    return days

work_days = workdays(start, today)

s1 = {
    "resumen": "Arranque del proyecto. LCH y LCV-4 mayormente energizados. Sin acceso a equipos criticos. Dependencia total de liberacion por planta.",
    "detalles": [
        {"nombre": "Reconocimiento de area", "desc": "Recorrido completo de planta Carrier A-470, identificacion de lineas LCH y LCV-4, evaluacion de condiciones de acceso"},
        {"nombre": "Levantamiento tecnico", "desc": "Inicio de registro fotografico de equipos para packing list, identificacion de numeros de serie y ubicaciones"},
        {"nombre": "Planeacion de intervencion", "desc": "Definicion de secuencia de desmantelamiento, evaluacion de restricciones por equipos energizados"},
        {"nombre": "Etiquetado general", "desc": "Inicio de etiquetado de cabinas y lineas para control documental"},
        {"nombre": "Retiro de perifericos", "desc": "Retiro de scrap no energizado y perifericos accesibles sin riesgo electrico"},
    ],
    "personal": 20, "area": "CARRIER MEXICO — Planta A-470 / LCH y LCV-4",
    "hi": "7:00 am", "hf": "17:00 pm",
}

s2 = {
    "resumen": "Inicio de desmantelamiento parcial. Hairpin Bender sigue en produccion. Cabina LCV-4 energizada. Liberaciones parciales permiten intervencion en perifericos.",
    "detalles": [
        {"nombre": "Desmantelamiento cabina LCH", "desc": "Inicio de desmantelamiento de cabina LCH, continuacion de etiquetado tecnico"},
        {"nombre": "Equipos perifericos LCV-4", "desc": "Inicio de desmantelamiento en carros de linea (transferencias), equipos no energizados"},
        {"nombre": "Avellanadora M-1763", "desc": "Desconexion y preparacion para desmontaje de Avellanadora ADM-003485"},
        {"nombre": "Brazer M-1713", "desc": "Desconexion de Brazer serial 282, preparacion de embalaje"},
        {"nombre": "Dobladora de coil M-1711", "desc": "Desmantelamiento de Dobladora CFM M14-13, 2 TONS"},
        {"nombre": "Dobladora de grill M-1725", "desc": "Desconexion de Dobladora serial 586-1-1015, 2 TONS"},
        {"nombre": "Ductos LCV4", "desc": "Retiro de ductos 454 de linea LCV-4"},
        {"nombre": "Hairpin Bender M-21", "desc": "Preparacion para intervencion post-produccion"},
        {"nombre": "Flejadora M-1751", "desc": "Desconexion y retiro de flejadora"},
    ],
    "personal": 20, "area": "CARRIER MEXICO — Planta A-470 / LCH y LCV-4",
    "hi": "7:00 am", "hf": "17:00 pm",
}

s3 = {
    "resumen": "Hairpin Bender finaliza produccion. Inicio de liberacion progresiva. Reduccion de personal de 20 a 14 personas por falta de liberacion total.",
    "detalles": [
        {"nombre": "Continuacion cabina LCH", "desc": "Avance en desmantelamiento de cabina LCH, retiro de paneles y estructura"},
        {"nombre": "Desconexion electrica LCV-4", "desc": "Desconexion electrica de equipos liberados, implementacion de LOTO"},
        {"nombre": "Desconexion hidraulica", "desc": "Desconexion de lineas hidraulicas en equipos desenergizados"},
        {"nombre": "Marcaje de cableado", "desc": "Identificacion y marcaje completo de cableado para reinstalacion"},
        {"nombre": "Validacion ausencia de energia", "desc": "Trabajo electrico intensivo: verificacion de ausencia de energia en cada equipo"},
        {"nombre": "Envio a area de embarque", "desc": "Traslado de equipos desmantelados a area de resguardo interno"},
    ],
    "personal": 14, "area": "CARRIER MEXICO — Planta A-470 / LCH y LCV-4",
    "hi": "7:00 am", "hf": "17:00 pm",
}

s4 = {
    "resumen": "Cabina LCV-4 liberada: grua y Fin Press desenergizadas. Mayor acceso operativo. LCH: envio de equipos a Planta C sin restriccion logistica.",
    "detalles": [
        {"nombre": "Embarque LCH a Planta C", "desc": "Envio de equipos LCH a Planta C, flujo continuo sin retrasos logisticos"},
        {"nombre": "Embarque Cabina LCH — Packing F.001", "desc": "Carga de soportes, puertas y estructura de cabina LCH en lowboys para transporte"},
        {"nombre": "Intervencion Fin Press LCV-4", "desc": "Inicio de desconexion electrica y desmontaje de Fin Press M-1701 a M-1704"},
        {"nombre": "Intervencion cabina LCV-4", "desc": "Acceso a cabina desenergizada, inicio de desmontaje de grua viajera A00511"},
        {"nombre": "Embarque Expander LCH", "desc": "Embarque de Expander M-37 (17 TONS) a Planta C"},
        {"nombre": "Clasificacion de activos", "desc": "Separacion de equipos: activos para Planta C vs chatarra para Planta A"},
    ],
    "personal": 18, "area": "CARRIER MEXICO — Planta A-470 / LCH y LCV-4 / Exterior",
    "hi": "7:00 am", "hf": "17:30 pm",
}

s5 = {
    "resumen": "Equipos LCV-4 desconectados, desmantelados y listos para embarque. PROBLEMA CRITICO: Planta G sin disponibilidad de espacio para embarque.",
    "detalles": [
        {"nombre": "Embalaje de equipos", "desc": "Embalaje industrial de equipos desmantelados para transporte"},
        {"nombre": "Clasificacion logistica", "desc": "Organizacion y clasificacion de equipos por destino y prioridad de embarque"},
        {"nombre": "Resguardo en area interna", "desc": "Almacenamiento temporal de equipos listos en patio interno por falta de salida"},
        {"nombre": "Preparacion de maniobras", "desc": "Planeacion de maniobras de carga para cuando se libere Planta G"},
        {"nombre": "Control documental", "desc": "Actualizacion de packing lists y registros de activos"},
    ],
    "personal": 18, "area": "CARRIER MEXICO — Planta A-470 / LCV-4 / Patio",
    "hi": "7:00 am", "hf": "17:00 pm",
}

s6 = {
    "resumen": "Persistencia de restriccion en Planta G. Equipos detenidos en patio. Continuacion de embalaje, organizacion y control documental.",
    "detalles": [
        {"nombre": "Continuacion de embalaje", "desc": "Embalaje adicional de equipos pendientes y aseguramiento de cargas"},
        {"nombre": "Organizacion de patio", "desc": "Reordenamiento de equipos en area de resguardo para optimizar espacio"},
        {"nombre": "Validacion electrica final", "desc": "Trabajo continuo de electricos: validacion, desconexion y seguridad en equipos restantes"},
        {"nombre": "Control documental", "desc": "Actualizacion de registros, packing lists y status de embarque"},
        {"nombre": "Coordinacion Planta G", "desc": "Coordinacion con Planta G para liberacion de espacio de embarque"},
    ],
    "personal": 18, "area": "CARRIER MEXICO — Planta A-470 / LCV-4 / Patio",
    "hi": "7:00 am", "hf": "17:00 pm",
}

s7 = {
    "resumen": "Se libera espacio en Planta G. Inicio de embarques masivos de equipos LCV-4 acumulados.",
    "detalles": [
        {"nombre": "Embarque Fin Press M-1701", "desc": "Carga y embarque de Fin Press M-1701 (20 TONS) hacia Planta C con lowboy"},
        {"nombre": "Embarque Fin Press M-1702", "desc": "Embarque de Fin Press M-1702 (activo A00442), desconexion electrica completada"},
        {"nombre": "Embarque Fin Press M-1703", "desc": "Carga de Fin Press M-1703 en plataforma de transporte"},
        {"nombre": "Embarque Fin Press M-1704", "desc": "Ultimo Fin Press embarcado, aseguramiento sobre cama baja"},
        {"nombre": "Embarque Grua M-1705", "desc": "Desmontaje y embarque de grua viajera de LCV-4"},
        {"nombre": "Equipos auxiliares", "desc": "Embarque de equipos auxiliares acumulados desde semana 5"},
        {"nombre": "Avance Run Test e HIPOT", "desc": "Avance en sistemas de prueba Run Test para verificacion de equipos"},
    ],
    "personal": 18, "area": "CARRIER MEXICO — Planta A-470 / LCV-4 / Exterior / Planta G",
    "hi": "7:00 am", "hf": "17:30 pm",
}

s8 = {
    "resumen": "Cierre operativo en curso. Continuacion de embarques. Carga de celdas Finpress sobre lowboys. Desmontaje de grua puente PROSIMEC en area LCV Supermarket.",
    "detalles": [
        {"nombre": "Carga de Finpress #1 en lowboy", "desc": "Desmontaje de celda, rigging y carga sobre cama baja de 3 ejes con montacargas Hoist 40/60K"},
        {"nombre": "Carga de Finpress #2 en lowboy", "desc": "Extraccion de celda desde interior de planta por pasillo lateral con montacargas"},
        {"nombre": "Carga de Finpress #3 en lowboy", "desc": "Maniobra con Hoist 40/60K, posicionamiento y aseguramiento sobre plataforma de transporte"},
        {"nombre": "Carga de Finpress #4 en lowboy", "desc": "Ultima celda Finpress, carga y amarre en cama baja roja con trailer Sterling"},
        {"nombre": "Desmontaje grua puente PROSIMEC", "desc": "Desmontaje completo en area LCV Supermarket: desconexiones electricas, cortes de estructura, descenso de viga principal"},
        {"nombre": "Preparacion Expanders LCV-4", "desc": "Evaluacion de condiciones de maniobra para expanders de 24 TONS"},
        {"nombre": "Cierre documental", "desc": "Actualizacion final de packing lists, status de embarque y control de activos"},
    ],
    "personal": 8, "area": "CARRIER MEXICO — Planta LCV / Exterior",
    "hi": "8:00 am", "hf": "17:30 pm",
}

week_data = {1: s1, 2: s2, 3: s3, 4: s4, 5: s5, 6: s6, 7: s7, 8: s8}

def get_week_num(d):
    delta = (d - start).days
    return min((delta // 7) + 1, 8)

folio_num = 1
all_bitacoras = []

for day in work_days:
    wk = get_week_num(day)
    data = week_data.get(wk, s8)
    dow = day.weekday()
    num_act = min(len(data["detalles"]), max(2, dow + 2))
    start_idx = dow % len(data["detalles"])
    day_acts = []
    for i in range(num_act):
        idx = (start_idx + i) % len(data["detalles"])
        day_acts.append(data["detalles"][idx])

    bitacora = {
        "folio": f"BIT-2026-{folio_num:04d}",
        "fecha": day.strftime("%Y-%m-%d"),
        "dia": ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"][dow],
        "semana": wk,
        "proyecto": "Especifica tecnica 43766",
        "cliente": "CARRIER MEXICO — AMISA",
        "supervisor": "Angel Rodriguez",
        "area": data["area"],
        "horario_inicio": data["hi"],
        "horario_fin": data["hf"],
        "personal": data["personal"],
        "permisos": {"trabajo_caliente": wk >= 3, "trabajo_rojo": wk >= 4, "alturas": wk >= 4},
        "resumen": data["resumen"],
        "actividades": day_acts,
    }
    all_bitacoras.append(bitacora)
    folio_num += 1

with open(r"C:\Users\Tecnolaps\micsa-cotizador\.claude\worktrees\frosty-visvesvaraya\bitacoras_carrier.json", "w", encoding="utf-8") as f:
    json.dump(all_bitacoras, f, indent=2, ensure_ascii=False)

print(f"Total bitacoras: {len(all_bitacoras)}")
print(f"Rango: {all_bitacoras[0]['fecha']} a {all_bitacoras[-1]['fecha']}")
for b in all_bitacoras:
    print(f"  {b['folio']} | {b['fecha']} ({b['dia']}) | Sem {b['semana']} | {b['personal']} pers | {len(b['actividades'])} actividades")
