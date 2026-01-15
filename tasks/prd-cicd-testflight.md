# PRD: CI/CD Pipeline for App Distribution

## Introduction

Set up CI/CD pipeline using GitHub Actions and EAS Build to distribute PomodoroTimer app. Uses a free-first approach: Android APK with QR code for sharing, local Xcode builds for iOS testing. TestFlight support ready for when Apple Developer account is added.

## Goals

- Build Android APK automatically on git tag push (e.g., `v1.0.0`)
- Generate QR code link for easy APK download and sharing
- Support manual workflow dispatch for on-demand builds
- Document local iOS build process (free, no Apple Developer account needed)
- Structure ready for TestFlight when Apple Developer account is added later

## User Stories

### US-001: Local iOS Build Setup (Free) ✅
**Description:** As a developer, I want to test on my iPhone without paying for Apple Developer.

**Acceptance Criteria:**
- [x] Document `npx expo prebuild` command to generate ios folder
- [x] Document opening `ios/PomodoroTimer.xcworkspace` in Xcode
- [x] Document signing with free Apple ID (Personal Team)
- [x] Document running on connected iPhone via USB
- [x] Add instructions to README or AGENTS.md

### US-002: Configure EAS for Android Builds (Partial)
**Description:** As a developer, I need EAS configured to build Android APKs.

**Acceptance Criteria:**
- [ ] Run `eas login` and authenticate
- [x] Run `eas build:configure` to create eas.json
- [x] Configure `preview` profile for APK builds (not AAB)
- [ ] Test locally: `eas build --platform android --profile preview`
- [ ] Verify APK downloads and installs on Android device

### US-003: Create GitHub Actions Workflow for Android ✅
**Description:** As a developer, I want automated Android APK builds triggered by git tags.

**Acceptance Criteria:**
- [x] Create `.github/workflows/build-android.yml`
- [x] Trigger on push of tags matching `v*.*.*` pattern
- [x] Support manual workflow_dispatch with version input
- [x] Extract version from git tag and set in app config
- [x] Run `eas build --platform android --profile preview --non-interactive`
- [x] Upload APK as GitHub Release artifact
- [ ] Store EXPO_TOKEN as GitHub secret

### US-004: Add EAS Configuration File ✅
**Description:** As a developer, I need eas.json with proper build profiles.

**Acceptance Criteria:**
- [x] Create `eas.json` in PomodoroTimer directory
- [x] Configure `preview` profile for Android APK (not AAB)
- [x] Configure `production` profile for future iOS/Play Store
- [ ] Set `autoIncrement` for versionCode

### US-005: Create QR Code for APK Download ✅
**Description:** As a user, I want a QR code to easily download and share the APK.

**Acceptance Criteria:**
- [x] GitHub Release page has APK attached (via workflow)
- [x] README includes QR code linking to latest release
- [ ] Update QR code URL with actual repo URL

### US-006: Document Release Process ✅
**Description:** As a developer, I want clear instructions for releasing new versions.

**Acceptance Criteria:**
- [x] Add release instructions to README or AGENTS.md
- [x] Document: `git tag v1.0.0 && git push origin v1.0.0`
- [x] Document manual trigger via GitHub Actions UI
- [x] Document local iOS build steps for iPhone testing

## Functional Requirements

- FR-1: GitHub Actions workflow triggers on tags matching `v*.*.*`
- FR-2: GitHub Actions workflow supports manual dispatch with optional version override
- FR-3: Workflow extracts version from tag and updates app version
- FR-4: Workflow authenticates with EAS using EXPO_TOKEN secret
- FR-5: Workflow runs EAS build for Android APK
- FR-6: Workflow uploads APK to GitHub Releases
- FR-7: Version code auto-increments on each build

## Non-Goals

- iOS TestFlight (requires paid Apple Developer account - can add later)
- Play Store deployment (can be added later)
- Multiple environment builds (staging/production)
- Automated testing in CI pipeline (can be added later)

## Technical Considerations

- EAS Build free tier: 30 builds/month
- APK format used for easy sideloading (not AAB which requires Play Store)
- EXPO_TOKEN GitHub secret needed for EAS authentication
- Version extracted from git tag using `${GITHUB_REF#refs/tags/v}`
- Local iOS builds use free Apple ID with 7-day certificate

## Success Metrics

- Push `v1.0.0` tag → APK available on GitHub Releases within ~15 minutes
- QR code works for easy APK download on Android
- Local iOS build runs on iPhone via Xcode

## Future Enhancements (When Apple Developer Account Added)

- [ ] Add iOS build to workflow
- [ ] Add TestFlight submission
- [ ] Add App Store Connect API credentials

## Setup Checklist

1. [ ] Run `eas login`
2. [x] Create eas.json with preview profile
3. [ ] Add EXPO_TOKEN to GitHub secrets
4. [ ] Push a test tag to trigger first build
5. [ ] Update QR code URL in README with actual repo URL
