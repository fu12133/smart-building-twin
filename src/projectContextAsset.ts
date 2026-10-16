import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Original surrounding/site shape, shared source coordinates; finishes are proposals. */
export class ProjectContextAsset {
  readonly buildings = new THREE.Group();
  readonly ground = new THREE.Group();
  readonly bounds = new THREE.Box3();
  ready = false;
  private disposed = false;
  private emphasized = false;
  private day = 0;
  private buildingMaterials = new Set<THREE.MeshStandardMaterial>();
  private palette = new Map<THREE.MeshStandardMaterial, THREE.Color>();
  private views: { mesh: THREE.Mesh; source: THREE.Material; design: THREE.MeshStandardMaterial[]; originalGroups: { start: number; count: number; materialIndex?: number }[]; groups: { start: number; count: number; materialIndex: number }[] }[] = [];
  private designMaterials = new Set<THREE.Material>();
  private finishes = new Map<THREE.MeshStandardMaterial, { color: THREE.Color; roughness: number; environment: number; opacity: number; transparent: boolean; depthWrite: boolean }>();
  get finishState() {
    const active = new Set<THREE.MeshStandardMaterial>();
    const collect = (object: THREE.Object3D) => {
      if (!(object instanceof THREE.Mesh)) return;
      const source = object.material as THREE.Material | THREE.Material[];
      const materials: THREE.Material[] = Array.isArray(source) ? object.geometry.groups.map((g: { materialIndex?: number }) => source[g.materialIndex ?? 0]) : [source];
      materials.forEach(m => { if (m instanceof THREE.MeshStandardMaterial) active.add(m); });
    };
    this.buildings.traverse(collect); this.ground.traverse(collect);
    return [...active].map(material => [material.name, material.color.getHexString(), material.roughness, material.envMapIntensity, material.opacity, material.transparent, material.depthWrite]);
  }

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
      const retired = new Set<THREE.Material>();
      this.buildings.position.fromArray(anchor); this.ground.position.fromArray(anchor);
      for (const mesh of meshes) {
        const role = mesh.userData.contextRole, building = role === 'city' || role === 'nearby';
        if (building) {
          const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const copies = source.map(material => { retired.add(material); return material.clone(); });
          mesh.material = Array.isArray(mesh.material) ? copies : copies[0];
        }
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          if (!(material instanceof THREE.MeshStandardMaterial)) continue;
          if (building) this.buildingMaterials.add(material);
          material.envMapIntensity = .7;
          if (material.name === 'context-facade') {
            const colors = ['#668ca5', '#58768d', '#8e9895', '#9a8972', '#477f84', '#777b91'];
            this.palette.set(material, new THREE.Color(colors[Number(mesh.userData.sourceHandle) % colors.length]));
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
      const used = new Set(meshes.flatMap(mesh => Array.isArray(mesh.material) ? mesh.material : [mesh.material]));
      retired.forEach(material => { if (!used.has(material)) material.dispose(); });
      this.buildings.updateMatrixWorld(true); this.ground.updateMatrixWorld(true);
      for (const mesh of meshes) {
        mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox) this.bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
      }
      if (this.bounds.isEmpty() || !this.bounds.min.toArray().every(Number.isFinite) || !this.bounds.max.toArray().every(Number.isFinite)) { this.dispose(); onError(); return; }
      for (const mesh of meshes) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        if (material instanceof THREE.MeshStandardMaterial && !this.finishes.has(material)) this.finishes.set(material, { color: material.color.clone(), roughness: material.roughness, environment: material.envMapIntensity, opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite });
      }
      for (const mesh of meshes) {
        if (!(mesh.material instanceof THREE.MeshStandardMaterial) || mesh.material.name !== 'context-facade') continue;
        const source = mesh.material, colors = ['#668ca5', '#58768d', '#8e9895', '#9a8972', '#477f84', '#777b91'];
        const design = colors.map(color => {
          const material = source.clone(); this.palette.set(material, new THREE.Color(color)); this.buildingMaterials.add(material); this.designMaterials.add(material);
          this.finishes.set(material, { ...this.finishes.get(source)!, color: source.color.clone() }); return material;
        });
        this.views.push({ mesh, source, design, originalGroups: mesh.geometry.groups.map(g => ({ ...g })), groups: ProjectContextAsset.componentGroups(mesh.geometry, colors.length) });
      }
      this.ready = true; this.setEmphasis(this.emphasized, this.day); onLoad();
    }, undefined, () => { if (!this.disposed) onError(); });
  }

  setEmphasis(enabled: boolean, day = 0) {
    this.emphasized = enabled; this.day = day;
    for (const view of this.views) { view.mesh.material = enabled ? view.design : view.source; view.mesh.geometry.groups = enabled ? view.groups : view.originalGroups; }
    for (const [material, source] of this.finishes) {
      const accent = enabled ? this.palette.get(material) : undefined;
      material.color.copy(accent ?? source.color).multiplyScalar(enabled ? accent ? THREE.MathUtils.lerp(.65, .85, day) : THREE.MathUtils.lerp(.22, .65, day) : 1);
      material.roughness = enabled ? Math.max(.72, source.roughness) : source.roughness;
      material.envMapIntensity = enabled ? .22 : source.environment;
      const ghost = enabled && this.buildingMaterials.has(material);
      const transparent = ghost || source.transparent;
      if (material.transparent !== transparent) { material.transparent = transparent; material.needsUpdate = true; }
      material.opacity = ghost ? THREE.MathUtils.lerp(.38, .85, day) : source.opacity;
      material.depthWrite = ghost ? false : source.depthWrite;
    }
  }

  /** Color connected facade islands while keeping every source vertex/index unchanged. */
  private static componentGroups(geometry: THREE.BufferGeometry, colors: number) {
    const positions = geometry.getAttribute('position'), index = geometry.index, count = index?.count ?? positions.count;
    const parent = Int32Array.from({ length: count / 3 }, (_, i) => i), vertices = new Map<string, number>();
    const find = (n: number): number => { while (parent[n] !== n) { parent[n] = parent[parent[n]]; n = parent[n]; } return n; };
    for (let i = 0; i < count; i++) {
      const p = index ? index.getX(i) : i, triangle = Math.floor(i / 3);
      const key = [positions.getX(p), positions.getY(p), positions.getZ(p)].map(v => Math.round(v * 100)).join('/');
      const previous = vertices.get(key);
      if (previous !== undefined) parent[find(triangle)] = find(previous); else vertices.set(key, triangle);
    }
    const ids = new Map<number, number>(), groups: { start: number; count: number; materialIndex: number }[] = [];
    for (let i = 0; i < parent.length; i++) {
      const root = find(i); if (!ids.has(root)) ids.set(root, ids.size);
      const materialIndex = ids.get(root)! % colors, previous = groups[groups.length - 1];
      if (previous?.materialIndex === materialIndex) previous.count += 3; else groups.push({ start: i * 3, count: 3, materialIndex });
    }
    return groups;
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
    this.setEmphasis(false);
    ProjectContextAsset.release(this.buildings); ProjectContextAsset.release(this.ground);
    this.buildings.clear(); this.ground.clear();
    this.finishes.clear(); this.buildingMaterials.clear(); this.palette.clear();
    this.designMaterials.forEach(m => m.dispose()); this.designMaterials.clear(); this.views = [];
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
