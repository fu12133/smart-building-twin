## ADDED Requirements

### Requirement: Shenzhen clock and current weather
The dashboard MUST display a ticking Asia/Shanghai clock and Shenzhen weather sourced from a current online weather-model API with temperature, condition, data time and attribution. It MUST refresh automatically and through a user-facing action, identify stale/unavailable data honestly and retain accessible weather/time controls on narrow viewports.

#### Scenario: Online weather and live clock
- **WHEN** current weather data are available
- **THEN** the Shenzhen condition/temperature and provider data time are visible, the clock advances each second in Asia/Shanghai and weather refresh uses the fixed Shenzhen coordinates

#### Scenario: Unavailable weather
- **WHEN** weather requests fail, time out or return invalid/old data
- **THEN** the dashboard clearly shows unavailable/old data with a retry action, never fabricates current readings, and the model and floor controls remain usable
