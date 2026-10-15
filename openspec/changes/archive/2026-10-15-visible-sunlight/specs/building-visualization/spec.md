## ADDED Requirements

### Requirement: Visible sunlight and explicit sunny preview
The exterior MUST show a clear-day solar disc/halo with aligned key light and suppress it for overcast, precipitation and night. The Chinese/English sunny-preview control MUST identify non-live display illumination and approximate direction, preserve real weather/time, source assets, camera and selections, and restore Shenzhen atmosphere when cancelled.

#### Scenario: Clear daylight and adverse weather
- **WHEN** current clear daylight is displayed, or it changes to overcast, rain or night
- **THEN** the sky/light visibly respond with a solar disc and warm direct light for clear daylight and no direct sun for adverse weather/night, while source geometry and camera remain unchanged

#### Scenario: Sunny preview and return to Shenzhen
- **WHEN** the visitor enables sunny preview then cancels it or disables weather effects
- **THEN** the exterior displays clearly marked non-live sunny illumination while the weather card and Beijing clock remain real, cancellation restores current Shenzhen atmosphere and disabling effects restores the existing static display preset

#### Scenario: Floor, language and lifecycle
- **WHEN** a visitor switches language, enters a floor, returns to3D, reloads the graphics scene or leaves it idle
- **THEN** language/floor switches preserve preview and saved pose, full reload restores the default live mode, floor lighting stays unchanged and a single renderer disposes resources and settles when idle

#### Scenario: Explicit sun observation
- **WHEN** a visitor chooses View the sun in sunny preview
- **THEN** the existing camera explicitly orbits towards the solar disc within control bounds, source geometry is unchanged and reset remains usable
