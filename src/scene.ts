import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { buildings } from './data';
import { getFloorLayout } from './floorLayouts';
import { Architecture } from './architecture';
import { HospitalAsset } from './hospitalAsset';
import { ProjectContextAsset } from './projectContextAsset';
import { SceneAtmosphere } from './atmosphere';
import { WeatherReading, isFresh } from './weather';
import { createFloorGeometry } from './floorGeometry';
import { deviceSystems, DeviceFilter } from './deviceSystems';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Language, translate } from './i18n';

type Options = { language?: Language; onSelect: (id: string) => void; onDevice: (id: string) => void; onError: (error: string) => void; onModelLoaded: () => void; onContextLoaded: () => void };
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
  private lastRenderTime = -Infinity;
  private renderInterval = 0;
  private destroyed = false;
  private renderDirty = true;
  private mode: '3d' | 'floor' = '3d';
  private selected = 'A';
  private floor = 2;
  private fittedFloorScale = 1;
  private deviceFilter: DeviceFilter = 'all';
  private auto = false;
  private savedPosition = new THREE.Vector3();
  private savedTarget = new THREE.Vector3();
  private pointerDown = new THREE.Vector2();
  private labelNodes: { element: HTMLButtonElement; position: THREE.Vector3; floorOnly: boolean; sourceText: string }[] = [];
  private language: Language = 'zh';
  private labels: HTMLDivElement;
  private disposables: (() => void)[] = [];
  private floorDisposables: (() => void)[] = [];
  private floorKey = '';
  private architecture: Architecture;
  private hospital!: HospitalAsset;
  private context!: ProjectContextAsset;
  private contextView = false;
  private lastPickSourceHandle: number | null = null;
  private environmentTarget: THREE.WebGLRenderTarget;
  private composer: EffectComposer;
  private floorAO: SSAOPass;
  private bloom: UnrealBloomPass;
  private output: OutputPass;
  private antialias?: ShaderPass;
  private hdrSettled = false;
  private hdrSource: THREE.DataTexture;
  private exteriorBackground: THREE.Texture;
  private floorBackground = new THREE.Color(0x0a1c2c);
  private globalLights: { light: THREE.Light; exterior: number; floor: number }[] = [];
  private atmosphere: SceneAtmosphere;
  private hospitalLights = new THREE.Group();
  private weatherEnabled = true;
  private originalProposal = true;

  constructor(private host: HTMLDivElement, private options: Options) {
    this.language = options.language ?? 'zh';
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x081b2d);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.architecture = new Architecture(this.renderer, () => {
      this.renderDirty = true; this.renderer.shadowMap.needsUpdate = true;
    }, false);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environmentTarget = pmrem.fromEquirectangular(this.architecture.environment());
    this.scene.environment = this.environmentTarget.texture;
    this.exteriorBackground = this.architecture.background(); this.scene.background = this.exteriorBackground;
    pmrem.dispose();
    this.hdrSource = new HDRLoader().load(import.meta.env.BASE_URL + 'assets/night-city.hdr', texture => {
      if (this.destroyed) { texture.dispose(); return; }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const generator = new THREE.PMREMGenerator(this.renderer);
      const target = generator.fromEquirectangular(texture);
      this.environmentTarget.dispose(); this.environmentTarget = target;
      this.scene.environment = target.texture; this.setIllumination(this.mode);
      generator.dispose(); texture.dispose(); this.hdrSettled = true; this.renderDirty = true;
    }, undefined, () => {
      if (!this.destroyed) { this.hdrSettled = true; this.renderDirty = true; }
      // Retain the procedural reflection environment on a failed optional asset.
    });
    const gl = this.renderer.getContext(), info = gl.getExtension('WEBGL_debug_renderer_info');
    const software = info && /swiftshader|llvmpipe|softpipe/i.test(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    // Bound software-GPU submissions, including damping, so expensive frames cannot queue ahead of input.
    this.renderInterval = software ? 250 : 0;
    // Floating-point multisample resolves are costly on software GPUs. Both paths keep edge smoothing.
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: software ? 0 : Math.min(4, this.renderer.capabilities.maxSamples) });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.floorAO = new SSAOPass(this.scene, this.camera, 1, 1, 8);
    this.floorAO.kernelRadius = 3; this.floorAO.minDistance = .00005; this.floorAO.maxDistance = .01;
    this.floorAO.enabled = false; this.composer.addPass(this.floorAO);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .14, .2, 1.65);
    this.composer.addPass(this.bloom);
    this.output = new OutputPass(); this.composer.addPass(this.output);
    if (software) { this.antialias = new ShaderPass(FXAAShader); this.composer.addPass(this.antialias); }
    // Include scene and postprocessing triangles in the read-only verification counter.
    this.renderer.info.autoReset = false;
    const canvas = this.renderer.domElement;
    canvas.setAttribute('aria-label', translate('可旋转的楼宇三维模型', this.language));
    canvas.tabIndex = 0;
    host.appendChild(canvas);
    this.labels = document.createElement('div');
    this.labels.className = 'scene-labels';
    host.appendChild(this.labels);
    this.scene.fog = new THREE.FogExp2(0x102f4c, 0.0028);
    this.atmosphere = new SceneAtmosphere(this.renderer, software ? 1 : 24, !!software);
    const ambient = new THREE.HemisphereLight(0x9dc4e5, 0x25251c, .28);
    this.scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffe8c1, .75);
    key.position.set(-45, 100, 75);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -110, right: 110, top: 125, bottom: -100, near: 1, far: 350 });
    key.shadow.normalBias = .12; key.shadow.bias = -.00015;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x6daeff, .7);
    rim.position.set(-70, 50, -70);
    this.scene.add(rim);
    const skyFill = new THREE.DirectionalLight(0x94c5f2, .45);
    skyFill.position.set(80, 90, 30); this.scene.add(skyFill);
    this.globalLights = [
      { light: ambient, exterior: .28, floor: .62 },
      { light: key, exterior: .75, floor: 1.35 },
      { light: rim, exterior: .7, floor: .65 },
      { light: skyFill, exterior: .45, floor: 1.2 },
    ];
    this.setIllumination('3d');
    this.scene.add(this.city, this.floorMap);
    this.floorMap.visible = false;
    this.city.add(this.surroundings, this.markers);
    this.city.add(this.atmosphere.group);
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
    for (const b of buildings) {
      const tower = new THREE.Group(); tower.position.set(b.x, 0, b.z); tower.userData.building = b.id;
      this.city.add(tower); this.towers.set(b.id, tower);
      const ring = new THREE.Mesh(new THREE.RingGeometry(17, 17.22, 96), new THREE.MeshBasicMaterial({ color: 0x4adcf3, side: THREE.DoubleSide, transparent: true, opacity: .7 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = .08; tower.add(ring); this.rings.set(b.id, ring);
      this.addLabel(b.name, new THREE.Vector3(b.x, b.id === 'B' ? 17.5 : 64, b.z), false, () => this.options.onSelect(b.id), 'building-label');
      this.labelNodes[this.labelNodes.length - 1].element.dataset.building = b.id;
    }
    this.hospital = new HospitalAsset(import.meta.env.BASE_URL + 'assets/project-hospital.glb', () => {
      // Source geometry uses shared project coordinates rather than the zone label anchors.
      this.city.add(this.hospital.root);
      this.addHospitalLights();
      this.setIllumination(this.mode);
      this.renderDirty = true; this.renderer.shadowMap.needsUpdate = true;
      this.options.onModelLoaded();
    }, () => this.options.onError('医院模型加载失败，请检查网络后重新加载场景。'));
    this.context = new ProjectContextAsset(import.meta.env.BASE_URL + 'assets/project-context.glb', () => {
      this.setIllumination(this.mode);
      this.renderDirty = true; this.renderer.shadowMap.needsUpdate = true;
      this.options.onContextLoaded();
    }, () => this.options.onError('白模周边加载失败，请检查网络后重新加载场景。'));
    this.surroundings.add(this.context.buildings); this.city.add(this.context.ground);
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .3, 16), new THREE.MeshBasicMaterial({ color: i === 2 ? 0xffaa64 : 0x40e5d4 }));
      p.position.set(-33 + i * 15, .5, 36); this.markers.add(p);
    }
  }
  private addHospitalLights() {
    // Light sources are a display proposal anchored to source bounds, not new building geometry.
    const box = this.hospital.bounds, size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3()), lights = this.hospitalLights;
    lights.name = '医院展示照明';
    const spot = (color: number, intensity: number, range: number, angle: number, position: number[], target: number[], heroIntensity = intensity) => {
      const light = new THREE.SpotLight(color, intensity, range, angle, .85, 2);
      light.position.fromArray(position); light.target.position.fromArray(target);
      light.userData.heroIntensity = heroIntensity;
      // Only the existing key light casts shadows; static washes add no shadow render targets.
      lights.add(light, light.target);
    };
    for (const side of [-1, 1]) {
      spot(0xffd6a0, 3600, size.y * 1.65, .53,
        [center.x + side * size.x * .32, box.min.y + 2, box.max.z + 12],
        [center.x + side * size.x * .24, box.min.y + size.y * .42, center.z], 6000);
    }
    spot(0x8dbdff, 4600, size.y * 1.8, .62,
      [box.max.x + 22, box.min.y + size.y * .65, box.min.z - 18],
      [center.x, box.min.y + size.y * .46, center.z], 8000);
    spot(0xffcc88, 1700, 75, .85,
      [center.x - size.x * .3, box.min.y + 18, box.max.z - 6],
      [center.x - size.x * .3, box.min.y, box.max.z + 14], 4800);
    spot(0xd2eaff, 0, 240, .45, [-70, 110, 105], [18, 40, 8], 28000);
    spot(0xffddae, 0, 150, .6, [-42, 45, 60], [-10, 12, 0], 12000);
    this.city.add(lights);
  }
  private setIllumination(mode: '3d' | 'floor') {
    const { day, cloud } = this.atmosphere.profile;
    const dayStrengths = [.8, .4 + 3.2 * this.atmosphere.sunStrength, .5, .7];
    this.globalLights.forEach(({ light, exterior, floor }, i) => { light.intensity = mode === '3d' ? THREE.MathUtils.lerp(exterior, dayStrengths[i], day) : floor; });
    const sunlight = this.globalLights[1]?.light as THREE.DirectionalLight | undefined;
    if (sunlight) {
      if (mode === '3d' && this.weatherEnabled && (day > 0 || this.atmosphere.moonStrength > 0)) {
        sunlight.target.position.set(0, 27, 0);
        sunlight.position.copy(this.atmosphere.sunDirection).multiplyScalar(150).add(sunlight.target.position);
        sunlight.color.set(day === 0 ? 0xb7d5ff : this.atmosphere.preview || day < .4 ? 0xffd7a0 : 0xfff0d5);
        if (day === 0) sunlight.intensity = .65 * this.atmosphere.moonStrength;
      } else {
        sunlight.position.set(-45, 100, 75); sunlight.target.position.set(0, 0, 0); sunlight.color.set(0xffe8c1);
      }
      // DirectionalLight targets must participate in world-matrix updates.
      sunlight.target.updateMatrixWorld();
    }
    this.hospitalLights.children.forEach(light => {
      if (light instanceof THREE.SpotLight) {
        light.userData.nightIntensity ??= light.intensity;
        light.intensity = (this.originalProposal ? light.userData.heroIntensity : light.userData.nightIntensity) * THREE.MathUtils.lerp(1, this.originalProposal ? .28 : .08, day);
      }
    });
    this.hospital?.setDaylight(day);
    this.context?.setEmphasis(this.originalProposal && !this.contextView);
    this.scene.environment = mode === '3d' && this.weatherEnabled && this.atmosphere.environment ? this.atmosphere.environment.texture : this.environmentTarget.texture;
    this.scene.environmentIntensity = mode === '3d' ? THREE.MathUtils.lerp(this.originalProposal ? .16 : .09, .65, day) : .24;
    this.bloom.strength = mode === '3d' ? THREE.MathUtils.lerp(.3, .12, day) : .14;
    this.bloom.radius = mode === '3d' ? .32 : .2;
    this.bloom.threshold = mode === '3d' ? THREE.MathUtils.lerp(1.15, 1.65, day) : 1.65;
    this.scene.background = mode === 'floor' ? this.floorBackground : this.weatherEnabled && this.atmosphere.ready ? this.atmosphere.background : this.exteriorBackground;
    this.atmosphere.group.visible = mode === '3d' && this.weatherEnabled && !this.contextView;
    this.applyFog();
  }
  private applyFog() {
    if (!(this.scene.fog instanceof THREE.FogExp2)) return;
    const { day, kind } = this.atmosphere.profile;
    const wet = ['rain', 'snow', 'storm', 'fog'].includes(kind);
    this.scene.fog.color.set(this.mode === 'floor' ? 0x102f4c : wet ? 0x182f46 : 0x102f4c);
    if (this.mode === '3d') this.scene.fog.color.lerp(new THREE.Color(wet ? 0x8398a8 : 0x86acc8), day);
    this.scene.fog.density = this.mode === '3d' && this.contextView ? .00012 : this.mode === 'floor' ? .0028 : wet ? kind === 'fog' ? .005 : .0032 : THREE.MathUtils.lerp(.0028, .0009, day);
  }
  setAtmosphere(weather: WeatherReading | undefined, now: Date, enabled: boolean, sunPreview = false) {
    this.weatherEnabled = enabled;
    if (this.atmosphere.update(weather && isFresh(weather, now.getTime()) ? weather : undefined, now, enabled, sunPreview)) {
      this.setIllumination(this.mode);
      if (this.mode === '3d') { this.renderDirty = true; this.renderer.shadowMap.needsUpdate = true; }
    }
  }
  private addLabel(text: string, position: THREE.Vector3, floorOnly: boolean, action: () => void, className: string) {
    const element = document.createElement('button'); element.textContent = translate(text, this.language); element.className = className;
    element.setAttribute('aria-label', translate(floorOnly ? '选择设备 ' + text : '选择' + text.split(' · ')[0], this.language));
    element.addEventListener('click', action); (floorOnly ? this.floorDisposables : this.disposables).push(() => element.removeEventListener('click', action));
    this.labels.appendChild(element); this.labelNodes.push({ element, position, floorOnly, sourceText: text });
  }
  private createFloor() {
    this.clearFloor();
    const layout = getFloorLayout(this.selected, this.floor); this.floorKey = layout.key;
    createFloorGeometry(this.floorMap, layout);
    for (const d of layout.devices) {
      const pin = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.3, 20), new THREE.MeshBasicMaterial({ color: 0x25ded7 }));
      pin.rotation.z = Math.PI; pin.position.set(d.x, 3.1, d.z);
      pin.userData.device = d.id; pin.userData.type = d.type; this.floorMap.add(pin);
      this.addLabel(d.name, new THREE.Vector3(d.x, 4.4, d.z), true, () => this.options.onDevice(d.id), 'device-label device-pin ' + (d.status === '告警' ? 'warning' : ''));
      const element = this.labelNodes[this.labelNodes.length - 1].element;
      element.dataset.type = d.type; element.dataset.device = d.id; element.title = translate(d.name, this.language);
      element.textContent = '';
      const root = createRoot(element), Icon = deviceSystems.find(system => system.type === d.type)!.icon;
      root.render(createElement(Icon, { size: 21, strokeWidth: 1.8, 'aria-hidden': true }));
      // Floor replacement is triggered from an App effect. Release the nested icon root
      // after that React commit, while removing its DOM/listener immediately below.
      this.floorDisposables.push(() => queueMicrotask(() => root.unmount()));
    }
    this.updateDeviceVisibility(); this.setSelectedDevice(null);
    this.renderer.shadowMap.needsUpdate = true;
  }
  private clearFloor() {
    this.floorDisposables.splice(0).forEach(dispose => dispose());
    this.labelNodes = this.labelNodes.filter(label => { if (label.floorOnly) { label.element.remove(); return false; } return true; });
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    this.floorMap.traverse(object => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      }
      if (object instanceof THREE.DirectionalLight) object.shadow.dispose();
    });
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    this.floorMap.clear();
  }
  setMode(mode: '3d' | 'floor') {
    if (mode === this.mode) return;
    this.clearMomentum();
    if (mode === 'floor') {
      this.savedPosition.copy(this.camera.position); this.savedTarget.copy(this.controls.target);
      const fit = this.floorFit(), x = innerWidth <= 760 ? 0 : 2; this.fittedFloorScale = fit;
      this.camera.position.set(x, 50 * fit, 44 * fit + 3); this.controls.target.set(x, 0, 3);
      this.controls.minDistance = 35; this.controls.maxDistance = 220;
    } else {
      this.camera.position.copy(this.savedPosition); this.controls.target.copy(this.savedTarget);
      this.controls.minDistance = 55; this.controls.maxDistance = this.contextView ? 6000 : 520;
    }
    this.mode = mode; this.city.visible = mode === '3d'; this.floorMap.visible = mode === 'floor';
    this.setIllumination(mode);
    this.camera.far = mode === '3d' && this.contextView ? 10000 : 1200; this.camera.updateProjectionMatrix();
    this.floorAO.enabled = mode === 'floor';
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
  setFloor(floor: number) {
    const layout = getFloorLayout(this.selected, floor); this.floor = layout.floor;
    if (this.floorKey !== layout.key) this.createFloor();
  }
  setLayers(showDevices: boolean, showSurroundings: boolean) {
    this.markers.visible = showDevices; this.surroundings.visible = showSurroundings;
    this.renderDirty = true;
    this.renderer.shadowMap.needsUpdate = true;
    this.updateDeviceVisibility();
  }
  setProposal(enabled: boolean) {
    this.originalProposal = enabled; this.hospital.setProposal(enabled);
    this.setIllumination(this.mode);
    this.renderDirty = true; this.renderer.shadowMap.needsUpdate = true;
  }
  setLanguage(language: Language) {
    this.language = language;
    this.renderer.domElement.setAttribute('aria-label', translate('可旋转的楼宇三维模型', language));
    for (const label of this.labelNodes) {
      if (!label.floorOnly) label.element.textContent = translate(label.sourceText, language);
      label.element.title = translate(label.sourceText, language);
      label.element.setAttribute('aria-label', translate(label.floorOnly ? '选择设备 ' + label.sourceText : '选择' + label.sourceText.split(' · ')[0], language));
    }
  }
  setDeviceFilter(filter: DeviceFilter) { this.deviceFilter = filter; this.updateDeviceVisibility(); }
  private updateDeviceVisibility() {
    this.renderDirty = true;
    for (const label of this.labelNodes) if (label.floorOnly) label.element.dataset.hiddenLayer = String(!this.markers.visible || (this.deviceFilter !== 'all' && label.element.dataset.type !== this.deviceFilter));
    for (const mesh of this.floorMap.children) if (mesh.userData.device) mesh.visible = this.markers.visible && (this.deviceFilter === 'all' || mesh.userData.type === this.deviceFilter);
  }
  setSelectedDevice(id: string | null) {
    for (const label of this.labelNodes) if (label.floorOnly) {
      const selected = label.element.dataset.device === id;
      label.element.classList.toggle('selected-device', selected);
      label.element.setAttribute('aria-pressed', String(selected));
    }
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
    if (this.mode === '3d') {
      this.contextView = false; this.controls.maxDistance = 520;
      this.camera.far = 1200; this.camera.updateProjectionMatrix();
      this.setIllumination(this.mode);
    }
    const auto = this.controls.autoRotate; this.controls.autoRotate = false;
    this.controls.enableDamping = false;
    const fit = Math.max(1, Math.min(1.85, 1.05 / this.camera.aspect));
    const floorFit = this.floorFit(), x = innerWidth <= 760 ? 0 : 2; this.fittedFloorScale = floorFit;
    const exteriorOrbit = new THREE.Spherical(160 * fit, this.controls.maxPolarAngle, Math.atan2(-.84, .54));
    this.camera.position.copy(this.mode === '3d' ? new THREE.Vector3().setFromSpherical(exteriorOrbit).add(new THREE.Vector3(10, 32, 0)) : new THREE.Vector3(x, 50 * floorFit, 44 * floorFit + 3));
    this.controls.target.set(this.mode === '3d' ? 10 : x, this.mode === '3d' ? 32 : 0, this.mode === '3d' ? 0 : 3); this.controls.update();
    this.controls.enableDamping = true; this.controls.autoRotate = auto;
  }
  showContext() {
    if (this.mode !== '3d' || !this.context.ready) return;
    this.clearMomentum(); this.contextView = true;
    this.controls.maxDistance = 6000; this.camera.far = 10000; this.camera.updateProjectionMatrix();
    this.setIllumination(this.mode);
    const sphere = this.context.bounds.getBoundingSphere(new THREE.Sphere());
    const margin = innerWidth > 1050 ? (innerWidth <= 1240 ? 493 : 646) : 22;
    const aspect = Math.max(100, this.host.clientWidth - margin) / this.host.clientHeight;
    const angle = Math.min(THREE.MathUtils.degToRad(this.camera.fov / 2), Math.atan(Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * aspect));
    const distance = Math.min(5900, sphere.radius / Math.sin(angle) * 1.08);
    this.controls.target.copy(sphere.center);
    this.camera.position.copy(sphere.center).add(new THREE.Vector3(-.43, .74, .52).normalize().multiplyScalar(distance));
    this.controls.update(); this.renderDirty = true;
  }
  zoom(factor: number) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, this.controls.minDistance, this.controls.maxDistance));
    this.camera.position.copy(this.controls.target).add(offset); this.controls.update();
  }
  viewSun() {
    if (this.mode !== '3d' || this.atmosphere.sunStrength <= 0) return;
    this.clearMomentum();
    const direction = this.atmosphere.sunDirection;
    const distance = this.camera.position.distanceTo(this.controls.target);
    const orbit = new THREE.Spherical(distance, this.controls.maxPolarAngle, Math.atan2(-direction.x, -direction.z));
    this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(orbit));
    this.controls.update(); this.renderDirty = true;
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
    const hit = this.raycaster.intersectObjects(this.mode === '3d' ? [this.hospital.root, this.context.buildings] : this.floorMap.children, true).find(candidate => {
      for (let object: THREE.Object3D | null = candidate.object; object; object = object.parent) if (!object.visible) return false;
      return true;
    });
    this.lastPickSourceHandle = hit?.object.userData.sourceHandle ?? null;
    if (!hit) return;
    let obj: THREE.Object3D | null = hit.object;
    while (obj) { if (obj.userData.building) { this.options.onSelect(obj.userData.building); break; } if (obj.userData.device) { this.options.onDevice(obj.userData.device); break; } obj = obj.parent; }
  }
  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h);
    if (this.mode === 'floor') {
      const fit = this.floorFit(), offset = this.camera.position.clone().sub(this.controls.target);
      offset.multiplyScalar(fit / this.fittedFloorScale);
      offset.setLength(THREE.MathUtils.clamp(offset.length(), 35, 220));
      this.camera.position.copy(this.controls.target).add(offset); this.fittedFloorScale = fit; this.controls.update();
    }
    this.composer.setSize(w, h);
    const ratio = this.renderer.getPixelRatio();
    this.floorAO.setSize(Math.max(1, Math.round(w * ratio * .5)), Math.max(1, Math.round(h * ratio * .5)));
    this.bloom.setSize(w * ratio * .5, h * ratio * .5);
    this.antialias?.uniforms['resolution'].value.set(1 / (w * ratio), 1 / (h * ratio));
    this.renderDirty = true;
    if (this.frame === 0 && this.controls) this.reset();
  }
  private floorFit() {
    const margin = innerWidth > 1050 ? (innerWidth <= 1240 ? 493 : 646) : innerWidth > 760 ? 66 : 22;
    const available = Math.max(100, this.host.clientWidth - margin);
    // Include perspective expansion of the near edge, plus breathing room around the perimeter.
    return Math.max(1, Math.min(3.2, 48 * this.host.clientHeight * 1.22 / (2 * Math.tan(Math.PI / 9) * Math.hypot(50, 44) * available * .94)));
  }
  private animate = (time: number) => {
    if (this.destroyed) return;
    const elapsed = this.lastTime ? Math.min((time - this.lastTime) / 1000, .25) : 1 / 60;
    // Preserve the 60 Hz easing on hardware while avoiding a long tail of expensive software frames.
    this.controls.dampingFactor = 1 - Math.pow(1 - .09, elapsed * 60);
    this.controls.update(Math.min(elapsed, .05)); this.lastTime = time;
    if (this.atmosphere.tick(time)) this.renderDirty = true;
    // Static architecture needs no repeated GPU work. Controls still tick for smooth damping/patrol.
    if (this.renderDirty && time - this.lastRenderTime >= this.renderInterval) {
      this.renderer.info.reset(); this.composer.render(); this.frame++;
      this.renderDirty = false; this.lastRenderTime = time;
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
  private visibleTriangles() {
    let count = 0;
    this.scene.traverseVisible(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry, available = geometry.index?.count ?? geometry.attributes.position?.count ?? 0;
      const vertices = Math.min(Math.max(0, available - geometry.drawRange.start), geometry.drawRange.count);
      count += Math.floor(vertices / 3) * (object instanceof THREE.InstancedMesh ? object.count : 1);
    });
    return count;
  }
  snapshot() { return { contextFinishes: this.context.finishState, moon: { strength: this.atmosphere.moonStrength, visible: this.mode === '3d' && this.weatherEnabled && this.atmosphere.moonStrength > 0, screen: this.camera.position.clone().addScaledVector(this.atmosphere.sunDirection, 500).project(this.camera).toArray() }, visibleTriangles: this.visibleTriangles(), sun: { preview: this.atmosphere.preview, strength: this.atmosphere.sunStrength, visible: this.mode === '3d' && this.weatherEnabled && this.atmosphere.sunStrength > 0, direction: this.atmosphere.sunDirection.toArray(), screen: this.camera.position.clone().addScaledVector(this.atmosphere.sunDirection, 500).project(this.camera).toArray() }, camera: this.camera.position.toArray(), target: this.controls.target.toArray(), distance: this.camera.position.distanceTo(this.controls.target), originalProposal: this.originalProposal, proposalDetails: this.hospital.proposalDetails, mode: this.mode, auto: this.auto, autoActive: this.controls.autoRotate, selected: this.selected, floor: this.floor, frames: this.frame, objects: this.renderer.info.render.triangles, gpuGeometries: this.renderer.info.memory.geometries, devicesVisible: this.markers.visible, surroundingsVisible: this.surroundings.visible, hospitalReady: this.hospital.ready, contextReady: this.context.ready, lastPickSourceHandle: this.lastPickSourceHandle, contextView: this.contextView, assetsReady: this.hdrSettled && this.architecture.assetsReady && this.hospital.ready && this.context.ready && !this.renderDirty }; }
  dispose() {
    this.destroyed = true; cancelAnimationFrame(this.frameId); this.observer.disconnect(); this.controls.dispose(); this.disposables.forEach(fn => fn());
    this.clearFloor();
    this.context.buildings.removeFromParent(); this.context.ground.removeFromParent(); this.context.dispose();
    this.hospital.root.removeFromParent(); this.hospital.dispose();
    this.atmosphere.dispose();
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
    this.floorAO.dispose(); this.bloom.dispose(); this.output.dispose(); this.composer.dispose();
    this.antialias?.dispose();
    this.renderer.dispose(); this.renderer.domElement.remove(); this.labels.remove();
  }
}
