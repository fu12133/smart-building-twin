# Publish under fu12133

## Why
The user requests the existing hospital twin and its demonstration page under GitHub account fu12133. Current source/deployment belongs to guangfubill-crypto. The saved fu12133 credential is invalid, so authenticated owner verification is required before repository creation or upload.

## What Changes
- Publish the existing source to public fu12133/smart-building-twin, reusing a suitable existing repository if present after authentication.
- Enable GitHub Pages using the existing validation/build/deployment workflow and repository-relative asset paths.
- Pin the workflow to the previously validated ubuntu-24.04 image rather than a floating operating-system label; retain every acceptance gate.
- Run the complete harness across three isolated validation shards with one worker each; publish only after every shard passes. Inspect the slow-run failures and adjust only their bounded CI timing while retaining functional assertions.
- Update the primary source/demo links only after the destination is confirmed. Preserve original attribution, historical evidence and the old deployment.
- Verify specs/build/harness and the actual new public URL before recording success. No hospital geometry or runtime behavior changes are intended.
