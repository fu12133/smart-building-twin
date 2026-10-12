import { buildings, devices, floorName } from './data';

export type FloorRoom = { name: string; x: number; z: number; width: number; depth: number; door: 'east' | 'west' | 'north' | 'south' };
export type FloorLayout = {
  key: string; building: string; floor: number; title: string; width: number; depth: number;
  core: { scaleX: number; scaleZ: number; z: number }; rooms: FloorRoom[]; devices: typeof devices;
};

// Proposed partitions only: source DWG has no verified interior plans or clinical allocations.
const layouts = new Map<string, FloorLayout>();
export function getFloorLayout(building: string, requestedFloor: number): FloorLayout {
  const zone = buildings.find(b => b.id === building) ?? buildings[0];
  const floor = Math.max(-2, Math.min(zone.floors, requestedFloor === 0 ? 1 : requestedFloor));
  const key = `${zone.id}-${floorName(floor)}`;
  const cached = layouts.get(key); if (cached) return cached;
  const podium = zone.id === 'B', underground = floor < 0;
  const ordinal = floor > 0 ? floor : zone.floors + Math.abs(floor);
  const width = podium ? 48 : 44, depth = podium ? 34 : 40;
  const core = { scaleX: podium ? .8 : 1, scaleZ: podium ? .75 : 1, z: podium ? -1 : 0 };
  const rooms: FloorRoom[] = [];
  const sideStart = -depth / 2 + 4.8, sideEnd = depth / 2 - 5.5;
  const sideWidth = width / 2 - 12.3;
  // Weighted subdivisions vary continuously by floor, rather than cycling identical templates.
  const divide = (count: number, start: number, end: number, phase: number) => {
    const weights = Array.from({ length: count }, (_, i) => 1 + .28 * Math.sin(ordinal * .67 + i * 1.43 + phase));
    const total = weights.reduce((a, b) => a + b, 0); let cursor = start;
    return weights.map(weight => { const a = cursor; cursor += (end - start) * weight / total; return [a, cursor] as const; });
  };
  for (const side of [-1, 1]) {
    const count = underground ? (side < 0 ? 2 : 3) : (side < 0 ? 2 + ordinal % 4 : 2 + Math.floor((ordinal - 1) / 4) % 4);
    const bands = divide(count, sideStart, sideEnd, side * .85);
    bands.forEach(([a, b], index) => rooms.push({
      name: `${side < 0 ? '西' : '东'}侧分区 ${index + 1}（示意）`,
      x: side * (12 + sideWidth / 2), z: (a + b) / 2,
      width: sideWidth, depth: b - a, door: side < 0 ? 'east' : 'west',
    }));
  }
  for (const side of [-1, 1]) {
    const count = underground ? (side < 0 ? 2 : 1) : (side < 0 ? 1 + ordinal % 3 : 2 + ordinal % 3);
    const bands = divide(count, -11.8, 11.8, side * 2.1);
    const roomDepth = podium ? 3.2 : 4.6;
    bands.forEach(([a, b], index) => rooms.push({
      name: `${side < 0 ? '北' : '南'}侧分区 ${index + 1}（示意）`,
      x: (a + b) / 2, z: side * (depth / 2 - 1.1 - roomDepth / 2),
      width: b - a, depth: roomDepth, door: side < 0 ? 'south' : 'north',
    }));
  }
  const coreZ = (z: number) => z * core.scaleZ + core.z;
  const floorDevices = devices.map(device => {
    const point = { ...device };
    if (device.id === 'AC-01') { point.x = -4.8 * core.scaleX; point.z = coreZ(-5.4 + (ordinal % 3) * .65); point.room = '核心筒西侧设备间（示意）'; }
    if (device.id === 'SMK-03') { point.x = 4.8 * core.scaleX; point.z = coreZ(-5.5 + (ordinal % 4) * .6); point.room = '核心筒东侧分区（示意）'; }
    if (device.id === 'MTR-04') { point.x = -4.8 * core.scaleX; point.z = coreZ(.8 + (ordinal % 3) * .55); point.room = '核心筒电气间（示意）'; }
    if (device.id === 'DOOR-06') { point.x = .5 * core.scaleX; point.z = coreZ(10.6); point.room = '核心筒南侧入口（示意）'; }
    const west = rooms.filter(room => room.door === 'east'), east = rooms.filter(room => room.door === 'west');
    if (device.id === 'CAM-02') { const room = west[(ordinal - 1) % west.length]; point.x = -9.7; point.z = room.z; point.room = room.name + '门外走廊'; }
    if (device.id === 'WTR-05') { const room = east[ordinal % east.length]; point.x = 9.7; point.z = room.z; point.room = room.name + '侧管井'; }
    return point;
  });
  const title = underground ? '地下开放区与设备分区' : podium ? ['裙房环廊分区', '裙房多开间分区', '裙房开放与隔间组合'][(ordinal - 1) % 3] : ['双侧分区与环形走廊', '多开间与公共走廊', '大小隔间组合', '开放区与独立分区'][(ordinal - 1) % 4];
  const result = { key, building: zone.id, floor, title, width, depth, core, rooms, devices: floorDevices };
  layouts.set(key, result); return result;
}
