import { Children, cloneElement, createContext, isValidElement, ReactNode, useContext, useEffect, useState } from 'react';

export type Language = 'zh' | 'en';
export const LANGUAGE_KEY = 'yunjing-language';
const english: Record<string, string> = {
  '院区总览': 'Overview', '设备物联': 'Equipment', '通行统计': 'Access', '能源分析': 'Energy',
  '今日': 'Today', '本日': 'Today', '日间': 'Day', '晨昏': 'Twilight', '夜景': 'Night',
  '云境': 'YUNJING', '智慧空间 · 数字孪生': 'Smart spaces · Digital twin', '医院运维 · 数字孪生': 'Hospital operations · Digital twin',
  '智慧医院综合管理平台': 'Smart Hospital Management', '北京时间': 'Beijing time (UTC+8)', '操作帮助': 'Help', '全屏显示': 'Full screen',
  '智慧院区': 'CAMPUS', '主导航': 'Main navigation', '管理中心': 'Admin', '云境智慧院区': 'Yunjing campus',
  '演示数据': 'Demo data', '内部布局 · 方案示意': 'Interior · Schematic proposal', '原创医院 · 白模深化方案': 'Original hospital design proposal',
  '项目白模 · 主体及周边': 'Source model · Building and context', '今日用电量': 'Electricity today', '今日用水量': 'Water today',
  '碳排放量': 'Carbon emissions', '节能率': 'Energy savings', '本月累计': 'Month to date', '今日入院区': 'Arrivals today',
  '今日离院区': 'Departures today', '在院区人数': 'On campus', '院区实时统计': 'Demo campus statistics', '今日访客': 'Visitors today',
  '预约到访 92.1%': 'By appointment: 92.1%', '接入设备': 'Connected devices', '覆盖 12 个子系统': 'Across 12 subsystems',
  '设备在线率': 'Device availability', '在线 1,229 台': '1,229 devices online', '今日通行': 'Visits today', '今日能耗': 'Energy today',
  '人次': 'visits', '人': 'people', '台': 'units', '分': 'pts', '栋': 'bldg', '层': 'floors', '区': '', '区 ·': ' · ',
  '今日通行统计': 'Access today', '能源运行概况': 'Energy overview', '院区运行概况': 'Campus overview', '运行中': 'Active',
  '综合节能率': 'Energy savings', '综合运行指数': 'Operations score', '院区运行平稳': 'Campus operating normally', '健康': 'Healthy',
  '塔楼＋裙房': 'Tower + podium', '改造面积': 'Renovation area', '地上＋地下': 'Above + below ground',
  '今日用电趋势': 'Electricity trend', '今日通行趋势': 'Access trend', '今日用电': 'Today', '昨日用电': 'Yesterday',
  '入院区人数': 'Arrivals', '离院区人数': 'Departures', '今日累计': "Today's total ", '用电': 'electricity', '通行': 'visits',
  '告警动态': 'Alerts', '3 条待关注': '3 need attention', '今日告警': 'Alerts today', '演示告警 · 设备定位可查看': 'Demo alerts · Click to locate',
  '待关注': 'Attention', '烟感探测器异常': 'Smoke detector alert', '空调温度超出阈值': 'HVAC temperature alert', '摄像机离线记录': 'Camera offline record',
  '院区可视化': 'Campus visualization', '医院数字孪生': 'HOSPITAL DIGITAL TWIN', '院区数字孪生': 'Hospital digital twin',
  '电子地图': 'Floor map', '3D 院区': '3D Campus', '2.5D 楼层': '2.5D Floor', '三维场景暂不可用': '3D scene unavailable', '重新加载': 'Reload',
  '医院模型已加载': 'Hospital model ready', '医院模型加载中': 'Loading hospital model', '示意楼层已加载': 'Schematic floor ready',
  '原创现代医院 / 材质与灯光方案 · 未核实': 'Original hospital design · Materials / lighting unverified',
  '源白模形体 / 材质与灯光方案': 'Source geometry · Proposed materials / lighting',
  '白模周边已加载 · 可查看完整白模': 'Source context ready · Full model available', '白模周边加载中': 'Loading source context',
  '外景天气效果': 'Exterior weather effects', '深圳': 'Shenzhen', '深圳 ·': 'Shenzhen · ', '· 天气待更新': ' · Weather pending',
  '展示灯光': 'Display lighting', '楼层布局说明': 'Floor layout information', '个分区 · 方案示意': 'zones · Schematic proposal',
  '楼层导航': 'Floor navigation', '切换到': 'Go to ', '保留': 'Retained', '放大模型': 'Zoom in', '放大': 'Zoom in',
  '缩小模型': 'Zoom out', '缩小': 'Zoom out', '复位视角': 'Reset view', '查看完整白模': 'Full source model', '图层设置': 'Scene layers',
  '场景图层': 'Scene layers', '原创医院方案': 'Original hospital design', '设备点位': 'Device markers', '周边建筑': 'Surrounding buildings',
  '天气效果': 'Weather effects', '院区视角': 'Campus view', '当前分区': 'Zone', '选择楼宇': 'Select zone', '楼层': 'Floor',
  '选择楼层': 'Select floor', '查看当前楼层': 'View current floor', '进入楼层': 'Enter floor', '返回院区': 'Back to campus',
  '左键旋转': 'Drag to rotate', '滚轮缩放': 'Scroll to zoom', '右键平移': 'Right-drag to pan', '暂停巡航': 'Pause orbit', '自动巡航': 'Auto orbit',
  '设备详情': 'Device details', '关闭设备详情': 'Close device details', '告警': 'Alert', '告警 · 演示': 'Alert · Demo',
  '正常运行 · 演示': 'Normal operation · Demo', '设备编号': 'Device ID', '设备位置': 'Location', '当前读数': 'Reading',
  '点位和读数均为演示数据': 'Locations and readings are demo data', '楼层设备系统': 'Floor equipment systems', '楼层设备': 'Floor equipment',
  '显示全部设备': 'Show all devices', '全部系统': 'All systems', '个示意点位': 'demo markers', '筛选': 'Filter ', '总数': 'Total',
  '在线': 'Online', '离线': 'Offline', '显示全部系统': 'All systems shown', '当前筛选：': 'Filter: ', '设备图层已开启': 'Markers visible',
  '设备图层已隐藏': 'Markers hidden', '点位和统计均为演示，未接入实际系统': 'Demo locations and counts. No live system connected.',
  '设备运行状态': 'Device status', '98.6% 在线': '98.6% online', '视频监控': 'Video', '暖通空调': 'HVAC', '消防系统': 'Fire safety',
  '门禁系统': 'Access control', '台离线': ' offline', '台设备': 'devices', '在线 1,229': 'Online 1,229', '离线 17': 'Offline 17',
  '能源使用分析': 'Energy breakdown', '总用电 / kWh': 'Total / kWh', '空调系统': 'HVAC', '照明系统': 'Lighting', '其他设备': 'Other',
  '较昨日节约用电': 'Saved vs. yesterday', '当前楼宇信息': 'Building information', '项目白模 · 形体还原': 'Source model · Original massing',
  '资料高度': 'Brief height (m)', '地上楼层': 'Floors above ground', '演示设备': 'Demo devices', '演示人数': 'Demo occupancy',
  '项目总投资 2.87 亿元': 'Project investment: CNY 287 million', '查看': 'View ', '空间与设备': ' spaces and devices',
  '项目方案预览': 'Design preview', '数据刷新：演示快照': 'Data: demo snapshot',
  '模型来源：项目白模.dwg · 按塔楼高度等比校准': 'Source: 项目白模.dwg · Uniform tower-height calibration',
  '模型操作帮助': 'Model controls and provenance', '关闭帮助': 'Close help', '探索你的数字院区': 'Explore the digital campus',
  '模型由真实三维几何组成，可以从不同角度观察。': 'The model uses real 3D geometry. Rotate it to explore different sides.',
  '左键拖拽': 'Left-drag / one finger', '旋转模型': 'Rotate', '滚轮 / 双指捏合': 'Wheel / pinch', '缩放场景': 'Zoom',
  '右键拖拽 / 双指拖动': 'Right-drag / two fingers', '平移视角': 'Pan', '方向键 / + −': 'Arrow keys / + −',
  '旋转与缩放': 'Rotate and zoom', '点击楼栋标签': 'Click a zone label', '选择楼宇标签': 'Select a zone', '切换 2.5D 楼层': 'Switch to 2.5D Floor',
  '查看空间和设备': 'View spaces and equipment', '开始探索': 'Start exploring', 'A区 · 塔楼': 'Zone A · Tower', 'B区 · 裙房': 'Zone B · Podium',
  '地下部分改造 · 地下形体与布局为示意': 'Partial basement renovation · Geometry / layout schematic',
  '保留原有功能 · 非本次改造楼层': 'Existing use retained · Outside renovation scope', '改造范围 · 楼层布局为示意': 'Renovation scope · Schematic layout',
  '空调机组': 'HVAC unit', '正常': 'Normal', '通道摄像机': 'Corridor camera', '烟感探测器': 'Smoke detector', '智能电表': 'Smart meter',
  '给排水监测器': 'Water monitor', '通道门禁': 'Access controller', '烟雾浓度异常': 'Abnormal smoke level', '公共走廊': 'Public corridor',
  '核心筒西侧': 'West of core', '核心筒东侧': 'East of core', '设备间（示意）': 'Equipment room (schematic)', '管井（示意）': 'Service shaft (schematic)', '核心筒入口': 'Core entrance',
  '核心筒西侧设备间（示意）': 'West core equipment room (schematic)', '核心筒东侧分区（示意）': 'East core zone (schematic)',
  '核心筒电气间（示意）': 'Core electrical room (schematic)', '核心筒南侧入口（示意）': 'South core entrance (schematic)',
  '地下开放区与设备分区': 'Open basement and service zones', '裙房环廊分区': 'Podium ring corridor', '裙房多开间分区': 'Podium room clusters',
  '裙房开放与隔间组合': 'Podium open and partitioned areas', '双侧分区与环形走廊': 'Two-sided zones and ring corridor',
  '多开间与公共走廊': 'Room clusters and shared corridor', '大小隔间组合': 'Mixed room sizes', '开放区与独立分区': 'Open and separate zones',
  '电力': 'Power', '空调': 'HVAC', '给排水': 'Water', '门禁': 'Access', '消防': 'Fire safety', '其他': 'Other', '电梯': 'Lifts', '照明': 'Lighting',
  '用电量 kWh': 'Electricity (kWh)', '通行人次': 'Visits', '昨日用电量': 'Yesterday', '离园人次': 'Departures',
  '能耗占比：空调76%，照明16%，其他8%': 'Energy share: HVAC 76%, lighting 16%, other 8%', '设备能耗排序': 'Equipment energy ranking',
  '今日与昨日用电趋势': 'Electricity trend: today and yesterday', '今日园区通行趋势': 'Campus access trend today',
  '更新中': 'Updating', '上次数据': 'Previous data', '暂不可用': 'Unavailable', '已更新': 'Updated', '数据过期': 'Stale data',
  '深圳天气': 'Shenzhen weather', '天气获取中': 'Loading weather', '天气暂不可用': 'Weather unavailable', '深圳天气详情': 'Shenzhen weather details',
  '关闭天气详情': 'Close weather details', '暂无可用数据': 'No data available', '相对湿度': 'Humidity', '风速': 'Wind', '降水量': 'Precipitation',
  '云量': 'Cloud cover', '数据时刻：': 'Data time: ', '（北京时间）': ' (Beijing time, UTC+8)', '，保留上次数据。': '. Previous data retained.',
  '，可稍后重试。': '. Please try again later.', '数据已过期，当前晴雨效果暂不跟随该数据。': 'Data are stale. Weather effects will not follow this reading.',
  '来源：': 'Source: ', 'Open-Meteo 天气模型': 'Open-Meteo weather model', '· 非现场实测': ' · Not onsite measurements',
  '获取于': 'Fetched at ', '每 10 分钟自动更新': 'Updates every 10 minutes', '正在更新': 'Updating', '刷新天气': 'Refresh weather',
  '天气数据不完整': 'Incomplete weather data', '天气单位不匹配': 'Unexpected weather units', '正在更新缓存数据': 'Refreshing cached weather',
  '天气服务暂不可用': 'Weather service unavailable', '天气请求超时': 'Weather request timed out', '天气更新失败': 'Weather update failed',
  '晴': 'Clear', '晴间多云': 'Mostly clear', '多云': 'Partly cloudy', '阴': 'Overcast', '雾': 'Fog', '冻雾': 'Freezing fog',
  '小毛毛雨': 'Light drizzle', '毛毛雨': 'Drizzle', '较强毛毛雨': 'Heavy drizzle', '冻毛毛雨': 'Freezing drizzle',
  '小雨': 'Light rain', '中雨': 'Rain', '大雨': 'Heavy rain', '冻雨': 'Freezing rain', '小雪': 'Light snow', '中雪': 'Snow', '大雪': 'Heavy snow',
  '雪粒': 'Snow grains', '小阵雨': 'Light showers', '阵雨': 'Showers', '强阵雨': 'Heavy showers', '阵雪': 'Snow showers', '强阵雪': 'Heavy snow showers',
  '雷阵雨': 'Thunderstorm', '雷雨伴冰雹': 'Thunderstorm with hail', '强雷雨伴冰雹': 'Severe thunderstorm with hail', '其他天气': 'Other weather',
  '可旋转的楼宇三维模型': 'Interactive 3D building model', '选择设备': 'Select device ', '选择': 'Select ',
  '图形渲染上下文已丢失，请重新加载场景。': 'Graphics context lost. Please reload the scene.',
  '医院模型加载失败，请检查网络后重新加载场景。': 'Hospital model failed to load. Check your connection and reload.',
  '白模周边加载失败，请检查网络后重新加载场景。': 'Source context failed to load. Check your connection and reload.',
  '无法启动三维渲染，请使用支持 WebGL 的浏览器并开启硬件加速。': 'Unable to start 3D rendering. Use a WebGL browser with hardware acceleration enabled.',
  '当前预览不支持全屏，可在独立浏览器中打开。': 'Full screen is unavailable here. Open the site in a separate browser.',
  '选择语言': 'Language',
};

