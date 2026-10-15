# 中文与英文界面切换

## Why
用户要求增加语言切换，将中文界面切换为英文，以便英语访客使用同一个医院模型网站。

## What Changes
- 顶栏提供可访问的“中文 / English”切换，首次默认中文，记住用户选择；存储不可用时仍可切换。
- 导航、指标/单位、面板、图表、模型/楼层标签、设备详情、图层、帮助、错误和天气详情完整本地化；真实源文件名/设备ID保留。
- 切换保留当前相机、模型、分区、楼层、筛选、设备弹窗、图层和天气状态，不重新创建BuildingScene、不重新请求天气。
- 两种语言均使用Asia/Shanghai时间；英文使用英语日期/星期和北京时间说明。

## Impact
Specs: dashboard-interaction. Code: locale dictionary/context/render adapter, App, WeatherWidget, Chart, BuildingScene labels, responsive styles and acceptance harness. The explicit user request replaces the earlier Chinese-only rule with Chinese-default bilingual UI; data/source geometry are unchanged.
