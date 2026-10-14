"""Restore source surroundings/site without changing the hospital GLB.
Usage: python scripts/convert-white-context.py decoded.json original.dwg
Python standard library plus the project's locked Three.js Earcut for complex rings.
Run npm ci before conversion. Raw inputs remain local.
"""
import collections
import hashlib
import json
import math
import pathlib
import struct
import subprocess
import sys

decoded, original = map(pathlib.Path, sys.argv[1:3])
data = json.loads(decoded.read_text(encoding='utf-8'))
objects = {obj['handle'][-1]: obj for obj in data['OBJECTS']}
primary = json.loads(pathlib.Path('public/assets/project-model.json').read_text(encoding='utf8'))
source_hash = hashlib.sha256(original.read_bytes()).hexdigest()
assert source_hash == primary['sourceSha256'], 'Context and hospital must use the same original DWG'
assert hashlib.sha256(pathlib.Path('public/assets/project-hospital.glb').read_bytes()).hexdigest() == primary['glbSha256']
scale = primary['uniformScale']
anchor = [-(primary['bounds']['min'][0] + primary['bounds']['max'][0]) / 2,
          -primary['bounds']['min'][1], -(primary['bounds']['min'][2] + primary['bounds']['max'][2]) / 2]
roles = {**{handle: 'site-panel' for handle in range(249, 261)},
         263: 'city', 575: 'nearby', 392: 'land', 393: 'west-site',
         394: 'east-site', 395: 'base', 562: 'local-site', 580: 'site-edge'}
groups = collections.defaultdict(list)
records = []
seen_faces = set()
recovered_complex_faces = 0
self_intersection_splits = 0


def triangulate(points):
    global recovered_complex_faces, self_intersection_splits
    # Newell's normal handles faces whose first three source vertices are collinear.
    normal = [0., 0., 0.]
    for a, b in zip(points, points[1:] + points[:1]):
        normal[0] += (a[1] - b[1]) * (a[2] + b[2])
        normal[1] += (a[2] - b[2]) * (a[0] + b[0])
        normal[2] += (a[0] - b[0]) * (a[1] + b[1])
    if max(map(abs, normal)) < 1e-10:
        return []
    omit = max(range(3), key=lambda i: abs(normal[i]))
    plane = [[p[i] for i in range(3) if i != omit] for p in points]
    orient = lambda a, b, c: (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])
    indices = []
    for index, point in enumerate(plane):
        if not indices or math.dist(point, plane[indices[-1]]) > 1e-8:
            indices.append(index)
    if len(indices) > 1 and math.dist(plane[indices[0]], plane[indices[-1]]) < 1e-8:
        indices.pop()
    # Remove collinear corners before ear clipping, retaining actual polygon boundaries.
    changed = True
    while changed and len(indices) > 3:
        changed = False
        for j, b in enumerate(indices):
            a, c = indices[j-1], indices[(j+1) % len(indices)]
            if abs(orient(plane[a], plane[b], plane[c])) < 1e-8:
                indices.pop(j); changed = True; break
    area = sum(plane[a][0]*plane[b][1] - plane[b][0]*plane[a][1]
               for a, b in zip(indices, indices[1:] + indices[:1]))
    sign = 1 if area >= 0 else -1
    triangles = []
    while len(indices) > 3:
        for j, b in enumerate(indices):
            a, c = indices[j-1], indices[(j+1) % len(indices)]
            if sign * orient(plane[a], plane[b], plane[c]) <= 1e-8:
                continue
            if any(all(sign * orient(plane[u], plane[w], plane[k]) >= -1e-8
                       for u, w in [(a, b), (b, c), (c, a)])
                   for k in indices if k not in [a, b, c]):
                continue
            triangles.append([a, b, c]); indices.pop(j); break
        else:
            # CAD encodes courtyard holes with touching/bridged rings. Use the locked
            # tessellator and verify covered area instead of dropping these valid faces.
            result = subprocess.run(['node', str(pathlib.Path(__file__).with_name('triangulate-context.mjs'))],
                                    input=json.dumps(plane), text=True, capture_output=True, check=True)
            repair = json.loads(result.stdout)
            for vertex in repair['interpolatedVertices']:
                a, b = points[vertex['from']], points[vertex['to']]
                points.append([a[i]+(b[i]-a[i])*vertex['t'] for i in range(3)])
            recovered_complex_faces += 1; self_intersection_splits += repair['selfIntersectionSplits']
            return repair['triangles']
    if len(indices) == 3:
        triangles.append(indices)
    return triangles


