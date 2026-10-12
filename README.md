# 云境 · 智慧医院数字孪生

基于用户提供的项目白模 DWG，保留塔楼与围合裙房形体，制作可旋转的医院立面方案和 2.5D 楼层示意图。React / TypeScript / Vite / Three.js / ECharts。

## 在线使用

[打开医院白模方案](https://guangfubill-crypto.github.io/smart-building-twin/)。访问者无需安装 Node.js，使用现代浏览器即可操作模型。

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
| 点击塔楼、裙房或分区标签 | 选择分区并联动信息面板 |
| 2.5D 楼层 / 进入楼层 | 查看当前楼宇楼层示意图 |
| 点击设备标签或告警记录 | 打开设备详情 |
| 右侧楼层条 | 切换楼层，与下拉选择同步 |
| 楼层设备分类 / 全部系统 | 筛选点位或恢复全部设备 |
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
公网发布与复验记录见 [docs/release.md](docs/release.md)。

## 数据和资产边界

主体几何来自用户提供的 `项目白模.dwg`，保留原网格 584 的塔楼与围合裙房；原始 DWG 与解码中间文件不在公开仓库中。当前包内只含约 272 KB 的派生 GLB、来源校验清单及运行资源。塔楼、裙房是同一建筑的 A/B 分区。

资料给出地上 18 层＋地下 2 层、裙房约 6 层、改造面积 28,426 m²、投资 2.87 亿元；塔楼 13/14 层保留原有功能，地下只部分改造。按结构塔楼 69.5 米等比校准白模；包含屋顶构件的高度约 73.91 米、包围盒约 72.59×52.29 米，与资料 70×38 米存在差异，未强行拉伸。资料高度与层数不等于已验证的网格测绘或楼层语义。

玻璃、幕墙分格、入口雨棚、到达区、绿化与周边城市为设计示意。医院名称尚未提供，未填写机构名称。地下形体与全部 2.5D 平面未经验证，楼层与设备数据为演示；没有实时 BIM/IoT/临床数据连接。演示设备总数包含 A/B 分区 1,146 台和公共区域 100 台。

来源与许可见 [public/assets/CREDITS.md](public/assets/CREDITS.md)，校验与尺寸清单见 [public/assets/project-model.json](public/assets/project-model.json)。可用 LibreDWG 0.14 将原始 DWG 导出 JSON，再以 Python 标准库脚本复现派生网格：

```powershell
python scripts/convert-white-model.py decoded.json 项目白模.dwg
```

内部参考方案采用灰色开放楼板、白色外墙与集中核心筒、双侧楼梯、青色设备图标和右侧楼层条；保留真实旋转与缩放。六类设备卡片的数量来自当前六个演示点位，并非实际设备台账。

A区1–18/B1/B2、B区1–6/B1/B2共28个楼层上下文各有独立的方案布局。外围房间的数量、跨度、隔墙和门洞按层变化，设备位置与详情随当前方案同步。各分区核心筒保持上下对齐；内部平面仍为示意，未核实临床功能。

静止视角不重复绘制，操作、巡航或图层变化会刷新画面。高像素密度设备的渲染倍率上限为 2；资源由本地包加载，并在场景销毁后释放。Vite 忽略验收生成的截图、trace 和报告目录，避免 Windows 文件锁干扰预览。

## 文件分工

- `src/scene.ts`：相机、旋转控制、拾取、图层和 GPU 资源清理。
- `src/floorLayouts.ts`：按分区/楼层解析唯一方案，包括楼板、核心筒、房间/门洞和设备位置；场景与界面共同使用。
- `src/floorGeometry.ts`：将当前方案生成灰色楼板、白色隔墙/门洞与核心筒、楼梯的实体几何。
- `src/deviceSystems.ts`：六类设备名称与图标；分类数量来自楼层示意点位。
- `src/hospitalAsset.ts`：白模派生 GLB 加载、方案幕墙材质、杆件和模型资源清理。
- `scripts/convert-white-model.py`：源网格转换、三角化和来源校验清单。
- `src/architecture.ts`：程序纹理、反射环境、医疗到达区和示意景观。
- `src/main.tsx`：导航、面板、楼栋/楼层/设备状态、错误处理。
- `src/Chart.tsx`：图表生命周期、趋势及能耗占比。
- `src/data.ts`：项目分区、楼层改造范围与演示设备定义。
- `src/style.css`：大屏与响应式布局。

## 自动发布

`.github/workflows/pages.yml` 在每次推送 `main` 时校验 OpenSpec、运行 23 项交互与来源 harness、构建并部署 GitHub Pages。依赖由 `package-lock.json` 锁定；官方 actions 固定 commit SHA。

Pages 的仓库子路径由 `PAGES_BASE_PATH` 指定。本地开发默认 `/`，继续使用 4187 端口。

本地模拟仓库子路径时，构建和预览进程都需要相同的环境配置。临时使用4188端口，在另一个终端运行`npm run harness:production`：

```powershell
$env:PAGES_BASE_PATH = '/smart-building-twin/'
npm run build
npm run preview -- --port 4188 --strictPort
```

复验生产站点：

```powershell
$env:PRODUCTION_URL = 'https://guangfubill-crypto.github.io/smart-building-twin/'
npm run harness:production
Remove-Item Env:PRODUCTION_URL
```

生产验收会检查真实画布拖拽、楼层、设备详情、导航、资源 HTTP 状态及控制台错误，并确认开发诊断入口未暴露。

## 楼层方案维护

通过`getFloorLayout(building, floor)`读取当前方案，消费方不修改缓存数据。几何和点位使用同一世界坐标，北侧为负Z；房间矩形包含面向公共走廊的门洞方向。实际图纸到位后应在这里替换对应楼层数据，避免界面和场景分别维护不同点位。

分区/楼层效果先夹取楼层上限，再调用BuildingScene选择和重建；跨层告警选中效果仍排在其后。楼层资源与长期场景资源分开管理，替换时释放旧几何、材质、灯光及设备DOM/监听器；嵌套图标root在React提交之后卸载。切层保留当前相机；退出楼层时清除控制器惯性并恢复保存的3D姿态。F4覆盖全部28个实际画面、确定性返回和资源数量，F5覆盖楼层详情与观察姿态联动。

建筑画质复查：运行 `node harness/capture-architecture.mjs` 捕获默认、滚轮放大和实际拖拽后的视角。可设置同一 `PRODUCTION_URL` 对线上版本截图；画质需要检查截图，不能仅凭三角形数量判断。

原生显卡截图可设置 `$env:NATIVE_GPU='1'` 后运行同一捕获脚本；不设置时继续使用 SwiftShader。
