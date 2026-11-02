// Create one Apple Reminder through EventKit without opening the Reminders app.
//
// Usage:
//   swift add-reminder.swift --title "Short title" --notes-file notes.md \
//     [--list InterimAid] [--due 2026-11-05 | --due "2026-11-05 14:00"] [--priority high|medium|low]
//
// Prints one JSON line: {"ok":true,"id":...,"list":...,"title":...,"due":...}
import EventKit
import Foundation

func fail(_ message: String) -> Never {
    let data = try! JSONSerialization.data(withJSONObject: ["ok": false, "error": message])
    print(String(data: data, encoding: .utf8)!)
    exit(1)
}

var args: [String: String] = [:]
var it = CommandLine.arguments.dropFirst().makeIterator()
while let key = it.next() {
    guard key.hasPrefix("--"), let value = it.next() else { fail("bad argument: \(key)") }
    args[String(key.dropFirst(2))] = value
}

guard let title = args["title"], !title.trimmingCharacters(in: .whitespaces).isEmpty else { fail("--title is required") }
guard let notesPath = args["notes-file"] else { fail("--notes-file is required") }
guard let notes = try? String(contentsOfFile: notesPath, encoding: .utf8) else { fail("cannot read notes file: \(notesPath)") }
let listName = args["list"] ?? "InterimAid"

let store = EKEventStore()
let sem = DispatchSemaphore(value: 0)
var granted = false
store.requestFullAccessToReminders { ok, _ in granted = ok; sem.signal() }
sem.wait()
guard granted else { fail("Reminders access denied; allow it in System Settings > Privacy & Security > Reminders") }

guard let calendar = store.calendars(for: .reminder).first(where: { $0.title == listName }) else {
    fail("Reminders list not found: \(listName)")
}

let reminder = EKReminder(eventStore: store)
reminder.calendar = calendar
reminder.title = title
reminder.notes = notes

if let due = args["due"] {
    let parts = due.split(separator: " ")
    let ymd = parts[0].split(separator: "-").compactMap { Int($0) }
    guard ymd.count == 3 else { fail("--due must be YYYY-MM-DD or \"YYYY-MM-DD HH:MM\"") }
    var comps = DateComponents(calendar: Calendar.current, year: ymd[0], month: ymd[1], day: ymd[2])
    if parts.count > 1 {
        let hm = parts[1].split(separator: ":").compactMap { Int($0) }
        guard hm.count == 2 else { fail("--due time must be HH:MM") }
        comps.hour = hm[0]
        comps.minute = hm[1]
        // A timed due date also gets an alarm so the reminder actually notifies.
        if let date = comps.date { reminder.addAlarm(EKAlarm(absoluteDate: date)) }
    }
    reminder.dueDateComponents = comps
}

switch args["priority"] {
case "high": reminder.priority = 1
case "medium": reminder.priority = 5
case "low": reminder.priority = 9
case nil: break
default: fail("--priority must be high, medium or low")
}

do {
    try store.save(reminder, commit: true)
} catch {
    fail("save failed: \(error.localizedDescription)")
}

var out: [String: Any] = ["ok": true, "id": reminder.calendarItemIdentifier, "list": listName, "title": title]
if let due = args["due"] { out["due"] = due }
let data = try! JSONSerialization.data(withJSONObject: out)
print(String(data: data, encoding: .utf8)!)
