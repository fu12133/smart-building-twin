# Verification — rotatable-building-twin

本文保留各阶段的历史验收记录；最新行为与证据见文末“中英文切换（2026-10-15）”，早期重复楼层和程序外观/周边的描述不代表当前版本。

Result: passed for the implemented local demo scope.

GitHub Pages 发布与公网验证另见 [release.md](release.md)。

## 2026-10-12 architectural rendering enhancement

The visual enhancement replaces flat blue blocks with continuous four-sided curtain walls, procedural 1024×2048 facade/interior maps, physical glass clearcoat and PMREM sky/city reflections. Instanced mullions and fins retain detail while orbiting. The model adds crown lighting, rooftop HVAC/fans, entrance canopies/steps, terraced stone podiums, skylights, planted roofs, layered tree crowns, hedges, benches, lamp pools, cars and road markings. A directional shadow map is refreshed only when static scene visibility changes. Geometry, shared materials, instance buffers, procedural textures and environment/shadow render targets are disposed on scene destruction.

Validation: full interaction harness **9 / 9 passed (1.8 min)** on Windows Edge + SwiftShader. After the final instance-buffer cleanup adjustment, the context-loss/recovery scenario passed again (**1 / 1, 13.3 s**). Strict OpenSpec validation passed for all three baselines and the change. The `/smart-building-twin/` production build passed TypeScript and Vite bundling.

The first cloud release attempt (`38160141806`) passed eight scenarios, but V1 exceeded the 45-second test budget during the final screenshot. Its trace confirmed camera and pixel-change assertions had passed before screenshot timeout. Rendering now invalidates on actual control/scene changes instead of redrawing a stationary scene continuously; distant buildings use simpler standard PBR glass, while selectable towers retain clearcoat. Harness readiness checks the first completed render plus nonempty geometry. All original nine scenarios passed again on this final renderer. Added V7 passed independently (**1 / 1, 8.6 s**): idle frame count stays fixed, actual zoom produces a fresh render, and hiding surroundings produces different canvas pixels. Pixel comparison is deliberate: the renderer's triangle counter also includes shadow passes and is not a reliable layer-reduction metric. Production build and strict validation passed again; all ten scenarios run in the publishing workflow.

Cloud attempt `38160937871` passed nine scenarios, including V7; V1 again hit its whole-test 45-second budget. The CI-only V1 budget is now 90 seconds for cold software rendering and three explicit screenshot captures; camera/pixel assertions are unchanged. Traces retain DOM snapshots, network, console and sources, while disabling the redundant continuous screencast. Explicit before/after canvas and overview screenshots continue to provide visual evidence. These acceptance tests verify rendering and interactions, not real hardware frame rate.

Final cloud run **38161433088 passed all 10 / 10 scenarios (2.9 min)**, including V1 in 40.5 s and V7 in 9.9 s, then built and deployed successfully. The exact new JS asset was observed in live HTML. Production harness on the actual public HTTPS site passed **1 / 1 (16.4 s)**, with no console/resource errors and no development accessor. The public overview screenshot was visually inspected. See `docs/release.md` for deployment links and source revision.

Visual inspection covers desktop default/rotated, phone, zoomed facade and reverse-angle screenshots. Default and rotated views show detailed glass on different sides, illuminated rooms, white framing, rooftop detail and landscaped ground; zoom retains visible framing and interior detail. Floor/device interactions remain usable. The 1600×1000 visual capture includes the complete dashboard; the standard 1440×900 harness asserts panel bounds. Hardware GPU frame rate remains unmeasured; these software-rendered tests validate behavior, not a claim of 60 FPS. The model is more detailed but remains procedural, without the source building's surveyed geometry or photoreal production assets.

Additional reproducible evidence: `node harness/capture-architecture.mjs` generates `architecture-overview.png`, `architecture-closeup.png` and `architecture-reverse.png` under `artifacts/harness/`, using only actual wheel/pointer controls and checking for browser errors.

## 2026-10-12 Architectural night scene

The user's second visual review rejected the previous miniature/block-like appearance. This change replaces per-pane bevel gradients with broad reflective facade bands and sparse small office lights, fine white mullions, a real extruded curved commercial podium, pitched skylights, warm fixtures, planted islands and alpha-cut leaf sprays. Desktop uses a full-workspace scene with translucent floating data panels. Mobile retains the stacked view. Rendering uses a multisampled HDR target on hardware GPUs and FXAA on detected software GPUs, quarter-resolution restrained bloom and tone mapping; stationary views still stop GPU redraws.

Three local CC0 texture assets total approximately 2.3 MB; official source/license links are in `public/assets/CREDITS.md`. Download MD5 hashes match the official metadata. The app makes no runtime asset API call. Vite base paths apply to all three textures. PMREM targets, HDR input textures, foliage textures, instanced buffers and postprocessing targets are disposed with the scene; assets arriving after unmount are discarded.

Validation so far: all ten existing scenarios passed with the final multisampled renderer (**10 passed**, 1.9 min run also contained one new test failure). The initial V8 test attempted to call the development accessor during React's teardown/recreation gap; its poll now waits for a present accessor rather than throwing. Focused V2 + V8 then passed **2 / 2 (27.8 s)**: final desktop panel bounds/reset and an intentionally delayed HDR completing after reload leave one usable renderer with no unexpected browser errors. Production-path build and strict OpenSpec validation passed. The repository-prefix production harness passed **1 / 1 (22.9 s)**, including all three locally packaged asset URLs, real rotation, floor/device controls and no browser errors. An earlier preview attempt omitted the Vite base setting and served HTML at texture URLs; restarting only the task-owned preview with the correct base resolved the verification setup. A later full regression found the compact footer overlapping the desktop cruise button. Noninteractive footer/breadcrumb overlays now pass pointer events through to scene controls. V3 passed again **1 / 1 (17.7 s)**. The in-progress mixed run was stopped after the CSS repair. A fresh complete run on the final source passed **11 / 11 (2.0 min)**, including both desktop cruise scenarios, responsive views and V8. Linux CI independently verifies the published source. Public-site checks are recorded in the release entry after deployment.

