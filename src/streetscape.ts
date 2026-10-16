import * as THREE from 'three';
import { EntranceAnchor, ExitPedestrians } from './exitPedestrians';

const random = (n: number) => { const x = Math.sin(n * 127.1 + 17.3) * 43758.5453; return x - Math.floor(x); };
type Place = THREE.Vector3;

/** User-authorized illustrative props, sampled on the original site; never a replacement ground/city. */
export class Streetscape {
  readonly root = new THREE.Group();
  readonly counts: { trees: number; people: number; cars: number };
  private pending = 2;
  private disposed = false;
  private textures: THREE.Texture[] = [];
  private exits: ExitPedestrians;
  get pedestrianState() { return this.exits.state; }
  tickMotion(time: number, active: boolean, interval: number) { return this.exits.tick(time, active && this.root.visible, interval); }
  get assetsReady() { return this.pending === 0; }

  constructor(hospital: THREE.Group, ground: THREE.Group, buildings: THREE.Group, invalidate: () => void, entrance?: EntranceAnchor) {
    this.root.name = '场景布置方案'; this.root.userData.originalProposal = true;
    hospital.updateWorldMatrix(true, true); ground.updateWorldMatrix(true, true); buildings.updateWorldMatrix(true, true);
    const hospitalBounds = new THREE.Box3().setFromObject(hospital);
    const ray = new THREE.Raycaster();
    const place = (x: number, z: number, clearance: number): Place | undefined => {
      if (x > hospitalBounds.min.x - clearance && x < hospitalBounds.max.x + clearance && z > hospitalBounds.min.z - clearance && z < hospitalBounds.max.z + clearance) return;
      ray.set(new THREE.Vector3(x, 160, z), new THREE.Vector3(0, -1, 0));
      const hit = ray.intersectObject(ground, true).find(h => Math.abs(h.face?.normal.y ?? 0) > .6 && h.point.y < 6 && h.point.y > -6);
      if (!hit) return;
      // A source mesh can contain several separate buildings: its broad AABB is not an occupied footprint.
      const probes = clearance > 1 ? [[0, 0], [-clearance, 0], [clearance, 0], [0, -clearance], [0, clearance]] : [[0, 0]];
      for (const [dx, dz] of probes) {
        ray.set(new THREE.Vector3(x + dx, 160, z + dz), new THREE.Vector3(0, -1, 0));
        if (ray.intersectObject(buildings, true).some(h => h.point.y > hit.point.y + 1.5)) return;
      }
      return hit?.point.clone().add(new THREE.Vector3(0, .04, 0));
    };
    const trees: Place[] = [];
    for (let i = 0; i < 11; i++) { const p = place(-42 + i * 8, 35 + Math.sin(i) * 1.1, 2.2); if (p) trees.push(p); }
    for (const x of [-43, 43]) for (let z = -27; z < 34; z += 10) { const p = place(x, z, 2.2); if (p) trees.push(p); }
    const people: Place[] = [];
    for (let i = 0; i < 38; i++) {
      const p = place(-35 + random(i + 3) * 73, 29 + random(i + 17) * 4.4, .45);
      if (p && trees.every(t => t.distanceTo(p) > 1.8)) people.push(p);
    }
    const cars: Place[] = [];
    for (let i = 0; i < 8; i++) { const p = place(-36 + i * 10, 45 + i % 2 * 4, 2.4); if (p) cars.push(p); }
    this.exits = new ExitPedestrians(entrance, ground, buildings, hospital); this.root.add(this.exits.root);
    this.counts = { trees: trees.length, people: people.length + this.exits.count, cars: cars.length };
    this.trees(trees, invalidate); this.people(people); this.cars(cars);
  }

