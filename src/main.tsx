import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDown, ArrowUpRight, Bell, Building2, Camera, ChevronDown, ChevronRight, CircleHelp, Cpu, Expand, Flame, Layers3, Leaf, MapPin, Maximize2, MousePointer2, Pause, Play, Plus, Minus, RotateCcw, ScanLine, ShieldCheck, Snowflake, Users, X, Zap, LayoutDashboard, Radio, Move3D, Eye, PanelLeftClose, Sun } from 'lucide-react';
import { BuildingScene } from './scene';
import { buildings, View, viewNames, floorName, floorScope } from './data';
import { getFloorLayout } from './floorLayouts';
import { Chart } from './Chart';
import './style.css';
import { deviceSystems, DeviceFilter } from './deviceSystems';
import { daylight, isFresh, useShenzhenWeather, weatherName } from './weather';
import { WeatherWidget } from './WeatherWidget';
import { LanguageProvider, localize, localeName, useLanguage } from './i18n';

declare global { interface Window { __BUILDING_HARNESS__?: () => ReturnType<BuildingScene['snapshot']>; } }
const nav = [{ id: 'overview', icon: LayoutDashboard, name: '院区总览' }, { id: 'equipment', icon: Cpu, name: '设备物联' }, { id: 'access', icon: Users, name: '通行统计' }, { id: 'energy', icon: Zap, name: '能源分析' }] as const;
function Panel({ title, icon: Icon, extra, children, className = '' }: { title: string; icon: typeof Activity; extra?: React.ReactNode; children: React.ReactNode; className?: string }) {
  const { t } = useLanguage();
  return <section className={'panel ' + className}><div className="panel-title"><Icon size={15} /><h2>{title}</h2><span className="panel-extra">{extra || t('今日')}</span></div>{children}</section>;
}

