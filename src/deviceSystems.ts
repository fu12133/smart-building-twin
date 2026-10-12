import { Camera, Zap, Snowflake, Droplets, DoorOpen, Flame } from 'lucide-react';

export const deviceSystems = [
  { type: 'camera', name: '视频监控', icon: Camera },
  { type: 'power', name: '电力', icon: Zap },
  { type: 'hvac', name: '空调', icon: Snowflake },
  { type: 'water', name: '给排水', icon: Droplets },
  { type: 'access', name: '门禁', icon: DoorOpen },
  { type: 'fire', name: '消防', icon: Flame },
] as const;
export type DeviceFilter = 'all' | typeof deviceSystems[number]['type'];
