# Rendering design

Extract procedural architecture into a scene asset builder. Use deterministic high-resolution facade and paving textures, physically based glass materials and a procedural sky/city reflection environment. Instanced mullions, lit rooms and vegetation retain geometric detail without a separate draw call per element. Add shadowed terrain, setbacks, roof equipment, terraces, entrance canopies, lamps, benches and cars.

Keep BuildingScene responsible for camera, selections, layers and GPU lifecycle. Dispose generated textures and environment render targets alongside mesh resources. Keep selection on the ground ring and label so facade reflectivity is preserved. Limit device pixel ratio and use a single directional shadow light; avoid expensive full-screen postprocessing. Inspect overview, rotated, phone and close-up screenshots, and run the existing behavior harness before updating GitHub Pages.
