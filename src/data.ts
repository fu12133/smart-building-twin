export type View = 'overview' | 'equipment' | 'access' | 'energy';
export const buildings = [
  { id: 'A', name: 'A座 · 总部中心', floors: 32, height: 112, x: 4, z: 0, width: 24, depth: 22, devices: 486, occupancy: 1286 },
  { id: 'B', name: 'B座 · 创新中心', floors: 24, height: 84, x: -31, z: -19, width: 22, depth: 19, devices: 362, occupancy: 946 },
  { id: 'C', name: 'C座 · 商务中心', floors: 20, height: 70, x: 37, z: -29, width: 21, depth: 20, devices: 298, occupancy: 738 },
];
export const devices = [
  { id: 'AC-01', name: '空调机组', type: 'hvac', status: '正常', x: -12, z: -7, value: '24.6 °C', room: '开放办公区' },
  { id: 'CAM-02', name: '通道摄像机', type: 'camera', status: '正常', x: 2, z: 3, value: '在线', room: '公共走廊' },
  { id: 'SMK-03', name: '烟感探测器', type: 'fire', status: '告警', x: 12, z: -7, value: '烟雾浓度异常', room: '会议室 02' },
  { id: 'MTR-04', name: '智能电表', type: 'power', status: '正常', x: -12, z: 9, value: '12.8 kWh', room: '设备机房' },
];
export const viewNames: Record<View, string> = { overview: '园区总览', equipment: '设备物联', access: '通行统计', energy: '能源分析' };
