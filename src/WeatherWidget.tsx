import { useState } from 'react';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Moon, RefreshCw, Sun, X } from 'lucide-react';
import { daylight, isFresh, useShenzhenWeather, weatherKind, weatherName } from './weather';
import { localize, localeName, useLanguage, Language } from './i18n';

const localTime = (ms: number, language: Language) => new Date(ms).toLocaleTimeString(localeName(language), { timeZone: 'Asia/Shanghai', hour12: false, hour: '2-digit', minute: '2-digit' });
export function WeatherWidget({ weather, now }: { weather: ReturnType<typeof useShenzhenWeather>; now: Date }) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const { reading, loading, error } = weather;
  const fresh = !!reading && isFresh(reading, now.getTime());
  const kind = reading ? weatherKind(reading.code) : 'cloud';
  const Icon = kind === 'storm' ? CloudLightning : kind === 'rain' ? CloudRain : kind === 'snow' ? CloudSnow : kind === 'fog' ? CloudFog : kind === 'cloud' ? Cloud : daylight(reading, now) ? Sun : Moon;
  const state = loading ? '更新中' : error ? reading ? '上次数据' : '暂不可用' : fresh ? '已更新' : '数据过期';
  return localize(<div className="weather-widget" onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
    <button className="weather-button" aria-label="深圳天气" aria-expanded={open} onClick={() => setOpen(!open)}><Icon size={21}/><span><strong>深圳 {reading ? reading.temperature.toFixed(1) + '°C' : '--°C'}</strong><small>{reading ? t(weatherName(reading.code)) + ' · ' + state : loading ? '天气获取中' : '天气暂不可用'}</small></span></button>
    {open && <section className="weather-popover" role="dialog" aria-label="深圳天气详情">
      <div className="weather-heading"><strong>深圳天气</strong><button aria-label="关闭天气详情" onClick={() => setOpen(false)}><X size={17}/></button></div>
      <div className="weather-current"><Icon size={35}/><div><strong>{reading ? reading.temperature.toFixed(1) + '°C' : '--°C'}</strong><span>{reading ? t(weatherName(reading.code)) : '暂无可用数据'}</span></div><small className={!fresh || error ? 'weather-stale' : ''}>{state}</small></div>
      {reading && <><div className="weather-facts"><span>相对湿度<strong>{reading.humidity}%</strong></span><span>风速<strong>{reading.wind.toFixed(1)} km/h</strong></span><span>降水量<strong>{reading.precipitation.toFixed(1)} mm</strong></span><span>云量<strong>{reading.cloud}%</strong></span></div><p className="weather-data-time">数据时刻：{new Date(reading.time).toLocaleDateString(localeName(language), { timeZone: 'Asia/Shanghai' })} {localTime(reading.time, language)}（北京时间）</p></>}
      {error && <p className="weather-message" role="status">{error}{reading ? '，保留上次数据。' : '，可稍后重试。'}</p>}
      {reading && !fresh && <p className="weather-message">数据已过期，当前晴雨效果暂不跟随该数据。</p>}
      <p className="weather-source">来源：<a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo 天气模型</a> · 非现场实测</p>
      <div className="weather-refresh"><small>{weather.updatedAt ? '获取于 ' + localTime(weather.updatedAt, language) : '每 10 分钟自动更新'}</small><button disabled={loading} onClick={weather.refresh}><RefreshCw size={13}/>{loading ? '正在更新' : '刷新天气'}</button></div>
    </section>}
  </div>, language);
}