function App() {
  const { language, setLanguage, t } = useLanguage();
  const host = useRef<HTMLDivElement>(null);
  const floorRail = useRef<HTMLDivElement>(null);
  const engine = useRef<BuildingScene | null>(null);
  const pendingDevice = useRef<string | null>(null);
  const [view, setView] = useState<View>('overview');
  const [mode, setMode] = useState<'3d' | 'floor'>('3d');
  const [building, setBuilding] = useState('A');
  const [floor, setFloor] = useState(2);
  const [hospitalReady, setHospitalReady] = useState(false);
  const [contextReady, setContextReady] = useState(false);
  const [auto, setAuto] = useState(false);
  const [deviceLayer, setDeviceLayer] = useState(true);
  const [contextLayer, setContextLayer] = useState(true);
  const [originalProposal, setOriginalProposal] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [device, setDevice] = useState<string | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>('all');
  const [help, setHelp] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [time, setTime] = useState(new Date());
  const weather = useShenzhenWeather();
  const [weatherEffects, setWeatherEffects] = useState(true);
  const [summaryMetrics, setSummaryMetrics] = useState(false);
  const [streetscapeLayer, setStreetscapeLayer] = useState(true);
  const [sunPreview, setSunPreview] = useState(false);
  const previewSun = (enabled: boolean) => { setSunPreview(enabled); if (enabled) setWeatherEffects(true); };
  const weatherMinute = Math.floor(time.getTime() / 60000);
  const freshWeather = weather.reading && isFresh(weather.reading, time.getTime()) ? weather.reading : undefined;
  const sunLevel = daylight(freshWeather, time), timePeriod = t(sunLevel > .35 ? '日间' : sunLevel > 0 ? '晨昏' : '夜景');
  const current = buildings.find(b => b.id === building)!;
  const layout = getFloorLayout(building, floor), devices = layout.devices;
  const selectedDevice = devices.find(d => d.id === device);
  const floors = [...Array.from({ length: current.floors }, (_, i) => i + 1).reverse(), -1, -2];
  useEffect(() => {
    const rail = floorRail.current, selected = rail?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!rail || !selected) return;
    rail.scrollTo({ top: selected.offsetTop - rail.offsetTop - (rail.clientHeight - selected.clientHeight) / 2, left: selected.offsetLeft - rail.offsetLeft - (rail.clientWidth - selected.clientWidth) / 2 });
  }, [mode, floor, current.floors]);
  useEffect(() => {
    let scene: BuildingScene | undefined;
    try {
      scene = new BuildingScene(host.current!, { language, onSelect: id => { setBuilding(id); setDevice(null); }, onDevice: setDevice, onError: setError, onModelLoaded: () => setHospitalReady(true), onContextLoaded: () => setContextReady(true) });
      engine.current = scene;
      if (import.meta.env.DEV) window.__BUILDING_HARNESS__ = () => scene!.snapshot();
    } catch { setError('无法启动三维渲染，请使用支持 WebGL 的浏览器并开启硬件加速。'); }
    return () => { scene?.dispose(); engine.current = null; delete window.__BUILDING_HARNESS__; };
  }, []);
  useEffect(() => { engine.current?.setMode(mode); setDevice(null); }, [mode]);
  useEffect(() => {
    const boundedFloor = Math.max(-2, Math.min(floor, current.floors));
    engine.current?.select(building); engine.current?.setFloor(boundedFloor);
    if (boundedFloor !== floor) setFloor(boundedFloor);
    setDevice(null);
  }, [building, floor, current.floors]);
  useEffect(() => { engine.current?.setAuto(auto); }, [auto]);
  useEffect(() => { engine.current?.setLayers(deviceLayer, contextLayer); }, [deviceLayer, contextLayer]);
  useEffect(() => { engine.current?.setProposal(originalProposal); }, [originalProposal]);
  useEffect(() => { engine.current?.setStreetscape(streetscapeLayer); }, [streetscapeLayer]);
  useEffect(() => { engine.current?.setAtmosphere(weather.reading, new Date(), weatherEffects, sunPreview); }, [weather.reading, weatherEffects, weatherMinute, sunPreview, originalProposal]);
  useEffect(() => { engine.current?.setDeviceFilter(deviceFilter); }, [deviceFilter]);
  useEffect(() => { engine.current?.setSelectedDevice(device); }, [device]);
  useEffect(() => { engine.current?.setLanguage(language); }, [language]);
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  const changeView = (id: View) => { setView(id); setDevice(null); };
  // Selecting from a table must open its detail after the mode effect settles.
  useEffect(() => { if (mode === 'floor' && pendingDevice.current) { setDevice(pendingDevice.current); pendingDevice.current = null; } }, [mode, building, floor]);
  const locateDevice = (id: string, targetBuilding = building, targetFloor = floor) => {
    setDeviceFilter('all');
    const boundedFloor = Math.max(-2, Math.min(targetFloor === 0 ? 1 : targetFloor, buildings.find(b => b.id === targetBuilding)!.floors));
    if (mode !== 'floor' || targetBuilding !== building || boundedFloor !== floor) {
      pendingDevice.current = id; setMode('floor'); setBuilding(targetBuilding); setFloor(boundedFloor);
    } else setDevice(id);
  };
  const fullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { setToast('当前预览不支持全屏，可在独立浏览器中打开。'); } };
  const metrics = view === 'energy' ? [{ name: '今日用电量', value: '8,462', unit: 'kWh', trend: '较昨日 −8.2%', icon: Zap }, { name: '今日用水量', value: '126.8', unit: 'm³', trend: '较昨日 −4.6%', icon: Activity }, { name: '碳排放量', value: '4.82', unit: 't', trend: '较昨日 −6.1%', icon: Leaf }, { name: '节能率', value: '18.6', unit: '%', trend: '本月累计', icon: ShieldCheck }] : view === 'access' ? [{ name: '今日入院区', value: '4,958', unit: '人次', trend: '较昨日 +12.6%', icon: Users }, { name: '今日离院区', value: '4,322', unit: '人次', trend: '较昨日 +8.2%', icon: ArrowDown }, { name: '在院区人数', value: '636', unit: '人', trend: '院区实时统计', icon: Building2 }, { name: '今日访客', value: '279', unit: '人次', trend: '预约到访 92.1%', icon: ScanLine }] : [{ name: '接入设备', value: '1,246', unit: '台', trend: '覆盖 12 个子系统', icon: Cpu }, { name: '设备在线率', value: '98.6', unit: '%', trend: '在线 1,229 台', icon: Radio }, { name: '今日通行', value: '4,958', unit: '人次', trend: '较昨日 +12.6%', icon: Users }, { name: '今日能耗', value: '8,462', unit: 'kWh', trend: '较昨日 −8.2%', icon: Zap }];
  return localize(<div className={'app-shell ' + (mode === 'floor' ? 'floor-mode' : '')}>
    <header className="header"><div className="brand"><div className="brand-symbol"><Building2 size={26} /></div><div><strong>云境<span> YUNJING</span></strong><small>智慧空间 · 数字孪生</small></div></div><div className="header-title"><span>医院运维 · 数字孪生</span><h1>智慧医院综合管理平台</h1></div><div className="header-actions"><div className="language-switch" role="group" aria-label="选择语言"><button lang="zh-CN" aria-pressed={language === 'zh'} onClick={() => setLanguage('zh')}>中文</button><button lang="en" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button></div><WeatherWidget weather={weather} now={time}/><div className="clock" aria-label="北京时间"><strong>{time.toLocaleTimeString(localeName(language), { timeZone: 'Asia/Shanghai', hour12: false })}</strong><small>{time.toLocaleDateString(localeName(language), { timeZone: 'Asia/Shanghai' })} <span>{time.toLocaleDateString(localeName(language), { timeZone: 'Asia/Shanghai', weekday: 'long' })}</span></small></div><button className="icon-button" aria-label="操作帮助" onClick={() => setHelp(true)}><CircleHelp size={18}/></button><button className="icon-button" aria-label="全屏显示" onClick={fullscreen}><Expand size={18}/></button></div></header>
    <aside className="nav-rail"><div className="rail-top"><span className="rail-dot"/>智慧院区</div><nav aria-label="主导航">{nav.map(({ id, icon: Icon, name }) => <button key={id} className={view === id ? 'nav-item active' : 'nav-item'} aria-pressed={view === id} onClick={() => changeView(id)}><span className="nav-icon" aria-hidden="true"><Icon size={22}/></span><span>{name}</span>{view === id && <i/>}</button>)}</nav><div className="rail-bottom"><ShieldCheck size={20}/><span>管理中心</span><div className="avatar">YK</div></div></aside>
    <main>
      <div className="workspace-heading"><div className="breadcrumb">云境智慧院区 <ChevronRight size={12}/><b>{viewNames[view]}</b></div><div className="data-source"><i/>演示数据<span className="source-divider"/>{mode === 'floor' ? '内部布局 · 方案示意' : originalProposal ? '原创医院 · 白模深化方案' : '项目白模 · 主体及周边'}</div></div>
      <div className={summaryMetrics ? "metrics" : "metrics reference-hidden"}>{metrics.map(({ name, value, unit, trend, icon: Icon }) => <div className="metric" key={name}><div className="metric-icon"><Icon size={21}/></div><div className="metric-body"><span>{name}</span><div><strong>{value}</strong><small>{unit}</small></div><p>{trend.includes('−') ? <ArrowDown size={10}/> : <span className="tiny-dot"/>}{trend}</p></div></div>)}</div>
      <div className="dashboard">
        <div className="left-panels">
          <Panel title={view === 'access' ? '今日通行统计' : view === 'energy' ? '能源运行概况' : '院区运行概况'} icon={Activity} extra={<span className="live"><i/>运行中</span>}>
            <div className="overview-stat"><div><span>{view === 'energy' ? '综合节能率' : '综合运行指数'}</span><strong>{view === 'energy' ? '18.6' : '98.2'}<small>{view === 'energy' ? '%' : '分'}</small></strong><p><span className="status-dot"/>院区运行平稳</p></div><div className="score-orbit"><ShieldCheck size={32}/><span>健康</span></div></div>
            <div className="small-stats"><div><strong>1<small>栋</small></strong><span>塔楼＋裙房</span></div><div><strong>28,426<small>m²</small></strong><span>改造面积</span></div><div><strong>18+2<small>层</small></strong><span>地上＋地下</span></div></div>
          </Panel>
          <Panel title={view === 'energy' ? '今日用电趋势' : '今日通行趋势'} icon={view === 'energy' ? Zap : Users} extra={view === 'energy' ? 'kWh' : '人次'}><div className="chart-legend"><span><i/> {view === 'energy' ? '今日用电' : '入院区人数'}</span><span><i className="muted"/>{view === 'energy' ? '昨日用电' : '离院区人数'}</span></div><Chart kind="trend" energy={view === 'energy'}/><div className="trend-bottom"><span>今日累计{view === 'energy' ? '用电' : '通行'}</span><strong>{view === 'energy' ? '8,462' : '4,958'}<small>{view === 'energy' ? 'kWh' : '人次'}</small></strong><span className="positive">{view === 'energy' ? '↓ 8.2%' : '↑ 12.6%'}</span></div></Panel>
          <Panel title="告警动态" icon={Bell} extra={<span className="warning-count">3 条待关注</span>} className="alarm-panel"><div className="alert-summary"><span className="alert-icon"><Bell size={22}/></span><div><strong>03<span>今日告警</span></strong><small>演示告警 · 设备定位可查看</small></div><span className="alert-tag">待关注</span></div>{[{ title: '烟感探测器异常', place: building + '区 · ' + floorName(floor) + ' · ' + devices.find(d => d.id === 'SMK-03')!.room, time: '16:58', id: 'SMK-03', color: 'orange' }, { title: '空调温度超出阈值', place: 'A区 · 2F · ' + getFloorLayout('A', 2).devices.find(d => d.id === 'AC-01')!.room, time: '16:42', id: 'AC-01', color: 'yellow' }, { title: '摄像机离线记录', place: 'A区 · 2F · ' + getFloorLayout('A', 2).devices.find(d => d.id === 'CAM-02')!.room, time: '16:20', id: 'CAM-02', color: 'blue' }].map(a => <button className="alarm-row" key={a.title} onClick={() => { locateDevice(a.id, a.id === 'SMK-03' ? building : 'A', a.id === 'SMK-03' ? floor : 2); }}><i className={a.color}/><span><strong>{a.title}</strong><small>{a.place}</small></span><time>{a.time}</time><ChevronRight size={12}/></button>)}</Panel>
        </div>
        <section className="scene-section" aria-label="院区可视化">
          <div className="scene-top"><div><span className="eyebrow">医院数字孪生</span><h2>{mode === '3d' ? '院区数字孪生' : current.id + '区 · ' + floorName(floor) + ' 电子地图'}</h2></div><div className="mode-switch"><button aria-pressed={mode === '3d'} className={mode === '3d' ? 'active' : ''} onClick={() => setMode('3d')}><Move3D size={13}/>3D 院区</button><button aria-pressed={mode === 'floor'} className={mode === 'floor' ? 'active' : ''} onClick={() => setMode('floor')}><Layers3 size={13}/>2.5D 楼层</button></div></div>
          <div className="scene-host" ref={host} data-testid="scene-host"/>
          {error && <div className="scene-error" role="alert"><Building2 size={32}/><h3>三维场景暂不可用</h3><p>{error}</p><button onClick={() => location.reload()}>重新加载</button></div>}
          <div className="scene-info"><span className="model-state"><i/> {mode === '3d' ? (hospitalReady ? '医院模型已加载' : '医院模型加载中') : '示意楼层已加载'}</span><span>{mode === '3d' ? originalProposal ? '原创现代医院 / 材质与灯光方案 · 未核实' : '源白模形体 / 材质与灯光方案' : floorScope(building, floor)}</span>{mode === '3d' && <span className="context-state">{contextReady ? '白模周边已加载 · 可查看完整白模' : '白模周边加载中'}</span>}{mode === '3d' && <span className="atmosphere-state" aria-label="外景天气效果">{sunPreview && weatherEffects ? '晴天日照预览 · 非实时天气' : <>深圳 · {weatherEffects ? timePeriod + (freshWeather ? ' · ' + t(weatherName(freshWeather.code)) : ' · 天气待更新') : '展示灯光'}</>}</span>}{mode === '3d' && originalProposal && <span className="streetscape-state">场景布置方案：树木、人物、车辆、广告牌</span>}{mode === '3d' && weatherEffects && <span className="celestial-state">白天阳光 · 夜间月亮（展示）</span>}{mode === '3d' && <div className="sun-controls"><button className="sun-preview" aria-pressed={sunPreview} aria-label={sunPreview ? '结束日照预览' : '开启日照预览'} onClick={() => previewSun(!sunPreview)}><Sun size={12}/>{sunPreview ? '返回实时天气' : '日照预览'}</button>{sunPreview && <button className="sun-preview" onClick={() => engine.current?.viewSun()}>观察太阳</button>}</div>}{mode === 'floor' && <span aria-label="楼层布局说明">{layout.title} · {layout.rooms.length} 个分区 · 方案示意</span>}</div>
          {mode === 'floor' && <nav className="floor-rail" aria-label="楼层导航"><span>{building}区</span><div ref={floorRail}>{floors.map(f => <button key={f} aria-label={'切换到 ' + floorName(f)} aria-pressed={floor === f} className={floor === f ? 'active' : ''} title={floorScope(building, f)} onClick={() => setFloor(f)}>{floorName(f)}{building === 'A' && [13, 14].includes(f) && <small>保留</small>}</button>)}</div></nav>}
          <div className="scene-controls"><button aria-label="放大模型" title="放大" onClick={() => engine.current?.zoom(0.85)}><Plus size={17}/></button><button aria-label="缩小模型" title="缩小" onClick={() => engine.current?.zoom(1.15)}><Minus size={17}/></button><div className="control-divider"/><button aria-label="复位视角" title="复位视角" onClick={() => engine.current?.reset()}><RotateCcw size={16}/></button>{mode === '3d' && <button aria-label="查看完整白模" title="查看完整白模" disabled={!contextReady} onClick={() => engine.current?.showContext()}><Maximize2 size={16}/></button>}<button aria-label="图层设置" title="图层设置" aria-expanded={layersOpen} className={layersOpen ? 'active' : ''} onClick={() => setLayersOpen(!layersOpen)}><Layers3 size={17}/></button></div>
          {layersOpen && <div className="layer-popover"><strong>场景图层</strong><label className="metrics-layer"><input type="checkbox" checked={summaryMetrics} onChange={e => setSummaryMetrics(e.target.checked)}/>概览指标</label><label><input type="checkbox" checked={originalProposal} onChange={e => setOriginalProposal(e.target.checked)}/>原创医院方案</label><label><input type="checkbox" checked={streetscapeLayer} onChange={e => setStreetscapeLayer(e.target.checked)}/>场景配套</label><label><input type="checkbox" checked={deviceLayer} onChange={e => setDeviceLayer(e.target.checked)}/>设备点位</label><label><input type="checkbox" checked={contextLayer} onChange={e => setContextLayer(e.target.checked)}/>周边建筑</label><label><input type="checkbox" checked={weatherEffects} onChange={e => { setWeatherEffects(e.target.checked); if (!e.target.checked) setSunPreview(false); }}/>天气效果</label><label><input type="checkbox" checked={sunPreview} onChange={e => previewSun(e.target.checked)}/>晴天日照预览</label><small className="sun-layer-note">天体位置与月相为展示设计</small></div>}
          <div className="compass"><span>N</span><div><MapPin size={15}/></div><small>院区视角</small></div>
          <div className="building-selector"><label>当前分区<select aria-label="选择楼宇" value={building} onChange={e => { setBuilding(e.target.value); setDevice(null); }}>{buildings.map(b => <option value={b.id} key={b.id}>{b.name}</option>)}</select></label><label>楼层<select aria-label="选择楼层" value={floor} onChange={e => setFloor(Number(e.target.value))}>{floors.map(f => <option value={f} key={f}>{floorName(f)}</option>)}</select></label><button className="floor-action" aria-label="查看当前楼层" onClick={() => setMode(mode === '3d' ? 'floor' : '3d')}>{mode === '3d' ? '进入楼层' : '返回院区'}<ChevronRight size={13}/></button></div>
          <div className="scene-bottom"><div className="interaction-hint"><MousePointer2 size={13}/><span>左键旋转 <i/> 滚轮缩放 <i/> 右键平移</span></div><button className={'auto-button ' + (auto ? 'active' : '')} aria-pressed={auto} disabled={mode === 'floor'} onClick={() => setAuto(!auto)}>{auto && mode === '3d' ? <Pause size={13}/> : <Play size={13}/>}<span>{auto ? '暂停巡航' : '自动巡航'}</span></button></div>
          {selectedDevice && <div className="device-popup" role="dialog" aria-label="设备详情"><div className="device-popup-title"><Cpu size={17}/><strong>{selectedDevice.name}</strong><button aria-label="关闭设备详情" onClick={() => setDevice(null)}><X size={16}/></button></div><span className={selectedDevice.status === '告警' ? 'device-status warning' : 'device-status'}>{selectedDevice.status === '告警' ? '告警 · 演示' : '正常运行 · 演示'}</span><dl><div><dt>设备编号</dt><dd>{building}-{floorName(floor)}-{selectedDevice.id}</dd></div><div><dt>设备位置</dt><dd>{building}区 · {floorName(floor)} · {selectedDevice.room}</dd></div><div><dt>当前读数</dt><dd>{selectedDevice.value}</dd></div></dl><div className="detail-note">点位和读数均为演示数据</div></div>}
        </section>
        <div className="right-panels">
          {mode === 'floor' ? <section className="floor-systems" aria-label="楼层设备系统"><div className="floor-systems-heading"><h2>楼层设备</h2><button aria-label="显示全部设备" aria-pressed={deviceFilter === 'all'} onClick={() => { setDeviceFilter('all'); setDevice(null); }}>全部系统</button></div><p>{building}区 · {floorName(floor)} · {devices.length} 个示意点位</p><div className="system-grid">{deviceSystems.map(({ type, name, icon: Icon }) => {
            const points = devices.filter(d => d.type === type), fault = points.filter(d => d.status === '告警').length;
            return <button key={type} className={'system-card ' + (deviceFilter === type ? 'active' : '')} aria-label={'筛选' + name} aria-pressed={deviceFilter === type} onClick={() => { setDeviceFilter(type); setDevice(null); }}><div className="system-card-title"><Icon size={19}/><strong>{name}</strong></div><div className="system-card-body"><div className={'system-total ' + (fault ? 'fault' : '')}><small>总数</small><b>{points.length}</b></div><dl><div><dt>在线</dt><dd>{points.length}</dd></div><div><dt>离线</dt><dd>0</dd></div><div><dt>告警</dt><dd className={fault ? 'warning-text' : ''}>{fault}</dd></div></dl></div></button>;
          })}</div><div className="system-note">{deviceFilter === 'all' ? '显示全部系统' : '当前筛选：' + deviceSystems.find(s => s.type === deviceFilter)!.name} · {deviceLayer ? '设备图层已开启' : '设备图层已隐藏'}<br/>点位和统计均为演示，未接入实际系统</div></section> : <>
          <Panel title="设备运行状态" icon={Cpu} extra={<span className="online-badge">98.6% 在线</span>}><div className="device-status-list">{[{ icon: Camera, name: '视频监控', count: 461, offline: 6, color: 'blue' }, { icon: Snowflake, name: '暖通空调', count: 341, offline: 5, color: 'cyan' }, { icon: Flame, name: '消防系统', count: 208, offline: 3, color: 'orange' }, { icon: ShieldCheck, name: '门禁系统', count: 236, offline: 3, color: 'violet' }].map(({ icon: Icon, name, count, offline, color }) => <div className="status-row" key={name}><span className={'status-icon ' + color}><Icon size={20}/></span><div className="status-label"><strong>{name}</strong><small><i/>{offline} 台离线</small></div><div className="status-value"><strong>{count}</strong><small>台设备</small></div></div>)}</div><div className="online-bar"><i/><span>在线 1,229</span><b/><span>离线 17</span></div></Panel>
          <Panel title="能源使用分析" icon={Zap} extra="本日"><div className="energy-row"><div className="donut-wrap"><Chart kind="donut"/><div className="donut-center"><strong>8,462</strong><span>总用电 / kWh</span></div></div><div className="energy-legend"><span><i/>空调系统<b>76%</b></span><span><i/>照明系统<b>16%</b></span><span><i/>其他设备<b>8%</b></span></div></div><div className="energy-saving"><Leaf size={14}/><span>较昨日节约用电</span><strong>8.2<small>%</small></strong></div></Panel>
          </>}
          <Panel title={view === 'equipment' ? '设备点位' : '当前楼宇信息'} icon={Building2} extra={<span className="selected-badge">{building}区</span>} className="building-info"><div className="building-name"><strong>{current.name}</strong><span>项目白模 · 形体还原</span></div><div className="building-details"><div><span>资料高度</span><b>{current.height}<small>m</small></b></div><div><span>地上楼层</span><b>{current.floors}<small>层</small></b></div><div><span>演示设备</span><b>{current.devices}<small>台</small></b></div><div><span>演示人数</span><b>{current.occupancy.toLocaleString()}<small>人</small></b></div></div><div className="project-scope">{floorScope(building, floor)}<br/>项目总投资 2.87 亿元</div><button className="inspect-floor" onClick={() => setMode('floor')}>查看 {floorName(floor)} 空间与设备<ArrowUpRight size={14}/></button></Panel>
        </div>
      </div>
      <footer><span><span className="status-dot"/> 项目方案预览<span className="footer-divider"/>数据刷新：演示快照</span><a className="asset-credit" href={import.meta.env.BASE_URL + 'assets/project-model.json'} target="_blank" rel="noreferrer">模型来源：项目白模.dwg · 按塔楼高度等比校准</a></footer>
    </main>
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-dialog" role="dialog" aria-modal="true" aria-label="模型操作帮助" onClick={e => e.stopPropagation()}><button className="dialog-close" aria-label="关闭帮助" onClick={() => setHelp(false)}><X size={19}/></button><Move3D size={31}/><h2>探索你的数字院区</h2><p>模型由真实三维几何组成，可以从不同角度观察。</p><div className="help-grid"><span>左键拖拽</span><b>旋转模型</b><span>滚轮 / 双指捏合</span><b>缩放场景</b><span>右键拖拽 / 双指拖动</span><b>平移视角</b><span>方向键 / + −</span><b>旋转与缩放</b><span>点击楼栋标签</span><b>选择楼宇</b><span>切换 2.5D 楼层</span><b>查看空间和设备</b></div><p className="help-note">形体来自你提供的项目白模 DWG，塔楼与围合裙房为同一建筑。按资料塔楼结构高度 69.5 米等比校准；DWG单位头标米，但结构高度为205坐标单位，与资料不一致，当前不是已核准的现场尺寸。白模包围盒约 72.6×52.3 米，与资料 70×38 米有差异，未强行拉伸。资料裙房高 26.7 米、改造面积 28,426 m²、总投资 2.87 亿元。地上 18 层＋地下 2 层，13、14 层保留原功能。地下仅部分改造，地下形体与所有楼层布局尚未核实，为示意。各分区各层分别提供独立的内部方案示意，采用灰色楼板、白色房间隔墙、门洞、核心筒与楼梯；塔楼和裙房的核心筒各自上下对齐，外围隔间与走廊按层变化；设备分类可筛选点位，右侧楼层条可切换。实际室内图纸提供后再校准；主体、裙房、周边建筑和场地来自同一白模，保留源坐标关系。默认原创医院方案加入幕墙框、遮阳翼、层间带和玻璃门厅雨棚，为新设计而非已核实竣工形体；在图层设置关闭“原创医院方案”可回看源形体与原材质方案。没有新增医院名称或替换原城市和场地。玻璃、石材和场地材质仍为方案，尚无实际照片核对；指标未接入实时数据。可点击“查看完整白模”观察更大范围，复位返回主体。</p><p className="streetscape-provenance">场景布置与配色为方案，非现场实测；广告画面为AI生成，非实际医院室内。</p><p className="sun-provenance">默认白天显示太阳和阳光，夜间显示月亮；天体位置与月相为展示设计，未经真北或天文校准。晴天日照预览不代表深圳实时天气。</p><button className="primary-button" onClick={() => setHelp(false)}>开始探索<ArrowUpRight size={15}/></button></section></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>, language);
}
createRoot(document.getElementById('root')!).render(<LanguageProvider><App/></LanguageProvider>);

