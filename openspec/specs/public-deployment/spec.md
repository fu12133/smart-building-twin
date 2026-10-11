# public-deployment Specification

## Purpose
Allow the smart-building application to be uploaded to GitHub and shared as a working HTTPS site with repeatable deployment and correct asset paths.

## Requirements

### Requirement: Shareable production site
The application MUST be available at a public HTTPS URL that visitors can use without a local Node.js installation.

#### Scenario: Visitor opens the project site
- **WHEN** a visitor opens the deployed GitHub Pages project URL
- **THEN** the dashboard and Three.js model load, rotation controls work, and 2.5D equipment details are usable

### Requirement: Reproducible deployment
The repository MUST include an automated main-branch workflow that validates specifications, builds locked dependencies and publishes the static artifact.

#### Scenario: Push updated source
- **WHEN** an authorized developer pushes to main
- **THEN** checks and the Pages deployment run, and a failed build does not publish a replacement site

### Requirement: Repository-safe upload
The repository MUST preserve the chosen visibility and exclude credentials, local dependencies, traces and machine-specific harness result reports.

#### Scenario: Inspect the published source
- **WHEN** a reviewer opens the uploaded repository
- **THEN** source, lockfile, OpenSpec documents and tests are present, without local credentials or node_modules
