import * as THREE from 'three';
import { daylight, weatherKind, WeatherReading } from './weather';

const noise = (n: number) => { const value = Math.sin(n * 127.1 + 61.7) * 43758.5453; return value - Math.floor(value); };
/** Display atmosphere only: never adds architecture to the source model. Owned by BuildingScene. */
export class SceneAtmosphere {
  readonly group = new THREE.Group();
  sky: THREE.CanvasTexture;
  ready = false;
  environment?: THREE.WebGLRenderTarget;
  profile = { day: 0, cloud: 0, kind: 'clear', wet: false };
  private canvas = document.createElement('canvas');
  private key = '';
  private rain: THREE.LineSegments;
  private snow: THREE.Points;
  private geometry = new THREE.BufferGeometry();
  private positions = new Float32Array(420 * 6);
  private lastTick = 0;

  constructor(private renderer: THREE.WebGLRenderer, private animationFPS = 24) {
    this.canvas.width = 512; this.canvas.height = 256;
    this.sky = this.skyTexture();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.rain = new THREE.LineSegments(this.geometry, new THREE.LineBasicMaterial({ color: 0xbadcf1, transparent: true, opacity: .3, depthWrite: false }));
    this.snow = new THREE.Points(this.geometry, new THREE.PointsMaterial({ color: 0xe6f4ff, size: .25, transparent: true, opacity: .65, depthWrite: false }));
    this.rain.frustumCulled = this.snow.frustumCulled = false;
    this.group.name = '天气展示效果'; this.group.add(this.rain, this.snow); this.group.visible = false;
  }
  update(weather: WeatherReading | undefined, now: Date, enabled: boolean) {
    const day = enabled ? daylight(weather, now) : 0;
    const cloud = enabled ? Math.round((weather?.cloud || 0) / 10) / 10 : 0;
    const kind = enabled && weather ? weatherKind(weather.code) : 'clear';
    const wet = enabled && !!weather && (weather.precipitation > 0 || ['rain', 'snow', 'storm'].includes(kind));
    const key = [enabled, day, cloud, kind, wet].join('/');
    if (key === this.key) return false;
    this.key = key; this.profile = { day, cloud, kind, wet };
    this.ready = true;
    this.rain.visible = wet && kind !== 'snow'; this.snow.visible = wet && kind === 'snow';
    this.drawSky(day, cloud, kind);
    this.environment?.dispose(); this.environment = undefined;
    if (enabled && day > 0) {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.environment = pmrem.fromEquirectangular(this.sky); pmrem.dispose();
    }
    this.tick(0, true);
    return true;
  }
  private drawSky(day: number, cloud: number, kind: string) {
    const context = this.canvas.getContext('2d')!;
    const overcast = cloud > .65 || ['rain', 'fog', 'storm', 'snow'].includes(kind);
    const top = new THREE.Color(0x061a32).lerp(new THREE.Color(overcast ? 0x52687c : 0x347ab4), day);
    const horizon = new THREE.Color(0x234364).lerp(new THREE.Color(overcast ? 0xb0bcc5 : 0xb4d6ec), day);
    const ground = new THREE.Color(0x0a1724).lerp(new THREE.Color(0x667b8b), day);
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#' + top.getHexString()); gradient.addColorStop(.52, '#' + horizon.getHexString()); gradient.addColorStop(1, '#' + ground.getHexString());
    context.fillStyle = gradient; context.fillRect(0, 0, 512, 256);
    if (day > 0 && !overcast) {
      const y = day < .35 ? 124 : 80, radius = 20 + day * 35;
      const sun = context.createRadialGradient(125, y, 0, 125, y, radius);
      sun.addColorStop(0, day < .35 ? `rgba(255,201,131,${day * .7})` : `rgba(255,248,224,${day * .7})`); sun.addColorStop(1, 'rgba(255,232,192,0)');
      context.fillStyle = sun; context.fillRect(125 - radius, y - radius, radius * 2, radius * 2);
    }
    // Soft deterministic cloud banks live only in the environment map, not source meshes.
    for (let i = 0; i < Math.round(cloud * 24); i++) {
      const x = noise(i) * 512, y = 45 + noise(i + 18) * 66, radius = 20 + noise(i + 39) * 40;
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      const color = overcast ? '167,181,194' : '227,240,247';
      glow.addColorStop(0, `rgba(${color},${.08 + day * .2})`); glow.addColorStop(1, `rgba(${color},0)`);
      context.fillStyle = glow; context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    // WebGLCubeMaps caches equirectangular backgrounds by texture identity.
    // Replace/dispose the previous texture so a new weather profile cannot retain yesterday's sky.
    this.sky.dispose(); this.sky = this.skyTexture();
  }
  private skyTexture() {
    const texture = new THREE.CanvasTexture(this.canvas); texture.colorSpace = THREE.SRGBColorSpace;
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
    this.environment?.dispose(); this.sky.dispose();
  }
}
