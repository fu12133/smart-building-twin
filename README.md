# 云境 · 智慧楼宇数字孪生

参考用户提供的楼宇可视化大屏，实现真实可旋转的三维园区和 2.5D 楼层电子地图。React / TypeScript / Vite / Three.js / ECharts。

## 在线使用

[打开云境楼宇大屏](https://guangfubill-crypto.github.io/smart-building-twin/)。访问者无需安装 Node.js，使用现代浏览器即可操作模型。

源码仓库：[guangfubill-crypto/smart-building-twin](https://github.com/guangfubill-crypto/smart-building-twin)。

## 启动

```powershell
npm ci
npm run dev
```

打开 http://127.0.0.1:4187/ 。使用独立端口，避免干扰本机其他预览项目。

## 模型操作

| 操作 | 行为 |
| --- | --- |
| 左键拖拽 / 单指拖动 | 旋转三维场景 |
| 滚轮 / 双指捏合 | 缩放 |
| 右键拖拽 / 双指拖动 | 平移 |
| 聚焦画布后按方向键、+、− | 旋转和缩放 |
| 自动巡航 | 开启/暂停自动旋转 |
| 复位视角 | 清除惯性并恢复默认视角 |
| 点击楼宇或楼栋标签 | 选择楼宇并联动信息面板 |
| 2.5D 楼层 / 进入楼层 | 查看当前楼宇楼层示意图 |
| 点击设备标签或告警记录 | 打开设备详情 |
| 图层设置 | 控制设备点位及周边建筑显示 |

## OpenSpec + harness

```powershell
npm run spec:validate
npm run build
npm run harness
```

- OpenSpec：`openspec/config.yaml`、`openspec/specs/` 和 `openspec/changes/archive/`。
- Harness：`harness/building.spec.ts`。测试使用实际鼠标、滚轮、键盘和页面控件，不通过内部 setter 实现业务操作。
- Windows harness 使用系统 Microsoft Edge；以 SwiftShader 运行 WebGL，降低机器 GPU 差异。需已安装 Edge。
- GitHub Actions 的 Linux CI 使用 Playwright Chromium，工作流自动安装所需浏览器。
- Dev-only `window.__BUILDING_HARNESS__()` 返回只读相机和场景快照。生产构建不开放该入口。
- 机器结果：`artifacts/harness/results.json`；截图：`artifacts/harness/*.png`。
- 失败时生成 `test-results/` 内截图和 trace；HTML 报告可通过 `npx playwright show-report` 查看。
- Playwright 自动启动开发服务器，已有正确预览时复用；CI 设置 `CI=1` 时强制启动独立服务器。

验证记录见 [docs/verification.md](docs/verification.md)。

## 数据和资产边界

当前没有原始 BIM 文件与 IoT 接口，使用参数化几何及固定演示指标，界面明确标注。楼层结构采用重复办公层示意，切换楼层会更新对应的设备编号和空间语义，并不代表工程测绘数据。设备总数包含各楼栋 1,146 台及公共区域 100 台。告警列表包含当前告警和历史告警演示记录。

真实项目接入时，用 BIM 导出的 glTF/GLB 资产替换 `src/scene.ts` 中的参数化生成部分，并以稳定的楼栋、楼层、房间与设备 ID 关联实际 IoT 数据。无需改变 OrbitControls 交互及两种视图的状态管理。当前未实现 BIM 文件上传、IFC 语义解析或实时接口连接。

## 文件分工

- `src/scene.ts`：几何、相机、旋转控制、拾取、图层和 GPU 资源清理。
- `src/main.tsx`：导航、面板、楼栋/楼层/设备状态、错误处理。
- `src/Chart.tsx`：图表生命周期、趋势及能耗占比。
- `src/data.ts`：演示楼宇和设备定义。
- `src/style.css`：大屏与响应式布局。

## 自动发布

`.github/workflows/pages.yml` 在每次推送 `main` 时校验 OpenSpec、运行 9 项交互 harness、构建并部署 GitHub Pages。依赖由 `package-lock.json` 锁定；官方 actions 固定 commit SHA。

Pages 的仓库子路径由 `PAGES_BASE_PATH` 指定。本地开发默认 `/`，继续使用 4187 端口。

复验生产站点：

```powershell
$env:PRODUCTION_URL = 'https://guangfubill-crypto.github.io/smart-building-twin/'
npm run harness:production
Remove-Item Env:PRODUCTION_URL
```

生产验收会检查真实画布拖拽、楼层、设备详情、导航、资源 HTTP 状态及控制台错误，并确认开发诊断入口未暴露。
