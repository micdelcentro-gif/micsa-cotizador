"""
MICSA — Plan de Izaje PI-2026-001 — Blender 3D
================================================
Uso: Blender → Scripting tab → Open → este archivo → Run Script
Genera: Versa-Lift 40/60 + Expander 17.2 Ton + Zona exclusión + Animación 6 fases
"""

import bpy
import math
import bmesh
from mathutils import Vector, Matrix

# Limpiar escena
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in bpy.data.collections:
    if col.name != 'Scene Collection':
        bpy.data.collections.remove(col)
for mat in bpy.data.materials:
    bpy.data.materials.remove(mat)

# ═══════════════════════════════════════════════════
# PLAN DE IZAJE PI-2026-001
# ═══════════════════════════════════════════════════
PLAN = {
    'folio': 'MG-2026-001',
    'equipo': 'Versa-Lift 40/60',
    'cap_ton': 27.2,
    'peso_ton': 17.2,
    'util_pct': 69,
    'radio_m': 2.5,
    'altura_m': 7.5,
    'zona_excl_m': 11.25,
}

# ═══════════════════════════════════════════════════
# MATERIALES PBR
# ═══════════════════════════════════════════════════
def create_mat(name, color, metallic=0.0, roughness=0.5, clearcoat=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Coat Weight'].default_value = clearcoat
    return mat

MAT = {
    'yellow':    create_mat('MICSA_Amarillo', (0.96, 0.77, 0.09), 0.15, 0.3, 0.4),
    'dark':      create_mat('MICSA_GrisOscuro', (0.08, 0.08, 0.1), 0.7, 0.4),
    'gray':      create_mat('MICSA_GrisMedio', (0.4, 0.4, 0.4), 0.6, 0.35),
    'light':     create_mat('MICSA_GrisClaro', (0.6, 0.6, 0.6), 0.7, 0.25, 0.2),
    'black':     create_mat('MICSA_Negro', (0.04, 0.04, 0.04), 0.05, 0.85),
    'machine':   create_mat('MICSA_Maquina', (0.87, 0.88, 0.9), 0.6, 0.2, 0.5),
    'blue':      create_mat('MICSA_Azul', (0.1, 0.23, 0.43), 0.2, 0.35, 0.3),
    'red':       create_mat('MICSA_Rojo', (0.8, 0.08, 0.08), 0.15, 0.4, 0.5),
    'wood':      create_mat('MICSA_Madera', (0.55, 0.45, 0.33), 0.0, 0.9),
    'floor':     create_mat('MICSA_Piso', (0.23, 0.24, 0.27), 0.05, 0.7),
    'wall':      create_mat('MICSA_Pared', (0.53, 0.53, 0.53), 0.0, 0.8),
    'pillar':    create_mat('MICSA_Pilar', (0.13, 0.33, 0.67), 0.4, 0.3, 0.3),
    'stripe':    create_mat('MICSA_FranjaAzul', (0.13, 0.4, 0.8), 0.0, 0.5),
    'glass':     create_mat('MICSA_Vidrio', (0.53, 0.67, 0.8), 0.1, 0.05),
    'orange':    create_mat('MICSA_Chaleco', (1.0, 0.4, 0.0), 0.0, 0.6),
}

# Vidrio transparente
glass_mat = MAT['glass']
glass_bsdf = glass_mat.node_tree.nodes.get('Principled BSDF')
glass_bsdf.inputs['Transmission Weight'].default_value = 0.7
glass_bsdf.inputs['IOR'].default_value = 1.45

# ═══════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════
def add_box(name, location, dimensions, mat, collection):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (dimensions[0]/2, dimensions[1]/2, dimensions[2]/2)
    obj.data.materials.append(mat)
    # Mover a colección
    for col in obj.users_collection:
        col.objects.unlink(obj)
    collection.objects.link(obj)
    return obj

def add_cylinder(name, location, radius, depth, mat, collection, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    for col in obj.users_collection:
        col.objects.unlink(obj)
    collection.objects.link(obj)
    return obj

# ═══════════════════════════════════════════════════
# COLECCIONES
# ═══════════════════════════════════════════════════
col_forklift = bpy.data.collections.new('MICSA_VersaLift')
bpy.context.scene.collection.children.link(col_forklift)

col_machine = bpy.data.collections.new('MICSA_Expander')
bpy.context.scene.collection.children.link(col_machine)

col_env = bpy.data.collections.new('MICSA_Nave')
bpy.context.scene.collection.children.link(col_env)

col_rigging = bpy.data.collections.new('MICSA_Rigging')
bpy.context.scene.collection.children.link(col_rigging)

# ═══════════════════════════════════════════════════
# NAVE INDUSTRIAL (entorno)
# ═══════════════════════════════════════════════════
# Piso
add_box('Piso', (0, 0, -0.05), (40, 40, 0.1), MAT['floor'], col_env)

# Franja azul
add_box('FranjaAzul', (-8, 0, -0.04), (1.5, 40, 0.02), MAT['stripe'], col_env)

# Pared trasera
add_box('ParedTrasera', (0, -15, 5), (40, 0.3, 10), MAT['wall'], col_env)

# Techo
add_box('Techo', (0, 0, 9.5), (40, 30, 0.15), MAT['wall'], col_env)

# Columnas azules
for x in [-10, -4, 2, 8]:
    add_box(f'Columna_{x}', (x, -6, 4.75), (0.3, 0.3, 9.5), MAT['pillar'], col_env)
    add_box(f'Viga_{x}', (x, 0, 9.3), (0.2, 12, 0.2), MAT['pillar'], col_env)

# ═══════════════════════════════════════════════════
# MONTACARGAS VERSA-LIFT 40/60
# ═══════════════════════════════════════════════════
FL_X = 4.0  # Posición X del forklift (derecha)

# Chasis
add_box('FL_Chasis', (FL_X, 0, 1.4), (2.2, 3.8, 1.6), MAT['yellow'], col_forklift)

# Motor
add_box('FL_Motor', (FL_X, 1.8, 1.5), (2.0, 1.4, 1.8), MAT['yellow'], col_forklift)

# Techo motor
add_box('FL_MotorTop', (FL_X, 1.6, 2.5), (2.0, 1.6, 0.4), MAT['yellow'], col_forklift)

# Contrapeso
add_box('FL_Contrapeso', (FL_X, 2.7, 1.2), (2.1, 0.5, 1.2), MAT['dark'], col_forklift)

# Cabina
add_box('FL_Cabina', (FL_X, -0.3, 2.8), (2.0, 1.5, 1.8), MAT['yellow'], col_forklift)

# Vidrios
add_box('FL_Parabrisas', (FL_X, -1.05, 3.1), (1.8, 0.08, 1.0), MAT['glass'], col_forklift)
add_box('FL_VidLat_L', (FL_X - 1.01, -0.3, 3.0), (0.08, 1.2, 0.9), MAT['glass'], col_forklift)
add_box('FL_VidLat_R', (FL_X + 1.01, -0.3, 3.0), (0.08, 1.2, 0.9), MAT['glass'], col_forklift)

# Techo cabina
add_box('FL_TechoCab', (FL_X, 0, 3.65), (2.1, 1.5, 0.1), MAT['dark'], col_forklift)

# Operador
add_box('FL_Operador', (FL_X, 0.2, 2.4), (0.5, 0.3, 0.7), MAT['orange'], col_forklift)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(FL_X, 0.2, 2.95))
head = bpy.context.active_object
head.name = 'FL_Cabeza'
head.data.materials.append(MAT['yellow'])
bpy.ops.object.shade_smooth()
for c in head.users_collection:
    c.objects.unlink(head)
col_forklift.objects.link(head)

# Ruedas
for i, (x, y) in enumerate([(-0.85, -1.0), (0.85, -1.0), (-0.85, 1.6), (0.85, 1.6)]):
    add_cylinder(f'FL_Rueda_{i}', (FL_X + x, y, 0.45), 0.45, 0.5, MAT['black'], col_forklift, (math.pi/2, 0, 0))
    add_cylinder(f'FL_Rin_{i}', (FL_X + x, y, 0.45), 0.2, 0.52, MAT['light'], col_forklift, (math.pi/2, 0, 0))

# Mástil
add_box('FL_MastilL', (FL_X - 0.45, -1.5, 3.5), (0.15, 0.15, 5.5), MAT['dark'], col_forklift)
add_box('FL_MastilR', (FL_X + 0.45, -1.5, 3.5), (0.15, 0.15, 5.5), MAT['dark'], col_forklift)
for h in [1.5, 3.0, 4.5]:
    add_box(f'FL_Trav_{h}', (FL_X, -1.5, h), (1.0, 0.1, 0.1), MAT['dark'], col_forklift)

# Boom articulado (apunta a -X, hacia la máquina)
BOOM_Z = 5.8
add_box('FL_BoomArm', (FL_X - 2.0, -1.5, BOOM_Z), (4.0, 0.4, 0.5), MAT['dark'], col_forklift)
add_box('FL_BoomHead', (FL_X - 4.0, -1.5, BOOM_Z), (0.5, 0.5, 0.6), MAT['dark'], col_forklift)

# Hidráulico
add_cylinder('FL_Hidraulico', (FL_X - 1.5, -1.5, BOOM_Z + 0.35), 0.08, 2.5, MAT['gray'], col_forklift, (0, math.pi/2, 0))

# ═══════════════════════════════════════════════════
# EXPANDER SENCILLA (17.2 Ton) — lado izquierdo
# ═══════════════════════════════════════════════════
MX = -3.5  # Posición X de la máquina

# Cuerpo principal
add_box('EX_Cuerpo', (MX, 0, 3.05), (1.4, 1.2, 5.5), MAT['machine'], col_machine)

# Top
add_box('EX_Top', (MX, 0, 5.8), (1.6, 1.4, 1.0), MAT['machine'], col_machine)

# Panel azul
add_box('EX_Panel', (MX, 0.63, 0.8), (1.2, 0.15, 1.0), MAT['blue'], col_machine)

# Etiqueta roja
add_box('EX_Etiqueta', (MX, 0.68, 1.5), (0.4, 0.02, 0.25), MAT['red'], col_machine)

# Aletas
add_box('EX_AletaL', (MX - 0.75, 0, 3.5), (0.08, 1.0, 3.0), MAT['light'], col_machine)
add_box('EX_AletaR', (MX + 0.75, 0, 3.5), (0.08, 1.0, 3.0), MAT['light'], col_machine)

# Tubos internos
for h in [1.5, 2.5, 3.5, 4.5]:
    add_cylinder(f'EX_Tubo_{h}', (MX, 0, h), 0.12, 1.2, MAT['light'], col_machine, (0, math.pi/2, 0))

# Base
add_box('EX_Base', (MX, 0, 0.15), (1.8, 1.6, 0.3), MAT['dark'], col_machine)

# Punto de izaje
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, location=(MX, 0, 6.35))
rp = bpy.context.active_object
rp.name = 'EX_PuntoIzaje'
rp.data.materials.append(MAT['red'])
bpy.ops.object.shade_smooth()
for c in rp.users_collection:
    c.objects.unlink(rp)
