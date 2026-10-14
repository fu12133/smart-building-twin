import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** User-supplied DWG geometry with proposed facade finishes; floor layouts remain illustrative. */
export class HospitalAsset {
  readonly root = new THREE.Group();
  readonly bounds = new THREE.Box3();
  ready = false;
  failed = false;
  private disposed = false;

  constructor(url: string, private onLoad: () => void, private onError: () => void) {
    new GLTFLoader().load(url, asset => {
      if (this.disposed) { HospitalAsset.release(asset.scene); return; }
      const model = asset.scene;
      const finishes = HospitalAsset.facadeTextures();
      model.traverse(object => {
        if (object instanceof THREE.Mesh) {
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (material instanceof THREE.MeshStandardMaterial) {
              if (material.name === 'project-glass') {
                material.color.set('#ffffff'); material.map = finishes.color;
                material.emissiveMap = finishes.light; material.emissive.set('#ffffff'); material.emissiveIntensity = .7;
                material.roughness = .19; material.metalness = .28; material.envMapIntensity = 3.2;
              } else if (material.name === 'project-metal') {
                material.color.set('#e5e8dd'); material.metalness = .55; material.roughness = .28;
                material.emissive.set('#aebccc'); material.emissiveIntensity = .15;
              } else {
                material.color.set('#c7c9b9'); material.roughness = .7; material.metalness = .05;
              }
            }
          }
        }
      });
      model.updateMatrixWorld(true);
      const original = HospitalAsset.visibleBounds(model);
      const size = original.getSize(new THREE.Vector3());
      const span = Math.max(size.x, size.z);
      if (!Number.isFinite(span) || span <= 0) {
        HospitalAsset.release(model); this.failed = true; this.onError(); return;
      }
      // The conversion already calibrates source geometry uniformly; never normalize it again.
      const center = original.getCenter(new THREE.Vector3());
      this.root.position.set(-center.x, -original.min.y, -center.z);
      this.root.add(model);
      model.traverse(object => {
        if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; }
      });
      this.root.updateMatrixWorld(true); this.bounds.copy(HospitalAsset.visibleBounds(this.root));
      this.ready = true; this.onLoad();
    }, undefined, () => {
      if (!this.disposed) { this.failed = true; this.onError(); }
    });
  }

  private static facadeTextures() {
    const color = document.createElement('canvas'), light = document.createElement('canvas');
    color.width = light.width = 512; color.height = light.height = 1024;
    const c = color.getContext('2d')!, e = light.getContext('2d')!;
    c.fillStyle = '#174655'; c.fillRect(0, 0, 512, 1024); e.fillStyle = '#000'; e.fillRect(0, 0, 512, 1024);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
      const x = col * 128, y = row * 256, occupied = (row * 7 + col * 3) % 9 < 2;
      const gradient = c.createLinearGradient(x, y, x + 128, y + 256);
      gradient.addColorStop(0, occupied ? '#bfc3ad' : '#83a4b7'); gradient.addColorStop(1, occupied ? '#83948d' : '#386079');
      c.fillStyle = gradient; c.fillRect(x + 4, y + 5, 120, 247);
      c.fillStyle = '#809098'; c.fillRect(x, y, 3, 256); c.fillRect(x, y, 128, 3);
      c.fillStyle = '#122c3d'; c.fillRect(x + 4, y + 222, 120, 29);
      c.fillStyle = '#b6c3c8'; c.fillRect(x, y + 252, 128, 2);
      if (occupied) {
        e.fillStyle = '#b39762'; e.fillRect(x + 12, y + 30, 105, 188);
        for (let j = 0; j < 6; j++) { e.fillStyle = 'rgba(35,35,32,.42)'; e.fillRect(x + 16 + j * 18, y + 30, 3, 188); }
      }
    }
    const texture = (canvas: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
    };
    return { color: texture(color), light: texture(light) };
  }

  dispose() {
    this.disposed = true; this.ready = false;
    HospitalAsset.release(this.root); this.root.clear();
  }

  private static visibleBounds(root: THREE.Object3D) {
    const bounds = new THREE.Box3();
    root.traverseVisible(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.computeBoundingBox();
        if (object.geometry.boundingBox) bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
      }
    });
    return bounds;
  }

  private static release(root: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    const bitmaps = new Set<ImageBitmap>();
    root.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) {
        geometries.add(object.geometry);
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        });
        if (object instanceof THREE.InstancedMesh) object.dispose();
      }
    });
    textures.forEach(texture => {
      const source = texture.source.data;
      if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) bitmaps.add(source);
      texture.dispose();
    });
    bitmaps.forEach(bitmap => bitmap.close());
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
  }
}
