# 云境 · 智慧医院数字孪生

基于用户提供的项目白模 DWG，恢复塔楼、围合裙房、近邻建筑、周边城市与场地，并提供可关闭的原创现代医院外观方案、真实旋转和28个2.5D楼层方案示意。新增造型、材质和室内尚未按实景核准。React / TypeScript / Vite / Three.js / ECharts。

## 在线使用

[打开医院数字孪生（中/英）](https://guangfubill-crypto.github.io/smart-building-twin/)。访问者无需安装 Node.js，使用现代浏览器即可操作模型。

源码仓库：[guangfubill-crypto/smart-building-twin](https://github.com/guangfubill-crypto/smart-building-twin)。

右上角提供“中文 / English”切换，默认中文并记住选择。导航、图表、场景标签、楼层设备、天气和帮助支持英文；切换保留当前模型视角、楼层和设备详情。两种语言都显示Asia/Shanghai时间，真实源文件名和设备ID不翻译。

打开外景即按深圳日夜自动显示太阳/阳光或月亮，无需点击预览；初始/复位视角包含低空天体，阴雨天气降低亮度。天体位置与月相为展示设计，未经真北或天文校准；天气卡片和北京时间保持真实。可选“日照预览”和“观察太阳”用于夜间体验晴天日照，预览明确标记非实时，“返回实时天气”恢复自动日夜。关闭天气效果恢复静态灯光预设。

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
| 查看完整白模 | 观察原城市与场地完整范围，复位返回医院主体 |
| 点击塔楼、裙房或分区标签 | 选择分区并联动信息面板 |
| 2.5D 楼层 / 进入楼层 | 查看当前楼宇楼层示意图 |
| 点击设备标签或告警记录 | 打开设备详情 |
| 右侧楼层条 | 切换楼层，与下拉选择同步 |
| 楼层设备分类 / 全部系统 | 筛选点位或恢复全部设备 |
| 图层设置 | 控制原创医院方案、设备点位、周边建筑及天气效果 |
| 原创医院方案 | 默认开启；关闭回看源形体与原材质方案，相机保持不变 |

## OpenSpec + harness

```powershell
npm run spec:validate
npm run build
npm run harness
```

- OpenSpec：`openspec/config.yaml`、`openspec/specs/` 和 `openspec/changes/archive/`。
- Harness：`harness/building.spec.ts`、`harness/hospital-design.spec.ts`及`harness/weather.spec.ts`。测试使用实际鼠标、滚轮、键盘和页面控件，不通过内部 setter 实现业务操作。
- Windows harness 使用系统 Microsoft Edge；以 SwiftShader 运行 WebGL，降低机器 GPU 差异。需已安装 Edge。
- GitHub Actions 的 Linux CI 使用 Playwright Chromium，工作流自动安装所需浏览器。
- Dev-only `window.__BUILDING_HARNESS__()` 返回只读相机和场景快照。生产构建不开放该入口。
- 机器结果：`artifacts/harness/results.json`；截图：`artifacts/harness/*.png`。
- 失败时生成 `test-results/` 内截图和 trace；HTML 报告可通过 `npx playwright show-report` 查看。
- Playwright 自动启动开发服务器，已有正确预览时复用；CI 设置 `CI=1` 时强制启动独立服务器。

验证记录见 [docs/verification.md](docs/verification.md)。
公网发布与复验记录见 [docs/release.md](docs/release.md)。

## 数据和资产边界

主体几何来自用户提供的 `项目白模.dwg`，保留原网格584的塔楼与围合裙房；周边恢复249–260、263、392–395、562、575、580共20个源网格。主体约272KB，周边派生GLB约6.25MB；原DWG与解码JSON不在公开仓库中。两份资产沿用同一比例、坐标轴与主体anchor，不分别归一化或居中。塔楼、裙房是同一建筑的A/B分区。

资料给出地上 18 层＋地下 2 层、裙房约 6 层、改造面积 28,426 m²、投资 2.87 亿元；塔楼 13/14 层保留原有功能，地下只部分改造。按结构塔楼 69.5 米等比校准白模；包含屋顶构件的高度约 73.91 米、包围盒约 72.59×52.29 米，与资料 70×38 米存在差异，未强行拉伸。资料高度与层数不等于已验证的网格测绘或楼层语义。

源形体视图不添加无源造型，城市/地面/场地沿用源网格。按用户新授权，默认原创医院方案在源体量上增加真实幕墙框、遮阳翼、层间带/灯带及玻璃门厅雨棚；关闭“原创医院方案”恢复原源形体和材质。这些构件和玻璃/石材/场地材质都是未核实设计，不能代替实际照片或竣工模型。DWG单位头标米但结构高度205坐标单位，与资料69.5m冲突；目前沿用资料统一校准，不称已核准的现场一比一尺寸。医院名称尚未提供，未填写机构名称。地下形体与全部2.5D平面未经验证，楼层和设备数据为演示；没有实时BIM/IoT/临床数据连接。演示设备总数包含A/B分区1146台和公共区域100台。

原创构件和窗/面板/粗糙度纹理由项目生成，不依赖付费医院资产。详细方案见[docs/original-hospital-design.md](docs/original-hospital-design.md)。深圳天气来自Open-Meteo当前天气模型，页面可查看来源和数据时间；北京时间每秒更新。

来源与许可见 [public/assets/CREDITS.md](public/assets/CREDITS.md)，校验与尺寸清单见 [public/assets/project-model.json](public/assets/project-model.json)。可用 LibreDWG 0.14 将原始 DWG 导出 JSON，再以 Python 标准库脚本复现派生网格：

```powershell
python scripts/convert-white-model.py decoded.json 项目白模.dwg
python scripts/convert-white-context.py decoded.json 项目白模.dwg
```

周边转换需先`npm ci`，复杂CAD面使用锁定Three.js Earcut；精确分割一处自交，逐瓣检查覆盖面积，四个零面积面不输出。`project-context.json`保留输入/输出哈希、各对象角色/范围/计数及修复记录。

内部参考方案采用灰色开放楼板、白色外墙与集中核心筒、双侧楼梯、青色设备图标和右侧楼层条；保留真实旋转与缩放。六类设备卡片的数量来自当前六个演示点位，并非实际设备台账。

A区1–18/B1/B2、B区1–6/B1/B2共28个楼层上下文各有独立的方案布局。外围房间的数量、跨度、隔墙和门洞按层变化，设备位置与详情随当前方案同步。各分区核心筒保持上下对齐；内部平面仍为示意，未核实临床功能。

静止视角不重复绘制，操作、巡航或图层变化会刷新画面。高像素密度设备的渲染倍率上限为 2；资源由本地包加载，并在场景销毁后释放。Vite 忽略验收生成的截图、trace 和报告目录，避免 Windows 文件锁干扰预览。

## 文件分工

- `src/scene.ts`：相机、旋转控制、拾取、图层和 GPU 资源清理。
- `src/i18n.tsx`：中英词典、语言偏好及保持React节点身份的文本本地化；场景使用setLanguage原位更新标签。
- `src/floorLayouts.ts`：按分区/楼层解析唯一方案，包括楼板、核心筒、房间/门洞和设备位置；场景与界面共同使用。
- `src/floorGeometry.ts`：将当前方案生成灰色楼板、白色隔墙/门洞与核心筒、楼梯的实体几何。
- `src/deviceSystems.ts`：六类设备名称与图标；分类数量来自楼层示意点位。
- `src/hospitalAsset.ts`：主体源GLB加载、源/原创方案切换和完整资源清理。
- `src/hospitalDesign.ts`：沿源立面剪裁的原创三维构件、门厅、窗/面板纹理与物理材质。
- `src/projectContextAsset.ts`：原周边/场地加载、共享源坐标、方案材质及失败/晚到资源清理。
- `scripts/convert-white-model.py`：源网格转换、三角化和来源校验清单。
- `src/architecture.ts`：环境反射/背景和纹理；旧程序场地、城市和景观生成器不再用于源白模场景。
- `src/main.tsx`：导航、面板、楼栋/楼层/设备状态、错误处理。
- `src/Chart.tsx`：图表生命周期、趋势及能耗占比。
- `src/data.ts`：项目分区、楼层改造范围与演示设备定义。
- `src/style.css`：大屏与响应式布局。

## 自动发布

`.github/workflows/pages.yml` 在每次推送 `main` 时校验 OpenSpec、运行30项交互与来源harness、构建并部署GitHub Pages。依赖由`package-lock.json`锁定；官方actions固定commit SHA。

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

## 深圳时间与天气

右上角显示每秒北京时间和深圳当前模型天气，点“深圳天气”查看数据时刻、湿度/风速/来源并手动刷新。固定城市坐标22.54554,114.0683，默认每10分钟从Open-Meteo更新，10秒超时；过期/失败保留明确状态，不编造实时读数。天气是模型数据，医院业务指标/室内仍是示意。

“图层设置”中的“天气效果”可切换深圳昼夜/晴雨展示与静态灯光方案。3D天空/玻璃反射/明暗/雾感联动，雨雪只在主体外景显示；楼层及完整白模视角停止降水。硬件雨雪动画提交上限24Hz，软件1Hz，软件总绘制提交上限4Hz，静止无降水仍不持续重绘。这是节流配置，不是实测帧率。源主体、周边/场地GLB与比例不变。

天气接口当前用于非商业演示；正式商业接入需相应授权服务/计划，勿在静态前端保存私密天气服务密钥。来源许可见`public/assets/CREDITS.md`。自动化天气验收使用固定时钟/API fixture，生产验收与原生截图使用实际API，不将fixture值当成实测天气。

## 楼层方案维护（实现）

通过`getFloorLayout(building, floor)`读取当前方案，消费方不修改缓存数据。几何和点位使用同一世界坐标，北侧为负Z；房间矩形包含面向公共走廊的门洞方向。实际图纸到位后应在这里替换对应楼层数据，避免界面和场景分别维护不同点位。

分区/楼层效果先夹取楼层上限，再调用BuildingScene选择和重建；跨层告警选中效果仍排在其后。楼层资源与长期场景资源分开管理，替换时释放旧几何、材质、灯光及设备DOM/监听器；嵌套图标root在React提交之后卸载。切层保留当前相机；退出楼层时清除控制器惯性并恢复保存的3D姿态。F4覆盖全部28个实际画面、确定性返回和资源数量，F5覆盖楼层详情与观察姿态联动。

建筑画质复查：运行 `node harness/capture-architecture.mjs` 捕获默认、滚轮放大和实际拖拽后的视角。可设置同一 `PRODUCTION_URL` 对线上版本截图；画质需要检查截图，不能仅凭三角形数量判断。

原生显卡截图可设置 `$env:NATIVE_GPU='1'` 后运行同一捕获脚本；不设置时继续使用 SwiftShader。
