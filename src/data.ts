export type View = 'overview' | 'equipment' | 'access' | 'energy';
export const buildings = [
  { id: 'A', name: 'A座 · 门诊楼', floors: 3, height: 30, x: 0, z: 0, width: 33, depth: 60, devices: 486, occupancy: 1286 },
  { id: 'B', name: 'B座 · 住院楼', floors: 6, height: 28, x: -39, z: -21, width: 23, depth: 20, devices: 362, occupancy: 946 },
  { id: 'C', name: 'C座 · 医技楼', floors: 4, height: 20, x: 40, z: -19, width: 21, depth: 19, devices: 298, occupancy: 738 },
];
export const devices = [
  { id: 'AC-01', name: '空调机组', type: 'hvac', status: '正常', x: -12, z: -7, value: '24.6 °C', room: '护士站' },
  { id: 'CAM-02', name: '通道摄像机', type: 'camera', status: '正常', x: 2, z: 3, value: '在线', room: '公共走廊' },
  { id: 'SMK-03', name: '烟感探测器', type: 'fire', status: '告警', x: 12, z: -7, value: '烟雾浓度异常', room: '诊室 02' },
  { id: 'MTR-04', name: '智能电表', type: 'power', status: '正常', x: -12, z: 9, value: '12.8 kWh', room: '设备机房' },
];
export const viewNames: Record<View, string> = { overview: '院区总览', equipment: '设备物联', access: '通行统计', energy: '能源分析' };