for handle, role in roles.items():
    mesh = objects[handle]
    assert mesh['entity'] == 'MESH' and not mesh.get('invisible')
    cursor = 0
    skipped = duplicates = triangles_count = 0
    emitted = []
    while cursor < len(mesh['faces']):
        count = mesh['faces'][cursor]
        points = [mesh['vertex'][index] for index in mesh['faces'][cursor+1:cursor+count+1]]
        cursor += count + 1
        signature = tuple(sorted(tuple(round(value, 6) for value in point) for point in points))
        if signature in seen_faces:
            duplicates += 1; continue
        indices = triangulate(points)
        if not indices:
            skipped += 1; continue
        seen_faces.add(signature)
        transformed = [[p[0]*scale, p[2]*scale, -p[1]*scale] for p in points]
        for triangle in indices:
            tri = [transformed[index] for index in triangle]
            a = [tri[1][i]-tri[0][i] for i in range(3)]
            b = [tri[2][i]-tri[0][i] for i in range(3)]
            normal = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
            length = math.sqrt(sum(value*value for value in normal))
            if length < 1e-10:
                continue
            normal = [value/length for value in normal]
            finish = ('roof' if abs(normal[1]) > .6 else 'facade') if role in ['city', 'nearby'] else role
            tangent = [normal[2], 0, -normal[0]]
            tangent_length = math.hypot(tangent[0], tangent[2]) or 1
            tangent = [value/tangent_length for value in tangent]
            for point in tri:
                uv = [sum(x*y for x, y in zip(point, tangent))/6, point[1]/15.44] if finish == 'facade' else [point[0]/8, point[2]/8]
                groups[(handle, role, finish)].append((point, normal, uv)); emitted.append(point)
            triangles_count += 1
    assert emitted, f'No geometry exported for source handle {handle}'
    records.append({'handle': handle, 'role': role, 'triangles': triangles_count,
                    'skippedDegenerateOrMalformedFaces': skipped, 'duplicateFacesRemoved': duplicates,
                    'bounds': {'min': [min(p[i] for p in emitted) for i in range(3)],
                               'max': [max(p[i] for p in emitted) for i in range(3)]}})

binary = bytearray()
views, accessors, meshes, nodes = [], [], [], []
finishes = list(dict.fromkeys(key[2] for key in groups))
colors = {'facade': [.16, .25, .31, 1], 'roof': [.17, .23, .26, 1],
          'site-panel': [.04, .2, .25, 1], 'land': [.22, .3, .22, 1],
          'west-site': [.37, .43, .42, 1], 'east-site': [.44, .42, .37, 1],
          'base': [.065, .075, .085, 1], 'local-site': [.49, .5, .45, 1], 'site-edge': [.4, .44, .42, 1]}


def accessor(values, width):
    offset = len(binary)
    raw = struct.pack('<' + 'f'*len(values), *values); binary.extend(raw)
    views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(raw), 'target': 34962})
    chunks = [values[i:i+width] for i in range(0, len(values), width)]
    accessors.append({'bufferView': len(views)-1, 'componentType': 5126, 'count': len(chunks),
                      'type': {2: 'VEC2', 3: 'VEC3'}[width],
                      'min': [min(p[i] for p in chunks) for i in range(width)],
                      'max': [max(p[i] for p in chunks) for i in range(width)]})
    return len(accessors)-1


for (handle, role, finish), vertices in groups.items():
    attributes = {name: accessor([value for vertex in vertices for value in vertex[i]], width)
                  for i, name, width in [(0, 'POSITION', 3), (1, 'NORMAL', 3), (2, 'TEXCOORD_0', 2)]}
    name = f'白模周边-{handle}-{finish}'
    meshes.append({'name': name, 'primitives': [{'attributes': attributes, 'material': finishes.index(finish)}]})
    nodes.append({'name': name, 'mesh': len(meshes)-1,
                  'extras': {'sourceHandle': handle, 'contextRole': role, 'finish': finish}})
gltf = {'asset': {'version': '2.0', 'generator': 'Source DWG context; same uniform calibration as hospital'},
        'scene': 0, 'scenes': [{'nodes': list(range(len(nodes))), 'extras': {'sourceAnchor': anchor}}],
        'nodes': nodes, 'meshes': meshes,
        'materials': [{'name': f'context-{finish}', 'doubleSided': True,
                       'pbrMetallicRoughness': {'baseColorFactor': colors[finish],
                                               'metallicFactor': .15 if finish == 'facade' else 0,
                                               'roughnessFactor': .55 if finish == 'facade' else .95}}
                      for finish in finishes],
        'buffers': [{'byteLength': len(binary)}], 'bufferViews': views, 'accessors': accessors}
encoded = json.dumps(gltf, separators=(',', ':'), ensure_ascii=False).encode()
encoded += b' '*((-len(encoded)) % 4); binary += b'\0'*((-len(binary)) % 4)
output = pathlib.Path('public/assets/project-context.glb')
output.write_bytes(struct.pack('<III', 0x46546c67, 2, 28+len(encoded)+len(binary)) +
                   struct.pack('<II', len(encoded), 0x4e4f534a) + encoded +
                   struct.pack('<II', len(binary), 0x004e4942) + binary)
positions = [vertex[0] for vertices in groups.values() for vertex in vertices]
manifest = {'sourceName': original.name, 'sourceSha256': source_hash,
            'decodedSha256': hashlib.sha256(decoded.read_bytes()).hexdigest(),
            'decoder': primary['decoder'], 'uniformScale': scale, 'coordinateTransform': ['x', 'z', '-y'],
            'anchorOffset': anchor, 'sourceHandles': list(roles), 'objects': records,
            'bounds': {'min': [min(p[i]+anchor[i] for p in positions) for i in range(3)],
                       'max': [max(p[i]+anchor[i] for p in positions) for i in range(3)]},
            'triangles': len(positions)//3, 'glbSha256': hashlib.sha256(output.read_bytes()).hexdigest(),
            'recoveredComplexFaces': recovered_complex_faces,
            'selfIntersectionSplits': self_intersection_splits,
            'primaryGlbSha256': primary['glbSha256'],
            'note': '城市、近邻建筑及场地形体来自同一项目白模，保留原相对坐标与统一比例；材质和医疗到达细节为方案。未导入重叠主体分解件及远处编辑副本。'}
pathlib.Path('public/assets/project-context.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps({'bytes': output.stat().st_size, 'triangles': manifest['triangles'],
                  'bounds': manifest['bounds'], 'objects': records}, ensure_ascii=False, indent=2))
