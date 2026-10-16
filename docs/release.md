# GitHub Pages 发布记录

## 2026-10-14 原白模周边与主体形体恢复发布

- 已部署运行源码：`af98732667327683ee3d177c975f660fc58a02e9`。
- 成功工作流：[38527104608](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38527104608)。规格4/4，Linux Chromium/SwiftShader30/30（14.7分钟），构建15m35s、部署14s。
- 本地完整30/30（2.6分钟）、生产子路径1/1（16.7秒）；公网生产最终1/1（37.1秒）。HTML`index-kqpIQF4K.js`/`index-C7vJ3LjE.css`及周边清单实际匹配。

恢复20个源周边/场地网格（64799三角形，约6.24MB），保留与主体同一坐标轴、统一比例和anchor。主体原GLB保持；无依据的程序幕墙、入口/雨棚、场地和景观造型已移除。增加“查看完整白模”，复位回主体；“周边建筑”图层可单独隐藏周边而保留场地，方便核对主体。真实指针、图层、原28个不同楼层、设备/告警、加载失败与晚到资源均验证。

形体指提供的源白模，不称已核准的实景材质、内部或现场一比一尺寸。当前按资料69.5m统一校准，DWG单位头标米但结构205单位的矛盾已说明；严格尺寸基准仍待用户核实，材质和室内也需实际资料。

