import * as THREE from 'three';

/** A local animated advertisement texture; no live video or clinical feed. Driven by BuildingScene. */
export class BillboardMotion {
  readonly canvas = document.createElement('canvas');
  readonly texture: THREE.CanvasTexture;
  private source?: HTMLImageElement;
  private lastTime = 0;
  private lastDraw = -Infinity;
  private elapsed = 0;
  frame = 0;
  active = false;
  constructor() {
    this.canvas.width = 384; this.canvas.height = 640;
    this.texture = new THREE.CanvasTexture(this.canvas); this.texture.colorSpace = THREE.SRGBColorSpace;
    this.draw();
  }
  setSource(image: HTMLImageElement) { this.source = image; this.draw(); }
  tick(time: number, enabled: boolean, interval: number) {
    this.active = enabled && !!this.source;
    const delta = this.lastTime ? Math.min((time - this.lastTime) / 1000, .25) : 0;
    this.lastTime = time;
    if (!this.active) return false;
    this.elapsed += delta;
    if (time - this.lastDraw < interval) return false;
    this.lastDraw = time; this.draw(); return true;
  }
  private draw() {
    const c = this.canvas.getContext('2d')!, w = this.canvas.width, h = this.canvas.height, t = this.elapsed;
    c.fillStyle = '#062642'; c.fillRect(0, 0, w, h);
    if (this.source) {
      const image = this.source, sh = image.naturalHeight, sw = sh * w / (h * .82);
      const pan = .5 + .43 * Math.sin(t * Math.PI / 7);
      c.drawImage(image, (image.naturalWidth - sw) * pan, 0, sw, sh, 0, 0, w, h * .82);
    }
    const wash = c.createLinearGradient(0, 0, 0, h); wash.addColorStop(0, 'rgba(7,45,81,.1)'); wash.addColorStop(.5, 'rgba(7,45,81,.3)'); wash.addColorStop(1, '#062642');
    c.fillStyle = wash; c.fillRect(0, 0, w, h);
    c.lineWidth = 2;
    for (let line = 0; line < 8; line++) {
      c.strokeStyle = `rgba(68,220,243,${.13 + line * .04})`; c.beginPath();
      for (let x = 0; x <= w; x += 6) { const y = h * .78 + line * 12 + Math.sin(x / 60 + t * 1.4 + line * .3) * 17; x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
    }
    const sweep = (t * 67) % (h + 120) - 60, g = c.createLinearGradient(0, sweep - 32, 0, sweep + 32);
    g.addColorStop(0, 'rgba(88,235,255,0)'); g.addColorStop(.5, 'rgba(88,235,255,.19)'); g.addColorStop(1, 'rgba(88,235,255,0)');
    c.fillStyle = g; c.fillRect(0, sweep - 32, w, 64);
    c.strokeStyle = '#39bad6'; c.lineWidth = 5; c.strokeRect(4, 4, w - 8, h - 8);
    this.texture.needsUpdate = true; this.frame++;
  }
  dispose() { this.active = false; this.source = undefined; this.texture.dispose(); this.canvas.width = this.canvas.height = 1; }
}
