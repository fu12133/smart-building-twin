# 医院展示照明与玻璃质感

## Why
用户要求只增加灯光效果。当前全局光让源白模场地偏平，医院夜景重点不够突出。
用户随后追加玻璃质感要求，因此需要在保留源形体的前提下完善可验证的物理材质与照明。

## What Changes
- 在源医院范围增加暖色洗墙照明、冷色侧背补光和柔和窗内亮灯，适度辉光强调明暗层次。
- 仅调整照明和发光材质，保留源主体、周边和场地几何/坐标/比例。
- 外景光只作用于3D，楼层维持现有白色剖切照明；静态照明保持空闲停止GPU重绘及资源销毁。
- 中文来源标识说明照明为展示方案；完成验证后更新既有公开网站。
- 按追加要求优化源玻璃为具有视角反射、清漆高光和细微表面起伏的物理材质；保持源网格/纹理坐标及外观方案标识。

## Impact
Affected spec: building-visualization. Affected code: BuildingScene, HospitalAsset, Chinese source copy. No new architecture, institutional name, floor layout or assets.
