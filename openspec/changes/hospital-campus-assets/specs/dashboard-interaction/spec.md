## ADDED Requirements

### Requirement: Hospital demonstration terminology
The dashboard MUST use Chinese hospital-campus and floor/equipment terminology, bound floors to the selected demonstration building and clearly identify synthetic indicators and floor layouts.

#### Scenario: Select a hospital building and floor device
- **WHEN** the user selects a hospital building, switches floors and locates equipment
- **THEN** the selected building/floor/device remain consistent, floor limits are respected and the interface identifies the data and floor diagram as demonstrations

## MODIFIED Requirements

### Requirement: Honest demo data
The application MUST label synthetic indicators and floor layouts as demonstrations, identify the licensed hospital exterior and illustrative supporting buildings, and MUST NOT claim the user's actual hospital BIM or live IoT/clinical connections.

#### Scenario: Demo source visible
- **WHEN** the dashboard loads
- **THEN** visible source/demo indicators and author attribution identify the illustration and synthetic data