col_machine.objects.link(rp)

# ═══════════════════════════════════════════════════
# RIGGING (tarima, zona exclusión)
# ═══════════════════════════════════════════════════
# Tarima
add_box('Tarima', (MX, 0, 0.07), (2.0, 1.5, 0.15), MAT['wood'], col_rigging)

# Zona de exclusión (perímetro rojo, NOM-006 §9.9)
R = PLAN['zona_excl_m']
for label, pos, dims in [
    ('ZE_Norte', (0, R, 0.02), (R*2, 0.08, 0.04)),
    ('ZE_Sur', (0, -R, 0.02), (R*2, 0.08, 0.04)),
    ('ZE_Este', (R, 0, 0.02), (0.08, R*2, 0.04)),
    ('ZE_Oeste', (-R, 0, 0.02), (0.08, R*2, 0.04)),
]:
    add_box(label, pos, dims, MAT['red'], col_rigging)

# ═══════════════════════════════════════════════════
# ILUMINACIÓN
# ═══════════════════════════════════════════════════
# Sol
bpy.ops.object.light_add(type='SUN', location=(10, 5, 15))
sun = bpy.context.active_object
sun.name = 'Sol_MICSA'
sun.data.energy = 3.0
sun.data.color = (1.0, 0.96, 0.88)
sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(-30))