体验：[源白模主体与周边版](https://guangfubill-crypto.github.io/smart-building-twin/?v=af98732)。公网`source-context-online-default.png`/`source-context-online-full.png`已检查，三项模型/环境资产200，无浏览器错误，生产无开发诊断入口。首次默认5秒主体初始化等待不足，改为单独30秒资产窗口后完整执行通过；交互和错误断言未放宽。后续文档/归档提交不改变已部署的运行代码。

## 2026-10-12 每层独立布局发布

- 已部署源码：`6c57c3a8a2575bcba152ed74fed9365f1941edd5`。
- 成功工作流：[38266496077](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38266496077)。严格规格4/4，Linux Chromium/SwiftShader交互23/23（9.5分钟），构建10m16s、部署19s。
- 本地全量23/23（2.5分钟），仓库子路径生产验收1/1（16.5秒）。公网HTML实际引用`index-Bf34Dric.js` / `index-CyYjBkyV.css`。
- 真实公网生产验收1/1（23.0秒）：四项资源HTTP200，实际拖拽/复位、1F与2F几何差异及1F房间详情、13F保留范围、水系统筛选/点选详情、全部恢复和导航通过；无控制台/HTTP错误，生产无开发诊断入口。

A区1–18/B1/B2和B区1–6/B1/B2共28个独立方案，外围房间数量、跨度、隔墙、门洞按层变化，设备点与详情位置一起更新。各分区结构核心筒上下对齐，切层保留观察视角并清理旧资源。所有内部划分仍为方案示意，实际室内图纸和科室配置尚未提供。

体验：[每层独立布局版](https://guangfubill-crypto.github.io/smart-building-twin/?v=6c57c3a)，切换“2.5D 楼层”后选择楼层。代表楼层与手机/平板截图见`artifacts/harness/layout-*.png`和`interior-390.png`/`interior-768.png`。文末早期发布记录保留历史状态。

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

## 2026-10-14 医院照明、玻璃与深圳天气发布

运行源码`c293106d19da80ec72b0321cd19d2fd086846b3f`已部署：[新版医院模型](https://guangfubill-crypto.github.io/smart-building-twin/?v=c293106)。成功工作流[38549493293](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38549493293)：规格5/5、Linux Chromium/SwiftShader38/38（7.3分钟），构建7m59s、部署9s。实际HTML为`index-wUEeyjtw.js`/`index-CdW2Ckur.css`，主体和原白模周边资产未改写。

本地最终38/38（3.7分钟）；子路径生产1/1（14.1秒）；真实公网最终1/1（17.6秒）。公网真实天气API及HDR/主体/周边HTTP200，当前气温/数据时刻对应UI；真实指针、全景与复位、楼层/设备/导航和生产无诊断入口全部通过。证据及中间故障修正见verification.md；截图已检查。生产脚本硬姿态截图增加1秒呈现等待，单独记录为验收调整，不影响运行源码。

访客右上角可查看/刷新深圳天气，“图层设置→天气效果”可切换昼夜/晴雨联动与静态展示灯光。玻璃物理反射/清漆与暖色洗墙/窗灯是展示方案；几何、比例、原28种楼层/演示数据标识保留。天气来源为Open-Meteo模型，每10分钟更新、失败/过期明示，当前免费服务用于非商业演示，商业服务许可边界见资产来源说明。

两个OpenSpec变更已归档，最终基线严格3/3通过；后续证据/文档/测试截图呈现调整不改变运行代码c293106。

## 2026-10-14 原创现代医院方案发布

[打开原创医院方案](https://guangfubill-crypto.github.io/smart-building-twin/?v=448b1eb)。运行源码`448b1eb0bbfa835c8de3adf583ba57b2c04a182f`，成功[工作流38561744648](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38561744648)：规格4/4、云端42/42（14.7分钟）、构建15m36s/部署12s。公网JS`index-Cdfx_FNn.js`/CSS`index-CdW2Ckur.css`已核对。

本地最终42/42（4.6分钟）、子路径生产1/1（31.9秒）、真实公网生产1/1（25.0秒）通过。方案开关、真实旋转、原白模全景、楼层设备、真实深圳天气及资源/错误检查通过，公网截图已检查。

默认展示珠白层间带/遮阳翼、金属幕墙框、蓝灰玻璃及玻璃门厅的原创外观设计。在“图层设置”关闭“原创医院方案”可回看源形体与既有材质方案，保持相机不变。原主体/周边资产、共有坐标和28种内部示意布局保留；新增构件和材质由项目生成，不是已经核准的医院竣工还原，也没有填写机构名称。

OpenSpec已归档为`2026-10-14-original-modern-hospital`，归档后严格3/3通过。后续文档/证据提交不改变448b1eb运行代码；访客仍使用以上已验证版本。

## 2026-10-15 中英文切换发布

[打开支持中英切换的医院模型](https://guangfubill-crypto.github.io/smart-building-twin/?v=374a409)。部署源码 `374a40989fa44b2433df20c8a075e3c9879aa285`（运行代码与af7f339一致），成功[工作流38694384731](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38694384731)：严格4/4、云端47/47（15.6分钟）、构建16m28s、部署47秒。实际HTML匹配JS `index-TnlbEs2M.js` / CSS `index-BRkto-PL.css`。

本地完整47/47、最终语言专项5/5、医院方案渲染等待复验4/4、子路径生产1/1与真实公网生产1/1（27.2秒）通过。中英文公网截图已检查。首次云端46/47中原有医院方案D1的12秒软件渲染等待超时，已对齐既有CI渲染时限；所有行为/资源断言保留，复验47/47通过，细节见verification.md。

右上角“中文 / English”即时切换并记住选择，覆盖导航、图表、楼层设备、场景标签、天气、帮助和错误提示。切换保持模型/相机、楼层与设备状态，两种语言均显示北京时间。真实DWG文件名、设备编号以及演示/未核实说明保留；源医院与周边几何资产未修改。

OpenSpec已归档为 `2026-10-15-chinese-english-switch`，归档后严格3/3通过。后续文档/公网截图提交不改变374a409运行版本；4187开发预览保留，临时4188生产预览已结束。

## 2026-10-15 可见太阳与日照发布

[打开太阳效果版本](https://guangfubill-crypto.github.io/smart-building-twin/?v=693b148)。运行源码 `693b148a2f77529fcbee045523c97ba8be558e58`，成功[工作流38725968847](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38725968847)：严格4/4、云端51/51（12.6分钟）、构建13m21s、部署30秒。公网JS `index-CyrTDY7W.js` / CSS `index-CIaPz7Nv.css` / Three `three-D759iadV.js` 已核对。

本地最终完整51/51（5.7分钟）、手机间距调整后太阳4/4（31.4秒）、子路径真实生产1/1（21.6秒），以及真实公网生产1/1（33.7秒）通过。公网日照截图已检查；原主体/周边和校准关系未变。首次云端50/51时太阳四项全部通过，旧医院方案压力测试最终截图超过120秒总时限；软件GPU预处理已设边界，测试总预算与同类多阶段用例对齐180秒，所有原断言保留，复验51/51通过。详情见verification.md。

默认跟随深圳时间/天气，晴天有直射太阳、方向光和玻璃高光，阴雨、夜间及天气无效时不显示实时太阳。在场景信息区点“日照预览→观察太阳”（English: Sunlight preview → View the sun）可随时查看太阳圆盘/暖色光晕；“返回实时天气”退出，天气卡片和北京时间不被替换。预览和太阳方向均为明确标识的展示近似，未经真北或日照分析校准；源形体、室内示意和演示数据边界不变。

OpenSpec已归档 `2026-10-15-visible-sunlight`，归档后严格3/3通过。后续文档/公网证据提交不改变693b148运行版本；原医院及周边几何、28种内部示意布局和真实旋转继续保留。

## 2026-10-15 默认太阳与月亮发布

[打开默认日夜版本](https://guangfubill-crypto.github.io/smart-building-twin/?v=9f97d7e)，运行源码 `9f97d7e3dac6e00b95195540f5e98f8868d2820d`。[工作流38738537052](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38738537052)严格4/4、云端53/53（22.3分钟）、构建与部署通过；本地完整53/53（5.2分钟）、实际子路径生产1/1（22.2秒）、真实公网生产1/1（32.8秒）通过。公网HTML匹配JS BOvc00GL / CSS CIaPz7Nv / Three D759iadV；默认公网夜景截图已检查。

打开即按深圳日夜显示太阳和阳光/夜间月亮，初始与复位视角包含天体，不需要点击预览或观察。阴雨降低亮度，真实天气与北京时间保留；天体位置/月相为展示设计，未做天文或真北校准。可选晴天预览仍明确标非实时。原医院/周边几何、楼层和中英切换保留；此默认行为取代上一版本需点日照预览才易看到太阳的体验。

OpenSpec已归档 `2026-10-15-default-sun-moon`，归档后严格3/3通过。最终文档和截图提交不改变9f97d7e运行版本。4187保留，4188已清理。

## 2026-10-16 蓝色参考风格、入口动态与日光发布

[打开更新版本](https://guangfubill-crypto.github.io/smart-building-twin/?v=338e978)，运行源码338e9781da4399d6e5daa9480efb6121d83820be。[工作流38881670261](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38881670261)严格4/4、云端59/59（23.7分钟）、构建和Pages发布通过。完整本地59/59（11.8分钟）及控件跟进3/3（52.5秒）、真实子路径生产1/1（61.3秒总计）、真实公网生产1/1（54.3秒总计）通过。生产用例使用120秒命令行整体预算，所有交互/资源/错误断言保留；此前60秒超时未记作通过。JS CO5ZdhRw / CSS2QvF0lpJ / ThreeCri1c2pP匹配，公网18:03截图已查看。

保留医院白模/周边/场地原形体与共享校准，按参考蓝色界面突出主体和双列数据；增加可关闭的树、人、车及建筑分色、分开的屋面/墙/玻璃/基座材质。入口为一个贴墙竖屏、旁侧凹入通道，竖屏播放示意动画，人流从拟定门口走向原场地。图层“场景动画”可暂停；减少动态效果设置默认暂停，楼层/源视图/隐藏页停止动效。16:30渲染地面亮度高于夜间，同时保留真实深圳天气和北京时间。外观、入口、人流与内部布局仍为未核实方案/示意。

素材候选与许可核对见findings.md。Sam候选已单独下载并在本机Three.js预览，未加入公开应用；其他新候选也未导入。不声称查到了与该项目一致的免费医院精模。

OpenSpec已归档2026-10-16-hospital-visual-emphasis，更新基线后严格3/3通过。最终文档/截图提交不改变已验收的338e978运行版。4187保留；本任务4188在公网验收后清理。
