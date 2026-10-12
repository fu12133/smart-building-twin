# Scene asset credits

These assets are packaged locally. The browser never calls an asset API or remote image server. The current building comes from the user's project white model; hospital finishes, forecourt, surroundings and floor diagrams remain proposed illustrations.

## Project white model (current)

`project-hospital.glb` is derived locally from the user-provided `项目白模.dwg`, SHA-256 `bdab765f1b3c4a486557809395292e1295641687490bcb85f8bc509a6055e564`. LibreDWG 0.14 decoded 42 mesh entities. The connected tower/podium mesh **handle 584** is retained, including its architectural details; separate overlapping curtain-wall copies (564/568/569), displaced study geometry and broad city meshes are excluded. The original DWG and decoded JSON are not packaged or uploaded.

Run `scripts/convert-white-model.py` with the local decoded JSON and original DWG to reproduce the **271,584-byte / 2,783-triangle** GLB. `project-model.json` records the source hash, output hash, handles, source unit header, uniform scale and actual converted bounds. CAD Z becomes WebGL Y; uniform scale **69.5/205** calibrates the structural tower. Roof equipment extends to about **73.91 m**; footprint is about **72.59×52.29 m**, which differs from the supplied **70×38 m** summary. The source shape is retained without anisotropic stretching. Podium height in the UI is explicitly the supplied project-summary value, not a verified model measurement. The 18+2 floor counts come from the summary, not a verified source floor partition.

Hospital glazing, mullions, stone finishes, general medical entrance canopy, green medical symbol and forecourt are design proposals. No institution name or confirmed departmental allocation is invented. A/B identify connected tower/podium zones within one building. Underground choices do not assert imported basement geometry. Operational data and all electronic floor maps are synthetic; no real BIM/IoT/clinical connection is claimed.

## Hospital exterior (previous edition, no longer rendered)

Previously packaged `hospital.glb` (retired from the current payload): **Hospital model** by **Er.B.Nijithkumar**, https://sketchfab.com/3d-models/hospital-model-0012226ea07d4161b4d2c133a9b11448 . License: **Creative Commons Attribution 4.0**, https://creativecommons.org/licenses/by/4.0/ . Official authenticated GLB 2K download retrieved 2026-10-12; 4,873,260 bytes; SHA-256 `dfd931413e481dea327d57bfcda54ee709f753178d533619384373bbd0729ead`.

The previous packaged source included embedded author/license metadata. Previous runtime modifications hide its original ground/road and foreign institution text, uniformly normalize the illustration, adapt glass roughness/reflections and add Chinese signs. Original animation is not played. No claim is made that it is the user's actual hospital BIM. Floor layouts and indicators are synthetic; the surrounding inpatient/medical-tech buildings are illustrative additions. Source attribution is visible in the dashboard footer.

| Local file | Source asset | Original download | License |
| --- | --- | --- | --- |
| leaves-color.jpg | [Poly Haven tree_small_02](https://polyhaven.com/a/tree_small_02), 1K leaf diffuse atlas | https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/tree_small_02/tree_small_02_leaves_diff_1k.jpg | CC0 |
| leaves-alpha.png | Same asset, 1K leaf alpha atlas | https://dl.polyhaven.org/file/ph-assets/Models/png/1k/tree_small_02/tree_small_02_leaves_alpha_1k.png | CC0 |
| night-city.hdr | [Poly Haven dresden_station_night](https://polyhaven.com/a/dresden_station_night), 1K HDR | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dresden_station_night_1k.hdr | CC0 |

Poly Haven license reference: https://docs.polyhaven.com/en/faq . Files retrieved 2026-10-12 from the asset download links provided by the official API. No high-poly tree model is included. Leaf atlas UVs select its leafy region and exclude the solid stem strip. All paths use the configured Vite base, including GitHub Pages repository URLs.
