import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Imported exterior illustration; it is not the hospital's surveyed BIM. */
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
      model.traverse(object => {
        // Omit source ground/road and foreign institution signs; shared resources remain owned.
        if (/Plane001|Box002|Model.Text/.test(object.name)) object.visible = false;
        if (object instanceof THREE.Mesh) {
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (material instanceof THREE.MeshStandardMaterial && material.name === '04_-_Default') {
              material.roughness = .16; material.metalness = .28;
              material.color.set('#27748a'); material.envMapIntensity = 1.8;
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
      // Uniform scaling retains architectural proportions. Root translation grounds the model.
      model.scale.multiplyScalar(60 / span); model.updateMatrixWorld(true);
      const scaled = HospitalAsset.visibleBounds(model);
      const center = scaled.getCenter(new THREE.Vector3());
      this.root.position.set(-center.x, -scaled.min.y, -center.z);
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
