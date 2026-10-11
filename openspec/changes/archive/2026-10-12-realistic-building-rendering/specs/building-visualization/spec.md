## ADDED Requirements

### Requirement: Detailed architectural rendering
The 3D scene MUST render multi-face glass curtain walls with reflection response, visible mullions and varied illuminated office interiors, together with roof equipment, a warm stone commercial podium and landscaped ground detail. These assets MUST remain genuine rotatable geometry and MUST be identified as a demonstration model.

#### Scenario: Inspect the default architectural view
- **WHEN** the user opens the 3D overview
- **THEN** the rendered view shows differentiated reflective glass, thin facade framing, warm interior lighting, podium terraces, varied tree crowns and paved roads with street furniture

#### Scenario: Inspect another side
- **WHEN** the user rotates and zooms the model with pointer and wheel
- **THEN** newly visible facades retain window and framing detail, reflections respond to view direction, and existing camera reset and selection remain usable

### Requirement: Rendering resource lifecycle
Generated geometry, materials, textures and reflection render targets MUST be disposed when the scene is destroyed; rendering MUST retain responsive floor switching and graphics recovery.

#### Scenario: Reinitialize after graphics failure
- **WHEN** graphics recovery reloads the scene
- **THEN** the detailed model renders again with working controls and no uncaught browser errors
