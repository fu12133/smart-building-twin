## MODIFIED Requirements

### Requirement: Shareable production site
The application MUST be available at a public HTTPS URL that visitors can use without a local Node.js installation. Publication MUST target the user-selected GitHub owner/repository, with verified write access and correct repository-relative assets. Historical deployments MUST remain intact unless the user requests their removal.

#### Scenario: Visitor opens the project site
- **WHEN** a visitor opens the deployed GitHub Pages project URL
- **THEN** the dashboard and Three.js model load, rotation controls work, and 2.5D equipment details are usable

#### Scenario: Publish for a different owner
- **WHEN** the user selects fu12133 as the destination
- **THEN** source and demonstration are published under that owner after verified authorization, the original repository/deployment remains intact, and the new URL passes real production acceptance before success is reported
