## MODIFIED Requirements

### Requirement: Visible sunlight and explicit sunny preview
The exterior MUST default to a visible sun and warm sunlight in Shenzhen daytime and a moon with cool fill at night, without preview actions. Weather MUST attenuate these illustrative effects while real readings, source geometry and user state remain intact. Initial/reset framing MUST include the active body on desktop and narrow screens. Optional sunny preview MUST be bilingual, explicitly non-live and reversible.

#### Scenario: Clear daylight and adverse weather
- **WHEN** the page opens in daylight or weather changes to clouds, rain or night
- **THEN** default daylight shows a sun with weather-attenuated glow and light, night shows a moon instead, actual readings remain honest, and weather updates preserve camera and source geometry

#### Scenario: Sunny preview and return to Shenzhen
- **WHEN** the visitor enables sunny preview then cancels it or disables weather effects
- **THEN** preview is clearly non-live while actual time/weather remain real, cancellation restores the default Shenzhen day sun/night moon, and disabling effects restores the static preset without celestial bodies

#### Scenario: Floor, language and lifecycle
- **WHEN** a visitor switches language, enters a floor, returns to 3D, reloads or leaves it idle
- **THEN** language/floor switches preserve pose and preview state, full reload defaults to automatic sun/moon, floor lighting stays unchanged and one renderer disposes resources and settles without active precipitation

#### Scenario: Explicit sun observation
- **WHEN** a visitor optionally chooses View the sun in sunny preview
- **THEN** the camera orbits within control bounds, source geometry remains unchanged and reset restores the default framing with the celestial body visible

#### Scenario: Default celestial framing
- **WHEN** a visitor opens the exterior in day or night at desktop, 768 or 390 pixels wide
- **THEN** the active sun or moon is painted in the Three.js sky in the default view without clicking preview or observation, and bilingual controls/notices remain accessible
