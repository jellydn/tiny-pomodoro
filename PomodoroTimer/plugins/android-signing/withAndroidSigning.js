const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Env vars fed by GitHub Actions secrets (ANDROID_KEYSTORE_*). When any is
// missing the plugin is a no-op and the generated project keeps the debug
// keystore for release — preserving the free / no-account manual workflow.
const ENV_KEYS = [
  'ANDROID_KEYSTORE_BASE64',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
];

function isConfigured() {
  return ENV_KEYS.every((k) => process.env[k] && process.env[k].length > 0);
}

// The Expo SDK 54 template signs `release` with the debug keystore. We append a
// `release` signingConfig (driven by gradle.properties) and point the release
// buildType at it. The two replaced blocks are deterministic template text;
// if either fails to match we throw so CI fails loudly instead of shipping a
// debug-signed "release" APK.
function patchReleaseSigning(contents) {
  // 1. Add a `release` signingConfig after the template's debug block.
  // Idempotent: skip if a release signingConfig already exists (re-prebuild).
  const debugBlock = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`;
  const releaseConfigBlock = `${debugBlock}
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }`;

  if (!contents.includes('signingConfigs.release')) {
    if (!contents.includes(debugBlock)) {
      throw new Error('withAndroidSigning: template debug signingConfig block not found');
    }
    contents = contents.replace(debugBlock, releaseConfigBlock);
  }

  // 2. Point the release buildType at the release signingConfig.
  // Idempotent: skip if it already points at signingConfigs.release.
  const releaseDebugSigning = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;
  const releaseProdSigning = `        release {
            signingConfig signingConfigs.release`;

  if (!contents.includes('signingConfig signingConfigs.release')) {
    if (!contents.includes(releaseDebugSigning)) {
      throw new Error('withAndroidSigning: template release signingConfig line not found');
    }
    contents = contents.replace(releaseDebugSigning, releaseProdSigning);
  }

  return contents;
}

function withAndroidSigning(config) {
  if (!isConfigured()) {
    console.log('  Android release signing: no ANDROID_KEYSTORE_* env vars, keeping debug keystore');
    return config;
  }

  // 1. Write the decoded keystore into android/app/release.keystore.
  config = withAppBuildGradle(config, (cfg) => {
    const appDir = path.dirname(cfg.modResults.path);
    fs.writeFileSync(
      path.join(appDir, 'release.keystore'),
      Buffer.from(process.env.ANDROID_KEYSTORE_BASE64, 'base64')
    );
    console.log('  Wrote release keystore to android/app/release.keystore');
    return cfg;
  });

  // 2. Inject signing properties into android/gradle.properties.
  // Idempotent: replace existing RELEASE_* props instead of duplicating them.
  // Guard p.key — re-read files can include comment/blank entries without a key.
  config = withGradleProperties(config, (cfg) => {
    const props = cfg.modResults.filter((p) => !(p.key || '').startsWith('RELEASE_'));
    props.push(
      { type: 'property', key: 'RELEASE_STORE_FILE', value: 'release.keystore' },
      { type: 'property', key: 'RELEASE_STORE_PASSWORD', value: process.env.ANDROID_KEYSTORE_PASSWORD },
      { type: 'property', key: 'RELEASE_KEY_ALIAS', value: process.env.ANDROID_KEY_ALIAS },
      { type: 'property', key: 'RELEASE_KEY_PASSWORD', value: process.env.ANDROID_KEY_PASSWORD }
    );
    cfg.modResults = props;
    return cfg;
  });

  // 3. Patch app/build.gradle to use the release signingConfig.
  config = withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = patchReleaseSigning(cfg.modResults.contents);
    return cfg;
  });

  return config;
}

module.exports = withAndroidSigning;
