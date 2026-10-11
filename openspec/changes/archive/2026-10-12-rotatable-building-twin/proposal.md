# Why

用户要求参考智慧楼宇可视化大屏，模型必须能旋转，按 OpenSpec + harness 开发。当前目录为空，参考材料包含 2.5D 电子地图和 3D BIM 可视化需求。没有实际 BIM 资产、IoT 地址或既有应用。

# What Changes

- 建立中文深蓝色楼宇大屏，中央为真实 Three.js 立体园区，保留参考图的玻璃幕墙、夜景照明、透明信息面板。
- 支持指针旋转、缩放、平移、自动巡航、视角复位、楼栋选择及楼层聚焦。
- 提供 2.5D 层图，带立体墙体、房间和可选择设备点位。
- 提供设备物联、通行统计、能源分析视图及相应演示指标；全局标识数据为演示数据。
- 将需求、设计、任务、Playwright harness 和验证证据保存在仓库。

# Capabilities

## New Capabilities
- `building-visualization`: 真实可旋转 3D 场景与 2.5D 电子地图。
- `dashboard-interaction`: 导航、数据联动、设备信息、响应式布局。

## Modified Capabilities
None.

# Impact

新建前端项目及浏览器验收 harness。仅本地运行，无发布、账户系统、真实告警处置或 IoT 写操作。参数化模型不能冒充用户项目的工程 BIM 文件。
