import * as THREE from 'three';

type Point = [number, number];
type Face = { zone: string; n: THREE.Vector3; u: THREE.Vector3; distance: number; triangles: Point[][] };
type Part = { zone: string; position: THREE.Vector3; rotation: THREE.Quaternion; size: THREE.Vector3 };
type Surface = { mesh: THREE.Mesh; source: THREE.Material | THREE.Material[]; design: THREE.Material | THREE.Material[] };
const random = (n: number) => { const x = Math.sin(n * 127.1 + 21.7) * 43758.5453; return x - Math.floor(x); };

/** Original optional art proposal. Source buffers and coordinates are never edited. */
export class HospitalDesign {
  readonly root = new THREE.Group();
  private surfaces: Surface[] = [];
  private textures: THREE.Texture[] = [];
  private materials: THREE.Material[] = [];
  private unit = new THREE.BoxGeometry(1, 1, 1);
  private glass: THREE.MeshPhysicalMaterial;
  private pearl: THREE.MeshStandardMaterial;
  private glow: THREE.MeshStandardMaterial;
  readonly detailCount: number;

  constructor(model: THREE.Object3D) {
    this.root.name = '原创现代医院外观方案'; this.root.userData.originalProposal = true;
    const maps = this.windows();
    this.glass = new THREE.MeshPhysicalMaterial({ name: 'original-hospital-glass', color: 0xffffff,
      map: maps.color, emissiveMap: maps.light, emissive: 0xffffff, emissiveIntensity: 1.1,
      roughness: .13, roughnessMap: maps.rough, metalness: .12, ior: 1.5,
      clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: 8, side: THREE.DoubleSide });
    this.pearl = new THREE.MeshStandardMaterial({ name: 'original-hospital-pearl', color: 0xe4e7e1,
      map: this.panels(), roughness: .48, metalness: .12, side: THREE.DoubleSide });
    const aluminium = new THREE.MeshStandardMaterial({ color: 0xa5bac2, roughness: .24, metalness: .78 });
    const porcelain = new THREE.MeshStandardMaterial({ color: 0xe9efed, roughness: .3, metalness: .24 });
    this.glow = new THREE.MeshStandardMaterial({ color: 0xe7ce9f, emissive: 0xffd5a0, emissiveIntensity: 1.6, roughness: .45 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x168f9c, metalness: .4, roughness: .25 });
    this.materials.push(this.glass, this.pearl, aluminium, porcelain, this.glow, blue);
    const faces = new Map<string, Face>();
    model.updateMatrixWorld(true);
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const source = object.material;
      const design = (Array.isArray(source) ? source : [source]).map(material => material.name === 'project-glass' ? this.glass : this.pearl);
      this.surfaces.push({ mesh: object, source, design: Array.isArray(source) ? design : design[0] });
      if (!(Array.isArray(source) ? source : [source]).some(m => m.name === 'project-glass')) return;
      const positions = object.geometry.getAttribute('position');
      const indices = object.geometry.index, count = indices?.count ?? positions.count;
      for (let i = 0; i < count; i += 3) {
        const vertices = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(positions, indices ? indices.getX(i + j) : i + j).applyMatrix4(object.matrixWorld));
        const normal = vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0]));
        if (normal.lengthSq() < .000001) continue;
        normal.normalize(); if (Math.abs(normal.y) > .015) continue;
        normal.y = 0; normal.normalize();
        const u = new THREE.Vector3(normal.z, 0, -normal.x), distance = normal.dot(vertices[0]);
        const zone = String(object.userData.building);
        const key = `${zone}/${normal.x.toFixed(3)}/${normal.z.toFixed(3)}/${distance.toFixed(2)}`;
        let face = faces.get(key);
        if (!face) { face = { zone, n: normal, u, distance, triangles: [] }; faces.set(key, face); }
        face.triangles.push(vertices.map(v => [face!.u.dot(v), v.y]));
      }
    });
    const frames: Part[] = [], bands: Part[] = [], fins: Part[] = [], lights: Part[] = [];
    let entry: { face: Face; from: number; to: number; score: number } | undefined;
    for (const face of faces.values()) {
      const points = face.triangles.flat(), us = points.map(p => p[0]), ys = points.map(p => p[1]);
      const minU = Math.min(...us), maxU = Math.max(...us), minY = Math.min(...ys), maxY = Math.max(...ys);
      const rotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(face.u, new THREE.Vector3(0, 1, 0), face.n));
      const part = (u: number, y: number, w: number, h: number, d: number, offset = .05): Part => ({
        zone: face.zone, position: face.u.clone().multiplyScalar(u).addScaledVector(face.n, face.distance + offset).add(new THREE.Vector3(0, y, 0)),
        rotation, size: new THREE.Vector3(w, h, d),
      });
      // Intersect with actual wall triangles, preserving courtyard gaps and side profiles.
      for (let u = Math.ceil(minU / 1.5) * 1.5; u <= maxU; u += 1.5) {
        for (const [from, to] of this.intervals(face.triangles, 0, u)) {
          if (to - from < .25) continue;
          frames.push(part(u, (from + to) / 2, .055, to - from, .12, .07));
          if (face.zone === 'A' && Math.round(u / 1.5) % 3 === 0) fins.push(part(u, (from + to) / 2, .24, to - from, .58, .23));
        }
      }
      const storey = 15.44 / 4;
      for (let y = Math.ceil(minY / storey) * storey; y <= maxY; y += storey) {
        for (const [from, to] of this.intervals(face.triangles, 1, y)) {
          if (to - from < .08) continue;
          frames.push(part((from + to) / 2, y, to - from, .065, .13, .06));
          bands.push(part((from + to) / 2, y - .15, to - from, face.zone === 'A' ? .4 : .34, .22, .08));
          if (face.zone === 'B' || Math.round(y / storey) % 3 === 0) lights.push(part((from + to) / 2, y - .29, to - from, .025, .04, .205));
        }
      }
      for (const [from, to] of this.intervals(face.triangles, 1, maxY - .025)) if (to - from > .08) bands.push(part((from + to) / 2, maxY, to - from, .15, .24, .06));
      if (face.zone === 'B' && minY < 2.2 && maxY > 3.2) {
        for (const [from, to] of this.intervals(face.triangles, 1, 3.2)) {
          if (to - from < 9) continue;
          const score = face.n.dot(new THREE.Vector3(-.6, 0, .8)) * 10 + Math.min(to - from, 20) / 20;
          if (!entry || score > entry.score) entry = { face, from, to, score };
        }
      }
    }
    this.batch(frames, aluminium); this.batch(bands, this.pearl); this.batch(fins, porcelain); this.batch(lights, this.glow);
    if (entry) this.entrance(entry.face, (entry.from + entry.to) / 2, aluminium, blue, porcelain);
    this.detailCount = frames.length + bands.length + fins.length + lights.length;
    model.add(this.root); this.setEnabled(true);
  }

  private intervals(triangles: Point[][], axis: number, value: number) {
    const spans: Point[] = [];
    for (const tri of triangles) {
      const crossing: number[] = [];
      for (let i = 0; i < 3; i++) {
        const a = tri[i], b = tri[(i + 1) % 3];
        if (Math.abs(a[axis] - value) < .0001) crossing.push(a[1 - axis]);
        if ((a[axis] < value && b[axis] > value) || (a[axis] > value && b[axis] < value)) {
          const t = (value - a[axis]) / (b[axis] - a[axis]); crossing.push(a[1 - axis] + t * (b[1 - axis] - a[1 - axis]));
        }
      }
      if (crossing.length >= 2) spans.push([Math.min(...crossing), Math.max(...crossing)]);
    }
    spans.sort((a, b) => a[0] - b[0]); const merged: Point[] = [];
    for (const span of spans) {
      const prev = merged[merged.length - 1];
      if (prev && span[0] <= prev[1] + .015) prev[1] = Math.max(prev[1], span[1]); else merged.push([...span]);
    }
    return merged;
  }

  private batch(parts: Part[], material: THREE.Material) {
    for (const zone of ['A', 'B']) {
      const list = parts.filter(p => p.zone === zone); if (!list.length) continue;
      const mesh = new THREE.InstancedMesh(this.unit, material, list.length), matrix = new THREE.Matrix4();
      list.forEach((p, i) => mesh.setMatrixAt(i, matrix.compose(p.position, p.rotation, p.size)));
      mesh.userData = { building: zone, originalProposal: true }; mesh.castShadow = material !== this.glow; mesh.receiveShadow = material !== this.glow;
      mesh.computeBoundingSphere(); this.root.add(mesh);
    }
  }

  private entrance(face: Face, center: number, metal: THREE.Material, blue: THREE.Material, white: THREE.Material) {
    const group = new THREE.Group(); group.userData = { building: 'B', originalProposal: true };
    group.position.copy(face.u).multiplyScalar(center).addScaledVector(face.n, face.distance + .14);
    group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(face.u, new THREE.Vector3(0, 1, 0), face.n));
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) => {
      const mesh = new THREE.Mesh(this.unit, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
      mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    };
    const canopy = new THREE.MeshPhysicalMaterial({ color: 0x9ccbd1, metalness: .12, roughness: .08, clearcoat: 1, transparent: true, opacity: .76, depthWrite: false });
    this.materials.push(canopy);
    box(8.4, .12, 3.2, 0, 3.05, 1.5, canopy);
    box(8.7, .23, .18, 0, 3.03, 3.02, white); box(8.5, .035, .07, 0, 2.91, 3.12, this.glow);
    for (const x of [-4.05, 4.05]) { box(.12, 2.95, .12, x, 1.5, 2.9, metal); box(.13, .18, 3.2, x, 3.01, 1.5, metal); }
    for (const x of [-2, 0, 2]) box(.07, .07, 3.15, x, 3.14, 1.5, metal);
    box(4.6, 2.6, .13, 0, 1.4, .025, this.glass);
    for (const x of [-2.35, 0, 2.35]) box(.07, 2.7, .18, x, 1.42, .08, metal);
    box(5.1, .65, .2, 0, 2.6, .17, blue);
    box(.38, .07, .025, 0, 2.6, .285, white); box(.07, .38, .025, 0, 2.6, .285, white);
    this.root.add(group);
  }

  private texture(canvas: HTMLCanvasElement, color = true) {
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 8; this.textures.push(texture); return texture;
  }

  private windows() {
    const canvases = [0, 1, 2].map(() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 2048; return c; });
    const [c, e, r] = canvases.map(c => c.getContext('2d')!);
    c.fillStyle = '#2c5268'; c.fillRect(0, 0, 1024, 2048); e.fillStyle = '#000'; e.fillRect(0, 0, 1024, 2048);
    r.fillStyle = '#747474'; r.fillRect(0, 0, 1024, 2048);
    // Twenty different rows keep illuminated rooms from repeating every four storeys.
    [c, e, r].forEach(ctx => ctx.scale(1, .2));
    for (let row = 0; row < 20; row++) for (let col = 0; col < 4; col++) {
      const x = col * 256, y = row * 512, seed = row * 17 + col * 41, lit = random(seed) > .77;
      const window = c.createLinearGradient(x, y, x + 240, y + 450);
      window.addColorStop(0, '#7a9aa9'); window.addColorStop(.22, '#678795'); window.addColorStop(.7, '#55788d'); window.addColorStop(1, '#62899a');
      c.fillStyle = window; c.fillRect(x + 5, y + 5, 246, 465);
      if (lit) {
        c.fillStyle = '#b9c6ba'; c.fillRect(x + 40, y + 72, 178, 319);
        c.fillStyle = '#6f817b'; c.beginPath(); c.moveTo(x + 40, y + 72); c.lineTo(x + 63, y + 105); c.lineTo(x + 63, y + 367); c.lineTo(x + 40, y + 391); c.fill();
        c.fillStyle = '#dde0c6'; c.fillRect(x + 64, y + 105, 150, 16);
        e.fillStyle = '#bca27c'; e.fillRect(x + 64, y + 105, 150, 262); e.fillStyle = '#f8ddaa'; e.fillRect(x + 73, y + 110, 130, 7);
        c.fillStyle = '#627b84'; c.fillRect(x + 78, y + 309, 96, 23); e.fillStyle = '#141917'; e.fillRect(x + 78, y + 309, 96, 42);
        for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(80,101,103,.26)'; c.fillRect(x + 170 + i * 5, y + 122, 3, 245); e.fillStyle = 'rgba(35,33,30,.38)'; e.fillRect(x + 170 + i * 5, y + 122, 3, 245); }
      }
      c.fillStyle = '#143547'; c.fillRect(x + 3, y + 465, 250, 47);
      c.fillStyle = '#a4b5b7'; c.fillRect(x, y, 3, 512); c.fillRect(x, y, 256, 3);
      r.fillStyle = lit ? '#898989' : '#666666'; r.fillRect(x + 4, y + 4, 248, 459);
    }
    const maps = { color: this.texture(canvases[0]), light: this.texture(canvases[1]), rough: this.texture(canvases[2], false) };
    Object.values(maps).forEach(t => t.repeat.y = .2);
    return maps;
  }

  private panels() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#e5e7df'; ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 12000; i++) { ctx.fillStyle = random(i) > .5 ? 'rgba(255,255,255,.15)' : 'rgba(66,73,72,.05)'; ctx.fillRect(random(i + 1) * 1024, random(i + 2) * 1024, 1, 1); }
    ctx.fillStyle = '#949e9c'; for (let x = 0; x < 1024; x += 256) ctx.fillRect(x, 0, 2, 1024);
    for (let y = 0; y < 1024; y += 128) ctx.fillRect(0, y, 1024, 2);
    return this.texture(canvas);
  }

  setEnabled(enabled: boolean) {
    this.root.visible = enabled; this.surfaces.forEach(s => { s.mesh.material = enabled ? s.design : s.source; });
  }
  setDaylight(day: number) {
    this.glass.emissiveIntensity = THREE.MathUtils.lerp(1.1, .07, day);
    this.glow.emissiveIntensity = THREE.MathUtils.lerp(1.6, .04, day);
  }
  dispose() {
    // Restore source references so HospitalAsset releases hidden original materials too.
    this.setEnabled(false); this.root.removeFromParent();
    this.root.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose(); });
    this.unit.dispose(); this.textures.forEach(t => t.dispose()); this.materials.forEach(m => m.dispose());
    this.root.clear(); this.surfaces = [];
  }
}
