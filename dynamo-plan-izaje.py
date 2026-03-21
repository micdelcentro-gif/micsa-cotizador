"""
MICSA — Generador de Modelo 3D para Revit via Dynamo/Python
Plan de Izaje PI-2026-001 — Expander Sencilla — Carrier
=============================================================
Uso:
  1. Abrir Revit → Manage → Dynamo
  2. File → New → Python Script node
  3. Pegar este código completo
  4. Conectar salida a Watch node para verificar
  5. Run → genera familias genéricas en el modelo activo

Requisitos: Revit 2023+ con Dynamo 2.x, RevitAPI, ProtoGeometry
"""

import clr
import sys
import math

# ── Revit API ──
clr.AddReference('RevitAPI')
clr.AddReference('RevitAPIUI')
clr.AddReference('RevitServices')
clr.AddReference('ProtoGeometry')

from Autodesk.Revit.DB import *
from Autodesk.Revit.DB.Structure import StructuralType
from RevitServices.Persistence import DocumentManager
from RevitServices.Transactions import TransactionManager
from Autodesk.DesignScript.Geometry import Point as DSPoint

doc = DocumentManager.Instance.CurrentDBDocument
app = doc.Application

# ═══════════════════════════════════════════════════
# DATOS DEL PLAN DE IZAJE PI-2026-001
# ═══════════════════════════════════════════════════
PLAN = {
    'folio': 'MG-2026-001',
    'proyecto': 'Maniobra de izaje Expander Sencilla',
    'cliente': 'Carrier',
    'ubicacion': 'Santa Catarina, N.L.',
    'equipo': 'Montacargas Versa-Lift 40/60',
    'cap_nominal_ton': 27.2,
    'peso_carga_ton': 17.2,
    'utilizacion_pct': 69,
    'radio_op_m': 2.5,
    'altura_izaje_m': 7.5,
    'rigger': 'Joel R González',
    'senalero': 'Victor Bustos Ramos',
    'supervisor': 'Roberto Sifuentes',
    'norma': 'NOM-006-STPS-2014',
    'zona_exclusion_m': 11.25,  # 1.5x altura
}

# Conversión metros → pies (Revit trabaja en pies internamente)
def m2ft(m):
    return m * 3.28084

def cm2ft(cm):
    return cm * 0.0328084

# ═══════════════════════════════════════════════════
# MATERIALES
# ═══════════════════════════════════════════════════
def get_or_create_material(name, r, g, b, transparency=0):
    """Busca material por nombre o crea uno nuevo."""
    collector = FilteredElementCollector(doc).OfClass(Material)
    for mat in collector:
        if mat.Name == name:
            return mat.Id

    # Crear material nuevo
    mat_id = Material.Create(doc, name)
    mat = doc.GetElement(mat_id)
    mat.Color = Color(r, g, b)
    mat.Transparency = transparency
    mat.Shininess = 80
    return mat_id

# ═══════════════════════════════════════════════════
# GEOMETRÍA: CREAR SÓLIDOS
# ═══════════════════════════════════════════════════
def create_box(x, y, z, width, depth, height):
    """Crea un sólido tipo caja en coordenadas dadas (metros)."""
    x_ft = m2ft(x - width/2)
    y_ft = m2ft(y - depth/2)
    z_ft = m2ft(z)
    w_ft = m2ft(width)
    d_ft = m2ft(depth)
    h_ft = m2ft(height)

    pts = [
        XYZ(x_ft, y_ft, z_ft),
        XYZ(x_ft + w_ft, y_ft, z_ft),
        XYZ(x_ft + w_ft, y_ft + d_ft, z_ft),
        XYZ(x_ft, y_ft + d_ft, z_ft),
    ]

    lines = CurveLoop()
    for i in range(4):
        lines.Append(Line.CreateBound(pts[i], pts[(i+1) % 4]))

    return GeometryCreationUtilities.CreateExtrusionGeometry(
        [lines], XYZ.BasisZ, h_ft
    )

def create_cylinder(x, y, z, radius, height, axis='z'):
    """Crea un cilindro en las coordenadas dadas (metros)."""
    r_ft = m2ft(radius)
    h_ft = m2ft(height)
    center = XYZ(m2ft(x), m2ft(y), m2ft(z))

    if axis == 'z':
        frame = Frame(center, XYZ.BasisX, XYZ.BasisY, XYZ.BasisZ)
    elif axis == 'x':
        frame = Frame(center, XYZ.BasisY, XYZ.BasisZ, XYZ.BasisX)
    else:  # y
        frame = Frame(center, XYZ.BasisX, XYZ.BasisZ, XYZ.BasisY)

    circle = [CurveLoop.Create([
        Arc.Create(
            Plane.CreateByNormalAndOrigin(
                XYZ.BasisZ if axis == 'z' else (XYZ.BasisX if axis == 'x' else XYZ.BasisY),
                center
            ),
            r_ft, 0, 2 * math.pi
        )
    ])]

    direction = XYZ.BasisZ if axis == 'z' else (XYZ.BasisX if axis == 'x' else XYZ.BasisY)
    return GeometryCreationUtilities.CreateExtrusionGeometry(circle, direction, h_ft)