Visual inspection checked default, close and reverse angles, floor/device detail and phone layout. An initial overexposed lighting setup was corrected before release. The model remains procedural and its architectural detail does not fully reproduce the reference's production BIM render. Cloud run `38164376409` passed seven scenarios, but V1/V2/V4 exceeded their whole-test budgets during screenshot/transition work, and V8's fixed six-second delay expired before the slow GPU completed initialization. Traces confirmed real rotation/reset and equipment assertions before the timeouts. The renderer now avoids expensive floating-point multisample resolves on software GPUs, retains FXAA edge smoothing, uses smaller bloom buffers, instances all tree branches, and computes damping from elapsed time rather than a fixed per-frame tail. Hardware retains multisampling. V8 now gates the actual HTTP response until the user-facing reload action has completed; it does not assume a machine speed. CI whole-test budgets are 90 seconds for cumulative software rendering/captures, with the same interaction/pixel assertions and 12-second expectation budget. The optimized renderer and gated V8 passed all **11 / 11 locally (1.5 min)** before the final elapsed-time damping adjustment. After the elapsed-time damping adjustment, the final complete local harness again passed **11 / 11 (1.5 min)**. The repository-prefix production build and strict OpenSpec validation passed. Cloud/public validation is recorded in the release entry. No physical GPU frame-rate claim is made.

## 2026-10-12 Hospital campus asset integration

The user identified the project as a hospital and authorized using hospital art assets. The official free Hospital model by Er.B.Nijithkumar was downloaded after the user completed Sketchfab login. The browser transfer failed with a download error; the exact authorized download URL exposed in that task's download record was used to retrieve the GLB, without extracting session cookies or credentials. The checked-in file is 4,873,260 bytes with SHA-256 `dfd931413e481dea327d57bfcda54ee709f753178d533619384373bbd0729ead`; its embedded author/license metadata matches CC BY 4.0. Credits and runtime modifications are documented in `public/assets/CREDITS.md` and visible in the footer.

The imported low-rise hospital is the outpatient illustration (A/3 demonstration floors), accompanied by procedural inpatient (B/6) and medical-tech (C/4) buildings. Original ground/road and foreign institution text are hidden; normalization preserves proportions. Glass response and Chinese signs are adapted. Original animation is not played. All hospital rooms, floor layouts and indicators remain synthetic. Native Edge rendering was checked at 1600×1000, without browser errors. Desktop model framing, floor/device details and phone screenshots were visually inspected. Initial and late-loaded resources are disposed with the existing BuildingScene, including imported textures/ImageBitmaps.

The initial regression passed 10/11 but found a stale alarm target at A/12, outside the new hospital floor limits. It now targets A/2 and location requests clamp before committing selection. Focused delayed-hospital reload and invalid-model recovery tests passed **2/2 (20.6 s)**. The repository-prefix build and strict validation passed. Local production harness passed **1/1 (27.0 s)**, including hospital.glb and the three environment/foliage resources. A later regression reached 12/13 but its V7 context close failed with a missing trace file because a concurrent production harness reset the shared output directory; production now has an independent `test-results-production` directory, excluded from Git. A standalone final full harness is run after this configuration repair; its result and public release evidence are recorded below once observed.

Final standalone local harness: **13/13 passed (2.2 min)**, including cross-building alarm A/2, delayed hospital completion after reload, and malformed model recovery. No unexpected browser errors. The visual capture script now waits for the visible hospital-ready state before screenshots. Linux CI and the actual public URL are verified before final release/archiving.

Final manual pointer review reproduced an imported-asset issue: after selecting C, clicking empty foreground incorrectly selected A because hidden source ground still participated in raycasting. Picking now rejects intersections with invisible objects or ancestors, also respecting hidden equipment geometry. H3 repeats this actual foreground click through the canvas; a fresh full regression includes all 14 scenarios. The earlier publishing run was canceled before deployment while this repair was verified.

After the picking repair, the full standalone local harness passed **14/14 (2.7 min)**. H3 passed (7.6 s); the same run passed delayed hospital completion and malformed-model recovery without unexpected browser errors. Final repository-prefix build produced `index-C9VpIb-A.js`, and strict validation passed all three baselines plus the active change.

Cloud run **38231930815 passed all 14/14 (5.1 min)** and deployed successfully. H1 passed in 23.0 s, H2 in 20.7 s, H3 in 12.2 s. Live HTML was checked for the exact expected `index-C9VpIb-A.js`. Actual public production harness passed **1/1 (25.7 s)** with all four local scene assets HTTP 200, real pointer/floor/device interactions, no browser/resource errors and no development accessor. Public default/close/reverse views were captured and inspected. Native Edge / RTX 5090 verification on the same public URL passed pointer pixel change, reset, visible medical-tech selection retention after an empty-ground click, four asset responses and browser-error checks. The final `hospital-native-overview.png` comes from this public hardware-rendered page. FPS and physical touch gestures remain unmeasured. The completed hospital change is archived after this evidence.

