"""Convert a local LibreDWG JSON export; never upload the source drawing.
Usage: python scripts/convert-white-model.py decoded.json original.dwg
Only Python's standard library is required. Coordinates retain a uniform scale.
"""
import collections, hashlib, json, math, pathlib, struct, sys

decoded, original = map(pathlib.Path, sys.argv[1:3])
data = json.loads(decoded.read_text(encoding='utf-8'))
objects = {o['handle'][-1]: o for o in data['OBJECTS']}
scale = 69.5 / 205
groups = collections.defaultdict(list)
sub = lambda a, b: [x-y for x, y in zip(a,b)]
cross = lambda a,b: [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
dot = lambda a,b: sum(x*y for x,y in zip(a,b))

def triangulate(points):
    # Ear clipping on the dominant plane handles the source's occasional concave polygon.
    normal = cross(sub(points[1],points[0]),sub(points[2],points[0]))
    omit = max(range(3),key=lambda i:abs(normal[i]))
    plane = [[p[i] for i in range(3) if i!=omit] for p in points]
    orient = lambda a,b,c: (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    area = sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(plane,plane[1:]+plane[:1]))
    sign = 1 if area>=0 else -1
    indices=list(range(len(points)));triangles=[]
    while len(indices)>3:
        for j,b in enumerate(indices):
            a,c=indices[j-1],indices[(j+1)%len(indices)]
            if sign*orient(plane[a],plane[b],plane[c])<=1e-8:continue
            if any(all(sign*orient(plane[u],plane[v],plane[k])>=-1e-8 for u,v in [(a,b),(b,c),(c,a)]) for k in indices if k not in [a,b,c]):continue
            triangles.append([a,b,c]);indices.pop(j);break
        else:
            # Degenerate source quads are zero-area; skip rather than emit invalid normals.
            return triangles
    triangles.append(indices);return triangles

for handle in [584]:
    mesh=objects[handle];assert mesh['entity']=='MESH' and not mesh.get('invisible')
    faces=mesh['faces'];cursor=0
    while cursor<len(faces):
        n=faces[cursor];pts=[mesh['vertex'][i] for i in faces[cursor+1:cursor+n+1]];cursor+=n+1
        centroid=[sum(p[i] for p in pts)/n for i in range(3)]
        zone='A' if centroid[2]>75.4 or (centroid[0]>40 and centroid[1]<-12) else 'B'
        points=[[p[0]*scale,p[2]*scale,-p[1]*scale] for p in pts]
        for indices in triangulate(points):
            tri=[points[i] for i in indices];normal=cross(sub(tri[1],tri[0]),sub(tri[2],tri[0]));length=math.sqrt(dot(normal,normal))
            if length<1e-8:continue
            normal=[v/length for v in normal]
            finish='metal' if handle in [564,569] else 'stone' if handle==568 or abs(normal[1])>.6 else 'glass'
            if handle==584 and centroid[2]<8:finish='stone'
            # Project each facade onto its own tangent; physical UVs remain continuous.
            tangent=[normal[2],0,-normal[0]];tlength=math.hypot(tangent[0],tangent[2]) or 1
            tangent=[v/tlength for v in tangent]
            for p in tri:groups[(zone,finish,handle)].append((p,normal,[dot(p,tangent)/6,p[1]/15.44]))

binary=bytearray();views=[];accessors=[];meshes=[];nodes=[]
def accessor(values,width):
    offset=len(binary);raw=struct.pack('<'+'f'*len(values),*values);binary.extend(raw)
    views.append({'buffer':0,'byteOffset':offset,'byteLength':len(raw),'target':34962})
    chunks=[values[i:i+width] for i in range(0,len(values),width)]
    accessors.append({'bufferView':len(views)-1,'componentType':5126,'count':len(chunks),'type':{2:'VEC2',3:'VEC3'}[width], 'min':[min(p[i] for p in chunks) for i in range(width)],'max':[max(p[i] for p in chunks) for i in range(width)]})
    return len(accessors)-1
finishes=['glass','stone','metal']
for (zone,finish,handle),vertices in groups.items():
    attributes={name:accessor([x for v in vertices for x in v[i]],width) for i,name,width in [(0,'POSITION',3),(1,'NORMAL',3),(2,'TEXCOORD_0',2)]}
    meshes.append({'name':f'白模-{handle}-{zone}-{finish}','primitives':[{'attributes':attributes,'material':finishes.index(finish)}]})
    nodes.append({'name':meshes[-1]['name'],'mesh':len(meshes)-1,'extras':{'building':zone,'sourceHandle':handle}})
gltf={'asset':{'version':'2.0','generator':'Project DWG mesh conversion; uniform 69.5/205'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'materials':[{'name':f'project-{f}','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':c,'metallicFactor':m,'roughnessFactor':r}} for f,c,m,r in [('glass',[.1,.25,.35,1],.45,.2),('stone',[.76,.78,.74,1],.1,.65),('metal',[.75,.83,.85,1],.6,.3)]],'buffers':[{'byteLength':len(binary)}],'bufferViews':views,'accessors':accessors}
encoded=json.dumps(gltf,separators=(',',':'),ensure_ascii=False).encode();encoded+=b' '*((-len(encoded))%4);binary+=b'\0'*((-len(binary))%4)
output=pathlib.Path('public/assets/project-hospital.glb');output.write_bytes(struct.pack('<III',0x46546c67,2,28+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary)
positions=[v[0] for vs in groups.values() for v in vs]
manifest={'sourceName':original.name,'sourceSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'decoder':'LibreDWG 0.14','sourceUnitsHeader':data['HEADER']['INSUNITS'],'sourceHandles':[584],'uniformScale':scale,'structuralTowerHeight':69.5,'bounds':{'min':[min(p[i] for p in positions) for i in range(3)],'max':[max(p[i] for p in positions) for i in range(3)]},'triangles':len(positions)//3,'glbSha256':hashlib.sha256(output.read_bytes()).hexdigest(),'projectSummary':{'eastWest':70,'northSouth':38,'podiumHeight':26.7,'towerHeight':69.5,'abovegroundFloors':18,'basementFloors':2,'renovationArea':28426,'investmentYiYuan':2.87},'calibrationNote':'保留白模比例，以结构塔楼 205 坐标单位对应 69.5 m；屋顶构件高于结构高度。白模包围盒与项目表 70×38 m 有差异，未进行非等比拉伸。立面材质和医疗入口为方案示意。'}
pathlib.Path('public/assets/project-model.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'bytes':output.stat().st_size,'triangles':manifest['triangles'],'bounds':manifest['bounds']},indent=2))
