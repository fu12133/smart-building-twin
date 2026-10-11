# Context

参考图采用宽屏、深蓝场景、楼宇居中、左右透明数据面板。首版以夜景科技风保留信息层级，模型采用参数化生成，可在缺少 BIM 资产时完成真实 3D 交互。

# Goals / Non-Goals

目标：真实旋转和缩放；设备与楼宇联动；2.5D 房间和设备可读；可复现浏览器验证；在 1440×900 与窄屏下可操作。

范围之外：工程级 IFC 语义、实景完全复刻、真实视频流、生产 IoT 接入及后台。

# Decisions

1. React 管理界面，独立 Three.js 场景管理器持有 renderer / controls / picking；清理监听、帧循环和 GPU 资源。
2. OrbitControls 支持左键旋转、滚轮缩放、右键平移及触屏；视角距离和极角受约束，防止钻入地面。提供键盘方向键旋转和 +/- 缩放。
3. 地块、裙楼、塔楼、幕墙、车道、植物均为几何对象。窗格用 InstancedMesh 降低 draw calls，标签从三维坐标投影并随相机更新。
4. 2.5D 层图独立 group；切换时保存 3D 相机位置与 target，切回恢复。楼层选择更新楼层墙体和设备语义。
5. 点击模型使用 Raycaster；拖拽位移阈值防止误选。楼栋选择、筛选和设备详情共享状态。
6. 演示指标用固定数据，时钟用 Asia/Shanghai。无真实连接时显示“演示数据”，不伪造连接状态。
7. Dev-only read-only harness snapshot 提供相机姿态、帧计数、模式及当前选择；测试必须通过 UI 操作改变状态，不能调用内部 setter。

# Risks / Trade-offs

参数化几何有参考图的空间风格但不能达到真实 BIM 资产的工程细节。WebGL 不支持时显示明确故障提示。图表/模型资源体积可通过独立 chunks 管理。

# Verification

执行 OpenSpec strict validation、TypeScript + production build、Playwright harness。验收覆盖实际鼠标拖拽、滚轮缩放、自动巡航启停、复位、楼栋联动、2.5D 切换、设备点位、楼层和图层、WebGL 错误处理、窄屏及控制台。截图写入 artifacts/harness。