## Original automated evidence (initial release)

Cloud run `38214620444` passed **9 / 11 (7.1 min)**. V1 exhausted its 90-second cumulative budget; V8 exhausted the 12-second initial-frame wait before entering the recovery sequence. The harness now distinguishes cold software-GPU initialization (45-second CI wait) from UI assertions (unchanged 12 seconds), captures bounded page clips instead of scrolling the canvas locator, and uses eight real pointer moves over the same displacement. Camera displacement and pixel-change assertions are unchanged. V1/V8 allow 120 seconds for cumulative initialization/captures. Both revised scenarios passed locally **2 / 2 (22.2 s)**. The production application code remains unchanged from `26bcdac`.

Downloaded traces further confirm that V1's camera and pixel-change assertions completed before the final screenshot timeout; the after-drag canvas capture consumed approximately 49 seconds. This was cumulative capture time, not a failed rotation assertion. A local repository-path production check passed again **1 / 1 (16.1 s)**. Native hardware verification used Edge with ANGLE/NVIDIA GeForce RTX 5090 Direct3D11: actual pointer drag changed rendered pixel hashes, the visible reset control worked, and no page/console errors were observed. `architecture-native-gpu.png` was captured at 1600×1000 and visually inspected. Hardware FPS was not measured.

Run `38215635693` passed **10 / 11 (7.2 min)**, including V1 (84.7 seconds) and V8 (33.4 seconds). V6's post-recovery first-frame poll still used the UI wait budget and timed out. It now consistently uses the same cold GPU initialization budget as the other first-frame waits; recovery UI and browser-error assertions remain unchanged.

Final recovery check passed locally **1 / 1 (12.9 s)**. Cloud run **38216463184 passed all 11 / 11 (7.2 min)**, including V6 (37.1 s) and V8 (33.5 s), followed by successful build and Pages deployment. Live HTML matches the expected `index-CnOG6jVV.js`. Actual public production harness passed **1 / 1 (18.1 s)** with all three assets HTTP 200, no browser/resource errors and no production diagnostic accessor. Public default/close/reverse screenshots were inspected. Native Edge / RTX 5090 testing was then repeated on the actual public URL: actual pointer pixel change, reset and asset responses passed without browser errors. The final `architecture-native-gpu.png` is captured from this public hardware-rendered page; FPS remains unmeasured. The completed change is archived after these checks.

`npm run build` passed TypeScript validation and production bundling. `npm run spec:validate` passed OpenSpec strict validation. `npm run harness` passed **9 / 9** acceptance tests in **20.8 s**, using Microsoft Edge headless + SwiftShader on Windows. The final run produced no unexpected browser console errors or uncaught exceptions.

| Requirement | Evidence |
| --- | --- |
| Real WebGL rotation | V1 uses an actual pointer drag; camera coordinates change by more than 20 world units and canvas screenshot hashes differ. Rendered geometry has more than 1,000 triangles. |
| Zoom, pan, keyboard and reset | V2 performs wheel zoom, right-button pan and ArrowLeft; reset returns within 0.01 world units of the initial pose. |
| Pause/start巡航 | V3 observes rotation while running, then verifies positional drift below 0.05 after pausing. |
| Building / floor / device linkage | V4 chooses B座 through its label, opens 12F, selects a smoke detector and verifies B-12F-SMK-03; returns to saved 3D pose. |
| Layers / mode preferences | V5 hides and restores equipment labels, hides surrounding geometry, disables巡航 in 2.5D and restores its 3D preference. |
| Navigation / alarm location / floor limits | D1 switches energy/access/equipment panels; verifies alarm detail, clamps C座 to 20F, then locates A-12F-AC-01 from another building and floor. |
| Responsive controls | D2 validates 768×1024 and 390×844, checks no horizontal overflow and uses floor/device/3D controls. V2 additionally verifies all desktop side panels fit 1440×900. |
| Graphics recovery | V6 injects the browser context-lost event, checks the recovery UI and verifies scene initialization after reload. WebGL creation failure is handled by the constructor catch; it was not independently fault-injected. |
| Honest sources | Harness verifies the visible demo-data label; model-source note remains visible in the header. |

Machine-readable evidence: `artifacts/harness/results.json`.

## Visual evidence

- `artifacts/harness/overview-desktop.png`: 1440×900 default overview; all panels fit; model roof and building labels are visible.
- `artifacts/harness/rotated-desktop.png`: changed viewing angle after actual pointer drag.
- `artifacts/harness/floor-device-desktop.png`: 2.5D room geometry, equipment marker and details.
- `artifacts/harness/overview-768.png`: tablet layout.
- `artifacts/harness/overview-390.png`: phone layout, complete scrollable page.

The desktop, floor-device and phone screenshots were visually inspected. Compared with the supplied references, the implementation preserves the blue night scene, glass-building grid, surrounding massing, green landscaping and operational data panels. It uses a clearer dashboard frame and schematic geometry. It is **not** a geometrically faithful reproduction of the reference building, because no source BIM asset was supplied.

## Defects found and resolved

1. Tall narrow canvases cropped geometry: adaptive camera distance now uses canvas aspect ratio.
2. Reset applied residual OrbitControls movement: pending deltas are cleared before pose restoration.
3. Pause retained damped drift: pending control movement is cleared while preserving the current pose.
4. Fixed-height desktop panels extended below the screen: compact spacing is applied at desktop heights up to 1000px; an acceptance assertion checks panel bounds.
5. Cross-building alarm location could clear selection in a floor effect: device selection is committed after building/floor/mode transitions, with a regression assertion.
6. Missing favicon caused console 404: local favicon is supplied. External font dependency removed.

