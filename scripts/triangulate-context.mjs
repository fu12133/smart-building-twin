// Use Three.js's locked Earcut implementation for source faces with touching/bridged rings.
import earcut from '../node_modules/three/src/extras/lib/earcut.js';
let input = ''; for await (const chunk of process.stdin) input += chunk;
const points = JSON.parse(input), interpolatedVertices = [];
const cross = (a, b, c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
let selfIntersectionSplits = 0;
function splitCrossings(indices) {
  for (let i = 0; i < indices.length; i++) for (let j = i + 2; j < indices.length; j++) {
    if (i === 0 && j === indices.length - 1) continue;
    const from = indices[i], to = indices[(i+1)%indices.length];
    const a = points[from], b = points[to], c = points[indices[j]], d = points[indices[(j+1)%indices.length]];
    const denominator = (b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0]);
    if (Math.abs(denominator) < 1e-10) continue;
    const t = ((c[0]-a[0])*(d[1]-c[1])-(c[1]-a[1])*(d[0]-c[0])) / denominator;
    const u = ((c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0])) / denominator;
    if (t <= 1e-8 || t >= 1-1e-8 || u <= 1e-8 || u >= 1-1e-8) continue;
    const index = points.length;
    points.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]);
    interpolatedVertices.push({ from, to, t }); selfIntersectionSplits++;
    return [...splitCrossings([index, ...indices.slice(i+1, j+1)]),
      ...splitCrossings([index, ...indices.slice(j+1), ...indices.slice(0, i+1)])];
  }
  return [indices];
}
// Preserve both lobes of a self-crossing CAD boundary, splitting exactly on its edges.
const rings = splitCrossings(points.map((_, i) => i));
let area = 0; const triangles = [];
let polygonArea = 0;
for (const ring of rings) {
  polygonArea += Math.abs(ring.reduce((sum, index, i) => {
    const a = points[index], b = points[ring[(i+1)%ring.length]]; return sum + a[0]*b[1]-b[0]*a[1];
  }, 0));
  const indices = earcut(ring.flatMap(index => points[index]), undefined, 2);
  for (let i = 0; i < indices.length; i += 3) {
    const triangle = indices.slice(i, i + 3).map(index => ring[index]); triangles.push(triangle);
    area += Math.abs(cross(...triangle.map(index => points[index])));
  }
}
if (Math.abs(area - polygonArea) > Math.max(1e-5, polygonArea * 1e-6)) throw new Error(`Source polygon area changed during triangulation: ${area} vs ${polygonArea}`);
process.stdout.write(JSON.stringify({ triangles, interpolatedVertices, selfIntersectionSplits }));
