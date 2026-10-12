import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { buildings, devices } from './data';
import { Architecture } from './architecture';
import { HospitalAsset } from './hospitalAsset';

type Options = { onSelect: (id: string) => void; onDevice: (id: string) => void; onError: (error: string) => void; onModelLoaded: () => void };
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
  private renderDirty = true;
  private mode: '3d' | 'floor' = '3d';
  private selected = 'A';
  private floor = 2;
  private auto = false;
  private savedPosition = new THREE.Vector3();
  private savedTarget = new THREE.Vector3();
  private pointerDown = new THREE.Vector2();
  private labelNodes: { element: HTMLButtonElement; position: THREE.Vector3; floorOnly: boolean }[] = [];
  private labels: HTMLDivElement;
  private disposables: (() => void)[] = [];
  private architecture: Architecture;
  private hospital!: HospitalAsset;
  private environmentTarget: THREE.WebGLRenderTarget;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private output: OutputPass;
  private antialias?: ShaderPass;
  private hdrSettled = false;
  private hdrSource: THREE.DataTexture;

  constructor(private host: HTMLDivElement, private options: Options) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x081b2d);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.architecture = new Architecture(this.renderer, () => {
      this.renderDirty = true; this.renderer.shadowMap.needsUpdate = true;
    });
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environmentTarget = pmrem.fromEquirectangular(this.architecture.environment());
    this.scene.environment = this.environmentTarget.texture;
    this.scene.background = this.architecture.background();
    pmrem.dispose();
    this.hdrSource = new HDRLoader().load(import.meta.env.BASE_URL + 'assets/night-city.hdr', texture => {
      if (this.destroyed) { texture.dispose(); return; }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const generator = new THREE.PMREMGenerator(this.renderer);
      const target = generator.fromEquirectangular(texture);
      this.environmentTarget.dispose(); this.environmentTarget = target;
      this.scene.environment = target.texture; this.scene.environmentIntensity = .24;
      generator.dispose(); texture.dispose(); this.hdrSettled = true; this.renderDirty = true;
    }, undefined, () => {
      if (!this.destroyed) { this.hdrSettled = true; this.renderDirty = true; }
      // Retain the procedural reflection environment on a failed optional asset.
    });
    const gl = this.renderer.getContext(), info = gl.getExtension('WEBGL_debug_renderer_info');
    const software = info && /swiftshader|llvmpipe|softpipe/i.test(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    // Floating-point multisample resolves are costly on software GPUs. Both paths keep edge smoothing.
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: software ? 0 : Math.min(4, this.renderer.capabilities.maxSamples) });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .14, .2, 1.65);
    this.composer.addPass(this.bloom);
    this.output = new OutputPass(); this.composer.addPass(this.output);
    if (software) { this.antialias = new ShaderPass(FXAAShader); this.composer.addPass(this.antialias); }
    // Include scene and postprocessing triangles in the read-only verification counter.
    this.renderer.info.autoReset = false;
    const canvas = this.renderer.domElement;
    canvas.setAttribute('aria-label', '可旋转的楼宇三维模型');
    canvas.tabIndex = 0;
    host.appendChild(canvas);
    this.labels = document.createElement('div');
    this.labels.className = 'scene-labels';
    host.appendChild(this.labels);
    this.scene.fog = new THREE.FogExp2(0x102f4c, 0.0028);
    this.scene.add(new THREE.HemisphereLight(0x9dc4e5, 0x25251c, .62));
    const key = new THREE.DirectionalLight(0xffe8c1, 1.35);
    key.position.set(-45, 100, 75);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -110, right: 110, top: 125, bottom: -100, near: 1, far: 350 });
    key.shadow.normalBias = .12; key.shadow.bias = -.00015;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x6daeff, .65);
    rim.position.set(-70, 50, -70);
    this.scene.add(rim);
    const skyFill = new THREE.DirectionalLight(0x94c5f2, 1.2);
    skyFill.position.set(80, 90, 30); this.scene.add(skyFill);
    this.scene.add(this.city, this.floorMap);
    this.floorMap.visible = false;
    this.city.add(this.surroundings, this.markers);
    this.createCity();
    this.createFloor();
    this.controls = new OrbitControls(this.camera, canvas);
    const invalidate = () => { this.renderDirty = true; };
    this.controls.addEventListener('change', invalidate);
    this.disposables.push(() => this.controls.removeEventListener('change', invalidate));
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
    this.architecture.ground(this.city, true);
    for (const b of buildings) {
      const tower = new THREE.Group(); tower.position.set(b.x, 0, b.z); tower.userData.building = b.id;
      this.city.add(tower); this.towers.set(b.id, tower);
      if (b.id !== 'A') this.architecture.tower(tower, b);
      const ring = new THREE.Mesh(new THREE.RingGeometry(17, 17.22, 96), new THREE.MeshBasicMaterial({ color: 0x4adcf3, side: THREE.DoubleSide, transparent: true, opacity: .7 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = .08; tower.add(ring); this.rings.set(b.id, ring);
      this.addLabel(b.name, new THREE.Vector3(b.x, b.height + 11, b.z), false, () => this.options.onSelect(b.id), 'building-label');
      this.labelNodes[this.labelNodes.length - 1].element.dataset.building = b.id;
    }
    this.hospital = new HospitalAsset(import.meta.env.BASE_URL + 'assets/hospital.glb', () => {
      this.towers.get('A')!.add(this.hospital.root);
      this.renderDirty = true; this.renderer.shadowMap.needsUpdate = true;
      this.options.onModelLoaded();
    }, () => this.options.onError('医院模型加载失败，请检查网络后重新加载场景。'));
    this.hospitalSign(this.towers.get('A')!, '门诊楼 · 急诊入口', 1, 12.5, 27.4, 12);
    this.hospitalSign(this.towers.get('B')!, '住院楼', 0, 4.6, 12.5, 10);
    this.hospitalSign(this.towers.get('C')!, '医技楼', 0, 4.6, 12, 10);
    this.architecture.context(this.surroundings);
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .3, 16), new THREE.MeshBasicMaterial({ color: i === 2 ? 0xffaa64 : 0x40e5d4 }));
      p.position.set(-33 + i * 15, .5, 36); this.markers.add(p);
    }
  }
  private hospitalSign(parent: THREE.Group, text: string, x: number, y: number, z: number, width: number) {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 128;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#f0f4ee'; context.fillRect(0, 0, 1024, 128);
    context.fillStyle = '#216a68'; context.font = 'bold 70px "Microsoft YaHei", sans-serif';
    context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(text, 512, 64);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    this.architecture.textures.push(texture);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 8), new THREE.MeshStandardMaterial({ map: texture, roughness: .6, emissive: '#8aafa6', emissiveIntensity: .12, side: THREE.DoubleSide }));
    mesh.position.set(x, y, z); parent.add(mesh);
  }
  private addLabel(text: string, position: THREE.Vector3, floorOnly: boolean, action: () => void, className: string) {
    const element = document.createElement('button'); element.textContent = text; element.className = className;
    element.setAttribute('aria-label', floorOnly ? '选择设备 ' + text : '选择' + text.split(' · ')[0]);
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
        this.box(this.floorMap, 2.7, .7, 1.5, room.x - 5 + j * 3.3, .45, room.z, 0x4f7b91);
        this.box(this.floorMap, 2.6, .25, 1.4, room.x - 5 + j * 3.3, .9, room.z, 0xdde8e6);
        this.box(this.floorMap, .55, .2, 1.2, room.x - 5.8 + j * 3.3, 1.1, room.z, 0xf3f5ef);
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
    this.renderDirty = true;
    this.renderer.shadowMap.needsUpdate = true;
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
    this.renderDirty = true;
    this.renderer.shadowMap.needsUpdate = true;
    for (const label of this.labelNodes) if (label.floorOnly) label.element.dataset.hiddenLayer = String(!showDevices);
    for (const mesh of this.floorMap.children) if (mesh.userData.device) mesh.visible = showDevices;
  }
  select(id: string) {
    this.renderDirty = true;
    this.selected = id;
    this.rings.forEach((ring, key) => { ring.visible = id === key; });
    for (const label of this.labelNodes) if (!label.floorOnly) label.element.classList.toggle('selected', label.element.dataset.building === id);
  }
  reset() {
    this.renderDirty = true;
    this.clearMomentum();
    const auto = this.controls.autoRotate; this.controls.autoRotate = false;
    this.controls.enableDamping = false;
    const fit = Math.max(1, Math.min(1.85, 1.05 / this.camera.aspect));
    this.camera.position.set(...(this.mode === '3d' ? [105 * fit, 72 * fit, 138 * fit] : [42 * fit, 62 * fit, 58 * fit]) as [number, number, number]);
    this.controls.target.set(0, this.mode === '3d' ? 14 : 0, 0); this.controls.update();
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
    const hit = this.raycaster.intersectObjects(this.mode === '3d' ? [...this.towers.values()] : this.floorMap.children, true).find(candidate => {
      for (let object: THREE.Object3D | null = candidate.object; object; object = object.parent) if (!object.visible) return false;
      return true;
    });
    if (!hit) return;
    let obj: THREE.Object3D | null = hit.object;
    while (obj) { if (obj.userData.building) { this.options.onSelect(obj.userData.building); break; } if (obj.userData.device) { this.options.onDevice(obj.userData.device); break; } obj = obj.parent; }
  }
  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    const ratio = this.renderer.getPixelRatio();
    this.bloom.setSize(w * ratio * .5, h * ratio * .5);
    this.antialias?.uniforms['resolution'].value.set(1 / (w * ratio), 1 / (h * ratio));
    this.renderDirty = true;
    if (this.frame === 0 && this.controls) this.reset();
  }
  private animate = (time: number) => {
    if (this.destroyed) return;
    const elapsed = this.lastTime ? Math.min((time - this.lastTime) / 1000, .25) : 1 / 60;
    // Preserve the 60 Hz easing on hardware while avoiding a long tail of expensive software frames.
    this.controls.dampingFactor = 1 - Math.pow(1 - .09, elapsed * 60);
    this.controls.update(Math.min(elapsed, .05)); this.lastTime = time;
    // Static architecture needs no repeated GPU work. Controls still tick for smooth damping/patrol.
    if (this.renderDirty) {
      this.renderer.info.reset(); this.composer.render(); this.frame++;
      this.renderDirty = false;
    }
    for (const label of this.labelNodes) {
      const p = label.position.clone().project(this.camera);
      const show = label.floorOnly === (this.mode === 'floor') && p.z < 1 && Math.abs(p.x) < 0.97 && Math.abs(p.y) < 0.9 && label.element.dataset.hiddenLayer !== 'true';
      label.element.hidden = !show;
      label.element.style.left = (p.x * 0.5 + 0.5) * this.host.clientWidth + 'px';
      label.element.style.top = (-p.y * 0.5 + 0.5) * this.host.clientHeight + 'px';
    }
    this.frameId = requestAnimationFrame(this.animate);
  };
  snapshot() { return { camera: this.camera.position.toArray(), target: this.controls.target.toArray(), distance: this.camera.position.distanceTo(this.controls.target), mode: this.mode, auto: this.auto, autoActive: this.controls.autoRotate, selected: this.selected, floor: this.floor, frames: this.frame, objects: this.renderer.info.render.triangles, devicesVisible: this.markers.visible, surroundingsVisible: this.surroundings.visible, hospitalReady: this.hospital.ready, assetsReady: this.hdrSettled && this.architecture.assetsReady && this.hospital.ready && !this.renderDirty }; }
  dispose() {
    this.destroyed = true; cancelAnimationFrame(this.frameId); this.observer.disconnect(); this.controls.dispose(); this.disposables.forEach(fn => fn());
    this.hospital.root.removeFromParent(); this.hospital.dispose();
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    this.scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
        geometries.add(obj.geometry);
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(material => materials.add(material));
        if (obj instanceof THREE.InstancedMesh) obj.dispose();
      }
    });
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    this.scene.traverse(obj => { if (obj instanceof THREE.DirectionalLight || obj instanceof THREE.SpotLight || obj instanceof THREE.PointLight) obj.shadow.dispose(); });
    this.environmentTarget.dispose(); this.architecture.dispose();
    this.hdrSource.dispose();
    this.bloom.dispose(); this.output.dispose(); this.composer.dispose();
    this.antialias?.dispose();
    this.renderer.dispose(); this.renderer.domElement.remove(); this.labels.remove();
  }
}
