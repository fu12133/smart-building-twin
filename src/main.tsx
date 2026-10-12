import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDown, ArrowUpRight, Bell, Building2, Camera, ChevronDown, ChevronRight, CircleHelp, Cpu, Expand, Flame, Layers3, Leaf, MapPin, Maximize2, MousePointer2, Pause, Play, Plus, Minus, RotateCcw, ScanLine, ShieldCheck, Snowflake, Users, X, Zap, LayoutDashboard, Radio, Move3D, Eye, PanelLeftClose } from 'lucide-react';
import { BuildingScene } from './scene';
import { buildings, devices, View, viewNames } from './data';
import { Chart } from './Chart';
import './style.css';

declare global { interface Window { __BUILDING_HARNESS__?: () => ReturnType<BuildingScene['snapshot']>; } }
const nav = [{ id: 'overview', icon: LayoutDashboard, name: '院区总览' }, { id: 'equipment', icon: Cpu, name: '设备物联' }, { id: 'access', icon: Users, name: '通行统计' }, { id: 'energy', icon: Zap, name: '能源分析' }] as const;
function Panel({ title, icon: Icon, extra, children, className = '' }: { title: string; icon: typeof Activity; extra?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={'panel ' + className}><div className="panel-title"><Icon size={15} /><h2>{title}</h2><span className="panel-extra">{extra || '今日'}</span></div>{children}</section>;
}

function App() {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<BuildingScene | null>(null);
  const pendingDevice = useRef<string | null>(null);
  const [view, setView] = useState<View>('overview');
  const [mode, setMode] = useState<'3d' | 'floor'>('3d');
  const [building, setBuilding] = useState('A');
  const [floor, setFloor] = useState(2);
  const [hospitalReady, setHospitalReady] = useState(false);
  const [auto, setAuto] = useState(false);
  const [deviceLayer, setDeviceLayer] = useState(true);
  const [contextLayer, setContextLayer] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [device, setDevice] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [time, setTime] = useState(new Date());
  const current = buildings.find(b => b.id === building)!;
  const selectedDevice = devices.find(d => d.id === device);
  useEffect(() => {
    let scene: BuildingScene | undefined;
    try {
      scene = new BuildingScene(host.current!, { onSelect: id => { setBuilding(id); setDevice(null); }, onDevice: setDevice, onError: setError, onModelLoaded: () => setHospitalReady(true) });
      engine.current = scene;
      if (import.meta.env.DEV) window.__BUILDING_HARNESS__ = () => scene!.snapshot();
    } catch { setError('无法启动三维渲染，请使用支持 WebGL 的浏览器并开启硬件加速。'); }
    return () => { scene?.dispose(); engine.current = null; delete window.__BUILDING_HARNESS__; };
  }, []);
  useEffect(() => { engine.current?.setMode(mode); setDevice(null); }, [mode]);
  useEffect(() => { engine.current?.select(building); setFloor(f => Math.min(f, current.floors)); }, [building, current.floors]);
  useEffect(() => { engine.current?.setFloor(floor); setDevice(null); }, [floor]);
  useEffect(() => { engine.current?.setAuto(auto); }, [auto]);
  useEffect(() => { engine.current?.setLayers(deviceLayer, contextLayer); }, [deviceLayer, contextLayer]);
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  const changeView = (id: View) => { setView(id); setDevice(null); };
  // Selecting from a table must open its detail after the mode effect settles.
  useEffect(() => { if (mode === 'floor' && pendingDevice.current) { setDevice(pendingDevice.current); pendingDevice.current = null; } }, [mode, building, floor]);
  const locateDevice = (id: string, targetBuilding = building, targetFloor = floor) => {
    const boundedFloor = Math.max(1, Math.min(targetFloor, buildings.find(b => b.id === targetBuilding)!.floors));
    if (mode !== 'floor' || targetBuilding !== building || boundedFloor !== floor) {
      pendingDevice.current = id; setMode('floor'); setBuilding(targetBuilding); setFloor(boundedFloor);
    } else setDevice(id);
  };
  const fullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { setToast('当前预览不支持全屏，可在独立浏览器中打开。'); } };
  const metrics = view === 'energy' ? [{ name: '今日用电量', value: '8,462', unit: 'kWh', trend: '较昨日 −8.2%', icon: Zap }, { name: '今日用水量', value: '126.8', unit: 'm³', trend: '较昨日 −4.6%', icon: Activity }, { name: '碳排放量', value: '4.82', unit: 't', trend: '较昨日 −6.1%', icon: Leaf }, { name: '节能率', value: '18.6', unit: '%', trend: '本月累计', icon: ShieldCheck }] : view === 'access' ? [{ name: '今日入院区', value: '4,958', unit: '人次', trend: '较昨日 +12.6%', icon: Users }, { name: '今日离院区', value: '4,322', unit: '人次', trend: '较昨日 +8.2%', icon: ArrowDown }, { name: '在院区人数', value: '636', unit: '人', trend: '院区实时统计', icon: Building2 }, { name: '今日访客', value: '279', unit: '人次', trend: '预约到访 92.1%', icon: ScanLine }] : [{ name: '接入设备', value: '1,246', unit: '台', trend: '覆盖 12 个子系统', icon: Cpu }, { name: '设备在线率', value: '98.6', unit: '%', trend: '在线 1,229 台', icon: Radio }, { name: '今日通行', value: '4,958', unit: '人次', trend: '较昨日 +12.6%', icon: Users }, { name: '今日能耗', value: '8,462', unit: 'kWh', trend: '较昨日 −8.2%', icon: Zap }];
  return <div className="app-shell">
    <header className="header"><div className="brand"><div className="brand-symbol"><Building2 size={26} /></div><div><strong>云境<span> YUNJING</span></strong><small>智慧空间 · 数字孪生</small></div></div><div className="header-title"><span>医院运维 · 数字孪生</span><h1>智慧医院综合管理平台</h1></div><div className="header-actions"><div className="clock"><strong>{time.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}</strong><small>{time.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })} <span>{time.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', weekday: 'long' })}</span></small></div><button className="icon-button" aria-label="操作帮助" onClick={() => setHelp(true)}><CircleHelp size={18}/></button><button className="icon-button" aria-label="全屏显示" onClick={fullscreen}><Expand size={18}/></button></div></header>
    <aside className="nav-rail"><div className="rail-top"><span className="rail-dot"/>智慧院区</div><nav aria-label="主导航">{nav.map(({ id, icon: Icon, name }) => <button key={id} className={view === id ? 'nav-item active' : 'nav-item'} aria-pressed={view === id} onClick={() => changeView(id)}><Icon size={22}/><span>{name}</span>{view === id && <i/>}</button>)}</nav><div className="rail-bottom"><ShieldCheck size={20}/><span>管理中心</span><div className="avatar">YK</div></div></aside>
    <main>
      <div className="workspace-heading"><div className="breadcrumb">云境智慧院区 <ChevronRight size={12}/><b>{viewNames[view]}</b></div><div className="data-source"><i/>演示数据<span className="source-divider"/>医院素材＋示意配楼</div></div>
      <div className="metrics">{metrics.map(({ name, value, unit, trend, icon: Icon }) => <div className="metric" key={name}><div className="metric-icon"><Icon size={21}/></div><div className="metric-body"><span>{name}</span><div><strong>{value}</strong><small>{unit}</small></div><p>{trend.includes('−') ? <ArrowDown size={10}/> : <span className="tiny-dot"/>}{trend}</p></div></div>)}</div>
      <div className="dashboard">
        <div className="left-panels">
          <Panel title={view === 'access' ? '今日通行统计' : view === 'energy' ? '能源运行概况' : '院区运行概况'} icon={Activity} extra={<span className="live"><i/>运行中</span>}>
            <div className="overview-stat"><div><span>{view === 'energy' ? '综合节能率' : '综合运行指数'}</span><strong>{view === 'energy' ? '18.6' : '98.2'}<small>{view === 'energy' ? '%' : '分'}</small></strong><p><span className="status-dot"/>院区运行平稳</p></div><div className="score-orbit"><ShieldCheck size={32}/><span>健康</span></div></div>
            <div className="small-stats"><div><strong>3<small>栋</small></strong><span>管理楼宇</span></div><div><strong>12,680<small>m²</small></strong><span>建筑面积</span></div><div><strong>{buildings.reduce((sum, b) => sum + b.floors, 0)}<small>层</small></strong><span>楼层总数</span></div></div>
          </Panel>
          <Panel title={view === 'energy' ? '今日用电趋势' : '今日通行趋势'} icon={view === 'energy' ? Zap : Users} extra={view === 'energy' ? 'kWh' : '人次'}><div className="chart-legend"><span><i/> {view === 'energy' ? '今日用电' : '入院区人数'}</span><span><i className="muted"/>{view === 'energy' ? '昨日用电' : '离院区人数'}</span></div><Chart kind="trend" energy={view === 'energy'}/><div className="trend-bottom"><span>今日累计{view === 'energy' ? '用电' : '通行'}</span><strong>{view === 'energy' ? '8,462' : '4,958'}<small>{view === 'energy' ? 'kWh' : '人次'}</small></strong><span className="positive">{view === 'energy' ? '↓ 8.2%' : '↑ 12.6%'}</span></div></Panel>
          <Panel title="告警动态" icon={Bell} extra={<span className="warning-count">3 条待关注</span>} className="alarm-panel"><div className="alert-summary"><span className="alert-icon"><Bell size={22}/></span><div><strong>03<span>今日告警</span></strong><small>演示告警 · 设备定位可查看</small></div><span className="alert-tag">待关注</span></div>{[{ title: '烟感探测器异常', place: building + '座 · ' + floor + 'F · 诊室 02', time: '16:58', id: 'SMK-03', color: 'orange' }, { title: '空调温度超出阈值', place: 'A座 · 2F · 护士站', time: '16:42', id: 'AC-01', color: 'yellow' }, { title: '摄像机离线记录', place: 'A座 · 2F · 公共走廊', time: '16:20', id: 'CAM-02', color: 'blue' }].map(a => <button className="alarm-row" key={a.title} onClick={() => { locateDevice(a.id, a.id === 'SMK-03' ? building : 'A', a.id === 'SMK-03' ? floor : 2); }}><i className={a.color}/><span><strong>{a.title}</strong><small>{a.place}</small></span><time>{a.time}</time><ChevronRight size={12}/></button>)}</Panel>
        </div>
        <section className="scene-section" aria-label="院区可视化">
          <div className="scene-top"><div><span className="eyebrow">医院数字孪生</span><h2>{mode === '3d' ? '院区数字孪生' : current.id + '座 · ' + floor + 'F 电子地图'}</h2></div><div className="mode-switch"><button aria-pressed={mode === '3d'} className={mode === '3d' ? 'active' : ''} onClick={() => setMode('3d')}><Move3D size={13}/>3D 院区</button><button aria-pressed={mode === 'floor'} className={mode === 'floor' ? 'active' : ''} onClick={() => setMode('floor')}><Layers3 size={13}/>2.5D 楼层</button></div></div>
          <div className="scene-host" ref={host} data-testid="scene-host"/>
          {error && <div className="scene-error" role="alert"><Building2 size={32}/><h3>三维场景暂不可用</h3><p>{error}</p><button onClick={() => location.reload()}>重新加载</button></div>}
          <div className="scene-info"><span className="model-state"><i/> {mode === '3d' ? (hospitalReady ? '医院模型已加载' : '医院模型加载中') : '示意楼层已加载'}</span><span>{mode === '3d' ? '建筑 / 绿化 / 设备' : '诊疗区 / 走廊 / 设备（示意）'}</span></div>
          <div className="scene-controls"><button aria-label="放大模型" title="放大" onClick={() => engine.current?.zoom(0.85)}><Plus size={17}/></button><button aria-label="缩小模型" title="缩小" onClick={() => engine.current?.zoom(1.15)}><Minus size={17}/></button><div className="control-divider"/><button aria-label="复位视角" title="复位视角" onClick={() => engine.current?.reset()}><RotateCcw size={16}/></button><button aria-label="图层设置" title="图层设置" aria-expanded={layersOpen} className={layersOpen ? 'active' : ''} onClick={() => setLayersOpen(!layersOpen)}><Layers3 size={17}/></button></div>
          {layersOpen && <div className="layer-popover"><strong>场景图层</strong><label><input type="checkbox" checked={deviceLayer} onChange={e => setDeviceLayer(e.target.checked)}/>设备点位</label><label><input type="checkbox" checked={contextLayer} onChange={e => setContextLayer(e.target.checked)}/>周边建筑</label></div>}
          <div className="compass"><span>N</span><div><MapPin size={15}/></div><small>院区视角</small></div>
          <div className="building-selector"><label>当前楼宇<select aria-label="选择楼宇" value={building} onChange={e => { setBuilding(e.target.value); setDevice(null); }}>{buildings.map(b => <option value={b.id} key={b.id}>{b.name}</option>)}</select></label><label>楼层<select aria-label="选择楼层" value={floor} onChange={e => setFloor(Number(e.target.value))}>{Array.from({ length: current.floors }, (_, i) => i + 1).reverse().map(f => <option value={f} key={f}>{f}F</option>)}</select></label><button className="floor-action" aria-label="查看当前楼层" onClick={() => setMode(mode === '3d' ? 'floor' : '3d')}>{mode === '3d' ? '进入楼层' : '返回院区'}<ChevronRight size={13}/></button></div>
          <div className="scene-bottom"><div className="interaction-hint"><MousePointer2 size={13}/><span>左键旋转 <i/> 滚轮缩放 <i/> 右键平移</span></div><button className={'auto-button ' + (auto ? 'active' : '')} aria-pressed={auto} disabled={mode === 'floor'} onClick={() => setAuto(!auto)}>{auto && mode === '3d' ? <Pause size={13}/> : <Play size={13}/>}<span>{auto ? '暂停巡航' : '自动巡航'}</span></button></div>
          {selectedDevice && <div className="device-popup" role="dialog" aria-label="设备详情"><div className="device-popup-title"><Cpu size={17}/><strong>{selectedDevice.name}</strong><button aria-label="关闭设备详情" onClick={() => setDevice(null)}><X size={16}/></button></div><span className={selectedDevice.status === '告警' ? 'device-status warning' : 'device-status'}>{selectedDevice.status === '告警' ? '告警 · 演示' : '正常运行 · 演示'}</span><dl><div><dt>设备编号</dt><dd>{building}-{floor}F-{selectedDevice.id}</dd></div><div><dt>设备位置</dt><dd>{building}座 · {floor}F · {selectedDevice.room}</dd></div><div><dt>当前读数</dt><dd>{selectedDevice.value}</dd></div></dl><div className="detail-note">点位和读数均为演示数据</div></div>}
        </section>
        <div className="right-panels">
          <Panel title="设备运行状态" icon={Cpu} extra={<span className="online-badge">98.6% 在线</span>}><div className="device-status-list">{[{ icon: Camera, name: '视频监控', count: 461, offline: 6, color: 'blue' }, { icon: Snowflake, name: '暖通空调', count: 341, offline: 5, color: 'cyan' }, { icon: Flame, name: '消防系统', count: 208, offline: 3, color: 'orange' }, { icon: ShieldCheck, name: '门禁系统', count: 236, offline: 3, color: 'violet' }].map(({ icon: Icon, name, count, offline, color }) => <div className="status-row" key={name}><span className={'status-icon ' + color}><Icon size={20}/></span><div className="status-label"><strong>{name}</strong><small><i/>{offline} 台离线</small></div><div className="status-value"><strong>{count}</strong><small>台设备</small></div></div>)}</div><div className="online-bar"><i/><span>在线 1,229</span><b/><span>离线 17</span></div></Panel>
          <Panel title="能源使用分析" icon={Zap} extra="本日"><div className="energy-row"><div className="donut-wrap"><Chart kind="donut"/><div className="donut-center"><strong>8,462</strong><span>总用电 / kWh</span></div></div><div className="energy-legend"><span><i/>空调系统<b>76%</b></span><span><i/>照明系统<b>16%</b></span><span><i/>其他设备<b>8%</b></span></div></div><div className="energy-saving"><Leaf size={14}/><span>较昨日节约用电</span><strong>8.2<small>%</small></strong></div></Panel>
          <Panel title={view === 'equipment' ? '设备点位' : '当前楼宇信息'} icon={Building2} extra={<span className="selected-badge">{building}座</span>} className="building-info"><div className="building-name"><strong>{current.name}</strong><span>示意医疗建筑</span></div><div className="building-details"><div><span>示意高度</span><b>{current.height}<small>m</small></b></div><div><span>楼层总数</span><b>{current.floors}<small>层</small></b></div><div><span>接入设备</span><b>{current.devices}<small>台</small></b></div><div><span>在楼人数</span><b>{current.occupancy.toLocaleString()}<small>人</small></b></div></div><button className="inspect-floor" onClick={() => setMode('floor')}>查看 {floor}F 空间与设备<ArrowUpRight size={14}/></button></Panel>
        </div>
      </div>
      <footer><span><span className="status-dot"/> 本地演示环境<span className="footer-divider"/>数据刷新：演示快照</span><a className="asset-credit" href="https://sketchfab.com/3d-models/hospital-model-0012226ea07d4161b4d2c133a9b11448" target="_blank" rel="noreferrer">模型署名：Er.B.Nijithkumar · CC BY 4.0</a></footer>
    </main>
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-dialog" role="dialog" aria-modal="true" aria-label="模型操作帮助" onClick={e => e.stopPropagation()}><button className="dialog-close" aria-label="关闭帮助" onClick={() => setHelp(false)}><X size={19}/></button><Move3D size={31}/><h2>探索你的数字院区</h2><p>模型由真实三维几何组成，可以从不同角度观察。</p><div className="help-grid"><span>左键拖拽</span><b>旋转模型</b><span>滚轮 / 双指捏合</span><b>缩放场景</b><span>右键拖拽 / 双指拖动</span><b>平移视角</b><span>方向键 / + −</span><b>旋转与缩放</b><span>点击楼栋标签</span><b>选择楼宇</b><span>切换 2.5D 楼层</span><b>查看空间和设备</b></div><p className="help-note">门诊主体使用授权医院模型，住院楼、医技楼、楼层布局和指标均为演示示意，未接入本院 BIM 或实时数据。</p><button className="primary-button" onClick={() => setHelp(false)}>开始探索<ArrowUpRight size={15}/></button></section></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);

