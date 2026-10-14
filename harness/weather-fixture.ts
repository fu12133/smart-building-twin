export const NIGHT_TIME = new Date('2026-10-14T12:00:00Z');
export const WEATHER_ROUTE = 'https://api.open-meteo.com/v1/forecast?**';
export function weatherFixture(options: { time?: Date; code?: number; cloud?: number; precipitation?: number } = {}) {
  const time = options.time || NIGHT_TIME;
  return {
    timezone: 'Asia/Shanghai', utc_offset_seconds: 28800,
    current_units: { time: 'unixtime', temperature_2m: '°C', relative_humidity_2m: '%', precipitation: 'mm', wind_speed_10m: 'km/h' },
    current: { time: time.getTime() / 1000, temperature_2m: 26.5, relative_humidity_2m: 70, weather_code: options.code || 0, cloud_cover: options.cloud || 0, precipitation: options.precipitation || 0, wind_speed_10m: 12.9 },
    daily: { sunrise: [new Date('2026-10-14T06:00:00+08:00').getTime() / 1000], sunset: [new Date('2026-10-14T18:00:00+08:00').getTime() / 1000] },
  };
}
