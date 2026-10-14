import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Original surrounding/site shape, shared source coordinates; finishes are proposals. */
export class ProjectContextAsset {
  readonly buildings = new THREE.Group();
  readonly ground = new THREE.Group();
  readonly bounds = new THREE.Box3();
  ready = false;
  private disposed = false;

  constructor(url: string, onLoad: () => void, onError: () => void) {
    this.buildings.name = '白模周边建筑'; this.ground.name = '白模场地';
    new GLTFLoader().load(url, asset => {
      if (this.disposed) { ProjectContextAsset.release(asset.scene); return; }
      const model = asset.scene, anchor: unknown = model.userData.sourceAnchor;
      const meshes: THREE.Mesh[] = [];
      model.traverse(object => { if (object instanceof THREE.Mesh) meshes.push(object); });
      if (!meshes.length || !Array.isArray(anchor) || anchor.length !== 3 || !anchor.every(Number.isFinite) || meshes.some(mesh => !mesh.userData.sourceHandle || !mesh.userData.contextRole)) {
        ProjectContextAsset.release(model); onError(); return;
      }
      const facade = ProjectContextAsset.facadeTexture(), paving = ProjectContextAsset.pavingTexture();
      this.buildings.position.fromArray(anchor); this.ground.position.fromArray(anchor);
      for (const mesh of meshes) {
        const role = mesh.userData.contextRole, building = role === 'city' || role === 'nearby';
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          if (!(material instanceof THREE.MeshStandardMaterial)) continue;
          material.envMapIntensity = .7;
          if (material.name === 'context-facade') {
            material.map = facade; material.color.set('#8997a0');
            material.roughness = .55; material.metalness = .15;
          } else if (['local-site', 'east-site', 'west-site'].includes(role)) {
            material.map = paving;
          }
          if (role === 'site-panel' || role === 'base') {
            // Original zero-height CAD surfaces stay in place; avoid coincident depth flicker.
            material.polygonOffset = true; material.polygonOffsetFactor = role === 'base' ? 2 : -1;
            material.polygonOffsetUnits = role === 'base' ? 2 : -1;
          }
        }
        mesh.castShadow = role === 'nearby' || role === 'site-edge'; mesh.receiveShadow = true;
        (building ? this.buildings : this.ground).add(mesh);
      }
      this.buildings.updateMatrixWorld(true); this.ground.updateMatrixWorld(true);
      for (const mesh of meshes) {
        mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox) this.bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
      }
      if (this.bounds.isEmpty() || !this.bounds.min.toArray().every(Number.isFinite) || !this.bounds.max.toArray().every(Number.isFinite)) { this.dispose(); onError(); return; }
      this.ready = true; onLoad();
    }, undefined, () => { if (!this.disposed) onError(); });
  }

  private static facadeTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 512;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#263d4c'; context.fillRect(0, 0, 256, 512);
    for (let row = 0; row < 4; row++) for (let column = 0; column < 4; column++) {
      const x = column * 64, y = row * 128;
      const gradient = context.createLinearGradient(x, y, x + 64, y + 128);
      gradient.addColorStop(0, '#668395'); gradient.addColorStop(1, '#354e60');
      context.fillStyle = gradient; context.fillRect(x + 2, y + 3, 60, 111);
      context.fillStyle = '#405660'; context.fillRect(x, y + 116, 64, 12);
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4; return texture;
  }
  private static pavingTexture() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#bbc1bb'; context.fillRect(0, 0, 256, 256);
    context.strokeStyle = '#949c98'; context.lineWidth = 1;
    for (let i = 0; i <= 256; i += 32) { context.beginPath(); context.moveTo(i, 0); context.lineTo(i, 256); context.moveTo(0, i); context.lineTo(256, i); context.stroke(); }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4; return texture;
  }
  dispose() {
    this.disposed = true; this.ready = false;
    ProjectContextAsset.release(this.buildings); ProjectContextAsset.release(this.ground);
    this.buildings.clear(); this.ground.clear();
  }
  private static release(root: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    root.traverse(object => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
          materials.add(material); for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        });
      }
    });
    textures.forEach(texture => texture.dispose()); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
  }
}