## Remaining scope and dependency notes

- Geometry, IoT values and alarms are explicitly synthetic. Repeated floor diagrams provide demonstration semantics, not engineering BIM accuracy.
- Full automated WebGL acceptance uses software rendering. Native RTX 5090 rendering and pointer pixel changes were separately checked; hardware FPS and physical touch-device gestures remain unmeasured.
- `npm audit --omit=dev`: 0 vulnerabilities. Full audit reports 4 high-severity entries in OpenSpec's transitive `fast-glob → micromatch → braces` development-tool chain. Registry version 3.0.3 of braces has no patched replacement in the current dependency tree; avoid running the CLI against untrusted pathological glob input. This dependency is excluded from the browser production bundle.


## 2026-10-12 项目白模医院方案

- 用户提供 `项目白模.dwg`，SHA-256 `bdab765f1b3c4a486557809395292e1295641687490bcb85f8bc509a6055e564`，3,257,817 bytes，AC1032。LibreDWG 0.14 成功解码 573 对象、42 个 MESH；未将原 DWG/中间 JSON 上传仓库。
- 三维网格检查识别主体 584，以及城市 263、地面 392、位移副本 566 等。保留连接塔楼/围合裙房 584；另外的 564/568/569 与主体幕墙重叠，实际反向截图出现 z-fighting，移除这些重复网格后反向截图稳定。方案细分幕墙杆件沿源塔楼四角生成。
- 转换脚本只需 Python 标准库，等比 scale=69.5/205；输出 271,584 bytes、2,783 triangles，GLB hash `c71ab31043f9c092247c3547537ab76ad91b2ebe70028129e261e4aa09db1e36`。转换模型含屋顶构件约 73.91 m，包围盒 72.59×52.29 m，和资料 70×38 m 不一致，已在帮助/来源清单中说明，没有非等比拉伸。
- 资料中的塔楼 18 层、裙房约 6 层、地下 2 层、改造面积 28,426 m²、投资 2.87 亿元、13/14 层保留原功能已接入 UI。层数来自资料，未验证白模层级；地下形体、各层平面均为示意；没有实时 BIM/IoT 接口。用户表示医院名称尚未提供，明确不填写。
- 第一轮 harness 14/15 passed；新增项目范围文本导致 900px 高屏右侧面板下边缘超出验收线 11px。缩减范围文本间距后相关 V2/W1 2/2 passed (14.3s)。另一次运行前 10 项通过后，Windows Vite 文件监视器在复制 `source-white-inspection.png` 时触发 EBUSY 退出，后 6 项连接失败；已忽略生成截图、trace 与报告目录，避免这些文件参与源码监视。
- 修复后完整 `npm run harness` **16/16 passed (1.6 min)**。追加真实网格拾取 W3，并将方案幕墙杆件外移 0.2 m，避免与源玻璃发生深度重叠；V1/W3 **2/2 passed (13.8s)**。新增来源 hash、源节点/分区、校准包围盒以及 18F/13F/14F/B2 的验收。
- `npm run spec:validate` **4/4 passed**；仓库子路径生产构建通过，预期主 JS `index-DFEbwJP4.js`、CSS `index-Ddj0XnoS.css`。
- Edge 原生 GPU **NVIDIA RTX 5090 / ANGLE D3D11** 实际捕获默认、滚轮近景和拖拽背面三张截图，已逐张检查，建筑完整可见，幕墙无此前反向重叠闪烁，入口/救护车/绿化可见，浏览器无错误；未测 FPS。公网结果待补。
# 白模版本公网验收（2026-10-12）

源码 `4008aa8` 已通过工作流 38243954958：规格 4/4，Linux Chromium/SwiftShader 17/17（6.5 分钟），构建任务 7m14s、部署 20s。公网 HTML 实际引用 `index-DFEbwJP4.js` 和 `index-Ddj0XnoS.css`，模型 manifest 的源 DWG 哈希、handle 584 和 GLB 哈希均与本地一致。公网生产 harness 1/1 passed（16.2 秒；用例 15.5 秒），实际指针旋转、复位、楼层设备定位及导航通过，无浏览器或资源错误。仓库子路径本地生产验收 1/1 passed（13.7 秒）。

# 内部参考方案验收（2026-10-12）

按用户参考重建实体灰色圆角楼板、白色外墙/柱/核心筒、楼梯、电梯设备间和青色 Lucide 图标点位；楼层仅为方案示意。增加六系统卡片筛选及有界楼层条，保留18/6/B1/B2、13/14功能范围与原始3D姿态恢复。Floor-only SSAO采用半分辨率8样本，生命周期由 BuildingScene 管理；改用 Three.js 当前实际支持的 PCFShadowMap。

规格严格校验 4/4；仓库子路径构建通过，最终产物 `index-goHrCJ1q.js` / `index-CyYjBkyV.css`。最终 Windows Edge/SwiftShader 全量 harness **21/21 passed（2.0 分钟）**，无浏览器 error：真实楼层旋转/滚轮及3D姿态恢复；18F切换B区夹到6F、地下层与保留楼层；分类与设备图层组合；告警取消不兼容筛选并打开正确设备；768/390布局、18F/13F点击及相机/楼层控件不重叠均通过。SSAO加入后的专门回归7/7（46.5秒）；视觉复查后对平板独立行与可用宽度适配再次跑完全量，以最后结果为准。