# Luces de nave
for i, x in enumerate([-6, 0, 6]):
    bpy.ops.object.light_add(type='AREA', location=(x, 0, 9.0))
    light = bpy.context.active_object
    light.name = f'LuzNave_{i}'
    light.data.energy = 200
    light.data.size = 3.0
    light.data.color = (1.0, 0.95, 0.85)
    light.rotation_euler = (math.radians(180), 0, 0)

# ═══════════════════════════════════════════════════
# CÁMARA
# ═══════════════════════════════════════════════════
bpy.ops.object.camera_add(location=(10, 12, 8))
cam = bpy.context.active_object
cam.name = 'Cam_SIMI'
cam.rotation_euler = (math.radians(60), 0, math.radians(140))
cam.data.lens = 35
bpy.context.scene.camera = cam

# Vista lateral
bpy.ops.object.camera_add(location=(18, 0, 5))
cam2 = bpy.context.active_object
cam2.name = 'Cam_Lateral'
cam2.rotation_euler = (math.radians(75), 0, math.radians(90))
cam2.data.lens = 40

# Vista frontal
bpy.ops.object.camera_add(location=(0, 18, 6))
cam3 = bpy.context.active_object
cam3.name = 'Cam_Frontal'
cam3.rotation_euler = (math.radians(70), 0, math.radians(180))
cam3.data.lens = 35

