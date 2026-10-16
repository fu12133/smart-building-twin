import * as THREE from 'three';

export type EntranceAnchor = { position: THREE.Vector3; direction: THREE.Vector3 };

/** Illustrative exit route sampled on original terrain, never a live footfall feed. */
export class ExitPedestrians {
  readonly root = new THREE.Group();
  private walkers: { body: THREE.Group; limbs: THREE.Group[]; route: THREE.Vector3[]; phase: number }[] = [];
  private elapsed = 0;
  private lastTime = 0;
  private lastDraw = -Infinity;
  active = false;
  frame = 0;
  get count() { return this.walkers.length; }
  get state() { return { count: this.count, active: this.active, frame: this.frame, doorway: this.anchor?.position.toArray(), positions: this.walkers.map(w => w.body.position.toArray()), starts: this.walkers.map(w => w.route[0].toArray()), ends: this.walkers.map(w => w.route.at(-1)!.toArray()) }; }

  constructor(private anchor: EntranceAnchor | undefined, ground: THREE.Group, surroundings: THREE.Group, hospital: THREE.Group) {
    this.root.name = 'illustrative-entrance-exit-flow';
    if (!anchor) return;
    const forward = anchor.direction.clone().setY(0).normalize(), side = new THREE.Vector3(forward.z, 0, -forward.x);
    const ray = new THREE.Raycaster(), routes: THREE.Vector3[][] = [];
    for (let lane = 0; lane < 6; lane++) {
      const route: THREE.Vector3[] = [];
      for (let step = 0; step <= 18; step++) {
        const p = anchor.position.clone().addScaledVector(forward, .3 + step * .8).addScaledVector(side, (lane % 3 - 1) * .7 + Math.max(0, step - 6) * (lane % 2 ? .16 : -.16));
        ray.set(new THREE.Vector3(p.x, 160, p.z), new THREE.Vector3(0, -1, 0));
        const hit = ray.intersectObject(ground, true).find(h => Math.abs(h.face?.normal.y ?? 0) > .6 && h.point.y < 6 && h.point.y > -6);
        if (!hit) break;
        const blocked = ray.intersectObject(surroundings, true).some(h => h.point.y > hit.point.y + 1.5)
          || ray.intersectObject(hospital, true).some(h => h.object.userData.sourceHandle === 584 && h.point.y > hit.point.y + 1.5);
        if (blocked) break;
        route.push(hit.point.clone().add(new THREE.Vector3(0, .04, 0)));
      }
      if (route.length >= 7) routes.push(route);
    }
    const torso = new THREE.CapsuleGeometry(.16, .46, 3, 7), head = new THREE.SphereGeometry(.13, 8, 6);
    const leg = new THREE.CapsuleGeometry(.065, .53, 3, 5); leg.translate(0, -.32, 0);
    const arm = new THREE.CapsuleGeometry(.055, .43, 3, 5); arm.translate(0, -.25, 0);
    const skin = new THREE.MeshStandardMaterial({ color: 0xc5a889, roughness: .9 }), pants = new THREE.MeshStandardMaterial({ color: 0x233b51, roughness: .9 });
    for (let i = 0; i < routes.length; i++) {
      const group = new THREE.Group(), coat = new THREE.MeshStandardMaterial({ color: [0xe4e9e6, 0x477fa1, 0xa5bcae, 0xc0a27f][i % 4], roughness: .8 });
      const body = new THREE.Mesh(torso, coat); body.position.y = 1.08; group.add(body);
      const face = new THREE.Mesh(head, skin); face.position.y = 1.63; group.add(face);
      const limbs: THREE.Group[] = [];
      for (const x of [-1, 1]) {
        const hip = new THREE.Group(); hip.position.set(x * .09, .77, 0); hip.add(new THREE.Mesh(leg, pants)); limbs.push(hip); group.add(hip);
        const shoulder = new THREE.Group(); shoulder.position.set(x * .23, 1.31, 0); shoulder.add(new THREE.Mesh(arm, coat)); limbs.push(shoulder); group.add(shoulder);
      }
      group.traverse(object => { if (object instanceof THREE.Mesh) { object.raycast = () => {}; object.receiveShadow = true; } });
      this.root.add(group); this.walkers.push({ body: group, limbs, route: routes[i], phase: i / routes.length });
    }
    // Zero-route failures allocate no unattached GPU resources.
    if (!routes.length) { torso.dispose(); head.dispose(); leg.dispose(); arm.dispose(); skin.dispose(); pants.dispose(); }
    this.place();
  }
  tick(time: number, enabled: boolean, interval: number) {
    const delta = this.lastTime ? Math.min((time - this.lastTime) / 1000, .25) : 0; this.lastTime = time;
    this.active = enabled && this.count > 0;
    if (!this.active) return false;
    this.elapsed += delta;
    if (time - this.lastDraw < interval) return false;
    this.lastDraw = time; this.place(); this.frame++; return true;
  }
  private place() {
    for (const { body, limbs, route, phase } of this.walkers) {
      const progress = (this.elapsed / 17 + phase) % 1, at = progress * (route.length - 1), index = Math.min(route.length - 2, Math.floor(at));
      body.position.lerpVectors(route[index], route[index + 1], at - index);
      const direction = route[index + 1].clone().sub(route[index]); body.rotation.y = Math.atan2(direction.x, direction.z);
      const size = Math.min(1, progress / .025, (1 - progress) / .04); body.scale.setScalar(Math.max(0, size));
      const stride = Math.sin(this.elapsed * 9 + phase * 16) * .43;
      limbs[0].rotation.x = stride; limbs[1].rotation.x = -stride * .8; limbs[2].rotation.x = -stride; limbs[3].rotation.x = stride * .8;
    }
  }
  dispose() { this.active = false; this.walkers = []; this.anchor = undefined; }
}
