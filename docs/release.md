# GitHub Pages 发布记录

## 2026-10-12 参考式内部楼层方案发布

- 已部署源码：`324bf94723928d67ef752fc08b69c008818cd0a8`。
- 成功工作流：[38248548303](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38248548303)。规格4/4，Linux Chromium/SwiftShader交互21/21（10.7分钟），构建11m29s、部署32s。
- 公网HTML已核对 `index-goHrCJ1q.js` / `index-CyYjBkyV.css`。
- 公网生产验收1/1（17.6秒）：真实旋转、复位、楼层条、13F保留范围、水系统筛选/点选详情、恢复全部及导航正常；四项资源HTTP200，控制台无错误，生产没有开发诊断入口。`interior-online.png` / `production-online.png` 已检查。

内部采用实体灰色圆角楼板、白色外墙/柱/核心筒及双侧楼梯，补充接触阴影与青色设备图标。右侧六类设备卡片支持筛选、楼层条同步选择，手机横向楼层条、平板独立场景行。外部DWG形体保持不变；内部布局和点位仍是设计示意，未填写医院名称、未接实际系统。OpenSpec和视觉QA记录已补齐。

体验：[新版医院方案](https://guangfubill-crypto.github.io/smart-building-twin/?v=324bf94)，进入后切换“2.5D 楼层”。

## 2026-10-12 项目白模医院立面发布

源码 `4008aa8`，成功工作流 [38243954958](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38243954958)：规格 4/4，交互 17/17（6.5 分钟），公网生产验收 1/1（16.2 秒）。HTML 产物 `index-DFEbwJP4.js` / `index-Ddj0XnoS.css` 已核对。原始 DWG 留在本地，站点使用去除城市、重复构件的源主体几何，并保留均匀比例、来源清单及设计示意边界。A 为 18 层塔楼，B 为 6 层裙房，地下两层为示意，13/14 层标明保留原功能；未写入医院名称。

体验：[项目白模医院版](https://guangfubill-crypto.github.io/smart-building-twin/?v=4008aa8)。

已发布并通过公网浏览器验收。

## 2026-10-12 医院素材接入发布

- 已部署源码：`c66abafb230176ac780e837173c9e867dd9952be`。
- 成功工作流：[38231930815](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38231930815)。Linux Chromium + SwiftShader **14/14 passed (5.1 min)**，构建任务 8m32s、部署 8s；规格校验及仓库子路径构建通过。
- 公网 HTML 已核对引用 `index-C9VpIb-A.js`、`index-6siKiiIz.css`。
- 真实公网生产 harness：**1/1 passed (25.7 s)**。医院 GLB 和三项环境/植被资源均 HTTP 200；实际拖拽、楼层设备、导航及复位可用，无控制台/资源错误，未暴露开发诊断入口。
- 公网另在 Edge / RTX 5090 原生 GPU 下验证真实拖拽像素变化、视角复位和空白区域不误选，四项资产 HTTP 200，浏览器无错误；未测量 FPS。
- 公网默认、近景、背面截图和 `artifacts/harness/hospital-native-overview.png` 已实际捕获并检查；设备/手机布局截图另由本地完整验收生成。

门诊主体使用 **Hospital model**，作者 **Er.B.Nijithkumar**，按 **CC BY 4.0** 保留署名和授权说明。素材为官方登录后提供的免费 GLB，无付费采购。源文件约 4.9 MB，包含原始作者/授权元数据；运行时隐藏原场地及外文机构标识，调整比例、玻璃材质并加入中文标牌。配套住院楼、医技楼、楼层布局和指标均是演示示意，未接入本院实际 BIM 或实时业务数据。详见 `public/assets/CREDITS.md`。

体验地址：[打开医院版](https://guangfubill-crypto.github.io/smart-building-twin/?v=c66abaf)。

## 2026-10-12 建筑夜景与沉浸式场景发布

- 已部署源码提交：`ad91b652813217c6b34f83c64304c3aadd7cb642`；应用运行代码与 `26bcdac` 相同，后续两次修正仅涉及验收等待方式及记录。
- 成功工作流：[38216463184](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38216463184)。Linux Chromium + SwiftShader **11 / 11 passed (7.2 min)**；构建任务 8m6s，部署 12s。规格校验与仓库子路径生产构建通过。
- 公网 HTML 已核对实际引用 `index-CnOG6jVV.js` 和 `index-CxIjskGN.css`。
- 真实公网生产 harness：**1 / 1 passed (18.1 s)**，场景三项本地资产均 HTTP 200，实际拖拽改变图像，楼层/设备、导航和复位可用，控制台及资源无错误，生产页面没有开发诊断入口。
- 公网另使用 Edge / RTX 5090 硬件 GPU 检查：实际指针拖拽改变像素，复位可用，三项资产 HTTP 200，页面与控制台无错误。硬件帧率未测量。
- 公网默认、放大、背面与硬件 GPU 截图已实际捕获并检查，位于 `artifacts/harness/architecture-*.png`；生产交互截图为 `production-online.png`。

本次更新包括明亮细框玻璃幕墙、稀疏暖色办公灯、真实弧形石材商业裙楼、天窗、叶片绿化、夜景反射与半透明浮动面板。全部保留真实几何及指针旋转。模型和业务数据仍明确标识为演示内容，建筑细节与参考图的专业 BIM 渲染仍有差距。

使用地址：[打开智慧楼宇](https://guangfubill-crypto.github.io/smart-building-twin/)。

## 2026-10-12 建筑画质增强发布

- 已部署应用源码提交：`620ac962ad8cc6371bbab967635ab5396d5f3244`。
- 成功工作流：[38161433088](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38161433088)。Linux + Chromium + SwiftShader 下 **10 / 10 passed (2.9 min)**，构建 3m35s，部署 11s。
- 公网 HTML 实际引用增强版产物 `index-Cbn2cQVL.js`，已核对，使用地址保持不变。
- 在真实 HTTPS 地址执行生产 harness：**1 / 1 passed (16.4 s)**。实际画布拖拽、楼层/设备、导航及视角复位通过；观察到的资源无 HTTP 错误，控制台无错误，开发诊断入口未暴露。
- 本地仓库子路径生产验收另通过 **1 / 1 (15.5 s)**。
- 线上截图 `artifacts/harness/production-online.png` 已检查；线上近景与旋转截图由 `PRODUCTION_URL=站点地址 node harness/capture-architecture.mjs` 再次捕获。

新模型包括四面玻璃幕墙、物理反射、办公室照明、屋顶机组、石材裙楼与入口、道路车辆、路灯和分层植被。静止时不重复 GPU 绘制，操作或巡航时刷新。它依然是参数化演示资产，未使用参考建筑的原始 BIM。

发布证据与截图的后续提交仅更新文档/图片，可使用 `[skip ci]`；线上应用仍是上面已通过全部检查的提交与产物。

- 公开源码：https://github.com/guangfubill-crypto/smart-building-twin
- HTTPS 使用地址：https://guangfubill-crypto.github.io/smart-building-twin/
- 初次部署证据：https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38154702834
- 首次应用提交：`b916dfa5d05fabc58225cd25c63da7235bb4940d`

## 远端验证

GitHub Actions 在 Linux + Chromium 环境通过 OpenSpec strict validation、**9 / 9** 用户交互验收和生产构建，并完成 Pages 部署。首次构建 2m15s，部署 8s。Pages API 返回正确项目网址，HTTPS 强制启用。

在本机 Microsoft Edge 浏览器对**真实公网地址**执行 `npm run harness:production`，最终 **1 / 1 passed，6.5s**。该测试确认：

- 主界面和真实 Three.js 场景可加载。
- 实际鼠标拖拽改变画布图像。
- 2.5D 楼层及空调设备详情可使用。
- 导航切换和视角复位正常。
- 所有观察到的生产资源 HTTP 响应成功，无浏览器控制台错误或未捕获异常。
- 开发诊断接口 `window.__BUILDING_HARNESS__` 不存在于生产页面。

公网截图：`artifacts/harness/production-online.png`，已检查。等待图表入场动画完成后捕获。

GitHub 远端树检查确认未上传 `node_modules`、`dist`、`test-results`、`playwright-report`、`.env` 或机器专属结果 JSON。源码上传前检查未发现私钥或服务 token。CLI 凭据由已有 gh keyring/credential helper 提供，没有写入源码或工作流。

## 后续更新

本地修改后执行规格校验、构建与适用 harness，再 `git push origin main`。官方 Actions 使用固定 SHA，通过检查后自动发布 Pages。CI 使用 Node 22 和 Chromium，本机 Windows harness 默认使用 Edge。仓库 base path 仅在生产构建时注入，本地开发仍在 4187 端口。

站点是静态演示应用；访客无需安装开发环境。模型与 IoT 指标仍为明确标识的参数化演示内容。
