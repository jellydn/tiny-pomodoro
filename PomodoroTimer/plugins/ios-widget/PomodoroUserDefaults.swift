import Foundation

// Bridges the app-group UserDefaults suite to JS so the app and the
// WidgetKit extension share one timer-state store.
//
// The Swift widget reads `UserDefaults(suiteName: "group.com.pomodorotimer.shared")`
// under the plain `pomodoro_timer_state_v1` key via `data(forKey:)` and decodes
// the JSON. This module writes the serialized state as Data so that read path
// returns real state instead of the fallback placeholder.
//
// NOTE: after `expo prebuild`, add this file to the app target in Xcode once
// (see ADR-001 for the same manual step for the widget extension target).
@objc(PomodoroUserDefaults)
class PomodoroUserDefaults: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func setItem(_ key: String, value: String) {
    UserDefaults(suiteName: "group.com.pomodorotimer.shared")?.set(value.data(using: .utf8), forKey: key)
  }

  @objc
  func getItem(_ key: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let data = UserDefaults(suiteName: "group.com.pomodorotimer.shared")?.data(forKey: key),
          let value = String(data: data, encoding: .utf8) else {
      resolve(nil)
      return
    }
    resolve(value)
  }
}
