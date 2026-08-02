import Foundation
import WidgetKit

// Native counterpart to the `WidgetCenter` module declared in
// utils/widgetReload.ts. Without this, reloadWidgetTimelines() was dead code —
// the TS side guarded on `NativeModules.WidgetCenter` which never existed, so
// the iOS widget fell back to its own 60-entry timeline and could go stale on
// pause/reset. This module makes the seam real: reloadAllTimelines() asks
// WidgetKit to recompute every widget's timeline from shared state.
//
// NOTE: after `expo prebuild`, add this file to the app target in Xcode once
// (see ADR-001 for the same manual step for the widget extension target).
@objc(WidgetCenter)
class WidgetCenterModule: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func reloadAllTimelines() {
    DispatchQueue.main.async {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