内置浏览器实际操作并捕获2048×996桌面和768平板，已打开原参考与实际截图的联合比较，完整视图、楼板/核心筒、设备卡片及修正前后均检查。灰度、构图、接触阴影、平板控件重叠和楼板遮挡已修正；390/768/1440最终截图已打开检查。详见 `design-qa.md`，最终结果 `passed`。核心筒隔间、室内点位未经实际图纸校准。

源码 `324bf94723928d67ef752fc08b69c008818cd0a8` 已通过 [工作流38248548303](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38248548303)：规格4/4，Linux Chromium/SwiftShader交互 **21/21 passed（10.7分钟）**，构建任务11m29s、部署32s。公网HTML实际引用 `index-goHrCJ1q.js` / `index-CyYjBkyV.css`。

真实公网生产验收 **1/1 passed（17.6秒；用例16.9秒）**：模型、HDR及两项植被资产均HTTP200，实际拖拽改变画面、复位、13F保留范围、给排水筛选/设备详情、全部恢复及主导航均通过；无控制台或资源错误，开发快照未暴露。公网 `interior-online.png` 和 `production-online.png` 已捕获并打开检查。内置浏览器本地视觉/交互验证完成；它在再次打开公网时多次超时，公网证据以已通过的真实Edge生产harness为准，没有将失败的内置浏览器尝试记为完成。

最终仓库子路径生产验收 **1/1 passed（15.1 秒；用例14.4秒）**：四项模型/环境资源HTTP200，实际拖拽改变像素、复位、13F保留功能、水系统筛选/点选详情、全部系统恢复及主导航通过；无控制台/资源错误，生产未暴露开发诊断入口。

两项变更现已归档；归档后主规格严格校验3/3通过。发布证据后续提交仅涉及文档与截图，应用运行代码仍为已验收的324bf94。

# 每层独立布局验收（2026-10-12）

最新请求为每一层布局不同。`floorLayouts.ts`统一提供A区1–18/B1/B2和B区1–6/B1/B2共28个确定的方案示意；房间数量、跨度、隔墙和门洞逐层变化，塔楼/裙房各自保留上下对齐的核心筒。设备位置、房间描述、告警和中文方案摘要使用同一布局数据。未提供室内CAD/BIM，不将此方案称为真实科室配置；13/14保留原功能范围不变。

BuildingScene切换时只替换楼层子树，立即清理旧几何/材质/灯光及点位DOM/监听器；嵌套图标root在当前React提交之后的微任务卸载，避免首轮测试捕获的同步卸载错误。相机观察姿态、系统筛选和设备图层保留，跨层告警仍在上下文效果之后定位。统一留白适配较宽裙房。

严格规格 **4/4 passed**，仓库子路径生产构建通过，JS `index-Bf34Dric.js` / CSS `index-CyYjBkyV.css`。最终Windows Edge/SwiftShader完整 `npm run harness` **23/23 passed（2.5分钟）**，无浏览器error。新增F4逐一用页面控件选择28个上下文，在截图时隐藏文字/面板叠层，实际三维画面28个哈希全部不同；回到A区1F后画面哈希完全一致，GPU几何数量与初值一致，DOM只保留6个当前点位。F5检查1F→2F设备房间更新、观察姿态不变、18F→2F告警和筛选恢复。原有旋转、精确3D姿态恢复、有界楼层、图层、保留楼层、故障恢复和390/768响应式验收全部通过。

已打开检查A区1F/18F、B区6F/B2及390手机截图，分区差异和门洞可见，核心筒层次、接触阴影、六点位和选择器清晰，无横向溢出。证据 `artifacts/harness/layout-A-1.png`、`layout-A-2.png`、`layout-A-18.png`、`layout-B-6.png`、`layout-B--1.png`、`layout-B--2.png`；布局检查记录见 `design-qa.md`。新增专项5/5（41.0秒），首轮React卸载错误修复后以最终全量结果为准。

仓库子路径本地生产验收 **1/1 passed（16.5秒；用例15.9秒）**：四项模型/环境资产HTTP200，真实拖拽/复位、1F与2F实际几何差异、1F设备房间、13F保留范围及分类/详情、导航通过，无控制台/资源错误，生产没有开发快照。第一次本地预览未给preview进程配置PAGES_BASE_PATH，资产请求等待超时；用正确`/smart-building-twin/`路径重启本任务4188预览后通过，没有修改运行代码或放宽断言。

源码`6c57c3a8a2575bcba152ed74fed9365f1941edd5`已通过[工作流38266496077](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38266496077)：严格规格4/4，Linux Chromium/SwiftShader **23/23 passed（9.5分钟）**，构建任务10m16s、部署19s。公网HTML已实际核对`index-Bf34Dric.js` / `index-CyYjBkyV.css`。

真实公网生产harness **1/1 passed（23.0秒；用例22.3秒）**：四项资产HTTP200，真实3D拖拽/复位，1F/2F几何画面不同，1F摄像机房间、13F保留功能和水系统筛选/详情、全部点位恢复、主导航通过；无控制台或HTTP错误，生产未暴露开发诊断入口。公网`interior-online.png`已打开检查，13F外围分区、核心筒、六点位及控件完整可见。

变更归档为`openspec/changes/archive/2026-10-12-distinct-floor-layouts/`，主规格已合入每层独立方案和点位联动要求，归档后严格校验 **3/3 passed**。后续提交仅为文档、验收截图及规格归档；已发布应用仍为6c57c3a运行代码。本任务临时4188预览已关闭，4187开发预览保留。

