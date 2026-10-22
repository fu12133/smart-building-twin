# public-deployment Specification

## Purpose
Allow the smart-building application to be uploaded to GitHub and shared as a working HTTPS site with repeatable deployment and correct asset paths.

## Requirements

### Requirement: Shareable production site
The application MUST be available at a public HTTPS URL that visitors can use without a local Node.js installation. Publication MUST target the user-selected GitHub owner/repository, with verified write access and correct repository-relative assets. Historical deployments MUST remain intact unless the user requests their removal.

#### Scenario: Visitor opens the project site
- **WHEN** a visitor opens the deployed GitHub Pages project URL
- **THEN** the dashboard and Three.js model load, rotation controls work, and 2.5D equipment details are usable

#### Scenario: Publish for a different owner
- **WHEN** the user selects fu12133 as the destination
- **THEN** source and demonstration are published under that owner after verified authorization, the original repository/deployment remains intact, and the new URL passes real production acceptance before success is reported

### Requirement: Reproducible deployment
The repository MUST include an automated main-branch workflow that validates specifications, builds locked dependencies and publishes the static artifact. The complete interaction harness MAY use isolated shards, but every case MUST be covered and all validation jobs MUST pass before the production build/upload/deployment. A failed check or build MUST NOT publish a replacement site.

#### Scenario: Push updated source
- **WHEN** an authorized developer pushes to main
- **THEN** checks and the Pages deployment run, and a failed build does not publish a replacement site

#### Scenario: Isolated complete acceptance
- **WHEN** the workflow distributes the full harness across independent runners
- **THEN** each case belongs to exactly one shard, each runner uses one worker, every shard retains the behavior assertions, and any failure prevents production publication

### Requirement: Repository-safe upload
The repository MUST preserve the chosen visibility and exclude credentials, local dependencies, traces and machine-specific harness result reports.

#### Scenario: Inspect the published source
- **WHEN** a reviewer opens the uploaded repository
- **THEN** source, lockfile, OpenSpec documents and tests are present, without local credentials or node_modules
