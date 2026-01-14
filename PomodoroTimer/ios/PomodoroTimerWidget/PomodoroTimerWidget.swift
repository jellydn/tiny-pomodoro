import WidgetKit
import SwiftUI

struct TimerEntry: TimelineEntry {
    let date: Date
    let remainingSeconds: Int
    let durationSeconds: Int
    let isRunning: Bool
    let isCompleted: Bool

    var progress: Double {
        guard durationSeconds > 0 else { return 1 }
        return Double(remainingSeconds) / Double(durationSeconds)
    }

    var formattedTime: String {
        let minutes = remainingSeconds / 60
        let seconds = remainingSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

struct PersistedTimerState: Codable {
    let duration: Int
    let remaining: Int
    let isRunning: Bool
    let isPaused: Bool
    let isCompleted: Bool
    let endTimestamp: Double?
    let updatedAt: Double
}

struct PomodoroWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> TimerEntry {
        TimerEntry(
            date: Date(),
            remainingSeconds: 1500,
            durationSeconds: 1500,
            isRunning: false,
            isCompleted: false
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (TimerEntry) -> Void) {
        let entry = loadTimerEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TimerEntry>) -> Void) {
        var entries: [TimerEntry] = []
        let currentEntry = loadTimerEntry()

        if currentEntry.isRunning && !currentEntry.isCompleted {
            let now = Date()

            for i in 0..<60 {
                let entryDate = Calendar.current.date(byAdding: .second, value: i, to: now)!
                var remaining = currentEntry.remainingSeconds - i
                var isCompleted = false

                if remaining <= 0 {
                    remaining = 0
                    isCompleted = true
                }

                let entry = TimerEntry(
                    date: entryDate,
                    remainingSeconds: remaining,
                    durationSeconds: currentEntry.durationSeconds,
                    isRunning: !isCompleted,
                    isCompleted: isCompleted
                )
                entries.append(entry)

                if isCompleted {
                    break
                }
            }

            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
        } else {
            let timeline = Timeline(entries: [currentEntry], policy: .atEnd)
            completion(timeline)
        }
    }

    private func loadTimerEntry() -> TimerEntry {
        let userDefaults = UserDefaults(suiteName: "group.com.pomodorotimer.shared")
        guard let data = userDefaults?.data(forKey: "pomodoro_timer_state_v1"),
              let state = try? JSONDecoder().decode(PersistedTimerState.self, from: data) else {
            return TimerEntry(
                date: Date(),
                remainingSeconds: 1500,
                durationSeconds: 1500,
                isRunning: false,
                isCompleted: false
            )
        }

        var remaining: Int
        var isRunning = state.isRunning
        var isCompleted = state.isCompleted

        if state.isRunning, let endTimestamp = state.endTimestamp {
            let now = Date().timeIntervalSince1970 * 1000
            remaining = max(0, Int(ceil((endTimestamp - now) / 1000)))

            if remaining <= 0 {
                remaining = 0
                isRunning = false
                isCompleted = true
            }
        } else {
            remaining = state.remaining
        }

        return TimerEntry(
            date: Date(),
            remainingSeconds: remaining,
            durationSeconds: state.duration,
            isRunning: isRunning,
            isCompleted: isCompleted
        )
    }
}

struct PomodoroWidgetEntryView: View {
    var entry: PomodoroWidgetProvider.Entry

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 6)
                    .frame(width: 60, height: 60)

                Circle()
                    .trim(from: 0, to: entry.progress)
                    .stroke(
                        entry.isRunning ? Color.blue : Color.gray,
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: entry.progress)

                Text(entry.formattedTime)
                    .font(.system(size: 14, weight: .bold, design: .monospaced))
                    .foregroundColor(.primary)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(entry.formattedTime)
                    .font(.system(size: 24, weight: .bold, design: .monospaced))
                    .foregroundColor(.primary)

                Text(entry.isRunning ? "Pause" : "Resume")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(entry.isRunning ? Color.orange : Color.green)
                    .cornerRadius(12)
            }
        }
        .padding(12)
        .redacted(reason: .placeholder)
    }
}

@main
struct PomodoroTimerWidget: Widget {
    let kind: String = "PomodoroTimerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PomodoroWidgetProvider()) { entry in
            PomodoroWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Pomodoro Timer")
        .description("View and control your Pomodoro timer from the lock screen.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
