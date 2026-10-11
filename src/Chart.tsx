import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, PieChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([LineChart, PieChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export function Chart({ kind, energy = false }: { kind: 'trend' | 'donut' | 'bars'; energy?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const chart = echarts.init(ref.current!, undefined, { renderer: 'canvas' });
    const text = { color: '#7997b0', fontSize: 10, fontFamily: 'Arial' };
    chart.setOption(kind === 'donut' ? {
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: ['68%', '83%'], center: ['50%', '50%'], label: { show: false }, itemStyle: { borderColor: '#0b2133', borderWidth: 3 }, data: [{ value: 76, name: '空调系统', itemStyle: { color: '#53daca' } }, { value: 16, name: '照明系统', itemStyle: { color: '#459bf6' } }, { value: 8, name: '其他设备', itemStyle: { color: '#edbe76' } }] }]
    } : kind === 'bars' ? {
      grid: { left: 50, right: 12, top: 5, bottom: 6 },
      xAxis: { type: 'value', show: false, max: 100 }, yAxis: { type: 'category', data: ['其他', '电梯', '照明', '空调'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: text },
      series: [{ type: 'bar', data: [17, 31, 47, 82], barWidth: 6, showBackground: true, backgroundStyle: { color: '#183246' }, itemStyle: { color: '#62b0df', borderRadius: 2 } }]
    } : {
      tooltip: { trigger: 'axis', backgroundColor: '#102d42', borderColor: '#295270', textStyle: { color: '#d8ecfa' } },
      grid: { left: 29, right: 7, top: 12, bottom: 22 },
      xAxis: { type: 'category', boundaryGap: false, data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisTick: { show: false }, axisLine: { lineStyle: { color: '#264254' } }, axisLabel: { ...text, interval: 1 } },
      yAxis: { type: 'value', splitNumber: 3, axisLabel: text, splitLine: { lineStyle: { color: '#20374a', type: 'dashed' } } },
      series: [{ name: energy ? '用电量 kWh' : '通行人次', type: 'line', smooth: true, symbol: 'none', data: energy ? [140, 122, 220, 312, 283, 215, 164] : [21, 35, 138, 102, 188, 129, 42], lineStyle: { color: '#50dacb', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#2f8f9877' }, { offset: 1, color: '#20405a05' }]) } }, { name: energy ? '昨日用电量' : '离园人次', type: 'line', smooth: true, symbol: 'none', data: [15, 24, 73, 90, 109, 151, 98], lineStyle: { color: '#5488ae', width: 1.5, type: 'dashed' } }]
    });
    const observer = new ResizeObserver(() => chart.resize()); observer.observe(ref.current!);
    return () => { observer.disconnect(); chart.dispose(); };
  }, [kind, energy]);
  return <div className={'chart chart-' + kind} ref={ref} role="img" aria-label={kind === 'donut' ? '能耗占比：空调76%，照明16%，其他8%' : kind === 'bars' ? '设备能耗排序' : energy ? '今日与昨日用电趋势' : '今日园区通行趋势'} />;
}