# ═══════════════════════════════════════════════════
# ANIMACIÓN: 6 FASES SIMI (250 frames, ~10 seg a 24fps)
# ═══════════════════════════════════════════════════
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 250
scene.render.fps = 24

# Recopilar objetos de la máquina para animar como grupo
machine_objects = [obj for obj in col_machine.objects]

# El pivot de rotación es la base de la máquina
# Creamos un Empty como parent para rotar todo el grupo
bpy.ops.object.empty_add(type='ARROWS', location=(MX, 0, 0.3))
pivot = bpy.context.active_object
pivot.name = 'EX_Pivot'
for c in pivot.users_collection:
    c.objects.unlink(pivot)
col_machine.objects.link(pivot)

# Parentar todos los objetos de la máquina al pivot
for obj in machine_objects:
    obj.parent = pivot

# Fases: (frame, tilt_degrees)  90=vertical, 0=horizontal
# Basado en secuencia fotográfica SIMI
phase_keyframes = [
    (1,   80),   # Fase 1: casi vertical
    (40,  70),   # Fase 2: inicio inclinación
    (90,  55),   # Fase 3: descenso controlado
    (140, 40),   # Fase 4: transición angular
    (190, 22),   # Fase 5: casi horizontal
    (240, 8),    # Fase 6: depositar
]

for frame, tilt_deg in phase_keyframes:
    scene.frame_set(frame)
    # Rotar alrededor de Y (inclinación lateral como en las fotos)
    pivot.rotation_euler = (0, math.radians(90 - tilt_deg), 0)
    pivot.keyframe_insert(data_path='rotation_euler', frame=frame)

# Hacer curvas suaves
for fc in pivot.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'BEZIER'
        kp.handle_left_type = 'AUTO_CLAMPED'
        kp.handle_right_type = 'AUTO_CLAMPED'

# ═══════════════════════════════════════════════════
# RENDER SETTINGS
# ═══════════════════════════════════════════════════
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 128
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes.get('Background')
if bg:
    bg.inputs['Color'].default_value = (0.1, 0.11, 0.14, 1.0)
    bg.inputs['Strength'].default_value = 0.5

# ═══════════════════════════════════════════════════
# METADATA (custom properties)
# ═══════════════════════════════════════════════════
scene['MICSA_Folio'] = PLAN['folio']
scene['MICSA_Equipo'] = PLAN['equipo']
scene['MICSA_Cap_Ton'] = PLAN['cap_ton']
scene['MICSA_Peso_Ton'] = PLAN['peso_ton']
scene['MICSA_Util_Pct'] = PLAN['util_pct']
scene['MICSA_Radio_m'] = PLAN['radio_m']
scene['MICSA_Altura_m'] = PLAN['altura_m']
scene['MICSA_Norma'] = 'NOM-006-STPS-2014'

scene.frame_set(1)

print("═══════════════════════════════════════")
print("  MICSA — Plan de Izaje PI-2026-001")
print("  Modelo Blender generado exitosamente")
print(f"  {len(col_forklift.objects)} piezas Versa-Lift")
print(f"  {len(col_machine.objects)} piezas Expander")
print(f"  {len(col_env.objects)} piezas Nave")
print(f"  {len(col_rigging.objects)} piezas Rigging")
print(f"  Animación: 6 fases, 250 frames")
print(f"  Cámaras: SIMI, Lateral, Frontal")
print("  Render: Cycles GPU 1920x1080")
print("═══════════════════════════════════════")