# ═══════════════════════════════════════════════════
# MODELO: MONTACARGAS VERSA-LIFT 40/60
# ═══════════════════════════════════════════════════
def create_versalift(origin_x=4.0, origin_y=0.0):
    """
    Genera la geometría del Versa-Lift 40/60 como DirectShape.
    El montacargas se posiciona a la DERECHA mirando a -X.
    """
    solids = []
    ox, oy = origin_x, origin_y

    # ── Chasis principal ──
    # Cuerpo (2.2m ancho x 3.8m largo x 1.6m alto)
    solids.append(('MICSA_VersaLift_Chasis',
        create_box(ox, oy, 0.6, 2.2, 3.8, 1.6),
        'MICSA_Amarillo_Equipo'))

    # Compartimento motor (trasero)
    solids.append(('MICSA_VersaLift_Motor',
        create_box(ox, oy + 1.8, 0.6, 2.0, 1.4, 1.8),
        'MICSA_Amarillo_Equipo'))

    # Contrapeso
    solids.append(('MICSA_VersaLift_Contrapeso',
        create_box(ox, oy + 2.7, 0.6, 2.1, 0.5, 1.2),
        'MICSA_Gris_Oscuro'))

    # Cabina
    solids.append(('MICSA_VersaLift_Cabina',
        create_box(ox, oy - 0.3, 2.2, 2.0, 1.5, 1.8),
        'MICSA_Amarillo_Equipo'))

    # Techo cabina
    solids.append(('MICSA_VersaLift_Techo',
        create_box(ox, oy, 3.6, 2.1, 1.5, 0.1),
        'MICSA_Gris_Oscuro'))

    # ── Ruedas (4) ──
    wheel_positions = [
        (ox - 0.85, oy - 1.0),  # Front-left
        (ox + 0.85, oy - 1.0),  # Front-right
        (ox - 0.85, oy + 1.6),  # Rear-left
        (ox + 0.85, oy + 1.6),  # Rear-right
    ]
    for i, (wx, wy) in enumerate(wheel_positions):
        solids.append((f'MICSA_VersaLift_Rueda_{i+1}',
            create_box(wx, wy, 0.0, 0.5, 0.9, 0.9),
            'MICSA_Negro_Caucho'))

    # ── Mástil vertical ──
    # Rieles exteriores
    solids.append(('MICSA_VersaLift_MastilIzq',
        create_box(ox - 0.45, oy - 1.5, 0.6, 0.15, 0.15, 5.5),
        'MICSA_Gris_Oscuro'))
    solids.append(('MICSA_VersaLift_MastilDer',
        create_box(ox + 0.45, oy - 1.5, 0.6, 0.15, 0.15, 5.5),
        'MICSA_Gris_Oscuro'))

    # Travesaños
    for h in [1.5, 3.0, 4.5]:
        solids.append((f'MICSA_VersaLift_Travesano_{h}',
            create_box(ox, oy - 1.5, h, 1.0, 0.1, 0.1),
            'MICSA_Gris_Oscuro'))

    # ── Boom articulado (brazo en L) ──
    # Brazo horizontal apuntando a -X (hacia la máquina)
    boom_base_z = 5.8  # metros de altura
    boom_length = 4.0   # metros

    solids.append(('MICSA_VersaLift_BoomArm',
        create_box(ox - 2.0, oy - 1.5, boom_base_z, 4.0, 0.4, 0.5),
        'MICSA_Gris_Oscuro'))

    # Cabeza del boom
    solids.append(('MICSA_VersaLift_BoomHead',
        create_box(ox - 4.0, oy - 1.5, boom_base_z, 0.5, 0.5, 0.6),
        'MICSA_Gris_Oscuro'))

    # Cilindro hidráulico
    solids.append(('MICSA_VersaLift_Hidraulico',
        create_box(ox - 1.0, oy - 1.5, boom_base_z + 0.4, 2.0, 0.16, 0.16),
        'MICSA_Gris_Medio'))

    return solids

