import * as THREE from 'three';

// Schematic service core from the supplied visual reference, not surveyed floor CAD.
export function createFloorGeometry(parent: THREE.Group) {
  const white = new THREE.MeshStandardMaterial({ color: 0xe9ece9, roughness: .85, metalness: 0 });
  const gray = new THREE.MeshStandardMaterial({ color: 0x505255, roughness: .95, metalness: 0 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xb9bfc0, roughness: .85 });
  const rounded = (width: number, depth: number, radius: number) => {
    const path = new THREE.Shape(), x = -width / 2, y = -depth / 2;
    path.moveTo(x + radius, y); path.lineTo(x + width - radius, y);
    path.quadraticCurveTo(x + width, y, x + width, y + radius);
    path.lineTo(x + width, y + depth - radius);
    path.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
    path.lineTo(x + radius, y + depth);
    path.quadraticCurveTo(x, y + depth, x, y + depth - radius);
    path.lineTo(x, y + radius); path.quadraticCurveTo(x, y, x + radius, y);
    return path;
  };
  const extrude = (shape: THREE.Shape, height: number, y: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 20 }), material);
    mesh.rotation.x = -Math.PI / 2; mesh.position.y = y; mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  };
  extrude(rounded(44, 40, 4.2), 1.2, -1.2, edge);
  for (let layer = 0; layer < 4; layer++) extrude(rounded(44, 40, 4.2), .17, -1.3 - layer * .3, white);
  extrude(rounded(43.8, 39.8, 4.1), .08, 0, gray);
  const perimeter = rounded(44, 40, 4.2);
  perimeter.holes.push(new THREE.Path(rounded(43.2, 39.2, 3.8).getPoints(80).reverse()));
  extrude(perimeter, 2.3, .08, white);
  const box = (w: number, h: number, d: number, x: number, z: number, y = h / 2 + .08, material = white) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  for (const x of [-15, -9, -3, 3, 9, 15]) { box(.48, 2.3, .9, x, -19.3); box(.48, 2.3, .9, x, 19.3); }
  for (const z of [-12, -6, 0, 6, 12]) { box(.9, 2.3, .48, -21.3, z); box(.9, 2.3, .48, 21.3, z); }

  // Open central passage, paired stairs and lift/service rooms. No clinical room assignment.
  const wall = (w: number, d: number, x: number, z: number) => box(w, 2.6, d, x, z);
  wall(15.6, .28, 0, -10); wall(.28, 19, -7.8, -.5); wall(.28, 19, 7.8, -.5);
  wall(.28, 16, -1.1, -2); wall(.28, 16, 1.1, -2);
  for (const z of [-3, 3]) { wall(5.2, .28, -5.2, z); wall(5.2, .28, 5.2, z); }
  for (const x of [-5.6, -3.1, 3.1, 5.6]) {
    box(1.2, 1.65, 1.5, x, -7.4);
    box(1.2, .08, 1.5, x, -7.4, 1.78, edge);
  }
  wall(6.7, .28, -4.45, 9); wall(6.7, .28, 4.45, 9);
  wall(.28, 5.8, -1.1, 6); wall(.28, 5.8, 1.1, 6);
  for (const side of [-1, 1]) {
    for (let step = 0; step < 10; step++) {
      const h = .12 + step * .16;
      box(2.2, h, .42, side * 4.5, 7.4 - step * .42, h / 2 + .08);
    }
    box(2.2, .18, 1, side * 4.5, 3.1, 1.8);
    wall(.2, 4.2, side * 6.05, 5.7);
  }
  const fill = new THREE.HemisphereLight(0xffffff, 0x677078, .7); parent.add(fill);
  const light = new THREE.DirectionalLight(0xffffff, .65); light.position.set(-15, 35, 15); parent.add(light);
}