# 原白模周边与主体形体恢复（2026-10-14）

用户指出周边遗漏，并要求医院也按白模还原。旧转换仅导入主体584，用程序城市/场地替代源周边，还添加了幕墙杆件、入口/雨棚和景观。现已停用这些无源依据的外加造型，主体源GLB保持原哈希；恢复20个源周边/场地网格，统一坐标轴、比例与主体anchor，不独立居中或拉伸。增加“查看完整白模”，远景适配源圆形大场地及城市，减小远景雾密度；复位返回主体，楼层往返保留全景相机与呈现状态。原图层控制仅隐藏周边建筑，场地保留；实际周边遮挡不会穿透选择背后的医院分区。

原微信临时DWG路径已失效，从长期msg/file目录找到原始副本，SHA256与既有清单完全一致。源主体584共1445多边形，旧转换2783三角形，无非零面积有效面遗漏。源周边263有2133连通构件，575有32近邻构件；249–260、392–395、562、580提供场地。派生周边64799三角形，GLB哈希`fe974da4f73cea0c2c31efdf386373ce3dc7b6631cd595ed5f69c09f805d5468`；详见`project-context.json`。两块复杂场地面恢复：一块带桥接孔，另一块有自交，精确按源边界交点分瓣并核对覆盖面积；只跳过4个真正零面积面。原DWG与27.6MB解码JSON仍保留本地，不上传。

严格规格 **4/4 passed**，仓库子路径构建通过，JS`index-kqpIQF4K.js` / CSS`index-C7vJ3LjE.css`。本地Windows Edge/SwiftShader完整harness **30/30 passed（2.6分钟）**，无浏览器error。新增C1–C6共7项专项 **7/7（29.3秒）**：来源哈希/统一坐标/角色，完整源视角/图层/楼层精确返回，晚到资产和失效重载，768/390完整源视角，实际点击周边不选中背后医院且隐藏后不拦截。既有28个不同楼层、设备与告警、真实旋转和故障恢复全部通过。首次两项重载用例在页面尚未初始化时提前读取诊断函数，按实际初始化状态等待后通过，没有降低验收目标。

本地仓库子路径生产harness **1/1 passed（16.7秒，用例16.0秒）**：主体/周边/HDR三项资源HTTP200，真实指针旋转、完整源视角与复位、1F/2F几何差异、13F及设备/分类、导航正常，无控制台或资源错误，生产无开发诊断入口。停用程序绿化后不再加载叶片图集。

已打开检查默认、完整范围、场地独显、768/390及原生RTX5090/ANGLE D3D11的默认、滚轮近景、真实拖拽反向、隐藏周边后的主体反向截图。医院与原近邻建筑的遮挡符合源相对位置；图层隐藏后主体轮廓可单独核对。未测FPS。证据为`source-context-*.png`、`source-hospital-isolated.png`和`architecture-*.png`。完整场地的圆形边界来自源395，而非新建圆盘。

形体还原指提供的源模型，不是已核准的现场尺寸/材料/室内还原。DWG单位头标米，结构塔楼205坐标单位与资料69.5m矛盾；尺寸基准已向用户澄清，未收到答复前沿用既有69.5/205统一校准并在帮助/清单说明。实际材质和室内图纸仍未提供；28层平面和所有业务点位保持明确示意。

源码`af98732667327683ee3d177c975f660fc58a02e9`通过[工作流38527104608](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38527104608)：严格规格4/4，Linux Chromium/SwiftShader **30/30 passed（14.7分钟）**，构建任务15m35s、部署14s。公网HTML实际核对`index-kqpIQF4K.js`/`index-C7vJ3LjE.css`，周边清单64799三角形及输出/主体哈希与本地匹配。

真实公网生产harness最终 **1/1 passed（37.1秒，用例36.3秒）**：HDR、主体与周边三项HTTP200，实际拖拽、完整源范围/复位、1F/2F不同几何与设备房间、13F保留范围及分类/详情、主导航正常；无浏览器或HTTP错误，生产无开发快照。公网默认/完整白模截图`source-context-online-default.png`/`source-context-online-full.png`已打开检查，源城市、场地和主体可见。

首次公网测试在主体仍“加载中”时超过生产默认5秒初始化等待；主体资产初始化单独改为与周边相同的30秒窗口，业务交互和错误断言保持，重新实际执行后通过，没有把失败记为通过。该调整仅在生产验收脚本，运行应用仍为af98732。

已归档`openspec/changes/archive/2026-10-14-source-white-model-context/`，主规格合入来源周边/主体形体、全景及图层/生命周期要求，归档后严格校验 **3/3 passed**。已部署运行代码仍为af98732，后续仅为文档/证据/规格归档与生产测试初始化等待调整；本任务4188临时预览已关闭，4187开发预览保留。

## 医院照明、玻璃与深圳天气（2026-10-14）

最终范围包括用户先后要求的灯光、深圳实时钟/当前天气联动及玻璃质感。4个以源医院包围盒定位的SpotLight只作展示照明，不增加阴影通道/建筑网格；原有HDR/主阴影/ACES/Bloom继续负责层次，窗内暖光与源金属发光增强。玻璃改为物理介质材质（IOR1.5、清漆、高光和微法线），保留物理着色器标记及源UV/网格。主体/周边GLB哈希分别仍为`c71ab31043f9c092247c3547537ab76ad91b2ebe70028129e261e4aa09db1e36`与`fe974da4f73cea0c2c31efdf386373ce3dc7b6631cd595ed5f69c09f805d5468`。

