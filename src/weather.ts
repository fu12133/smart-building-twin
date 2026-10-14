import { useEffect, useState } from 'react';

export type WeatherReading = { time: number; temperature: number; humidity: number; code: number; cloud: number; precipitation: number; wind: number; sunrise?: number; sunset?: number };
export const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=22.54554&longitude=114.0683&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,precipitation,wind_speed_10m,is_day&daily=sunrise,sunset&timezone=Asia%2FShanghai&forecast_days=1&timeformat=unixtime';
const CACHE_KEY = 'shenzhen-weather-v1';
const REFRESH_MS = 10 * 60 * 1000;
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const number = (value: unknown, min: number, max: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error('天气数据不完整');
  return value;
};
export function parseWeather(payload: unknown): WeatherReading {
  const data = record(payload), current = record(data.current), units = record(data.current_units), daily = record(data.daily);
  if (units.time !== 'unixtime' || units.temperature_2m !== '°C' || units.wind_speed_10m !== 'km/h' || units.relative_humidity_2m !== '%' || units.precipitation !== 'mm') throw new Error('天气单位不匹配');
  const sunrise = Array.isArray(daily.sunrise) ? daily.sunrise[0] : undefined;
  const sunset = Array.isArray(daily.sunset) ? daily.sunset[0] : undefined;
  return {
    time: number(current.time, 1e9, 1e11) * 1000,
    temperature: number(current.temperature_2m, -90, 65), humidity: number(current.relative_humidity_2m, 0, 100),
    code: number(current.weather_code, 0, 99), cloud: number(current.cloud_cover, 0, 100),
    precipitation: number(current.precipitation, 0, 1000), wind: number(current.wind_speed_10m, 0, 500),
    sunrise: typeof sunrise === 'number' && Number.isFinite(sunrise) ? sunrise * 1000 : undefined,
    sunset: typeof sunset === 'number' && Number.isFinite(sunset) ? sunset * 1000 : undefined,
  };
}
export function isFresh(weather: WeatherReading, now = Date.now()) { return now - weather.time < 90 * 60 * 1000 && weather.time - now < 15 * 60 * 1000; }
export function weatherKind(code: number) {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if (code >= 95) return 'storm';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([45, 48].includes(code)) return 'fog';
  return code >= 1 && code <= 3 ? 'cloud' : 'clear';
}
export function weatherName(code: number) {
  return ({ 0: '晴', 1: '晴间多云', 2: '多云', 3: '阴', 45: '雾', 48: '冻雾', 51: '小毛毛雨', 53: '毛毛雨', 55: '较强毛毛雨', 56: '冻毛毛雨', 57: '冻毛毛雨', 61: '小雨', 63: '中雨', 65: '大雨', 66: '冻雨', 67: '冻雨', 71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒', 80: '小阵雨', 81: '阵雨', 82: '强阵雨', 85: '阵雪', 86: '强阵雪', 95: '雷阵雨', 96: '雷雨伴冰雹', 99: '强雷雨伴冰雹' } as Record<number, string>)[code] || '其他天气';
}
export function daylight(weather: WeatherReading | undefined, now: Date) {
  const ms = now.getTime();
  const rise = weather?.sunrise, set = weather?.sunset;
  if (rise && set && set > rise && Math.abs(ms - rise) < 24 * 3600000) {
    if (ms < rise || ms > set) return 0;
    return Math.round(Math.sin((ms - rise) / (set - rise) * Math.PI) * 20) / 20;
  }
  // Missing/stale daily data: approximate local time only, never invent weather readings.
  const hour = Number(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', hour12: false }));
  return hour >= 6 && hour < 18 ? Math.round(Math.sin((hour - 6) / 12 * Math.PI) * 20) / 20 : 0;
}
type WeatherState = { reading?: WeatherReading; updatedAt?: number; loading: boolean; error: string };
function cachedWeather(): WeatherState {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cache && typeof cache.updatedAt === 'number' && Date.now() - cache.updatedAt < 24 * 3600000) return { reading: parseWeather(cache.payload), updatedAt: cache.updatedAt, loading: true, error: '正在更新缓存数据' };
  } catch { /* Storage is optional; malformed caches never become current readings. */ }
  return { loading: true, error: '' };
}
export function useShenzhenWeather() {
  const [state, setState] = useState<WeatherState>(cachedWeather);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true, controller: AbortController | undefined, timeout: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      controller?.abort(); clearTimeout(timeout);
      const request = new AbortController(); controller = request;
      timeout = setTimeout(() => request.abort(), 10000);
      setState(previous => ({ ...previous, loading: true }));
      try {
        const response = await fetch(WEATHER_URL, { signal: request.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('天气服务暂不可用');
        const payload: unknown = await response.json(), reading = parseWeather(payload), updatedAt = Date.now();
        if (!active || request !== controller || request.signal.aborted) return;
        setState({ reading, updatedAt, loading: false, error: '' });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ payload, updatedAt })); } catch { /* Private mode/quota cannot block weather. */ }
      } catch {
        if (active && request === controller) setState(previous => ({ ...previous, loading: false, error: request.signal.aborted ? '天气请求超时' : '天气更新失败' }));
      } finally { if (request === controller) clearTimeout(timeout); }
    };
    void load();
    const interval = setInterval(() => { if (!document.hidden) void load(); }, REFRESH_MS);
    const visibility = () => { if (!document.hidden) void load(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { active = false; controller?.abort(); clearTimeout(timeout); clearInterval(interval); document.removeEventListener('visibilitychange', visibility); };
  }, [revision]);
  return { ...state, refresh: () => setRevision(value => value + 1) };
}