const helpEnglish = 'The geometry comes from the supplied project DWG; tower and enclosed podium form one building. A uniform scale uses the brief’s 69.5 m structural tower height. The DWG unit header says metres, but its structural height is 205 coordinate units, so dimensions are not survey-verified. The model bounds are approximately 72.6 × 52.3 m, differing from the brief’s 70 × 38 m; no non-uniform stretch was applied. The brief specifies a 26.7 m podium, 28,426 m² renovation area and CNY 287 million investment, with 18 aboveground floors and two basements. Floors 13 and 14 retain their existing use. Basement works are partial; underground geometry and every floor layout are schematic and unverified. Each zone/floor has a distinct proposal with gray slabs, white partitions, doors, aligned service cores and stairs; outer rooms and corridors vary by floor. Filter device markers by system and change floors using the floor rail. Actual interior plans are needed for calibration. Building, podium, city context and site share the original source coordinates. The optional original hospital design adds curtain-wall frames, shading fins, floor bands and a glass entrance canopy; these are proposed details, not verified as-built geometry. Turn off Original hospital design in Scene layers to inspect the source presentation. No institution name or replacement city/site is introduced. Glass, stone and site finishes are proposals without verified photographs. Operational indicators are demo data with no live BIM, IoT or clinical connection. Full source model shows the larger context; Reset view returns to the hospital.';
const fragments = Object.entries(english).filter(([key]) => key.length > 1).sort((a, b) => b[0].length - a[0].length);