  private batch(geometry: THREE.BufferGeometry, material: THREE.Material, transforms: { p: Place; scale?: THREE.Vector3; rotation?: THREE.Euler; color?: THREE.Color }[]) {
    const mesh = new THREE.InstancedMesh(geometry, material, transforms.length), transform = new THREE.Object3D();
    transforms.forEach(({ p, scale, rotation, color }, i) => {
      transform.position.copy(p); transform.scale.copy(scale ?? new THREE.Vector3(1, 1, 1)); transform.rotation.copy(rotation ?? new THREE.Euler()); transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix); if (color) mesh.setColorAt(i, color);
    });
    mesh.raycast = () => {}; mesh.castShadow = false; mesh.receiveShadow = true; mesh.computeBoundingSphere(); this.root.add(mesh); return mesh;
  }

  private trees(places: Place[], invalidate: () => void) {
    const foliage = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .95, alphaTest: .42, side: THREE.DoubleSide, emissive: 0x293d13, emissiveIntensity: .35 });
    const loader = new THREE.TextureLoader();
    const load = (name: string, color: boolean) => {
      const texture = loader.load(import.meta.env.BASE_URL + 'assets/' + name, t => {
        if (this.disposed) { t.dispose(); return; } this.pending--; invalidate();
      }, undefined, () => { if (!this.disposed) { this.pending--; foliage.visible = false; invalidate(); } });
      if (color) texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; this.textures.push(texture); return texture;
    };
    foliage.map = load('leaves-color.jpg', true); foliage.alphaMap = load('leaves-alpha.png', false);
    const trunks = [], leaves = [], planters = [];
    for (let i = 0; i < places.length; i++) {
      const p = places[i], size = .85 + random(i) * .3;
      trunks.push({ p: p.clone().add(new THREE.Vector3(0, 1.8 * size, 0)), scale: new THREE.Vector3(.26 * size, 3.4 * size, .26 * size) });
      planters.push({ p: p.clone().add(new THREE.Vector3(0, .13, 0)), scale: new THREE.Vector3(2.7, .26, 2.7) });
      for (let j = 0; j < 56; j++) {
        const a = j * 2.399, r = 2.05 * Math.sqrt(random(i * 137 + j));
        leaves.push({ p: p.clone().add(new THREE.Vector3(Math.cos(a) * r, 3.4 * size + Math.sqrt(1 - (r / 2.1) ** 2) * 1.55 + random(j + i) * .7, Math.sin(a) * r)),
          scale: new THREE.Vector3(.85, .85, .85), rotation: new THREE.Euler((random(j * 7) - .5) * Math.PI, a, (random(j * 17) - .5) * 1.8),
          color: new THREE.Color().setHSL(.19 + random(i + j) * .08, .32, .46 + random(j * 3) * .15) });
      }
    }
    const cards = new THREE.PlaneGeometry(.95, 2.2), uv = cards.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * .42);
    this.batch(cards, foliage, leaves);
    this.batch(new THREE.CylinderGeometry(.5, .7, 1, 7), new THREE.MeshStandardMaterial({ color: 0x655c40, roughness: 1 }), trunks);
    this.batch(new THREE.CylinderGeometry(.5, .5, 1, 16), new THREE.MeshStandardMaterial({ color: 0x444f3b, roughness: .9 }), planters);
  }

  private people(places: Place[]) {
    const bodies = [], heads = [], legs = [], arms = [];
    for (let i = 0; i < places.length; i++) {
      const p = places[i], color = new THREE.Color([0xd5e2dc, 0x274f6b, 0x9f947f, 0x6e91a3][i % 4]);
      bodies.push({ p: p.clone().add(new THREE.Vector3(0, 1.04, 0)), color });
      heads.push({ p: p.clone().add(new THREE.Vector3(0, 1.61, 0)) });
      for (const side of [-1, 1]) {
        legs.push({ p: p.clone().add(new THREE.Vector3(side * .09, .38, side * .05)), rotation: new THREE.Euler(side * .11, 0, 0) });
        arms.push({ p: p.clone().add(new THREE.Vector3(side * .23, 1.03, 0)), rotation: new THREE.Euler(-side * .15, 0, side * .1), color });
      }
    }
    this.batch(new THREE.CapsuleGeometry(.15, .47, 3, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 }), bodies);
    this.batch(new THREE.SphereGeometry(.13, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc7ad91, roughness: .8 }), heads);
    this.batch(new THREE.CapsuleGeometry(.065, .55, 3, 5), new THREE.MeshStandardMaterial({ color: 0x354b5c, roughness: .9 }), legs);
    this.batch(new THREE.CapsuleGeometry(.055, .48, 3, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 }), arms);
  }

  private cars(places: Place[]) {
    const shape = new THREE.Shape(); shape.moveTo(-2.2, .4); shape.lineTo(-2.15, .9); shape.lineTo(-1.4, 1.1); shape.lineTo(1.4, 1.1); shape.lineTo(2.2, .85); shape.lineTo(2.2, .4); shape.closePath();
    const body = new THREE.ExtrudeGeometry(shape, { depth: 1.7, bevelEnabled: true, bevelThickness: .07, bevelSize: .07, bevelSegments: 1, steps: 1 }); body.translate(0, 0, -.85);
    this.batch(body, new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .55, roughness: .25, clearcoat: 1 }), places.map((p, i) => ({ p, color: new THREE.Color([0xe0e6e5, 0x32526b, 0x858d91, 0xb3a68d][i % 4]) })));
    const roof = new THREE.Shape(); roof.moveTo(-1.3, 1.08); roof.lineTo(-.65, 1.65); roof.lineTo(.65, 1.65); roof.lineTo(1.3, 1.08); roof.closePath();
    const glass = new THREE.ExtrudeGeometry(roof, { depth: 1.5, bevelEnabled: false }); glass.translate(0, 0, -.75);
    this.batch(glass, new THREE.MeshPhysicalMaterial({ color: 0x24495b, metalness: .3, roughness: .1, clearcoat: 1 }), places.map(p => ({ p })));
    const wheels = [], hubs = [], headlights = [], tail = [];
    for (const p of places) for (const side of [-1, 1]) {
      for (const x of [-1.4, 1.4]) {
        wheels.push({ p: p.clone().add(new THREE.Vector3(x, .36, side * .89)), rotation: new THREE.Euler(Math.PI / 2, 0, 0) });
        hubs.push({ p: p.clone().add(new THREE.Vector3(x, .36, side * .99)), rotation: new THREE.Euler(Math.PI / 2, 0, 0) });
      }
      headlights.push({ p: p.clone().add(new THREE.Vector3(2.24, .79, side * .58)) });
      tail.push({ p: p.clone().add(new THREE.Vector3(-2.23, .73, side * .58)) });
    }
    this.batch(new THREE.CylinderGeometry(.35, .35, .18, 12), new THREE.MeshStandardMaterial({ color: 0x11171b, roughness: .9 }), wheels);
    this.batch(new THREE.CylinderGeometry(.18, .18, .025, 10), new THREE.MeshStandardMaterial({ color: 0x98a8b2, metalness: .8, roughness: .25 }), hubs);
    this.batch(new THREE.BoxGeometry(.06, .16, .37), new THREE.MeshStandardMaterial({ color: 0xffe3a9, emissive: 0xffdea0, emissiveIntensity: 1 }), headlights);
    this.batch(new THREE.BoxGeometry(.06, .13, .28), new THREE.MeshStandardMaterial({ color: 0xb02c28, emissive: 0xb02c28, emissiveIntensity: .5 }), tail);
  }

  dispose() {
    this.disposed = true; this.root.removeFromParent();
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    this.root.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m)); if (object instanceof THREE.InstancedMesh) object.dispose(); } });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); this.textures.forEach(t => t.dispose()); this.exits.dispose(); this.root.clear();
  }
}
