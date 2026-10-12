import * as THREE from 'three';
import { buildings } from './data';

// Deterministic geometry with locally packaged, CC0 foliage textures.
const noise = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
type Finish = THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
export class Architecture {
  readonly textures: THREE.Texture[] = [];
  private stone: Finish;
  private metal = new THREE.MeshStandardMaterial({ color: 0xc6d0d3, metalness: .35, roughness: .3 });
  private framing = new THREE.MeshStandardMaterial({ color: 0xf1f4ee, metalness: .25, roughness: .3, emissive: 0xc9e2ec, emissiveIntensity: .35 });
  private bronze = new THREE.MeshStandardMaterial({ color: 0x9b8765, metalness: .6, roughness: .34 });
  private warm = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.55, .65) });
  private dark = new THREE.MeshStandardMaterial({ color: 0x17242b, roughness: .85 });
  private unitBox = new THREE.BoxGeometry(1, 1, 1);
  private disposed = false;
  private assetsPending = 2;
  get assetsReady() { return this.assetsPending === 0; }
  private foliage: THREE.MeshStandardMaterial;

  constructor(private renderer: THREE.WebGLRenderer, invalidate: () => void) {
    this.stone = new THREE.MeshStandardMaterial({ color: 0xffefd0, map: this.surface('stone'), roughness: .65, metalness: .04, emissive: 0xd3a65c, emissiveIntensity: .16 });
    this.foliage = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .92, side: THREE.DoubleSide, alphaTest: .42 });
    const loader = new THREE.TextureLoader();
    const load = (name: string, color: boolean) => {
      const texture = loader.load(import.meta.env.BASE_URL + 'assets/' + name, t => {
        if (this.disposed) { t.dispose(); return; }
        this.assetsPending--;
        invalidate();
      }, undefined, () => {
        if (this.disposed) { texture.dispose(); return; }
        this.assetsPending--; this.foliage.visible = false; invalidate();
      });
      if (color) texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      this.textures.push(texture); return texture;
    };
    this.foliage.map = load('leaves-color.jpg', true);
    this.foliage.alphaMap = load('leaves-alpha.png', false);
  }
  private texture(canvas: HTMLCanvasElement) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.textures.push(texture); return texture;
  }
  private surface(kind: 'stone' | 'road' | 'paving') {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = kind === 'road' ? '#30343a' : kind === 'paving' ? '#828887' : '#bab5a7';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 28000; i++) {
      const light = noise(i + 90) > .5;
      ctx.fillStyle = light ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.07)';
      ctx.fillRect(noise(i) * 512, noise(i + 37) * 512, 1.4, 1.4);
    }
    if (kind !== 'road') {
      ctx.strokeStyle = 'rgba(35,42,44,.28)'; ctx.lineWidth = kind === 'stone' ? 1 : 2;
      for (let y = 0; y <= 512; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
        for (let x = (y / 64 % 2) * 64; x <= 512; x += 128) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 64); ctx.stroke(); }
      }
    }
    const t = this.texture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(kind === 'road' ? 12 : 8, kind === 'road' ? 12 : 8); return t;
  }
  environment() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d')!;
    const sky = ctx.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, '#06192e'); sky.addColorStop(.36, '#4284b2'); sky.addColorStop(.54, '#9db6c4'); sky.addColorStop(.58, '#32465a'); sky.addColorStop(1, '#141b25');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 70; i++) {
      const x = i * 16, h = 22 + noise(i + 84) * 90;
      ctx.fillStyle = i % 3 ? '#223243' : '#566779'; ctx.fillRect(x, 298 - h, 12, h + 40);
      for (let y = 300 - h; y < 320; y += 7) for (let w = 2; w < 12; w += 4) {
        ctx.fillStyle = noise(i * 19 + y + w) > .75 ? '#e2cc99' : '#7893a3'; ctx.fillRect(x + w, y, 1, 2);
      }
    }
    const glow = ctx.createRadialGradient(170, 190, 0, 170, 190, 150);
    glow.addColorStop(0, 'rgba(255,234,189,.85)'); glow.addColorStop(1, 'rgba(255,234,189,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1024, 512);
    // Broad bright sky bands create directional glints as the camera orbits the curtain wall.
    for (const x of [330, 720]) {
      const band = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
      band.addColorStop(0, 'rgba(221,238,255,0)'); band.addColorStop(.5, 'rgba(221,238,255,.7)'); band.addColorStop(1, 'rgba(221,238,255,0)');
      ctx.fillStyle = band; ctx.fillRect(x - 90, 80, 180, 160);
    }
    const texture = this.texture(c); texture.mapping = THREE.EquirectangularReflectionMapping; return texture;
  }
  background() {
    const c = document.createElement('canvas'); c.width = 4; c.height = 512;
    const ctx = c.getContext('2d')!, g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#092a48'); g.addColorStop(.6, '#194267'); g.addColorStop(1, '#091a27');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512); return this.texture(c);
  }
  box(parent: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, material: Finish | Finish[], shadow = true) {
    const mesh = new THREE.Mesh(this.unitBox, material);
    mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
    mesh.castShadow = shadow; mesh.receiveShadow = shadow; parent.add(mesh); return mesh;
  }
  private batch(parent: THREE.Group, items: number[][], material: Finish, geometry: THREE.BufferGeometry = this.unitBox, shadows = false) {
    const mesh = new THREE.InstancedMesh(geometry, material, items.length), t = new THREE.Object3D();
    items.forEach(([x, y, z, sx, sy, sz, ry = 0], i) => {
      t.position.set(x, y, z); t.scale.set(sx, sy, sz); t.rotation.set(0, ry, 0); t.updateMatrix(); mesh.setMatrixAt(i, t.matrix);
    });
    mesh.castShadow = shadows; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  private facade(columns: number, floors: number, seed: number, subdued = false) {
    const c = document.createElement('canvas'), e = document.createElement('canvas');
    c.width = e.width = 1024; c.height = e.height = 2048;
    const ctx = c.getContext('2d')!, em = e.getContext('2d')!, cw = c.width / columns, ch = c.height / floors;
    em.fillStyle = '#000'; em.fillRect(0, 0, c.width, c.height);
    // Broad reflection bands belong to the whole elevation, not a bevel on every pane.
    const reflection = ctx.createLinearGradient(0, 0, 1024, 0);
    reflection.addColorStop(0, subdued ? '#101f2c' : '#254761');
    reflection.addColorStop(.28, subdued ? '#20313e' : '#5f8297');
    reflection.addColorStop(.55, subdued ? '#112330' : '#2b546f');
    reflection.addColorStop(.8, subdued ? '#182a38' : '#7c96a4');
    reflection.addColorStop(1, subdued ? '#0e1c29' : '#294d69');
    ctx.fillStyle = reflection; ctx.fillRect(0, 0, 1024, 2048);
    for (let row = 0; row < floors; row++) for (let col = 0; col < columns; col++) {
      const n = noise(row * 91 + col * 37 + seed), x = col * cw, y = row * ch;
      ctx.fillStyle = `rgba(3,14,22,${.015 + n * .075})`;
      ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
      ctx.fillStyle = 'rgba(10,25,34,.36)'; ctx.fillRect(x, y + ch * .9, cw, ch * .1);
      // Occupied offices are narrow warm interior strips, with dark desks and blinds.
      if (n > (subdued ? .985 : .885)) {
        const wx = x + cw * .18, wy = y + ch * .2, ww = cw * (.3 + n * .16), wh = ch * .58;
        ctx.fillStyle = '#b8c1b4'; ctx.fillRect(wx, wy, ww, wh);
        em.fillStyle = n > .96 ? '#fff3cf' : '#d2aa72'; em.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = '#59666b'; ctx.fillRect(wx, wy + wh * .72, ww * .7, wh * .18);
        em.fillStyle = '#181b18'; em.fillRect(wx, wy + wh * .72, ww * .7, wh * .18);
        for (let b = 0; b < 6; b++) {
          ctx.fillStyle = 'rgba(48,56,56,.28)'; ctx.fillRect(wx, wy + b * wh / 6, ww, 1);
          em.fillStyle = '#836f51'; em.fillRect(wx, wy + b * wh / 6, ww, 1);
        }
      }
      ctx.fillStyle = subdued ? '#344653' : '#879ba5';
      ctx.fillRect(x, y, 1.2, ch); ctx.fillRect(x, y, cw, 1);
    }
    const parameters = { map: this.texture(c), emissiveMap: this.texture(e), emissive: 0xffefd1, emissiveIntensity: subdued ? .24 : 2.2, metalness: .38, roughness: .16, envMapIntensity: subdued ? .3 : .8 };
    return subdued ? new THREE.MeshStandardMaterial(parameters) : new THREE.MeshPhysicalMaterial({ ...parameters, clearcoat: .8, clearcoatRoughness: .15 });
  }

  tower(parent: THREE.Group, b: typeof buildings[number]) {
    const w = b.width, d = b.depth, h = b.height, base = 5.4;
    this.box(parent, w + 2.2, base, d + 2.2, 0, base / 2, 0, this.stone);
    const front = this.facade(Math.round(w / 1.75), b.floors, b.height), side = this.facade(Math.round(d / 1.75), b.floors, b.height + 57);
    this.box(parent, w, h, d, 0, h / 2 + base, 0, [side, side, this.metal, this.dark, front, front]);
    const frames: number[][] = [], caps: number[][] = [];
    const cols = Math.round(w / 1.75), sides = Math.round(d / 1.75);
    for (let i = 0; i <= cols; i++) for (const z of [-d / 2 - .07, d / 2 + .07]) frames.push([-w / 2 + i * w / cols, h / 2 + base, z, .11, h, .14]);
    for (let i = 0; i <= sides; i++) for (const x of [-w / 2 - .07, w / 2 + .07]) frames.push([x, h / 2 + base, -d / 2 + i * d / sides, .14, h, .11]);
    for (let i = 0; i <= b.floors; i++) {
      const y = base + i * h / b.floors;
      for (const z of [-d / 2 - .07, d / 2 + .07]) caps.push([0, y, z, w + .2, .08, .16]);
      for (const x of [-w / 2 - .07, w / 2 + .07]) caps.push([x, y, 0, .16, .08, d + .2]);
    }
    this.batch(parent, frames, this.framing); this.batch(parent, caps, this.metal);
    const fins: number[][] = [];
    for (let i = 0; i <= cols; i += 4) for (const z of [-d / 2 - .12, d / 2 + .12]) fins.push([-w / 2 + i * w / cols, h / 2 + base, z, .14, h, .28]);
    for (let i = 0; i <= sides; i += 4) for (const x of [-w / 2 - .12, w / 2 + .12]) fins.push([x, h / 2 + base, -d / 2 + i * d / sides, .28, h, .14]);
    this.batch(parent, fins, this.framing);
    // Structural corner fins and narrow warm crown lighting.
    for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) this.box(parent, .24, h + .5, .24, x, base + h / 2, z, this.metal, false);
    this.box(parent, w + .6, .65, d + .6, 0, h + base + .32, 0, this.metal);
    for (const z of [-d / 2 - .32, d / 2 + .32]) this.box(parent, w + .5, .07, .08, 0, h + base + .06, z, this.warm, false);
    this.box(parent, w * .66, 3.4, d * .65, 0, h + base + 2.1, 0, this.dark);
    for (let i = 0; i < 5; i++) {
      this.box(parent, 2.3, 1.4, 4.6, -w * .25 + i * 2.8, h + base + 4.4, 0, this.metal);
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(.65, .65, .08, 16), this.dark);
      fan.position.set(-w * .25 + i * 2.8, h + base + 5.14, .8); parent.add(fan);
    }
    for (let i = 0; i < 12; i++) this.box(parent, w * .7, .06, .075, 0, h + base + 3.85, -d * .27 + i * .9, this.metal, false);
    this.box(parent, .1, 6, .1, w * .22, h + base + 7, -d * .2, this.metal, false);
    // Transparent-looking recessed lobby, entrance canopy and stone steps.
    this.box(parent, w * .68, 4.5, .3, 0, 2.5, d / 2 + 1.2, front, false);
    this.box(parent, w * .75, .28, 4.5, 0, 4.5, d / 2 + 2.3, this.bronze);
    for (const x of [-w * .32, w * .32]) this.box(parent, .16, 4.4, .16, x, 2.2, d / 2 + 4.3, this.metal);
    for (let i = 0; i < 3; i++) this.box(parent, w * .8, .18, 1, 0, .12 + i * .18, d / 2 + 4.7 - i, this.stone);
  }
  ground(parent: THREE.Group, hospital = false) {
    const paving = new THREE.MeshStandardMaterial({ map: this.surface('paving'), color: 0xa0adb0, roughness: .95 });
    const asphalt = new THREE.MeshStandardMaterial({ map: this.surface('road'), color: 0x343638, roughness: .88 });
    this.box(parent, 1000, 1, 1000, 0, -1.2, -30, asphalt, false).receiveShadow = true;
    this.box(parent, 117, .55, 95, -4, -.25, -6, paving, false).receiveShadow = true;
    this.box(parent, 140, .18, 3.5, 0, -.22, 38.5, this.stone, false);
    this.box(parent, 3.5, .18, 105, 52, -.22, -5, this.stone, false);
    const paint = new THREE.MeshStandardMaterial({ color: 0xc9c8b9, roughness: .7 }), marks: number[][] = [];
    for (let x = -130; x < 140; x += 9) marks.push([x, -.65, 49, 4, .035, .18]);
    for (let z = -130; z < 100; z += 9) marks.push([64, -.65, z, .18, .035, 4]);
    for (let x = 31; x < 48; x += 2.2) marks.push([x, -.64, 46, 1.2, .04, 10]);
    this.batch(parent, marks, paint);
    if (!hospital) this.podium(parent);
    const lawn = new THREE.MeshStandardMaterial({ color: 0x3f5128, roughness: 1 });
    // Curved planted islands leave real pedestrian space between the podium and road.
    for (let i = 0; i < 7; i++) {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, 4.8, 1.65, 0, Math.PI * 2, false, 0);
      const island = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .3, bevelEnabled: false, curveSegments: 24 }), [lawn, this.stone]);
      island.rotation.x = -Math.PI / 2; island.rotation.z = .12;
      island.position.set(-53 + i * 14, .08, 39 + Math.sin(i) * 2); island.receiveShadow = true; parent.add(island);
    }
    this.vegetation(parent);
    for (let i = 0; i < 10; i++) {
      const x = -59 + i * 12, z = 40;
      this.box(parent, .12, 5.8, .12, x, 2.9, z, this.metal, false);
      this.box(parent, 1.4, .12, .8, x + .55, 5.8, z, this.dark, false);
      this.box(parent, 1.2, .04, .55, x + .55, 5.72, z, this.warm, false);
      // A soft pool on the paving keeps night illumination affordable (no shadowed point light per lamp).
      this.lightPool(parent, x + .55, z, 4.5);
      if (i % 2 === 0) {
        this.box(parent, 3.6, .18, .8, x + 3, .9, 36, this.bronze);
        for (const dx of [-1.3, 1.3]) this.box(parent, .12, .8, .7, x + 3 + dx, .4, 36, this.dark);
      }
    }
    for (let i = 0; i < 7; i++) this.car(parent, -65 + i * 19, i % 2 ? 54 : 44, i);
    this.car(parent, 59, -19, 8, Math.PI / 2);
  }
  hospitalForecourt(parent: THREE.Group) {
    // Proposed medical arrival area; positions do not assert the final clinical circulation plan.
    const white = new THREE.MeshStandardMaterial({ color: '#e0e8e6', roughness: .38, metalness: .15 });
    const medical = new THREE.MeshStandardMaterial({ color: '#208f81', roughness: .5, emissive: '#157c70', emissiveIntensity: .3 });
    const glass = new THREE.MeshStandardMaterial({ color: '#366679', metalness: .4, roughness: .2 });
    this.box(parent, 11, .25, 4.8, -17, 3.15, 3.9, white);
    this.box(parent, 10.5, .035, 4.4, -17, 3, 3.9, this.warm, false);
    for (const x of [-22, -12]) this.box(parent, .15, 3, .15, x, 1.5, 5.6, this.metal);
    this.box(parent, 1.3, .45, .08, -23.3, 3.8, 5.12, medical, false);
    this.box(parent, .45, 1.3, .08, -23.3, 3.8, 5.12, medical, false);
    this.lightPool(parent, -17, 6, 5);
    const green = new THREE.MeshStandardMaterial({ color: '#466039', roughness: 1 });
    for (const x of [-32, -5, 7]) {
      this.box(parent, 5.5, .4, 2.1, x, .2, 18, white);
      this.box(parent, 5.2, .42, 1.8, x, .52, 18, green);
      this.box(parent, 4, .18, .6, x, .85, 20, this.bronze);
    }
    const vehicle = new THREE.Group(); vehicle.position.set(-17, 0, 11); vehicle.rotation.y = .15; parent.add(vehicle);
    this.box(vehicle, 2.2, 1.7, 4.8, 0, 1.65, 0, white);
    this.box(vehicle, 2.12, .6, .06, 0, 1.85, 2.42, glass);
    this.box(vehicle, 2.25, .18, 4.65, 0, 1.1, 0, medical);
    this.box(vehicle, 1.3, .18, .45, 0, 2.58, 1.2, medical);
    for (const x of [-1.1, 1.1]) for (const z of [-1.45, 1.5]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .22, 16), this.dark);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x, .4, z); vehicle.add(wheel);
    }
  }
  private lightPool(parent: THREE.Group, x: number, z: number, size: number) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d')!, g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,221,153,.3)'); g.addColorStop(.3, 'rgba(255,221,153,.12)'); g.addColorStop(1, 'rgba(255,221,153,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size * 2, size * 2), new THREE.MeshBasicMaterial({ map: this.texture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, .055, z); parent.add(mesh);
  }
  private podium(parent: THREE.Group) {
    const outline = new THREE.Shape();
    outline.moveTo(-64, 16); outline.lineTo(-64, -23);
    outline.quadraticCurveTo(-64, -36, -50, -39);
    outline.quadraticCurveTo(-14, -46, 18, -36);
    outline.quadraticCurveTo(28, -33, 28, -22);
    outline.lineTo(28, -13); outline.lineTo(11, -13); outline.lineTo(11, -22);
    outline.quadraticCurveTo(-15, -31, -40, -25);
    outline.quadraticCurveTo(-45, -24, -45, -17);
    outline.lineTo(-45, 16); outline.closePath();
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x56839b, roughness: .14, metalness: .45, envMapIntensity: 1.4, emissive: 0x9d8654, emissiveIntensity: .42, clearcoat: .8 });
    const slab = (y: number, h: number, mat: Finish, scale = 1) => {
      const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth: h, bevelEnabled: false, curveSegments: 32 }), mat);
      mesh.rotation.x = -Math.PI / 2; mesh.position.y = y; mesh.scale.set(scale, scale, 1);
      mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh);
    };
    slab(.15, 1.05, this.stone); slab(1.2, 6.3, glass);
    for (const y of [1.2, 3.25, 5.4, 7.5]) slab(y, .24, this.stone);
    slab(7.8, .36, this.stone, 1.008); slab(8.16, .3, this.stone, .988); slab(8.46, .24, this.stone, .973);
    const contour = outline.getPoints(240).map(p => new THREE.Vector3(p.x, 0, -p.y));
    const curve = new THREE.CatmullRomCurve3(contour.slice(0, -1), true, 'centripetal');
    for (const y of [1.4, 7.85, 8.47]) {
      const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 240, .065, 4, true), this.warm);
      line.position.y = y; parent.add(line);
    }
    const pillars: number[][] = [], glazing: number[][] = [], glow: number[][] = [];
    const length = curve.getLength(), count = Math.floor(length / 2.1);
    for (let i = 0; i < count; i++) {
      const t = i / count, p = curve.getPointAt(t), tangent = curve.getTangentAt(t), angle = Math.atan2(-tangent.z, tangent.x);
      glazing.push([p.x, 4.3, p.z, .09, 6.4, .17, angle]);
      if (i % 4 === 0) {
        pillars.push([p.x, 3.85, p.z, .42, 7.5, .55, angle]);
        glow.push([p.x + tangent.z * .31, 4.1, p.z - tangent.x * .31, .07, 6.6, .08, angle]);
      }
    }
    this.batch(parent, glazing, this.metal); this.batch(parent, pillars, this.stone); this.batch(parent, glow, this.warm);
    // Atrium skylights have pitched panes and fine white ribs rather than opaque roof cubes.
    for (let i = 0; i < 4; i++) {
      const x = -46 + i * 16, z = 31 + Math.sin(i) * 1.5;
      const g = new THREE.Group(); g.position.set(x, 8.9, z); parent.add(g);
      for (const side of [-1, 1]) {
        const pane = this.box(g, 8, .12, 3.5, 0, .3, side * 1.5, glass, false); pane.rotation.x = side * .2;
        for (let j = 0; j < 6; j++) {
          const rib = this.box(g, .065, .15, 3.6, -4 + j * 1.6, .4, side * 1.5, this.framing, false); rib.rotation.x = side * .2;
        }
      }
    }
    const terraceGreen = new THREE.MeshStandardMaterial({ color: 0x3b4e25, roughness: 1 });
    for (let i = 0; i < 6; i++) {
      const x = -42 + i * 10, z = 35 + Math.sin(i * .55) * 1.2;
      this.box(parent, 4.8, .45, 1.5, x, 8.8, z, this.stone);
      this.box(parent, 4.55, .22, 1.3, x, 9.1, z, terraceGreen);
    }
    const canopy = this.box(parent, 13, .28, 6, -13, 5.1, 39, this.bronze); canopy.rotation.y = -.07;
    this.box(parent, 12.7, .06, 5.7, -13, 4.93, 39, this.warm, false);
    for (const x of [-19, -7]) this.box(parent, .16, 4.9, .16, x, 2.45, 41, this.metal);
    // Interior/bollard fixtures illuminate nearby geometry; no expensive point-light shadow maps.
    for (const x of [-50, -25, 0, 21]) {
      const light = new THREE.PointLight(0xffd59b, 28, 23, 2);
      light.position.set(x, 4, 36); parent.add(light);
      this.lightPool(parent, x, 39, 9);
    }
    const signCanvas = document.createElement('canvas'); signCanvas.width = 512; signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d')!; ctx.fillStyle = '#183b50'; ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#e7efec'; ctx.font = '32px Microsoft YaHei'; ctx.textAlign = 'center'; ctx.fillText('云境 · 商业中心', 256, 62);
    ctx.font = '14px sans-serif'; ctx.fillText('YUNJING  COMMERCIAL  CENTRE', 256, 97);
    this.box(parent, 9, 2.2, .16, -12, 6.65, 37.8, new THREE.MeshBasicMaterial({ map: this.texture(signCanvas) }), false);
  }
  private vegetation(parent: THREE.Group) {
    const trunks: number[][] = [], trees: [number, number][] = [];
    for (let i = 0; i < 15; i++) trees.push([-59 + i * 7.5, 40 + Math.sin(i * .7) * 2]);
    for (let i = 0; i < 12; i++) trees.push([49, -49 + i * 7]);
    for (let i = 0; i < 7; i++) trees.push([-66, -35 + i * 9]);
    for (let i = 0; i < 7; i++) trees.push([-48 + i * 13, 44 + noise(i) * 3]);
    trees.push([-32, 18], [-5, 18], [7, 18]);
    const leafGeometry = new THREE.PlaneGeometry(.95, 2.2);
    const uv = leafGeometry.getAttribute('uv');
    // Only the three leafy sprays on the left of the atlas; exclude its solid stem strip.
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * .42);
    const cardsPerTree = 88, cards = new THREE.InstancedMesh(leafGeometry, this.foliage, trees.length * cardsPerTree);
    const transform = new THREE.Object3D();
    const bark = new THREE.MeshStandardMaterial({ color: 0x61583f, roughness: 1 });
    const twigGeometry = new THREE.CylinderGeometry(.045, .12, 1, 5);
    const branches = new THREE.InstancedMesh(twigGeometry, bark, trees.length * 6);
    trees.forEach(([x, z], i) => {
      const size = .82 + noise(i + 45) * .47, ht = 3.2 * size, radius = 2.3 * size;
      trunks.push([x, ht / 2, z, .25 * size, ht, .25 * size]);
      for (let j = 0; j < 6; j++) {
        const a = j * 2.4;
        transform.position.set(x + Math.cos(a) * .65, ht + .15, z + Math.sin(a) * .65);
        transform.rotation.set(Math.cos(a) * .75, 0, Math.sin(a) * .75); transform.scale.set(1, 2.1 * size, 1);
        transform.updateMatrix(); branches.setMatrixAt(i * 6 + j, transform.matrix);
      }
      for (let j = 0; j < cardsPerTree; j++) {
        const a = j * 2.399, r = radius * Math.sqrt(noise(i * 333 + j));
        const crown = Math.sqrt(1 - Math.min(.98, (r / radius) ** 2));
        transform.position.set(x + Math.cos(a) * r, ht + .25 + crown * 1.9 * size + (noise(j * 73 + i) - .5) * 1.4, z + Math.sin(a) * r);
        transform.rotation.set((noise(j * 7) - .5) * Math.PI, a, (noise(j * 17) - .5) * 1.8);
        transform.scale.setScalar(.65 + noise(j + i * 13) * .75); transform.updateMatrix();
        cards.setMatrixAt(i * cardsPerTree + j, transform.matrix);
        cards.setColorAt(i * cardsPerTree + j, new THREE.Color().setHSL(.18 + noise(j + i) * .06, .26, .48 + noise(j * 3) * .2));
      }
    });
    this.batch(parent, trunks, bark, new THREE.CylinderGeometry(.5, .7, 1, 7), true);
    parent.add(branches);
    // Alpha-tested cards cast cut-out shadows, and remain real geometry in every orbit direction.
    cards.castShadow = true; cards.receiveShadow = true; parent.add(cards);
    // Small pedestrian silhouettes establish scale without obscuring the plaza.
    const bodies: number[][] = [], heads: number[][] = [];
    for (let i = 0; i < 24; i++) {
      const x = -50 + noise(i * 19) * 91, z = 33 + noise(i * 23 + 2) * 15;
      bodies.push([x, .75, z, .32, .95, .25]); heads.push([x, 1.43, z, .2, .2, .2]);
    }
    this.batch(parent, bodies, new THREE.MeshStandardMaterial({ color: 0x8b9a9e, roughness: 1 }));
    this.batch(parent, heads, new THREE.MeshStandardMaterial({ color: 0xb7a68e, roughness: 1 }), new THREE.SphereGeometry(.5, 6, 4));
  }
  private car(parent: THREE.Group, x: number, z: number, seed: number, angle = 0) {
    const g = new THREE.Group(); g.position.set(x, -.6, z); g.rotation.y = angle; parent.add(g);
    const paint = new THREE.MeshStandardMaterial({ color: [0xb5c3c6, 0x1c3549, 0x7c878c, 0xc4bbab][seed % 4], roughness: .25, metalness: .65 });
    this.box(g, 4.4, .85, 1.85, 0, .8, 0, paint);
    this.box(g, 2.4, .65, 1.6, -.2, 1.52, 0, new THREE.MeshStandardMaterial({ color: 0x233e4d, roughness: .13, metalness: .6 }));
    this.box(g, 2.1, .1, 1.5, -.2, 1.86, 0, paint);
    for (const wx of [-1.4, 1.4]) for (const wz of [-.91, .91]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .16, 12), this.dark);
      wheel.rotation.x = Math.PI / 2; wheel.position.set(wx, .45, wz); g.add(wheel);
    }
    for (const zz of [-.6, .6]) this.box(g, .06, .18, .4, 2.22, .87, zz, this.warm, false);
  }
  context(parent: THREE.Group) {
    const mat = this.facade(8, 20, 911, true);
    for (let i = 0; i < 17; i++) {
      const x = i < 14 ? -107 + i * 17 : -91 - (i - 14) * 17;
      const z = i < 14 ? -76 - (i % 3) * 19 : 9 - (i - 14) * 33;
      const h = 29 + (i * 19 % 70), g = new THREE.Group();
      g.position.set(x, 0, z); parent.add(g);
      this.box(g, 13, h, 17, 0, h / 2, 0, [mat, mat, this.dark, this.dark, mat, mat]);
      const bars: number[][] = [];
      for (let f = 0; f <= h; f += 3.7) { bars.push([0, f, 8.53, 13, .045, .06]); bars.push([6.53, f, 0, .06, .045, 17]); }
      this.batch(g, bars, new THREE.MeshStandardMaterial({ color: 0x314451, roughness: .55, metalness: .2 }));
      this.box(g, 10, 2, 12, 0, h + 1, 0, this.dark);
    }
  }
  dispose() { this.disposed = true; this.textures.forEach(texture => texture.dispose()); }
}
