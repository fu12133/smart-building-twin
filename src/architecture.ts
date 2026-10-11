import * as THREE from 'three';
import { buildings } from './data';

// Deterministic procedural assets: no external image/model dependency.
const noise = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
type Finish = THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
export class Architecture {
  readonly textures: THREE.Texture[] = [];
  private stone: Finish;
  private metal = new THREE.MeshStandardMaterial({ color: 0xc6d0d3, metalness: .35, roughness: .3 });
  private framing = new THREE.MeshStandardMaterial({ color: 0xc8d4d9, metalness: .25, roughness: .4, emissive: 0x738c9c, emissiveIntensity: .2 });
  private bronze = new THREE.MeshStandardMaterial({ color: 0x9b8765, metalness: .6, roughness: .34 });
  private warm = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.55, .65) });
  private dark = new THREE.MeshStandardMaterial({ color: 0x17242b, roughness: .85 });
  private unitBox = new THREE.BoxGeometry(1, 1, 1);

  constructor(private renderer: THREE.WebGLRenderer) {
    this.stone = new THREE.MeshStandardMaterial({ color: 0xffefd0, map: this.surface('stone'), roughness: .7, metalness: .04, emissive: 0x6f542e, emissiveIntensity: .14 });
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
    g.addColorStop(0, '#092a48'); g.addColorStop(.6, '#214c65'); g.addColorStop(1, '#091a27');
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
    for (let row = 0; row < floors; row++) for (let col = 0; col < columns; col++) {
      const n = noise(row * 91 + col * 37 + seed), lit = n > (subdued ? .95 : .86), x = col * cw, y = row * ch;
      // Separate glass, recessed spandrel and office detail; an emissive map lights only occupied rooms.
      const shade = Math.floor(55 + n * 22);
      ctx.fillStyle = lit ? '#939d9c' : `rgb(${shade},${shade + 40},${shade + 61})`;
      ctx.fillRect(x, y, cw, ch);
      const gradient = ctx.createLinearGradient(x, y, x + cw, y + ch);
      gradient.addColorStop(0, lit ? 'rgba(255,238,198,.32)' : 'rgba(149,201,224,.34)'); gradient.addColorStop(1, 'rgba(5,18,28,.48)');
      ctx.fillStyle = gradient; ctx.fillRect(x + 2, y + 2, cw - 4, ch * .8);
      if (lit) {
        em.fillStyle = n > .9 ? '#dbc595' : '#958974'; em.fillRect(x + 3, y + 3, cw - 6, ch * .76);
        for (let b = 0; b < 5; b++) {
          ctx.fillStyle = 'rgba(38,39,36,.2)'; ctx.fillRect(x + 4, y + 7 + b * ch / 8, cw - 8, 1.5);
          em.fillStyle = '#695f4d'; em.fillRect(x + 4, y + 7 + b * ch / 8, cw - 8, 1.5);
        }
        // A desk and interior partition behind the window, varied by room.
        const dx = x + cw * (.18 + n * .24);
        ctx.fillStyle = '#444640'; ctx.fillRect(dx, y + ch * .61, cw * .35, ch * .13);
        em.fillStyle = '#282924'; em.fillRect(dx, y + ch * .61, cw * .35, ch * .13);
        ctx.fillStyle = '#a9b6b0'; ctx.fillRect(x + cw * .48, y + ch * .2, 2, ch * .5);
      }
      ctx.fillStyle = '#405b70'; ctx.fillRect(x, y + ch * .85, cw, ch * .15);
      ctx.fillStyle = '#8c9ca5'; ctx.fillRect(x, y, 2.2, ch); ctx.fillRect(x, y, cw, 1.8);
      ctx.fillStyle = '#0b1d28'; ctx.fillRect(x + cw - 2, y, 2, ch);
    }
    const material = new THREE.MeshPhysicalMaterial({ map: this.texture(c), emissiveMap: this.texture(e), emissive: 0xffe2a4, emissiveIntensity: subdued ? .4 : .85, metalness: .35, roughness: .19, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: subdued ? .85 : 1.6 });
    return material;
  }
  tower(parent: THREE.Group, b: typeof buildings[number]) {
    const w = b.width, d = b.depth, h = b.height, base = 5.4;
    this.box(parent, w + 2.2, base, d + 2.2, 0, base / 2, 0, this.stone);
    const front = this.facade(Math.round(w / 1.75), b.floors, b.height), side = this.facade(Math.round(d / 1.75), b.floors, b.height + 57);
    this.box(parent, w, h, d, 0, h / 2 + base, 0, [side, side, this.metal, this.dark, front, front]);
    const frames: number[][] = [], caps: number[][] = [];
    const cols = Math.round(w / 1.75), sides = Math.round(d / 1.75);
    for (let i = 0; i <= cols; i++) for (const z of [-d / 2 - .07, d / 2 + .07]) frames.push([-w / 2 + i * w / cols, h / 2 + base, z, .085, h, .14]);
    for (let i = 0; i <= sides; i++) for (const x of [-w / 2 - .07, w / 2 + .07]) frames.push([x, h / 2 + base, -d / 2 + i * d / sides, .14, h, .085]);
    for (let i = 0; i <= b.floors; i++) {
      const y = base + i * h / b.floors;
      for (const z of [-d / 2 - .07, d / 2 + .07]) caps.push([0, y, z, w + .2, .08, .16]);
      for (const x of [-w / 2 - .07, w / 2 + .07]) caps.push([x, y, 0, .16, .08, d + .2]);
    }
    this.batch(parent, frames, this.framing); this.batch(parent, caps, this.framing);
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
  ground(parent: THREE.Group) {
    const paving = new THREE.MeshStandardMaterial({ map: this.surface('paving'), color: 0xa0adb0, roughness: .95 });
    const asphalt = new THREE.MeshStandardMaterial({ map: this.surface('road'), color: 0x697477, roughness: .88 });
    this.box(parent, 1000, 1, 1000, 0, -1.2, -30, asphalt, false).receiveShadow = true;
    this.box(parent, 117, .55, 95, -4, -.25, -6, paving, false).receiveShadow = true;
    this.box(parent, 140, .18, 3.5, 0, -.22, 38.5, this.stone, false);
    this.box(parent, 3.5, .18, 105, 52, -.22, -5, this.stone, false);
    const paint = new THREE.MeshStandardMaterial({ color: 0xc9c8b9, roughness: .7 }), marks: number[][] = [];
    for (let x = -130; x < 140; x += 9) marks.push([x, -.65, 49, 4, .035, .18]);
    for (let z = -130; z < 100; z += 9) marks.push([64, -.65, z, .18, .035, 4]);
    for (let x = 31; x < 48; x += 2.2) marks.push([x, -.64, 46, 1.2, .04, 10]);
    this.batch(parent, marks, paint);
    // A terraced commercial podium around a sunken glass atrium.
    const glass = this.facade(25, 3, 31);
    this.box(parent, 72, 7.8, 17, -13, 3.9, 24, this.stone);
    this.box(parent, 23, 7.8, 35, -48, 3.9, 11, this.stone);
    this.box(parent, 68, 5.8, .2, -13, 3.5, 32.55, glass, false);
    this.box(parent, .2, 5.8, 31, -59.6, 3.5, 11, glass, false);
    for (let tier = 0; tier < 3; tier++) {
      this.box(parent, 73 - tier * 1.2, .3, 18 - tier, -13, 8 + tier * .33, 24, this.stone);
      this.box(parent, 73 - tier * 1.2, .16, .12, -13, 8.1 + tier * .33, 33 - tier * .5, this.warm, false);
    }
    this.box(parent, 23.6, .35, 36, -48, 8.2, 11, this.stone);
    this.box(parent, .08, .08, 36, -59.85, 8.2, 11, this.warm, false);
    const facadeFrames: number[][] = [];
    for (let x = -47; x < 23; x += 2.8) facadeFrames.push([x, 3.7, 32.75, .09, 6.3, .12]);
    for (const y of [1.1, 3.9, 6.8]) facadeFrames.push([-13, y, 32.75, 69, .13, .14]);
    this.batch(parent, facadeFrames, this.bronze);
    for (let x = -47; x < 24; x += 8.4) {
      this.box(parent, .5, 7.1, .7, x, 3.6, 32.9, this.stone);
      this.box(parent, .18, 6.4, .12, x + .3, 3.6, 33.28, this.warm, false);
    }
    this.box(parent, 9, 5.5, .3, -12, 2.85, 32.95, this.dark);
    this.box(parent, 13, .4, 5.5, -12, 5.9, 35, this.bronze);
    this.box(parent, 12.6, .07, .12, -12, 5.7, 37.7, this.warm, false);
    for (const x of [-18, -6]) this.box(parent, .16, 5.5, .16, x, 2.75, 37.4, this.bronze);
    // Roof skylights, air handling units and planted terrace.
    for (let i = 0; i < 5; i++) {
      const roof = this.box(parent, 7, .55, 6, -40 + i * 12, 9.2, 23, glass); roof.rotation.x = .08;
      for (let j = 0; j < 4; j++) this.box(parent, .065, .62, 6.2, -43 + i * 12 + j * 2, 9.25, 23, this.metal, false);
    }
    for (let i = 0; i < 4; i++) this.box(parent, 2.6, 1.2, 3.4, -49 + i * 3, 9, 4, this.metal);
    const lawn = new THREE.MeshStandardMaterial({ color: 0x465939, roughness: 1 });
    for (let i = 0; i < 6; i++) {
      this.box(parent, 4.4, .4, 2, -43 + i * 10.5, 8.7, 29.5, this.stone);
      this.box(parent, 4, .5, 1.6, -43 + i * 10.5, 9.1, 29.5, lawn);
    }
    for (let i = 0; i < 12; i++) this.box(parent, 4, .4, 2.6, -47 + i * 5.9, .1, 37.4, lawn);
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
  private lightPool(parent: THREE.Group, x: number, z: number, size: number) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d')!, g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,221,153,.55)'); g.addColorStop(.3, 'rgba(255,221,153,.2)'); g.addColorStop(1, 'rgba(255,221,153,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size * 2, size * 2), new THREE.MeshBasicMaterial({ map: this.texture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, .055, z); parent.add(mesh);
  }
  private vegetation(parent: THREE.Group) {
    const leaves: number[][] = [], trunks: number[][] = [], branches: number[][] = [], colors: THREE.Color[] = [];
    const trees: [number, number][] = [];
    for (let i = 0; i < 16; i++) trees.push([-61 + i * 7.4, 37]);
    for (let i = 0; i < 13; i++) trees.push([48, -48 + i * 6.4]);
    for (let i = 0; i < 8; i++) trees.push([-58, -35 + i * 8]);
    trees.forEach(([x, z], i) => {
      const size = .75 + noise(i + 45) * .5, ht = 3.2 * size;
      trunks.push([x, ht / 2, z, .23 * size, ht, .23 * size]);
      for (let j = 0; j < 5; j++) branches.push([x + Math.cos(j * 1.7) * .6, ht - .4, z + Math.sin(j * 1.7) * .6, .12, 1.8, .12, j]);
      for (let j = 0; j < 26; j++) {
        const a = j * 2.4, r = Math.sqrt(noise(i * 69 + j)) * 2.5 * size;
        const sy = .8 + noise(j * 13 + i) * .8;
        leaves.push([x + Math.cos(a) * r, ht + .5 + noise(j * 17 + i) * 2.8 * size, z + Math.sin(a) * r, .85 * size, sy * size, .9 * size, a]);
        colors.push(new THREE.Color().setHSL(.23 + noise(i + j * 31) * .08, .42 + noise(j) * .28, .12 + noise(j + i) * .12));
      }
    });
    this.batch(parent, trunks, new THREE.MeshStandardMaterial({ color: 0x5a5140, roughness: 1 }), new THREE.CylinderGeometry(.5, .65, 1, 7), true);
    this.batch(parent, branches, new THREE.MeshStandardMaterial({ color: 0x60563f, roughness: 1 }));
    const canopy = this.batch(parent, leaves, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .95 }), new THREE.IcosahedronGeometry(1, 1), true);
    colors.forEach((color, i) => canopy.setColorAt(i, color));
    const hedges: number[][] = [];
    for (let i = 0; i < 100; i++) hedges.push([-61 + i * 1.1, .65, 35.2, .9, .65 + noise(i) * .3, .75]);
    this.batch(parent, hedges, new THREE.MeshStandardMaterial({ color: 0x3c5a34, roughness: 1 }), new THREE.IcosahedronGeometry(1, 1));
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
      this.batch(g, bars, this.metal);
      this.box(g, 10, 2, 12, 0, h + 1, 0, this.dark);
    }
  }
  dispose() { this.textures.forEach(texture => texture.dispose()); }
}
