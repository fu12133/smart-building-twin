# Scene asset credits

These assets are packaged locally. The browser never calls an asset API or remote image server. Current hospital, surrounding buildings and site geometry come from the user's project white model; material finishes and floor diagrams remain unverified proposals.

The scene now includes proposed static lighting and physically based coated glazing on unchanged source geometry. Shenzhen weather is a separate online data request, not a model/texture asset download. Current weather-model data and solar times are attributed to [Open-Meteo](https://open-meteo.com/en/docs), data CC BY 4.0; the free API is for the current non-commercial demonstration ([service terms](https://open-meteo.com/en/terms)). Commercial deployment requires an appropriately licensed weather service/plan. No secret/API key is embedded. UI includes source and data time; model weather is not an onsite sensor measurement.

## Project white model (current)

`project-hospital.glb` is derived locally from the user-provided `项目白模.dwg`, SHA-256 `bdab765f1b3c4a486557809395292e1295641687490bcb85f8bc509a6055e564`. LibreDWG 0.14 decoded 42 mesh entities. The connected tower/podium mesh **handle 584** is retained, including its architectural details; separate overlapping curtain-wall copies (564/568/569) and displaced study geometry are excluded. Original surroundings/site are restored separately in `project-context.glb`. The original DWG and decoded JSON are not packaged or uploaded.

Run `scripts/convert-white-model.py` with the local decoded JSON and original DWG to reproduce the **271,584-byte / 2,783-triangle** GLB. `project-model.json` records the source hash, output hash, handles, source unit header, uniform scale and actual converted bounds. CAD Z becomes WebGL Y; uniform scale **69.5/205** calibrates the structural tower. Roof equipment extends to about **73.91 m**; footprint is about **72.59×52.29 m**, which differs from the supplied **70×38 m** summary. The source shape is retained without anisotropic stretching. Podium height in the UI is explicitly the supplied project-summary value, not a verified model measurement. The 18+2 floor counts come from the summary, not a verified source floor partition.

The source view removes unsupported procedural facade/entrance shapes. The user-authorized optional original hospital proposal adds separately identified architectural details as described below; it never replaces source ground, city blocks or landscaping. Hospital glazing/stone and surrounding/site finishes remain proposals, not verified actual materials. No institution name or confirmed departmental allocation is invented. A/B identify connected tower/podium zones within one building. Underground choices do not assert imported basement geometry. Operational data and all electronic floor maps are synthetic; no real BIM/IoT/clinical connection is claimed.

## Original surroundings and site (restored 2026-10-14)

`project-context.glb` restores20 source handles:249–260,263,392–395,562,575,580. Mesh263 contains2133 urban components;575 contains32 nearby components. Other retained meshes supply original broad/local site geometry. All use the same uniform scale, axis transform and hospital-derived anchor; the context is not independently normalized or recentered. `project-context.json` records input/output hashes, per-handle roles/bounds/counts and retained primary hash.

Conversion uses Python's standard library plus the locked Three.js Earcut implementation for two complex source faces. A touching courtyard ring and one self-crossing planar boundary are triangulated without fan-filling holes; the latter is split exactly at the source edges' intersection and each lobe's area is checked. Only four truly zero-area source faces are skipped. Geometry is64799 triangles, with all source boundary coordinates retained or exactly interpolated at that intersection. Run `scripts/convert-white-context.py decoded.json original.dwg` after`npm ci` to reproduce it.

The DWG unit header marks meters but its structural tower spans205 coordinate units, whereas the project summary gives69.5m. The current shared calibration follows the project summary; source shape/proportion fidelity is not a verified1:1 physical-size or as-built-material claim. The dashboard help explains this discrepancy.

## Hospital exterior (previous edition, no longer rendered)

Previously packaged `hospital.glb` (retired from the current payload): **Hospital model** by **Er.B.Nijithkumar**, https://sketchfab.com/3d-models/hospital-model-0012226ea07d4161b4d2c133a9b11448 . License: **Creative Commons Attribution 4.0**, https://creativecommons.org/licenses/by/4.0/ . Official authenticated GLB 2K download retrieved 2026-10-12; 4,873,260 bytes; SHA-256 `dfd931413e481dea327d57bfcda54ee709f753178d533619384373bbd0729ead`.

The previous packaged source included embedded author/license metadata. Previous runtime modifications hide its original ground/road and foreign institution text, uniformly normalize the illustration, adapt glass roughness/reflections and add Chinese signs. Original animation is not played. No claim is made that it is the user's actual hospital BIM. Floor layouts and indicators are synthetic; the surrounding inpatient/medical-tech buildings are illustrative additions. Source attribution is visible in the dashboard footer.

| Local file | Source asset | Original download | License |
| --- | --- | --- | --- |
| leaves-color.jpg | [Poly Haven tree_small_02](https://polyhaven.com/a/tree_small_02), 1K leaf diffuse atlas | https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/tree_small_02/tree_small_02_leaves_diff_1k.jpg | CC0 |
| leaves-alpha.png | Same asset, 1K leaf alpha atlas | https://dl.polyhaven.org/file/ph-assets/Models/png/1k/tree_small_02/tree_small_02_leaves_alpha_1k.png | CC0 |
| night-city.hdr | [Poly Haven dresden_station_night](https://polyhaven.com/a/dresden_station_night), 1K HDR | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dresden_station_night_1k.hdr | CC0 |

Poly Haven license reference: https://docs.polyhaven.com/en/faq . Files retrieved 2026-10-12 from the asset download links provided by the official API. No high-poly tree model is included. The leaf atlases are retained as historical asset credits but are no longer loaded/rendered after restoring source site geometry. The HDR remains lighting only. All runtime asset paths use the configured Vite base, including GitHub Pages repository URLs.

## 原创医院方案（2026-10-14）

`src/hospitalDesign.ts`根据用户提供白模立面生成可关闭的原创幕墙框、遮阳翼、层间带、静态灯带和门厅雨棚。窗内层次、玻璃粗糙度和珠白面板纹理均由本项目生成，不使用图库付费模型、商家渲染图或第三方医院资产。新增构件是用户授权的外观设计，不是竣工或实测几何；原始主体/周边GLB及共享校准保持不变。图层设置关闭“原创医院方案”可回看既有源形体与材质方案；内部布局仍为未核实示意。