# ═══════════════════════════════════════════════════
# MODELO: EXPANDER SENCILLA (CARGA 17.2 TON)
# ═══════════════════════════════════════════════════
def create_expander(origin_x=-3.0, origin_y=0.0, tilt_deg=75):
    """
    Genera la geometría del Expander (máquina industrial) como DirectShape.
    Posicionada a la IZQUIERDA del montacargas.
    tilt_deg: 90=vertical, 0=horizontal
    """
    solids = []
    ox, oy = origin_x, origin_y

    # Nota: para simplificar en Revit, generamos la máquina vertical.
    # El ángulo de inclinación se puede ajustar rotando el DirectShape
    # o creando diferentes snapshots para cada fase.

    # ── Cuerpo principal (1.4m x 1.2m x 5.5m alto) ──
    solids.append(('MICSA_Expander_Cuerpo',
        create_box(ox, oy, 0.3, 1.4, 1.2, 5.5),
        'MICSA_Blanco_Maquina'))

    # Sección superior
    solids.append(('MICSA_Expander_Top',
        create_box(ox, oy, 5.5, 1.6, 1.4, 1.0),
        'MICSA_Blanco_Maquina'))

    # Panel de control azul
    solids.append(('MICSA_Expander_Panel',
        create_box(ox, oy + 0.6, 0.5, 1.2, 0.15, 1.0),
        'MICSA_Azul_Panel'))

    # Etiqueta roja
    solids.append(('MICSA_Expander_Etiqueta',
        create_box(ox, oy + 0.65, 1.3, 0.4, 0.02, 0.25),
        'MICSA_Rojo_Alerta'))

    # Aletas laterales
    for side in [-0.75, 0.75]:
        solids.append(('MICSA_Expander_Aleta',
            create_box(ox + side, oy, 1.5, 0.08, 1.0, 3.0),
            'MICSA_Gris_Medio'))

    # Tubos internos
    for h in [1.5, 2.5, 3.5, 4.5]:
        solids.append((f'MICSA_Expander_Tubo_{h}',
            create_box(ox, oy, h, 1.2, 0.24, 0.24),
            'MICSA_Gris_Medio'))

    # Base / tarima
    solids.append(('MICSA_Expander_Base',
        create_box(ox, oy, 0.0, 1.8, 1.6, 0.3),
        'MICSA_Gris_Oscuro'))

    # Punto de izaje (anillo)
    solids.append(('MICSA_Expander_PuntoIzaje',
        create_box(ox, oy, 6.3, 0.2, 0.2, 0.2),
        'MICSA_Rojo_Alerta'))

    return solids

# ═══════════════════════════════════════════════════
# MODELO: ZONA DE EXCLUSIÓN Y ANOTACIONES
# ═══════════════════════════════════════════════════
def create_exclusion_zone():
    """Genera el perímetro de zona de exclusión NOM-006."""
    solids = []
    r = PLAN['zona_exclusion_m']  # 11.25m

    # Anillo en el suelo (representado como caja delgada)
    # Se crea como un cuadrado simplificado para compatibilidad
    solids.append(('MICSA_ZonaExclusion_Norte',
        create_box(0, r, 0.01, r * 2, 0.1, 0.05),
        'MICSA_Rojo_Alerta'))
    solids.append(('MICSA_ZonaExclusion_Sur',
        create_box(0, -r, 0.01, r * 2, 0.1, 0.05),
        'MICSA_Rojo_Alerta'))
    solids.append(('MICSA_ZonaExclusion_Este',
        create_box(r, 0, 0.01, 0.1, r * 2, 0.05),
        'MICSA_Rojo_Alerta'))
    solids.append(('MICSA_ZonaExclusion_Oeste',
        create_box(-r, 0, 0.01, 0.1, r * 2, 0.05),
        'MICSA_Rojo_Alerta'))

    return solids

# ═══════════════════════════════════════════════════
# MODELO: TARIMA DE DESCARGA
# ═══════════════════════════════════════════════════
def create_pallet(x=-3.0, y=0.0):
    """Tarima de madera para depositar la carga."""
    return [('MICSA_Tarima',
        create_box(x, y, 0.0, 2.0, 1.5, 0.15),
        'MICSA_Madera')]

# ═══════════════════════════════════════════════════
# MODELO: CABLE / ESLINGA
# ═══════════════════════════════════════════════════
def create_rigging(forklift_x=4.0, machine_x=-3.0, y=0.0):
    """Cable de izaje desde boom hasta punto de enganche."""
    boom_tip_x = forklift_x - 4.0
    boom_tip_z = 5.8
    machine_top_z = 6.3

    # Línea vertical desde boom hasta enganche (simplificada como caja delgada)
    mid_x = (boom_tip_x + machine_x) / 2
    length = math.sqrt((boom_tip_x - machine_x)**2 + (boom_tip_z - machine_top_z)**2)

    solids = [('MICSA_Cable_Izaje',
        create_box(mid_x, y - 0.5, min(boom_tip_z, machine_top_z),
                   abs(boom_tip_x - machine_x), 0.05, abs(boom_tip_z - machine_top_z)),
        'MICSA_Gris_Medio')]

    return solids

# ═══════════════════════════════════════════════════
# EJECUCIÓN PRINCIPAL
# ═══════════════════════════════════════════════════
output = []

