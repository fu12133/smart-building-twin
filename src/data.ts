export type View = 'overview' | 'equipment' | 'access' | 'energy';
export const buildings = [
  { id: 'A', name: 'A区 · 塔楼', floors: 18, height: 69.5, x: 24, z: 15, width: 20, depth: 20, devices: 786, occupancy: 1286 },
  { id: 'B', name: 'B区 · 裙房', floors: 6, height: 26.7, x: -18, z: -6, width: 48, depth: 30, devices: 360, occupancy: 946 },
];
export const floorName = (floor: number) => floor < 0 ? `B${Math.abs(floor)}` : `${floor}F`;
export const floorScope = (building: string, floor: number) => floor < 0 ? '地下部分改造 · 地下形体与布局为示意' : building === 'A' && [13, 14].includes(floor) ? '保留原有功能 · 非本次改造楼层' : '改造范围 · 楼层布局为示意';
export const devices = [
  { id: 'AC-01', name: '空调机组', type: 'hvac', status: '正常', x: -12, z: -7, value: '24.6 °C', room: '护士站' },
  { id: 'CAM-02', name: '通道摄像机', type: 'camera', status: '正常', x: 2, z: 3, value: '在线', room: '公共走廊' },
  { id: 'SMK-03', name: '烟感探测器', type: 'fire', status: '告警', x: 12, z: -7, value: '烟雾浓度异常', room: '诊室 02' },
  { id: 'MTR-04', name: '智能电表', type: 'power', status: '正常', x: -12, z: 9, value: '12.8 kWh', room: '设备机房' },
];
export const viewNames: Record<View, string> = { overview: '院区总览', equipment: '设备物联', access: '通行统计', energy: '能源分析' };