export function translate(text: string, language: Language): string {
  if (language === 'zh' || !/[\u4e00-\u9fff]/.test(text) || text === '中文') return text;
  const trimmed = text.trim();
  if (english[trimmed] !== undefined) return text.replace(trimmed, english[trimmed]);
  if (trimmed.startsWith('形体来自你提供的项目白模 DWG')) return helpEnglish;
  let result = text.replace(/([AB])区/g, 'Zone $1')
    .replace(/([西东北南])侧分区\s*(\d+)（示意）/g, (_, side, number) => `${({ 西: 'West', 东: 'East', 北: 'North', 南: 'South' } as Record<string, string>)[side]} zone ${number} (schematic)`)
    .replace(/较昨日\s*([+−]?\d+(?:\.\d+)?%)/g, '$1 vs. yesterday');
  for (const [from, to] of fragments) result = result.split(from).join(to);
  return result.replace(/门外走廊/g, ' · Outer corridor').replace(/侧管井/g, ' · Service shaft');
}

/** Translate React-owned presentation nodes only; values, IDs, keys and callbacks stay intact. */
export function localize(node: ReactNode, language: Language): ReactNode {
  if (typeof node === 'string') return translate(node, language);
  if (Array.isArray(node)) return node.map(child => localize(child, language));
  if (!isValidElement<Record<string, unknown>>(node)) return node;
  const props: Record<string, unknown> = {};
  for (const name of ['title', 'aria-label', 'placeholder', 'alt']) if (typeof node.props[name] === 'string') props[name] = translate(node.props[name] as string, language);
  if (node.props.children !== undefined) props.children = Children.map(node.props.children as ReactNode, child => localize(child, language));
  if (node.props.extra !== undefined) props.extra = localize(node.props.extra as ReactNode, language);
  return cloneElement(node, props);
}

type Locale = { language: Language; setLanguage: (language: Language) => void; t: (text: string) => string };
const LanguageContext = createContext<Locale>({ language: 'zh', setLanguage: () => {}, t: text => text });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, update] = useState<Language>(() => { try { return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'zh'; } catch { return 'zh'; } });
  const setLanguage = (next: Language) => { update(next); try { localStorage.setItem(LANGUAGE_KEY, next); } catch { /* Preference storage is optional. */ } };
  useEffect(() => { document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN'; document.title = language === 'en' ? 'Yunjing · Smart Hospital Digital Twin' : '云境 · 智慧医院数字孪生'; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t: text => translate(text, language) }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
export const localeName = (language: Language) => language === 'en' ? 'en-GB' : 'zh-CN';