天气固定深圳22.54554,114.0683，来源为[Open-Meteo当前天气模型](https://open-meteo.com/en/docs)，不是现场传感器实测。北京时间每秒更新；天气10分钟刷新/10秒超时，90分钟新鲜度判断；缓存、失败、过期状态明确。日照时段、天空/PMREM反射、雾和雨雪展示可通过“天气效果”开关停用，楼层/完整范围停止降水。旧天空纹理与环境目标及时销毁；软件总绘制上限4Hz、雨雪1Hz，硬件雨雪上限24Hz。这些是提交限额，不是实测FPS。静止无降水停绘和楼层白色照明保留。

最终严格规格 **5/5 passed**；仓库子路径构建通过，JS `index-wUEeyjtw.js`/CSS `index-CdW2Ckur.css`。本地完整harness **38/38 passed（3.7分钟）**：既有30项覆盖源资产/周边、真实旋转、28种楼层/设备、故障/晚到资源与空闲GPU；新增8项覆盖外国浏览器时区下北京时间秒钟、晴昼/夜像素与相机不变、雨滴关闭及楼层照明像素不变、完整范围停雨、错误/旧数据、超时晚到响应、10分钟自动刷新与768/390。

中间失败没有记作通过：雨天及指针阻尼提交曾积压软件GPU，已加入上述节流；初始天空CanvasTexture的等距背景缓存保留旧昼景，已改为按配置替换/销毁。旧V6重载用例曾在新页面诊断函数就绪前读取而报TypeError，改为等待当前页面实际初始化后完整38项复验通过，图形恢复和错误断言保持。

真实API的本地仓库子路径生产harness **1/1 passed（14.1秒，用例13.3秒）**：HDR/主体/周边HTTP200，天气API200、当前温度与UI匹配、数据时刻90分钟内，源/北京时间标识可见，无浏览器/HTTP错误；真实拖拽/全景/复位/不同楼层/设备/导航仍正常，生产没有开发诊断入口。`weather-live-local.png`显示实际模型数据2026/10/14 18:15、25.8°C，并不是验收fixture。

已打开检查最终原生RTX5090/ANGLE D3D11的默认、近景、主体反向截图（`architecture-*.png`/`source-hospital-isolated.png`）及天气昼/夜/雨、白色楼层、768/390详情与真实API截图。主医院暖窗/基部洗墙/地面光斑可见；旋转后冷色环境反射与侧面变化保留源形体，周边按源位置遮挡时可用图层单独检视主体。没有声称材质/灯光为已核实现场方案，也没有FPS测量。公网部署及结果将在实际完成后补记。

已发布运行源码`c293106d19da80ec72b0321cd19d2fd086846b3f`，成功[工作流38549493293](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38549493293)：严格规格5/5、Linux Chromium/SwiftShader **38/38（7.3分钟）**，构建7m59s、部署9s。公网HTML实际匹配`index-wUEeyjtw.js`/`index-CdW2Ckur.css`；来源清单64799三角形及主体/周边哈希与本地一致。

真实公网生产harness **1/1 passed（最终17.6秒，用例16.9秒）**。实际天气API200、数据新鲜、温度25.7°C与UI对应，天气详情来源/数据时刻（2026/10/14 18:30）和北京时间可见；三项场景资产200，无浏览器/HTTP错误，实际拖拽/完整范围/复位、1F/2F差异/13F设备/导航正常且生产诊断入口未暴露。已打开检查`weather-live-online.png`/`source-context-online-default.png`/`source-context-online-full.png`。首次公网运行16.4秒通过，但默认截图采样早于软件渲染队列呈现复位视角；在生产测试中为硬姿态截图增加1秒呈现等待后复验，最终默认截图与主体视角一致。该等待只影响验收脚本，运行源码保持c293106。

已归档`2026-10-14-hospital-display-lighting`及`2026-10-14-shenzhen-live-atmosphere`，基线合入灯光/玻璃、深圳天气及生命周期要求。首次归档后严格验证提示生命周期文本超过500字符，已在基线与归档中等义精简，并补全短proposal的Why；最终严格 **3/3 passed**。后续只保存归档、证据、文档和生产截图等待调整，已部署运行代码仍为c293106。4187预览保留，本任务4188已关闭。

## 原创现代医院外观方案（2026-10-14）

用户明确要求自行制作参考现代医院的模型。新增可关闭的原创外观：按源墙面三角形剪裁的1,626件真实幕墙框/珠白层间带/遮阳翼/灯带，以及一处带支撑玻璃顶的门厅雨棚和通用医疗符号。蓝灰玻璃使用物理反射/清漆，原创窗纹理1024×2048包含20个不同楼层行/窗内层次与粗糙度，珠白面板1024²。没有使用商家渲染图或付费医院模型；没有命名医院。来源/帮助明确区分新设计、原白模与内部示意，“图层设置→原创医院方案”默认开启，关闭可回看原源形体及材质方案。切换不重置相机，不替换源城市/场地或28种楼层布局。

主体/周边GLB哈希仍为`c71ab31043f9c092247c3547537ab76ad91b2ebe70028129e261e4aa09db1e36`及`fe974da4f73cea0c2c31efdf386373ce3dc7b6631cd595ed5f69c09f805d5468`。照明包围盒只计算源网格，新增实例不改变校准/位置基准；源材质与方案材质分开持有，销毁前恢复源引用以释放隐藏资源。沿用BuildingScene唯一渲染器/相机、真实拾取、GPU销毁与空闲停绘。

最终严格规格 **4/4 passed**，仓库子路径构建通过（JS`index-Cdfx_FNn.js`/CSS`index-CdW2Ckur.css`）。最终Windows Edge/SwiftShader完整harness **42/42 passed（4.6分钟）**，无失败/跳过；新增4项覆盖真实方案开关的像素/三角形变化且姿态不变、楼层往返偏好及多次资源稳定、真实拖拽、日间呈现/故障重载和768/390控件。原38项的源坐标、周边、28层/设备、真实旋转、晚到资源、空闲及深圳天气全部保留通过。

中间专项首轮3/4，未误报通过：初次楼层使用增加GPU几何36→194，原断言错误地与从未渲染楼层的基线对比；改为初次楼层往返后连续3次往返资源不增长，随后专项4/4（28.1秒）通过。完整首轮42/42（4.6分钟）通过后，修正实例几何对照明包围盒的干扰和父遍历覆盖灯带阴影属性，最终再次完整42/42通过。

本地仓库路径真实生产harness **1/1 passed（31.9秒，用例30.9秒）**：HDR/主体/周边HTTP200，实际深圳天气API200/数据时间和温度对应UI；真实方案开关画面变化、旋转/全景/复位、楼层/设备/导航与生产无开发快照全部通过，无浏览器或HTTP错误。`production-local.png`已打开检查。

已打开检查最终原生RTX5090/ANGLE D3D11默认/滚轮近景/拖拽反向/隐藏周边主体截图（`architecture-*.png`、`source-hospital-isolated.png`），以及新增`original-hospital-night/day/source/rotated/768/390.png`。源中庭未被包围盒封住，幕墙细节和门厅雨棚可见；昼夜玻璃及暖窗呈现不同，方案关闭恢复原材质，窄屏可操作且无横向溢出。没有声称照片级质量、现场一比一竣工或实测FPS，客户审美认可仍需看实际版本。

已发布运行源码`448b1eb0bbfa835c8de3adf583ba57b2c04a182f`，成功[工作流38561744648](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38561744648)：云端严格4/4、Linux Chromium/SwiftShader **42/42（14.7分钟）**，构建任务15m36s、部署12s。公网HTML实际匹配`index-Cdfx_FNn.js`/`index-CdW2Ckur.css`。

真实公网生产harness **1/1 passed（25.0秒，用例24.3秒）**：三项场景资产和真实天气API200，原创方案/源形体开关使画面改变，实际指针旋转、完整白模/复位、不同楼层/设备/导航与生产无开发快照通过，无浏览器及资源错误。公网默认/完整范围`source-context-online-default/full.png`已打开检查，医院原创细节、原城市/场地和中文方案标识可见。

已归档`openspec/changes/archive/2026-10-14-original-modern-hospital/`，主规格合入原创方案及源视图边界和中文切换控制；归档后严格 **3/3 passed**。后续仅保存README、发布/验收记录、归档和公网截图，运行仍为448b1eb；本任务4188已关闭，4187保留。

## 中英文切换（2026-10-15）

右上角提供中文/English，首次默认中文并在可用时保存偏好。界面、图表画布/提示、场景点位、设备详情、帮助、错误和天气均使用所选语言；保留实际DWG文件名和设备ID、全部示意/未核实/非现场实测说明。时间和天气时刻固定Asia/Shanghai。语言更新已有BuildingScene标签，不重新创建渲染器、重置视角或选择；源主体/周边资产无改动。

本地完整harness **47/47通过（5.3分钟）**。最终英文桌面间距调整后，语言专项再次 **5/5通过（31.3秒）**，严格OpenSpec **4/4**、TypeScript与子路径生产构建通过。最终子路径生产验收 **1/1通过（18.6秒）**：真实旋转、源全景/复位、楼层/设备/导航、真实天气及中英往返、同一canvas和13F选择保持，资源与浏览器错误检查通过。最终构建JS `index-TnlbEs2M.js`、CSS `index-BRkto-PL.css`。

语言专项使用真实语言按钮检查全部导航、完整帮助、13F设备详情ID、回切与重载偏好、天气请求不重复；纽约浏览器时区仍显示20:00北京时间、英文天气失败及WebGL错误；存储拒绝可用；768/390宽度总览和楼层设备无横向溢出。桌面额外检查右侧面板底边不超过875px（1440×900视口）。开发快照只读取相机/就绪状态，未用于操纵业务状态。

已实际检查 `language-en-overview.png`、`language-en-floor-390.png`、`language-en-production.png` 等截图。首轮复合天气中的单字“晴”漏译，显式翻译天气名称后修复；手机顶栏改为两行避免品牌与语言控件拥挤；英文右侧摘要最初到882.6px，收紧间距并通过边界断言。测试通过不代表医院方案已获得甲方美术或实际布局确认。

云端及公网结果待发布后追加；以上仅为已经完成的本地证据。

首次云端运行 `38691757619` 为46/47（18.5分钟），全部5项语言专项通过；原有医院方案D1在第三次楼层返回外景时触发12秒渲染等待超时。下载轨迹确认主体/周边已就绪、相机已回到原姿态，待完成的是外景帧（frames仍为12、assetsReady为false），没有浏览器错误事件。该测试的渲染等待现与主harness既有云端初始化时限对齐为45秒，本地保持12秒；多次往返和截图的云端全测试预算120秒。所有几何、相机、像素、资源和用户控件断言保留。医院方案专项本地再次4/4（34.0秒）通过；本次仅修改harness时限，不改变af7f339的运行代码。
