import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildings, devices } from './data';

type Options = { onSelect: (id: string) => void; onDevice: (id: string) => void; onError: (error: string) => void };
export class BuildingScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1200);
  readonly scene = new THREE.Scene();
  readonly controls: OrbitControls;
  private city = new THREE.Group();
  private surroundings = new THREE.Group();
  private floorMap = new THREE.Group();
  private markers = new THREE.Group();
  private towers = new Map<string, THREE.Group>();
  private rings = new Map<string, THREE.Mesh>();
  private raycaster = new THREE.Raycaster();
  private observer: ResizeObserver;
  private frame = 0;
  private frameId = 0;
  private lastTime = 0;
  private destroyed = false;
  private mode: '3d' | 'floor' = '3d';
  private selected = 'A';
  private floor = 12;
  private auto = false;
  private savedPosition = new THREE.Vector3();
  private savedTarget = new THREE.Vector3();
  private pointerDown = new THREE.Vector2();
  private labelNodes: { element: HTMLButtonElement; position: THREE.Vector3; floorOnly: boolean }[] = [];
  private labels: HTMLDivElement;
  private disposables: (() => void)[] = [];

  constructor(private host: HTMLDivElement, private options: Options) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    this.renderer.setClearColor(0x081b2d);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    const canvas = this.renderer.domElement;
    canvas.setAttribute('aria-label', '可旋转的楼宇三维模型');
    canvas.tabIndex = 0;
    host.appendChild(canvas);
    this.labels = document.createElement('div');
    this.labels.className = 'scene-labels';
    host.appendChild(this.labels);
    this.scene.fog = new THREE.FogExp2(0x081b2d, 0.0026);
    this.scene.add(new THREE.HemisphereLight(0xb3dcff, 0x19313c, 2.4));
    const key = new THREE.DirectionalLight(0xbce2ff, 4);
    key.position.set(50, 120, 60);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x168dff, 3);
    rim.position.set(-70, 50, -70);
    this.scene.add(rim);
    this.scene.add(this.city, this.floorMap);
    this.floorMap.visible = false;
    this.city.add(this.surroundings, this.markers);
    this.createCity();
    this.createFloor();
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.minDistance = 55;
    this.controls.maxDistance = 520;
    this.controls.maxPolarAngle = Math.PI / 2.12;
    this.controls.minPolarAngle = 0.2;
    this.controls.autoRotateSpeed = 0.8;
    this.reset();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
    this.listen(canvas, 'pointerdown', (e) => { const p = e as PointerEvent; this.pointerDown.set(p.clientX, p.clientY); });
    this.listen(canvas, 'pointerup', (e) => this.pick(e as PointerEvent));
    this.listen(canvas, 'keydown', (e) => this.key(e as KeyboardEvent));
    this.listen(canvas, 'webglcontextlost', (e) => { e.preventDefault(); options.onError('图形渲染上下文已丢失，请重新加载场景。'); });
    this.select('A');
    this.frameId = requestAnimationFrame(this.animate);
  }

  private listen(target: EventTarget, name: string, handler: EventListener) {
    target.addEventListener(name, handler);
    this.disposables.push(() => target.removeEventListener(name, handler));
  }
  private box(parent: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, color: number, glow = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.35, emissive: glow, emissiveIntensity: 0.65 }));
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  private lineBox(parent: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, color: number, opacity = 1) {
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    line.position.set(x, y, z); parent.add(line);
  }
  private createCity() {
    this.box(this.city, 143, 2.4, 115, 0, -1.8, 0, 0x1b3243);
    this.lineBox(this.city, 145, 0.3, 117, 0, -0.35, 0, 0x24759a, 0.65);
    this.box(this.city, 141, 0.4, 16, 0, -0.35, 47, 0x102333);
    this.box(this.city, 13, 0.4, 112, 62, -0.35, 0, 0x102333);
    for (let x = -65; x < 62; x += 9) this.box(this.city, 4, 0.08, 0.5, x, 0, 48, 0x7695a4);
    for (let z = -48; z < 50; z += 9) this.box(this.city, 0.5, 0.08, 4, 62, 0, z, 0x7695a4);
    for (const b of buildings) {
      const tower = new THREE.Group(); tower.position.set(b.x, 0, b.z); tower.userData.building = b.id;
      this.city.add(tower); this.towers.set(b.id, tower);
      this.box(tower, b.width + 5, 4, b.depth + 5, 0, 2, 0, 0x6d8391);
      this.box(tower, b.width, b.height, b.depth, 0, b.height / 2 + 4, 0, b.id === 'A' ? 0x245574 : 0x1b3d58);
      this.box(tower, b.width + 0.4, 2.4, b.depth + 0.4, 0, b.height + 5, 0, 0x8cc2dc, 0x235877);
      this.box(tower, b.width * 0.7, 4, b.depth * 0.7, 0, b.height + 8, 0, 0x163d57);
      const rows = b.floors;
      for (let f = 0; f <= rows; f++) this.lineBox(tower, b.width + 0.12, 0.08, b.depth + 0.12, 0, 4 + f * b.height / rows, 0, 0x78a3bb, b.id === 'A' ? 0.68 : 0.35);
      for (let col = -b.width / 2; col <= b.width / 2; col += 3) this.box(tower, 0.14, b.height, b.depth + 0.15, col, 4 + b.height / 2, 0, 0x6b95b0);
      for (let col = -b.depth / 2; col <= b.depth / 2; col += 3) this.box(tower, b.width + 0.15, b.height, 0.14, 0, 4 + b.height / 2, col, 0x527f9e);
      const lit = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.5, 2.5), new THREE.MeshBasicMaterial({ color: 0xffde99, transparent: true, opacity: 0.85, side: THREE.DoubleSide }), rows * 6);
      const temp = new THREE.Object3D(); let n = 0;
      for (let f = 0; f < rows; f++) for (let c = 0; c < 6; c++) {
        if ((f * 13 + c * 7 + b.height) % 11 > 3) continue;
        temp.position.set(-b.width / 2 + 2 + c * 3, 5.7 + f * b.height / rows, b.depth / 2 + 0.11);
        temp.rotation.set(0, 0, 0); temp.updateMatrix(); lit.setMatrixAt(n++, temp.matrix);
      }
      lit.count = n; tower.add(lit);
      const ring = new THREE.Mesh(new THREE.RingGeometry(17, 17.35, 80), new THREE.MeshBasicMaterial({ color: 0x4adcf3, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.25; tower.add(ring); this.rings.set(b.id, ring);
      this.addLabel(b.id + '座', new THREE.Vector3(b.x, b.height + 16, b.z), false, () => this.options.onSelect(b.id), 'building-label');
    }
    // Low-rise commercial podium, public square and entrance lights.
    this.box(this.city, 78, 9, 17, -10, 4.5, 25, 0x567b8a);
    this.box(this.city, 24, 9, 29, -48, 4.5, 10, 0x466f80);
    this.box(this.city, 78.7, 0.55, 17.7, -10, 9.4, 25, 0xffd99d, 0xbb8744);
    for (let x = -48; x < 27; x += 3) this.box(this.city, 0.16, 7, 17.2, x, 4.5, 25, 0xc7d9d8);
    this.box(this.city, 10, 6, 0.3, -10, 3, 33.7, 0x72d9e4, 0x247789);
    for (let i = 0; i < 28; i++) {
      const x = i < 14 ? -62 + i * 8.6 : 49;
      const z = i < 14 ? 37 : -49 + (i - 14) * 6.8;
      this.tree(x, z);
    }
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(11, 60), new THREE.MeshStandardMaterial({ color: 0x466575, roughness: 0.8 }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.set(16, 0.05, 24); this.city.add(plaza);
    for (let i = 0; i < 10; i++) {
      const x = -70 + i * 17, z = -75 - (i % 3) * 18, h = 28 + (i * 19 % 65);
      this.box(this.surroundings, 13, h, 17, x, h / 2, z, 0x0f293f);
      for (let f = 5; f < h; f += 5) this.lineBox(this.surroundings, 13, 0.02, 17, x, f, z, 0x23516b, 0.6);
      this.lineBox(this.surroundings, 13, h, 17, x, h / 2, z, 0x335b72, 0.4);
    }
    const grid = new THREE.GridHelper(700, 70, 0x153b55, 0x10283c); grid.position.y = -3; this.city.add(grid);
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 16), new THREE.MeshBasicMaterial({ color: i === 2 ? 0xffaa64 : 0x40e5d4 }));
      p.position.set(-33 + i * 15, 0.5, 36); this.markers.add(p);
    }
  }
  private tree(x: number, z: number) {
    this.box(this.city, 4.4, 0.25, 4.4, x, 0, z, 0x294d45);
    this.box(this.city, 0.5, 3.2, 0.5, x, 1.6, z, 0x7a7968);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.7, 1), new THREE.MeshStandardMaterial({ color: 0x467d69, roughness: 0.9 }));
    crown.position.set(x, 4, z); crown.scale.y = 1.3; this.city.add(crown);
  }
  private addLabel(text: string, position: THREE.Vector3, floorOnly: boolean, action: () => void, className: string) {
    const element = document.createElement('button'); element.textContent = text; element.className = className;
    element.setAttribute('aria-label', floorOnly ? '选择设备 ' + text : '选择' + text);
    element.addEventListener('click', action); this.disposables.push(() => element.removeEventListener('click', action));
    this.labels.appendChild(element); this.labelNodes.push({ element, position, floorOnly });
  }
  private createFloor() {
    this.box(this.floorMap, 44, 1, 32, 0, -0.5, 0, 0x183c54);
    this.lineBox(this.floorMap, 44, 1, 32, 0, -0.5, 0, 0x5dbcd5);
    const rooms = [{ x: -12, z: -7, w: 18, d: 14, c: 0x245974 }, { x: 12, z: -7, w: 18, d: 14, c: 0x284d67 }, { x: -12, z: 9, w: 18, d: 10, c: 0x214c60 }, { x: 12, z: 9, w: 18, d: 10, c: 0x284d67 }];
    for (const room of rooms) {
      this.box(this.floorMap, room.w, 0.15, room.d, room.x, 0.1, room.z, room.c);
      this.box(this.floorMap, room.w, 2.5, 0.3, room.x, 1.25, room.z - room.d / 2, 0x88b7c6);
      this.box(this.floorMap, 0.3, 2.5, room.d, room.x - room.w / 2, 1.25, room.z, 0x88b7c6);
      for (let j = 0; j < 4; j++) {
        this.box(this.floorMap, 2.7, 1.3, 1.5, room.x - 5 + j * 3.3, 0.7, room.z, 0x4f7b91);
        this.box(this.floorMap, 0.4, 1.4, 0.8, room.x - 5 + j * 3.3, 0.7, room.z + 1.7, 0x7fabb5);
      }
    }
    this.box(this.floorMap, 3, 0.2, 31, 0, 0.15, 0, 0x326878);
    this.box(this.floorMap, 43, 0.2, 3, 0, 0.15, 2, 0x326878);
    for (const d of devices) {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1, 2, 20), new THREE.MeshBasicMaterial({ color: d.status === '告警' ? 0xff9c62 : 0x48dfce }));
      pin.position.set(d.x, 2, d.z); pin.userData.device = d.id; this.floorMap.add(pin);
      this.addLabel(d.name, new THREE.Vector3(d.x, 5, d.z), true, () => this.options.onDevice(d.id), 'device-label ' + (d.status === '告警' ? 'warning' : ''));
    }
  }
  setMode(mode: '3d' | 'floor') {
    if (mode === this.mode) return;
    this.clearMomentum();
    if (mode === 'floor') {
      this.savedPosition.copy(this.camera.position); this.savedTarget.copy(this.controls.target);
      this.camera.position.set(42, 62, 58); this.controls.target.set(0, 0, 0);
      this.controls.minDistance = 35; this.controls.maxDistance = 160;
    } else {
      this.camera.position.copy(this.savedPosition); this.controls.target.copy(this.savedTarget);
      this.controls.minDistance = 55; this.controls.maxDistance = 520;
    }
    this.mode = mode; this.city.visible = mode === '3d'; this.floorMap.visible = mode === 'floor';
    this.controls.autoRotate = this.auto && mode === '3d'; this.controls.update();
  }
  private clearMomentum() {
    const position = this.camera.position.clone(), target = this.controls.target.clone();
    const auto = this.controls.autoRotate, damping = this.controls.enableDamping;
    this.controls.autoRotate = false; this.controls.enableDamping = false;
    this.controls.update();
    this.camera.position.copy(position); this.controls.target.copy(target);
    this.controls.update();
    this.controls.enableDamping = damping; this.controls.autoRotate = auto;
  }
  setAuto(enabled: boolean) { if (!enabled) this.clearMomentum(); this.auto = enabled; this.controls.autoRotate = enabled && this.mode === '3d'; }
  setFloor(floor: number) { this.floor = floor; }
  setLayers(showDevices: boolean, showSurroundings: boolean) {
    this.markers.visible = showDevices; this.surroundings.visible = showSurroundings;
    for (const label of this.labelNodes) if (label.floorOnly) label.element.dataset.hiddenLayer = String(!showDevices);
    for (const mesh of this.floorMap.children) if (mesh.userData.device) mesh.visible = showDevices;
  }
  select(id: string) {
    this.selected = id;
    this.rings.forEach((ring, key) => { ring.visible = id === key; });
    this.towers.forEach((tower, key) => { tower.traverse(obj => { if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial && obj.geometry instanceof THREE.BoxGeometry && obj.geometry.parameters.height > 50) { obj.material.emissive.set(key === id ? 0x093348 : 0x000000); } }); });
    for (const label of this.labelNodes) if (!label.floorOnly) label.element.classList.toggle('selected', label.element.textContent === id + '座');
  }
  reset() {
    this.clearMomentum();
    const auto = this.controls.autoRotate; this.controls.autoRotate = false;
    this.controls.enableDamping = false;
    const fit = Math.max(1.12, Math.min(1.85, 1.12 / this.camera.aspect));
    this.camera.position.set(...(this.mode === '3d' ? [158 * fit, 39 + 85 * fit, 185 * fit] : [42 * fit, 62 * fit, 58 * fit]) as [number, number, number]);
    this.controls.target.set(0, this.mode === '3d' ? 39 : 0, 0); this.controls.update();
    this.controls.enableDamping = true; this.controls.autoRotate = auto;
  }
  zoom(factor: number) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, this.controls.minDistance, this.controls.maxDistance));
    this.camera.position.copy(this.controls.target).add(offset); this.controls.update();
  }
  private key(e: KeyboardEvent) {
    if (e.key === '+' || e.key === '=') { e.preventDefault(); this.zoom(0.85); return; }
    if (e.key === '-') { e.preventDefault(); this.zoom(1.15); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const s = new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(this.controls.target));
    s.theta += e.key === 'ArrowLeft' ? 0.12 : e.key === 'ArrowRight' ? -0.12 : 0;
    s.phi = THREE.MathUtils.clamp(s.phi + (e.key === 'ArrowUp' ? -0.08 : e.key === 'ArrowDown' ? 0.08 : 0), this.controls.minPolarAngle, this.controls.maxPolarAngle);
    this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(s)); this.controls.update();
  }
  private pick(e: PointerEvent) {
    if (e.button !== 0 || this.pointerDown.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 5) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), this.camera);
    const hit = this.raycaster.intersectObjects(this.mode === '3d' ? [...this.towers.values()] : this.floorMap.children, true)[0];
    if (!hit) return;
    let obj: THREE.Object3D | null = hit.object;
    while (obj) { if (obj.userData.building) { this.options.onSelect(obj.userData.building); break; } if (obj.userData.device) { this.options.onDevice(obj.userData.device); break; } obj = obj.parent; }
  }
  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h);
    if (this.frame === 0 && this.controls) this.reset();
  }
  private animate = (time: number) => {
    if (this.destroyed) return;
    this.controls.update(this.lastTime ? Math.min((time - this.lastTime) / 1000, 0.05) : 1 / 60); this.lastTime = time;
    this.renderer.render(this.scene, this.camera); this.frame++;
    for (const label of this.labelNodes) {
      const p = label.position.clone().project(this.camera);
      const show = label.floorOnly === (this.mode === 'floor') && p.z < 1 && Math.abs(p.x) < 0.97 && Math.abs(p.y) < 0.9 && label.element.dataset.hiddenLayer !== 'true';
      label.element.hidden = !show;
      label.element.style.left = (p.x * 0.5 + 0.5) * this.host.clientWidth + 'px';
      label.element.style.top = (-p.y * 0.5 + 0.5) * this.host.clientHeight + 'px';
    }
    this.frameId = requestAnimationFrame(this.animate);
  };
  snapshot() { return { camera: this.camera.position.toArray(), target: this.controls.target.toArray(), distance: this.camera.position.distanceTo(this.controls.target), mode: this.mode, auto: this.auto, autoActive: this.controls.autoRotate, selected: this.selected, floor: this.floor, frames: this.frame, objects: this.renderer.info.render.triangles, devicesVisible: this.markers.visible, surroundingsVisible: this.surroundings.visible }; }
  dispose() {
    this.destroyed = true; cancelAnimationFrame(this.frameId); this.observer.disconnect(); this.controls.dispose(); this.disposables.forEach(fn => fn());
    this.scene.traverse(obj => { if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) { obj.geometry.dispose(); const mats = Array.isArray(obj.material) ? obj.material : [obj.material]; mats.forEach(m => m.dispose()); } });
    this.renderer.dispose(); this.renderer.domElement.remove(); this.labels.remove();
  }
}
