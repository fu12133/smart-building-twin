import * as THREE from 'three';
import { daylight, weatherKind, WeatherReading } from './weather';

const noise = (n: number) => { const value = Math.sin(n * 127.1 + 61.7) * 43758.5453; return value - Math.floor(value); };
/** Display atmosphere only: never adds architecture to the source model. Owned by BuildingScene. */
export class SceneAtmosphere {
  readonly group = new THREE.Group();
  sky: THREE.CanvasTexture;
  ready = false;
  environment?: THREE.WebGLRenderTarget;
  private backgroundTarget?: THREE.WebGLCubeRenderTarget;
  private reflectionCanvas?: HTMLCanvasElement;
  get background() { return this.backgroundTarget?.texture ?? this.sky; }
  profile = { day: 0, cloud: 0, kind: 'clear', wet: false };
  readonly sunDirection = new THREE.Vector3(-.4, .8, .5).normalize();
  sunStrength = 0;
  moonStrength = 0;
  preview = false;
  private canvas = document.createElement('canvas');
  private key = '';
  private rain: THREE.LineSegments;
  private snow: THREE.Points;
  private geometry = new THREE.BufferGeometry();
  private positions = new Float32Array(420 * 6);
  private lastTick = 0;

  constructor(private renderer: THREE.WebGLRenderer, private animationFPS = 24, private softwareGPU = false) {
    this.canvas.width = 2048; this.canvas.height = 1024;
    if (softwareGPU) {
      this.reflectionCanvas = document.createElement('canvas');
      this.reflectionCanvas.width = 1024; this.reflectionCanvas.height = 512;
    }
    this.sky = this.skyTexture();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.rain = new THREE.LineSegments(this.geometry, new THREE.LineBasicMaterial({ color: 0xbadcf1, transparent: true, opacity: .3, depthWrite: false }));
    this.snow = new THREE.Points(this.geometry, new THREE.PointsMaterial({ color: 0xe6f4ff, size: .25, transparent: true, opacity: .65, depthWrite: false }));
    this.rain.frustumCulled = this.snow.frustumCulled = false;
    this.group.name = '天气展示效果'; this.group.add(this.rain, this.snow); this.group.visible = false;
  }
  update(weather: WeatherReading | undefined, now: Date, enabled: boolean, preview = false) {
    preview = enabled && preview;
    const day = enabled ? preview ? .85 : daylight(weather, now) : 0;
    const cloud = enabled && !preview ? Math.max(weather?.code === 3 ? .8 : 0, Math.round((weather?.cloud || 0) / 10) / 10) : 0;
    const kind = enabled && weather && !preview ? weatherKind(weather.code) : 'clear';
    const wet = enabled && !preview && !!weather && (weather.precipitation > 0 || ['rain', 'snow', 'storm'].includes(kind));
    const key = [enabled, preview, day, cloud, kind, wet].join('/');
    if (key === this.key) return false;
    this.key = key; this.profile = { day, cloud, kind, wet }; this.preview = preview;
    // Low illustrative sky placement keeps default day/night effects in view.
    // It is not a surveyed solar direction, astronomical position or lunar phase.
    this.sunDirection.set(.62, .15, -.78).normalize();
    const transmission = Math.max(.24, 1 - cloud * .7 - (wet || kind === 'fog' ? .12 : 0));
    this.sunStrength = enabled && day > 0 ? transmission : 0;
    this.moonStrength = enabled && day === 0 ? transmission : 0;
    this.ready = true;
    this.rain.visible = wet && kind !== 'snow'; this.snow.visible = wet && kind === 'snow';
    this.drawSky(day, cloud, kind);
    this.backgroundTarget?.dispose(); this.backgroundTarget = undefined;
    if (enabled && this.softwareGPU) {
      // Keep the 2K painted sun, with a bounded cube conversion on software renderers.
      this.backgroundTarget = new THREE.WebGLCubeRenderTarget(512);
      this.backgroundTarget.fromEquirectangularTexture(this.renderer, this.sky);
    }
    this.environment?.dispose(); this.environment = undefined;
    if (enabled && day > 0) {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      let input = this.sky;
      if (this.reflectionCanvas) {
        this.reflectionCanvas.getContext('2d')!.drawImage(this.canvas, 0, 0, 1024, 512);
        input = this.skyTexture(this.reflectionCanvas);
      }
      try { this.environment = pmrem.fromEquirectangular(input); }
      finally { if (input !== this.sky) input.dispose(); pmrem.dispose(); }
    }
    this.tick(0, true);
    return true;
  }
  private drawSky(day: number, cloud: number, kind: string) {
    const context = this.canvas.getContext('2d')!;
    const overcast = cloud > .65 || ['rain', 'fog', 'storm', 'snow'].includes(kind);
    const top = new THREE.Color(0x061a32).lerp(new THREE.Color(overcast ? 0x52687c : 0x28699f), day);
    const horizon = new THREE.Color(0x234364).lerp(new THREE.Color(overcast ? 0xb0bcc5 : 0x91bddc), day);
    const ground = new THREE.Color(0x0a1724).lerp(new THREE.Color(0x526b7d), day);
    const gradient = context.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, '#' + top.getHexString()); gradient.addColorStop(.52, '#' + horizon.getHexString()); gradient.addColorStop(1, '#' + ground.getHexString());
    context.fillStyle = gradient; context.fillRect(0, 0, 2048, 1024);
    // Soft deterministic cloud banks live only in the environment map, not source meshes.
    for (let i = 0; i < Math.round(cloud * 24); i++) {
      const x = noise(i) * 2048, y = 180 + noise(i + 18) * 264, radius = 80 + noise(i + 39) * 160;
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      const color = overcast ? '167,181,194' : '227,240,247';
      glow.addColorStop(0, `rgba(${color},${.08 + day * .2})`); glow.addColorStop(1, `rgba(${color},0)`);
      context.fillStyle = glow; context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    if (this.sunStrength > 0) {
      const x = (Math.atan2(this.sunDirection.z, this.sunDirection.x) / (2 * Math.PI) + .5) * 2048;
      const y = (.5 - Math.asin(this.sunDirection.y) / Math.PI) * 1024;
      const warm = this.preview || day < .4, radius = warm ? 145 : 105;
      // Repeat at the seam so orbiting cannot reveal a clipped glow.
      for (const offset of [-2048, 0, 2048]) {
        const cx = x + offset;
        const halo = context.createRadialGradient(cx, y, 4, cx, y, radius);
        halo.addColorStop(0, `rgba(255,238,194,${.9 * this.sunStrength})`);
        halo.addColorStop(.12, `rgba(255,217,146,${.55 * this.sunStrength})`);
        halo.addColorStop(.4, `rgba(255,212,142,${.18 * this.sunStrength})`);
        halo.addColorStop(1, 'rgba(255,220,160,0)');
        context.fillStyle = halo; context.fillRect(cx - radius, y - radius, radius * 2, radius * 2);
        const disc = context.createRadialGradient(cx, y, 1, cx, y, 7);
        disc.addColorStop(0, '#fffef0'); disc.addColorStop(.75, warm ? '#fff1c7' : '#fff9e8'); disc.addColorStop(1, 'rgba(255,247,217,0)');
        context.globalAlpha = this.sunStrength; context.fillStyle = disc; context.fillRect(cx - 7, y - 7, 14, 14); context.globalAlpha = 1;
      }
    }
    if (this.moonStrength > 0) {
      const x = (Math.atan2(this.sunDirection.z, this.sunDirection.x) / (2 * Math.PI) + .5) * 2048;
      const y = (.5 - Math.asin(this.sunDirection.y) / Math.PI) * 1024;
      for (const offset of [-2048, 0, 2048]) {
        const cx = x + offset;
        const halo = context.createRadialGradient(cx, y, 8, cx, y, 90);
        halo.addColorStop(0, `rgba(185,215,255,${.35 * this.moonStrength})`);
        halo.addColorStop(.25, `rgba(148,193,245,${.13 * this.moonStrength})`);
        halo.addColorStop(1, 'rgba(130,180,240,0)');
        context.fillStyle = halo; context.fillRect(cx - 90, y - 90, 180, 180);
        context.save(); context.globalAlpha = .55 + .45 * this.moonStrength;
        context.beginPath(); context.arc(cx, y, 11, 0, Math.PI * 2); context.clip();
        const disc = context.createRadialGradient(cx - 4, y - 4, 1, cx, y, 14);
        disc.addColorStop(0, '#f4f5e7'); disc.addColorStop(.65, '#d8e1e3'); disc.addColorStop(1, '#8398ac');
        context.fillStyle = disc; context.fillRect(cx - 12, y - 12, 24, 24);
        // Deterministic lunar surface detail, explicitly a display design.
        for (let i = 0; i < 19; i++) {
          context.fillStyle = `rgba(91,112,133,${.08 + noise(i + 51) * .16})`;
          context.beginPath(); context.arc(cx + (noise(i + 8) - .5) * 20, y + (noise(i + 23) - .5) * 20, .6 + noise(i + 39) * 2.4, 0, Math.PI * 2); context.fill();
        }
        context.restore();
      }
    }
    // WebGLCubeMaps caches equirectangular backgrounds by texture identity.
    // Replace/dispose the previous texture so a new weather profile cannot retain yesterday's sky.
    this.sky.dispose(); this.sky = this.skyTexture();
  }
  private skyTexture(canvas = this.canvas) {
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping; return texture;
  }
  tick(time: number, force = false) {
    if (!force && (!this.group.visible || !this.profile.wet || document.hidden || time - this.lastTick < 1000 / this.animationFPS)) return false;
    this.lastTick = time;
    const snow = this.profile.kind === 'snow', fall = time / 1000 * (snow ? 1.6 : 21);
    for (let i = 0; i < 420; i++) {
      const x = (noise(i + 71) - .5) * 160, y = ((noise(i + 93) * 90 - fall) % 90 + 90) % 90 + 3, z = (noise(i + 127) - .5) * 140;
      this.positions.set([x, y, z, x + (snow ? .1 : .35), y - (snow ? .1 : 1.9), z], i * 6);
    }
    this.geometry.attributes.position.needsUpdate = true;
    return this.profile.wet;
  }
  dispose() {
    this.group.removeFromParent(); this.group.clear();
    this.geometry.dispose(); (this.rain.material as THREE.Material).dispose(); (this.snow.material as THREE.Material).dispose();
    this.environment?.dispose(); this.backgroundTarget?.dispose(); this.sky.dispose();
  }
}
