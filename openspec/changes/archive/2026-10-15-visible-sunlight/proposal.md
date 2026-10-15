# 可见太阳与医院日照展示

## Why
用户反馈现有深圳天气场景没有太阳效果。现状只有固定位置的低分辨率天空光斑，俯视画面难以观察，也没有与可见光源对齐的日照方向。需要可识别的太阳、暖色光晕与立面受光，并允许阴雨/夜间查看明确标识的晴天方案。

## What Changes
- 天空太阳圆盘与柔和光晕随日照阶段变化，晴/少云可见，阴雨/夜间不显示直射太阳。
- 太阳展示方向与既有主方向光一致，保留建筑和源周边、既有玻璃材质与相机操作。
- 图层增加“晴天日照预览”选项及总览快捷入口；预览不是实时天气，不修改真实天气卡片或北京时间。取消预览恢复深圳联动。
- 中英文、楼层隔离、空闲停止渲染、完整白模及图形重载/销毁保持一致。

## Impact
Specs: building-visualization. SceneAtmosphere, BuildingScene illumination, scene controls/localization and acceptance harness. Solar path is a display approximation based on daylight phase, not surveyed true north or a certified solar/shadow study.
