import * as THREE from 'three';
import { BillboardMotion } from './billboardMotion';

type Point = [number, number];
type Face = { zone: string; n: THREE.Vector3; u: THREE.Vector3; distance: number; triangles: Point[][] };
type Part = { zone: string; podium: boolean; position: THREE.Vector3; rotation: THREE.Quaternion; size: THREE.Vector3 };
type Surface = { mesh: THREE.Mesh; source: THREE.Material | THREE.Material[]; design: THREE.Material | THREE.Material[]; sourceGroups?: { start: number; count: number; materialIndex?: number }[]; designGroups?: { start: number; count: number; materialIndex: number }[] };
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
  private aluminium: THREE.MeshStandardMaterial;
  private porcelain: THREE.MeshStandardMaterial;
  private podiumGlass: THREE.MeshPhysicalMaterial;
  private podiumStone: THREE.MeshStandardMaterial;
  private podiumMetal: THREE.MeshStandardMaterial;
  private podiumFinishes: THREE.MeshStandardMaterial[];
  private screenGeometry = new THREE.PlaneGeometry(2.8, 4.65);
  private motion = new BillboardMotion();
  private disposed = false;
  private advertPending = true;
  private advertising = new THREE.Group();
  private entryScreen?: THREE.Mesh;
  private doorway?: THREE.Group;
  get entranceGroup() { return this.doorway; }
  get animationState() { return { frame: this.motion.frame, active: this.motion.active }; }
  tickMotion(time: number, enabled: boolean, interval: number) { return this.motion.tick(time, enabled && this.root.visible && this.advertising.visible, interval); }
  get entranceScreen() { return this.entryScreen; }
  get finishState() {
    return this.surfaces.flatMap(({ mesh }) => (Array.isArray(mesh.material) ? [...new Set(mesh.geometry.groups.map(g => g.materialIndex ?? 0))].map(i => (mesh.material as THREE.Material[])[i]) : [mesh.material])
      .filter((m): m is THREE.MeshStandardMaterial => m instanceof THREE.MeshStandardMaterial)
      .map(m => [String(mesh.userData.building), m.name, m.color.getHexString()]));
  }
  get assetsReady() { return !this.advertPending; }
  readonly billboardCount: number;
  readonly detailCount: number;

  constructor(model: THREE.Object3D, invalidate: () => void = () => {}) {
    this.root.name = '原创现代医院外观方案'; this.root.userData.originalProposal = true;
    const maps = this.windows();
    this.glass = new THREE.MeshPhysicalMaterial({ name: 'original-hospital-glass', color: 0xadc6d4,
      map: maps.color, emissiveMap: maps.light, emissive: 0xffd8a4, emissiveIntensity: 1.1,
      roughness: .09, roughnessMap: maps.rough, metalness: .12, ior: 1.5,
      clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: 8, side: THREE.DoubleSide });
    this.glass.name = 'proposal-tower-glass';
    this.podiumGlass = this.glass.clone(); this.podiumGlass.name = 'proposal-podium-glass';
    this.podiumGlass.color.set(0x609b97); this.podiumGlass.roughness = .19; this.podiumGlass.envMapIntensity = 4;
    this.pearl = new THREE.MeshStandardMaterial({ name: 'proposal-tower-panel', color: 0xc8dbe6,
      map: this.panels(), roughness: .48, metalness: .12, side: THREE.DoubleSide });
    this.podiumStone = new THREE.MeshStandardMaterial({ name: 'proposal-podium-stone', color: 0xd8c4a4,
      map: this.pearl.map, roughness: .65, metalness: .03, emissive: 0xffe0b0, side: THREE.DoubleSide });
    this.podiumFinishes = [this.podiumStone, ...[0x8e9da9, 0x354654, 0xbac6ce, 0xebe6d8].map((color, i) => {
      const material = this.podiumStone.clone(); material.name = ['proposal-podium-roof', 'proposal-podium-base', 'proposal-podium-west-wall', 'proposal-podium-entry-wall'][i]; material.color.set(color); material.emissive.set(0x000000); return material;
    })];
    const aluminium = this.aluminium = new THREE.MeshStandardMaterial({ color: 0xd4e3e6, emissive: 0xd6e5ed, roughness: .21, metalness: .55 });
    const porcelain = this.porcelain = new THREE.MeshStandardMaterial({ color: 0xe9efed, emissive: 0xfff2db, roughness: .26, metalness: .24 });
    this.podiumMetal = new THREE.MeshStandardMaterial({ name: 'proposal-podium-metal', color: 0x94a5b0, emissive: 0xbfd4e3, roughness: .33, metalness: .6 });
    this.pearl.emissive.set(0xc9e2f4);
    this.glow = new THREE.MeshStandardMaterial({ color: 0xe7ce9f, emissive: 0xffd5a0, emissiveIntensity: 1.6, roughness: .45 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x168f9c, metalness: .4, roughness: .25 });
    this.materials.push(this.glass, this.pearl, aluminium, porcelain, this.glow, blue, this.podiumGlass, this.podiumMetal, ...this.podiumFinishes);
    const ad = new THREE.TextureLoader().load(import.meta.env.BASE_URL + 'assets/hospital-billboard.png', texture => {
      if (this.disposed) { texture.dispose(); return; }
      this.motion.setSource(texture.image as HTMLImageElement);
      this.advertPending = false; invalidate();
    }, undefined, () => { if (!this.disposed) { this.advertPending = false; invalidate(); } });
    ad.colorSpace = THREE.SRGBColorSpace; ad.anisotropy = 4; this.textures.push(ad);
    const screen = new THREE.MeshBasicMaterial({ map: this.motion.texture, toneMapped: false }); this.materials.push(screen);
    const faces = new Map<string, Face>();
    model.updateMatrixWorld(true);
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const source = object.material;
      const podium = object.userData.building === 'B';
      const design = (Array.isArray(source) ? source : [source]).map(material => material.name === 'project-glass' ? podium ? this.podiumGlass : this.glass : podium ? this.podiumStone : this.pearl);
      const sourceGlass = (Array.isArray(source) ? source : [source]).every(m => m.name === 'project-glass');
      if (!podium || !sourceGlass) {
        const sourceGroups = object.geometry.groups.map((g: { start: number; count: number; materialIndex?: number }) => ({ ...g }));
        const designGroups = this.podiumGroups(object, podium, sourceGlass);
        this.surfaces.push({ mesh: object, source, design: podium ? this.podiumFinishes : sourceGlass ? [this.glass, this.podiumGlass] : [this.pearl, ...this.podiumFinishes], sourceGroups, designGroups });
      } else this.surfaces.push({ mesh: object, source, design: Array.isArray(source) ? design : design[0] });
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
        zone: face.zone, podium: face.zone === 'B' || y < 8.1, position: face.u.clone().multiplyScalar(u).addScaledVector(face.n, face.distance + offset).add(new THREE.Vector3(0, y, 0)),
        rotation, size: new THREE.Vector3(w, h, d),
      });
      // Intersect with actual wall triangles, preserving courtyard gaps and side profiles.
      const mullionSpacing = face.zone === 'B' ? 3 : 1.5;
      for (let u = Math.ceil(minU / mullionSpacing) * mullionSpacing; u <= maxU; u += mullionSpacing) {
        for (const [from, to] of this.intervals(face.triangles, 0, u)) {
          if (to - from < .25) continue;
          if (face.zone === 'A' && from < 8.1 && to > 8.1) {
            frames.push(part(u, (8.1 + to) / 2, .055, to - 8.1, .12, .07));
            if (Math.round(u / 1.5) % 2 === 0) frames.push(part(u, (from + 8.1) / 2, .055, 8.1 - from, .12, .07));
          } else if (face.zone !== 'A' || from >= 8.1 || Math.round(u / 1.5) % 2 === 0) frames.push(part(u, (from + to) / 2, .055, to - from, .12, .07));
          if (face.zone === 'A' && to > 8.1 && Math.round(u / 1.5) % 3 === 0) fins.push(part(u, (Math.max(from, 8.1) + to) / 2, .24, to - Math.max(from, 8.1), .58, .23));
        }
      }
      const storey = 15.44 / 4;
      for (let y = Math.ceil(minY / storey) * storey; y <= maxY; y += storey) {
        for (const [from, to] of this.intervals(face.triangles, 1, y)) {
          if (to - from < .08) continue;
          frames.push(part((from + to) / 2, y, to - from, .065, .13, .06));
          bands.push(part((from + to) / 2, y - .15, to - from, face.zone === 'A' && y > 8.1 ? .4 : .85, .22, .08));
          if (face.zone === 'B' || Math.round(y / storey) % 3 === 0) lights.push(part((from + to) / 2, y - .29, to - from, .025, .04, .205));
        }
      }
      for (const [from, to] of this.intervals(face.triangles, 1, maxY - .025)) if (to - from > .08) bands.push(part((from + to) / 2, maxY, to - from, .15, .24, .06));
      if (face.zone === 'B' && minY < 2.2 && maxY > 7.4) {
        for (const [from, to] of this.intervals(face.triangles, 1, 3.2)) {
          if (to - from < 14) continue;
          const adU = THREE.MathUtils.clamp(face.u.dot(new THREE.Vector3(16, 0, 17)), from + 10, to - 2);
          const p = face.u.clone().multiplyScalar(adU).addScaledVector(face.n, face.distance);
          const score = face.n.dot(new THREE.Vector3(-.84, 0, .54)) * 8 - Math.hypot(p.x - 16, p.z - 17) * .35;
          if (!entry || score > entry.score) entry = { face, from, to, score };
        }
      }
    }
    this.batch(frames, aluminium, this.podiumMetal); this.batch(bands, this.pearl, this.podiumStone); this.batch(fins, porcelain); this.batch(lights, this.glow);
    if (entry) this.entrance(entry.face, THREE.MathUtils.clamp(entry.face.u.dot(new THREE.Vector3(16, 0, 17)), entry.from + 10, entry.to - 2) - 6.7, aluminium, blue, porcelain);
    if (entry) {
      const { face } = entry, center = THREE.MathUtils.clamp(face.u.dot(new THREE.Vector3(16, 0, 17)), entry.from + 10, entry.to - 2);
      const board = new THREE.Group(); board.name = 'proposed-main-entrance-advertisement';
      board.userData = { building: face.zone, originalProposal: true, billboard: true };
      board.position.copy(face.u).multiplyScalar(center).addScaledVector(face.n, face.distance + .24);
      board.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(face.u, new THREE.Vector3(0, 1, 0), face.n));
      const backing = new THREE.Mesh(this.unit, this.podiumFinishes[4]); backing.scale.set(4.4, 8, .18); backing.position.set(0, 4, -.15); board.add(backing);
      const frame = new THREE.Mesh(this.unit, this.podiumFinishes[2]); frame.scale.set(3.05, 4.9, .16); frame.position.y = 5.2; board.add(frame);
      const image = this.entryScreen = new THREE.Mesh(this.screenGeometry, screen); image.name = 'entrance-advertising-screen';
      image.position.set(0, 5.2, .09); board.add(image);
      this.advertising.add(board);
    }
    this.root.add(this.advertising);
    this.billboardCount = entry ? 1 : 0;
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

  private podiumGroups(mesh: THREE.Mesh, podium: boolean, glass: boolean) {
    const p = mesh.geometry.getAttribute('position'), index = mesh.geometry.index, count = index?.count ?? p.count;
    const groups: { start: number; count: number; materialIndex: number }[] = [];
    for (let i = 0; i < count; i += 3) {
      const v = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(p, index ? index.getX(i + j) : i + j).applyMatrix4(mesh.matrixWorld));
      const n = v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).normalize(), c = v[0].clone().add(v[1]).add(v[2]).divideScalar(3);
      const lower = Math.abs(n.y) > .55 ? 1 : c.y < 1.2 ? 2 : c.x < -15 ? 3 : c.x < 3 ? 4 : 0;
      const materialIndex = podium ? lower : c.y > 8.1 ? 0 : glass ? 1 : lower + 1;
      const previous = groups[groups.length - 1];
      if (previous?.materialIndex === materialIndex) previous.count += 3; else groups.push({ start: i, count: 3, materialIndex });
    }
    return groups;
  }

  private batch(parts: Part[], material: THREE.Material, podiumMaterial = material) {
    for (const zone of ['A', 'B']) {
      const list = parts.filter(p => p.zone === zone); if (!list.length) continue;
      const batches = new Map<THREE.Material, Part[]>();
      for (const p of list) {
        const finish = zone === 'A' && !p.podium ? material : podiumMaterial !== this.podiumStone ? podiumMaterial : this.podiumFinishes[p.position.y > 7.5 ? 1 : p.position.x < -15 ? 3 : p.position.x < 3 ? 4 : 0];
        const batch = batches.get(finish) ?? []; batch.push(p); batches.set(finish, batch);
      }
      for (const [finish, batch] of batches) {
        const mesh = new THREE.InstancedMesh(this.unit, finish, batch.length), matrix = new THREE.Matrix4();
        batch.forEach((p, i) => mesh.setMatrixAt(i, matrix.compose(p.position, p.rotation, p.size)));
        mesh.userData = { building: zone, originalProposal: true }; mesh.castShadow = material !== this.glow; mesh.receiveShadow = material !== this.glow;
        mesh.computeBoundingSphere(); this.root.add(mesh);
      }
    }
  }

  private entrance(face: Face, center: number, metal: THREE.Material, blue: THREE.Material, white: THREE.Material) {
    const group = this.doorway = new THREE.Group(); group.name = 'proposed-recessed-entrance'; group.userData = { building: face.zone, originalProposal: true };
    group.position.copy(face.u).multiplyScalar(center).addScaledVector(face.n, face.distance + .14);
    group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(face.u, new THREE.Vector3(0, 1, 0), face.n));
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) => {
      const mesh = new THREE.Mesh(this.unit, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
      mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    };
    box(6.4, 7.1, .12, 0, 3.55, .01, this.podiumFinishes[2]);
    for (const x of [-3.1, 3.1]) box(.4, 7.2, .9, x, 3.6, .45, this.podiumFinishes[4]);
    box(6.6, .55, .95, 0, 7.0, .45, this.podiumFinishes[4]);
    box(5.8, .14, .7, 0, 3.0, .4, metal); box(5.6, .035, .05, 0, 2.91, .76, this.glow);
    box(5.2, 2.7, .08, 0, 1.4, .12, this.podiumGlass);
    for (const x of [-2.6, 0, 2.6]) box(.06, 2.8, .12, x, 1.42, .18, metal);
    box(5.8, .14, .08, 0, 6.3, .14, blue);
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
      const x = col * 256, y = row * 512, seed = row * 17 + col * 41, lit = random(seed) > .59;
      const window = c.createLinearGradient(x, y, x + 240, y + 450);
      window.addColorStop(0, '#a3c3d1'); window.addColorStop(.22, '#779eaf'); window.addColorStop(.7, '#355e7d'); window.addColorStop(1, '#80b0c1');
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
    this.root.visible = enabled; this.surfaces.forEach(s => { s.mesh.material = enabled ? s.design : s.source; if (s.sourceGroups && s.designGroups) s.mesh.geometry.groups = enabled ? s.designGroups : s.sourceGroups; });
  }
  setStreetscape(enabled: boolean) { this.advertising.visible = enabled; }
  setDaylight(day: number) {
    this.glass.emissiveIntensity = THREE.MathUtils.lerp(2.1, .19, day);
    this.podiumGlass.emissiveIntensity = THREE.MathUtils.lerp(.8, .08, day);
    this.podiumStone.emissiveIntensity = THREE.MathUtils.lerp(.34, .07, day);
    this.podiumMetal.emissiveIntensity = THREE.MathUtils.lerp(.12, .025, day);
    this.glow.emissiveIntensity = THREE.MathUtils.lerp(2.8, .3, day);
    this.aluminium.emissiveIntensity = THREE.MathUtils.lerp(.65, .09, day);
    this.porcelain.emissiveIntensity = THREE.MathUtils.lerp(.8, .13, day);
    this.pearl.emissiveIntensity = THREE.MathUtils.lerp(.28, .06, day);
  }
  dispose() {
    this.disposed = true;
    this.motion.dispose();
    // Restore source references so HospitalAsset releases hidden original materials too.
    this.setEnabled(false); this.root.removeFromParent();
    this.root.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose(); });
    this.unit.dispose(); this.screenGeometry.dispose(); this.textures.forEach(t => t.dispose()); this.materials.forEach(m => m.dispose());
    this.root.clear(); this.surfaces = [];
  }
}