TransactionManager.Instance.EnsureInTransaction(doc)

try:
    # ── Crear materiales ──
    materials = {
        'MICSA_Amarillo_Equipo': (245, 197, 24, 0),
        'MICSA_Gris_Oscuro': (34, 34, 34, 0),
        'MICSA_Gris_Medio': (153, 153, 153, 0),
        'MICSA_Negro_Caucho': (26, 26, 26, 0),
        'MICSA_Blanco_Maquina': (221, 224, 230, 0),
        'MICSA_Azul_Panel': (26, 58, 110, 0),
        'MICSA_Rojo_Alerta': (204, 34, 34, 30),
        'MICSA_Madera': (139, 115, 85, 0),
    }

    mat_ids = {}
    for name, (r, g, b, t) in materials.items():
        mat_ids[name] = get_or_create_material(name, r, g, b, t)

    output.append(f"✓ {len(materials)} materiales MICSA creados/verificados")

    # ── Obtener categoría para DirectShapes ──
    cat_id = ElementId(BuiltInCategory.OST_GenericModel)

    # ── Generar todas las piezas ──
    all_parts = []
    all_parts.extend(create_versalift(origin_x=4.0, origin_y=0.0))
    all_parts.extend(create_expander(origin_x=-3.0, origin_y=0.0))
    all_parts.extend(create_exclusion_zone())
    all_parts.extend(create_pallet(x=-3.0, y=0.0))
    all_parts.extend(create_rigging())

    # ── Crear DirectShapes en Revit ──
    count = 0
    for name, solid, mat_name in all_parts:
        ds = DirectShape.CreateElement(doc, cat_id)
        ds.SetShape([solid])
        ds.Name = name

        # Asignar material
        if mat_name in mat_ids:
            # Pintar todas las caras con el material
            geom = ds.get_Geometry(Options())
            if geom:
                for geom_obj in geom:
                    if isinstance(geom_obj, Solid):
                        for face in geom_obj.Faces:
                            doc.Paint(ds.Id, face, mat_ids[mat_name])

        count += 1

    output.append(f"✓ {count} elementos DirectShape creados")

    # ── Crear parámetros compartidos del Plan de Izaje ──
    # Agregar datos como comentarios en el primer elemento
    collector = FilteredElementCollector(doc).OfClass(DirectShape)
    first_ds = None
    for ds in collector:
        if ds.Name and ds.Name.startswith('MICSA_'):
            first_ds = ds
            break

    if first_ds:
        param = first_ds.get_Parameter(BuiltInParameter.ALL_MODEL_INSTANCE_COMMENTS)
        if param:
            info_text = (
                f"PLAN DE IZAJE {PLAN['folio']} | "
                f"{PLAN['proyecto']} | "
                f"Cliente: {PLAN['cliente']} | "
                f"Equipo: {PLAN['equipo']} | "
                f"Cap: {PLAN['cap_nominal_ton']} Ton | "
                f"Carga: {PLAN['peso_carga_ton']} Ton | "
                f"Util: {PLAN['utilizacion_pct']}% | "
                f"Radio: {PLAN['radio_op_m']}m | "
                f"Altura: {PLAN['altura_izaje_m']}m | "
                f"Norma: {PLAN['norma']} | "
                f"Rigger: {PLAN['rigger']} | "
                f"Señalero: {PLAN['senalero']} | "
                f"Supervisor: {PLAN['supervisor']}"
            )
            param.Set(info_text)
            output.append("✓ Datos del Plan de Izaje asignados como comentarios")

    output.append("")
    output.append("═══ RESUMEN ═══")
    output.append(f"Folio: {PLAN['folio']}")
    output.append(f"Proyecto: {PLAN['proyecto']}")
    output.append(f"Equipo: {PLAN['equipo']}")
    output.append(f"Carga: {PLAN['peso_carga_ton']} Ton / {PLAN['cap_nominal_ton']} Ton = {PLAN['utilizacion_pct']}%")
    output.append(f"Zona exclusión: {PLAN['zona_exclusion_m']}m (perímetro rojo en modelo)")
    output.append(f"Norma: {PLAN['norma']}")
    output.append("")
    output.append("Elementos creados:")
    output.append("  • Versa-Lift 40/60 (chasis, cabina, mástil, boom, ruedas)")
    output.append("  • Expander Sencilla (cuerpo, panel, tubos, base)")
    output.append("  • Zona de exclusión NOM-006 (perímetro rojo)")
    output.append("  • Tarima de descarga")
    output.append("  • Cable de izaje")
    output.append("")
    output.append("Para renderizar: View → Render → usar materiales MICSA_*")

except Exception as e:
    output.append(f"✗ Error: {str(e)}")

TransactionManager.Instance.TransactionTaskDone()

# Salida para Dynamo Watch node
OUT = "\n".join(output)
