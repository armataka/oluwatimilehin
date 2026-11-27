# One Timi, modelled and rendered in Blender (Cycles). usage: python3 scene.py <front|back|buried|bed> <px> <samples>
import sys, math, numpy as np, bpy
from mathutils import Vector
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates
MODE, PX, SPP = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
FACE = 'back' if MODE == 'back' else 'front'
RELIEF, T = 0.042, 0.15
rng = np.random.default_rng(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
D = bpy.data

H = np.asarray(Image.open(f'h_{FACE}.png')).astype(np.float32) / 65535.0
cav = np.clip((gaussian_filter(H, 9) - H) * 3.2, 0, 1) + np.clip((gaussian_filter(H, 3) - H) * 4, 0, 1) * .6
Image.fromarray((np.clip(cav, 0, 1) * 255).astype(np.uint8)).save(f'cav_{FACE}.png')
def hsample(x, y):  # coin-space (-1..1) → relief height
    n = H.shape[0] - 1
    return map_coordinates(H, [(1 - (y + 1) / 2) * n, (x + 1) / 2 * n], order=1, mode='nearest') * RELIEF

def mesh_obj(name, verts, faces, smooth=True, uvs=None):
    m = D.meshes.new(name); m.from_pydata(np.asarray(verts, dtype=float).tolist(), [], np.asarray(faces).tolist()); m.update()
    if uvs is not None:
        uv = m.uv_layers.new(name='UVMap'); li = np.zeros(len(m.loops), dtype=np.int32); m.loops.foreach_get('vertex_index', li)
        uv.data.foreach_set('uv', np.asarray(uvs, dtype=np.float32)[li].ravel())
    if smooth: m.polygons.foreach_set('use_smooth', [True] * len(m.polygons))
    o = D.objects.new(name, m); sc.collection.objects.link(o); return o
def grid(n, half):
    a = np.linspace(-half, half, n); X, Y = np.meshgrid(a, a); i = np.arange(n * n).reshape(n, n)
    f = np.stack([i[:-1, :-1], i[:-1, 1:], i[1:, 1:], i[1:, :-1]], -1).reshape(-1, 4); return X.ravel(), Y.ravel(), f
def mat(name):
    m = D.materials.new(name)
    try: m.use_nodes = True
    except Exception: pass
    nt = m.node_tree; nt.nodes.clear(); return m, nt, nt.nodes.new, nt.links.new

# ---------------------------------------------------------------- the coin
def gold():
    m, nt, N, L = mat('gold')
    out = N('ShaderNodeOutputMaterial'); b = N('ShaderNodeBsdfPrincipled'); L(b.outputs[0], out.inputs['Surface'])
    tc = N('ShaderNodeTexCoord')
    ci = N('ShaderNodeTexImage'); ci.image = D.images.load(f'/home/claude/coin3d/cav_{FACE}.png'); ci.image.colorspace_settings.name = 'Non-Color'; L(tc.outputs['UV'], ci.inputs['Vector'])
    n1 = N('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 5; n1.inputs['Detail'].default_value = 6; L(tc.outputs['Object'], n1.inputs['Vector'])
    n2 = N('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 260; n2.inputs['Detail'].default_value = 2; L(tc.outputs['Object'], n2.inputs['Vector'])
    # patina gathers in the crevices and in soft blotches
    add = N('ShaderNodeMath'); add.operation = 'MULTIPLY_ADD'; L(n1.outputs[0], add.inputs[0]); add.inputs[1].default_value = .55; L(ci.outputs['Color'], add.inputs[2])
    ramp = N('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = .3; ramp.color_ramp.elements[1].position = .95; L(add.outputs[0], ramp.inputs[0])
    mix = N('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.inputs[6].default_value = (1.0, .66, .25, 1); mix.inputs[7].default_value = (.30, .17, .06, 1); L(ramp.outputs[0], mix.inputs[0])
    L(mix.outputs[2], b.inputs['Base Color']); b.inputs['Metallic'].default_value = 1
    ro = N('ShaderNodeMath'); ro.operation = 'MULTIPLY_ADD'; L(ramp.outputs[0], ro.inputs[0]); ro.inputs[1].default_value = .3; ro.inputs[2].default_value = .3; L(ro.outputs[0], b.inputs['Roughness'])
    bp = N('ShaderNodeBump'); bp.inputs['Strength'].default_value = .09; bp.inputs['Distance'].default_value = .01; L(n2.outputs[0], bp.inputs['Height']); L(bp.outputs[0], b.inputs['Normal'])
    return m
def coin(z0):
    g = gold(); n = 760; X, Y, f = grid(n, 1.0); r = np.hypot(X, Y)
    keep = (r < .985)[f].all(1); Z = hsample(X, Y)
    top = mesh_obj('coin-top', np.c_[X, Y, Z + z0], f[keep], uvs=np.c_[(X + 1) / 2, (Y + 1) / 2])
    # rim + reeded wall + underside, as rings
    S = 400; a = np.arange(S) / S * math.tau; reed = np.where(np.arange(S) % 2 == 0, 1.0, .982); e = RELIEF + .0004
    rings = [(np.full(S, .955), e), (np.full(S, .988), e), (np.full(S, 1.0), e - .012), (reed, e - .022), (reed, -T + .02), (np.full(S, 1.0), -T + .008), (np.full(S, .985), -T)]
    v = np.concatenate([np.c_[rr * np.cos(a), rr * np.sin(a), np.full(S, zz + z0)] for rr, zz in rings]); fs = []
    for k in range(len(rings) - 1):
        i = np.arange(S); j = (i + 1) % S; fs.append(np.c_[k * S + i, k * S + j, (k + 1) * S + j, (k + 1) * S + i])
    rim = mesh_obj('coin-rim', v, np.concatenate(fs), smooth=False, uvs=np.c_[(v[:, 0] + 1) / 2, (v[:, 1] + 1) / 2])
    for o in (top, rim): o.data.materials.append(g)

# ---------------------------------------------------------------- the sand
def sand_mat():
    m, nt, N, L = mat('sand')
    out = N('ShaderNodeOutputMaterial'); b = N('ShaderNodeBsdfPrincipled'); tr = N('ShaderNodeBsdfTransparent'); ms = N('ShaderNodeMixShader')
    L(tr.outputs[0], ms.inputs[1]); L(b.outputs[0], ms.inputs[2]); L(ms.outputs[0], out.inputs['Surface'])
    tc = N('ShaderNodeTexCoord'); P = tc.outputs['Object']
    vo = N('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 190; L(P, vo.inputs['Vector'])
    big = N('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = 2.2; big.inputs['Detail'].default_value = 5; L(P, big.inputs['Vector'])
    sep = N('ShaderNodeSeparateColor'); L(vo.outputs['Color'], sep.inputs[0])
    tone = N('ShaderNodeValToRGB'); cr = tone.color_ramp
    stops = [(0, (.50, .38, .22)), (.1, (.72, .60, .40)), (.35, (.87, .77, .57)), (.75, (.94, .87, .69)), (1, (1, .97, .87))]
    cr.elements[0].position, cr.elements[1].position = stops[0][0], stops[-1][0]
    for p, _ in stops[1:-1]: cr.elements.new(p)
    for e, (p, c) in zip(cr.elements, stops): e.position = p; e.color = (*c, 1)
    L(sep.outputs[0], tone.inputs[0])
    damp = N('ShaderNodeMix'); damp.data_type = 'RGBA'; damp.blend_type = 'MULTIPLY'; damp.inputs[7].default_value = (.92, .88, .80, 1); L(big.outputs[0], damp.inputs[0]); L(tone.outputs[0], damp.inputs[6])
    L(damp.outputs[2], b.inputs['Base Color']); b.inputs['Roughness'].default_value = .86
    try: b.inputs['Specular IOR Level'].default_value = .25
    except Exception: pass
    bp = N('ShaderNodeBump'); bp.inputs['Strength'].default_value = .55; bp.inputs['Distance'].default_value = .012; L(vo.outputs['Distance'], bp.inputs['Height']); L(bp.outputs[0], b.inputs['Normal'])
    # the patch thins out to single grains, then to nothing: the page is the beach
    xy = N('ShaderNodeVectorMath'); xy.operation = 'MULTIPLY'; xy.inputs[1].default_value = (1, 1, 0); L(P, xy.inputs[0])
    ln = N('ShaderNodeVectorMath'); ln.operation = 'LENGTH'; L(xy.outputs[0], ln.inputs[0])
    wob = N('ShaderNodeMath'); wob.operation = 'MULTIPLY_ADD'; L(big.outputs[0], wob.inputs[0]); wob.inputs[1].default_value = .55; L(ln.outputs['Value'], wob.inputs[2])
    fall = N('ShaderNodeMapRange'); fall.interpolation_type = 'SMOOTHSTEP'; fall.inputs['From Min'].default_value = 1.52; fall.inputs['From Max'].default_value = 2.2; fall.inputs['To Min'].default_value = 1.02; fall.inputs['To Max'].default_value = -.02; L(wob.outputs[0], fall.inputs['Value'])
    gt = N('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; L(fall.outputs[0], gt.inputs[0]); L(sep.outputs[1], gt.inputs[1]); L(gt.outputs[0], ms.inputs[0])
    return m
def sand(buried):
    n = 560; half = 2.05; X, Y, f = grid(n, half); r = np.hypot(X, Y)
    nz = lambda s: (lambda a: (a - a.mean()) / a.std())(gaussian_filter(rng.standard_normal((n, n)), s)).ravel()
    ss = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a) / (b - a), 0, 1))
    ground = .012 + .06 * ss(1.0, 1.7, r) + .012 * nz(26) + .006 * nz(7) + .0022 * nz(1.2)
    gz = lambda cx, cy, s, amp: amp * np.exp(-((X - cx) ** 2 + (Y - cy) ** 2) / (2 * s * s))
    drift = (gz(-.78, -.72, .46, .17) + gz(-.2, -1.05, .3, .07) + gz(.86, .5, .27, .10) + gz(.25, 1.0, .2, .05)) * (1 + .22 * nz(9)) if buried else 0 * X
    if buried: Z = ground + drift - .075 * ss(1.0, .9, r)                       # inside the coin the sand dips under the face, except where it has drifted
    else: Z = np.where(r < 1.0, -.085 + .004 * nz(5), ground) ; Z = Z - (ground + .085) * 0 ; Z = np.where((r >= 1.0) & (r < 1.04), ground * ss(1.0, 1.04, r) + (-.085) * (1 - ss(1.0, 1.04, r)), Z)
    m = sand_mat(); o = mesh_obj('sand', np.c_[X, Y, Z], f); o.data.materials.append(m)
    # loose grains, on the sand and across the face of the coin
    surf = lambda x, y: map_coordinates(Z.reshape(n, n), [(y + half) / (2 * half) * (n - 1), (x + half) / (2 * half) * (n - 1)], order=1)
    k = 26000; gx, gy = rng.uniform(-2, 2, k), rng.uniform(-2, 2, k); gr = np.hypot(gx, gy); sz = rng.uniform(.005, .012, k) * np.where(rng.random(k) < .06, 1.8, 1)
    if buried:
        on = gr < .99; base = np.maximum(surf(gx, gy), np.where(on, hsample(gx, gy), -1))
        dens = np.clip(.10 + 6 * (gz_at(gx, gy)), 0, 1); keepg = ~on | (rng.random(k) < dens) | (gr > .9)
    else: base = surf(gx, gy); keepg = np.ones(k, bool)
    gx, gy, gr, sz, base = gx[keepg], gy[keepg], gr[keepg], sz[keepg], base[keepg]; k = len(gx)
    oc = np.array([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], float); of = np.array([[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]])
    sc3 = sz[:, None, None] * rng.uniform(.6, 1.3, (k, 1, 3)); ang = rng.uniform(0, math.tau, k); c, s = np.cos(ang), np.sin(ang)
    v = oc[None] * sc3; v = np.stack([v[..., 0] * c[:, None] - v[..., 1] * s[:, None], v[..., 0] * s[:, None] + v[..., 1] * c[:, None], v[..., 2]], -1)
    v += np.c_[gx, gy, base + sz * .45][:, None, :]
    g = mesh_obj('grains', v.reshape(-1, 3), (of[None] + (np.arange(k) * 6)[:, None, None]).reshape(-1, 3), smooth=False); g.data.materials.append(m)
def gz_at(x, y):
    g = lambda cx, cy, s, amp: amp * np.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s))
    return g(-.78, -.72, .55, .17) + g(-.2, -1.05, .36, .07) + g(.86, .5, .34, .10) + g(.25, 1.0, .26, .05)

# ---------------------------------------------------------------- light, camera, render
def aim(o, target=(0, 0, 0)): o.rotation_euler = (Vector(target) - o.location).to_track_quat('-Z', 'Y').to_euler()
def light(name, loc, energy, size, color=(1, 1, 1)):
    l = D.lights.new(name, 'AREA'); l.energy = energy; l.size = size; l.color = color; o = D.objects.new(name, l); o.location = loc; sc.collection.objects.link(o); aim(o); return o
light('key', (-4.2, 4.4, 3.4), float(__import__('os').environ.get('KEY', 380)), 2.6, (1, .95, .86))      # low sun from the top left
light('fill', (4.5, -3.5, 2.5), 30, 5, (.8, .88, 1))
w = D.worlds.new('w'); sc.world = w
try: w.use_nodes = True
except Exception: pass
wn = w.node_tree; wn.nodes.clear(); bg = wn.nodes.new('ShaderNodeBackground'); wo = wn.nodes.new('ShaderNodeOutputWorld'); wn.links.new(bg.outputs[0], wo.inputs[0])
tc = wn.nodes.new('ShaderNodeTexCoord'); sp = wn.nodes.new('ShaderNodeSeparateXYZ'); wn.links.new(tc.outputs['Generated'], sp.inputs[0])
rp = wn.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].color = (.16, .13, .10, 1); rp.color_ramp.elements[1].color = (.62, .64, .68, 1); rp.color_ramp.elements[0].position = .0; rp.color_ramp.elements[1].position = 1
wn.links.new(sp.outputs['Z'], rp.inputs[0]); wn.links.new(rp.outputs[0], bg.inputs['Color']); bg.inputs['Strength'].default_value = .8

if MODE in ('front', 'back'): coin(0)
elif MODE == 'buried': coin(0); sand(True)
else: sand(False)
cam = D.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = 2.0 if MODE in ('front', 'back') else 2 * 290 / 150
co = D.objects.new('cam', cam); co.location = (0, 0, 6); sc.collection.objects.link(co); sc.camera = co
r = sc.render; r.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SPP; sc.cycles.use_denoising = True
r.resolution_x = r.resolution_y = PX; r.resolution_percentage = 100; r.film_transparent = True
r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'Standard'
r.filepath = f'/home/claude/coin3d/r_{MODE}.png'
bpy.ops.render.render(write_still=True)
